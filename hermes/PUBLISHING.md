# Publishing

Publishing is done by a script, not by an agent: `publish/instagram.py`, run every 10 minutes by a systemd timer. Setup and the full rules are in `publish/SETUP-INSTAGRAM.md`.

Rules for Hermes:

- Never set a queue status to `Approved`, and never run `publish/instagram.py run` yourself. Only the owner approves, on the board.
- Never read, print or copy `~/.config/sheledtheway/instagram.env`.
- You may run `python3 publish/instagram.py check` and `run --dry-run` to diagnose a problem; neither publishes.
- If a row shows `Held`, `Failed` or `Publishing`, message the owner with the status and the last lines of `journalctl -u sltw-publish`. Do not change the status.
- On the morning of an "In the news" post, search the news once more. If the facts in the pack have changed, message the owner before he approves.
