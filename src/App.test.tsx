import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, vi } from 'vitest'
import App from './App'
import {
  createPatientFromIntake,
  createSession,
  createStarterPlan,
  getActivePlan,
  getCurrentPatient,
  getProgressData,
  getTodayPlan,
  saveSessionLogs,
} from './services/rehabData'

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
}))

vi.mock('./lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: authMocks.getSession,
      onAuthStateChange: authMocks.onAuthStateChange,
      signUp: authMocks.signUp,
      signInWithPassword: authMocks.signInWithPassword,
      signOut: authMocks.signOut,
    },
  },
}))

vi.mock('./services/rehabData', () => ({
  createPatientFromIntake: vi.fn(),
  createSession: vi.fn(),
  createStarterPlan: vi.fn(),
  getActivePlan: vi.fn(),
  getCurrentPatient: vi.fn(),
  getProgressData: vi.fn(),
  getTemplateKey: vi.fn((intake: { injuryType?: string; injury_type?: string; week: number }) => {
    const injuryType = String(intake.injuryType || intake.injury_type || '').toLowerCase()
    if (injuryType.includes('acl') && injuryType.includes('meniscus')) return 'acl_meniscus_protection_template'
    if (injuryType.includes('achilles')) return 'achilles_protection_template'
    if (injuryType.includes('patellar')) return 'patellar_tendon_protection_template'
    return 'default_conservative_template'
  }),
  getTodayPlan: vi.fn(),
  saveSessionLogs: vi.fn(),
}))

const fakeSession = {
  user: {
    id: 'user_1',
    email: 'patient@example.com',
    user_metadata: { full_name: 'Demo Athlete' },
  },
}

const fakePatient = {
  id: 'patient_1',
  profile_id: 'user_1',
  injury_type: 'ACL + Meniscus',
  injury_side: 'Left knee',
  rehab_phase: 'Early Motion',
  week: 6,
  goal: 'Return to basketball',
  baseline_pain: 4,
  baseline_swelling: 3,
  baseline_rom: 90,
  baseline_difficulty: 6,
}

const fakePlan = {
  id: 'plan_1',
  patient_id: 'patient_1',
  template_key: 'acl_meniscus_template_a',
  name: 'ACL + Meniscus Starter Plan A',
  status: 'active',
}

const fakeItems = [
  {
    id: 'plan_exercise_1',
    planExerciseId: 'plan_exercise_1',
    exerciseId: 'exercise_1',
    name: 'Heel Slides',
    sets: 3,
    reps: '12',
    done: false,
    tag: 'Daily',
  },
  {
    id: 'plan_exercise_2',
    planExerciseId: 'plan_exercise_2',
    exerciseId: 'exercise_2',
    name: 'Quad Sets',
    sets: 3,
    reps: '10',
    done: false,
    tag: 'Daily',
  },
]

const starterTemplateExerciseNames = [
  'Quad Sets',
  'Heel Slides',
  'Straight Leg Raise',
  'Terminal Knee Extension',
  'Wall Slides',
  'Lateral Band Walks',
  'Bilateral Calf Raises',
  'Step-Ups',
  'Single-Leg Romanian Deadlift Reach',
  'Single-Leg Balance',
  'Drop Landing Mechanics',
  'Isometric Knee Extension',
  'Spanish Squat - Isometric',
  'Glute Bridge',
  'Decline Eccentric Squat',
  'Heavy Slow Goblet Squat',
  'Bulgarian Split Squat',
  'Pogo Hops',
  'Plyometric Bounding',
  'Ankle Pumps',
  'Towel Calf Stretch',
  'Bent-Knee Soleus Raise',
  'Single-Leg Eccentric Calf Raise',
  'Farmer Carry on Toes',
  'Hopping Progression',
  'Dynamic Warm-Up Flow',
  'Farmer Carry',
]

function mockSignedOut() {
  authMocks.getSession.mockResolvedValue({ data: { session: null } })
}

function mockSignedIn({
  patient = fakePatient,
  items = fakeItems,
  progress = [],
}: {
  patient?: any
  items?: any
  progress?: any
} = {}) {
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession } })
  vi.mocked(getCurrentPatient).mockResolvedValue(patient)
  vi.mocked(getActivePlan).mockResolvedValue(fakePlan)
  vi.mocked(getTodayPlan).mockResolvedValue(items as any)
  vi.mocked(getProgressData).mockResolvedValue(progress as any)
}

