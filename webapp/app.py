#!/usr/bin/env python3
"""SheLedTheWay review board.

A small web app that shows every story's progress through the six pipeline
stages, lets the owner review scripts and videos, and edit the agent prompts.
It reads and writes the git repo it lives in; git is the only database.

Standard library only. Run:  python3 webapp/app.py
Settings come from the environment (see webapp/DEPLOY.md):
  SLTW_PASSWORD  login password (required)
  SLTW_SECRET    random string used to sign the session cookie (required)
  SLTW_PORT      port on 127.0.0.1 (default 8787)
  SLTW_GIT_SYNC  "0" turns off git pull/commit/push (for local testing)
"""
import csv, hashlib, hmac, html, io, mimetypes, os, re, subprocess, sys, threading, time
from datetime import datetime, timedelta, timezone
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, urlparse

REPO = Path(__file__).resolve().parent.parent
PASSWORD = os.environ.get("SLTW_PASSWORD", "")
SECRET = os.environ.get("SLTW_SECRET", "").encode()
PORT = int(os.environ.get("SLTW_PORT", "8787"))
GIT_SYNC = os.environ.get("SLTW_GIT_SYNC", "1") != "0"
IST = timezone(timedelta(hours=5, minutes=30))
SESSION_DAYS = 14
GIT_LOCK = threading.Lock()
SYNC = {"at": None, "ok": True, "msg": "not yet synced"}

STAGES = ["Research", "Draft", "Video", "Voice", "Review", "Publish"]
QUEUE_FIELDS = ["date", "time_ist", "format", "media", "pack", "voice", "status"]
REVIEW_FIELDS = ["date", "stage", "decision", "note", "at_ist"]
MEDIA_DIRS = ("reels", "carousels")


# ---------- git ----------
def git(*args, check=False):
    p = subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True, timeout=120)
    if check and p.returncode != 0:
        raise RuntimeError((p.stderr or p.stdout).strip()[-400:])
    return p.stdout.strip()


def pull():
    if not GIT_SYNC:
        return
    with GIT_LOCK:
        try:
            git("pull", "--rebase", "--autostash", check=True)
            SYNC.update(at=now(), ok=True, msg="in sync with GitHub")
        except Exception as e:  # keep serving the last good copy
            SYNC.update(at=now(), ok=False, msg=f"git pull failed: {e}")


def commit_push(message, paths):
    """Commit the given paths and push. Returns a message for the owner."""
    if not GIT_SYNC:
        return "Saved (git sync is off)."
    with GIT_LOCK:
        try:
            git("add", "--", *paths, check=True)
            if not git("status", "--porcelain", "--", *paths):
                return "Nothing changed."
            git("commit", "-m", message, "--", *paths, check=True)
            git("pull", "--rebase", "--autostash", check=True)
            git("push", check=True)
            SYNC.update(at=now(), ok=True, msg="in sync with GitHub")
            return "Saved and pushed."
        except Exception as e:
            SYNC.update(at=now(), ok=False, msg=f"git failed: {e}")
            return f"Saved on the server, but git failed: {e}"


def sync_loop():
    while True:
        pull()
        time.sleep(120)


# ---------- data ----------
def now():
    return datetime.now(IST)


def read_csv(rel, fields=None):
    p = REPO / rel
    if not p.exists():
        return []
    with p.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if fields:
        rows = [{k: (r.get(k) or "") for k in fields} for r in rows]
    return rows


def write_csv(rel, fields, rows):
    p = REPO / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=fields, lineterminator="\n", extrasaction="ignore")
    w.writeheader()
    w.writerows(rows)
    tmp = p.with_suffix(".tmp")
    tmp.write_text(buf.getvalue(), encoding="utf-8")
    tmp.replace(p)


def pack_for(date):
    hits = sorted((REPO / "packs").glob(f"{date}-*.md"))
    return hits[0] if hits else None


