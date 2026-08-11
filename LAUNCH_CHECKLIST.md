# Portfolio launch checklist

Record the deployment URL, date, browser/OS, and result for each manual check. Do not mark an item complete unless it was tested on the deployed build.

## Automated gate

- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run deploy:check` passes with no errors or warnings.
- [ ] `npm run check:supabase` passes against the demo Supabase project.

## Reviewer experience

- [ ] The root URL explains the product and offers the returning-patient demo.
- [ ] `/?demo=returning` opens the populated Home view without credentials.
- [ ] Home → Train → symptom check-in → Progress completes successfully.
- [ ] Signing out returns to onboarding.
- [ ] The README links to the live demo and a current walkthrough recording.
- [ ] The case study names the creator’s role, collaborators, timeframe, and ownership accurately.

## Responsive and browser validation

- [ ] iPhone-sized viewport: no clipped controls, trapped scrolling, or obscured bottom navigation.
- [ ] Android-sized viewport: the complete workout flow remains usable.
- [ ] Desktop Chrome, Firefox, and Safari: onboarding and demo flow work.
- [ ] Browser zoom at 200% remains navigable.
- [ ] Portrait and landscape orientation preserve access to primary actions.

## Accessibility and resilience

- [ ] Complete the core flow with keyboard only and a visible focus indicator.
- [ ] Check headings, labels, button names, alerts, and chart controls with a screen reader.
- [ ] Verify text and interactive-control contrast with an automated accessibility scanner.
- [ ] Test slow network, offline load, expired authentication, and rejected form submissions.
- [ ] Refresh each primary state and confirm the result is understandable.

## Privacy and deployment

- [ ] The site visibly says it is a demo and must not receive real patient information.
- [ ] `ENABLE_AI` and `ENABLE_DEMO_API` remain disabled unless intentionally secured and tested.
- [ ] No `.env`, credentials, API keys, or real patient data appear in source or build artifacts.
- [ ] Supabase uses a dedicated demo project with appropriate row-level security policies.
- [ ] Hosting security headers are present in production responses.
- [ ] `noindex, nofollow` matches the intended visibility: retain for a private demo, remove intentionally for a public indexed project.

## Walkthrough capture

Record a 60–90 second clip at a mobile viewport showing the direct demo entry, today’s exercises, workout completion, symptom logging, and updated progress. Export a lightweight poster image or GIF for the portfolio page, and link the full recording from the README.
