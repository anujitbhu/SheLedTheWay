# Publishing from the Hermes VPS

Finished media lives in `reels/` (and later `carousels/`). `publish/queue.csv` says what goes out and when. Hermes publishes a row only when its status is exactly `Approved`. Only the owner sets that status.

## One-time setup (owner does this; it involves logins and a token)

1. In the Instagram app, switch @SheLedtheWay to a Professional account (Creator, category Education).
2. At developers.facebook.com, create a Meta developer app and add the Instagram product ("API setup with Instagram login").
3. Add the @SheLedtheWay account to the app as an Instagram tester and accept the invite in Instagram.
4. Generate an access token for that account with the `instagram_business_content_publish` permission, and exchange it for a long-lived token (valid about 60 days; it must be refreshed before it expires).
5. On the VPS, as the `hermes` user, store the token and account ID outside the repo:

       mkdir -p ~/.config/sheledtheway && chmod 700 ~/.config/sheledtheway
       nano ~/.config/sheledtheway/instagram.env     # IG_USER_ID=...  IG_ACCESS_TOKEN=...
       chmod 600 ~/.config/sheledtheway/instagram.env

Meta changes these screens and permission names often. Follow the current guide:
https://developers.facebook.com/docs/instagram-platform/content-publishing/

Never put the token in this repo, in a pack, or in a chat message.

## What Hermes does on a publishing run

1. `git pull --rebase`.
2. Read `publish/queue.csv`. Take rows where status is `Approved`, the date is today (IST) and `time_ist` has passed. If there are none, stop.
3. For an "In the news" pack, search the news once more. If the facts in the script have changed (for example a permanent CEO has been named), do not publish: set status to `Held - facts changed` and message the owner.
4. Read the caption from the pack's `## Caption` section.
5. Publish with Meta's Content Publishing API, using the values in `~/.config/sheledtheway/instagram.env`:
   - Create a Reel container: `POST /<IG_USER_ID>/media` with `media_type=REELS`, the caption, and `upload_type=resumable`.
   - Upload the local mp4 to the returned upload address (`rupload.facebook.com/ig-api-upload/...`).
   - Poll the container until `status_code` is `FINISHED`.
   - Publish: `POST /<IG_USER_ID>/media_publish` with `creation_id`.
6. On success, set the queue row to `Posted` and add a line to `publish/log.csv`. On any error, set `Failed`, record the error in the log notes, and do not retry more than once.
7. Commit as `publish: YYYY-MM-DD <name>` and push. Message the owner with the result.

## Rules

- No row is published without `Approved`. Hermes never approves its own work.
- One post per run. Never publish the same media twice; check `publish/log.csv` first.
- Reels through the API must be MP4 with H.264 video and AAC audio; the files in `reels/` already are.
- Instagram's music library is not available through the API. A Reel published this way carries only the audio inside the file.