def media_for(date, queue_row):
    """Return (kind, [relative paths]) for a story's rendered media."""
    if queue_row and queue_row["media"]:
        p = REPO / queue_row["media"]
        if p.is_file():
            return "video", [queue_row["media"]]
    for v in sorted((REPO / "reels").glob(f"{date}-*.mp4")):
        return "video", [str(v.relative_to(REPO))]
    for d in sorted((REPO / "carousels").glob(f"{date}-*")):
        imgs = sorted(x for x in d.iterdir() if x.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"))
        if imgs:
            return "images", [str(x.relative_to(REPO)) for x in imgs]
    return None, []


def latest_review(reviews, date, stage):
    hits = [r for r in reviews if r["date"] == date and r["stage"] == stage]
    return hits[-1] if hits else None


def stories():
    cal = read_csv("calendar/calendar.csv")
    queue = {r["date"]: r for r in read_csv("publish/queue.csv", QUEUE_FIELDS)}
    log = {r["date"]: r for r in read_csv("publish/log.csv")}
    reviews = read_csv("review/reviews.csv", REVIEW_FIELDS)
    out = []
    for row in cal:
        d = row.get("date", "")
        pack = pack_for(d)
        text = pack.read_text(encoding="utf-8") if pack else ""
        q = queue.get(d)
        kind, media = media_for(d, q)
        script = latest_review(reviews, d, "script")
        video = latest_review(reviews, d, "video")
        fmt = row.get("format", "")
        needs_voice = fmt == "Reel"
        st = {}
        st["Research"] = ("done", "sources listed") if re.search(r"https?://", text) else (
            ("todo", "no sources yet") if pack else ("todo", "not started"))
        if not pack:
            st["Draft"] = ("todo", "not written")
        elif script and script["decision"] == "Approved":
            st["Draft"] = ("done", "script approved")
        elif script and script["decision"] == "Changes requested":
            st["Draft"] = ("back", "changes requested")
        else:
            st["Draft"] = ("wait", "needs your review")
        st["Video"] = ("done", "rendered") if media else ("todo", "not rendered")
        if not needs_voice:
            st["Voice"] = ("na", "not needed")
        elif q and q["voice"].lower() == "yes":
            st["Voice"] = ("done", "voice added")
        else:
            st["Voice"] = ("todo", "no voice yet")
        qs = q["status"] if q else ""
        if qs in ("Approved", "Published"):
            st["Review"] = ("done", "approved")
        elif qs == "Rejected":
            st["Review"] = ("back", "rejected")
        elif qs == "Changes requested":
            st["Review"] = ("back", "changes requested")
        elif qs.startswith(("Held", "Failed")):
            st["Review"] = ("back", qs)
        elif qs == "Publishing":
            st["Review"] = ("done", "approved")
        elif media:
            st["Review"] = ("wait", "needs your review")
        else:
            st["Review"] = ("todo", "nothing to review")
        if d in log or qs == "Published":
            st["Publish"] = ("done", "published")
        elif qs == "Approved":
            st["Publish"] = ("wait", f"scheduled {q['time_ist']} IST")
        elif qs == "Publishing":
            st["Publish"] = ("back", "interrupted; check Instagram")
        else:
            st["Publish"] = ("todo", "not approved")
        seo = "ready" if re.search(r"^Primary keyword:\s*\S", text, re.M) or re.search(r"^- `?Primary keyword:?`?\s*\S", text, re.M) else ("pending" if pack else "-")
        out.append(dict(row=row, date=d, pack=pack, text=text, queue=q, kind=kind, media=media, seo=seo,
                        stages=st, script=script, video=video, log=log.get(d)))
    return out


# ---------- rendering ----------
E = html.escape
CSS = """
:root{--plum:#3B1C4A;--gold:#C9A24B;--ivory:#F7F1E8;--rose:#B5544B;--ink:#1E1A22;--line:#e3d9c8}
*{box-sizing:border-box}body{margin:0;background:var(--ivory);color:var(--ink);font:16px/1.5 Inter,system-ui,sans-serif}
header{background:var(--plum);color:var(--ivory);padding:14px 20px;display:flex;gap:18px;align-items:center;flex-wrap:wrap}
header b{font-family:'Playfair Display',Georgia,serif;font-size:20px;color:var(--gold)}
header a{color:var(--ivory);text-decoration:none;opacity:.85}header a:hover{opacity:1}
header .sync{margin-left:auto;font-size:13px;opacity:.8}
main{max-width:1100px;margin:0 auto;padding:20px}
h1,h2,h3{font-family:'Playfair Display',Georgia,serif;color:var(--plum);line-height:1.25}h1{font-size:26px;margin:.2em 0 .6em}
a{color:var(--plum)}
.flash{background:#fff;border-left:4px solid var(--gold);padding:10px 14px;margin-bottom:16px}
.card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin-bottom:12px}
.card h3{margin:0 0 2px;font-size:19px}.meta{font-size:13px;color:#6b6170}
.stages{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:10px}
.stage{border-radius:6px;padding:6px 8px;font-size:12px;border:1px solid var(--line);background:#faf7f1}
.stage b{display:block;font-size:12px}
.done{background:#e8f1e4;border-color:#b9d3ae}.wait{background:#fbf0d2;border-color:var(--gold)}
.back{background:#f6dedb;border-color:var(--rose)}.na{opacity:.5}
@media(max-width:700px){.stages{grid-template-columns:repeat(3,1fr)}}
.pack{background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px 20px 14px}
.pack li{margin:.25em 0}
video,img.slide{max-width:320px;width:100%;border-radius:10px;background:#000;display:block}
.slides{display:flex;gap:10px;flex-wrap:wrap}
form.review{background:#fff;border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:12px 0}
textarea,input[type=password]{width:100%;font:inherit;padding:8px;border:1px solid #cbbfa9;border-radius:6px}
textarea.prompt{min-height:60vh;font:14px/1.5 ui-monospace,Menlo,monospace}
button{font:inherit;padding:8px 16px;border-radius:6px;border:1px solid var(--plum);background:var(--plum);color:#fff;cursor:pointer;margin:8px 6px 0 0}
button.alt{background:#fff;color:var(--plum)}button.no{background:var(--rose);border-color:var(--rose)}
table{border-collapse:collapse;width:100%;background:#fff}td,th{border:1px solid var(--line);padding:6px 10px;text-align:left;font-size:14px}
.cols{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:20px}@media(max-width:900px){.cols{grid-template-columns:1fr}}
"""


def page(title, body, flash="", authed=True):
    nav = ""
    if authed:
        s = SYNC
        when = s["at"].strftime("%H:%M") if s["at"] else "-"
        mark = "" if s["ok"] else "⚠ "
        nav = (f'<a href="/">Board</a><a href="/agents">Agents</a><a href="/activity">Activity</a>'
               f'<span class="sync">{mark}{E(s["msg"])} · {when} IST</span>')
    fl = f'<div class="flash">{E(flash)}</div>' if flash else ""
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(title)} · SheLedTheWay</title><style>{CSS}</style></head><body>'
            f'<header><b>SheLedTheWay</b>{nav}</header><main>{fl}{body}</main></body></html>')


