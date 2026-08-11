# Engineering guide

This guide gives software-engineering reviewers a fast path through RehabPro’s architecture and implementation evidence.

**Developer:** Jason Valade · **Role:** Full-stack SWE · **Scope:** Solo, end-to-end ownership · **Timeframe:** June 2026–present

## Runtime architecture

```text
Browser
  └─ React workflow orchestration (src/App.tsx)
      ├─ Lazy patient views (Home / Train / Progress)
      ├─ Deterministic demo adapter (no external dependency)
      └─ Typed domain service (src/services/rehabData.ts)
          └─ Supabase client
              ├─ Auth identity
              └─ Postgres
                  ├─ relational constraints and triggers
                  ├─ ownership-based row-level security
                  └─ profiles → patients → plans/sessions → logs
```

The optional Express server is not on the primary patient path. It contains guarded demo endpoints and an optional AI integration, both disabled by default.

## Stateful workflow

```text
authenticate
  → load or create patient
  → select a deterministic template
  → create plan and ordered exercises
  → render today’s work
  → create completed session
  → persist one log per exercise
  → query history
  → derive progress metrics
```

This sequence is exercised in `src/App.test.tsx` with the external service mocked at its boundary. Individual complex views have focused component tests.

## Data model

| Entity | Responsibility | Integrity/authorization |
| --- | --- | --- |
| `profiles` | Auth-linked identity metadata | Primary key references `auth.users` |
| `patients` | Rehab context and baseline values | Rating constraints; owned through `profile_id` |
| `injury_intakes` | Original structured intake payload | Cascades with patient; owner policy |
| `exercises` | Reusable exercise catalog | Unique name; authenticated read policy |
| `rehab_plans` | Selected plan per patient | Patient foreign key; owner policy |
| `plan_exercises` | Ordered prescription and dosage | Plan/exercise foreign keys; transitive owner policy |
| `sessions` | Workout lifecycle | Patient foreign key; owner policy |
| `session_logs` | Per-exercise completion and symptoms | Range checks; session/patient/exercise foreign keys |

## Code-review map

| Engineering concern | Primary evidence |
| --- | --- |
| Workflow/state orchestration | `src/App.tsx` |
| Domain types and persistence | `src/services/rehabData.ts` |
| Authentication boundary | `src/lib/supabase.ts` |
| Relational schema and RLS | `supabase/migrations/202606290001_patient_mvp.sql` |
| Expanded deterministic seed set | `supabase/migrations/202606300001_expand_starter_exercise_seeds.sql` |
| End-to-end component behavior | `src/App.test.tsx` |
| Focused view behavior | `src/components/**/*.test.tsx` |
| Optional API hardening | `server/index.js` |
| Deployment gate and headers | `package.json`, `vercel.json` |
| Environment verification | `scripts/verify-supabase-setup.js` |

## Failure handling

- Supabase initialization distinguishes configured and unconfigured environments.
- Service failures cross one assertion boundary and become user-visible workflow errors.
- Authentication loading prevents onboarding from flashing before an existing patient resolves.
- Signup handles both immediate sessions and email-confirmation configurations.
- The local demo remains available when hosted without Supabase credentials.
- Optional server capabilities return disabled/unconfigured states rather than silently exposing functionality.

## Performance

Patient views use dynamic imports and React Suspense. The production build emits separate Home, Train, and Progress chunks, leaving the entry chunk below Vite’s 500 kB warning threshold. Further optimization could separate the Supabase vendor dependency and reduce the large static exercise catalog.

## Verification commands

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run deploy:check
npm run check:supabase
```

`deploy:check` is the local and hosted release gate. `check:supabase` requires configured demo-project credentials and validates the deployed data dependencies.
