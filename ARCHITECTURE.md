# ARCHITECTURE.md

## Frontend Structure

- Route pages stay thin under `src/pages/*` and delegate UI to feature components.
- Matching UI lives in `src/features/match/*`.
- Team workspace UI lives in `src/features/team/*`.
- Shared domain types live in `src/lib/types/*`.
- API request functions stay in `src/lib/api/*`.
- `/team` uses project group, checklist, admin permission, and GitHub App installation request functions when a user is signed in.
- In mock API mode, signed-in `/team` calls the same request functions through MSW; signed-out `/team` keeps the richer local demo workspace as a preview.

## Current User Flow

1. `/match`: user reviews their request status, submits a matching request, and can preview the pending offer accept/decline flow.
2. `/team`: user lands in the current team workspace after a team exists.
3. `/me`: user manages profile data and can jump to the active team workspace.

## Temporary UI State

- Real API mode and signed-in mock mode use `src/lib/api/*` request functions for implemented team-space server capabilities.
- Signed-out mock mode still keeps team name, lifecycle status, rules Markdown, GitHub repository preview, random reviewer, and team messages in local React state.
- Move remaining mock-only team surfaces to `src/lib/api/*` when matching backend endpoints are introduced.

Presentation routes under `/deck/team-po*` are intentionally unchanged.