def md(text):
    """Very small Markdown renderer: headings, lists, links, paragraphs."""
    def inline(s):
        s = E(s)
        s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
        s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
        return re.sub(r"(https?://[^\s<)]+)", r'<a href="\1" target="_blank" rel="noopener noreferrer">\1</a>', s)
    out, lst = [], None
    def close():
        nonlocal lst
        if lst:
            out.append(f"</{lst}>")
            lst = None
    for line in text.splitlines():
        m = re.match(r"^(#{1,4})\s+(.*)", line)
        b = re.match(r"^\s*[-*]\s+(.*)", line)
        n = re.match(r"^\s*\d+\.\s+(.*)", line)
        if m:
            close(); lv = min(len(m.group(1)) + 1, 4); out.append(f"<h{lv}>{inline(m.group(2))}</h{lv}>")
        elif b or n:
            want = "ul" if b else "ol"
            if lst != want:
                close(); out.append(f"<{want}>"); lst = want
            out.append(f"<li>{inline((b or n).group(1))}</li>")
        elif not line.strip():
            close()
        else:
            close(); out.append(f"<p>{inline(line)}</p>")
    close()
    return "\n".join(out)


def board(flash=""):
    items = stories()
    today = now().strftime("%Y-%m-%d")
    need = [s for s in items if any(v[0] == "wait" and k in ("Draft", "Review") for k, v in s["stages"].items())]
    body = [f"<h1>Pipeline</h1><p class='meta'>{len(need)} item(s) waiting for your review. "
            f"Yellow = waiting for you or scheduled, green = done, red = sent back.</p>"]
    shown = [s for s in items if s["date"] >= today or s["stages"]["Publish"][0] != "done"]
    for s in shown[:40]:
        r = s["row"]
        cells = "".join(f'<div class="stage {v[0]}"><b>{i+1}. {k}</b>{E(v[1])}</div>'
                        for i, (k, v) in enumerate(s["stages"].items()))
        body.append(f'<div class="card"><h3><a href="/story/{E(s["date"])}">{E(r.get("woman",""))}</a></h3>'
                    f'<div class="meta">{E(s["date"])} · {E(r.get("format",""))} · {E(r.get("pillar",""))} · Search (SEO): {E(s["seo"])}</div>'
                    f'<div>{E(r.get("hook",""))}</div><div class="stages">{cells}</div></div>')
    return page("Board", "".join(body), flash)


