# Colette Kress Reel — QA and posting checklist

**Source asset:** `reels/2026-11-16-colette-kress.mp4` (preserved)  
**Narrated candidate:** `reels/2026-11-16-colette-kress-narrated-draft.mp4`  
**Queue:** 16 November 2026, 19:30 IST  
**Status:** Awaiting owner approval; not publishable yet.

## Claim and copy checks

- NVIDIA’s biography supports the 2013 CFO start, nearly 25 years of previous finance work, and earlier roles at Cisco, Microsoft and Texas Instruments.[1]
- Globes reports her sons, then eight and ten, advised her to take the job; it also reports Huang recruited her and shared his vision.[2]
- Official company results support $4.13B in FY2014 revenue and $215.9B in FY2026 revenue.[3][4]
- NVIDIA’s Q2 FY2027 call identifies Kress as CFO and includes her presentation of results.[5]
- NVIDIA’s November 12 transition announcement supports the interim appointment and board search.[6]
- The script separates the company’s growth from Kress’s role presenting results; it does not claim she personally caused the growth.
- Posting-day check: on November 16, verify that Kress remains interim CEO and that the permanent-CEO search is still open; hold and revise if facts changed.[6]

## Media checks

- Original: MP4, 1080×1920, 30 fps, H.264, 36 seconds. Its audio track was effectively silent.
- Narrated candidate: MP4, 1080×1920, 30 fps, H.264/AAC stereo 48 kHz, 36 seconds. Decode test passed; video-frame hashes match the original exactly.
- The narration is generic Edge TTS, not the owner-cloned voice specified by the brand kit. It is provisional until owner review; check pacing and pronunciation, or request a replacement with the approved clone.
- The original video contains a portrait of Kress. Its image source/license is not recorded in the repository; owner must confirm permission before posting.
- The caption discloses AI-generated narration. Apply Instagram’s AI-audio label at publish if available; the narration does not imitate Kress.

## Scene-synchronization check

The original video was sampled at 4 fps. Cards become readable at approximately 0.00, 4.75, 10.25, 15.00, 21.25, 26.75, and 31.25 seconds; narration is placed at those scene starts. FFmpeg silence detection on the final audio shows speech activity at:

| Visual card | Spoken activity in final track |
|---|---:|
| Sons’ advice | 0.19–3.56 s |
| 2013 / smaller NVIDIA / Huang’s vision | 4.94–8.84 s |
| Finance career | 10.45–13.99 s |
| Revenue figures | 15.18–20.05 s |
| Founder transition | 21.44–25.20 s |
| Interim CEO portrait | 26.95–30.50 s |
| Final lesson and sign-off | 31.41–33.81 s; 34.62–35.38 s |

Each spoken interval ends before its card’s next fade. The exact on-screen revenue figures and fiscal-year details remain unchanged; spoken values are rounded for pacing.

## Publishing gate

- Queue must point to the narrated candidate and remain exactly `Awaiting approval` until the owner approves this exact MP4.
- Only the owner may set `Approved`; Hermes must not approve its own work.
- At 15 November 2026, 13:16 IST, `~/.config/sheledtheway/instagram.env` was absent. Do not publish until account/app access is configured and verified; never send tokens in chat or store them in Git.
- `publish/log.csv` currently has no posted entries. Recheck it, the due time, and current news before publishing; verify the exact live post afterward.

## Sources

[1] https://nvidianews.nvidia.com/bios/colette-kress
[2] https://en.globes.co.il/en/article-trillion-dollar-woman-1001453025
[3] https://nvidianews.nvidia.com/news/nvidia-reports-financial-results-for-fourth-quarter-and-fiscal-2014-6622584
[4] https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Fourth-Quarter-and-Fiscal-2026/default.aspx
[5] https://investor.nvidia.com/files/content_files/TRANSCRIPT_-NVIDIA-Corp-NVDA-US-Q2-2027-Earnings-Call-26-August-2026-5_00-PM-ET.pdf
[6] https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition
