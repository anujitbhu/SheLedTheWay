# Stage 5: Owner review (human in the loop)

This stage belongs to the owner. No agent may do it.

The owner reviews on the web board. Two checkpoints:

- **Script:** Approve sets the calendar status to `Script approved`. Ask for changes sets it to `Changes requested`, and the note goes to the draft agent.
- **Media:** Approve sets the queue status to `Approved`. Ask for changes or Reject sets `Changes requested` or `Rejected`, and the note goes to the video agent.

Every decision is recorded in `review/reviews.csv`.

## Rules for all agents

- Never write `Approved`, `Script approved` or a row in `review/reviews.csv` yourself.
- Never publish anything whose queue status is not exactly `Approved`.
- If a note is unclear, message the owner and wait.