def story_page(date, token, flash=""):
    s = next((x for x in stories() if x["date"] == date), None)
    if not s:
        return None
    r = s["row"]
    left = [f'<h1>{E(r.get("woman",""))}</h1><p class="meta">{E(date)} · {E(r.get("format",""))} · {E(r.get("pillar",""))}</p>']
    if s["pack"]:
        left.append(f'<div class="pack">{md(s["text"])}</div>')
        last = s["script"]
        note = f'<p class="meta">Last decision: {E(last["decision"])} at {E(last["at_ist"])}. {E(last["note"])}</p>' if last else ""
        left.append(f'<form class="review" method="post" action="/review"><h3>Review the script</h3>{note}'
                    f'<input type="hidden" name="csrf" value="{token}"><input type="hidden" name="date" value="{E(date)}">'
                    f'<input type="hidden" name="stage" value="script">'
                    f'<textarea name="note" rows="3" placeholder="Note for the draft agent (needed when asking for changes)"></textarea>'
                    f'<button name="decision" value="Approved">Approve script</button>'
                    f'<button class="alt" name="decision" value="Changes requested">Ask for changes</button></form>')
    else:
        left.append('<div class="card">No pack written yet.</div>')
    right = ["<h3>Media</h3>"]
    if s["kind"] == "video":
        right.append(f'<video controls playsinline preload="metadata" src="/media/{quote(s["media"][0])}"></video>')
    elif s["kind"] == "images":
        right.append('<div class="slides">' + "".join(
            f'<a href="/media/{quote(m)}" target="_blank"><img class="slide" src="/media/{quote(m)}" alt="slide"></a>'
            for m in s["media"]) + "</div>")
    else:
        right.append('<div class="card">Not rendered yet.</div>')
    if s["media"]:
        q = s["queue"]
        status = q["status"] if q else "not queued"
        when = f'{q["date"]} {q["time_ist"]} IST' if q else "-"
        last = s["video"]
        note = f'<p class="meta">Last decision: {E(last["decision"])} at {E(last["at_ist"])}. {E(last["note"])}</p>' if last else ""
        right.append(f'<form class="review" method="post" action="/review"><h3>Review the media</h3>'
                     f'<p class="meta">Queue status: <b>{E(status)}</b> · slot: {E(when)}</p>{note}'
                     f'<input type="hidden" name="csrf" value="{token}"><input type="hidden" name="date" value="{E(date)}">'
                     f'<input type="hidden" name="stage" value="video">'
                     f'<textarea name="note" rows="3" placeholder="Note for the video agent"></textarea>'
                     f'<label class="meta"><input type="checkbox" name="confirm" value="1"> I understand that approving lets the publish agent post this to Instagram at its slot.</label><br>'
                     f'<button name="decision" value="Approved">Approve for publishing</button>'
                     f'<button class="alt" name="decision" value="Changes requested">Ask for changes</button>'
                     f'<button class="no" name="decision" value="Rejected">Reject</button></form>')
    if s["log"]:
        right.append(f'<div class="card">Published {E(s["log"].get("published_at_ist",""))}. {E(s["log"].get("notes",""))}</div>')
    body = f'<div class="cols"><div>{"".join(left)}</div><div>{"".join(right)}</div></div>'
    return page(r.get("woman", date), body, flash)


