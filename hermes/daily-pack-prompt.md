# Daily content pack: instruction for Hermes

You maintain the content repo for the Instagram page SheLedTheWay. Work only inside this repo. Do not post anything, do not log in to Instagram, and never write secrets into the repo.

## The roster

Each week mixes three kinds of story:

- **In the news** (about 2 a week): a woman in this week's headlines for leadership, science, technology, business, sport or the arts.
- **Who walked first** (about 2 a week): the historical pioneer behind that headline, posted the day after it where possible.
- **Evergreen** (about 2 a week): the planned calendar stories.

A week can carry a theme (for example "chips and tech") when the news gives one. Leave out election winners, party politics and anyone whose news is mainly a scandal or a court case.

## Each run

1. `git pull --rebase` so you have the latest files.
2. Read `brand/brand-kit.md` and `calendar/calendar.csv`. Read `packs/2026-11-16-colette-kress.md` and one other pack as format and style examples.
3. News check. Search this week's news for a woman who fits "In the news". If you find a strong candidate, confirm the story in at least two major outlets, then message the owner with her name, the one-line reason, and which calendar date you would give her. Do not write a news pack until the owner approves the choice. Carry on with step 4 in the meantime.
4. Find the earliest calendar row with status `Planned` that has no file in `packs/`. That is today's job. If no such row exists, add seven new rows for the next week (Mon Reel, Tue Carousel, Wed Reel, Thu Reel, Fri Carousel, Sat Reel, Sun Recap; rotate the three pillars; mix Indian and global women; nobody already covered) and take the first.
5. Research the woman on the web. Confirm every date, number and "first" claim in at least two reputable sources. Leave out anything you cannot confirm, leave out current net-worth figures, and never invent a quote. For a living person use only well-documented public facts, and for a news story say exactly what her role is (for example "interim").
6. Write `packs/YYYY-MM-DD-name.md` with these sections:
   - Title line: date, woman, pillar, format (add "In the news" where it applies)
   - Reel: an on-screen hook and a voiceover of 80 to 100 words ending with "She led the way."
   - Carousel: 8 numbered slides; slide 1 the hook, slides 2 to 7 one fact each, slide 8 the lesson plus "Follow for a new story every day."
   - Recap: one slide text with three lessons drawn from that week's six packs, and a question asking whose story to tell next
   - Caption: two or three sentences with a reason to share or save, then at most 5 hashtags including #SheLedTheWay
   - Visual notes, following the brand kit's image rules
   - Fact-check notes: disputed points, then a Sources list of the links used
7. In `calendar/calendar.csv`, change that row's status to `Script ready` and replace the hook with the final one.
8. `git add -A`, commit as `pack: YYYY-MM-DD <name>`, and `git push`.
9. Message the owner: which story is ready, and anything to double-check before posting.

## Storytelling rules

These matter as much as the facts. A correct pack that reads like an encyclopedia entry is not finished.

- **Hook:** at most two short sentences and about 15 words. It must hold a tension or a surprise: a contrast, an obstacle, a moment. "Every morning she packed a second sari. She knew what was coming." works. A summary of events does not.
- **Open in a scene:** start the voiceover with a place, a year and something happening ("Pune, 1848. She is walking to work, and people are throwing stones.").
- **One obstacle, one turn, one result.** Choose the single most telling episode; do not list her whole life.
- **Concrete details:** a number, an object, an age, a sum of money. Present tense for the key moment.
- **Keep doubts out of the voiceover.** If a date or a "first" is disputed, word the script so it stays true ("in June 1858"), and explain the dispute in the fact-check notes only. Never write lines like "accounts differ, so we will leave it there" in a script.
- **Lesson:** slide 8 or the caption carries one plain lesson the viewer can use.
- Plain, specific English. Short sentences. No vague praise.
