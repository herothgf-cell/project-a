# Prototype release scope — 2026-09-30

User explicitly requested simplified treatment of the ten remaining existing areas, committing current work, merging/pushing main, deployment, and removal of merged branches.

This supersedes the previous requirement to finish production-quality P0 art before any prototype publication. It does not certify final artwork or satisfy every item in 07_DONE_CRITERIA.md.

## Public routes

- `index.html`: existing stable entry and save behavior, unchanged by candidate packaging.
- `art-play.html`: explicitly labeled prototype using current independent world/actor candidates.
- `art-review.html`: candidate comparison, not final-art approval.

The deployment build explicitly uses `--include-prototype`; ordinary builds still exclude candidates. Production approval gates remain intact. Every prototype catalog and referenced binary is copied and hashed. Source boards, documents, rejected/unreferenced outputs and local Unity folders are not published.

## Simplified area scope

All twelve existing areas retain their collision geometry, progression, points, enemies and combat rules. Hunter base and Cheongun use the current P0 candidates. Forest, rift, ruins, harbor, sanctum, heart, returnPass, returnDock, archive and station use available same-world art plus existing procedural presentation where a required asset/direction is absent. No new maps, encounters, unique area-art packs or cross-world substitutions are introduced.

Missing directional or location-specific final artwork remains BLOCKED_ART, not a blocker to this explicitly simplified prototype release. Hero candidates cover eight directions; enemy candidates cover SE for all eight kinds plus NW for bandit/shade. Further animation quality, hand/weapon sockets for idle/walk, device performance and final scene polish remain open.

## Verification and corrections

- Before release changes: 352 Node tests passed.
- Guardian v3 atlas boundaries: nine failures reproduced; metadata now follows actual transparent gutters; all seven Python frame-audit tests pass. Boundary clearance is not animation approval.
- Boss browser fixture previously left existing seals uncleared, correctly preventing movement. Fixture now activates the seals before sampling; gameplay rules are unchanged.
- Packaged prototype gallery at `/project-a/` reproduced a broken absolute play link. Fixed to a relative URL; regression exercises actual packaged bytes.
- Fresh independent review found no critical issue or save/combat regression; 66 focused tests passed. Final artwork quality and physical-device performance were not certified.

Do not interpret prototype deployment as final completion of the original production-art plan.

## Final local verification for this prototype checkpoint

- Syntax checks and Node suite: 353/353 pass.
- Read-only PNG/frame checks: 7/7 pass.
- Packaged `/project-a/` route: gallery links, all twelve areas and three viewport captures pass without page errors.
- v0.8 HTTP/native-storage browser suite: 7/7 on both normal and candidate entry, including 390×844, 360×640 and 844×390 controls/news/help.
- Actual skill matrix: 21 cases pass; actual guardian/tide six-state captures pass.
- Fresh reviewer navigation finding reproduced RED in packaged browser, relative-link fix GREEN. Physical-device performance and final art quality remain unverified. Serial live hash-check duration is a release risk to observe, not a claimed failure.
- Publication SHA and live hash receipt must be verified after pushing; this document does not pre-claim deployment success.
