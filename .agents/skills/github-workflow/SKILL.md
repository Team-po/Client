---
name: github-workflow
description: "Handles the repository's GitHub delivery workflow end to end: issue creation, issue-number-linked branch creation, validation, conventional commit, push, and pull request creation."
user-invocable: false
---

# GitHub Workflow

Use this skill when the user wants the repository change wrapped up into GitHub artifacts, especially requests like:

- "이슈 생성/브랜치/커밋/pr까지 진행"
- "브랜치 이름 바꾸고 PR 열어줘"
- "이 작업 이슈랑 커밋까지 정리해줘"

Keep the flow non-interactive and repository-safe.

## Preconditions

1. Check local state first.
   - `git status --short --branch`
   - `git remote -v`
   - `git log --oneline -5`
2. If there are unrelated staged or modified files, do not revert them. Scope the workflow only to the user-requested change.
3. Check GitHub CLI auth before remote work.
   - `gh auth status`
4. If network access or auth blocks the workflow, continue as far as possible locally, then surface the exact blocker.
5. Run all `gh` commands outside the sandbox (with escalation in this environment).

## Required Validation

Before committing non-trivial work, run the repository validation commands from `AGENTS.md`:

- `pnpm tsc --noEmit`
- `pnpm biome lint .`
- `pnpm build`

Report pass/fail status in the final handoff and include the same validation list in the PR body.

## Workflow

1. Summarize the change in one line and identify the conventional commit type.
   - Use `feat(<domain>): ...`, `fix(<domain>): ...`, or `chore: ...`
2. Create the GitHub issue (required for full workflow).
   - Prefer a concise title matching the change.
   - Use a body with `Summary` and `Validation` sections.
   - Capture issue number from the creation result.
3. Create issue-numbered branch name and check out branch.
   - Branch format: `type/<issue-number>-<short-kebab-summary>`
   - Example: `feat/123-team-po-fourth-deck`
   - Command: `git checkout -b <branch-name>`
4. Stage only intended files.
   - `git add <paths...>`
5. Commit with a conventional message.
   - `git commit -m "<type(scope): summary>"`
6. Push branch.
   - `git push -u origin <branch-name>`
7. Create the PR.
   - Base branch is usually `main` unless local context says otherwise.
   - PR body should contain:
     - `Summary`
     - `Validation`
     - `Closes #<issue-number>`

## Naming Guidance

- Issue title: short, user-facing, outcome-oriented
- Branch name: lowercase kebab-case with a type prefix and required issue number
  - `feat/123-short-summary`
  - `fix/456-short-summary`
  - `chore/789-short-summary`
- Good branch examples:
  - `fix/branding-svg-refresh`
  - `feat/auth-profile-page`
  - `chore/update-mock-handlers`

Prefer branch names that match the commit intent and always include issue number.

## Command Patterns

Use non-interactive `gh` commands.

```bash
gh issue create --repo <owner/repo> --title "<title>" --body "<body>"
# Capture issue URL from stdout, then derive issue number for branch naming:
issue_url="$(gh issue create --repo <owner/repo> --title "<title>" --body "<body>")"
issue_number="${issue_url##*/}"
gh pr create --repo <owner/repo> --base main --head <branch> --title "<title>" --body "<body>"
```

When body text is multi-line, quote it safely. Avoid shell interpolation bugs from backticks inside double quotes.

## Branch Rename Notes

When the user explicitly asks to rename a branch:

1. Rename locally with `git branch -m`.
2. Push the renamed branch with `git push -u origin <new-branch-name>`.
3. Only delete the old remote branch if the user explicitly asks for it.

Do not delete remote branches as part of the default flow.

## Final Handoff

Return:

- issue number and URL, if created
- branch name
- commit SHA and message
- PR number and URL, if created
- validation results

If any GitHub step failed, clearly separate:

- completed local steps
- blocked remote steps
- exact reason, such as invalid `gh` auth or network restrictions
