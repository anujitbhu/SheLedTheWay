# One-time task: launch week is "Chips and tech women"

The page launches on Monday 16 November 2026. NVIDIA named Colette Kress interim CEO on 12 November, so the first week is themed on women in chips and technology. Do this once, then delete this file in the same commit.

## 1. Move the six evergreen packs out of launch week

Use `git mv` and update each file's title line and the calendar to match:

| Current file | New date | Format |
| --- | --- | --- |
| 2026-11-16-savitribai-phule.md | 2026-12-16 | Reel |
| 2026-11-18-kalpana-saroj.md | 2026-12-17 | Reel |
| 2026-11-17-madam-cj-walker.md | 2026-12-18 | Carousel |
| 2026-11-19-marie-curie.md | 2026-12-19 | Reel |
| 2026-11-21-junko-tabei.md | 2026-12-21 | Reel |
| 2026-11-20-kiran-mazumdar-shaw.md | 2026-12-22 | Carousel |

Delete `2026-11-22-week-1-recap.md`. Add a `Planned` recap row for 2026-12-20.

## 2. Replace calendar days 1 to 7 with this week

| Date | Woman | Pillar | Format | Working hook (verify, then improve) |
| --- | --- | --- | --- | --- |
| 2026-11-16 | Colette Kress | Wealth | Reel | Pack already written: `packs/2026-11-16-colette-kress.md` |
| 2026-11-17 | Lisa Su | Wealth | Carousel | AMD was close to collapse when she took over in 2014. |
| 2026-11-18 | Lynn Conway | Courage | Reel | IBM fired her in 1968. She went on to change how every chip is designed. |
| 2026-11-19 | Sophie Wilson | Perseverance | Reel | The chip in your phone runs on instructions she designed in the 1980s. |
| 2026-11-20 | Padmasree Warrior | Wealth | Carousel | From Vijayawada to IIT Delhi to running technology at Motorola and Cisco. |
| 2026-11-21 | Grace Hopper | Perseverance | Reel | They said computers could only do arithmetic. She taught them to read words. |
| 2026-11-22 | Week 1 recap | All three | Recap | Three lessons from six women in tech. |

The working hooks are from general knowledge and are not yet checked. Verify every claim in two sources before using it, and drop or reword anything that does not hold.

## 3. Write the packs

Write the five packs for 17 to 21 November and the recap for 22 November now, following `hermes/daily-pack-prompt.md` including its storytelling rules. One commit per pack. Message the owner when all are pushed.

## 4. Also fix

- `packs/2026-11-23-rani-lakshmibai.md`: the facts and sources are good, but rewrite the hook and voiceover to the storytelling rules. Remove the line "so we will leave the date there".
- `hermes/SETUP.md`: change `~/SheledTheWay` to `/home/workspace/SheledTheWay`.
