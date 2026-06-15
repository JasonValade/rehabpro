# RehabPro

RehabPro is a React + Vite rehabilitation dashboard prototype for patient and physical therapist workflows. The app includes a lightweight Express backend, local state persistence, and a shared UI layer for tracking workouts, progress, reports, and PT messaging.

## What this repo includes

- `src/`: React application entrypoints, views, hooks, and UI components
- `server/`: Express API server for patients, exercises, reports, milestones, and chat
- `vite.config.ts`: Vite dev server configuration and Vitest test runner setup
- `tsconfig.json`: TypeScript workspace configuration
- `eslint.config.js`: ESLint flat config supporting TypeScript and React
- `prettier` via `.prettierrc` for consistent formatting

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend API server:
   ```bash
   npm run dev:server
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open the app in the browser:
   ```text
   http://localhost:5173
   ```

## Backend configuration

The backend server reads environment values from `.env`.

- `OPENAI_API_KEY`: required for the AI coach at `/api/chat`
- `OPENAI_MODEL`: optional model override; defaults to `gpt-5-mini`
- `BACKEND_API_KEY`: optional request guard for write endpoints
- `CORS_ORIGIN`: default is `http://localhost:5173`

To enable the AI coach:

1. Create an API key at `https://platform.openai.com/api-keys`.
2. Add billing or prepaid credits to that API project if required by your account.
3. Paste the key after `OPENAI_API_KEY=` in `.env`. Do not add quotes or expose it in frontend code.
4. Restart `npm run dev:server` after changing `.env`.
5. Open `http://localhost:4000/api/chat/status`; it should return `configured: true`.

The API key is separate from a ChatGPT subscription. `.env` is ignored by Git so the secret stays local.

## Scripts

- `npm run dev` — start Vite frontend
- `npm run dev:server` — start Express backend
- `npm run build` — build the frontend
- `npm run preview` — preview production build
- `npm run lint` — run ESLint
- `npm run lint:fix` — auto-fix lint issues
- `npm run typecheck` — run TypeScript type checks
- `npm run test` — run Vitest tests
- `npm run test:watch` — run tests in watch mode
- `npm run format` — format project files with Prettier

## Architecture notes

- The UI is a single-page React app powered by Vite and React 19.
- The project now supports TypeScript through `tsconfig.json` and TS-aware linting.
- ESLint is configured for React, TypeScript, hooks, and Vite refresh compatibility.
- Vitest with React Testing Library covers component behavior and app smoke tests.
- The backend server is intentionally lightweight and designed as a mock API layer for local development.

## Notes

The project is ready for incremental TypeScript migration. Existing JS and JSX files are still supported, while new files should be authored as `.ts`/`.tsx` for stronger type safety.
