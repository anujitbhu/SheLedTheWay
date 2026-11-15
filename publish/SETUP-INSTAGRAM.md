# Connect Instagram publishing: one-time setup

Parts A and B are the owner's, in a browser. Parts C to E are on the VPS. The token is a password to the Instagram account: it goes only into the file in part C, never into the repo, a chat or a screenshot.

Meta renames its menus often. If a label below does not match, look for the nearest equivalent; the goal of each step is stated.

## A. Instagram account

Goal: @SheLedtheWay is a Professional account.

In the Instagram app: Settings, Account type and tools, Switch to professional account, Creator.

## B. Meta developer app

Goal: an app of your own that is allowed to publish to your own account, and a long-lived access token.

1. Go to https://developers.facebook.com and register as a developer. This needs a Facebook account in your real name.
2. Create app. Choose the Instagram use case (it is described as managing messaging and content on Instagram). Any app name, for example "SheLedTheWay Publisher".
3. In the app dashboard open Instagram, then "API setup with Instagram login".
4. Make sure the permissions include `instagram_business_basic` and `instagram_business_content_publish`.
5. Under App roles, Roles, add @SheLedtheWay as an Instagram tester. Then in Instagram (logged in as @SheLedtheWay): Settings, Apps and websites, Tester invites, Accept.
6. Back in "API setup with Instagram login", section "Generate access tokens": Add account, log in as @SheLedtheWay, Allow. Click Generate token and copy it. It is shown once.

The app can stay in Development mode. That is enough to publish to your own account.

## C. Store the token on the VPS

As user `hermes`. Paste the first line alone, paste the token at the prompt, press Enter, then run the rest.

    read -rsp "Paste the Instagram token: " TK; echo

    printf 'IG_ACCESS_TOKEN=%s\n' "$TK" > ~/.config/sheledtheway/instagram.env
    chmod 600 ~/.config/sheledtheway/instagram.env; unset TK
    grep -q SLTW_PUBLIC_URL ~/.config/sheledtheway/webapp.env || echo 'SLTW_PUBLIC_URL=https://myhermes.phoneme.in' >> ~/.config/sheledtheway/webapp.env

## D. Test the connection (publishes nothing)

    cd /home/workspace/SheledTheWay
    python3 publish/instagram.py check

Expected: "Connected to @sheledtheway", a posts-used count, and "Nothing was published. The connection is ready."

Then see what a real run would do, still without posting:

    python3 publish/instagram.py run --dry-run

## E. Schedule it (as root)

Publishing runs every 10 minutes and posts at most one approved, due item per run. The token is refreshed weekly so it never reaches its 60-day expiry.

    cat > /etc/systemd/system/sltw-publish.service <<'UNIT'
    [Unit]
    Description=SheLedTheWay Instagram publisher

    [Service]
    Type=oneshot
    User=hermes
    WorkingDirectory=/home/workspace/SheledTheWay
    ExecStart=/usr/bin/python3 publish/instagram.py run
    UNIT

    cat > /etc/systemd/system/sltw-publish.timer <<'UNIT'
    [Unit]
    Description=Run the SheLedTheWay publisher every 10 minutes

    [Timer]
    OnCalendar=*:0/10
    Persistent=false

    [Install]
    WantedBy=timers.target
    UNIT

    cat > /etc/systemd/system/sltw-token.service <<'UNIT'
    [Unit]
    Description=Refresh the SheLedTheWay Instagram token

    [Service]
    Type=oneshot
    User=hermes
    WorkingDirectory=/home/workspace/SheledTheWay
    ExecStart=/usr/bin/python3 publish/instagram.py refresh
    UNIT

    cat > /etc/systemd/system/sltw-token.timer <<'UNIT'
    [Unit]
    Description=Refresh the Instagram token weekly

    [Timer]
    OnCalendar=Sun 03:00
    Persistent=true

    [Install]
    WantedBy=timers.target
    UNIT

    systemctl daemon-reload
    systemctl enable --now sltw-publish.timer sltw-token.timer

(Remove the four leading spaces from each line if you copy from the rendered page.)

See what the publisher did:

    journalctl -u sltw-publish -n 20 --no-pager

Pause publishing at any time: `systemctl stop sltw-publish.timer`.

## How a post goes out

1. You approve the media on the board. The queue row becomes `Approved`.
2. At the row's date and time (IST) the publisher gives Instagram a private, signed link to the video on the board's server. The link works only while the row is approved.
3. Instagram processes the video; the publisher then publishes it with the pack's caption.
4. The row becomes `Published`, `publish/log.csv` gets the post link, and both are pushed to the repo.

The publisher refuses, and marks the row so the board shows it in red, when:

- an "In the news" story was not approved on its posting day (`Held - re-approve today`): check the news that morning, then approve;
- the slot passed more than 18 hours ago (`Held - slot missed`);
- the format is not a Reel (`Held - format not automated`): carousels are posted by hand for now;
- an earlier run stopped half-way (`Publishing`): check Instagram by hand before doing anything, so nothing is posted twice.

Reels published this way carry only the audio in the file. Instagram's music library is not available through the API.
