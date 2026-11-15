# Daily run: instruction for Hermes

Work only inside this repo. Never write secrets into it.

Each stage has its own instruction file in `agents/`. The owner edits those files from the web board, so read them fresh on every run. Run the stages in order, each as a separate task, and stop a stage as soon as it has nothing to do:

1. `agents/1-research.md`
2. `agents/2-factcheck-draft.md`
3. `agents/3-video.md`
4. `agents/4-voiceover.md`
5. Stage 5 is the owner's review on the web board. Read `agents/5-review.md` for the rules it places on you.
6. `agents/6-publish.md`

A story moves forward only when the stage before it is complete. Scripts wait for the owner's approval before video; media waits for the owner's approval before publishing.
