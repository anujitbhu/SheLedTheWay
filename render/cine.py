#!/usr/bin/env python3
"""Cinematic renderer for SheLedTheWay — carousels and reels.

No real-person faces are drawn or generated. Backgrounds are procedural
(brand duotone, texture, grain, a faint circuit/ray motif) so every scene
feels alive without a photo. When a rights-cleared image is supplied in
Photos/ the renderer can duotone-composite it (reel path); living people
stay faceless.

Usage:
  python3 cine.py carousel <pack.md> <out_dir> [--name NAME] [--pillar P] [--motif circuit|rays]
"""
import os, re, sys, math, random, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

PLUM = (59, 28, 74); PLUM2 = (26, 12, 36); GOLD = (201, 162, 75)
IVORY = (247, 241, 232); ROSE = (181, 84, 75); INK = (30, 26, 34)
FONTDIRS = [os.path.join(os.path.dirname(__file__), "fonts"), "/home/claude/reel/fonts/gf/ofl"]


def _find(pat):
    for d in FONTDIRS:
        for root, _, files in os.walk(d):
            if pat in files:
                return os.path.join(root, pat)
    return None


def font(kind, size, wght=None):
    f = _find("PlayfairDisplay[wght].ttf") if kind == "pf" else _find("Inter[opsz,wght].ttf")
    if not f:
        return ImageFont.load_default()
    ft = ImageFont.truetype(f, size)
    if wght:
        try:
            ft.set_variation_by_axes([wght] if kind == "pf" else [14.0, wght])
        except Exception:
            pass
    return ft


def _grad(w, h, top, bot):
    t = np.array(top, float); b = np.array(bot, float)
    ramp = np.linspace(0, 1, h)[:, None, None]
    return (t * (1 - ramp) + b * ramp) * np.ones((h, w, 1))


def background(w, h, seed=0, motif="circuit", warm=0.0):
    """A living brand background: gradient + glow + motif + grain + vignette."""
    rng = random.Random(seed)
    top = np.array(PLUM, float) + np.array([18 * warm, 4 * warm, -6 * warm])
    arr = _grad(w, h, tuple(top), PLUM2)
    # radial glow, off-centre, warm gold
    gx, gy = rng.uniform(0.25, 0.75) * w, rng.uniform(0.18, 0.5) * h
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt((xx - gx) ** 2 + (yy - gy) ** 2) / (0.75 * max(w, h))
    glow = np.clip(1 - d, 0, 1)[..., None] ** 2
    arr += glow * np.array([70, 52, 30]) * 0.5
    img = Image.fromarray(np.clip(arr, 0, 255).astype("uint8"))
    # motif in gold, low alpha, blurred for depth
    mo = Image.new("RGBA", (w, h), (0, 0, 0, 0)); md = ImageDraw.Draw(mo)
    if motif == "circuit":
        for _ in range(rng.randint(14, 20)):
            x = rng.randint(0, w); y = rng.randint(0, h); a = rng.randint(14, 30)
            path = [(x, y)]
            for _ in range(rng.randint(2, 5)):
                if rng.random() < 0.5:
                    x += rng.choice([-1, 1]) * rng.randint(60, 240)
                else:
                    y += rng.choice([-1, 1]) * rng.randint(60, 240)
                path.append((x, y))
            md.line(path, fill=GOLD + (a,), width=2)
            for px, py in path:
                md.ellipse([px - 4, py - 4, px + 4, py + 4], outline=GOLD + (a + 20,), width=2)
    else:  # rays
        cx, cy = rng.uniform(0.2, 0.8) * w, rng.uniform(-0.1, 0.3) * h
        for k in range(26):
            ang = math.pi * (k / 26) + rng.uniform(-0.1, 0.1)
            x2 = cx + math.cos(ang) * h * 1.6; y2 = cy + math.sin(ang) * h * 1.6
            md.line([(cx, cy), (x2, y2)], fill=GOLD + (rng.randint(6, 16),), width=2)
    mo = mo.filter(ImageFilter.GaussianBlur(1.1))
    img = Image.alpha_composite(img.convert("RGBA"), mo).convert("RGB")
    arr = np.asarray(img, float)
    # film grain
    arr += (np.random.default_rng(seed).normal(0, 6.5, (h, w, 1)))
    # vignette
    vy, vx = np.mgrid[0:h, 0:w]
    vd = np.sqrt(((vx - w / 2) / (w / 2)) ** 2 + ((vy - h / 2) / (h / 2)) ** 2)
    arr *= (1 - np.clip(vd - 0.68, 0, 1)[..., None] * 0.42)
    return Image.fromarray(np.clip(arr, 0, 255).astype("uint8"))


