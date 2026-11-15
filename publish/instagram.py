#!/usr/bin/env python3
"""Publish approved SheLedTheWay posts to Instagram through Meta's official API.

Standard library only. Run from anywhere:

  python3 publish/instagram.py check      # test the connection; publishes nothing
  python3 publish/instagram.py run        # publish at most one due, approved post
  python3 publish/instagram.py run --dry-run   # show what `run` would do
  python3 publish/instagram.py refresh    # extend the access token by 60 days

Secrets are read from ~/.config/sheledtheway/ on the server and are never
printed or written to the repo:
  instagram.env  IG_ACCESS_TOKEN=...        (required)
                 IG_API_VERSION=v25.0       (optional)
  webapp.env     SLTW_SECRET=...            (already there for the board)
                 SLTW_PUBLIC_URL=https://myhermes.phoneme.in   (add this line)

Safety rules built in:
  * only rows whose status is exactly "Approved" are published
  * one post per run; a lock file stops two runs overlapping
  * an "In the news" story must have been approved on its posting day
  * a row is marked "Publishing" before the final call, and a row found in
    that state is never retried automatically (prevents double posts)
"""
import csv, fcntl, hashlib, hmac, io, json, os, re, subprocess, sys, time
import urllib.error, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CONF = Path(os.environ.get("SLTW_CONF_DIR", str(Path.home() / ".config" / "sheledtheway")))
IST = timezone(timedelta(hours=5, minutes=30))
QUEUE_FIELDS = ["date", "time_ist", "format", "media", "pack", "voice", "status"]
LOG_FIELDS = ["date", "format", "media", "instagram_media_id", "published_at_ist", "notes"]
LATE_LIMIT = timedelta(hours=18)   # an approved post this far past its slot is held, not posted
POLL_SECONDS, POLL_TRIES = 10, 60  # wait up to 10 minutes for Instagram to process a video


class Stop(Exception):
    """A clean, explained stop."""


# ---------- config ----------
def read_env(name):
    p = CONF / name
    out = {}
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def config():
    ig, web = read_env("instagram.env"), read_env("webapp.env")
    token = ig.get("IG_ACCESS_TOKEN", "")
    if not token:
        raise Stop(f"No IG_ACCESS_TOKEN in {CONF / 'instagram.env'}. See publish/SETUP-INSTAGRAM.md.")
    return dict(token=token, version=ig.get("IG_API_VERSION", "v25.0"),
                host=os.environ.get("IG_GRAPH_HOST", "https://graph.instagram.com").rstrip("/"),
                secret=web.get("SLTW_SECRET", "").encode(),
                public=web.get("SLTW_PUBLIC_URL", "").rstrip("/"))


# ---------- Meta API ----------
def api(cfg, method, path, params=None):
    """Call the Instagram API. The token never appears in errors or output."""
    params = dict(params or {})
    url = f"{cfg['host']}/{cfg['version']}/{path.lstrip('/')}" if not path.startswith("http") else path
    data = None
    if method == "GET":
        if params:
            url += "?" + urllib.parse.urlencode(params)
    else:
        data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Authorization": f"Bearer {cfg['token']}"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read().decode()).get("error", {})
            msg = f"{err.get('message', 'unknown error')} (code {err.get('code')}, subcode {err.get('error_subcode')})"
        except Exception:
            msg = f"HTTP {e.code}"
        raise Stop(f"Instagram refused the request to /{path.split('?')[0].lstrip('/')}: {msg}".replace(cfg["token"], "***"))
    except urllib.error.URLError as e:
        raise Stop(f"Could not reach Instagram: {e.reason}")


def account(cfg):
    me = api(cfg, "GET", "me", {"fields": "user_id,username,account_type"})
    if not me.get("user_id"):
        raise Stop("Instagram did not return an account id for this token.")
    return me


# ---------- repo data ----------
def now():
    return datetime.now(IST)


def read_csv(rel, fields):
    p = REPO / rel
    if not p.exists():
        return []
    with p.open(newline="", encoding="utf-8") as f:
        return [{k: (r.get(k) or "") for k in fields} for r in csv.DictReader(f)]


def write_csv(rel, fields, rows):
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=fields, lineterminator="\n", extrasaction="ignore")
    w.writeheader()
    w.writerows(rows)
    p = REPO / rel
    tmp = p.with_suffix(".tmp")
    tmp.write_text(buf.getvalue(), encoding="utf-8")
    tmp.replace(p)


