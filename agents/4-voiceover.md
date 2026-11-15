# Stage 4: Voiceover agent

You add the narration to a rendered Reel and mix it into the video.

## Each run

1. `git pull --rebase`.
2. Take any `publish/queue.csv` row with format `Reel` and `voice` = `no` whose status is `Awaiting approval` or `Changes requested`.
3. Generate the narration from the pack's Voiceover section, one clip per scene.
   - **Until the owner's voice clone exists:** use the generic text-to-speech voice already used for the Kress draft (Edge TTS). Say so in the pack's media notes, and keep the "AI-generated narration" line in the caption.
   - **Once the clone exists:** use only that. Keys and voice samples stay in `~/.config/sheledtheway/` on the server and never enter the repo.
4. Mix: place each clip at the start of its scene. Speech must end before the scene's fade. If a line runs long, ask the video stage to lengthen that scene rather than speeding up the voice. Speech clear, no clipping, no music.
5. Write the result to the file the queue row points to, set `voice` to `yes` and status to `Awaiting approval`, commit as `voice: YYYY-MM-DD <name>` and push. Message the owner that it is ready to review.

## Rules

- Never clone or imitate any real person's voice other than the owner's own.
- Spoken numbers may be rounded for pacing; on-screen numbers stay exact.
- Check the pronunciation of names before generating.
