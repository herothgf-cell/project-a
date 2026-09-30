# P0 polish checkpoint — 2026-09-30

Base: `3c117b3`, branch `codex/art-vertical-slice`. This is **partial implementation**, not completion of the six requested workstreams or approval under `07_DONE_CRITERIA.md`.

## Implemented in the local candidate preview

- Independent quieter concrete/asphalt and grass/earth atlases replace conspicuous repeating ground motifs.
- Separate reality and murim prop atlases: benches, village pond, secondary entrances. Original coordinates, collision and travel rules remain unchanged.
- Combat echo keeps its emission action and facing; preview samples the frozen pose rather than the current player clock. Discovery echoes retain their emission facing too.
- Echo replay distinguishes preparation from the actual delayed contact. Pending presentation carries the original action identity/angle without changing the 0.45-second delay or damage.
- Six interpretation events resolve to candidate VFX. Seal binding appears at an actual telegraphed target; guide contact depends on actual follow-up damage. Preparation is not reported as a successful parry.
- Lethal damage records one transient death clock. Local preview draws the existing death frames for 1.2 seconds instead of skipping dead enemies immediately; no additional rewards or hits.
- Murim attack1 now resolves eight candidate facings: existing SE plus seven new independent four-frame sheets. The east strip with boundary contamination has been superseded by a square v3 atlas. Foot/hand/blade sockets remain provisional, not production approval.

## Evidence

- Latest Node suite: 216 passing, 0 failing; read-only alpha auditor: 3 Python tests passing.
- New eight-facing actual Chromium test: real keyboard attack1 in all eight directions preserves damage and shared body/effect frame/time; 32 gallery frame captures, zero page errors. New 28 frames have zero alpha > 32 pixels on slicing edges. This is bounds/clock evidence, not natural-motion acceptance.
- Syntax checks: existing package check commands plus candidate runtime files pass.
- Actual Chromium `art-review.browser.cjs`: independent worlds, 8-way walking, real keyboard SE combo damage 22/24/37, shared body/VFX elapsed clock, dodge/cast/hit, no page errors.
- Actual Chromium `art-scene.browser.cjs`: city/village/forest/rift, independent portraits, new rest props, death frame rendering, no page errors.
- Existing v0.8 HTTP/native-storage regression: 7 scenarios including 390×844, 360×640, 844×390 and reduced motion pass. Real mobile hardware/low-end performance is not verified by desktop emulation.
- Captures are in `.superpowers/art-production/evidence/`: `scene-city-candidate.png`, `scene-village-candidate.png`, `death-forest-candidate.png`, `death-rift-candidate.png`.
- Built-in image generation prompts and destinations: `16_P0_POLISH_PROMPTS.json`.
- Directional attack prompts: `18_DIRECTIONAL_ATTACK_PROMPTS.json`. Captures: `.superpowers/art-production/evidence/attack1-directions/` (gallery and actual game); report retains `approved: false`.
- Fresh code review found a missing motion-default/frozen-clock path in the procedural echo fallback. A consuming-pose regression reproduced NaN coordinates and later pose drift; the shared pose sampler now supplies defaults and honors the snapshot clock. RED → GREEN; 209-test suite passes. No separate minor findings. Artwork acceptance and real-device performance remain unverified, not waived.

## BLOCKED_ART / release gates

| Workstream | Remaining |
|---|---|
| Hero | Both worlds idle/walk/attack1 have 8 candidate facings. Other combat/dodge/cast/hit actions have SE only. Remaining 70 action/facing combinations are absent. Existing candidate appearance accepted by user (19_USER_APPROVAL.md); technical foot/hand/blade continuity and recovery-to-idle checks still remain. |
| Two scenes | New ground/props improve the slice but are candidates. Portal antenna clipping, geometry/scale/depth and full interaction capture still need visual acceptance. |
| Enemies | Four independent enemy sheets have SE only. Extra facings and weapon overflow remain unresolved; death connection alone is not animation completion. |
| VFX | Routing/conditional phases implemented; complete 9 skills + 6 interpretations visual capture, field rendering, low-quality readability still need acceptance. |
| Public application | Existing candidate appearance accepted by user; incomplete whole-actor sets have not been promoted in the release catalog. No final-art deployment is claimed. Decoded atlas memory/real-device performance and final save traversal still need review. |
| Other regions | Not expanded: the explicit two-scene quality gate has not passed. |

Large 8-direction combat atlases were inspected and rejected for cross-cell sword clipping and incorrect facings. A revised full atlas still failed. These are not silently relabelled as complete motion. The superseded east-only strip reproduced boundary failures in three frames; its replacement passes the boundary test. New sheets are still candidate artwork and do not clear the full animation or P0 gate.
