# Martial element acquisition implementation plan

> Use superpowers:subagent-driven-development for the runtime task, then integrate and review the full feature.

**Goal:** Actual discovery, combat learning, and scenario rewards feed a permanent shared element inventory. Players choose owned elements manually. The local sequential route exercises every acquisition.

**Spec:** User-approved design in this conversation: form/qi from relics, flow from real combat skill, intent from scenario quests; no auto-filled recipes, optional decoding only reveals recipes; retain manual practice exit and easy combat.

**Architecture:** MartialTraining owns versioned inventory and composition. A separate MartialAcquisition module handles combat evidence and small in-world quests on existing maps. UI and local route use these APIs, never directly award rewards.

**Constraints:** Work on main. Preserve unrelated screenshots. Local route code stays outside public asset packaging. No release requested this turn. Keep completed legacy arts usable; discovering a new art never grants flow or intent.

- [x] Runtime: v3 state with axis inventory, flow counters and quest stages; strict validation and v1/v2 migration. Relics grant only first two axes; basic lessons grant their four starter elements; guidance reveals recipes only; owned matching recipes can succeed before full decoding.
- [x] Combat/scenario: dodge-counter, genuine telegraph escape, and storm during telegraph each count three successes. Ordinary combat and dedicated acquisition exercises qualify; ordinary practice targets do not. Village quest briefing leads to sanctum defense (three foes), rescue (clear guards, rescue person, reach exit), or sealing (clear guards, activate three seals); report at village grants intent once. Keep records separate from temporary sessions.
- [x] UI: show every required element, ownership, exact source and progress; global inventory by axis, blank manual selectors; missing elements explain acquisition route. Acquisition sessions have on-field objectives and explicit return.
- [x] Local route: sword/thunder, then each art's relic, flow, quest, composition/proof, followed by creations and reality; never grant acquisition merely by moving.
- [x] Verification: model evidence/negative cases/migration/reload and full browser UI route with manual completion, source display, no automatic filling, mobile viewport; final independent review.

Ruling: use short dedicated sanctum encounters accessible from the village training menu for the three side quests; this makes the approved story goals playable without altering main-story quest progression. Flow is also available through normal field combat.

Verification: 788 node tests passed; normal game and local 20-stage browser flows passed with actual key actions; keyboard regression and 4 public-builder tests passed; desktop/mobile acquisition UI inspected. Independent review found no substantive issues. No push or deployment.