def agent_files():
    return sorted((REPO / "agents").glob("*.md"))


def agents_page(token, name="", flash=""):
    files = agent_files()
    links = " · ".join(f'<a href="/agents?f={quote(p.name)}">{E(p.stem)}</a>' for p in files)
    body = [f"<h1>Agents</h1><p class='meta'>Each stage follows its own instruction file. Edit one, save, and the "
            f"agent uses the new text on its next run.</p><p>{links}</p>"]
    cur = next((p for p in files if p.name == name), None)
    if cur:
        body.append(f'<form method="post" action="/agents"><input type="hidden" name="csrf" value="{token}">'
                    f'<input type="hidden" name="f" value="{E(cur.name)}"><h3>{E(cur.name)}</h3>'
                    f'<textarea class="prompt" name="text">{E(cur.read_text(encoding="utf-8"))}</textarea>'
                    f'<button>Save and push</button></form>')
    return page("Agents", "".join(body), flash)


def activity_page():
    log = git("log", "-25", "--format=%ad\t%an\t%s", "--date=format:%d %b %H:%M")
    rows = "".join("<tr>" + "".join(f"<td>{E(c)}</td>" for c in l.split("\t")) + "</tr>" for l in log.splitlines())
    pub = read_csv("publish/log.csv")
    prow = "".join("<tr>" + "".join(f"<td>{E(v or '')}</td>" for v in r.values()) + "</tr>" for r in pub) \
        or "<tr><td>Nothing published yet.</td></tr>"
    rev = read_csv("review/reviews.csv", REVIEW_FIELDS)[-15:][::-1]
    rrow = "".join("<tr>" + "".join(f"<td>{E(r[k])}</td>" for k in REVIEW_FIELDS) + "</tr>" for r in rev) \
        or "<tr><td>No reviews yet.</td></tr>"
    body = (f"<h1>Activity</h1><h3>Published</h3><table>{prow}</table><h3>Your recent reviews</h3><table>{rrow}</table>"
            f"<h3>Repo history</h3><table>{rows}</table>")
    return page("Activity", body)


