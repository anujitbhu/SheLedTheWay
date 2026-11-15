# Deploy the review board: one-time task for Hermes

The board is `webapp/app.py`: Python 3.9+, standard library only, no packages to install. It listens on 127.0.0.1 only and must sit behind HTTPS.

Do steps 1 to 4, then report to the owner. Do not choose, print or store the password yourself: step 2 is the owner's.

## 1. Check

    cd /home/workspace/SheledTheWay && git pull --rebase
    python3 --version
    SLTW_PASSWORD=test SLTW_SECRET=0123456789abcdef0123 SLTW_GIT_SYNC=0 SLTW_PORT=8799 timeout 5 python3 webapp/app.py; true

The last command should print "SheLedTheWay board on http://127.0.0.1:8799" and exit after 5 seconds.

## 2. Settings file (owner runs this himself, as user `hermes`)

    mkdir -p ~/.config/sheledtheway && chmod 700 ~/.config/sheledtheway
    read -rsp "Choose a board password: " PW; echo
    printf 'SLTW_PASSWORD=%s\nSLTW_SECRET=%s\nSLTW_PORT=8787\n' "$PW" "$(openssl rand -hex 32)" > ~/.config/sheledtheway/webapp.env
    chmod 600 ~/.config/sheledtheway/webapp.env; unset PW

Use a long password that is not used anywhere else, and avoid the characters `%`, `$` and `\`.

## 3. Service

Create `/etc/systemd/system/sltw-board.service` (needs root):

    [Unit]
    Description=SheLedTheWay review board
    After=network-online.target

    [Service]
    User=hermes
    WorkingDirectory=/home/workspace/SheledTheWay
    EnvironmentFile=/home/hermes/.config/sheledtheway/webapp.env
    ExecStart=/usr/bin/python3 /home/workspace/SheledTheWay/webapp/app.py
    Restart=on-failure
    NoNewPrivileges=true

    [Install]
    WantedBy=multi-user.target

Adjust the `EnvironmentFile` path if the hermes user's home is elsewhere. Then:

    systemctl daemon-reload && systemctl enable --now sltw-board
    curl -s http://127.0.0.1:8787/health     # prints: ok

The service must run as `hermes` so that its git commits and pushes use the same deploy key as the agents.

## 4. HTTPS

Publish the board at `https://myhermes.phoneme.in/board/` or on a subdomain such as `board.myhermes.phoneme.in`, whichever fits the web server already running on this machine. A subdomain is simpler because the app serves from `/`.

- If nginx or Caddy is already serving this host, add a reverse proxy to `http://127.0.0.1:8787` with the existing certificate. Pass the `Range` header through (the default) so video seeking works.
- If nothing is serving HTTPS yet, install Caddy and use:

      board.myhermes.phoneme.in {
          reverse_proxy 127.0.0.1:8787
      }

  The owner must first point that DNS name at this server.

Never expose port 8787 directly, and never serve the board over plain HTTP: the login cookie is marked Secure and will not work without HTTPS.

## 5. Report

Message the owner with the board's address, which web server you configured, and anything that needs his action (DNS record, password step).

## Updating

The app pulls the repo every two minutes, so content updates need nothing. After a change to `webapp/app.py` itself, run `systemctl restart sltw-board`.
