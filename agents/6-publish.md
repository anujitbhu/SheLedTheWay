# Stage 6: Publish

Publishing is automatic and is not done by an agent. The script `publish/instagram.py` runs every 10 minutes and posts rows of `publish/queue.csv` whose status is exactly `Approved` and whose date and time have arrived. See `publish/SETUP-INSTAGRAM.md`.

## What the agent does around it

- On the morning of an "In the news" post, search the news once more. If the story or her role has changed, message the owner before he approves, and say what changed.
- If a row shows `Held`, `Failed` or `Publishing`, message the owner with the status and the last lines of `journalctl -u sltw-publish -n 20`.

## Rules

- Never set a status to `Approved` or `Published`. Never run the publisher yourself.
- Never read, print or copy the access token file.
