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
      @media (max-width: 520px) {
        body { font-size: 14px; }
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
  const [form, setForm] = useState({
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

  const setField = (field: string, value: string | number) => setForm((current) => ({ ...current, [field]: value }))

  return (
    <Shell>
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
        <section style={{ width: '100%', maxWidth: 520, border: `1px solid ${C.rim}`, background: C.panel, padding: 20 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Injury intake
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, color: C.bone, lineHeight: 1, marginTop: 8 }}>
            Create starter plan
          </h1>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginTop: 8 }}>{SAFETY_COPY}</p>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit(form)
            }}
            style={{ display: 'grid', gap: 12, marginTop: 18 }}
          >
            <label style={intakeLabelStyle}>Full name<input required value={form.fullName} onChange={(event) => setField('fullName', event.target.value)} style={fieldStyle} /></label>
            <label style={intakeLabelStyle}>
              Injury type
              <select value={form.injuryType} onChange={(event) => setField('injuryType', event.target.value)} style={fieldStyle}>
                <option>ACL + Meniscus</option>
                <option>Patellar Tendon</option>
                <option>Achilles</option>
                <option>Other</option>
              </select>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={intakeLabelStyle}>Side<input value={form.injurySide} onChange={(event) => setField('injurySide', event.target.value)} style={fieldStyle} /></label>
              <label style={intakeLabelStyle}>Week<input type="number" min={0} value={form.week} onChange={(event) => setField('week', Number(event.target.value))} style={fieldStyle} /></label>
            </div>
            <label style={intakeLabelStyle}>Rehab phase<input value={form.rehabPhase} onChange={(event) => setField('rehabPhase', event.target.value)} style={fieldStyle} /></label>
            <label style={intakeLabelStyle}>Goal<input value={form.goal} onChange={(event) => setField('goal', event.target.value)} style={fieldStyle} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={intakeLabelStyle}>Baseline pain<input type="number" min={0} max={10} value={form.baselinePain} onChange={(event) => setField('baselinePain', Number(event.target.value))} style={fieldStyle} /></label>
              <label style={intakeLabelStyle}>Baseline swelling<input type="number" min={0} max={10} value={form.baselineSwelling} onChange={(event) => setField('baselineSwelling', Number(event.target.value))} style={fieldStyle} /></label>
              <label style={intakeLabelStyle}>Baseline ROM<input type="number" min={0} value={form.baselineRom} onChange={(event) => setField('baselineRom', Number(event.target.value))} style={fieldStyle} /></label>
              <label style={intakeLabelStyle}>Baseline difficulty<input type="number" min={0} max={10} value={form.baselineDifficulty} onChange={(event) => setField('baselineDifficulty', Number(event.target.value))} style={fieldStyle} /></label>
            </div>
            {error ? <div role="alert" style={{ color: C.red, fontSize: 12 }}>{error}</div> : null}
            <button type="submit" disabled={loading} style={{ border: 'none', borderRadius: 8, background: C.lime, color: C.black, padding: 14, fontWeight: 800, opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Creating...' : 'Create starter plan'}
            </button>
          </form>
        </section>
      </div>
    </Shell>
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
      } else {
        setMessage('Account created. Check your email to confirm your sign-in, then return here.')
      }
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
    const profile = PATIENT_DEMO_PROFILES.pt_jason
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