describe('App Supabase patient MVP flow', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    vi.clearAllMocks()
    authMocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: authMocks.unsubscribe } },
    })
    vi.mocked(createPatientFromIntake).mockResolvedValue(fakePatient)
    vi.mocked(createStarterPlan).mockResolvedValue(fakePlan)
    vi.mocked(createSession).mockResolvedValue({ id: 'session_1', started_at: new Date().toISOString(), completed_at: new Date().toISOString(), notes: null })
    vi.mocked(saveSessionLogs).mockResolvedValue(undefined)
    vi.mocked(getActivePlan).mockResolvedValue(fakePlan)
    vi.mocked(getTodayPlan).mockResolvedValue(fakeItems as any)
    vi.mocked(getProgressData).mockResolvedValue([])
  })

  it('has Supabase seed rows for every starter template exercise', () => {
    const originalSeed = readFileSync('supabase/migrations/202606290001_patient_mvp.sql', 'utf8')
    const expandedSeed = readFileSync('supabase/migrations/202606300001_expand_starter_exercise_seeds.sql', 'utf8')
    const seedSql = `${originalSeed}\n${expandedSeed}`

    for (const exerciseName of starterTemplateExerciseNames) {
      expect(seedSql).toContain(`'${exerciseName}'`)
    }
  })

  it('shows create account and sign-in states backed by Supabase auth', async () => {
    const user = userEvent.setup()
    mockSignedOut()
    authMocks.signUp.mockResolvedValue({ data: { session: fakeSession }, error: null })

    render(<App />)

    expect((await screen.findAllByText('Create account')).length).toBeGreaterThan(0)
    expect(screen.getByText(/Create an account, complete injury intake/i)).toBeInTheDocument()
    expect(screen.getByText(/MVP demo flow/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/full name/i), 'Demo Athlete')
    await user.type(screen.getByLabelText(/email/i), 'patient@example.com')
    await user.type(screen.getByLabelText(/password/i), 'patient123')
    await user.click(screen.getAllByRole('button', { name: /^create account$/i })[1])

    expect(authMocks.signUp).toHaveBeenCalledWith({
      email: 'patient@example.com',
      password: 'patient123',
      options: { data: { full_name: 'Demo Athlete' } },
    })
  })

  it('uses immediate sign-in after signup for MVP testing when no signup session is returned', async () => {
    const user = userEvent.setup()
    mockSignedOut()
    vi.mocked(getCurrentPatient).mockResolvedValue(null)
    authMocks.signUp.mockResolvedValue({ data: { session: null }, error: null })
    authMocks.signInWithPassword.mockResolvedValue({ data: { session: fakeSession }, error: null })

    render(<App />)

    await user.type(await screen.findByLabelText(/full name/i), 'Demo Athlete')
    await user.type(screen.getByLabelText(/email/i), 'patient@example.com')
    await user.type(screen.getByLabelText(/password/i), 'patient123')
    await user.click(screen.getAllByRole('button', { name: /^create account$/i })[1])

    await waitFor(() => {
      expect(authMocks.signInWithPassword).toHaveBeenCalledWith({
        email: 'patient@example.com',
        password: 'patient123',
      })
    })
    expect(await screen.findByText('Injury intake')).toBeInTheDocument()
  })

  it('opens a returning patient demo without requiring Supabase auth', async () => {
    const user = userEvent.setup()
    mockSignedOut()

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /try returning patient demo/i }))

    expect(await screen.findByText(/KEEP MOVING, DEMO/i)).toBeInTheDocument()
    expect(screen.getByText(/Week 14 · ACL \+ Meniscus/i)).toBeInTheDocument()
    expect(screen.getByText(/PT assigned/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /progress/i }))

    expect(await screen.findByText('On Track')).toBeInTheDocument()
    expect(screen.getAllByText('80%').length).toBeGreaterThan(0)
  })

  it('opens the returning patient demo from a portfolio review URL', async () => {
    mockSignedOut()
    window.history.replaceState({}, '', '/?demo=returning')

    render(<App />)

    expect(await screen.findByText(/KEEP MOVING, DEMO/i)).toBeInTheDocument()
    expect(screen.getByText(/Week 14 · ACL \+ Meniscus/i)).toBeInTheDocument()
  })

  it('routes signed-in users without a patient record to injury intake', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession } })
    vi.mocked(getCurrentPatient).mockResolvedValue(null)

    render(<App />)

    expect(await screen.findByText('Injury intake')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByText(/starter plan preview/i)).toBeInTheDocument()
    expect(screen.getByText(/educational support/i)).toBeInTheDocument()
  })

  it('does not flash intake before a signed-in patient record resolves', async () => {
    let resolvePatient: (patient: any) => void = () => {}
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession } })
    vi.mocked(getCurrentPatient).mockReturnValue(new Promise((resolve) => {
      resolvePatient = resolve
    }) as any)

    render(<App />)

    expect(await screen.findByText(/loading rehabpro/i)).toBeInTheDocument()
    expect(screen.queryByText('Injury intake')).not.toBeInTheDocument()

    resolvePatient(null)

    expect(await screen.findByText('Injury intake')).toBeInTheDocument()
  })

  it('saves baseline intake values and creates a starter plan with a template key', async () => {
    const user = userEvent.setup()
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession } })
    vi.mocked(getCurrentPatient).mockResolvedValue(null)

    render(<App />)

    await user.type(await screen.findByLabelText(/full name/i), 'Demo Athlete')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.change(screen.getByLabelText(/baseline pain/i), { target: { value: '8' } })
    fireEvent.change(screen.getByLabelText(/baseline swelling/i), { target: { value: '6' } })
    expect(screen.getByText(/high pain/i)).toBeInTheDocument()
    expect(screen.getByText(/major swelling/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /create starter plan/i }))

    await waitFor(() => expect(createPatientFromIntake).toHaveBeenCalled())
    expect(createPatientFromIntake).toHaveBeenCalledWith(fakeSession.user, expect.objectContaining({
      injuryType: 'ACL + Meniscus',
      week: 6,
      baselinePain: 8,
      baselineSwelling: 6,
      baselineRom: 90,
      baselineDifficulty: 5,
    }))
    expect(createStarterPlan).toHaveBeenCalledWith(fakePatient)
    expect(await screen.findByText(/Start today's rehab/i)).toBeInTheDocument()
  })

  it('shows Achilles-specific intake choices and preview exercises', async () => {
    const user = userEvent.setup()
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession } })
    vi.mocked(getCurrentPatient).mockResolvedValue(null)

    render(<App />)

    await user.type(await screen.findByLabelText(/full name/i), 'Demo Athlete')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /^achilles$/i }))

    expect(screen.getByRole('button', { name: /left achilles/i })).toBeInTheDocument()
    expect(screen.getByText('Achilles Protection')).toBeInTheDocument()
    expect(screen.getByText('Ankle Pumps')).toBeInTheDocument()
    expect(screen.getByText('Towel Calf Stretch')).toBeInTheDocument()
    expect(screen.queryByText('Quad Sets')).not.toBeInTheDocument()
    expect(screen.queryByText('Heel Slides')).not.toBeInTheDocument()
  })

  it('renders today’s exercises from Supabase-shaped plan data', async () => {
    const user = userEvent.setup()
    mockSignedIn()

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /train/i }))

    expect(await screen.findByText('Heel Slides')).toBeInTheDocument()
    expect(await screen.findByText('Quad Sets')).toBeInTheDocument()
    expect(screen.getByText('0/2 complete')).toBeInTheDocument()
  })

  it('creates one session and multiple session logs when a workout is completed', async () => {
    const user = userEvent.setup()
    mockSignedIn()

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /train/i }))
    await user.click(screen.getByRole('button', { name: /mark complete heel slides/i }))
    await user.click(screen.getByRole('button', { name: /end session and check in/i }))
    await user.click(screen.getByRole('button', { name: 'Pain 3 out of 10' }))
    await user.click(screen.getByRole('button', { name: 'Swelling 2 out of 10' }))
    await user.click(screen.getByRole('button', { name: 'Difficulty 6 out of 10' }))
    await user.click(screen.getByRole('button', { name: /save session/i }))

    await waitFor(() => expect(createSession).toHaveBeenCalledWith('patient_1'))
    expect(saveSessionLogs).toHaveBeenCalledWith(expect.objectContaining({
      patientId: 'patient_1',
      sessionId: 'session_1',
      pain: 3,
      swelling: 2,
      difficulty: 6,
      rehabItems: expect.arrayContaining([
        expect.objectContaining({ name: 'Heel Slides', done: true }),
        expect.objectContaining({ name: 'Quad Sets', done: false }),
      ]),
    }))
  })

  it('shows progress from baseline values and session logs', async () => {
    const user = userEvent.setup()
    mockSignedIn({
      progress: [
        {
          id: 'session_1',
          patientId: 'patient_1',
          ts: Date.now(),
          type: 'session',
          pain: 2,
          swelling: 1,
          difficulty: 4,
          done: 2,
          total: 2,
          completion: 100,
        },
      ],
    })

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /progress/i }))

    expect(screen.getByText(/ACL \+ Meniscus Recovery/i)).toBeInTheDocument()
    expect(screen.getByText('90')).toBeInTheDocument()
    expect(screen.getByText(/Strong consistency/i)).toBeInTheDocument()
  })
})