def git(*args):
    p = subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True, timeout=120)
    if p.returncode != 0:
        raise Stop(f"git {' '.join(args[:2])} failed: {(p.stderr or p.stdout).strip()[-300:]}")
    return p.stdout.strip()


def save(message, queue, log=None):
    write_csv("publish/queue.csv", QUEUE_FIELDS, queue)
    paths = ["publish/queue.csv"]
    if log is not None:
        write_csv("publish/log.csv", LOG_FIELDS, log)
        paths.append("publish/log.csv")
    if os.environ.get("SLTW_GIT_SYNC", "1") == "0":
        return
    git("add", "--", *paths)
    if git("status", "--porcelain", "--", *paths):
        git("commit", "-m", message, "--", *paths)
        git("pull", "--rebase", "--autostash")
        git("push")


def pack_parts(rel):
    """Return (caption, is_news) from a pack file."""
    p = REPO / rel
    if not rel or not p.is_file():
        raise Stop(f"Pack file not found: {rel}")
    text = p.read_text(encoding="utf-8")
    is_news = "in the news" in text.splitlines()[0].lower() if text else False
    m = re.search(r"^## Caption[ \t]*\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    caption = m.group(1).strip() if m else ""
    if not caption:
        raise Stop(f"No '## Caption' section in {rel}.")
    if len(caption) > 2200:
        raise Stop(f"Caption in {rel} is {len(caption)} characters; Instagram allows 2,200.")
    if len(re.findall(r"#\w+", caption)) > 5:
        raise Stop(f"Caption in {rel} has more than 5 hashtags.")
    return caption, is_news


def public_url(cfg, rel):
    if not cfg["public"] or len(cfg["secret"]) < 16:
        raise Stop("Add SLTW_PUBLIC_URL=https://<board address> to webapp.env so Instagram can fetch the video.")
    sig = hmac.new(cfg["secret"], ("pub:" + rel).encode(), hashlib.sha256).hexdigest()[:32]
    return f"{cfg['public']}/pub/{sig}/{urllib.parse.quote(rel)}"


def approved_on(date):
    rows = read_csv("review/reviews.csv", ["date", "stage", "decision", "note", "at_ist"])
    hits = [r for r in rows if r["date"] == date and r["stage"] == "video" and r["decision"] == "Approved"]
    return hits[-1]["at_ist"][:10] if hits else ""


# ---------- commands ----------
def cmd_check(cfg):
    me = account(cfg)
    print(f"Connected to @{me.get('username')} (account type: {me.get('account_type')}).")
    if str(me.get("account_type", "")).upper() not in ("BUSINESS", "MEDIA_CREATOR", "CREATOR"):
        print("WARNING: publishing needs a Professional (Creator or Business) account.")
    try:
        lim = api(cfg, "GET", f"{me['user_id']}/content_publishing_limit", {"fields": "quota_usage,config"})
        d = (lim.get("data") or [{}])[0]
        print(f"Posts used in the last 24 hours: {d.get('quota_usage', '?')} of {d.get('config', {}).get('quota_total', '?')}.")
    except Stop as e:
        print(f"WARNING: publishing permission check failed. {e}")
        print("The token probably lacks instagram_business_content_publish.")
        return 1
    if cfg["public"]:
        print(f"Public media address: {cfg['public']}/pub/...")
    else:
        print("WARNING: SLTW_PUBLIC_URL is not set in webapp.env; publishing cannot fetch media yet.")
        return 1
    print("Nothing was published. The connection is ready.")
    return 0


def cmd_refresh(cfg):
    r = api(cfg, "GET", f"{cfg['host']}/refresh_access_token",
            {"grant_type": "ig_refresh_token", "access_token": cfg["token"]})
    new = r.get("access_token")
    if not new:
        raise Stop("Instagram did not return a refreshed token.")
    p = CONF / "instagram.env"
    lines = [l for l in p.read_text(encoding="utf-8").splitlines() if not l.startswith("IG_ACCESS_TOKEN=")]
    tmp = p.with_suffix(".tmp")
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write("\n".join([f"IG_ACCESS_TOKEN={new}"] + lines) + "\n")
    tmp.replace(p)
    print(f"Token refreshed; valid for about {int(r.get('expires_in', 0)) // 86400} more days.")
    return 0


def cmd_run(cfg, dry):
    if os.environ.get("SLTW_GIT_SYNC", "1") != "0":
        git("pull", "--rebase", "--autostash")
    queue = read_csv("publish/queue.csv", QUEUE_FIELDS)
    stuck = [q for q in queue if q["status"] == "Publishing"]
    if stuck:
        raise Stop(f"{stuck[0]['date']} is marked 'Publishing' from an earlier run that did not finish. Check Instagram "
                   f"by hand: if the post is there, set the status to Published; if not, re-approve it on the board.")
    t = now()
    due = []
    for q in queue:
        if q["status"] != "Approved":
            continue
        try:
            slot = datetime.strptime(f"{q['date']} {q['time_ist']}", "%Y-%m-%d %H:%M").replace(tzinfo=IST)
        except ValueError:
            print(f"Skipping {q['date']}: unreadable date or time.")
            continue
        if slot <= t:
            due.append((slot, q))
    if not due:
        print("Nothing approved and due.")
        return 0
    slot, row = sorted(due, key=lambda x: x[0])[0]
    name = f"{row['date']} {row['format']}"

    def hold(status, why):
        print(f"HELD {name}: {why}")
        if not dry:
            row["status"] = status
            save(f"publish: hold {row['date']} ({status})", queue)
        return 2

    if t - slot > LATE_LIMIT:
        return hold("Held - slot missed", "approved, but its slot passed more than 18 hours ago. Set a new date or time and re-approve.")
    media = REPO / row["media"]
    if not media.is_file():
        return hold("Failed - media missing", f"file {row['media']} is not in the repo.")
    caption, is_news = pack_parts(row["pack"])
    if is_news and approved_on(row["date"]) != row["date"]:
        return hold("Held - re-approve today", "an 'In the news' story must be approved on its posting day, after you have "
                    "checked that the facts still hold.")
    if row["format"] != "Reel":
        return hold("Held - format not automated", f"automatic publishing handles Reels only so far; post this {row['format']} by hand.")

    url = public_url(cfg, row["media"])
    print(f"Due: {name}\n  media: {row['media']} ({media.stat().st_size // 1024} KB)\n  caption: {caption[:90]}...")
    if dry:
        print("Dry run: nothing sent to Instagram.")
        return 0

    me = account(cfg)
    uid = me["user_id"]
    box = api(cfg, "POST", f"{uid}/media", {"media_type": "REELS", "video_url": url, "caption": caption,
                                              "share_to_feed": "true"})
    cid = box.get("id")
    if not cid:
        raise Stop("Instagram did not return a container id.")
    status = ""
    for _ in range(POLL_TRIES):
        st = api(cfg, "GET", cid, {"fields": "status_code,status"})
        status = st.get("status_code", "")
        if status == "FINISHED":
            break
        if status in ("ERROR", "EXPIRED"):
            row["status"] = "Failed - Instagram rejected video"
            save(f"publish: failed {row['date']}", queue)
            raise Stop(f"Instagram could not process the video: {st.get('status', status)}")
        time.sleep(float(os.environ.get("IG_POLL_SECONDS", POLL_SECONDS)))
    if status != "FINISHED":
        raise Stop("Instagram was still processing after 10 minutes. Nothing was posted; the next run will try again.")

    row["status"] = "Publishing"          # recorded before the call that cannot be undone
    save(f"publish: publishing {row['date']}", queue)
    done = api(cfg, "POST", f"{uid}/media_publish", {"creation_id": cid})
    mid = done.get("id", "")
    link = ""
    try:
        link = api(cfg, "GET", mid, {"fields": "permalink"}).get("permalink", "")
    except Stop:
        pass
    row["status"] = "Published"
    log = read_csv("publish/log.csv", LOG_FIELDS)
    log.append(dict(date=row["date"], format=row["format"], media=row["media"], instagram_media_id=mid,
                    published_at_ist=now().strftime("%Y-%m-%d %H:%M"), notes=link))
    save(f"publish: {row['date']} published", queue, log)
    print(f"PUBLISHED {name}: {link or mid}")
    return 0


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    cmd = args[0] if args else ""
    if cmd not in ("check", "run", "refresh"):
        sys.exit(__doc__)
    lock = open(CONF / "publish.lock", "w") if CONF.is_dir() else None
    try:
        if lock:
            try:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except OSError:
                print("Another publish run is in progress; exiting.")
                return 0
        cfg = config()
        if cmd == "check":
            return cmd_check(cfg)
        if cmd == "refresh":
            return cmd_refresh(cfg)
        return cmd_run(cfg, "--dry-run" in sys.argv)
    except Stop as e:
        print(f"STOPPED: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
