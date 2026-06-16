# ARCHITECTURE.md

## Frontend Structure

- Route pages stay thin under `src/pages/*` and delegate UI to feature components.
- App routes are loaded lazily from `src/App.tsx` so large team-space and presentation screens do not inflate the initial route bundle.
- Matching UI lives in `src/features/match/*`.
- Team workspace UI lives in `src/features/team/*`.
- Team workspace orchestration lives in `src/features/team/components/team-space-view.tsx`; signed-in server-backed panels are split into focused `real-team-*` components, and the signed-out mock preview lives in `src/features/team/components/mock-team-space-view.tsx`.
- Shared team workspace chrome, status helpers, member formatting, tabs, and GitHub permission notices live in focused files under `src/features/team/components/*`.
- Shared domain types live in `src/lib/types/*`.
- API request functions stay in `src/lib/api/*`.
- MSW request handlers stay in `src/lib/api/mocks/handlers.ts`, with reusable team-space fixture builders in `src/lib/api/mocks/team-space-fixtures.ts`.
- `/team` uses project group, checklist, admin permission, and GitHub App installation request functions when a user is signed in.
- The signed-in `/team` chat tab uses `src/features/team/components/real-team-chat-panel.tsx` for UI, `src/features/team/hooks/use-chat-queries.ts` for REST history/read state, and `src/features/team/hooks/use-project-group-chat.ts` for STOMP subscribe/publish.
- In mock API mode, signed-in `/team` calls the same request functions through MSW; signed-out `/team` keeps the richer local demo workspace as a preview.

## Current User Flow

1. `/match`: user reviews their request status, submits a matching request, and can preview the pending offer accept/decline flow.
2. `/team`: user lands in the current team workspace after a team exists.
3. `/me`: user manages profile data and can jump to the active team workspace.

## Temporary UI State

- Real API mode and signed-in mock mode use `src/lib/api/*` request functions for implemented team-space server capabilities.
- In mock API mode, chat messages are backed by MSW and appended directly into the TanStack Query cache; in real API mode, the same cache is hydrated from REST and updated from `/topic/project-groups/{projectGroupId}/chat/messages`.
- Signed-out mock mode still keeps team name, lifecycle status, rules Markdown, GitHub repository preview, random reviewer, and team messages in local React state.
- Move remaining mock-only team surfaces to `src/lib/api/*` when matching backend endpoints are introduced.

Presentation routes under `/deck/team-po*` are intentionally unchanged.
