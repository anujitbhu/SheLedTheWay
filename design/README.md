# The Daily Desk — prototype

A clickable redesign of the SheLedTheWay production board. No build step, no dependencies, no backend.

## Open it

Open `design/index.html` in a browser. The fonts are local, so it works offline.

If a browser refuses to run scripts from `file://`, serve the folder:

```sh
python3 -m http.server 8080 -d design
```

Then open `http://localhost:8080/`.

## What to try

- **Desk** (`#/desk`) — the week's run of show, the current proof, the exceptions, the machine room. Click a day in the week strip to change the story on the desk.
- **Studio** (`#/studio/2026-11-18`) — click any scene row to open its editor. Edit the on-screen line or the voiceover and watch the 9:16 preview update. Use the play control under the preview, click the waveform to seek, or press space.
- **Approval** — `Approve final cut` opens the one gate. It shows the slot, destinations, files and undo window. Confirm to see the stamp and the scheduled state. The demo’s Lynn Conway cut is a day late, so approving moves it to today at 20:30. `Request changes` opens the note dialog.
- **Tabs** — `Script`, `Caption & search`, `Facts`, `History`. The caption opening has a 69/125 meter on Lynn; Padmasree’s caption is over the limit. `Facts → Photographs` lists every archive image, creator, license and source.
- **Calendar** (`#/calendar`) — the five-week run, with month as a secondary view. Click a day for its side panel.
- **Runs** (`#/runs`) — the live run, the stage rail, recent runs, autonomy switches. Click a stage for its gate; click a run for its log. Retry the failed Grace Hopper scene.
- **Rules** (`#/rules`) — human-readable gates, switches, source disclosure, proposed changes, and a chat about the rule. Approve or reject a proposal.
- **Search** — `⌘K` / `Ctrl K`, or the search button. Arrow keys and Enter work.

## Images and credits

Every scene is a collage: a duotone archive photograph as the ground, a portrait print on ivory paper, a caption, a taped corner and a gold stitched thread. The thread is masked before the title. The photograph carries the feeling; the type carries the fact.

The collage uses real archive photographs, duotoned into the plum/ivory palette. There are no AI-generated faces. Every image, creator, license and source is listed in `IMAGE-CREDITS.md` and in Studio → Facts → Photographs.

- `images/source/` — the original downloaded files.
- `images/processed/` — the duotone and background treatments.

Most portraits are CC BY or CC BY-SA rather than public domain. If this goes public, keep the attribution and check the share-alike note in `IMAGE-CREDITS.md`; swap to public-domain equivalents if the brand’s stricter rule must win.

## Data

`design/data.js` carries the 36 calendar rows and the Lynn Conway pack content from the repo. Run states, times, commit hashes, the 20:30 recovery slot, the 138-character Padmasree caption and scene statuses are illustrative. The interface labels this in the footer.

## Files

| File | Purpose |
|---|---|
| `index.html` | The shell |
| `styles.css` | The visual system |
| `app.js` | Routing and interactions |
| `data.js` | Repo content plus illustrative run states |
| `screens/` | Final captures at 1440×900 and 390×844 |
| `fonts/` | Source font files; they are also inlined in `styles.css` so `file://` never blocks them |

The design rationale is in `../REDESIGN.md`; the token-bearing system is in `../DESIGN.md`.
