# Approved continuation checkpoint — 2026-09-30

User acceptance is recorded in 19_USER_APPROVAL.md. No repeat approval is needed simply to continue production. This checkpoint is partial, not completion of all requested work.

## Newly implemented

- Reality hero attack1: seven independent whole-body directional sheets (28 frames), with original SE retained. Both world heroes now resolve all eight attack1 directions. Right-hand/facing defects in reality NW were revised before integration.
- Exact action/facing resolution, contact on first frame, total 0.3-second animation, provisional foot/hand/blade sockets. No gameplay damage or save changes in this checkpoint.
- Ground-plane seal/parry/guard effects no longer tilt with attack direction; released directional slashes preserve their recorded angle.
- Seal and ripple VFX atlases revised to prevent cross-cell contamination. Ripple row split is y=700, preserving the whole burst; eight VFX cells pass the alpha boundary check.
- Browser matrix fires the actual nine personal skills and six interpretations. Replay includes preparation and delayed contact. No synthetic effect insertion is used.

## Verification

- Node suite: 224 passing, zero failures.
- Python alpha boundary suite: four passing tests; old seal/ripple reproduced five failing cells before correction.
- Reality and murim browser attack tests: eight real-input directions each; damage and body/effect frame/elapsed match; 32 gallery captures per world; zero page errors.
- Existing art-review and four-scene browser regressions passed before the VFX-only correction.
- 15-skill/interpretation matrix passes with normal motion and reduced motion (quality zero); actual damage equal in both runs; zero page errors.
- Actual captures inspected: reality east combat, NW frame; replay, hold field and ripple ultimate. Rerendered fields remain level and no longer show adjacent atlas fragments.
- These checks do not establish real-device performance or all animation continuity. Test fixtures use valid loadable progression/training and normal maximum MP; fixtures are not user saves.

## Remaining, without another creative-approval pause

1. 70 absent hero action/facing combinations: attack2, attack3, dodge, cast, hit × seven facings × two worlds. Review planted boot, handedness, scale, recovery and idle/walk continuity.
2. P0 base/village geometry, depth, portal antenna clipping and interaction presentation. Existing candidate artwork accepted; technical gaps remain.
3. Four enemy families: additional directions, weapon clipping and complete death continuity.
4. Remaining common-skill captures, persistent field presentation, all VFX readability and timing under frame drops. The new 15-case matrix does not cover every conditional failure path or full-duration field.
5. Mobile sizes, low-end hardware/decoded texture memory, full save traversal, final 07 criteria review, eligible-art promotion, commit/main/push and verified Pages publication.
6. Other ten areas only after the two-scene completion gate.

No candidate release promotion, commit, push or deployment in this checkpoint. BLOCKED_ART now denotes actual missing/technically unfinished work, not waiting for the user's creative acceptance.

## Evidence / provenance

- `.superpowers/art-production/evidence/attack1-directions-reality/`
- `.superpowers/art-production/evidence/skill-matrix/`
- `.superpowers/art-production/evidence/skill-matrix-reduced/`
- `20_REALITY_ATTACK_PROMPTS.json` and `21_VFX_BOUNDARY_PROMPTS.json` record built-in generation and correction prompts. All selected PNGs are in the repository's `assets/art/` tree; source images were preserved.
