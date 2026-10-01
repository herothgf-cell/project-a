# Repository workflow

- Work directly on `main` unless the user explicitly requests a different branch.
- Do not create additional branches or worktrees without an explicit user request.
- Before an authorized release, fetch and integrate the latest remote `main`, verify the merged result, then push `main` to trigger the existing Pages workflow.
- Do not push or deploy unless requested. Preserve unrelated local files and changes.