# ---------- actions ----------
def do_review(form):
    date, stage = form.get("date", ""), form.get("stage", "")
    decision, note = form.get("decision", ""), form.get("note", "").strip()[:1000]
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date) or stage not in ("script", "video"):
        return "Bad request."
    allowed = ("Approved", "Changes requested") + (("Rejected",) if stage == "video" else ())
    if decision not in allowed:
        return "Bad decision."
    if decision == "Changes requested" and not note:
        return "Add a note saying what to change."
    s = next((x for x in stories() if x["date"] == date), None)
    if not s:
        return "Unknown story."
    paths = ["review/reviews.csv"]
    if stage == "script":
        if not s["pack"]:
            return "There is no script to review."
        cal = read_csv("calendar/calendar.csv")
        fields = list(cal[0].keys())
        for row in cal:
            if row["date"] == date:
                row["status"] = "Script approved" if decision == "Approved" else "Changes requested"
        write_csv("calendar/calendar.csv", fields, cal)
        paths.append("calendar/calendar.csv")
    else:
        if not s["media"]:
            return "There is no media to review."
        if decision == "Approved" and form.get("confirm") != "1":
            return "Tick the confirmation box to approve for publishing."
        queue = read_csv("publish/queue.csv", QUEUE_FIELDS)
        row = next((q for q in queue if q["date"] == date), None)
        if not row:
            row = dict(date=date, time_ist="19:30", format=s["row"].get("format", ""), media=s["media"][0],
                       pack=str(s["pack"].relative_to(REPO)) if s["pack"] else "", voice="no", status="")
            queue.append(row)
        if row["status"] == "Published":
            return "Already published; nothing changed."
        row["status"] = decision
        write_csv("publish/queue.csv", QUEUE_FIELDS, queue)
        paths.append("publish/queue.csv")
    reviews = read_csv("review/reviews.csv", REVIEW_FIELDS)
    reviews.append(dict(date=date, stage=stage, decision=decision, note=note,
                        at_ist=now().strftime("%Y-%m-%d %H:%M")))
    write_csv("review/reviews.csv", REVIEW_FIELDS, reviews)
    return f"{stage.capitalize()} {decision.lower()}. " + commit_push(f"review: {date} {stage} {decision}", paths)


def do_agent_save(form):
    name = form.get("f", "")
    if not re.fullmatch(r"[A-Za-z0-9._-]+\.md", name) or not (REPO / "agents" / name).is_file():
        return "Unknown agent file."
    text = form.get("text", "").replace("\r\n", "\n")
    if not text.strip():
        return "Refusing to save an empty instruction file."
    (REPO / "agents" / name).write_text(text if text.endswith("\n") else text + "\n", encoding="utf-8")
    return commit_push(f"agents: owner edited {name}", [f"agents/{name}"])


# ---------- auth ----------
def sign(value):
    return hmac.new(SECRET, value.encode(), hashlib.sha256).hexdigest()


def make_session():
    exp = str(int(time.time()) + SESSION_DAYS * 86400)
    return f"{exp}.{sign(exp)}"


def valid_session(raw):
    try:
        exp, sig = raw.split(".", 1)
        return hmac.compare_digest(sig, sign(exp)) and int(exp) > time.time()
    except Exception:
        return False


