# Production progress — 2026-09-29

Base: `3463a8df421a8ab0ff03163655d2bcf4ab3d30ec`. Branch: `codex/art-vertical-slice`.

## Separate completion gates

| Gate | Status |
| --- | --- |
| Manifest, loader, binary packaging and byte-for-byte live verifier | Implemented; regression and review evidence below |
| Production art | BLOCKED_ART: only idle study candidates exist |
| Two vertical slices | Not integrated or visually approved |
| Publication of this art pass | Not pushed or deployed |

All 12 required P0 entries in `assets/art/manifest.json` deliberately remain BLOCKED_ART. Passing code tests does not approve an image. Candidate catalogs and images are only served through explicit local art review; they are excluded from Pages output.

## References and source provenance

User-provided `ssanggye-codex-art-production-handoff-v09.zip` was extracted without overwriting tracked, newer main documentation. Read CODEX_START_HERE and opened R16 → R01 → R02 → R03 in that order. Concept boards were not installed as runtime art.

Built-in image generation created these new, whole-body, alpha-background studies. Original generated files are retained outside the repository. Each world was generated independently; there are no cropped heads attached to shared bodies.

| Candidate path below assets/art | Generation ID | Current limitations |
| --- | --- | --- |
| reality/hero/yunseo/idle-candidate-v1.png | exec-03f2193d-9d6b-4f9a-98ed-be899b884987 | Eight directions only; no animation, sockets, portraits or visual approval |
| murim/hero/yunseo/idle-candidate-v1.png | exec-65165405-ea47-4fd5-b6b3-1ea8d1a7c27f | Eight directions only; equipment continuity and alpha edges need review |
| reality/npc/seorin/idle-candidate-v1.png | exec-5ae62b52-f70a-4655-bd94-88293b71751c | Four directions only; field-scale and handedness review pending |
| murim/npc/baekryun/idle-candidate-v1.png | exec-28188131-b48b-43f7-a802-5b76bf369adf | REJECTED_VISUAL: top hair touches image boundary; regenerate with real margin |

Prompt intent: independent adult, painterly full-body game sprites on genuine transparent background; reality tactical/navy equipment versus murim layered robes; regular directional grid; no scene, labels, interface, contact sheet decoration or concept-board cropping. NPC prompts requested 12% margin, which Baekryun did not satisfy. Requesting a feature from the generator is not evidence that it was produced.

Hero sheets returned 1774×887 rather than the requested 1024×512. Frame rectangles use the actual decoded dimensions. Alpha is genuinely zero outside figures, but many interior pixels are 252–253, not 255. Browser validation checks near-opaque pixels (>=250), not a false assumption of fully opaque interiors.

## Evidence

- Baseline: 166 Node tests passed before edits.
- Pipeline, legacy rules/save tests: 175 passed after the review regression fix; all 27 runtime/build JavaScript files pass syntax checks.
- Python live verifier: two tests passed, including a tampered binary despite matching build-info.
- Real Chromium: 16 hero views, decoded image reuse, missing-file BLOCKED_ART/retry, mobile width, and unchanged city/village game load passed; no page errors.
- Local captures: `.superpowers/art-production/evidence/hero-idle-candidates.png`, `art-review-mobile.png`, `before-reality-base.png`, `before-murim-village.png`. These are candidate viewer / BEFORE captures, not completed vertical slices.
- Independent code review found Windows `Assets` versus web `assets` Git path casing, and mutable validated catalog references. The Git index now records exact lowercase `assets/art` paths without renaming Unity folders; the validated catalog is deeply frozen with a regression test. Real Chromium checks passed again after these fixes.

## Next gates

Task 2 requires idle/walk/dodge/attack1–3/cast/hit and portraits for both heroes, socket/contact metadata, eight-direction and combo captures. Do not substitute idle frames for missing combat animation. Body, hands, weapon and VFX must use the same simulation-authoritative action instance. NPC, environment, enemies and VFX tasks remain incomplete. Do not expand to the other ten regions before the two P0 scenes pass visual review.
