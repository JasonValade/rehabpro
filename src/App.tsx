import { useEffect, useMemo, useRef } from 'react'
import { C } from './constants/colors'
import { AUTH_USERS } from './data/authUsers'
import { MILESTONES, REHAB_TODAY, INTAKE_REHAB_TODAY, PATIENT_DEMO_PROFILES, PT_MSG, PT_PATIENTS, PT_THREADS, EXERCISE_NAMES, RETURNING_PATIENT_PROGRESS, RETURNING_PATIENT_COMPLETION_HISTORY } from './data/rehabMock'
import { MOCK_CHECK_INS } from './data/mockCheckIns'
import { MOCK_REPORTS } from './data/mockReports'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { formatSymptomReportMessage } from './utils/reportChat.js'
import { HomeView } from './components/patient/HomeView.jsx'
import { TrainView } from './components/patient/TrainView.jsx'
import { ProgressView } from './components/patient/ProgressView.jsx'
import { ReportView } from './components/patient/ReportView.jsx'
import { IntakeView } from './components/patient/IntakeView.jsx'
import { PtPortalView } from './components/pt/PtPortalView.jsx'
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

const normalizePtPatient = (patient: any) => {
  if (patient.id === 'pt_jason' && patient.avatar !== 'JV') {
    return { ...patient, avatar: 'JV' }
  }

  return patient
}

const visiblePtPatients = (patients: any[]) => patients.map(normalizePtPatient).filter((patient) => patient.id !== 'pt_intake')

const backfillDemoCheckIns = (checkIns: any[]) => {
  const existingIds = new Set(checkIns.map((checkIn) => checkIn.id))
  const missingDemoCheckIns = MOCK_CHECK_INS.filter((checkIn) => !existingIds.has(checkIn.id))

  if (missingDemoCheckIns.length === 0) {
    return checkIns
  }

  return [...checkIns, ...missingDemoCheckIns].sort((a, b) => a.ts - b.ts)
}

