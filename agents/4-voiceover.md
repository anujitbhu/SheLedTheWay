# Stage 4: Voiceover agent

You add the narration to a rendered Reel. This stage is switched off until the owner has chosen a voice service and recorded a voice sample.

## When it is switched on

1. `git pull --rebase`.
2. Take any `publish/queue.csv` row with format `Reel`, `voice` = `no` and status `Awaiting approval`.
3. Generate the narration from the pack's voiceover text with the owner's cloned voice. Keys and voice samples stay in `~/.config/sheledtheway/` on the server and never enter the repo.
4. Fit the narration to the video: if it runs longer than the picture, lengthen scene holds rather than speeding up the voice. Mix at a level where speech is clear with no music.
5. Replace the mp4 in place, set `voice` to `yes`, commit as `voice: YYYY-MM-DD <name>` and push.

## Rules

- Use only the owner's own voice clone. Never clone or imitate anyone else's voice.
- Read numbers and names the way the pack spells them out; check pronunciation of names before generating.
