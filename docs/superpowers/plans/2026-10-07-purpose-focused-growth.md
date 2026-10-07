# Purpose-focused growth implementation plan

> **For agentic workers:** Use focused implementation and verification tasks; preserve file ownership during parallel work.

**Goal:** Ship the approved character, skills, realm and hunter separation with trustworthy resource receipts and individual skill mastery.

**Architecture:** Reuse BoundaryResonance, PassiveGrowth and Advancement for all calculations and transactions. CharacterUI owns stat allocation; a dedicated SkillsScreen owns technical detail and upgrades; GrowthScreen owns advancement only. App routes old entry points to the new canonical destinations.

**Tech Stack:** Vanilla JavaScript/CSS, Node test runner, Playwright, existing GitHub Pages workflow.

**Spec:** ../specs/2026-10-07-purpose-focused-growth-ui-design.md

## Global constraints
- Work directly on main; preserve unrelated dirty files. User authorized implementation, main push and deployment.
- Preserve legacy stats, rewards, family mastery, learned skills and save slots. Do not fabricate old individual mastery.
- Existing economy and story prerequisites remain authoritative. Purchases and reward receipts require successful persistence.
- Four direct top menu buttons, including discoverable locked advancement menus; mobile 2×2 layout.

## Review focus
- Old and malformed saves must load without invented individual mastery or duplicate rewards.
- Multi-hit/delayed skill actions must not count as repeated individual uses; no trial/comparison farming.
- Failed saves, rapid repeated clicks and navigation with drafts must preserve money and allocation.
- Off-world inspection must not change actual world/equipment or enable unsafe purchases.
- Long Korean labels, 360px screens and keyboard interaction must keep actions reachable.

## Task 1: Individual skill mastery
Files: world-growth.js, world-game.js, save-v10.js as necessary; tests/skill-mastery.test.cjs.
Interface: WorldGrowth.skillMastery(g, world, family, action) -> {value,max,tracked}; WorldGrowth.recordSkillMastery(g, world, family, action, token) records one effective action. Preserve family mastery and its bonus.
- [x] Write and observe failing old-save, effective-use, deduplication, world separation and restricted-mode tests.
- [x] Implement independent records for signature1/signature2/ultimate and normalize/persist them safely.
- [x] Run targeted model and combat tests; report exact interface and evidence.

## Task 2: Character stat workspace
Files: character-ui.js, character-growth.css, tests/character-growth.browser.cjs.
Interface: CharacterUI.create(existing options + commit); open(world?,source?); requestLeave(run) protects pending drafts.
- [x] Add browser checks for allocation, refund, zero balance, legacy cap, save failure and off-world viewing; observe failures.
- [x] Consolidate crystal and realm/hunter allocations, stat provenance and per-item history into character.
- [x] Preserve ratios and drafts on failed commit; accessible focus and mobile layout.
- [x] Verify targeted interactions.

## Task 3: Skill workspace
Files: skills-screen.js, skills-screen.css, tests/skills-screen.browser.cjs.
Interface: SkillsScreen.create({game,show,node,refresh,commit,close,notes}).open(world?,subject?). Consume Task 1 skillMastery.
- [x] Add browser checks for common/family upgrade, exclusive Q branches, story locks and individual mastery; observe failures.
- [x] Implement world/category/list/detail, actual effects and costs, upgrades, equipment/interpretations and reset using existing model APIs.
- [x] Preserve murim MartialTree discovery access and passive progression in the skills purpose.
- [x] Verify transactions, keyboard, mobile list/detail and old save messages.

## Task 4: Navigation, advancement and receipt integration
Files: app.js, index.html, development-ui.js, growth-screen.js, purpose-growth.css, personal-news.js, tests/purpose-growth.test.cjs, tests/purpose-growth.browser.cjs.
- [x] Add failing routing and story unlock checks.
- [x] Route top-level/legacy entry points to canonical purposes, guard drafts when closing/navigating.
- [x] Keep realm/hunter story previews visible and separate menu unlocking from qualification; remove point allocation from advancement.
- [x] Move resonance challenges/goals into missions, item records into relevant spending views; show persisted reward toast and persistent balances/NEW.
- [x] Integrate Tasks 1–3 and run end-to-end checks.

## Task 5: Review and release
Files: version/cache references, release documentation and regression checks affected by intentionally replaced UI.
- [x] Run all unit tests, relevant browser suites, packaged-site tests and responsive visual inspection.
- [x] Independent review of combined diff; fix material findings with regressions.
- [ ] Fetch/integrate origin/main, verify resulting code, commit only task-owned files, push main.
- [ ] Verify Actions build/deploy and live build identity, report deployed URL and commit.

## Execution ledger
- Baseline 3f66f38 (v0.12.5). Existing design approved by request to perform all development.
- Parallel file ownership: mastery model, character workspace, skills workspace. Root owns app/navigation/advancement/receipt integration and release. No overlapping writes.
- Ruling: retain main and existing working directory per AGENTS.md; no extra worktree or branch.
- Ruling: proceed from accepted design without another design/plan approval, per explicit user request to complete all work.

- Final local verification: 738 unit tests and all 42 workflow JavaScript browser suites passed. Follow-up theme/receipt fixes passed purpose, skills, UI and resource-warning checks.
- Independent review found draft-navigation stale state, outer mobile scroll restoration, and parry interpretation mastery omissions; all fixed with targeted regression coverage.
- Notebook equipment mutations now route to the canonical skills workspace. Archive interpretation access remains available; combat/trial and paid upgrade restrictions remain enforced.
- Remote main fetched again before release: unchanged at 3f66f38aa3b4cf021c4819046891163ff6d4f84a. Release version 0.12.6.
- Visual inspection: desktop, 360px mobile and 200% text scaling. Corrected inherited dark skill text and receipt CSS specificity so menus/combat remain reachable.
- Packaging verification: 75 JavaScript syntax checks passed; existing prototype release packaging produced 550 runtime assets. Existing art approval state and deployment mode are unchanged.
