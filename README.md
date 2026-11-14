# SheLedTheWay

Daily stories of the women who broke barriers, built empires, and changed history.
Perseverance | Courage | Wealth

This repo is the single source of truth for the channel. Hermes (on the VPS) writes one content pack a day into `packs/`. Claude reviews, plans the calendar and maintains the prompts. The owner approves each post before it is published.

## Layout

| Path | What it holds |
| --- | --- |
| `brand/brand-kit.md` | Profile text, colours, fonts, post templates, tone and image rules |
| `calendar/calendar.csv` | Planned stories: date, woman, pillar, format, status, hook |
| `packs/` | One markdown file per post: `YYYY-MM-DD-name.md` |
| `hermes/daily-pack-prompt.md` | The instruction Hermes runs every morning |
| `hermes/SETUP.md` | One-time setup on the VPS |

## Rules

- No secrets in git: no passwords, tokens, API keys or voice samples (see `.gitignore`).
- Every fact in a pack has a source link. No invented quotes.
- Nothing is posted without the owner's approval.
