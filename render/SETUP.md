# Renderer setup (one time, on the VPS)

The renderer `render/cine.py` makes the Reels and carousels. It needs Python 3, Pillow, numpy and ffmpeg. The fonts ship in `render/fonts/`, so nothing else is downloaded.

As root (Debian/Ubuntu):

    apt-get update && apt-get install -y ffmpeg
    sudo -u hermes pip install --break-system-packages --user pillow numpy

If `pip` is missing: `apt-get install -y python3-pip`. If your distro forbids `--break-system-packages`, use a venv owned by hermes, or `apt-get install -y python3-pil python3-numpy`.

## Test it (as hermes, in the repo)

    cd /home/workspace/SheledTheWay
    python3 render/cine.py carousel packs/2026-11-17-lisa-su.md /tmp/test-carousel --motif circuit
    python3 render/cine.py reel packs/2026-11-16-colette-kress.md /tmp/test-kress.mp4

The first writes eight PNGs to /tmp/test-carousel; the second writes a ~33-second 1080x1920 mp4. If both succeed, the Video agent can render.

## Notes

- A Reel is about 20–25 MB. That is fine for Instagram and for git, but it does grow the repo over time; old drafts stay out of git (they live in `reels/drafts/`).
- The renderer draws only brand backgrounds and text. It composites a photo only when a story's pack points to one in `Photos/` with a recorded source (that path is added with the historical-women work).
- Rendering one Reel takes about 20–30 seconds of CPU; a carousel a few seconds.