const formatThreadUpdated = (ts: number) => {
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

const reportThreadId = (patientId: string) => `thread_${patientId}`

const mergeReportsIntoThreads = (threads: any[], reports: any[], patients: any[]) => {
  const patientById = new Map(patients.map((patient) => [patient.id, patient]))
  const reportsByPatient = reports.reduce((groups, report) => {
    const patientReports = groups.get(report.patientId) || []
    patientReports.push(report)
    groups.set(report.patientId, patientReports)
    return groups
  }, new Map())

  const mergedByPatient = new Map(
    threads.map((thread) => [
      thread.patientId,
      {
        ...thread,
        messages: [...(thread.messages || [])],
      },
    ]),
  )

  reports
    .slice()
    .sort((a, b) => a.ts - b.ts)
    .forEach((report) => {
      const patient = patientById.get(report.patientId)
      const reportMessage = {
        sender: 'patient',
        text: formatSymptomReportMessage(report),
        ts: report.ts,
        reportId: report.id,
      }
      const thread =
        mergedByPatient.get(report.patientId) || {
          id: reportThreadId(report.patientId),
          patientId: report.patientId,
          patientName: patient?.name || 'Unknown patient',
          updated: formatThreadUpdated(report.ts),
          excerpt: `Symptom report: ${report.exercise || 'General'}`,
          hasReport: false,
          messages: [],
        }

      const alreadyInThread = thread.messages.some(
        (message: any) =>
          message.reportId === report.id ||
          (message.sender === 'patient' && message.ts === report.ts && message.text === reportMessage.text),
      )

      if (!alreadyInThread) {
        thread.messages = [...thread.messages, reportMessage].sort((a: any, b: any) => (a.ts || 0) - (b.ts || 0))
      }

      mergedByPatient.set(report.patientId, thread)
    })

  return Array.from(mergedByPatient.values()).map((thread) => {
    const patientReports = reportsByPatient.get(thread.patientId) || []
    const unreadReports = patientReports.filter((report: any) => !report.ptRead)
    const latestReport = patientReports.slice().sort((a: any, b: any) => b.ts - a.ts)[0]
    const latestMessage = thread.messages.slice().sort((a: any, b: any) => (b.ts || 0) - (a.ts || 0))[0]
    const latestTs = latestMessage?.ts || latestReport?.ts
    const latestIsReport = latestReport && (!latestMessage?.ts || latestReport.ts >= latestMessage.ts)

    return {
      ...thread,
      hasReport: unreadReports.length > 0,
      updated: latestTs ? formatThreadUpdated(latestTs) : thread.updated,
      excerpt: latestIsReport
        ? `Symptom report: ${latestReport.exercise || 'General'}`
        : latestMessage?.text || thread.excerpt,
    }
  })
}

function mergeExerciseMetadata(savedItems: any[], sourceItems: any[]) {
  return savedItems.map((item) => {
    const source = sourceItems.find((candidate) => candidate.id === item.id || candidate.name === item.name)
    return source ? { ...source, done: item.done } : item
  })
}

export default function RehabPro() {
  const contentScrollRef = useRef<HTMLDivElement | null>(null)
  const [authUser, setAuthUser] = useLocalStorageState<AuthUser | null>('rehabpro:authUser', null)
  const [viewMode, setViewMode] = useLocalStorageState<'patient' | 'pt'>('rehabpro:viewMode', authUser?.role ?? 'patient')
  const [tab, setTab] = useLocalStorageState('rehabpro:tab', 'home')
  const [rehabItems, setRehabItems] = useLocalStorageState<any[]>('rehabpro:rehabItems', REHAB_TODAY)
  const [ptPatients, setPtPatients] = useLocalStorageState('rehabpro:ptPatients', visiblePtPatients(PT_PATIENTS))
  const [selectedPatientId, setSelectedPatientId] = useLocalStorageState<string | null>('rehabpro:selectedPatientId', null)
  const [ptDetailMode, setPtDetailMode] = useLocalStorageState('rehabpro:ptDetailMode', false)
  const [ptThreads, setPtThreads] = useLocalStorageState('rehabpro:ptThreads', PT_THREADS)
  const [activeThreadId, setActiveThreadId] = useLocalStorageState('rehabpro:activeThreadId', PT_THREADS[0].id)
  const [reports, setReports] = useLocalStorageState('rehabpro:reports', MOCK_REPORTS)
  const [checkIns, setCheckIns] = useLocalStorageState<any[]>('rehabpro:checkIns', MOCK_CHECK_INS)
  const [intake, setIntake] = useLocalStorageState('rehabpro:intake:pt_intake', INITIAL_INTAKE)

  const signedInUser = authUser
  const patientUser = authUser?.role === 'patient' ? authUser : null
  const currentRole: 'patient' | 'pt' = authUser?.role ?? viewMode
  const patientProfiles = PATIENT_DEMO_PROFILES as Record<string, any>
  const currentPatientProfile = patientUser?.patientId ? patientProfiles[patientUser.patientId] : null
  const selectedPatientProfile = selectedPatientId ? patientProfiles[selectedPatientId] : null
  const progressPatientId = patientUser?.patientId ?? selectedPatientId
  const progressPatientProfile = currentRole === 'pt' ? selectedPatientProfile : currentPatientProfile
  const isIntakePatient = patientUser?.patientId === 'pt_intake'
  const demoPatientUsers = AUTH_USERS.filter((user) => user.role === 'patient' && user.patientId && user.patientId !== 'pt_intake' && patientProfiles[user.patientId])
  const demoPtUser = AUTH_USERS.find((user) => user.role === 'pt')
  const demoOptions = [...demoPatientUsers, ...(demoPtUser ? [demoPtUser] : [])]
  const visiblePatients = visiblePtPatients(ptPatients)
  const reportBackedThreads = useMemo(
    () => mergeReportsIntoThreads(ptThreads, reports, visiblePatients),
    [ptThreads, reports, visiblePatients],
  )

  useEffect(() => {
    if (authUser?.role === 'patient' && viewMode !== 'patient') {
      setViewMode('patient')
    }
  }, [authUser, viewMode, setViewMode])

  useEffect(() => {
    setCheckIns((prev) => backfillDemoCheckIns(prev))
  }, [setCheckIns])

  useEffect(() => {
    if (tab === 'train') {
      contentScrollRef.current?.scrollTo({ top: 0 })
    }
  }, [tab])

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

  const selectedPatient = visiblePatients.find((patient) => patient.id === selectedPatientId)
  const patientUnreadReports = patientUser?.patientId ? reports.filter((report) => report.patientId === patientUser.patientId && !report.ptRead).length : 0
  const unresolvedReports = currentRole === 'pt' ? reports.filter((report) => !report.ptRead).length : 0
  const recentCheckIns = currentRole === 'pt' ? checkIns.filter((checkIn) => Date.now() - checkIn.ts < 1000 * 60 * 60 * 24).length : 0

  const handleDemoLogin = (matchedUser: AuthUser) => {
    setAuthUser(matchedUser)
    setViewMode(matchedUser.role)
    setTab('home')
    setPtDetailMode(false)
    setSelectedPatientId(matchedUser.role === 'pt' ? null : matchedUser.patientId || null)
    setActiveThreadId(matchedUser.role === 'pt' ? '' : PT_THREADS.find((thread) => thread.patientId === matchedUser.patientId)?.id || PT_THREADS[0].id)
    if (matchedUser.role === 'patient') {
      setRehabItems(matchedUser.patientId === 'pt_intake' ? INTAKE_REHAB_TODAY : REHAB_TODAY)
    }
  }

  const handleLogout = () => {
    setAuthUser(null)
    setViewMode('patient')
    setTab('home')
    setPtDetailMode(false)
    setSelectedPatientId(null)
    setActiveThreadId(PT_THREADS[0].id)
  }

  const handleResetDemo = () => {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('rehabpro:'))
      .forEach((key) => window.localStorage.removeItem(key))
    window.location.reload()
  }

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId)
    setPtDetailMode(true)
    setTab('train')
  }

  const handleSelectPortalPatient = (patientId: string | null) => {
    setSelectedPatientId(patientId)
    if (!patientId) {
      setActiveThreadId('')
      return
    }

    setActiveThreadId(reportBackedThreads.find((thread) => thread.patientId === patientId)?.id || reportThreadId(patientId))
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
          ? { ...patient, assignedExercises: patient.assignedExercises.filter((item: string) => item !== exercise) }
          : patient,
      ),
    )
  }

  const handleSendPtMessage = (threadId: string, text: string) => {
    setPtThreads((prev) =>
      prev.some((thread) => thread.id === threadId)
        ? prev.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  hasReport: false,
                  updated: 'Now',
                  excerpt: text,
                  messages: [...thread.messages, { sender: 'pt', text, ts: Date.now() }],
                }
              : thread,
          )
        : [
            ...prev,
            {
              id: threadId,
              patientId: threadId.replace(/^thread_/, ''),
              patientName: visiblePatients.find((patient) => reportThreadId(patient.id) === threadId)?.name || 'Unknown patient',
              updated: 'Now',
              excerpt: text,
              hasReport: false,
              messages: [{ sender: 'pt', text, ts: Date.now() }],
            },
          ],
    )
  }

  const handleMarkReportReviewed = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, ptRead: true } : report,
      ),
    )
  }

  const handleSendPatientMessage = (threadId: string, text: string) => {
    setPtThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              updated: 'Now',
              excerpt: text,
              messages: [...thread.messages, { sender: 'patient', text, ts: Date.now() }],
            }
          : thread,
      ),
    )
  }

  const handleSubmitReport = (reportDetails: any) => {
    const patientId = patientUser?.patientId
    if (!patientId) {
      return
    }

    const timestamp = Date.now()
    const report = {
      id: `r_${timestamp}`,
      patientId,
      ts: timestamp,
      ...reportDetails,
      ptRead: false,
      ptReply: null,
    }

    setReports((prev) => [report, ...prev])

    const reportMessage = formatSymptomReportMessage(reportDetails)
    setPtThreads((prev) => {
      const existingThread = prev.find((thread) => thread.patientId === patientId)

      if (!existingThread) {
        return [
          ...prev,
          {
            id: `thread_${patientId}`,
            patientId,
            patientName: patientUser.name,
            updated: 'Now',
            excerpt: `Symptom report: ${reportDetails.exercise || 'General'}`,
            hasReport: true,
            messages: [{ sender: 'patient', text: reportMessage, ts: timestamp, reportId: report.id }],
          },
        ]
      }

      return prev.map((thread) =>
        thread.patientId === patientId
          ? {
              ...thread,
              updated: 'Now',
              excerpt: `Symptom report: ${reportDetails.exercise || 'General'}`,
              hasReport: true,
              messages: [...thread.messages, { sender: 'patient', text: reportMessage, ts: timestamp, reportId: report.id }],
            }
          : thread,
      )
    })
  }

  const handleSubmitSessionCheckIn = (checkInDetails: any) => {
    const patientId = patientUser?.patientId
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
          .demo-shell {
            background: ${C.black};
            min-height: 100vh;
            width: 100%;
            font-family: 'DM Sans', sans-serif;
            padding: 20px 28px;
            display: flex;
            align-items: center;
          }
          .demo-layout {
            width: 100%;
            max-width: 1180px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
            gap: 24px;
            align-items: stretch;
          }
          .demo-hero {
            min-height: min(560px, calc(100vh - 40px));
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 28px;
            border: 1px solid ${C.rim};
            background: ${C.deep};
          }
          .demo-kicker {
            font-family: 'Fira Code', monospace;
            font-size: 11px;
            color: ${C.lime};
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          .demo-title {
            max-width: 680px;
            font-family: 'Bebas Neue', cursive;
            font-size: clamp(64px, 7.2vw, 96px);
            color: ${C.bone};
            line-height: 0.9;
            margin-top: 18px;
          }
          .demo-copy {
            max-width: 560px;
            margin-top: 18px;
            font-size: 16px;
            line-height: 1.55;
            color: ${C.bone};
          }
          .demo-points {
            display: grid;
            gap: 10px;
            margin-top: 24px;
          }
          .demo-point {
            padding: 14px;
            border: 1px solid ${C.rim};
            background: ${C.panel};
            display: grid;
            gap: 12px;
          }
          .demo-platform-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .demo-platform-item {
            border: 1px solid ${C.rim};
            background: ${C.deep};
            border-radius: 7px;
            padding: 12px;
            display: grid;
            gap: 7px;
          }
          .demo-panel {
            padding: 20px;
            border: 1px solid ${C.rim};
            background: ${C.panel};
          }
          .demo-options {
            display: grid;
            gap: 10px;
          }
          .demo-card {
            width: 100%;
            padding: 14px 16px;
            border-radius: 8px;
            border: 1px solid ${C.rim};
            background: ${C.deep};
            color: ${C.bone};
            text-align: left;
            display: grid;
            gap: 8px;
            transition: border-color 0.16s, background 0.16s, transform 0.16s;
          }
          .demo-card:hover,
          .demo-card:focus-visible {
            border-color: ${C.lime};
            background: ${C.limeDim};
            transform: translateY(-1px);
          }
          @media (max-width: 900px) {
            .demo-shell { padding: 18px; align-items: flex-start; }
            .demo-layout { grid-template-columns: 1fr; gap: 18px; }
            .demo-hero { min-height: auto; padding: 22px; }
            .demo-title { font-size: 58px; }
            .demo-copy { font-size: 15px; }
            .demo-points { margin-top: 22px; }
            .demo-platform-grid { grid-template-columns: 1fr; }
            .demo-panel { padding: 18px; }
          }
        `}</style>
        <div className="demo-shell">
          <div className="demo-layout">
            <section className="demo-hero" aria-labelledby="demo-title">
              <div>
                <div className="demo-kicker">Two-sided rehab platform</div>
                <h1 id="demo-title" className="demo-title">
                  REHAB<span style={{ color: C.lime }}>PRO</span>
                </h1>
                <div className="demo-copy">
                  A rehabilitation workflow platform connecting home exercise guidance, symptom reporting, and clinician review in one coordinated experience.
                </div>
              </div>
              <div>
                <div className="demo-points">
                  <div className="demo-point">
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Connected care workflow
                    </div>
                    <div className="demo-platform-grid">
                      <div className="demo-platform-item">
                        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: C.bone, lineHeight: 1 }}>
                          Patient mobile app
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.45, color: C.bone }}>
                          Guides prescribed home exercise, captures symptoms, and keeps progress visible between visits.
                        </div>
                      </div>
                      <div className="demo-platform-item">
                        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: C.bone, lineHeight: 1 }}>
                          Clinician desktop portal
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.45, color: C.bone }}>
                          Gives PTs a work queue for patient review, symptom triage, messaging, and plan updates.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="demo-point">
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Demo data
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.45, color: C.bone }}>
                      Uses local sample data for product walkthroughs. Do not enter real patient or medical information.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="demo-panel">
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: C.bone, marginBottom: 8, lineHeight: 1 }}>
                Choose a demo
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.45, color: C.bone, marginBottom: 14 }}>
                Select a role-based walkthrough to view the patient mobile experience or the clinician desktop portal.
              </div>
              <div className="demo-options">
                {demoOptions.map((user) => {
                  const profile = user.patientId ? patientProfiles[user.patientId as string] : null
                  const isPtDemo = user.role === 'pt'
                  const demoDescription = isPtDemo
                    ? 'Review a daily caseload, triage symptom reports, message patients, and adjust assigned exercises.'
                    : user.patientId === 'pt_intake'
                      ? 'Complete script intake, capture current symptoms, and prepare a starter rehabilitation plan.'
                      : 'Resume an active rehabilitation plan, review exercises, track progress, and report symptoms.'
                  return (
                    <button
                      key={user.username}
                      type="button"
                      onClick={() => handleDemoLogin(user as AuthUser)}
                      className="demo-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: '0.04em' }}>
                          {isPtDemo ? 'Physical therapist demo' : `${profile.demoLabel} demo`}
                        </div>
                        <div style={{ flexShrink: 0, fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {isPtDemo ? 'Desktop portal' : 'Mobile app'}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.bone }}>
                        {isPtDemo ? `${user.name} · Care team dashboard` : `${profile.name} · ${profile.injuryType}`}
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.bone, lineHeight: 1.45 }}>
                        {demoDescription}
                      </div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, lineHeight: 1.5 }}>
                        {isPtDemo ? 'Caseload review · Reports · Plan updates' : `${profile.rehabPhase} · ${profile.ptOversightStatus}`}
                      </div>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={handleResetDemo}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: `1px solid ${C.rim}`, background: 'transparent', color: C.muted, fontFamily: "'Fira Code', monospace", fontSize: 10, letterSpacing: '0.08em' }}
                >
                  RESET DEMO DATA
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (currentRole === 'pt') {
    return (
      <PtPortalView
        user={signedInUser}
        patients={visiblePatients}
        selectedPatientId={selectedPatientId}
        reports={reports}
        checkIns={checkIns}
        threads={reportBackedThreads}
        activeThreadId={activeThreadId}
        exerciseNames={EXERCISE_NAMES}
        onSelectPatient={handleSelectPortalPatient}
        onSignOut={handleLogout}
        onResetDemo={handleResetDemo}
        onSendMessage={handleSendPtMessage}
        onAssignExercise={handleAssignExercise}
        onUnassignExercise={handleUnassignExercise}
        onMarkReportReviewed={handleMarkReportReviewed}
      />
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
                  {currentPatientProfile?.name ?? signedInUser.name} · {currentPatientProfile?.rehabPhase.toUpperCase() ?? 'PATIENT'}
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: '0.08em' }}>
                  PATIENT MODE
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
                PATIENT ACCESS
              </div>
            </div>
          </div>
        </div>

        <div ref={contentScrollRef} style={{ flex: 1, padding: '16px 20px', paddingBottom: 'calc(112px + env(safe-area-inset-bottom, 0))', overflowY: 'auto' }}>
          {tab === 'home' && (isIntakePatient ? <IntakeView intake={intake} onChange={setIntake} onComplete={handleCompleteIntake} onOpenPlan={() => setTab('train')} /> : <HomeView patientProfile={currentPatientProfile} rehabItems={rehabItems} milestones={MILESTONES} ptMessage={PT_MSG} schedule={SCHEDULE} notification={{ unreadReports: patientUnreadReports }} onNavigate={setTab} />)}
          {tab === 'train' && (isIntakePatient && !intake.completed ? <IntakeView intake={intake} onChange={setIntake} onComplete={handleCompleteIntake} onOpenPlan={() => setTab('train')} /> : <TrainView rehabItems={rehabItems} setRehabItems={setRehabItems} onSubmitCheckIn={handleSubmitSessionCheckIn} />)}
          {tab === 'progress' && <ProgressView patientProfile={progressPatientProfile} milestones={MILESTONES} progressData={RETURNING_PATIENT_PROGRESS} completionHistory={RETURNING_PATIENT_COMPLETION_HISTORY} checkIns={checkIns.filter((checkIn) => checkIn.patientId === progressPatientId && checkIn.type === 'session')} />}
          {tab === 'pt' && (patientUser ? <PTChat patientId={patientUser.patientId} patientContext={{ injury: currentPatientProfile?.injury, stage: currentPatientProfile?.stage, goal: currentPatientProfile?.goal, assignedExercises: rehabItems.map((item) => item.name) }} ptThread={reportBackedThreads.find((thread) => thread.patientId === patientUser.patientId)} onSendPtMessage={handleSendPatientMessage} /> : null)}
          {tab === 'report' && <ReportView rehabItems={rehabItems} onSubmit={handleSubmitReport} onOpenMessages={() => setTab('pt')} />}
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
          {(isIntakePatient && !intake.completed ? TABS.filter((item) => item.id === 'home') : TABS).map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
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
                  transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    height: 21,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    lineHeight: 1,
                    color: active ? C.lime : C.ghost,
                    filter: active ? `drop-shadow(0 0 7px ${C.limeMid})` : 'none',
                    transition: 'color 0.15s, filter 0.15s',
                  }}
                >
                  {t.icon}
                </div>
                <div
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: 11,
                    lineHeight: 1,
                    letterSpacing: '0.08em',
                    color: active ? C.lime : C.muted,
                    transition: 'color 0.15s',
                  }}
                >
                  {t.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
