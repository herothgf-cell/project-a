# Continuation — 2026-09-30

This is a partial implementation checkpoint, not final release approval or completion of the user's entire request. Existing user art acceptance remains valid; no renewed approval is requested.

## Implemented in this checkpoint

- Persistent seal/ultimate-seal and interpreted ripple guard artwork reads the actual live field. The initial burst may expire while the field artwork stays at its original location; it disappears when the authoritative field expires. Normal/reduced quality share simulation. Legacy production field drawing remains the fallback; candidate field hooks are local-preview only.
- East dodge: separate modern hunter and martial swordsman whole-body sheets, four frames each, 0.22-second shared presentation clock, no contact/damage frames. The first drafts were corrected for framing/direction. Reality uses a 627-pixel column split; murim uses 655 pixels to retain the complete sword. Alpha-boundary audits pass eight frames. Pivots, hand/blade sockets and display scale are provisional: passing an alpha test is not foot-slide/pose-continuity approval.
- v06 browser regression race corrected with condition waits for the actual victory dialog before dismissing it. Fixture damage changes chapter state before the next render/event frame opens the modal. The old harness could teleport and press E while a late victory dialog was open. Production progression/input rules were not changed to accommodate the test.
- Actual combat capture matrix now includes common attack 1/2/3, moon, storm and dash, nine personal skills and six interpretations: 21 cases. Four persistent-field cases also capture sustain after the cast burst expires and verify removal after expiration.

## Evidence

- Final local verification in this checkpoint: 227 Node tests passed; four Python alpha-audit tests passed; configured JavaScript syntax checks and additional preview/runtime checks passed; `git diff --check` passed (line-ending warnings only).

- `tests/art-dodge-motion.test.cjs`: two missing-clip failures reproduced before integration, then passing.
- `tests/art-vfx.test.cjs`: missing field visual and wrong-family cases reproduced before implementation, then passing.
- `tests/art-skill-matrix.browser.cjs`: missing sustained candidate field reproduced in the actual browser before implementation. 21 cases pass in normal and reduced motion, identical damage, zero page errors. Captures under `.superpowers/art-production/evidence/skill-matrix/` and `skill-matrix-reduced/`.
- `tests/art-dodge.browser.cjs`: real Space input in both worlds resolves east dodge, returns to idle, gallery captures all eight frames; zero page errors. Evidence: `.superpowers/art-production/evidence/dodge-east/`.
- `tests/v06_browser.py` candidate route: nine checks pass after the permanent harness correction, including all three paths' native-storage save/continue and mobile 390x844, 360x640, 844x390 multitouch/cancellation.
- Independent compatibility audit also passed v08 candidate/normal seven checks each; candidate smoke eight checks including migration and corrupt-save preservation; condition-corrected diagnostic v06 candidate twice and normal once. Full audit: `.superpowers/sdd/2026-09-29-codex-art-production/compatibility-audit.md`.

## Remaining release gates

1. **Hero candidate action coverage is now eight-direction for attack1/attack2/attack3/dodge/cast/hit**, with separate whole-body sheets in each world. This is not final approval. Final scale, foot, handedness, equipment and recovery continuity corrections are still required.
2. P0 geometry/depth/portal clipping and scene-wide visual polish; no expansion gate passed.
3. Four enemy families' extra directions, weapon clipping and death continuity.
4. All conditional failure cases, full FPS-drop/readability review and VFX footprint alignment with combat ranges. Candidate artwork is not declared pixel-exact telegraph coverage.
5. Physical-device/Safari, sustained low-end performance and decoded texture-memory checks remain unverified. Emulated Chrome viewport/touch checks are not physical-device evidence.
6. Final `07_DONE_CRITERIA.md` review, eligible art promotion, reviewed commit/main integration/push and Pages hash verification. No new publication in this checkpoint.
7. Other ten areas remain gated behind the two P0 scenes.

No gameplay numbers, cooldowns, damage timing or save format were intentionally changed. Do not relabel missing assets as approved simply because the user accepted existing candidates.

## Further continuation: combo direction coverage

Latest continuation: cast and hit candidates added in both worlds (28 sheets). Cast and hit missing-direction tests each observed RED before integration, then GREEN14. Latest full Node suite295/295. Chromium cast/hit tests each capture32frames across8facings per world, zero page errors. Hit tests exercise actual damage and invulnerability, then idle return. Alpha audits pass the new frame boundaries, not final visual quality. Provenance33–36 preserves exact built-in generation prompts and workspace paths. No new commit, push or deployment.

Fourteen attack3 clips were added as local candidates, with independent whole-body sheets per world/facing and provisional manual sockets. Missing catalog cases failed before integration and then passed. All 267 Node tests pass. Real Chromium attack3 inputs resolve eight facings and capture 32 frames per world with no page errors; current combo-3 damage remains 37 in the fixture. All 28 new murim frame boundaries pass the alpha audit, which does not approve visual quality. Murim NW uses a two-handed finishing grip after a rejected hand-switching draft; west follow-through handedness and east recovery facing remain explicit visual-review issues. Provenance: 31_REALITY_ATTACK3_OUTPUTS.json and 32_MURIM_ATTACK3_OUTPUTS.json. No new commit, push or deployment.
