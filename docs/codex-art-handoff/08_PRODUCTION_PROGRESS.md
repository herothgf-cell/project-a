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

## Action-clock foundation (Task 2 partial)

`presentation.js` creates immutable action instances shared by body and newly emitted visuals; immediate common attacks record the simulation contact time. IDs are transient and not saved. Released slashes retain their emission coordinates instead of following a walking player. Their geometry samples the body action clock, not a differently scaled effect lifetime. Body recovery still ends on time; lingering waves retain terminal geometry to avoid a backwards snap. Simulation damage, costs, cooldowns, delayed hit schedules and save version are untouched.

Unit regressions cover shared hand/tip timing, repeated actions, fixed emission origin, read-only rendering and the ripple wave duration boundary. Real Chrome keyboard input confirms matching action IDs and phases. This does not establish production sprite sockets, delayed-skill visuals or animation approval.

After this change: all 178 Node tests pass. The existing `v08_browser.py` passes all seven HTTP/native-storage scenarios in real Chrome, including 390×844, 360×640, 844×390 and reduced motion, with no page errors. On Korean Windows it was run with `PYTHONUTF8=1`; Playwright dependencies are isolated in the ignored `.superpowers/art-production/python-deps` directory. The independent reviewer reran all 15 presentation tests and confirmed the wave-boundary fix. The full seven-script final-release browser suite has not yet been rerun; this is not final release evidence.

Another generated Murim three-combo study (`exec-0d541381-0fd9-4a87-804b-3b0cbbf3b0a5`) was visually rejected: uneven cell margins, blade near cell boundary, inconsistent facing and lower-row foot spacing. It is retained in the generation archive, not included in the runtime catalog. The prompt requested twelve full-body frames in a 4×3 grid, independent contact/follow-through/recovery/ready poses, 15% margins and no VFX. Those constraints were not all satisfied.

## 07_DONE_CRITERIA assessment

### 2026-09-30 continuation — approval and local playable candidates

The user approved work to date and directed continuation. This records direction/work acceptance, not approval of frames that do not yet exist. Task 2 remains in progress; Tasks 3–10 are not complete. Neither P0 scene meets the final visual criteria yet.

Independent full-body hero assets are now connected in **local-only** `/art-play.html`: eight idle directions, six southeast walk frames and four southeast attack1 frames per world. Production `/` and the Pages bundle do not include these candidate scripts/images. Missing clips remain explicitly labelled BLOCKED_ART in the development preview; no other-world actor or idle-as-attack substitution is used by the catalog. The preview's tiny socket-following slash is a timing diagnostic, **not final skill VFX**.

| Workspace path under assets/art | Generation ID | Status |
| --- | --- | --- |
| reality/hero/yunseo/walk-se-candidate-v1.png | exec-15f95e97-ee54-47b1-a550-5e8e8bc1361c | Candidate; loop seam/foot planting pending |
| murim/hero/yunseo/walk-se-candidate-v2.png | exec-e9cdb9e5-e6e3-441e-974f-4713573ee937 | Candidate; opposite-leg cycle quality pending |
| reality/hero/yunseo/attack1-se-candidate-v1.png | exec-afbfcb61-f51a-4778-aae8-b6ba1bdea8e6 | Candidate; provisional frame-local sockets |
| murim/hero/yunseo/attack1-se-candidate-v1.png | exec-83b78385-b515-4175-bff1-a93bdb5bd1a0 | Candidate; provisional frame-local sockets |
| reality/hero/yunseo/portraits-candidate-v1.png | exec-f74bc1f2-9751-4486-9b5f-7d9a4c079204 | Neutral/focus/hurt/slight-smile; candidate alpha-edge review |
| murim/hero/yunseo/portraits-candidate-v2.png | exec-dcbea625-8379-4106-acb0-88ee599277fb | Same four expressions; padding correction of rejected cropped-topknot v1 |

Generated with the built-in image tool, originals retained. Prompt set: `09_GENERATION_PROMPTS.json`. No image processing substituted a cropped head or repurposed a reference board. Transparent background was checked by alpha rather than hidden RGB appearance.

Rejected further combo studies (not copied into the runtime catalog): reality attack2 `exec-1822bd81-9895-471a-b7c4-a309be323de4` changes sword hand across frames and has insufficient top padding; reality attack3 `exec-570dc747-c92f-420b-98f4-3f7c53669693`, murim attack2 `exec-45b49414-d65f-4aa7-8130-a1d021b177d0` and murim attack3 `exec-0d48eb4b-d66f-41d2-86b1-09dc8ff5fae6` rotate away from the intended consistent facing and/or leave blade margins too tight. They require another art pass, not a metadata-only approval.

New review controls play walk/attack1, scrub individual frames, mark foot/hand/blade/effect sockets and explicitly show missing attack2/3. Real Chromium verifies the missing action does not reuse attack1. The production gate also rejects an approved idle-only hero lacking full clip counts, sockets, immediate contact and portraits.

Portrait candidates now resolve independently by world/expression in the local game HUD/dialog renderer. Real Chromium verifies reality → murim changes HUD identity and explicit hurt expression selection; the field-body renderer never consumes a portrait clip. The initially generated murim portrait `exec-b63c2eb8-efb6-4b30-82b8-a8a7590e7b0d` clipped the topknot and was rejected, then corrected using the image tool. Final portrait alpha edges, framing and in-dialog visual review remain pending.

Evidence: `preview-reality-full-body.png`, `preview-murim-full-body.png`, `preview-murim-contact.png`, `hero-contact-socket-review.png` under `.superpowers/art-production/evidence/`. These are **development captures**, with legacy environments/NPCs still visible. Actual enemy hit remains damage 22 and immediate contact; body/effect select the same frame and elapsed time. Existing v0.8 browser regression was rerun after the renderer adapter changed: all seven scenarios passed, including three mobile sizes and reduced motion, no page errors. No candidate art push or deployment has been performed.

No visual completion box is checked yet. Current screenshots of hunter base and village are BEFORE/development captures. The comparison viewer now includes SE walk/attack1, but not complete eight-direction walking or three-combo video evidence. NPC portrait consistency, all skill captures, production environments/enemies/portals, mobile final-art review and live art hashes are still missing. Consequently this pass is **BLOCKED_ART**, not a completed vertical slice and not a published graphics release.
