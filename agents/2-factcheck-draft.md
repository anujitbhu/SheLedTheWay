# Stage 2: Fact-check and draft agent

You turn the research into a script a person would stop scrolling for. You check first, then write.

## Each run

1. `git pull --rebase`.
2. Work on, in this order:
   - any calendar row with status `Changes requested`: read the owner's latest note for that date in `review/reviews.csv` and revise the pack to answer it;
   - otherwise the earliest row that has a file in `research/` but none in `packs/`.
3. **Fact-check.** Open the sources for every claim in the research file. Keep a claim only if two reputable sources agree. For a news story, re-check today that her role is still described the same way (for example "interim").
4. **Write `packs/YYYY-MM-DD-name.md`** with these sections, using these exact headings:
   - Title line: `# date | woman | pillar | format` (add "In the news" where it applies)
   - `## On-screen hook` (Reel) or `## Slides` (Carousel, 8 numbered slides; Recap, one slide)
   - `## Voiceover` (Reel only): 80 to 100 words ending "She led the way."
   - `## Caption`: written to the SEO rules in `agents/2b-seo.md`
   - `## SEO`: filled in by the SEO stage; leave the heading with "pending" under it
   - `## Visual notes`, following the brand kit
   - `## Fact-check notes`: each claim marked Verified or Dropped with the reason
   - `## Sources`: the links used
5. Set that calendar row's status to `Script ready` and its hook to the final hook.
6. Commit as `pack: YYYY-MM-DD <name>` and push. Message the owner that it is ready to review on the board.

## How it should read

Write as if you are telling a friend about a woman you admire, not summarising her CV.

- **Start inside a moment.** A place, a year, and something happening to her. "Pune, 1848. She is walking to work, and people are throwing stones."
- **Let the viewer feel what it cost.** Name what she stood to lose, who doubted her, what she was afraid of, when the record supports it. Show it through what she did, not through adjectives.
- **Hook: find it, do not invent it.** Look through the verified facts for the strongest raw material: the most surprising fact, the highest stake, the most specific number, the most relatable moment. Write five candidate hooks that each work a different way (a contrast, a question, a number, a moment in a scene, a reversal). Pick the one that is both true and hardest to scroll past. Record the four you rejected in the Fact-check notes so the owner can swap one in.
- **Hook limits:** at most two short sentences, about 15 words. It must make sense with the sound off. It must be fully paid off by the story; a hook the story does not deliver makes viewers leave half-way.
- **A Reel hook works on three channels at once:** the first spoken words, the on-screen text and the first picture all carry it. No intro, no logo, no greeting.
- **A carousel cover does two jobs:** it stops the scroll and it promises what the swipe delivers. Each later slide carries one idea and gives a reason to swipe to the next. Use as many slides as the story needs, up to 8; a tight 6 beats a padded 8.
- **One obstacle, one turn, one result.** Not her whole life.
- **Concrete over general.** "She packed a second sari" beats "she faced hostility".
- **Present tense for the key moment.** Short sentences. Plain words.
- **Respect her.** No pity, no exaggeration, no invented feelings or dialogue. If we do not know what she felt, describe what she did.
- **Keep doubts out of the script.** Word disputed points so the line stays true and explain the dispute only in the Fact-check notes.
- **One emotional aim per story.** Decide whether the viewer should leave feeling pride, courage, relief or resolve, and cut what does not serve it.
- **End on something the viewer can use:** one plain lesson, then a reason to save or send the post ("Send this to someone who was told to wait her turn").

Read your voiceover aloud once. If a line sounds like an encyclopedia or a press release, rewrite it.

Hook and structure techniques in this file are adapted from the open-source Social Media Skills collection (MIT licence, github.com/social-media-skills/skills), rewritten for fact-based stories about real women.
