# Request handler: answering the owner's board

The owner works on the web board. When he asks a part of a story for alternatives, or chats with an agent about how it should work, the board writes a small request file into the repo. Your job is to answer those requests, quickly and often, so the board feels like a conversation.

Run this on a short cycle (every few minutes). Each run:

1. `git pull --rebase`.
2. Handle alternatives requests, then chat requests (below).
3. Commit and push after each request you answer, so the owner sees it without waiting for the rest.

Answer at most a handful of requests per run; leave the others for the next cycle.

## Alternatives requests: `requests/*.json` with `"status": "pending"`

Each file looks like:

    {"kind":"alternatives","date":"2026-11-18","section":"On-screen hook",
     "pack":"packs/2026-11-18-lynn-conway.md","agent":"agents/2-factcheck-draft.md",
     "instruction":"<what the owner asked, may be empty>","current":"<the section now>",
     "status":"pending","options":[]}

To answer one:

1. Read the agent file named in `agent` (its SOP) and the whole pack named in `pack`. The options must obey that agent's SOP, the brand kit, and the fact-check and SEO rules already in the pack.
2. Write **three** alternatives for that section only, each a complete replacement for `current`:
   - **On-screen hook:** at most two short sentences (~15 words), works with sound off, true to the story.
   - **Slides:** the full numbered slide list, one beat per slide.
   - **Voiceover:** 80 to 100 words ending "She led the way.", her full name in the first two sentences.
   - **Caption:** keyword-first opening within 125 characters, save/send line, 3 to 5 hashtags.
   - **SEO:** the full SEO block in the same field format.
   - **Visual notes:** concrete direction following the brand kit.
3. Follow the `instruction` if there is one (for example "shorter", "start with the year"). If it is empty, make the three meaningfully different from each other and from `current`.
4. **Never invent a fact.** Use only what the pack's Sources support. If the instruction asks for something the sources do not support, make the options that are supportable and say what you could not do in a new `"note"` field.
5. Set `"status":"answered"` and put the three strings in `"options"`. Do not change anything else in the pack; the owner chooses on the board, and the board writes the choice.
6. Commit as `answer: <date> <section> alternatives` and push.

## Chat requests: `requests/chat/<agent>.json` with `"status": "pending"`

Each file is a conversation about one agent's SOP:

    {"agent":"agents/2-factcheck-draft.md","status":"pending",
     "messages":[{"role":"owner","text":"...","at":"..."}],"proposal":null}

To answer one:

1. Read the agent file (its current SOP) and the whole `messages` list.
2. Append one message `{"role":"agent","text":"...","at":"<now>"}` that answers the owner plainly: what you understand him to want, and how it would change the way you work.
3. If he is asking for a change to how the agent behaves, also fill `"proposal"`:

       {"new_sop":"<the entire agent file, rewritten with the change>",
        "rationale":"<one line: what changed and why>","at":"<now>"}

   `new_sop` is the **whole** file, not a fragment, because the board replaces the file with it on approval. Make the smallest change that satisfies the request; keep everything else, including the fact-check, child-safety and SEO rules, word for word. If the request would weaken a safety or fact rule, do not propose it: say so in your message and leave `proposal` null.
4. If he is only asking a question, answer it in the message and leave `proposal` null.
5. Set `"status":"answered"`. Commit as `chat: <agent> reply` and push.

## Rules

- **You never apply an SOP change.** You only propose it. The owner approves on the board, and the board writes the file. Never edit a file under `agents/` yourself from this handler.
- **You never publish, approve, or change a queue status** from here.
- Keep the fact rules absolute: no invented quotes, dates or numbers; "interim" stays "interim"; no net-worth figures; disputes go in fact-check notes, not on screen.
- If a request file is malformed, leave it and move on; do not delete it.
