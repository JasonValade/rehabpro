import { render, screen, waitFor } from '@testing-library/react'
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
  getTodayPlan: vi.fn(),
  saveSessionLogs: vi.fn(),
}))

const fakeSession = {
  user: {
    id: 'user_1',
    email: 'patient@example.com',
    user_metadata: { full_name: 'Jason V.' },
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

  it('shows create account and sign-in states backed by Supabase auth', async () => {
    const user = userEvent.setup()
    mockSignedOut()
    authMocks.signUp.mockResolvedValue({ data: { session: fakeSession }, error: null })

    render(<App />)

    expect((await screen.findAllByText('Create account')).length).toBeGreaterThan(0)
    expect(screen.getByText(/Create an account, complete injury intake/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/full name/i), 'Jason V.')
    await user.type(screen.getByLabelText(/email/i), 'patient@example.com')
    await user.type(screen.getByLabelText(/password/i), 'patient123')
    await user.click(screen.getAllByRole('button', { name: /^create account$/i })[1])

    expect(authMocks.signUp).toHaveBeenCalledWith({
      email: 'patient@example.com',
      password: 'patient123',
      options: { data: { full_name: 'Jason V.' } },
    })
  })

  it('routes signed-in users without a patient record to injury intake', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession } })
    vi.mocked(getCurrentPatient).mockResolvedValue(null)

    render(<App />)

    expect(await screen.findByText('Injury intake')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create starter plan/i })).toBeInTheDocument()
    expect(screen.getByText(/educational support/i)).toBeInTheDocument()
  })

  it('saves baseline intake values and creates a starter plan with a template key', async () => {
    const user = userEvent.setup()
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession } })
    vi.mocked(getCurrentPatient).mockResolvedValue(null)

    render(<App />)

    await user.type(await screen.findByLabelText(/full name/i), 'Jason V.')
    await user.clear(screen.getByLabelText(/baseline pain/i))
    await user.type(screen.getByLabelText(/baseline pain/i), '5')
    await user.click(screen.getByRole('button', { name: /create starter plan/i }))

    await waitFor(() => expect(createPatientFromIntake).toHaveBeenCalled())
    expect(createPatientFromIntake).toHaveBeenCalledWith(fakeSession.user, expect.objectContaining({
      injuryType: 'ACL + Meniscus',
      week: 6,
      baselinePain: 5,
      baselineSwelling: 2,
      baselineRom: 90,
      baselineDifficulty: 5,
    }))
    expect(createStarterPlan).toHaveBeenCalledWith(fakePatient)
    expect(await screen.findByText(/Start today's rehab/i)).toBeInTheDocument()
  })

  it('renders today’s exercises from Supabase-shaped plan data', async () => {
    const user = userEvent.setup()
    mockSignedIn()

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /train/i }))

    expect(screen.getByText('Heel Slides')).toBeInTheDocument()
    expect(screen.getByText('Quad Sets')).toBeInTheDocument()
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
