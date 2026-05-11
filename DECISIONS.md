# DECISIONS.md

## 2026-03-05
- Stack: Vite + React + TypeScript
- Styling: Tailwind CSS
- UI components: shadcn/ui
- Server state: TanStack Query
- Routing: React Router
- Development API mocking: MSW with centralized `src/lib/api/config.ts`
- Lint/format: Biome
- Package manager: pnpm
- Landing UI approach: token-driven design system (CSS variables + Tailwind extension)
- Shared primitives for marketing pages: `Button`, `Badge`, `Surface`, `Container`, `SectionHeading`
- Auth/API approach: OpenAPI-first contract for login, signup, email verification, and current-user profile
- Deployment approach: Vercel for development/preview hosting with SPA rewrite via `vercel.json`

## 2026-03-09
- GitHub collaboration workflow: issue forms for bug report and feature request, with blank issues disabled
- Pull request workflow: PR template plus GitHub Actions CI running `pnpm typecheck`, `pnpm lint`, and `pnpm build` on every pull request
- Generated MSW service worker file `public/mockServiceWorker.js` is excluded from Biome checks to avoid third-party warning noise

## 2026-03-10
- Repository automation skill: local `.agents/skills/github-workflow` documents the standard issue → branch → validation → commit → push → PR flow for repeatable GitHub handoff work

## 2026-04-07
- Local PDF inspection skill: `.agents/skills/pdf-reading` documents a fallback workflow for reading PDFs in restricted environments, preferring text extraction first and Ghostscript rendering to temporary images with mandatory cleanup when visual inspection is required

## 2026-05-03
- Team space preview approach: model match offers and team-space data in `src/lib/types/team.ts` with FE-only demo data in `src/features/team/lib/demo-team-space.ts` until backend APIs are available
- Team navigation: expose `/team` as the logged-in user's current team workspace, while keeping presentation deck routes unchanged
- Editable workspace preview: keep team name/status, rules, checklist, GitHub setup, and messenger interactions in local React state so the UX can be validated before backend contracts exist
- Auth/navigation UX: show app navigation and logout only for signed-in users; logged-out users can still open `/team` as a clearly labeled local preview
- Matching preview UX: keep match offers hidden until the user requests or explicitly previews an offer, matching the intended request → offer → accept/decline flow

## 2026-05-05
- API contract alignment: `openapi/openapi.yaml`, API clients, hooks, and MSW mocks now mirror the current Spring server controllers for signup email auth, user profile/account APIs, matching sessions, and project-group admin permission endpoints without adding new dependencies.
- Internal app redesign approach: use LazyWeb-informed, decision-first SaaS dashboard patterns for `/login`, `/signup`, `/verify-email`, `/me`, `/match`, and `/team`, while preserving the landing page and `/deck/*` presentation routes. Keep the existing CSS variable color system, avoid new dependencies, and introduce `src/components/app-shell.tsx` as the shared internal app chrome.

## 2026-05-11
- GitHub OAuth flow: start authentication through the backend OAuth2 endpoint, receive the short-lived code at `/oauth/github/callback`, and exchange it through `src/lib/api/auth.ts` so email login and GitHub login share the same session storage and API client behavior
- GitHub OAuth onboarding: request only the required development level for first-time GitHub users because the backend derives email and nickname from GitHub
