import { useEffect } from 'react'
import { C } from './constants/colors'
import { AUTH_USERS } from './data/authUsers'
import { MILESTONES, REHAB_TODAY, INTAKE_REHAB_TODAY, PATIENT_DEMO_PROFILES, PT_MSG, PT_PATIENTS, PT_THREADS, EXERCISE_NAMES, RETURNING_PATIENT_PROGRESS, RETURNING_PATIENT_COMPLETION_HISTORY } from './data/rehabMock'
import { MOCK_CHECK_INS } from './data/mockCheckIns'
import { MOCK_REPORTS } from './data/mockReports'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { HomeView } from './components/patient/HomeView.jsx'
import { TrainView } from './components/patient/TrainView.jsx'
import { ProgressView } from './components/patient/ProgressView.jsx'
import { ReportView } from './components/patient/ReportView.jsx'
import { IntakeView } from './components/patient/IntakeView.jsx'
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
  { id: 'report', icon: '◇', label: 'REPORT' },
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
  pt: {
    title: 'PT dashboard',
    message: 'New patient reports and check-ins require review.',
  },
}

const INITIAL_INTAKE = {
  step: 0,
  completed: false,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  injury: '',
  injurySide: '',
  treatmentStage: '',
  scriptFileName: '',
  scriptText: '',
  pain: '',
  swelling: '',
  primaryGoal: '',
  redFlags: '',
  oversight: '',
  additionalNotes: '',
}

function mergeExerciseMetadata(savedItems: any[], sourceItems: any[]) {
  return savedItems.map((item) => {
    const source = sourceItems.find((candidate) => candidate.id === item.id || candidate.name === item.name)
    return source ? { ...source, done: item.done } : item
  })
}

