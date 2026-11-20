# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner-operator of SheLedTheWay: one person running a daily short-form history channel, checking the board between other work, usually on a laptop and sometimes on a phone. They are the only human in the loop. Their job is not to write every post; it is to decide what is good enough, catch factual or tonal risk, and keep the daily slot filled.

Hermes is the second actor. It runs the production stages on a VPS on a short cycle and answers board requests by writing into the repo. It is not a user of the interface in the conventional sense, but its state and next action must be legible to the owner.

## Product Purpose

SheLedTheWay publishes one true story a day about a woman who broke a barrier, built something, or changed history. The pipeline researches, fact-checks, drafts, optimises, renders, voices and publishes each story; the owner approves. Success is a full month of on-time posts with one human sign-off per Reel, no missed slots, and no factual error published.

## Positioning

A git-backed daily production line for a one-person media brand: the repo is the database, Hermes is the production crew, and the interface is the editor's desk. Neighbouring tools show tasks or assets; this one shows a finished daily edition moving toward its slot, with the owner's attention spent only where judgement is required.

## Operating Context

- State lives in the GitHub repo: `calendar/calendar.csv` (the plan), `packs/` (one markdown pack per story), `publish/queue.csv` (media, slot, approval), `review/reviews.csv` (decisions), `publish/log.csv` (published URLs).
- The live board is `webapp/app.py`, a standard-library Python server that reads and writes those files and commits each action. It runs behind Caddy at `myhermes.phoneme.in`.
- Hermes runs a daily prompt plus seven stage SOPs in `agents/`. It answers per-section alternatives and agent-chat requests through `requests/*.json`.
- Reels are 9:16, roughly 30–40 seconds, about seven scenes, with a voiceover ending "She led the way." Carousels are 8 slides; recaps are a single slide.
- The weekly rhythm is Mon Reel, Tue Carousel, Wed Reel, Thu Reel, Fri Carousel, Sat Reel, Sun Recap. Posts are scheduled 19:00–21:00 IST.
- The calendar is planned through 22 December 2026. Publishing is a separate script that runs every 10 minutes and only posts rows whose status is exactly `Approved`.
- The owner works in short sessions and often wants to know one thing: "what needs me now?"

## Capabilities and Constraints

- Six production stages: Research, Draft, SEO, Video, Voice, Review, Publish (SEO runs inside the draft handoff).
- Approval is recorded in CSVs and becomes a git commit. There is no database and no separate job queue to add casually.
- The pack format currently uses fixed `##` headings. The selected redesign direction introduces numbered scene blocks inside a pack so a scene can carry visual direction, spoken line and duration together.
- The owner has chosen one human gate per Reel: script, SEO, render and voice auto-advance; the owner approves the finished cut before scheduling. Exceptions may pull the owner in earlier.
- Fact rules are absolute: every claim sourced, no invented quotes or numbers, disputed "firsts" disclosed, no current net-worth figures, no AI-generated likeness of a real person.
- The owner's cloned voice is not yet available; generic TTS is used until it is.
- The production app must remain git-synced, dependency-light and safe to operate from a phone.

## Brand Commitments

- Name: SheLedTheWay. Tagline: "Women who made history." Promise: perseverance, courage, wealth.
- Palette: deep plum `#3B1C4A`, antique gold `#C9A24B`, ivory `#F7F1E8`, terracotta rose `#B5544B`, charcoal `#1E1A22`.
- Type: Playfair Display for display, Inter for body. Both are free on Google Fonts.
- Reel covers are typographic: her name in Playfair, a one-line hook, a gold pillar label. Every Reel ends on "She led the way."
- Tone: one woman, one story, one lesson; concrete dates, places and numbers; no vague praise; respect, never pity.
- No AI-generated photographs of real women. Public-domain archive photography with credit, or text-led illustration. The prototype uses some CC BY/CC BY-SA Commons photographs with full credit; this is recorded as a prototype exception in `design/IMAGE-CREDITS.md` and must be reviewed before a public release.

## Evidence on Hand

- `calendar/calendar.csv`: 36 planned rows from 16 November to 22 December 2026, with real names, pillars, formats, statuses and hooks.
- `packs/`: 12 complete packs, including Lynn Conway, Colette Kress, Sophie Wilson, Grace Hopper, Savitribai Phule and Marie Curie.
- `review/reviews.csv`: real approval and change-request history for the first Reel.
- `publish/log.csv`: one published Reel with its Instagram URL.
- `reels/`: rendered draft and final MP4s for the Colette Kress story.
- `Photos/`: three supplied portrait assets (Colette Kress and others).
- `design/images/source/`: 13 credited archive photographs (Lynn Conway, Sophie Wilson, Grace Hopper, Padmasree Warrior, Lisa Su, Colette Kress, IBM, Xerox PARC, MIT, a 1925 campus aerial, a wafer and a die shot). Credits and licenses are in `design/IMAGE-CREDITS.md`.
- There are no user accounts, analytics, subscriber counts, revenue figures or performance benchmarks on hand. Future work must not invent them.

## Product Principles

1. **Autonomy is the default; attention is the exception.** The machine advances clean work; the owner is interrupted only for judgement, risk or a final cut.
2. **One Reel, one decision.** Approval should be a single confident act on a finished thing, not a sequence of form submissions.
3. **Show the consequence before the action.** Every approval or edit states what will change, where it will publish, and what it will cost.
4. **The calendar is the plan, not a report.** The owner thinks in days and slots; the interface should too.
5. **Facts outrank speed.** No convenience in the UI may make an unsourced claim easier to ship.
6. **The repo is the record.** Every state change is visible as a normal, reversible commit.

## Accessibility & Inclusion

No product-specific standard has been established. Build the interface to WCAG 2.2 AA: keyboard reachable controls, visible focus, 4.5:1 body contrast, reduced-motion support, and no colour-only status encoding.
