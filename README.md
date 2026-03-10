![Team-po logo](./public/logo-full.svg)

# Team-po Client

Developer side-project random team matching service frontend.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Biome
- pnpm

## Local Development

```bash
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev`
- `pnpm typecheck`
- `pnpm biome lint .`
- `pnpm biome format --write .`
- `pnpm build`

## API Mode

API mode is controlled from [`src/lib/api/config.ts`](/Users/hwangjo/Client/src/lib/api/config.ts).

- `VITE_API_MODE=mock`: use MSW-based mocked API
- `VITE_API_MODE=real`: call a real backend
- `VITE_API_BASE_URL`: backend base URL, defaults to `/api`

Example:

```bash
VITE_API_MODE=real
VITE_API_BASE_URL=https://api.example.com
```

## Vercel Deployment

This project uses React Router with `BrowserRouter`, so Vercel needs an SPA rewrite for deep links such as `/login`, `/signup`, and `/me`.

The required rewrite is already configured in [`vercel.json`](/Users/hwangjo/Client/vercel.json).

### Recommended Setup

- Production: `main`
- Preview: feature branches and pull requests
- Preview env: start with `VITE_API_MODE=mock` for UI review, or `VITE_API_MODE=real` when a dev backend is ready

### What You Need To Do In Vercel

1. Import the GitHub repository into Vercel.
2. Framework preset: `Vite`.
3. Build command: `pnpm build`.
4. Output directory: `dist`.
5. Add environment variables per environment:
   - Preview: `VITE_API_MODE=mock`
   - Production: `VITE_API_MODE=real`
   - Preview/Production when using real backend: `VITE_API_BASE_URL=https://your-api-host`
6. Trigger a deployment from `main` or open a PR to get a preview URL.

### Notes

- If you deploy with `VITE_API_MODE=mock`, the app will use MSW in the browser for demo and UI review.
- If you deploy with `VITE_API_MODE=real`, ensure the backend allows requests from the Vercel domain.
- Vercel Hobby is usually enough for early development and preview deployments.