def wrap(draw, text, ft, maxw):
    words = text.split(); lines = []; cur = ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if draw.textlength(t, font=ft) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines


def draw_block(draw, lines, ft, cx, y, fill, lh, center=True, spacing=0):
    for ln in lines:
        wl = draw.textlength(ln, font=ft)
        x = cx - wl / 2 if center else cx
        draw.text((x, y), ln, font=ft, fill=fill)
        y += lh
    return y


def tag(draw, text, cx, y, ft):
    sp = 6
    chars = list(text.upper())
    tw = sum(draw.textlength(c, font=ft) for c in chars) + sp * (len(chars) - 1)
    x = cx - tw / 2
    for c in chars:
        draw.text((x, y), c, font=ft, fill=GOLD); x += draw.textlength(c, font=ft) + sp


def slide(text, n, total, w=1080, h=1350, cover=False, name="", pillar="", label="", motif="circuit"):
    img = background(w, h, seed=n * 7 + 3, motif=motif, warm=0.15 if cover else 0.0)
    d = ImageDraw.Draw(img)
    cx = w // 2
    # faded index
    big = font("pf", 340, 800)
    d.text((30, h - 340), str(n), font=big, fill=(86, 63, 106))
    # pillar tag
    if pillar and pillar != "—":
        tag(d, pillar, cx, 86, font("inter", 26, 600))
    if cover:
        nm = name.upper()
        nf = font("pf", 118 if len(nm) <= 9 else 92, 800)
        nlines = wrap(d, nm, nf, w - 150)
        y = 300
        y = draw_block(d, nlines, nf, cx, y, IVORY, (118 if len(nm) <= 9 else 92) + 8)
        d.line([(cx - 80, y + 26), (cx + 80, y + 26)], fill=GOLD, width=4)
        hf = font("pf", 44, 600)
        hlines = wrap(d, text, hf, w - 200)
        draw_block(d, hlines, hf, cx, y + 70, IVORY, 56)
    else:
        bf = font("pf", 60, 600)
        lines = wrap(d, text, bf, w - 190)
        total_h = len(lines) * 76
        y = (h - total_h) // 2 - 20
        d.line([(cx - 46, y - 46), (cx + 46, y - 46)], fill=GOLD, width=3)
        draw_block(d, lines, bf, cx, y, IVORY, 76)
    # footer
    ff = font("inter", 24, 600)
    tag(d, "SHE LED THE WAY", cx, h - 86, ff)
    sf = font("inter", 20, 500)
    hd = "@sheledtheway"
    d.text((cx - d.textlength(hd, font=sf) / 2, h - 52), hd, font=sf, fill=(150, 139, 170))
    return img


def parse_slides(pack_text):
    m = re.search(r"^## Slides[ \t]*\n(.*?)(?=^## |\Z)", pack_text, re.M | re.S)
    if not m:
        return [], ""
    out, label = [], ""
    for raw in m.group(1).splitlines():
        s = raw.strip()
        g = re.match(r"^(\d+)\.\s+(.*)", s)
        if g:
            out.append(g.group(2).strip())
        elif s.lower().startswith("gold label:") and out:
            label = s.split(":", 1)[1].strip()
    return out, label


def carousel(pack_path, out_dir, name="", pillar="", motif="circuit"):
    text = open(pack_path, encoding="utf-8").read()
    slides, label = parse_slides(text)
    if not name:
        g = re.search(r"^#\s*[\d-]+\s*\|\s*([^|]+)", text, re.M)
        name = g.group(1).strip() if g else "SheLedTheWay"
    if not pillar:
        g = re.search(r"\|\s*(Wealth|Courage|Perseverance)\s*\|", text)
        pillar = g.group(1) if g else ""
    os.makedirs(out_dir, exist_ok=True)
    total = len(slides)
    paths = []
    for i, sl in enumerate(slides):
        im = slide(sl, i + 1, total, cover=(i == 0), name=name, pillar=pillar, label=label, motif=motif)
        p = os.path.join(out_dir, f"{i + 1:02d}.png")
        im.save(p, quality=95); paths.append(p)
    return paths




