import { useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { C } from './constants/colors'
import {
  MILESTONES,
  PATIENT_DEMO_PROFILES,
  PT_MSG,
  REHAB_TODAY,
  RETURNING_PATIENT_COMPLETION_HISTORY,
  RETURNING_PATIENT_PROGRESS,
} from './data/rehabMock'
import { HomeView } from './components/patient/HomeView.jsx'
import { TrainView } from './components/patient/TrainView.jsx'
import { ProgressView } from './components/patient/ProgressView.jsx'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import {
  createPatientFromIntake,
  createSession,
  createStarterPlan,
  getActivePlan,
  getCurrentPatient,
  getTemplateKey,
  getProgressData,
  getTodayPlan,
  saveSessionLogs,
  type IntakeInput,
  type PatientRecord,
  type ProgressLog,
  type RehabItem,
  type RehabPlanRecord,
} from './services/rehabData'

const SAFETY_COPY = 'This plan is for educational support and does not replace your physical therapist or doctor’s instructions.'
const REQUIRE_EMAIL_CONFIRMATION = false
const EMAIL_CONFIRMATION_MESSAGE = 'Account created. Check your email to confirm your sign-in, then return here.'
const MVP_SIGNUP_BLOCKED_MESSAGE = 'Account created, but Supabase still requires email confirmation. For MVP testing, disable email confirmations in Supabase Auth settings or sign in after confirming.'

const TABS = [
  { id: 'home', icon: '⬡', label: 'HOME' },
  { id: 'train', icon: '◈', label: 'TRAIN' },
  { id: 'progress', icon: '◎', label: 'PROGRESS' },
]

const SCHEDULE = [
  { workout: 'Mobility + Rehab', details: 'Hip hinge, terminal knee extension, wall slides', highlight: 'Active this week' },
  { workout: 'Strength + Balance', details: 'Step-ups, band walks, single-leg balance', highlight: 'Repeats weekly' },
  { workout: 'Active Recovery', details: 'Compression, rest, low-load glute bridge', highlight: 'Repeats weekly' },
]

const INTAKE_STEPS = [
  { id: 'profile', label: 'Profile' },
  { id: 'path', label: 'Rehab path' },
  { id: 'baseline', label: 'Baseline' },
]

const INJURY_OPTIONS = ['ACL + Meniscus', 'Patellar Tendon', 'Achilles', 'Other']
const SIDE_OPTIONS_BY_INJURY: Record<string, string[]> = {
  'ACL + Meniscus': ['Left knee', 'Right knee', 'Both knees'],
  'Patellar Tendon': ['Left knee', 'Right knee', 'Both knees'],
  Achilles: ['Left Achilles', 'Right Achilles', 'Both Achilles'],
  Other: ['Left side', 'Right side', 'Both sides'],
}
const PHASE_OPTIONS = ['Early Motion', 'Strength', 'Return to Running', 'Return to Sport']
const GOAL_OPTIONS = ['Return to sport', 'Walk without pain', 'Stairs confidently', 'Build strength']

const STARTER_PLAN_PREVIEWS: Record<string, { title: string; stage: string; focus: string; load: string; exercises: string[] }> = {
  acl_meniscus_protection_template: {
    title: 'ACL + Meniscus Protection',
    stage: 'Early timeline',
    focus: 'Reduce irritation, restore knee extension/flexion, and re-establish quad control.',
    load: 'Daily mobility with light activation',
    exercises: ['Quad Sets', 'Heel Slides', 'Straight Leg Raise', 'Terminal Knee Extension'],
  },
  acl_meniscus_strength_template: {
    title: 'ACL + Meniscus Strength',
    stage: 'Middle timeline',
    focus: 'Maintain range of motion while building controlled strength and hip support.',
    load: 'Daily mobility plus 3 strength days',
    exercises: ['Terminal Knee Extension', 'Wall Slides', 'Straight Leg Raise', 'Lateral Band Walks', 'Bilateral Calf Raises'],
  },
  acl_meniscus_return_template: {
    title: 'ACL + Meniscus Return',
    stage: 'Later timeline',
    focus: 'Prepare for impact with single-leg control, balance, and landing mechanics.',
    load: '2-3 controlled training days',
    exercises: ['Step-Ups', 'Single-Leg Romanian Deadlift Reach', 'Single-Leg Balance', 'Drop Landing Mechanics'],
  },
  patellar_tendon_protection_template: {
    title: 'Patellar Tendon Protection',
    stage: 'Early timeline',
    focus: 'Calm tendon pain with isometrics and low-irritation support work.',
    load: 'Frequent isometrics, low joint volume',
    exercises: ['Isometric Knee Extension', 'Spanish Squat - Isometric', 'Glute Bridge'],
  },
  patellar_tendon_strength_template: {
    title: 'Patellar Tendon Strength',
    stage: 'Middle timeline',
    focus: 'Build tendon capacity with slow, tolerable loading and hip support.',
    load: '3 loading days with symptom monitoring',
    exercises: ['Spanish Squat - Isometric', 'Decline Eccentric Squat', 'Heavy Slow Goblet Squat', 'Lateral Band Walks'],
  },
  patellar_tendon_return_template: {
    title: 'Patellar Tendon Return',
    stage: 'Later timeline',
    focus: 'Progress heavier strength into spring, landing, and sport demands.',
    load: '2 heavier days plus 2 plyometric exposures',
    exercises: ['Heavy Slow Goblet Squat', 'Bulgarian Split Squat', 'Pogo Hops', 'Plyometric Bounding'],
  },
  achilles_protection_template: {
    title: 'Achilles Protection',
    stage: 'Early timeline',
    focus: 'Keep the ankle moving and introduce calf loading without knee-focused drills.',
    load: 'Daily ankle mobility, gentle calf work',
    exercises: ['Ankle Pumps', 'Towel Calf Stretch', 'Bilateral Calf Raises'],
  },
  achilles_strength_template: {
    title: 'Achilles Strength',
    stage: 'Middle timeline',
    focus: 'Build gastrocnemius and soleus capacity with progressive calf loading.',
    load: '3 calf strength days, controlled tempo',
    exercises: ['Bilateral Calf Raises', 'Bent-Knee Soleus Raise', 'Single-Leg Eccentric Calf Raise', 'Farmer Carry on Toes'],
  },
  achilles_return_template: {
    title: 'Achilles Return',
    stage: 'Later timeline',
    focus: 'Prepare the tendon for faster walking, running, hopping, and sport contacts.',
    load: '2 strength days plus 2 elastic exposures',
    exercises: ['Bent-Knee Soleus Raise', 'Farmer Carry on Toes', 'Pogo Hops', 'Hopping Progression'],
  },
  default_conservative_template: {
    title: 'Conservative Starter Plan',
    stage: 'General timeline',
    focus: 'Start with general movement quality, trunk/hip strength, and symptom monitoring.',
    load: 'Low-load movement and strength',
    exercises: ['Dynamic Warm-Up Flow', 'Glute Bridge', 'Farmer Carry'],
  },
}

function AppStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { background: ${C.black}; color: ${C.bone}; }
      body { min-height: 100vh; }
      button, input, textarea, select { font: inherit; }
      button, input, textarea, select { outline: none; }
      button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid ${C.lime}; outline-offset: 3px; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${C.rim}; border-radius: 2px; }
      input::placeholder, textarea::placeholder { color: ${C.muted}; }
      button { cursor: pointer; }
      button:disabled { cursor: not-allowed; }
      .intake-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 40px 24px;
        background:
          radial-gradient(circle at 22% 18%, ${C.limeDim}, transparent 26%),
          linear-gradient(145deg, ${C.black} 0%, #071015 48%, ${C.black} 100%);
      }
      .intake-shell {
        width: 100%;
        max-width: 1180px;
        border: 1px solid ${C.rim};
        border-radius: 10px;
        background: linear-gradient(180deg, ${C.panel} 0%, ${C.deep} 100%);
        padding: 28px;
        box-shadow: 0 28px 90px rgba(0, 0, 0, 0.38);
      }
      .intake-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.82fr);
        gap: 24px;
        align-items: start;
      }
      .intake-form {
        display: grid;
        gap: 18px;
        align-content: start;
      }
      .intake-header {
        display: grid;
        gap: 8px;
      }
      .intake-kicker {
        font-family: "Fira Code", monospace;
        font-size: 10px;
        color: ${C.lime};
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .intake-title {
        color: ${C.bone};
        font-size: clamp(32px, 4vw, 48px);
        font-weight: 900;
        line-height: 0.98;
        max-width: 700px;
      }
      .intake-copy {
        color: ${C.muted};
        font-size: 14px;
        line-height: 1.55;
        max-width: 640px;
      }
      .intake-stage-switcher {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        border: 1px solid ${C.rim};
        border-radius: 10px;
        background: rgba(10, 15, 20, 0.46);
        padding: 4px;
      }
      .intake-stage-button {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        min-height: 48px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: ${C.bone};
        padding: 9px 12px;
        text-align: left;
        transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
      }
      .intake-stage-button:hover {
        background: rgba(255, 255, 255, 0.035);
      }
      .intake-stage-button-active {
        background: ${C.lime};
        color: ${C.black};
        box-shadow: 0 10px 24px rgba(45, 212, 191, 0.16);
      }
      .intake-stage-number {
        display: grid;
        place-items: center;
        flex: 0 0 24px;
        width: 24px;
        height: 24px;
        border: 1px solid currentColor;
        border-radius: 999px;
        font-family: "Fira Code", monospace;
        font-size: 10px;
        font-weight: 800;
        opacity: 0.78;
      }
      .intake-stage-copy {
        min-width: 0;
      }
      .intake-stage-eyebrow {
        display: block;
        font-family: "Fira Code", monospace;
        font-size: 9px;
        letter-spacing: 0.08em;
        opacity: 0.62;
        text-transform: uppercase;
      }
      .intake-stage-label {
        display: block;
        margin-top: 2px;
        font-size: 13px;
        font-weight: 900;
        line-height: 1.1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .intake-card,
      .intake-preview {
        border: 1px solid ${C.rim};
        border-radius: 8px;
        background: rgba(10, 15, 20, 0.42);
      }
      .intake-card {
        padding: 20px;
        display: grid;
        gap: 20px;
        min-height: 310px;
      }
      .intake-card-title {
        color: ${C.bone};
        font-size: 24px;
        font-weight: 900;
        line-height: 1.1;
        margin-top: 5px;
      }
      .intake-preview {
        position: sticky;
        top: 28px;
        padding: 20px;
        display: grid;
        gap: 16px;
        background: linear-gradient(180deg, rgba(16, 22, 29, 0.98), rgba(10, 15, 20, 0.94));
      }
      .intake-preview-title {
        color: ${C.bone};
        font-size: 30px;
        font-weight: 900;
        line-height: 1.05;
        margin-top: 8px;
      }
      .intake-preview-subtitle {
        color: ${C.muted};
        font-size: 13px;
        line-height: 1.5;
        margin-top: 8px;
      }
      .intake-action-row {
        display: flex;
        gap: 12px;
      }
      .intake-preview-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .intake-choice-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
        gap: 8px;
      }
      .intake-choice {
        min-height: 42px;
        border: 1px solid ${C.rim};
        border-radius: 8px;
        background: ${C.panel};
        color: ${C.bone};
        padding: 10px 12px;
        font-size: 12px;
        font-weight: 900;
        transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
      }
      .intake-choice:hover {
        border-color: ${C.rimHi};
        transform: translateY(-1px);
      }
      .intake-choice-active {
        border-color: ${C.lime};
        background: ${C.lime};
        color: ${C.black};
      }
      .intake-focus {
        border: 1px solid ${C.rim};
        border-radius: 8px;
        background: ${C.panel};
        padding: 14px;
      }
      .intake-exercise {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: 1px solid ${C.rim};
        border-radius: 8px;
        background: ${C.black};
        padding: 11px 12px;
      }
      .intake-exercise-name {
        color: ${C.bone};
        font-size: 13px;
        font-weight: 800;
      }
      .intake-exercise-goal {
        color: ${C.muted};
        font-size: 11px;
        white-space: nowrap;
      }
      .intake-button {
        min-height: 52px;
        border-radius: 8px;
        padding: 14px;
        font-weight: 900;
        transition: opacity 160ms ease, transform 160ms ease, border-color 160ms ease;
      }
      .intake-button:not(:disabled):hover {
        transform: translateY(-1px);
      }
      .intake-button-secondary {
        flex: 1;
        border: 1px solid ${C.rim};
        background: rgba(10, 15, 20, 0.44);
        color: ${C.bone};
      }
      .intake-button-primary {
        flex: 1.35;
        border: none;
        background: ${C.lime};
        color: ${C.black};
      }
      @media (max-width: 860px) {
        .intake-page { padding: 14px; place-items: start center; }
        .intake-shell { padding: 16px; }
        .intake-layout { grid-template-columns: 1fr; }
        .intake-preview { position: static; }
        .intake-stage-switcher { grid-template-columns: 1fr; }
        .intake-action-row { flex-direction: column; }
      }
      @media (max-width: 520px) {
        body { font-size: 14px; }
        .intake-preview-metrics { grid-template-columns: 1fr; }
      }
    `}</style>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppStyles />
      <div
        style={{
          background: C.black,
          minHeight: '100vh',
          width: '100%',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {children}
      </div>
    </>
  )
}

function AuthScreen({
  onSignIn,
  onSignUp,
  onUseReturningDemo,
  loading,
  error,
  message,
}: {
  onSignIn: (email: string, password: string) => void
  onSignUp: (email: string, password: string, fullName: string) => void
  onUseReturningDemo: () => void
  loading: boolean
  error: string
  message: string
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === 'signup') {
      onSignUp(email, password, fullName)
      return
    }
    onSignIn(email, password)
  }

  return (
    <Shell>
      <div
        style={{
          minHeight: '100vh',
          padding: '22px',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 1080, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(340px, 420px)', gap: 24 }}>
          <section style={{ border: `1px solid ${C.rim}`, background: C.deep, padding: 28, minHeight: 520, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.lime, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Patient rehab MVP
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 'clamp(58px, 8vw, 98px)', color: C.bone, lineHeight: 0.9, marginTop: 18 }}>
                REHAB<span style={{ color: C.lime }}>PRO</span>
              </h1>
              <p style={{ maxWidth: 560, color: C.bone, fontSize: 16, lineHeight: 1.55, marginTop: 18 }}>
                Create an account, complete injury intake, create a starter rehab plan, finish today&apos;s exercises, log symptoms, and watch progress update.
              </p>
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 24 }}>
              {['Injury intake', 'Starter rehab plan', 'Today’s exercises', 'Session-based progress'].map((item) => (
                <div key={item} style={{ border: `1px solid ${C.rim}`, background: C.panel, padding: 14 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone, lineHeight: 1 }}>{item}</div>
                </div>
              ))}
              <div style={{ border: `1px solid ${C.amber}55`, background: C.amberDim, padding: 14, color: C.bone, fontSize: 12, lineHeight: 1.5 }}>
                {SAFETY_COPY}
              </div>
            </div>
          </section>

          <section style={{ border: `1px solid ${C.rim}`, background: C.panel, padding: 20, alignSelf: 'center' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {[
                ['signup', 'Create account'],
                ['signin', 'Sign in'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id as 'signin' | 'signup')}
                  style={{ flex: 1, border: `1px solid ${mode === id ? C.lime : C.rim}`, borderRadius: 8, background: mode === id ? C.lime : C.deep, color: mode === id ? C.black : C.bone, padding: '11px 10px', fontSize: 12, fontWeight: 700 }}
                >
                  {label}
                </button>
              ))}
            </div>
            <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
              {mode === 'signup' ? (
                <label style={{ display: 'grid', gap: 6, color: C.muted, fontSize: 11 }}>
                  Full name
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} required style={fieldStyle} />
                </label>
              ) : null}
              <label style={{ display: 'grid', gap: 6, color: C.muted, fontSize: 11 }}>
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required style={fieldStyle} />
              </label>
              <label style={{ display: 'grid', gap: 6, color: C.muted, fontSize: 11 }}>
                Password
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} style={fieldStyle} />
              </label>
              {!isSupabaseConfigured ? (
                <div role="alert" style={{ border: `1px solid ${C.amber}55`, background: C.amberDim, color: C.bone, borderRadius: 8, padding: 12, fontSize: 12, lineHeight: 1.5 }}>
                  Supabase is not configured yet. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your environment.
                </div>
              ) : null}
              {error ? <div role="alert" style={{ color: C.red, fontSize: 12 }}>{error}</div> : null}
              {message ? <div style={{ color: C.lime, fontSize: 12, lineHeight: 1.45 }}>{message}</div> : null}
              <button type="submit" disabled={loading || !isSupabaseConfigured} style={{ border: 'none', borderRadius: 8, background: C.lime, color: C.black, padding: '14px 16px', fontWeight: 800, opacity: loading || !isSupabaseConfigured ? 0.5 : 1 }}>
                {loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={onUseReturningDemo}
                style={{ border: `1px solid ${C.rim}`, borderRadius: 8, background: C.deep, color: C.bone, padding: '13px 16px', fontWeight: 800 }}
              >
                Try returning patient demo
              </button>
            </form>
          </section>
        </div>
      </div>
    </Shell>
  )
}

const fieldStyle = {
  width: '100%',
  border: `1px solid ${C.rim}`,
  borderRadius: 8,
  background: C.deep,
  color: C.bone,
  padding: '13px 14px',
  fontSize: 14,
}

function IntakeView({ onSubmit, loading, error }: { onSubmit: (input: IntakeInput) => void; loading: boolean; error: string }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<IntakeInput>({
    fullName: '',
    injuryType: 'ACL + Meniscus',
    injurySide: 'Left knee',
    rehabPhase: 'Early Motion',
    week: 6,
    goal: 'Return to sport',
    baselinePain: 2,
    baselineSwelling: 2,
    baselineRom: 90,
    baselineDifficulty: 5,
  })

  const setField = (field: keyof IntakeInput, value: string | number) => setForm((current) => ({ ...current, [field]: value }))
  const sideOptions = SIDE_OPTIONS_BY_INJURY[form.injuryType] || SIDE_OPTIONS_BY_INJURY.Other
  const setInjuryType = (injuryType: string) => {
    const nextSideOptions = SIDE_OPTIONS_BY_INJURY[injuryType] || SIDE_OPTIONS_BY_INJURY.Other
    setForm((current) => ({
      ...current,
      injuryType,
      injurySide: nextSideOptions.includes(current.injurySide) ? current.injurySide : nextSideOptions[0],
    }))
  }
  const activeStep = INTAKE_STEPS[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === INTAKE_STEPS.length - 1
  const previewKey = getTemplateKey(form)
  const preview = STARTER_PLAN_PREVIEWS[previewKey] || STARTER_PLAN_PREVIEWS.default_conservative_template
  const safetyFlags = [
    form.baselinePain >= 7 ? { label: 'High pain', detail: 'Keep work gentle and check with your care team if this is new or worsening.' } : null,
    form.baselineSwelling >= 6 ? { label: 'Major swelling', detail: 'Consider compression, elevation, and a clinician check before increasing load.' } : null,
    form.baselineRom < 70 ? { label: 'Limited ROM', detail: 'Prioritize comfortable range of motion before adding harder strength work.' } : null,
    form.baselineDifficulty >= 8 ? { label: 'High difficulty', detail: 'Start below your limit and stop if symptoms climb sharply.' } : null,
  ].filter(Boolean) as { label: string; detail: string }[]

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLastStep) {
      setStepIndex((current) => Math.min(current + 1, INTAKE_STEPS.length - 1))
      return
    }
    onSubmit(form)
  }

  return (
    <Shell>
      <div className="intake-page">
        <section className="intake-shell">
          <div className="intake-layout">
            <form onSubmit={submit} className="intake-form">
              <div className="intake-header">
                <div className="intake-kicker">Injury intake</div>
                <h1 className="intake-title">Create a starter rehab plan</h1>
                <p className="intake-copy">{SAFETY_COPY}</p>
              </div>

              <div className="intake-stage-switcher" aria-label="Intake stages">
                {INTAKE_STEPS.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setStepIndex(index)}
                    aria-current={index === stepIndex ? 'step' : undefined}
                    className={`intake-stage-button${index === stepIndex ? ' intake-stage-button-active' : ''}`}
                  >
                    <span className="intake-stage-number">{index + 1}</span>
                    <span className="intake-stage-copy">
                      <span className="intake-stage-eyebrow">Stage</span>
                      <span className="intake-stage-label">{step.label}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="intake-card">
                <div>
                  <div style={intakeLabelStyle}>{activeStep.label}</div>
                  <div className="intake-card-title">
                    {activeStep.id === 'profile' ? 'Who is this plan for?' : activeStep.id === 'path' ? 'Choose the rehab path' : 'Set today’s baseline'}
                  </div>
                </div>

                {activeStep.id === 'profile' ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <label style={intakeLabelStyle}>
                      Full name
                      <input required value={form.fullName} onChange={(event) => setField('fullName', event.target.value)} style={fieldStyle} />
                    </label>
                    <SliderField label="Post-op / rehab week" value={form.week} min={0} max={24} unit="week" onChange={(value) => setField('week', value)} />
                  </div>
                ) : null}

                {activeStep.id === 'path' ? (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <SegmentedChoice label="Injury" value={form.injuryType} options={INJURY_OPTIONS} onChange={setInjuryType} />
                    <SegmentedChoice label="Side" value={form.injurySide} options={sideOptions} onChange={(value) => setField('injurySide', value)} />
                    <SegmentedChoice label="Phase" value={form.rehabPhase} options={PHASE_OPTIONS} onChange={(value) => setField('rehabPhase', value)} />
                    <SegmentedChoice label="Goal" value={form.goal} options={GOAL_OPTIONS} onChange={(value) => setField('goal', value)} />
                  </div>
                ) : null}

                {activeStep.id === 'baseline' ? (
                  <div style={{ display: 'grid', gap: 13 }}>
                    <SliderField label="Baseline pain" value={form.baselinePain} min={0} max={10} lowLabel="Calm" highLabel="High" onChange={(value) => setField('baselinePain', value)} />
                    <SliderField label="Baseline swelling" value={form.baselineSwelling} min={0} max={10} lowLabel="None" highLabel="Major" onChange={(value) => setField('baselineSwelling', value)} />
                    <SliderField label="Baseline ROM" value={form.baselineRom} min={0} max={140} unit="deg" lowLabel="Limited" highLabel="Fuller" onChange={(value) => setField('baselineRom', value)} />
                    <SliderField label="Baseline difficulty" value={form.baselineDifficulty} min={0} max={10} lowLabel="Easy" highLabel="Hard" onChange={(value) => setField('baselineDifficulty', value)} />
                  </div>
                ) : null}
              </div>

              {isLastStep && safetyFlags.length ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {safetyFlags.map((flag) => (
                    <div key={flag.label} role="status" style={{ border: `1px solid ${C.amber}66`, borderRadius: 8, background: C.amberDim, padding: 12, color: C.bone, fontSize: 12, lineHeight: 1.45 }}>
                      <strong style={{ color: C.amber }}>{flag.label}:</strong> {flag.detail}
                    </div>
                  ))}
                </div>
              ) : null}

              {error ? <div role="alert" style={{ color: C.red, fontSize: 12 }}>{error}</div> : null}
              <div className="intake-action-row">
                <button
                  type="button"
                  disabled={isFirstStep || loading}
                  onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
                  className="intake-button intake-button-secondary"
                  style={{ opacity: isFirstStep || loading ? 0.45 : 1 }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="intake-button intake-button-primary"
                  style={{ opacity: loading ? 0.5 : 1 }}
                >
                  {loading ? 'Creating...' : isLastStep ? 'Create starter plan' : 'Next'}
                </button>
              </div>
            </form>

            <aside className="intake-preview">
              <div>
                <div style={intakeLabelStyle}>Starter plan preview</div>
                <h2 className="intake-preview-title">
                  {preview.title}
                </h2>
                <p className="intake-preview-subtitle">
                  Week {form.week} · {form.injurySide} · {form.rehabPhase}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <PreviewMetric label="Stage" value={preview.stage} hot={false} />
                <PreviewMetric label="Load" value={preview.load} hot={false} />
              </div>
              <div className="intake-focus">
                <div style={{ color: C.bone, fontSize: 13, lineHeight: 1.5 }}>{preview.focus}</div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {preview.exercises.map((exercise) => (
                  <div key={exercise} className="intake-exercise">
                    <span className="intake-exercise-name">{exercise}</span>
                    <span className="intake-exercise-goal">{form.goal}</span>
                  </div>
                ))}
              </div>
              <div className="intake-preview-metrics">
                <PreviewMetric label="Pain" value={`${form.baselinePain}/10`} hot={form.baselinePain >= 7} />
                <PreviewMetric label="Swelling" value={`${form.baselineSwelling}/10`} hot={form.baselineSwelling >= 6} />
                <PreviewMetric label="ROM" value={`${form.baselineRom} deg`} hot={form.baselineRom < 70} />
                <PreviewMetric label="Difficulty" value={`${form.baselineDifficulty}/10`} hot={form.baselineDifficulty >= 8} />
              </div>
            </aside>
          </div>
        </section>
      </div>
    </Shell>
  )
}

function SegmentedChoice({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <fieldset style={{ border: 0, display: 'grid', gap: 8 }}>
      <legend style={intakeLabelStyle}>{label}</legend>
      <div className="intake-choice-grid">
        {options.map((option) => {
          const selected = value === option
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`intake-choice${selected ? ' intake-choice-active' : ''}`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function SliderField({ label, value, min, max, unit = '', lowLabel, highLabel, onChange }: { label: string; value: number; min: number; max: number; unit?: string; lowLabel?: string; highLabel?: string; onChange: (value: number) => void }) {
  return (
    <label style={{ display: 'grid', gap: 9 }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={intakeLabelStyle}>{label}</span>
        <strong style={{ color: C.bone, fontSize: 14 }}>{value}{unit ? ` ${unit}` : ''}</strong>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: '100%', accentColor: C.lime, cursor: 'pointer' }}
      />
      {lowLabel || highLabel ? (
        <span style={{ display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: 11 }}>
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </span>
      ) : null}
    </label>
  )
}

function PreviewMetric({ label, value, hot }: { label: string; value: string; hot: boolean }) {
  return (
    <div style={{ border: `1px solid ${hot ? C.amber : C.rim}`, borderRadius: 8, background: hot ? C.amberDim : 'rgba(16, 22, 29, 0.72)', padding: 12 }}>
      <div style={intakeLabelStyle}>{label}</div>
      <div style={{ color: hot ? C.amber : C.bone, fontWeight: 900, fontSize: value.length > 12 ? 14 : 20, lineHeight: 1.15, marginTop: 6 }}>{value}</div>
    </div>
  )
}

const intakeLabelStyle = {
  display: 'grid',
  gap: 6,
  fontFamily: "'Fira Code', monospace",
  fontSize: 10,
  color: C.muted,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
}

function makePatientProfile(patient: PatientRecord | null, plan: RehabPlanRecord | null, session: Session | null, override?: Record<string, unknown> | null) {
  if (!patient) return null

  return {
    id: patient.id,
    name: session?.user.user_metadata?.full_name || session?.user.email || 'Patient',
    injuryType: patient.injury_type,
    injurySide: patient.injury_side,
    rehabPhase: patient.rehab_phase,
    phaseLabel: `Week ${patient.week}`,
    week: patient.week,
    assignedPlan: plan?.name || 'Starter rehab plan',
    doctorScriptStatus: 'Starter plan created from injury intake',
    ptOversightStatus: 'Educational support',
    oversightMode: 'Starter plan',
    provider: 'Care team',
    planSummary: SAFETY_COPY,
    homeSubhead: `Week ${patient.week} · ${patient.injury_type}`,
    progressSubhead: `Week ${patient.week} · ${patient.injury_type}`,
    nextStep: 'Complete today’s exercises if symptoms stay within your usual range.',
    goal: patient.goal,
    ...override,
  }
}

export default function RehabPro() {
  const contentScrollRef = useRef<HTMLDivElement | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [plan, setPlan] = useState<RehabPlanRecord | null>(null)
  const [rehabItems, setRehabItems] = useState<RehabItem[]>([])
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([])
  const [tab, setTab] = useState('home')
  const [demoProfile, setDemoProfile] = useState<Record<string, unknown> | null>(null)

  const loadPatientData = async (activeSession: Session) => {
    const currentPatient = await getCurrentPatient(activeSession.user.id)
    setPatient(currentPatient)

    if (!currentPatient) {
      setPlan(null)
      setRehabItems([])
      setProgressLogs([])
      return
    }

    let activePlan = await getActivePlan(currentPatient.id)
    if (!activePlan) {
      activePlan = await createStarterPlan(currentPatient)
    }

    const [items, logs] = await Promise.all([
      getTodayPlan(currentPatient.id),
      getProgressData(currentPatient.id),
    ])

    setPlan(activePlan)
    setRehabItems(items)
    setProgressLogs(logs)
  }

  const clearPatientData = () => {
    setPatient(null)
    setPlan(null)
    setRehabItems([])
    setProgressLogs([])
  }

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }

    const client = supabase
    let mounted = true

    const loadInitialSession = async () => {
      try {
        const { data } = await client.auth.getSession()
        if (!mounted) return

        if (!data.session) {
          clearPatientData()
          setSession(null)
          return
        }

        await loadPatientData(data.session)
        if (mounted) {
          setSession(data.session)
        }
      } catch (loadError: any) {
        if (mounted) {
          setError(loadError.message || 'Could not load your rehab plan.')
        }
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    loadInitialSession()

    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT' || !nextSession) {
        clearPatientData()
        setSession(null)
        return
      }

      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(nextSession)
      }
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (tab === 'train') {
      contentScrollRef.current?.scrollTo?.({ top: 0 })
    }
  }, [tab])

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) return
    setActionLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (signUpError) throw signUpError
      if (data.session) {
        await loadPatientData(data.session)
        setSession(data.session)
        return
      }

      if (REQUIRE_EMAIL_CONFIRMATION) {
        setMessage(EMAIL_CONFIRMATION_MESSAGE)
        return
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setMessage(MVP_SIGNUP_BLOCKED_MESSAGE)
        return
      }
      if (signInData.session) {
        await loadPatientData(signInData.session)
      }
      setSession(signInData.session)
    } catch (requestError: any) {
      setError(requestError.message || 'Could not create account.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    if (!supabase) return
    setActionLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      if (data.session) {
        await loadPatientData(data.session)
      }
      setSession(data.session)
    } catch (requestError: any) {
      setError(requestError.message || 'Could not sign in.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSignOut = async () => {
    setDemoProfile(null)
    await supabase?.auth.signOut()
    setSession(null)
    clearPatientData()
    setTab('home')
  }

  const handleUseReturningDemo = () => {
    const profile = PATIENT_DEMO_PROFILES.pt_demo
    const demoPatient = {
      id: profile.id,
      profile_id: 'demo_returning_user',
      injury_type: profile.injuryType,
      injury_side: profile.injurySide,
      rehab_phase: profile.rehabPhase,
      week: profile.week,
      goal: 'Return to Basketball',
      baseline_pain: 6,
      baseline_swelling: 5,
      baseline_rom: 92,
      baseline_difficulty: 8,
    } satisfies PatientRecord
    const demoPlan = {
      id: 'demo_returning_plan',
      patient_id: demoPatient.id,
      template_key: 'acl_meniscus_returning_demo',
      name: profile.assignedPlan,
      status: 'active',
    } satisfies RehabPlanRecord

    setSession(null)
    setDemoProfile(profile)
    setPatient(demoPatient)
    setPlan(demoPlan)
    setRehabItems(REHAB_TODAY.map((item) => ({
      ...item,
      id: String(item.id),
      planExerciseId: `demo_plan_exercise_${item.id}`,
      exerciseId: `demo_exercise_${item.id}`,
    })))
    setProgressLogs([])
    setError('')
    setMessage('')
    setTab('home')
  }

  const handleSubmitIntake = async (input: IntakeInput) => {
    if (!session) return
    setActionLoading(true)
    setError('')

    try {
      const createdPatient = await createPatientFromIntake(session.user, input)
      const createdPlan = await createStarterPlan(createdPatient)
      const items = await getTodayPlan(createdPatient.id)
      setPatient(createdPatient)
      setPlan(createdPlan)
      setRehabItems(items)
      setProgressLogs([])
      setTab('home')
    } catch (requestError: any) {
      setError(requestError.message || 'Could not create starter plan.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitSessionCheckIn = async (checkInDetails: any) => {
    if (!patient) return
    setActionLoading(true)
    setError('')

    try {
      if (demoProfile) {
        setProgressLogs((current) => [
          ...current,
          {
            id: `demo_session_${Date.now()}`,
            patientId: patient.id,
            ts: Date.now(),
            type: 'session',
            pain: checkInDetails.pain,
            swelling: checkInDetails.swelling,
            difficulty: checkInDetails.difficulty,
            done: checkInDetails.done,
            total: checkInDetails.total,
            completion: checkInDetails.completion,
          },
        ])
        return
      }

      const workoutSession = await createSession(patient.id)
      await saveSessionLogs({
        patientId: patient.id,
        sessionId: workoutSession.id,
        rehabItems,
        pain: checkInDetails.pain,
        swelling: checkInDetails.swelling,
        difficulty: checkInDetails.difficulty,
      })
      setProgressLogs(await getProgressData(patient.id))
    } catch (requestError: any) {
      setError(requestError.message || 'Could not save this workout.')
    } finally {
      setActionLoading(false)
    }
  }

  const patientProfile = useMemo(() => makePatientProfile(patient, plan, session, demoProfile), [patient, plan, session, demoProfile])
  const progressBaseline = demoProfile
    ? RETURNING_PATIENT_PROGRESS
    : patient
    ? [
        {
          label: 'Baseline',
          pain: patient.baseline_pain,
          swelling: patient.baseline_swelling,
          rom: patient.baseline_rom,
          difficulty: patient.baseline_difficulty,
          completion: 0,
        },
      ]
    : []
  const completionHistory = demoProfile ? RETURNING_PATIENT_COMPLETION_HISTORY : []

  if (authLoading) {
    return (
      <Shell>
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: C.muted }}>Loading RehabPro...</div>
      </Shell>
    )
  }

  if (!session && !demoProfile) {
    return <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} onUseReturningDemo={handleUseReturningDemo} loading={actionLoading} error={error} message={message} />
  }

  if (!patient) {
    return <IntakeView onSubmit={handleSubmitIntake} loading={actionLoading} error={error} />
  }

  return (
    <>
      <AppStyles />
      <div
        style={{
          background: C.black,
          minHeight: '100vh',
          height: '100vh',
          width: '100%',
          maxWidth: 'min(430px, 100%)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ padding: '20px 20px 12px', borderBottom: `1px solid ${C.rim}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, letterSpacing: '0.04em', lineHeight: 1 }}>
                REHAB<span style={{ color: C.lime }}>PRO</span>
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.08em', marginTop: 6 }}>
                {patientProfile?.name} · {patient.rehab_phase.toUpperCase()}
              </div>
            </div>
            <button type="button" onClick={handleSignOut} style={{ padding: '8px 12px', borderRadius: 12, border: `1px solid ${C.rim}`, background: C.panel, color: C.bone, fontSize: 11 }}>
              SIGN OUT
            </button>
          </div>
          <div style={{ border: `1px solid ${C.amber}45`, background: C.amberDim, borderRadius: 8, padding: 10, color: C.bone, fontSize: 11, lineHeight: 1.45, marginTop: 12 }}>
            {SAFETY_COPY}
          </div>
          {error ? <div role="alert" style={{ color: C.red, fontSize: 12, marginTop: 10 }}>{error}</div> : null}
        </div>

        <div ref={contentScrollRef} style={{ flex: 1, padding: '16px 20px', paddingBottom: 'calc(112px + env(safe-area-inset-bottom, 0))', overflowY: 'auto' }}>
          {tab === 'home' && <HomeView patientProfile={patientProfile} rehabItems={rehabItems} milestones={MILESTONES} ptMessage={PT_MSG} schedule={SCHEDULE} onNavigate={setTab} />}
          {tab === 'train' && <TrainView rehabItems={rehabItems} setRehabItems={setRehabItems} onSubmitCheckIn={handleSubmitSessionCheckIn} />}
          {tab === 'progress' && <ProgressView patientProfile={patientProfile} milestones={MILESTONES} progressData={progressBaseline} completionHistory={completionHistory} checkIns={progressLogs} />}
          {actionLoading && tab !== 'train' ? <div style={{ color: C.muted, fontSize: 12, marginTop: 12 }}>Syncing...</div> : null}
        </div>

        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            maxWidth: 'min(430px, 100%)',
            margin: '0 auto',
            borderTop: `1px solid ${C.rim}`,
            background: 'rgba(15, 16, 16, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            gap: 3,
            padding: '8px 8px calc(10px + env(safe-area-inset-bottom, 0))',
            zIndex: 20,
            boxShadow: '0 -10px 30px rgba(0,0,0,0.42)',
          }}
        >
          {TABS.map((item) => {
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '8px 2px 7px',
                  border: `1px solid ${active ? C.limeMid : 'transparent'}`,
                  borderRadius: 13,
                  background: active ? C.limeDim : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  minHeight: 54,
                }}
              >
                <div aria-hidden="true" style={{ height: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, lineHeight: 1, color: active ? C.lime : C.ghost }}>
                  {item.icon}
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Bebas Neue', cursive", fontSize: 11, lineHeight: 1, letterSpacing: '0.08em', color: active ? C.lime : C.muted }}>
                  {item.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
