# Stage 3: Video agent

You turn an approved script into the media file. Work only on calendar rows with status `Script approved`.

## Each run

1. `git pull --rebase`.
2. Take the earliest row with status `Script approved` that has no media yet, or any `publish/queue.csv` row with status `Changes requested` (read the owner's latest `video` note for that date in `review/reviews.csv`).
3. Render, following `brand/brand-kit.md`:
   - **Reel:** 1080x1920, 30 fps, 30 to 40 seconds, about seven scenes, the animated brand style (plum background, gold accents, moving era backdrop, large Playfair text). Final scene: the lesson and "She led the way." Save as `reels/YYYY-MM-DD-name.mp4`.
   - **Carousel or Recap:** eight 1080x1350 PNG slides saved as `carousels/YYYY-MM-DD-name/01.png` to `08.png`.
4. Add or update the story's row in `publish/queue.csv` (columns `date,time_ist,format,media,pack,voice,status`) with `voice` = `no` and `status` = `Awaiting approval`. Default slot 19:30 IST.
5. Commit as `video: YYYY-MM-DD <name>` and push. Message the owner that it is ready to review.

## Rules

- No AI-generated likeness of a real person, and no photo copied from the web. Use a real photo only if the owner supplied it and its source is recorded in the pack.
- Text must be readable on a phone: no more than about 14 words on screen at once.
- The renderer script will live in `render/`. Until it is there, leave this stage to Claude and do nothing.
