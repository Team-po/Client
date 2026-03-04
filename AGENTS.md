# AGENTS.md

## Product concept
A developer side-project random team matching service.

Key features
- Team project lifecycle management (e.g., forming → active → shipping → completed/paused)
- Progress tracking + metrics dashboard (team/project KPIs and trends)

Primary goal
- Simple UI and predictable code structure. Avoid unnecessary complexity.

---

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query
- Biome (lint/format)
- pnpm (never use npm or yarn)

---

## Code style
- Strict TypeScript. Avoid `any`.
- Named exports only (no default exports).
- Prefer small, composable components.
- Business logic in hooks or `src/lib`, not in JSX.

## Folder structure
src/
  pages/         route-level pages
  features/      domain modules (matching, teams, projects, progress, dashboard)
  components/    shared UI components
  hooks/         shared hooks
  lib/
    api/         API client + request functions
    types/       shared domain types
    utils/       utilities

Rules
- UI primitives in `components/` (Button, Input, Modal, etc.)
- Domain logic lives under `features/<domain>/`
- API calls only in `src/lib/api/*`
- Keep route pages thin; put logic in `features/*`

---

## Styling (Tailwind)
- Tailwind-first; minimal custom CSS.
- Avoid inline styles.
- Extract repeated class patterns into components.

---

## Data fetching (TanStack Query)
- Reads use `useQuery`, writes use `useMutation`.
- Prefer query keys per domain (e.g., `['teams']`, `['projects', id]`).
- No direct `fetch` inside components.

---

## Lint / format (Biome)
- Keep imports organized.
- No unused vars/exports.
- Run formatting before finalizing.

---

## Commands
- install: `pnpm install`
- dev: `pnpm dev`
- build: `pnpm build`
- lint: `pnpm biome lint .`
- format: `pnpm biome format --write .`
- typecheck: `pnpm tsc --noEmit`

---

## Execution process (must follow)
For any non-trivial task:
1) Start with a short plan (bullets) + list files to be created/modified.
2) Implement in small, reviewable steps (avoid big-bang changes).
3) Keep the app runnable at each step.
4) Finish by running:
   - `pnpm typecheck`
   - `pnpm biome lint .`
   - `pnpm build`
   Include a short summary of results (pass/fail + key errors if any).

## Git / change discipline
- One logical change per commit.
- Prefer commit messages like: `feat(domain): ...`, `fix(domain): ...`, `chore: ...`
- Do not leave the repo in a failing state.

## Backend & API contract (OpenAPI / Swagger)
- Backend will expose an OpenAPI (Swagger) spec (YAML).
- OpenAPI spec location (single source of truth): `./openapi/openapi.yaml`
- If the OpenAPI spec exists, treat it as the source of truth for request/response shapes.
- If the OpenAPI spec does NOT exist yet:
  - Define minimal TypeScript types in `src/lib/types/` and keep them easy to align with OpenAPI later.
  - Keep endpoints resource-based and minimal (see "API shape" below).

## API shape (until OpenAPI exists)
- Keep endpoints resource-based and minimal (e.g., `/teams`, `/projects`, `/matching`).
- Avoid over-design (no premature pagination/filtering unless required by the UI).
- Authentication/authorization is a placeholder unless explicitly requested.

## Mocking strategy (for UI development)
- Use MSW (Mock Service Worker) for development mocking.
- MVP: MSW is for development mocking only. Do not introduce a test framework unless explicitly requested.
- API calls must remain in `src/lib/api/*` and should use the same request functions regardless of mock/real backend.
- Mock handlers must live in `src/lib/api/mocks/*` and mirror the same routes/response shapes as the real API.
- Provide realistic loading/error states:
  - at least one 200 success case
  - one 4xx validation/unauthorized case where relevant
  - one 5xx case for resilience testing
- No hardcoded mock data inside React components.


## API base / environment toggles
- Centralize base URL and mode flags in `src/lib/api/config.ts`.
- Use Vite env vars only through that config module.
- Support switching between:
  - real backend (when available)
  - MSW mock mode (default during early UI work)

## Domain invariants (MVP)
- Project lifecycle statuses are fixed:
  - `forming | active | shipping | completed | paused`
- Keep route pages thin; domain logic belongs under `features/<domain>/`.

## Dependency policy
- Avoid adding new libraries unless clearly justified.
- Any new tool/library/approach must be recorded in `DECISIONS.md` (Reason can be `TBD` if uncertain).
- Prefer existing stack tools; do not introduce alternate linters/formatters/build tools.

## Documentation updates
After completing work:
- Update `DECISIONS.md` when choosing/changing a tool/library/approach.
- Update `ARCHITECTURE.md` only when folder structure or major data flow changes.
- Use `TASK.md` only for multi-step work spanning multiple sessions.
