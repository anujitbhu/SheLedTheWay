# Stage 3: Video agent

You turn an approved script into the media file, using the renderer in `render/`. No AI faces, no web photos — the renderer draws cinematic brand backgrounds (deep plum, antique gold, grain, glow, a faint motif) and, for a story whose pack supplies a rights-cleared photo, composites it in duotone. Work only on calendar rows with status `Script approved`.

## Each run

1. `git pull --rebase`.
2. Take the earliest row with status `Script approved` that has no media yet, or any `publish/queue.csv` row with status `Changes requested` (read the owner's latest `video` note for that date in `review/reviews.csv`).
3. Read the pack and its `## SEO` section. Then render with `render/cine.py` (Python 3, Pillow + numpy + ffmpeg must be installed — see `render/SETUP.md`):
   - **Carousel or Recap:**
     `python3 render/cine.py carousel packs/<pack>.md carousels/<YYYY-MM-DD-name>/ --motif circuit`
     Use `--motif circuit` for technology/chip stories, `--motif rays` otherwise. It writes `01.png` … `08.png`, 1080x1350.
   - **Reel:**
     `python3 render/cine.py reel packs/<pack>.md reels/<YYYY-MM-DD-name>.mp4`
     It reads the timecoded `## Voiceover` lines as scenes and renders 1080x1920, 30 fps, with a slow Ken Burns move. The audio track is silent; the voiceover stage adds narration.
4. Look at the first frame or cover slide before continuing. The woman's full name and what she is known for must be legible (the renderer puts her name on the cover from the pack title). If the pack title or SEO `On-screen keyword` is wrong, fix the pack, not the renderer.
5. Add or update the row in `publish/queue.csv` (columns `date,time_ist,format,media,pack,voice,status`): `media` = the file or folder you wrote, `voice` = `no`, `status` = `Awaiting approval`, default slot `19:30`.
6. Keep any previous version in `reels/drafts/` (not committed). Commit as `video: YYYY-MM-DD <name>` and push. Message the owner that it is ready to review.

## Search (SEO) requirements

- The cover frame shows her name in large type — it is what appears in search results and must match the pack's SEO `On-screen keyword`.
- Export at full 1080 width. No watermark from any other platform.

## When the owner edits a story on the board

"Save and regenerate" sets the queue row to `Changes requested` with a note that starts "Script edited on the board". The pack is the owner's text now: do not rewrite it. Re-run the renderer on the pack so the media matches, then hand to the voiceover stage and set the row back to `Awaiting approval`.

## Rules

- No AI-generated likeness of a real person, and no photo copied from the web. A real photo is used only when the owner has placed it in the repo and its source is recorded in the pack (historical, public-domain, or licensed).
- No more than about 14 words on screen at once; the renderer wraps text, but trim an over-long scene in the pack if it overflows.
- If the renderer errors, do not hand-build a video — message the owner with the error and the command you ran.
