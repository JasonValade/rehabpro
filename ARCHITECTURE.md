# RehabPro Architecture & Design Decisions

## Current Direction

RehabPro should become a patient-based rehab app that can be downloaded and then load a patient's specific rehab plan.

The first build target is a clean, professional patient-only demo.

## Current Decisions

- The long-term vision includes physical therapists inside the app.
- Before building that workflow, we need to discuss the pros and cons of having PTs manage care directly inside the app.
- For the demo, keep it patient-only.
- Patients should log in with email and password.
- The app should support a doctor script with PT oversight.
- The patient home experience should stay similar to the current app for now.
- Rehab plans should include exercises with sets and reps, video demos, and written instructions.
- Exercise detail screens should have a "show more" option.
- Small clinical reminder notes should appear throughout the experience, such as: "Discomfort is fine, pain is not."
- Patients should be able to mark exercises complete.
- The app should track pain, swelling, range of motion, and difficulty so patients can see improvement over time.
- The visual style should be clean and professional.

## Demo Accounts

The demo should eventually include at least two patient paths:

1. Returning patient
   - Logs in with email and password.
   - Already halfway through their rehab plan.
   - Can see current plan, progress, completion history, symptoms, and improvements.

2. New patient intake
   - Logs in with email and password.
   - Takes a survey.
   - Sends in their doctor script.
   - Answers guided questions.
   - This workflow needs more discussion before implementation.

## Open Product Discussion

The next decision to explore is whether physical therapists should work inside the app, and if so, what their role should be in the first real version.
