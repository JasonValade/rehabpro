# RehabPro software engineering case study

**Jason Valade — Full-stack SWE**  
Solo project · June 2026–present · Ongoing development

## Ownership

Owned the project end to end, including product planning, UI/UX, React architecture, domain logic, Supabase authentication and persistence, Postgres schema design, row-level security, optional Express services, automated testing, performance optimization, documentation, and deployment configuration.

### Résumé summary

- Built a full-stack rehabilitation application with React, TypeScript, Supabase Auth, and PostgreSQL, implementing an end-to-end workflow from user intake and deterministic plan generation through workout logging and progress visualization.
- Designed an eight-table relational schema with foreign keys, check constraints, cascading deletes, timestamp triggers, seed migrations, and ownership-based row-level security.
- Developed a PT portal exercise-search workflow that filters a structured exercise catalog by name, muscle, equipment, cue, and load category, then supports cadence-aware assignment into patient plans.
- Created 26 behavioral tests across authentication, onboarding, plan selection, workout persistence, progress reporting, exercise details, and messaging; enforced tests, typechecking, linting, and production builds through a single deployment gate.
- Reduced the production entry bundle from 515.58 kB to 473.61 kB through feature-level lazy loading and added a zero-setup reviewer path that exercises the same domain-shaped UI without external credentials.

## Engineering objective

Build a credible stateful application—not a collection of static screens—that demonstrates how a frontend workflow, authentication system, relational model, authorization rules, and automated quality gate fit together.

RehabPro models one complete transaction lifecycle: a user authenticates, records intake data, receives a deterministic plan, completes a session, persists per-exercise observations, and sees progress derived from the resulting history.

## System design

The application separates responsibilities into three primary layers:

1. **React presentation and orchestration** manage workflow state, loading/error states, and responsive patient interactions.
2. **A typed service layer** translates domain operations such as `createStarterPlan` and `saveSessionLogs` into Supabase queries.
3. **Postgres and Supabase Auth** enforce identity, relationships, constraints, cascades, and record ownership.

The persistent path and local reviewer path deliberately converge on the same patient views and domain-shaped records. This keeps the demo useful without maintaining a separate showcase UI.

## Notable implementation decisions

### Deterministic plan generation

Plan selection is a pure, inspectable mapping of injury type, rehab phase, and week. The approach is reproducible, easy to test, and safer for this prototype than hiding domain behavior behind nondeterministic generation.

### Authorization at the data layer

Ownership is enforced through Postgres row-level security instead of relying only on frontend checks. Policies traverse patient ownership for plans, sessions, and logs; foreign keys and cascading deletes preserve relational consistency.

### Transaction-shaped persistence

Completing a workout creates a session and persists exercise-level logs with symptom values. Progress data is then reconstructed from stored session history rather than being maintained as unrelated UI-only state.

### Reviewer path without infrastructure coupling

`?demo=returning` constructs records with the same shapes consumed by the authenticated application. A reviewer can inspect the entire workflow even if Supabase is unavailable, while the real account path remains independently testable.

### Performance boundaries

Home, Train, and Progress are lazy-loaded. This reduced the production entry chunk from 515.58 kB to 473.61 kB and removed the build-size warning while preserving feature-level boundaries.

### Release gate

`npm run deploy:check` composes four independent checks: behavioral tests, TypeScript validation, ESLint, and a production build. Vercel uses this command as its build gate, preventing deployment when any stage fails.

## Verification evidence

- 26 automated tests across seven test files.
- Authentication success, fallback, and signed-out behavior.
- New-patient intake and deterministic starter-plan creation.
- Supabase-shaped plan rendering and session-log persistence.
- Returning-demo deep link and progress behavior.
- Component tests for training, reporting, progress, exercise detail, and messaging.
- A separate Supabase verification script checks environment configuration, connectivity, schema access, seeds, RLS behavior, and template coverage.

## Security and reliability boundaries

- Database RLS scopes patient records to the authenticated owner.
- SQL constraints reject symptom ratings outside the expected range.
- The optional Express API is disabled by default and adds API-key checks, rate limits, body limits, validation, and restricted CORS when enabled.
- Vercel adds content-type, framing, referrer, and browser-permission headers.
- Medical and privacy limitations are stated explicitly; the prototype is not represented as HIPAA-ready.

## Tradeoffs and next engineering steps

- Several established UI modules remain JavaScript while new domain and orchestration code uses TypeScript. A production continuation would migrate components incrementally and enable stricter compiler settings.
- Starter-plan creation currently spans multiple client requests. A database function or server transaction would provide atomic plan-and-exercise creation.
- The demo intentionally resets on refresh. Persisting demo mutations would add complexity without improving code review value.
- Production readiness would also require observability, end-to-end browser tests, formal accessibility testing, threat modeling, backup/restore validation, and regulated infrastructure.

## Suggested reviewer path

1. Read [ENGINEERING.md](./ENGINEERING.md) for the system map.
2. Inspect `getTemplateKey`, `createStarterPlan`, and `saveSessionLogs` in `src/services/rehabData.ts`.
3. Inspect schema constraints and RLS policies in `supabase/migrations/202606290001_patient_mvp.sql`.
4. Review `src/App.test.tsx` to see the end-to-end behaviors isolated from external infrastructure.
5. Run `npm run deploy:check`.
6. Open `/?demo=returning` and connect the visible behavior back to the code paths above.
