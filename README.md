# RehabPro — full-stack SWE portfolio project

RehabPro is a full-stack rehabilitation workflow built to demonstrate software engineering across frontend architecture, authentication, relational data modeling, authorization, testing, performance, and deployment. The primary path uses React, TypeScript, Supabase Auth, and Postgres; a deterministic local demo lets reviewers exercise the system without credentials.

**Developer:** Jason Valade · **Role:** Full-stack SWE · **Project:** Solo, June 2026–present (ongoing)

> **Demo-only notice:** This repository is a prototype using mock patient data and demo-only authentication. It is not HIPAA-ready, is not intended for protected health information, and should not be used for real medical care or clinical decision-making.

## Engineering highlights

- **End-to-end stateful workflow:** authentication → intake → persisted plan → workout transaction → symptom logs → derived progress.
- **Relational backend:** eight Postgres tables, foreign keys, check constraints, timestamp triggers, seed migrations, and ownership-based row-level security.
- **Typed data boundary:** TypeScript domain types and a dedicated Supabase service layer isolate persistence from UI components.
- **Deterministic domain logic:** injury, phase, and recovery week map to reproducible plan templates with testable outcomes.
- **Resilient demo architecture:** the same UI supports a persistent authenticated path and a zero-setup in-memory reviewer path.
- **Behavioral verification:** 26 tests cover authentication, onboarding, plan rendering, workout persistence, progress, reports, and messaging.
- **Production discipline:** one release command runs tests, typechecking, linting, and an optimized build; route-level lazy loading keeps the main chunk below the configured warning threshold.
- **Security boundaries:** database RLS, guarded optional APIs, restricted CORS, rate limits, request validation, and deployment security headers.

See [ENGINEERING.md](./ENGINEERING.md) for the architecture, data flow, design decisions, and code-review map.

## Product vision

The current MVP is patient-first and mobile-first:

1. Create account
2. Injury intake
3. Starter rehab plan
4. Today’s exercises
5. Complete workout
6. Log pain, swelling, and difficulty
7. Progress updates

Starter plans are rule-based templates. RehabPro does not generate clinical plans with AI in this version.

## Portfolio review

- **Live demo:** open the deployed site normally to review onboarding, or append `?demo=returning` to launch directly into a populated patient account with no credentials.
- **Recommended code path:** start with [`src/App.tsx`](./src/App.tsx), [`src/services/rehabData.ts`](./src/services/rehabData.ts), the [database migration](./supabase/migrations/202606290001_patient_mvp.sql), and [`src/App.test.tsx`](./src/App.test.tsx).
- **Recommended walkthrough:** direct demo → Train → complete exercises → symptom check-in → Progress → inspect the matching persistence tests.
- **Case study:** see [`CASE_STUDY.md`](./CASE_STUDY.md) for the engineering problem, implementation decisions, tradeoffs, and evidence.
- **Release validation:** use [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) before sharing a new deployment.

## What this repo includes

- `src/`: React application entrypoints, views, hooks, and UI components
- `supabase/migrations/`: Supabase SQL schema, RLS policies, and starter exercise seed data
- `server/`: optional legacy Express API server for local/demo endpoints
- `vite.config.ts`: Vite dev server configuration and Vitest test runner setup
- `tsconfig.json`: TypeScript workspace configuration
- `eslint.config.js`: ESLint flat config supporting TypeScript and React
- `prettier` via `.prettierrc` for consistent formatting

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Supabase project and apply the migration in `supabase/migrations/`.
3. Copy `.env.example` to `.env` and add:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open the app in the browser:
   ```text
   http://localhost:5173
   ```

The Express backend is not required for the patient MVP loop. Run it only if you are working on legacy demo API or AI chat endpoints:
   ```bash
   npm run dev:server
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
   Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   ```
5. Deploy and open the generated URL.
6. Before sharing, create a test account and run through the MVP loop.

For the public demo, leave `OPENAI_API_KEY` unset and do not deploy the backend unless you intentionally need server features.

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

- Label public deployments as demo-only and not for real patient information.
- Keep `ENABLE_AI=false` and `ENABLE_DEMO_API=false` unless those server features are intentionally needed.
- Set `CORS_ORIGIN` to the exact deployed frontend URL, such as `https://rehabpro-demo.example.com`.
- Never enter real patient information. Supabase Auth/Postgres makes the MVP persistent, but this repository is not HIPAA-ready.
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

## MVP flow

1. Create an account with email and password.
2. Complete injury intake and baseline values.
3. Click `Create starter plan`.
4. Open `Train`, review exercises, and mark work complete.
5. End the workout and log pain, swelling, and difficulty.
6. Open `Progress` to see session-based trends compared with baseline.

## Architecture notes

- React owns workflow orchestration and view state; patient views are lazy-loaded boundaries.
- The service layer owns Supabase queries, record mapping, and domain-facing types.
- Postgres owns referential integrity, value constraints, cascades, timestamps, and per-user authorization through RLS.
- Vitest and React Testing Library verify user-visible behavior rather than implementation details.
- Vercel runs the full release gate before producing the static frontend deployment.
- The optional Express backend is isolated from the primary path and disabled by default.

## Notes

The project is ready for incremental TypeScript migration. Existing JS and JSX files are still supported, while new files should be authored as `.ts`/`.tsx` for stronger type safety.
