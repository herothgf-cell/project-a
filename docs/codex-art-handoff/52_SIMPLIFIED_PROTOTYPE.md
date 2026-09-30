# 52. Simplified prototype and art continuity — 2026-09-30

## Scope and status
The user approved prototype simplification and requested a fix for retired temporary art reappearing. This is **prototype implementation complete**, not completion of the original final-art criteria in 07_DONE_CRITERIA.md. No candidate is promoted to approved.

- Hero: eight art facings; free movement unchanged. Prototype profile uses four walk poses and two hit poses with the original total durations. Attacks, casts, dodges, action instances, contact clocks, damage, cooldowns and saves are unchanged.
- NPCs: existing independent full-body and portrait assets; no new walk/attack cycles.
- General enemies (bandit/masked/shade/drone): four render facings. Own SE and NW source art plus whole-body reflections for SW/NE; reflected pivots and sockets. Masked/drone rear art is six single key poses, not six complete animation cycles. Boss direction simplification remains explicit.
- Existing twelve regions: same-world environment reuse; not twelve bespoke art sets. Stone patches represent rock blockers; temple ruins reuse temple architecture; harbor containers reuse cargo crates. Water and gameplay markers remain simplified.
- Loading: known new assets never fall back to retired human, portrait, building or portal renderers. Resident same-identity poses may be held; missing directions use the nearest existing same-action pose and expose substitution diagnostics. Initial loading uses a covered canvas. Failures offer retry.
- Public prototype build now serves new art at both index.html and art-play.html. Script/style URLs include the build commit. Art JSON is revalidated. Normal non-prototype builds retain the stable path.

## Evidence
- 365 Node tests passed; 8 read-only Python alpha/crop checks passed.
- Actual packaged project-subpath traversal: 12 areas and three mobile viewports, no page errors. Captures now wait for hero and ground-art readiness.
- Actual general-enemy matrix: 4 kinds × 4 directions × 6 states = 96 state checks, no page errors and no substituted pose accepted by assertions.
- Actual skill matrix: 21 cases, no page errors.
- v0.8 browser UI / native storage route: 7 checks, including mobile and reduced motion.
- Shared real attack body/effect clocks and unchanged 22/24/37 combo damage checked in both worlds.
- Delayed bootstrap/action/world loading test verifies no retired renderer; image retry/residency tests preserve the 128 MiB decoded-pixel budget.
- Runtime review found semantic block mapping errors; corrected with world/kind mapping and regression coverage.
- Captures: .superpowers/art-production/evidence/prototype/, enemy-<kind>-<facing>/, consistency-v08/. These are local evidence, not shipped art.

## Remaining final-art limitations (not hidden by prototype approval)
- Precise planted-foot gait and all directional anatomy/weapon continuity still need final frame-by-frame animation polish.
- Rear key poses and mirrored enemy views are a deliberate prototype reduction.
- Region-unique buildings, terrain, water, and detailed boss directions are not produced by same-world reuse.
- Candidates stay candidate; final-art release gate remains BLOCKED_ART. Functional completion, candidate production, technical/visual spot checks, and deployment are separate statuses.
- Deployment is verified separately by the release workflow and live commit/hash receipt; this document is not a deployment receipt.

Image-generation prompts and accepted/rejected disposition: 53_SIMPLIFIED_ART_PROVENANCE.json.
