---
name: SheLedTheWay — The Daily Desk
description: An editorial proof desk for a daily automated Reel production line.
colors:
  plum: "#3B1C4A"
  plum-deep: "#2A1236"
  plum-soft: "#53305F"
  paper: "#F7F1E8"
  paper-deep: "#F0E6D6"
  paper-edge: "#E8DCC9"
  surface: "#FFFCF6"
  ivory: "#F7F1E8"
  ink: "#1E1A22"
  ink-secondary: "#4B4252"
  muted: "#6F6276"
  muted-soft: "#8D8092"
  gold: "#C9A24B"
  gold-soft: "#E2C78C"
  gold-hover: "#D4AD57"
  gold-ink: "#7A5C20"
  gold-wash: "#F3E6C8"
  rose: "#B5544B"
  rose-ink: "#9E423A"
  rose-wash: "#F1DDD8"
  sage: "#5E7257"
  sage-light: "#A9C09B"
  scrim: "rgba(0, 0, 0, 0.16)"
  line: "#DED2BF"
  line-soft: "#EBE1D1"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, Times New Roman, serif"
    fontSize: "46px"
    fontWeight: 500
    lineHeight: 0.96
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Playfair Display, Georgia, Times New Roman, serif"
    fontSize: "34px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.42
    letterSpacing: "0em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  label:
    fontFamily: "DM Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.1em"
  micro:
    fontFamily: "DM Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "8px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.1em"
  meta:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
  ui:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
  section:
    fontFamily: "Playfair Display, Georgia, Times New Roman, serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
rounded:
  none: "0"
  xs: "1px"
  sm: "2px"
  md: "3px"
  lg: "4px"
  xl: "8px"
  frame: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.plum-deep}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "38px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "38px"
  stamp-attention:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.rose}"
    rounded: "{rounded.sm}"
    padding: "3px 7px"
  week-day:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px"
  scene-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "10px 0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "9px 10px"
---

# Design System: SheLedTheWay — The Daily Desk

## Overview

**Creative North Star: "The Proof Desk"**

The interface is the desk of a one-person daily newspaper, not a monitoring dashboard. A proof sheet is on the desk; the week's run is pinned above it; the only red marks are the ones that need a human hand. The room is ivory paper and plum ink, with gold used like a proofreader's mark and terracotta used like a correction. Nothing glows, nothing floats without reason, and the browser's own surfaces are part of the design.

The tone is calm because the machine is doing the work. The screen does not celebrate throughput or fill the page with cards. It gives one story the weight of a cover, shows the week as a run of show, and keeps the evidence — sources, counters, timecodes, pass/fail — close enough to touch. The second layer is the archive: real photographs printed on ivory paper, taped at a slight angle, duotoned into plum and gold, with a single stitched thread running through them. The signature move is the proof margin: the thin vertical rule in the scene ledger that carries scene numbers and timecodes, the same information a director reads on a call sheet. The other signature is the approval stamp: a single gold mark that lands on the cut when the owner releases it.

This is an Operate surface. The visitor is the editor, in a short session, deciding whether one Reel is right. Navigation, buttons, tables, tabs and inputs stay conventional; the world enters through type, palette, density and the proof-margin/stamp move, never through a costume of a newsroom.

**Key Characteristics:**
- Ivory paper ground, plum ink, gold signal, terracotta correction; sage only for passed gates.
- Playfair Display for the story and the page; Inter for every control; DM Mono for timecodes, counts and evidence.
- Hairline rules and generous quiet instead of card grids.
- One cover, one decision, one gate per Reel.
- The week as a run of show; the cut as seven scenes.
- Flat at rest; depth only for objects and overlays.
- The approval stamp is the only authored celebration.
- Archive photographs, not flat colour: duotone prints, paper borders, captions and a stitched thread.
- The photograph carries the feeling; the proof carries the control. Neither replaces the other.

