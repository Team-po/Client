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
