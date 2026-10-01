# Growth and Discovery Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. User explicitly requested development of the discussed design; proceed without repeating approval questions.

**Goal:** Make acquired power legible and useful through an interactive martial tree, first-inheritance broadcast and one repeatable reality contract.
**Architecture:** Preserve the existing prototype chain; add progression.js after revision.js for derived mastery and version-8 contract state. Keep UI in focused tree/contract/presentation adapters. No online service.
**Tech Stack:** Vanilla JS/canvas/DOM, Node test runner, Playwright.
**Spec:** ../specs/2026-10-01-growth-discovery-design.md

## Global Constraints

Preserve old saves, 12 areas, five chapters and discovered skills. Mastery thresholds 5/10/20/30 grant +3% family damage each. Contract requires progress 6, four enemies, rewards 80 gold/100 XP/2 materials exactly once. First-inheritance notices are local and once per family. No public deployment in this turn.

## Review Focus

- Reload/retreat/death cannot duplicate contract rewards or corrupt progression.
- Mastery never multiplies unrelated damage or trial damage; old saves retain credit.
- Intro/replay cannot accept contracts or overwrite the original save.
- Selected interpretations stop repeating equip instructions; healing point is not a quest target.
- Unknown tree nodes do not leak hidden recipes; mobile controls and focus remain usable.

## Tasks

- [x] 1. Model TDD: tests/progression.test.cjs exercises damage boundaries, level notices, contract lifecycle and migration. Implement progression.js exports mastery(g,path), levelPreview(g), contract(g) and Game startContract/cancelContract/claimContract. RED then GREEN, full Node suite.
- [x] 2. Guidance and simplification: fix Presentation.guide equipped/exit states and archive objective. Remove companion runtime and other-journey/news UI while preserving save fields. Update behavioral regressions to the new explicit design.
- [x] 3. UI: martial-tree.js interactive nodes/details, contract-ui.js board, progression-ui.js level and inheritance notices; integrate GrowthUI, App and runtime package. Browser tests cover unknown/known/equipped, keyboard, contract claim, once-only banner and 390px layout.
- [x] 4. Documentation/version 0.10.0: updated Korean design and player guide, source-check scripts and deploy tests. Run full Node, browser suites, clean build, screenshot review and one independent code review. Keep branch local for user review.

## Execution ledger

Baseline ff1fa2d: 378 tests pass. Working in the existing checkout on codex/growth-discovery-v010; unrelated untracked Unity/art preserved. Native inline execution, no implementation subagents; final review only. Documentation lives in the repository so it matches code; original downloaded v2.0 document remains intact.

### Verification receipt — 2026-10-01

- Model RED/GREEN: initial new-feature assertions failed against revision.js; progression implementation and intentional adviser behavior changes made the suite pass. Outside-archive equipped guidance separately reproduced travel-loop failure, then passed after routing to the current story.
- Independent reviewer found two disclosure defects: ready family name and an unowned base skill exposed through a known variant. Both were corrected; browser regression now exercises unknown, ready-but-unaccepted, known-but-uninherited, inherited and equipped states. No other important review findings.
- Final Node suite: 393 tests, 393 pass, 0 fail. New progression suite contains 15 lifecycle/damage/guidance/compatibility/cap tests.
- HTTP/native-storage browser suites: browser_smoke, fate_browser, legend_browser, v06_browser, perf_browser, v07_browser, v08_browser passed. v08 explicitly checks the new contract button for control overlap at 390×844, 360×640 and 844×390.
- v09.browser.cjs passed: cold animation loading/world transitions/retry, intro rescue/skip/replay, inheritance and mobile growth.
- v010.browser.cjs passed: tree disclosure/equip/keyboard, local first-inheritance banner, next-step guidance, 390px layout, removed UI, contract start/kill/return/once-only claim and visible level-up stat deltas.
- Runtime syntax checks and git diff --check passed. Desktop/mobile tree, inheritance and contract screenshots inspected in .codex_doc_review/v010.
- Prototype packaging succeeded: version 0.10.0, 245 runtime assets. Local build uses the base SHA solely for packaging diagnostics; it is NOT a commit-addressed release. Existing candidate art remains unapproved (artReady:false), as with the prior prototype.
- A stale pre-existing server lacked the new runtime whitelist and caused an initial browser timeout. Fresh server reproduced no runtime failure; all HTTP suites were rerun on port 64010.
- README and Korean v2.1 design supplement updated. Downloaded v2.0 DOCX, original art and unrelated Unity files untouched.
- Branch retained locally, uncommitted; no push/deployment. Review server: http://127.0.0.1:64011/art-play.html.