**Brand-pinned exceptions.** Inter and the ivory paper (#F7F1E8) are commitments from `brand/brand-kit.md`, not category reflexes. The running pulse is tied to a live Hermes stage, not decoration. A generic detector may flag the face, the warm ground and the pulse; in this product they are the brief.

## Colors

A committed editorial palette: plum carries authority, ivory carries the page, gold carries attention and the human mark, terracotta carries the exception. There is no green traffic light; sage is a quiet "passed" only.

### Primary
- **Proof Plum** (#3B1C4A): the shell, primary buttons, the cover ground, the run-of-show header, and all display type on paper. It is the ink of the product.
- **Plum Deep** (#2A1236): pressed primary buttons, the closing scene card, the running card on Runs, the drawer log. A darker room, not a second brand.
- **Plum Soft** (#53305F): hover and quiet secondary marks on plum; rarely used.

### Secondary
- **Antique Gold** (#C9A24B): the one signal of human attention. Primary action accents, the active tab underline, the proof margin's selected dot, the stamp, the live/pulse dot, the label on a cover. It is never a background for large areas except the stamp and the 2px gate rule.
- **Gold Soft** (#E2C78C): label text on plum, the topbar descriptor, muted marks on dark.
- **Gold Wash** (#F3E6C8): a selected cut segment, a hovered calendar cell, a quiet gold tint. Used as paper, not as ink.
- **Gold Ink** (#7A5C20): gold used as small text or a data mark on paper, where the bright antique gold does not meet contrast. It is the same signal, darkened for ink.

### Tertiary
- **Terracotta Rose** (#B5544B): an exception, a failed gate, a late slot, "Request changes". It is the correction mark, not a general danger colour.
- **Rose Ink** (#9E423A): terracotta used as small text on paper, where the brand rose is just under 4.5:1. The exception keeps its meaning; the ink gets darker.
- **Rose Wash** (#F1DDD8): hover on a destructive ghost button; the faint ground of an exception row.
- **Sage** (#5E7257): a passed gate, "Published", "Scheduled", the check in a facts list. It appears only as a mark or small text, never as a large surface.

### Neutral
- **Ivory Paper** (#F7F1E8): the page. The ground the whole product sits on.
- **Paper Deep** (#F0E6D6): the week strip, the calendar header, the code block, the selected nav row. A second sheet under the first.
- **Paper Edge** (#E8DCC9): progress tracks and the disabled paper.
- **Surface** (#FFFCF6): the proof card, the preview frame's page, inputs, dialogs, the drawer. A sheet laid on the paper.
- **Ink** (#1E1A22): body and headings on paper.
- **Ink Secondary** (#4B4252): the spoken line, a secondary paragraph.
- **Muted** (#6F6276): metadata, reasons, captions, labels.
- **Muted Soft** (#8D8092): disabled text and unselected marks.
- **Rule** (#DED2BF) and **Rule Soft** (#EBE1D1): the hairlines. They do the work that shadows would do in another system.

### Named Rules
**The Gold Is a Signal Rule.** Gold marks attention, selection, or a passed hand. It is never decoration and never covers a large area. If gold appears on a screen where nothing needs the owner, remove it.

**The One Correction Rule.** Terracotta is reserved for an exception the owner can act on. A late slot, a failed gate, a caption over the limit. It is not used for "delete" buttons that are not exceptions.

**The Ink-on-Paper Rule.** The bright gold and rose are for marks and surfaces; small text on paper uses Gold Ink or Rose Ink. If a shade is chosen for the brand rather than the contrast, it is decoration, and the text is not readable enough to keep.

## Typography

**Display Font:** Playfair Display (with Georgia, Times New Roman, serif)
**Body Font:** Inter (with -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif)
**Label/Mono Font:** DM Mono (with ui-monospace, SFMono-Regular, Menlo, monospace)

**Character:** Playfair gives the story the weight of a printed cover; Inter keeps every operational control quiet and legible; DM Mono is the timecode, the count and the evidence — the part of the page that is measured. The three are used for three jobs, never interchangeably. A deliberate micro ramp (8, 9, 10, 11.5, 12.5, 14.5px) carries dense print labels and operational metadata; it is not a display ramp.

### Hierarchy
- **Display** (500, 46px desktop / 34–38px mobile, 0.96 line-height, -0.03em): the selected story on the Desk, a page title on Calendar/Runs/Rules, a dialog title. The name is set tight, almost as a masthead.
- **Headline** (500, 34px, 1.0, -0.02em): the Studio story title; a secondary page heading.
- **Title** (400, 19px, 1.42): the hook on the Desk, the caption opening, a story's one-line promise. Not a card title; a sentence with weight.
- **Body** (400, 14.5px, 1.55): all prose, the spoken line, the caption, the policy body. Cap prose at 65–75ch; operational text may run denser.
- **Label** (400, 8–9px, 0.1em, uppercase mono): section headers inside a component, timecodes, status counts, form labels, the proof margin. Never use mono for a paragraph or a button label as a costume.

### Named Rules
**The Story Name Rule.** Only the selected story's name gets Playfair at 34px or above on an operational screen. Everything else in the shell is Inter. A dashboard of serif headings is a newspaper costume, not this product.

**The Tabular Evidence Rule.** Timecodes, durations, counts, slots and character meters always use DM Mono with tabular numerals. If it can be measured, it is set as data.

## Layout

The shell is a full-bleed plum topbar (72px desktop, 58px mobile) over a 1440px maximum page with 28px gutters. The Desk is a 1fr + 356px rail at 32px gap. The Studio is a 1fr scene ledger + 372px sticky preview. The Calendar is a 1fr grid + 334px side panel. Runs is a 1fr table + 340px autonomy rail. Rules is a 190px stage nav + 1fr policy list.

The week is a seven-column run of show: 104px tall, hairline-separated, each column a day with a name, format, status and slot. It is the first thing under the topbar on the Desk and never scrolls away with the story.

The proof is a two-column object: a 258px 9:16 cover and the story body. The poster is the only large image-like object in the product; it should feel like a printed cover, with crop marks and a ghosted issue number.

Density is editorial, not airy. Related data sits 4–8px apart; sections 24–32px apart; the page breathes at 48–64px. Hairline rules, not gaps, separate rows inside a ledger. There are no equal-sized card grids. The one place a grid is earned is the calendar, where every cell is the same unit of time.

Responsive behaviour is structural. At 1080px the Desk rail moves below the proof as a two-column band; the Studio preview moves above the ledger. At 760px the topbar nav becomes a four-item bottom bar, the week scrolls horizontally as a strip of day cards, the calendar becomes a seven-row agenda, the scene rows lose the visual/state/length columns, and both the Desk and the Studio get a fixed action bar above the bottom nav so the gate is never below the fold.

**Spacing rhythm:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. More space above a heading than below it. The page is allowed to end with quiet paper; not every viewport needs to be filled.

## Elevation & Depth

The system is flat at rest. Depth comes from paper tones and hairlines, not from stacked shadows. A surface is a sheet on the paper; a hovered row is a slightly lighter sheet; a selected row is the same sheet with a gold proof dot.

Only four things lift:
- the cover poster (`0 18px 44px -26px rgba(30,26,34,.42)`), because it is an object on the desk;
- the phone preview (`0 18px 44px -26px rgba(30,26,34,.42)`), because it is the cut;
- the palette (`0 30px 80px -30px rgba(30,26,34,.6)`) and dialog (`0 40px 90px -40px rgba(30,26,34,.65)`), because they interrupt;
- the drawer (`-24px 0 60px -30px rgba(30,26,34,.45)`), because it comes from the edge.

The menu/palette shadow has an offset and a soft blur; there are no zero-offset coloured halos, no glass panels, no gradient text.

### Named Rules
**The Flat-at-Rest Rule.** A card, table row or policy sits flat until hover or selection. If a shadow is doing the work of a hierarchy rule, remove the shadow and add a rule.

**The Credited Archive Rule.** Every photograph is a real archive image with a named creator, a license and a source. The credit lives in Studio → Facts → Photographs and in `design/IMAGE-CREDITS.md`. No AI likeness, no uncredited stock, no photograph used to stand for a person it does not show.

## Shapes

The form language is printed matter: 1px rules, 2–3px control corners, 10px only for the phone frame. Buttons are rectangles with a 2px radius. Stamps are rectangles with a 1px current-colour border. The cover is a hard-edged 9:16 rectangle with crop marks at its corners. Chips are 2px rectangles, not pills; the only pill is the small "TODAY" tag, because it is a label on a date.

The recurring geometry is the proof margin: a 1px vertical line at the left of the scene ledger, a 7px dot at each scene, the scene number above the timecode. Selected scenes turn the dot gold and the line gold. The crop marks, the dashed safe zones and the ghosted issue number are the other geometric signatures. None of them are decorative: each one carries position, safety or sequence.

## Components

### Buttons
- **Shape:** 2px radius, 38px tall (30px for small).
- **Primary:** plum ground, ivory text, 16px side padding, 12.5px Inter 500. The one primary on a screen is the gate action ("Approve final cut") or the page's forward action ("Open the proof").
- **Hover / Focus:** plum deep on hover; 2px gold focus ring with 2px offset. Transition 150ms.
- **Secondary / Ghost:** transparent ground, 1px rule border, ink text. Used for "Request changes", "Back to desk", "Cancel".
- **Quiet:** no border, plum text, used for "Copy", "Ask for options", "On Instagram". Never a primary action.

### Stamps & Marks
- **Style:** 8.5–9px DM Mono, 0.1em tracking, uppercase, 1px current-colour border, 2px radius, 3px × 7px padding.
- **States:** attention (rose), live (plum/gold), done (sage), idle (muted), gold (owner gate).
- **Rule:** a status never relies on colour alone; the stamp carries the word, and a mark carries an icon plus a text label in a week cell or scene row.
- **Approval stamp:** 11px mono, 2px gold double border, 16% tracking, rotated -5deg, lands with a 420ms scale-and-blur; the only celebration in the system.

### Week Strip
- **Shape:** seven equal columns, 104px tall, 1px separators; selected day is a surface sheet with a 2px gold top rule; today has a plum "TODAY" tag; a late day has a rose "LATE" outline tag.
- **Content:** weekday + date, story name in Playfair, format + pillar in 10px, status mark + label, slot in mono.
- **Behaviour:** selecting a day changes the Desk hero without leaving the page; horizontal scroll on mobile with 136px cards.

### Scene Ledger
- **Shape:** a 1px plum top rule; column headers in 8px mono; each scene row is a 6-column grid: proof margin (52px), storyboard thumb (54px), on-screen + spoken (1fr), state (86px), length (42px), overflow (26px).
- **Proof margin:** a 1px vertical line, a 7px dot, scene number and timecode. Selected: gold dot and line.
- **States:** locked (sage check), updated (gold spark, plum text), check (gold alert), running (rose clock), failed (rose x), final (sage check).
- **Expanded editor:** two fields (On screen textarea, Voiceover textarea), the visual note, and three actions: Regenerate visual, Re-voice line, Ask for alternatives. The on-screen field is a textarea because it owns its line breaks.

### 9:16 Preview
- **Frame:** 300px wide, 10px radius, plum-deep ground, 7px padding, 1px plum border, soft shadow.
- **Screen:** 9:16 art with crop marks and a ghosted scene number; dashed gold safe zones at 10% top and 10% bottom; the spoken caption at 17% from the bottom; a 2px progress line; a play affordance that appears on hover (the under-frame play is always visible).
- **Composition in the preview:** the art label is hidden (the caption names her), the title is pushed to the lower third, the footer is hidden. The preview is a video frame, not a poster.
- **Waveform:** 64px, 84 bars, scene ticks and scene numbers; played bars gold; click or arrow keys to seek; the same time is reflected in the scene ledger and the timecode.

### Archive Collage
- **Background:** a full-bleed duotone context photograph at 72–80% opacity, under a plum scrim that starts at 38% on the top edge and falls to 90% at the bottom so the title stays legible.
- **Prints:** ivory paper frames with a 2.2cqw border, 2–3° rotation, a small tape strip on the hero prints, a mono caption, and a soft offset shadow. Captions name the place or the person and the year.
- **Thread:** one gold stitched line, 1.15px, dashed 1.1/1.8, with a dark shadow path. It is masked out before the title; it may pass through a photograph but never through a name.
- **Rules:** the portrait is the human anchor; the context image is the place or the work; the type is the fact. The photographs are never behind the body of a paragraph without a scrim.
- **Credits:** Studio → Facts → Photographs lists every image used by the story with its license, creator and Commons link.

### Gate Note
- **Shape:** surface sheet, 1px rule, 2px gold top rule, 14px padding.
- **Content:** one sentence of consequence, then a pass list of four checks. The primary action stays in the header, not in the note.
- **Copy:** name the slot, the files, the undo window, and whether the story is late.

### Calendar Cell
- **Shape:** 112px tall minimum, surface ground, 1px rule, date in mono, story name in 11.5px Inter 600, format in 7.5px mono, status mark top-right, slot bottom-left, month tag at the first of a month.
- **States:** selected = 2px plum inset outline; today = plum date chip; exception = rose reason line; planned = hollow mark.
- **Run view:** 35 days (five weeks) with no leading blanks; month view is the familiar grid and is secondary.

### Rules
- **Stage nav:** 190px, text rows with a gold square on the active row; horizontal scroll on mobile.
- **Policy row:** title + gate badge, one-line behaviour, pass/paused counts, a switch on the right, and a compact "View source · Discuss" line. The raw SOP opens inline in a `<pre>`; it is never the default.
- **Proposal:** a surface sheet with a 1px rule, a before/after diff split by a 1px rule, and Approve / Reject / Ask why.
- **Switch:** 34×20px, 10px radius, plum when on, paper edge when off; standard toggle semantics.

### Tables
- **Style:** no zebra, no card wrapper; 1px rules between rows, 8px mono headers, 10px cells, tabular numerals in mono columns.
- **Behaviour:** rows are clickable for a run; hover is a surface tint. On mobile the table scrolls inside a `min-width: 0` wrapper, never the page.

### Overlays
- **Palette:** 560px wide, 52px input, 380px list, a 46% ink backdrop. Story results and page results are grouped; arrow keys and Enter work.
- **Dialog:** 480px, surface, 3px radius, 26px Playfair title, a consequence list with hairlines, right-aligned actions. Native `<dialog>` for focus and Esc.
- **Drawer:** 430px from the right, paper ground, 1px left rule, soft edge shadow, used for a run log, a stage gate, or an agent conversation.
- **Toast:** plum ground, ivory text, 2px gold top rule, bottom centre, above the mobile action bar; 4.2s.

## Do's and Don'ts

### Do
- **Do** use real archive photographs with a named creator, license and source. The credit is also recorded in the prototype’s Facts tab and `design/IMAGE-CREDITS.md`.
- **Do** let the photograph carry the feeling: a close portrait for the private turn, a place for the public one, a chip or a room for the work.
- **Do** give the selected story the only 46px Playfair name on the desk; every other name is 16.5px or a row.
- **Do** keep the one gate visible: a single primary "Approve final cut" in the Studio header and a mobile action bar with the same two choices.
- **Do** state the consequence before the action: slot, destinations, files, undo time. For a late cut, say it moves to today at 20:30.
- **Do** use mono for every timecode, count, duration, slot and character meter.
- **Do** show the proof margin in every scene row; it is the signature and the wayfinding.
- **Do** let the page end in quiet paper. A calm screen is the product working.
- **Do** keep the facts, sources and counts one click away, not in a separate app.
- **Do** preserve the git record: every action names the files it writes and the branch is visible in the footer.
- **Do** label prototype data as illustrative; real content and invented run states never mix silently.

### Don't
- **Don't** turn the Desk into a card grid of equal stories. The one decision must have more weight than the queue.
- **Don't** use a Kanban as the home. The calendar is the plan; a board of stages is another abstraction between the owner and the day.
- **Don't** put a display face on buttons, tabs, table cells or form labels. Playfair is for the story and the page, not the UI.
- **Don't** use gold as decoration, a background wash, or a gradient. It is a proof mark.
- **Don't** use green/amber/red as a traffic light. Rose is a correction; sage is a passed hand; the word and the icon carry the state.
- **Don't** show a raw markdown file as the agent's primary interface. The rule is the interface; the SOP is the receipt.
- **Don't** regenerate the whole video from one note when a scene can be fixed. The scene is the unit of change.
- **Don't** hide the late slot or let an approval imply an impossible publish time. Say the new slot and the undo window.
- **Don't** add shadows to cards at rest, glass, gradient text, emoji icons or a second accent colour.
- **Don't** let a card or a chip nest inside another card; the proof sheet is the only large container on the Desk.
- **Don't** use an AI-generated face or an uncredited photograph, and don't let a generic die shot imply it is the specific chip in the story. Label context as context.
- **Don't** run a photograph behind body copy without a scrim; the story is the words, the photograph is the feeling.