class Handler(BaseHTTPRequestHandler):
    server_version = "SLTW"

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.log_date_time_string(), fmt % args))

    def session(self):
        c = cookies.SimpleCookie(self.headers.get("Cookie", ""))
        raw = c["sltw"].value if "sltw" in c else ""
        return raw if valid_session(raw) else None

    def send_html(self, text, code=200, extra=()):
        data = text.encode()
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        for k, v in extra:
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(data)

    def redirect(self, to, extra=()):
        self.send_response(303)
        self.send_header("Location", to)
        for k, v in extra:
            self.send_header(k, v)
        self.end_headers()

    def login_page(self, msg=""):
        body = (f'<h1>Sign in</h1><form method="post" action="/login" style="max-width:340px">'
                f'<input type="password" name="password" placeholder="Password" autofocus>'
                f'<button>Sign in</button></form>')
        self.send_html(page("Sign in", body, msg, authed=False), 200 if not msg else 401)

    def serve_media(self, rel):
        p = (REPO / rel).resolve()
        ok = any(p.is_relative_to((REPO / d).resolve()) for d in MEDIA_DIRS) and p.is_file()
        if not ok:
            return self.send_error(404)
        size = p.stat().st_size
        start, end, code = 0, size - 1, 200
        m = re.fullmatch(r"bytes=(\d*)-(\d*)", self.headers.get("Range", "") or "")
        if m and (m.group(1) or m.group(2)):
            if m.group(1):
                start = int(m.group(1)); end = int(m.group(2)) if m.group(2) else end
            else:
                start = max(0, size - int(m.group(2)))
            end = min(end, size - 1)
            if start > end:
                self.send_response(416); self.send_header("Content-Range", f"bytes */{size}"); self.end_headers(); return
            code = 206
        self.send_response(code)
        self.send_header("Content-Type", mimetypes.guess_type(p.name)[0] or "application/octet-stream")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Cache-Control", "private, no-cache")
        if code == 206:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()
        if self.command == "HEAD":
            return
        with p.open("rb") as f:
            f.seek(start)
            left = end - start + 1
            try:
                while left > 0:
                    chunk = f.read(min(65536, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk); left -= len(chunk)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def serve_public(self, rest):
        """Signed, login-free link to one approved media file, for Instagram's servers to fetch."""
        from urllib.parse import unquote
        sig, _, rel = rest.partition("/")
        rel = unquote(rel)
        want = hmac.new(SECRET, ("pub:" + rel).encode(), hashlib.sha256).hexdigest()[:32]
        live = any(q["media"] == rel and q["status"] in ("Approved", "Publishing")
                   for q in read_csv("publish/queue.csv", QUEUE_FIELDS))
        if not (hmac.compare_digest(sig, want) and live):
            return self.send_error(404)
        return self.serve_media(rel)

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        u = urlparse(self.path)
        qs = {k: v[0] for k, v in parse_qs(u.query).items()}
        sess = self.session()
        if u.path == "/health":
            return self.send_html("ok")
        if u.path.startswith("/pub/"):
            return self.serve_public(u.path[5:])
        if not sess:
            return self.login_page() if u.path in ("/", "/login") else self.redirect("/login")
        token = sign("csrf:" + sess)
        flash = qs.get("m", "")
        if u.path in ("/", "/login"):
            return self.send_html(board(flash))
        if u.path.startswith("/story/"):
            html_ = story_page(u.path[7:], token, flash)
            return self.send_html(html_) if html_ else self.send_error(404)
        if u.path == "/agents":
            return self.send_html(agents_page(token, qs.get("f", ""), flash))
        if u.path == "/activity":
            return self.send_html(activity_page())
        if u.path.startswith("/media/"):
            from urllib.parse import unquote
            return self.serve_media(unquote(u.path[7:]))
        if u.path == "/logout":
            return self.redirect("/login", [("Set-Cookie", "sltw=; Path=/; Max-Age=0")])
        self.send_error(404)

    def do_POST(self):
        u = urlparse(self.path)
        n = int(self.headers.get("Content-Length", "0") or 0)
        if n > 400_000:
            return self.send_error(413)
        form = {k: v[0] for k, v in parse_qs(self.rfile.read(n).decode("utf-8", "replace"),
                                             keep_blank_values=True).items()}
        if u.path == "/login":
            if PASSWORD and hmac.compare_digest(form.get("password", "").encode(), PASSWORD.encode()):
                ck = f"sltw={make_session()}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age={SESSION_DAYS*86400}"
                if os.environ.get("SLTW_INSECURE_COOKIE") == "1":
                    ck = ck.replace(" Secure;", "")
                return self.redirect("/", [("Set-Cookie", ck)])
            time.sleep(2)  # slow down guessing
            return self.login_page("Wrong password.")
        sess = self.session()
        if not sess:
            return self.redirect("/login")
        if not hmac.compare_digest(form.get("csrf", ""), sign("csrf:" + sess)):
            return self.send_error(403, "Bad form token; reload the page.")
        if u.path == "/review":
            msg = do_review(form)
            return self.redirect(f"/story/{quote(form.get('date',''))}?m={quote(msg)}")
        if u.path == "/agents":
            msg = do_agent_save(form)
            return self.redirect(f"/agents?f={quote(form.get('f',''))}&m={quote(msg)}")
        self.send_error(404)


def main():
    if not PASSWORD or len(SECRET) < 16:
        sys.exit("Set SLTW_PASSWORD and SLTW_SECRET (16+ characters) first; see webapp/DEPLOY.md")
    if GIT_SYNC:
        threading.Thread(target=sync_loop, daemon=True).start()
    print(f"SheLedTheWay board on http://127.0.0.1:{PORT}  repo={REPO}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
