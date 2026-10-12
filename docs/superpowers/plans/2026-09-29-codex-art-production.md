# Ssanggye Production Art Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace v0.8 procedural/mixed placeholder art with world-specific production assets and synchronized combat presentation without changing existing combat/progression rules.

**Architecture:** Add a manifest-backed binary art pipeline and entity-specific resolution keyed by world/entity/action/facing. Keep game simulation authoritative; presentation consumes action state and sockets. Establish two vertical-slice scenes first, then propagate the system to all existing areas.

**Tech Stack:** Vanilla JS, Canvas 2D, WebP/PNG/JSON atlases, Node test runner, Playwright Chromium, GitHub Pages.

**Spec:** `docs/codex-art-handoff/00_READ_FIRST.md` through `07_DONE_CRITERIA.md` and `references/manifest.json`.

## Global Constraints
- Preserve 12 areas, 5 chapters, save version 6 migration, combat numbers and timing unless a separate bug proves otherwise.
- Never silently substitute art from the other world.
- Concept references are direction only; not runtime-ready assets.
- Preserve the simulation disclosure text exactly.
- All new binary runtime assets must be copied and hashed by Pages build.

## Review Focus
- Missing asset on a slow network must not cause cross-world fallback or crash.
- Old saves entering any existing area must resolve valid world-specific art.
- Contact frames must stay aligned with simulation damage after FPS drops.
- Reduced-motion/low-quality settings alter presentation only.
- Mobile landscape must not hide essential controls.

### Task 1: Art manifest and binary deployment pipeline
**Files:** create `assets/art/manifest.json`, `art-loader.js`; modify `scripts/build-site.cjs`, `scripts/check-live.py`, `index.html`; test `tests/art-manifest.test.cjs`, `tests/site-build.test.cjs`.
- [ ] Write failing tests for P0 IDs and binary copying/hashes.
- [ ] Verify failure.
- [ ] Implement loader/cache/build copying.
- [ ] Run tests and check.
- [ ] Commit.

### Task 2: Reality/Murim hero asset separation
- [ ] Add failing tests for both world hero sets and no cross-world fallback.
- [ ] Add socket/contact metadata tests.
- [ ] Integrate idle/walk/dodge/attack1-3/cast/hit and portraits.
- [ ] Capture 8-direction and combo evidence.
- [ ] Commit.

### Task 3: Core NPC asset separation
- [ ] Unique IDs for Seorin, Dogyeom, supply, Baekryun, Yeonhwa and representative common NPC.
- [ ] Field + portrait assets.
- [ ] Verify dialogue portrait equals field identity.
- [ ] Commit.

### Task 4: P0 environments and portals
- [ ] Reality base and murim village resolve different architecture families.
- [ ] Ground/buildings/props/depth layers.
- [ ] Portal locked/available/active/transition.
- [ ] Capture both scenes and portal comparison.
- [ ] Commit.

### Task 5: Existing enemy world separation
- [ ] Map currently spawned enemy IDs.
- [ ] Test no ID resolves to other-world family.
- [ ] Add idle/move/telegraph/attack/hit/death.
- [ ] Keep concept-only enemies unspawned.
- [ ] Commit.

### Task 6: Current combat/VFX production pass
- [ ] Tests for action-instance binding and stationary field/echo semantics.
- [ ] Common attack/moon/storm/dash.
- [ ] 9 personal martial skills.
- [ ] 6 interpretations.
- [ ] Low quality and reduced motion.
- [ ] Capture evidence.
- [ ] Commit.

### Task 7: Production UI pass
- [ ] Browser assertions for disclosure/tab/mobile non-overlap.
- [ ] HUD/dialog/minimap/quest/news/journal art.
- [ ] Preserve exact disclosure and five tabs.
- [ ] Capture desktop/mobile evidence.
- [ ] Commit.

### Task 8: Discovery onboarding polish
- [ ] State-aware H guide and no reward from help alone.
- [ ] Improve B/E/N feedback and next-action cue.
- [ ] Verify old/new saves and three discovery families.
- [ ] Commit.

### Task 9: Propagate to remaining existing areas
- [ ] Mapping checklist for all 12 areas.
- [ ] Replace remaining production placeholders.
- [ ] Visual traversal browser test.
- [ ] Commit.

### Task 10: Final regression and Pages publication
- [ ] Run `npm run check && npm test`.
- [ ] Run existing Playwright + visual suite at desktop and 390x844 / 360x640 / 844x390.
- [ ] Review against `07_DONE_CRITERIA.md`.
- [ ] Push only after full suite green.
- [ ] Verify Pages build-info and art/runtime hashes.
- [ ] Record unverified real-device work.