export default function RehabPro() {
  const [authUser, setAuthUser] = useLocalStorageState<AuthUser | null>('rehabpro:authUser', null)
  const [viewMode, setViewMode] = useLocalStorageState<'patient' | 'pt'>('rehabpro:viewMode', authUser?.role ?? 'patient')
  const [tab, setTab] = useLocalStorageState('rehabpro:tab', 'home')
  const [rehabItems, setRehabItems] = useLocalStorageState<any[]>('rehabpro:rehabItems', REHAB_TODAY)
  const [ptPatients, setPtPatients] = useLocalStorageState('rehabpro:ptPatients', PT_PATIENTS)
  const [selectedPatientId, setSelectedPatientId] = useLocalStorageState<string | null>('rehabpro:selectedPatientId', null)
  const [ptDetailMode, setPtDetailMode] = useLocalStorageState('rehabpro:ptDetailMode', false)
  const [ptThreads, setPtThreads] = useLocalStorageState('rehabpro:ptThreads', PT_THREADS)
  const [activeThreadId, setActiveThreadId] = useLocalStorageState('rehabpro:activeThreadId', PT_THREADS[0].id)
  const [reports, setReports] = useLocalStorageState('rehabpro:reports', MOCK_REPORTS)
  const [checkIns, setCheckIns] = useLocalStorageState<any[]>('rehabpro:checkIns', MOCK_CHECK_INS)
  const [intake, setIntake] = useLocalStorageState('rehabpro:intake:pt_intake', INITIAL_INTAKE)

  const signedInUser = authUser?.role === 'patient' ? authUser : null
  const currentRole: 'patient' | 'pt' = signedInUser?.role ?? viewMode
  const patientProfiles = PATIENT_DEMO_PROFILES as Record<string, any>
  const currentPatientProfile = signedInUser?.patientId ? patientProfiles[signedInUser.patientId] : null
  const isIntakePatient = signedInUser?.patientId === 'pt_intake'
  const demoPatientUsers = AUTH_USERS.filter((user) => user.role === 'patient' && user.patientId && patientProfiles[user.patientId])

  useEffect(() => {
    if (authUser?.role === 'patient' && viewMode !== 'patient') {
      setViewMode('patient')
    }
  }, [authUser, viewMode, setViewMode])

  useEffect(() => {
    if (authUser?.role === 'pt') {
      setAuthUser(null)
      setViewMode('patient')
      setTab('home')
      setPtDetailMode(false)
      setSelectedPatientId(null)
      setActiveThreadId(PT_THREADS[0].id)
    }
  }, [authUser?.role, setActiveThreadId, setAuthUser, setPtDetailMode, setSelectedPatientId, setTab, setViewMode])

  useEffect(() => {
    if (authUser?.role !== 'patient') {
      return
    }

    const sourceItems = authUser.patientId === 'pt_intake' ? INTAKE_REHAB_TODAY : REHAB_TODAY
    setRehabItems((prev) => {
      const merged = mergeExerciseMetadata(prev, sourceItems)
      return JSON.stringify(merged) === JSON.stringify(prev) ? prev : merged
    })
  }, [authUser?.patientId, authUser?.role, setRehabItems])

  const selectedPatient = ptPatients.find((patient) => patient.id === selectedPatientId)
  const patientUnreadReports = signedInUser?.patientId ? reports.filter((report) => report.patientId === signedInUser.patientId && !report.ptRead).length : 0
  const unresolvedReports = currentRole === 'pt' ? reports.filter((report) => !report.ptRead).length : 0
  const recentCheckIns = currentRole === 'pt' ? checkIns.filter((checkIn) => Date.now() - checkIn.ts < 1000 * 60 * 60 * 24).length : 0

  const handleDemoLogin = (matchedUser: AuthUser) => {
    setAuthUser(matchedUser)
    setViewMode('patient')
    setTab('home')
    setPtDetailMode(false)
    setSelectedPatientId(matchedUser.patientId || null)
    setActiveThreadId(PT_THREADS.find((thread) => thread.patientId === matchedUser.patientId)?.id || PT_THREADS[0].id)
    setRehabItems(matchedUser.patientId === 'pt_intake' ? INTAKE_REHAB_TODAY : REHAB_TODAY)
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

  const handleSubmitReport = (reportDetails: any) => {
    const patientId = signedInUser?.patientId
    if (!patientId) {
      return
    }

    const report = {
      id: `r_${Date.now()}`,
      patientId,
      ts: Date.now(),
      ...reportDetails,
      ptRead: false,
      ptReply: null,
    }

    setReports((prev) => [report, ...prev])
  }

  const handleSubmitSessionCheckIn = (checkInDetails: any) => {
    const patientId = signedInUser?.patientId
    if (!patientId) {
      return
    }

    setCheckIns((prev) => [
      ...prev,
      {
        id: `session_${Date.now()}`,
        patientId,
        ts: Date.now(),
        type: 'session',
        ...checkInDetails,
      },
    ])
  }

  const handleCompleteIntake = (completedIntake: any) => {
    setIntake(completedIntake)
    setRehabItems(INTAKE_REHAB_TODAY)
  }

  if (!signedInUser) {
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
              Choose a demo patient. One returns to an active plan, the other starts with script intake.
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {demoPatientUsers.map((user) => {
                const profile = patientProfiles[user.patientId as string]
                return (
                  <button
                    key={user.patientId}
                    type="button"
                    onClick={() => handleDemoLogin(user as AuthUser)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: 16,
                      border: `1px solid ${C.rim}`,
                      background: C.deep,
                      color: C.bone,
                      textAlign: 'left',
                      display: 'grid',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: '0.04em' }}>
                        {profile.demoLabel}
                      </div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Demo
                      </div>
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone }}>
                      {profile.name} · {profile.injuryType}
                    </div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, lineHeight: 1.5 }}>
                      {profile.rehabPhase} · {profile.ptOversightStatus}
                    </div>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => handleDemoLogin(demoPatientUsers[0] as AuthUser)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: 'none', background: C.lime, color: C.black, fontFamily: "'Bebas Neue', cursive", fontSize: 14, letterSpacing: '0.08em' }}
              >
                START RETURNING PATIENT DEMO
              </button>
            </div>
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
                  {currentPatientProfile?.name ?? signedInUser.name} · {currentRole === 'patient' ? currentPatientProfile?.rehabPhase.toUpperCase() ?? 'PATIENT' : 'PT'}
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
          {currentRole === 'pt' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 180, padding: '12px 14px', borderRadius: 16, background: C.panel, border: `1px solid ${C.rim}` }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  {NOTIFICATION_SUMMARY.pt.title}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.5 }}>
                  {NOTIFICATION_SUMMARY.pt.message}
                </div>
              </div>
              <div style={{ minWidth: 120, padding: '12px 14px', borderRadius: 16, background: C.redDim, border: `1px solid ${C.red}` }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Pending items
                </div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: C.red }}>
                  {unresolvedReports}
                </div>
              </div>
            </div>
          ) : null}
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
          {tab === 'home' && (currentRole === 'pt' ? <PtHomeView patients={ptPatients} selectedPatientId={selectedPatientId} onSelectPatient={handleSelectPatient} unresolvedReports={unresolvedReports} recentCheckIns={recentCheckIns} /> : isIntakePatient ? <IntakeView intake={intake} onChange={setIntake} onComplete={handleCompleteIntake} onOpenPlan={() => setTab('train')} /> : <HomeView patientProfile={currentPatientProfile} rehabItems={rehabItems} milestones={MILESTONES} ptMessage={PT_MSG} schedule={SCHEDULE} notification={{ unreadReports: patientUnreadReports }} onNavigate={setTab} />)}
          {tab === 'train' && (currentRole === 'pt' ? <PtTrainView patient={selectedPatient} exerciseNames={EXERCISE_NAMES} onAssign={handleAssignExercise} onUnassign={handleUnassignExercise} /> : isIntakePatient && !intake.completed ? <IntakeView intake={intake} onChange={setIntake} onComplete={handleCompleteIntake} onOpenPlan={() => setTab('train')} /> : <TrainView rehabItems={rehabItems} setRehabItems={setRehabItems} onSubmitCheckIn={handleSubmitSessionCheckIn} />)}
          {tab === 'progress' && <ProgressView patientProfile={currentPatientProfile} milestones={MILESTONES} progressData={RETURNING_PATIENT_PROGRESS} completionHistory={RETURNING_PATIENT_COMPLETION_HISTORY} checkIns={checkIns.filter((checkIn) => checkIn.patientId === signedInUser.patientId && checkIn.type === 'session')} />}
          {tab === 'pt' && (currentRole === 'pt' ? <MessagesView threads={ptThreads} activeThreadId={activeThreadId} onSelectThread={setActiveThreadId} onSendMessage={handleSendPtMessage} onBack={() => setActiveThreadId('')} /> : <PTChat />)}
          {tab === 'report' && currentRole !== 'pt' && <ReportView rehabItems={rehabItems} onSubmit={handleSubmitReport} />}
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
          {(currentRole === 'pt' ? (ptDetailMode ? PT_PATIENT_TABS : PT_HOME_TABS) : isIntakePatient && !intake.completed ? TABS.filter((item) => item.id === 'home') : TABS).map((t) => {
            const active = tab === t.id
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
                <div style={{ fontSize: 20, color: active ? C.lime : C.muted, transition: 'color 0.15s' }}>{t.icon}</div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 11, letterSpacing: '0.1em', color: active ? C.lime : C.muted, transition: 'color 0.15s' }}>{t.label}</div>
                {active && <div style={{ width: 18, height: 2, borderRadius: 1, background: C.lime }} />}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