def parse_reel(pack_text):
    m = re.search(r"^## Voiceover[^\n]*\n(.*?)(?=^## |\Z)", pack_text, re.M | re.S)
    scenes = []
    if not m:
        return scenes
    for raw in m.group(1).splitlines():
        g = re.match(r"\s*(\d+):(\d+(?:\.\d+)?)\s*[\u2013\u2014-]\s*(\d+):(\d+(?:\.\d+)?)\s*[\u2013\u2014-]\s*(.+)", raw)
        if not g:
            continue
        st = int(g.group(1)) * 60 + float(g.group(2))
        en = int(g.group(3)) * 60 + float(g.group(4))
        txt = re.sub(r"\[[0-9]+\]", "", g.group(5)).strip()
        scenes.append((max(1.5, en - st), txt))
    return scenes


def reel(pack_path, out_path, name="", pillar="", motif="circuit", tmp="/tmp/reelframes"):
    import subprocess, shutil
    text = open(pack_path, encoding="utf-8").read()
    scenes = parse_reel(text)
    if not scenes:
        raise SystemExit("no timecoded Voiceover scenes found in " + pack_path)
    if not name:
        g = re.search(r"^#\s*[\d-]+\s*\|\s*([^|]+)", text, re.M); name = g.group(1).strip() if g else "SheLedTheWay"
    if not pillar:
        g = re.search(r"\|\s*(Wealth|Courage|Perseverance)\s*\|", text); pillar = g.group(1) if g else ""
    shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp, exist_ok=True)
    W, H = 1080, 1920
    parts = []
    for i, (dur, txt) in enumerate(scenes):
        last = (i == len(scenes) - 1)
        im = slide(txt, i + 1, len(scenes), w=W, h=H, cover=(i == 0),
                   name=name, pillar=pillar, motif=motif)
        fp = os.path.join(tmp, f"s{i:02d}.png"); im.save(fp)
        mp = os.path.join(tmp, f"s{i:02d}.mp4")
        # slow Ken Burns zoom; even scenes zoom out, odd zoom in, for variety
        frames = max(2, int(round(dur * 30)))
        if i % 2 == 0:
            z = "zoom+0.00035"
        else:
            z = "if(eq(on,0),1.10,zoom-0.00035)"
        vf = (f"scale=1350:-1,zoompan=z='{z}':d={frames}:s={W}x{H}"
              f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':fps=30,format=yuv420p")
        subprocess.run(["ffmpeg", "-y", "-loop", "1", "-i", fp, "-t", f"{dur:.2f}",
                        "-vf", vf, "-r", "30", "-c:v", "libx264", "-crf", "18",
                        "-preset", "veryfast", "-pix_fmt", "yuv420p", mp],
                       check=True, capture_output=True)
        parts.append(mp)
    lst = os.path.join(tmp, "list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    silent = os.path.join(tmp, "joined.mp4")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-c", "copy", silent], check=True, capture_output=True)
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    total = sum(d for d, _ in scenes)
    subprocess.run(["ffmpeg", "-y", "-i", silent, "-f", "lavfi", "-i",
                    "anullsrc=channel_layout=stereo:sample_rate=44100",
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac",
                    "-t", f"{total:.2f}", "-shortest", out_path], check=True, capture_output=True)
    return out_path


if __name__ == "__main__":
    if len(sys.argv) >= 4 and sys.argv[1] == "reel":
        out = reel(sys.argv[2], sys.argv[3])
        print("wrote reel", out)
    elif len(sys.argv) >= 4 and sys.argv[1] == "carousel":
        kw = {}
        for i, a in enumerate(sys.argv):
            if a == "--name":
                kw["name"] = sys.argv[i + 1]
            if a == "--pillar":
                kw["pillar"] = sys.argv[i + 1]
            if a == "--motif":
                kw["motif"] = sys.argv[i + 1]
        out = carousel(sys.argv[2], sys.argv[3], **kw)
        print("wrote", len(out), "slides to", sys.argv[3])
    else:
        print(__doc__)
