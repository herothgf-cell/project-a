# v0.2 prototype restoration

2026-10-12

- Runtime, UI, story, tests and planning restored from `origin/v0.2_proto_patch`, commit `49859ea` (package version `0.12.4`).
- Previous development, including the pending field redesign proposal, is preserved on `codex/development-before-proto-rollback`, commit `d1c6e74`.
- The prototype branch was already an ancestor of main: ordinary merge returned “Already up to date”. This restoration is a new commit; no published history was rewritten.
- Repository workflow instructions and unrelated local review images were preserved.
- Intentional runtime difference: current/backup/test save slots use `proto49859ea` instead of `v02`. Existing development saves and backups remain untouched. Start a new game in the restored version; no automatic import of newer development saves is attempted. The old v0.12 import remains explicit and read-only for its source.
- Validation: 721 automatic tests; all three syntax suites; resonance, import, and navigation-followup Chrome tests passed. Deployment success is checked separately after push.
