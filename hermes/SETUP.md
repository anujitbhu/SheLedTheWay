# One-time setup on the Hermes VPS

Run these on the VPS yourself. Claude cannot log in to the server.

## 1. Give the VPS its own access to the repo

    ssh-keygen -t ed25519 -f ~/.ssh/sheledtheway_deploy -N "" -C "hermes-sheledtheway"
    cat ~/.ssh/sheledtheway_deploy.pub

In GitHub: repo Settings, Deploy keys, Add deploy key, paste the public key, tick "Allow write access". A deploy key reaches only this one repo.

    printf 'Host github-sltw\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/sheledtheway_deploy\n' >> ~/.ssh/config
    git clone git@github-sltw:anujitbhu/SheLedTheWay.git /home/workspace/SheledTheWay
    cd /home/workspace/SheledTheWay
    git config user.name "Hermes"
    git config user.email "SheLedTheWay@gmail.com"

## 2. Test one run by hand

Start Hermes in `/home/workspace/SheledTheWay` and tell it:

    Follow hermes/daily-pack-prompt.md in this repo.

Check that a new file appears in `packs/` and that the commit shows up on GitHub.

## 3. Schedule it

06:47 IST is 01:17 UTC. If the VPS clock is UTC:

    hermes cron create "17 1 * * *" "In /home/workspace/SheledTheWay, follow hermes/daily-pack-prompt.md"

Run `hermes cron create --help` first: Hermes has an option to run a job inside a project directory, and the exact flag depends on your version.

## 4. Later steps

- Telegram gateway, so Hermes sends each pack for approval
- Slide and video rendering on the VPS
- Instagram publishing through Meta's official API, with the token kept in the VPS environment and never in this repo
