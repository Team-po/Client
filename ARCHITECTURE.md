# ARCHITECTURE.md

## Frontend Structure

- Route pages stay thin under `src/pages/*` and delegate UI to feature components.
- Matching UI lives in `src/features/match/*`.
- Team workspace UI lives in `src/features/team/*`.
- Shared domain types live in `src/lib/types/*`.
- API request functions stay in `src/lib/api/*`; the current team-space preview uses local demo data only because backend endpoints are not ready yet.

## Current User Flow

1. `/match`: user reviews their request status, submits a matching request, and can preview the pending offer accept/decline flow.
2. `/team`: user lands in the current team workspace after a team exists.
3. `/me`: user manages profile data and can jump to the active team workspace.

## Temporary UI State

- Team workspace editing is currently local-only React state.
- Editable surfaces include team name, lifecycle status, rules Markdown, checklist items, GitHub connection preview, random reviewer, and team messages.
- Replace these local state handlers with `src/lib/api/*` request functions when backend endpoints are available.

Presentation routes under `/deck/team-po*` are intentionally unchanged.
