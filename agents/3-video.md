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

## When the owner edits a story on the board

"Save and regenerate" sets the queue row to `Changes requested` with a note that starts "Script edited on the board". The pack is now the owner's text: do not rewrite it. Compare the pack with the current video, rebuild only the scenes whose on-screen text changed, keep the rest, and follow any extra instruction in the note. Then hand over to the voiceover stage so the narration is redone to match, and set the row back to `Awaiting approval`.

## Search (SEO) requirements

Read the pack's `## SEO` section before rendering.

- The first scene of a Reel, and the cover slide of a carousel, must show the `On-screen keyword` text: her full name and what she is known for. A small gold label under the hook is enough.
- Burn the voiceover into the video as on-screen captions when the layout allows, so the Reel works with the sound off.
- The Reel cover frame shows her name in large type; it is what appears in search results.
- No watermark from any other platform, and export at full 1080 pixel width.

## Rules

- No AI-generated likeness of a real person, and no photo copied from the web. Use a real photo only if the owner supplied it and its source is recorded in the pack.
- Text must be readable on a phone: no more than about 14 words on screen at once.
- Write every new version to the same file name the queue points to, and keep the previous version in `reels/drafts/` (not committed) until the owner approves.
