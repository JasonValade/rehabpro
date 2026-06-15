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

## Deploy the website demo

The safest first deployment is a static frontend-only demo. Do not deploy the Express API unless you intentionally need server features.

### Vercel

1. Keep the GitHub repo private.
2. Push this repo to GitHub.
3. In Vercel, choose `Add New Project` and import the repo.
4. Use these settings:
   ```text
   Framework Preset: Vite
   Build Command: npm run deploy:check
   Output Directory: dist
   Environment Variables: none required
   ```
5. Deploy and open the generated URL.
6. Before sharing, run through the demo once and click `Reset demo data`.

For the public demo, leave `OPENAI_API_KEY` unset and do not deploy the backend. The AI option will stay disabled as `Coming soon`, and the PT messaging/report flow works from local demo state.

## Backend configuration

The backend server reads environment values from `.env`.

- `OPENAI_API_KEY`: required for the AI coach at `/api/chat`
- `OPENAI_MODEL`: optional model override; defaults to `gpt-5-mini`
- `ENABLE_AI`: must be `true` to expose the AI coach; defaults to disabled
- `ENABLE_DEMO_API`: enables mock patient/report API routes; keep `false` on a public demo
- `BACKEND_API_KEY`: protects mock patient and report endpoints when the demo API is enabled
- `CORS_ORIGIN`: exact allowed frontend origin; comma-separate multiple origins

To enable the AI coach:

1. Create an API key at `https://platform.openai.com/api-keys`.
2. Add billing or prepaid credits to that API project if required by your account.
3. Paste the key after `OPENAI_API_KEY=` and set `ENABLE_AI=true` in `.env`. Do not add quotes or expose it in frontend code.
4. Run `npm run check:ai`. It should print `AI check passed`.
5. Restart `npm run dev:server` after changing `.env`.
6. Open `http://localhost:4000/api/chat/status`; it should return `configured: true`.

The API key is separate from a ChatGPT subscription. `.env` is ignored by Git so the secret stays local.

The AI coach is optional. When `OPENAI_API_KEY` is empty, the patient chat defaults to `My Physical Therapist` and shows the AI option as `Coming soon`.

## Public demo security

- Keep `ENABLE_AI=false` and `ENABLE_DEMO_API=false` unless those server features are intentionally needed.
- Set `CORS_ORIGIN` to the exact deployed frontend URL, such as `https://rehabpro-demo.example.com`.
- Never enter real patient information. Authentication and local storage are demo-only and are not suitable for protected health information.
- Store secrets only in the hosting provider's environment-variable settings. Never expose them as Vite variables or commit `.env`.
- The API applies security headers, strict request-size limits, input validation, and rate limits to write/AI endpoints.

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

## Demo flow

1. Select `Returning patient` or click `Start returning patient demo`.
2. Open `Train`, review an exercise, and mark one complete.
3. Open `Report`, submit a symptom report, then click `View in PT messages`.
4. Show the structured report inside the PT conversation.
5. Sign out and use `Reset demo data` before the next presentation.

## Architecture notes

- The UI is a single-page React app powered by Vite and React 19.
- The project now supports TypeScript through `tsconfig.json` and TS-aware linting.
- ESLint is configured for React, TypeScript, hooks, and Vite refresh compatibility.
- Vitest with React Testing Library covers component behavior and app smoke tests.
- The backend server is intentionally lightweight and designed as a mock API layer for local development.

## Notes

The project is ready for incremental TypeScript migration. Existing JS and JSX files are still supported, while new files should be authored as `.ts`/`.tsx` for stronger type safety.
