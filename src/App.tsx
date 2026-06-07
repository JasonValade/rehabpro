import { FormEvent, useEffect, useState } from 'react'
import { C } from './constants/colors'
import { AUTH_USERS } from './data/authUsers'
import { MILESTONES, PERF_DATA, REHAB_TODAY, GYM_TODAY, LOCKED_EXERCISES, PT_MSG, PT_PATIENTS, PT_THREADS, EXERCISE_NAMES } from './data/rehabMock'
import { MOCK_CHECK_INS } from './data/mockCheckIns'
import { MOCK_REPORTS } from './data/mockReports'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { HomeView } from './components/patient/HomeView.jsx'
import { TrainView } from './components/patient/TrainView.jsx'
import { ProgressView } from './components/patient/ProgressView.jsx'
import { ReportView } from './components/patient/ReportView.jsx'
import { PtHomeView } from './components/pt/PtHomeView.jsx'
import { PtTrainView } from './components/pt/PtTrainView.jsx'
import { MessagesView } from './components/pt/MessagesView.jsx'
import { PTChat } from './components/pt/PTChat.jsx'

type AuthUser = {
  username: string
  role: 'patient' | 'pt'
  name: string
  patientId: string | null
}

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Fira+Code:wght@400;500;600&display=swap');
`

const TABS = [
  { id: 'home', icon: '⬡', label: 'HOME' },
  { id: 'train', icon: '◈', label: 'TRAIN' },
  { id: 'progress', icon: '◎', label: 'PROGRESS' },
  { id: 'pt', icon: '⊕', label: 'PT' },
  { id: 'report', icon: '', label: 'REPORT' },
]

const PT_HOME_TABS = [
  { id: 'home', icon: '⬡', label: 'HOME' },
  { id: 'pt', icon: '⊕', label: 'MSG' },
]

const PT_PATIENT_TABS = [
  { id: 'train', icon: '◈', label: 'TRAIN' },
  { id: 'progress', icon: '◎', label: 'PROGRESS' },
  { id: 'pt', icon: '⊕', label: 'MSG' },
]

const SCHEDULE = [
  { workout: 'Mobility + Rehab', details: 'Hip hinge, terminal knee extension, wall slides', highlight: 'Active this week' },
  { workout: 'Strength + Balance', details: 'Step-ups, band walks, single-leg balance', highlight: 'Repeats weekly' },
  { workout: 'Active Recovery', details: 'Compression, rest, low-load glute bridge', highlight: 'Repeats weekly' },
  { workout: 'Load Tolerance', details: 'Goblet squat, mini squat, calf raise', highlight: 'Repeats weekly' },
  { workout: 'Sport Prep', details: 'Agility ladder, hop progressions, landing', highlight: 'Repeats weekly' },
]

const NOTIFICATION_SUMMARY = {
  patient: {
    title: 'Next check-in',
    message: 'Keep notes on pain, swelling, and confidence for PT review.',
  },
  pt: {
    title: 'PT dashboard',
    message: 'New patient reports and check-ins require review.',
  },
}

export default function RehabPro() {
  const [authUser, setAuthUser] = useLocalStorageState<AuthUser | null>('rehabpro:authUser', null)
  const [viewMode, setViewMode] = useLocalStorageState<'patient' | 'pt'>('rehabpro:viewMode', authUser?.role ?? 'patient')
  const [tab, setTab] = useLocalStorageState('rehabpro:tab', 'home')
  const [rehabItems, setRehabItems] = useLocalStorageState('rehabpro:rehabItems', REHAB_TODAY)
  const [gymItems, setGymItems] = useLocalStorageState('rehabpro:gymItems', GYM_TODAY)
  const [ptPatients, setPtPatients] = useLocalStorageState('rehabpro:ptPatients', PT_PATIENTS)
  const [selectedPatientId, setSelectedPatientId] = useLocalStorageState<string | null>('rehabpro:selectedPatientId', null)
  const [ptDetailMode, setPtDetailMode] = useLocalStorageState('rehabpro:ptDetailMode', false)
  const [ptThreads, setPtThreads] = useLocalStorageState('rehabpro:ptThreads', PT_THREADS)
  const [activeThreadId, setActiveThreadId] = useLocalStorageState('rehabpro:activeThreadId', PT_THREADS[0].id)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [reports, setReports] = useLocalStorageState('rehabpro:reports', MOCK_REPORTS)
  const [checkIns, setCheckIns] = useLocalStorageState('rehabpro:checkIns', MOCK_CHECK_INS)

  const currentRole = authUser?.role || viewMode

  useEffect(() => {
    if (authUser && authUser.role !== viewMode) {
      setViewMode(authUser.role)
    }
  }, [authUser, viewMode, setViewMode])

  const selectedPatient = ptPatients.find((patient) => patient.id === selectedPatientId)
  const patientCheckIns = authUser?.patientId ? checkIns.filter((checkIn) => checkIn.patientId === authUser.patientId) : []
  const patientUnreadReports = authUser?.patientId ? reports.filter((report) => report.patientId === authUser.patientId && !report.ptRead).length : 0
  const unresolvedReports = currentRole === 'pt' ? reports.filter((report) => !report.ptRead).length : 0
  const recentCheckIns = currentRole === 'pt' ? checkIns.filter((checkIn) => Date.now() - checkIn.ts < 1000 * 60 * 60 * 24).length : patientCheckIns.length
  const scheduleAlerts = currentRole === 'patient' ? patientCheckIns[0] : null

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const matchedUser = AUTH_USERS.find(
      (user) => user.username.toLowerCase() === loginForm.username.toLowerCase() && user.password === loginForm.password,
    ) as AuthUser | undefined

    if (!matchedUser) {
      setLoginError('Incorrect username or password.')
      return
    }

    setAuthUser(matchedUser)
    setViewMode(matchedUser.role)
    setTab('home')
    setPtDetailMode(false)
    setSelectedPatientId(matchedUser.patientId || null)
    setActiveThreadId(PT_THREADS[0].id)
    setLoginForm({ username: '', password: '' })
    setLoginError('')
  }

  const handleLogout = () => {
    setAuthUser(null)
    setViewMode('patient')
    setTab('home')
    setPtDetailMode(false)
    setSelectedPatientId(null)
    setActiveThreadId(PT_THREADS[0].id)
  }

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId)
    setPtDetailMode(true)
    setTab('train')
  }

  const handleBackToPtHome = () => {
    setPtDetailMode(false)
    setTab('home')
    setActiveThreadId('')
  }

  const handleAssignExercise = (patientId: string, exercise: string) => {
    setPtPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId && !patient.assignedExercises.includes(exercise)
          ? { ...patient, assignedExercises: [...patient.assignedExercises, exercise] }
          : patient,
      ),
    )
  }

  const handleUnassignExercise = (patientId: string, exercise: string) => {
    setPtPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId
          ? { ...patient, assignedExercises: patient.assignedExercises.filter((item) => item !== exercise) }
          : patient,
      ),
    )
  }

  const handleSendPtMessage = (threadId: string, text: string) => {
    setPtThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              hasReport: false,
              updated: 'Now',
              excerpt: text,
              messages: [...thread.messages, { sender: 'pt', text, ts: Date.now() }],
            }
          : thread,
      ),
    )
  }

  if (!authUser) {
    return (
      <>
        <style>{`
          ${FONTS}
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: ${C.black}; color: ${C.bone}; }
          body { min-height: 100vh; }
          ::-webkit-scrollbar { width: 3px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${C.rim}; border-radius: 2px; }
          input::placeholder, textarea::placeholder { color: ${C.muted}; }
          button { cursor: pointer; }
        `}</style>
        <div
          style={{
            background: C.black,
            minHeight: '100vh',
            width: '100%',
            maxWidth: 'min(430px, 100%)',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'DM Sans', sans-serif",
            padding: 20,
          }}
        >
          <div style={{ width: '100%', maxWidth: 380, padding: 24, borderRadius: 28, border: `1px solid ${C.rim}`, background: C.panel }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: C.bone, marginBottom: 16 }}>
              REHAB<span style={{ color: C.lime }}>PRO</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: C.muted, marginBottom: 24 }}>
              Sign in as a patient or PT to continue. PT access is protected and separate from patient mode.
            </div>
            <form onSubmit={handleLogin}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', marginBottom: 8, color: C.bone }}>
                USERNAME
              </label>
              <input
                value={loginForm.username}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="jason / sara / mike / alex"
                style={{ width: '100%', marginBottom: 16, padding: '12px 14px', borderRadius: 14, border: `1px solid ${C.rim}`, background: C.deep, color: C.bone, fontSize: 14 }}
              />
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.12em', marginBottom: 8, color: C.bone }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="patient123 / pt123"
                style={{ width: '100%', marginBottom: 20, padding: '12px 14px', borderRadius: 14, border: `1px solid ${C.rim}`, background: C.deep, color: C.bone, fontSize: 14 }}
              />
              {loginError ? <div style={{ marginBottom: 20, color: C.red, fontSize: 12 }}>{loginError}</div> : null}
              <button
                type="submit"
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: 'none', background: C.lime, color: C.black, fontFamily: "'Bebas Neue', cursive", fontSize: 14, letterSpacing: '0.08em' }}
              >
                SIGN IN
              </button>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.black}; color: ${C.bone}; }
        body { min-height: 100vh; }
        button, input, textarea { font: inherit; }
        button, input, textarea { outline: none; }
        button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid ${C.lime}; outline-offset: 3px; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.rim}; border-radius: 2px; }
        input::placeholder, textarea::placeholder { color: ${C.muted}; }
        button { cursor: pointer; }
        @media (max-width: 520px) {
          body { font-size: 14px; }
        }
        @keyframes bounce {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, letterSpacing: '0.04em', lineHeight: 1 }}>
                REHAB<span style={{ color: C.lime }}>PRO</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.08em' }}>
                  {authUser.name} · {currentRole === 'patient' ? 'PATIENT' : 'PT'}
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: '0.08em' }}>
                  {currentRole === 'patient' ? 'PATIENT MODE' : 'PT MODE'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: `1px solid ${C.rim}`,
                  background: C.panel,
                  color: C.bone,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                SIGN OUT
              </button>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: '0.08em' }}>
                {currentRole === 'pt' ? 'PT ACCESS' : 'PATIENT ACCESS'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 180, padding: '12px 14px', borderRadius: 16, background: C.panel, border: `1px solid ${C.rim}` }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                {NOTIFICATION_SUMMARY[currentRole].title}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.5 }}>
                {currentRole === 'patient' ? NOTIFICATION_SUMMARY.patient.message : NOTIFICATION_SUMMARY.pt.message}
              </div>
            </div>
            <div style={{ minWidth: 120, padding: '12px 14px', borderRadius: 16, background: currentRole === 'pt' ? C.redDim : C.blueDim, border: `1px solid ${currentRole === 'pt' ? C.red : C.blue}` }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                {currentRole === 'pt' ? 'Pending items' : 'Recent check-ins'}
              </div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: currentRole === 'pt' ? C.red : C.blue }}>
                {currentRole === 'pt' ? `${unresolvedReports}` : `${recentCheckIns}`}
              </div>
            </div>
          </div>
        </div>

        {currentRole === 'pt' && ptDetailMode && (
          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              onClick={handleBackToPtHome}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: `1px solid ${C.rim}`,
                background: C.panel,
                color: C.bone,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ← Back to patients
            </button>
          </div>
        )}

        <div style={{ flex: 1, padding: '16px 20px', paddingBottom: 'calc(112px + env(safe-area-inset-bottom, 0))', overflowY: 'auto' }}>
          {tab === 'home' && (currentRole === 'pt' ? <PtHomeView patients={ptPatients} selectedPatientId={selectedPatientId} onSelectPatient={handleSelectPatient} schedule={SCHEDULE} unresolvedReports={unresolvedReports} recentCheckIns={recentCheckIns} /> : <HomeView rehabItems={rehabItems} gymItems={gymItems} milestones={MILESTONES} perfData={PERF_DATA} ptMessage={PT_MSG} lockedExercises={LOCKED_EXERCISES} schedule={SCHEDULE} notification={{ latestCheckIn: scheduleAlerts, unreadReports: patientUnreadReports }} />)}
          {tab === 'train' && (currentRole === 'pt' ? <PtTrainView patient={selectedPatient} exerciseNames={EXERCISE_NAMES} onAssign={handleAssignExercise} onUnassign={handleUnassignExercise} /> : <TrainView rehabItems={rehabItems} setRehabItems={setRehabItems} gymItems={gymItems} setGymItems={setGymItems} />)}
          {tab === 'progress' && <ProgressView milestones={MILESTONES} perfData={PERF_DATA} />}
          {tab === 'pt' && (currentRole === 'pt' ? <MessagesView threads={ptThreads} activeThreadId={activeThreadId} onSelectThread={setActiveThreadId} onSendMessage={handleSendPtMessage} onBack={() => setActiveThreadId('')} /> : <PTChat />)}
          {tab === 'report' && currentRole !== 'pt' && <ReportView rehabItems={rehabItems} />}
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
            background: C.deep,
            display: 'flex',
            padding: '10px 4px calc(20px + env(safe-area-inset-bottom, 0))',
            zIndex: 20,
            boxShadow: '0 -8px 24px rgba(0,0,0,0.35)',
          }}
        >
          {(currentRole === 'pt' ? (ptDetailMode ? PT_PATIENT_TABS : PT_HOME_TABS) : TABS).map((t) => {
            const active = tab === t.id
            const isReport = t.id === 'report'
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: '12px 0 10px',
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 20, color: active ? (isReport ? C.red : C.lime) : C.muted, transition: 'color 0.15s' }}>{t.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 11, letterSpacing: '0.1em', color: active ? (isReport ? C.red : C.lime) : C.muted, transition: 'color 0.15s' }}>{t.label}</div>
                {active && <div style={{ width: 18, height: 2, borderRadius: 1, background: isReport ? C.red : C.lime }} />}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
