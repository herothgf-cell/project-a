# v0.3 verification and delivery notes

## Local evidence (2026-09-25)
- Base main inspected: 0beef1fa46235f6bcac55bea89e2beac2e86a698.
- Base game.js snapshot matched Git blob 93146081f09df2e07c8f484aa37c091fbf51f8b6 exactly; original 5 core tests passed.
- Rules regression tests against base: 15 failures / 20, then fixed.
- Chapter expansion checks against base: 4 failures / 5, then full two-chapter journey passes.
- Final `npm test`: 33 tests passed, 0 failed. Existing core/server/hidden-screen contracts retained.
- `npm run check`: world/game/art/render/app/server syntax passes under Node 22.16.0.
- Chromium UI: 8 check groups passed, no page/runtime console errors. Desktop 1440×900 and touch emulation 390×844, 360×640, 844×390. Six areas drawn; combo hold/release, multi-touch/cancel/live modal interruption, boss HUD, cooldown, target label, retreat and save adapter exercised.

## Important verification limits
The container cannot resolve github.com for git clone. Sources were read using the connected GitHub tools. Chromium HTTP navigation to the local test server was blocked by the environment administrator. No browser policy was changed. Browser tests here used generated local assets in an offline document; a clearly marked in-memory Storage shim tested save-adapter behavior, NOT persistence across real browser restarts. The Node HTTP server tests used real HTTP separately.

The checked-in workflow runs the same browser tests against a real HTTP origin with native browser localStorage on GitHub Actions before deployment. This document does not claim a CI run has passed; inspect the workflow for its actual result. Real iOS/Safari device behavior and cross-device play sessions still require user testing. Saves are local to each browser; file export/import is the supported transfer method.

## Review and decisions
Final review: self-review (no subagent/reviewer tool available). No independent review is claimed.

1. Autonomous scope: user explicitly asked to improve guidance/combat, then handle graphics and chapter expansion without another approval loop. Chosen result: six areas, two chapters, original vector illustrations, same static/free Pages architecture. A commercial-quality art pipeline and additional chapters are outside this release.
2. Isolated connector snapshot: container git clone unavailable; assembled/verified files locally, publish through GitHub tools. Non-force main update only; no history rewrite.
3. Corrected test assumption: a protected boss cannot attack, but nearby guards can. Regression asserts boss attacks remain zero, rather than incorrectly requiring all player HP to remain full beside active guards.
4. Chapter definitions share the same state-machine/content boundary as first-chapter fixes; implemented in one tested model rather than duplicating the old minified rules.
5. Final review found object-prototype names accepted as actions. Added a failing `__proto__`/`constructor`/`toString` test, then fixed with own-property validation. Full suite passes afterward.
6. Browser navigation limitation: offline UI tests locally, real-origin browser tests in CI. No claim of real-device validation.

Deferred minor items: hand-authored vector art remains prototype art rather than a finished illustrated asset pack; no background music or voice acting; enemy routing uses local steering around simple rectangular collision footprints rather than global pathfinding. All spawn/objective positions are flood-fill reachability tested.
