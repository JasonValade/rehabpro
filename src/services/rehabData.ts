import type { User } from '@supabase/supabase-js'
import { requireSupabase } from '../lib/supabase'

export type PatientRecord = {
  id: string
  profile_id: string
  injury_type: string
  injury_side: string
  rehab_phase: string
  week: number
  goal: string
  baseline_pain: number
  baseline_swelling: number
  baseline_rom: number
  baseline_difficulty: number
  created_at?: string
  updated_at?: string
}

export type IntakeInput = {
  fullName: string
  injuryType: string
  injurySide: string
  rehabPhase: string
  week: number
  goal: string
  baselinePain: number
  baselineSwelling: number
  baselineRom: number
  baselineDifficulty: number
}

export type RehabPlanRecord = {
  id: string
  patient_id: string
  template_key: string
  name: string
  status: string
  created_at?: string
  updated_at?: string
}

export type RehabItem = {
  id: string
  planExerciseId: string
  exerciseId: string
  name: string
  sets: number | string
  reps: number | string
  done: boolean
  tag?: string
  youtubeUrl?: string
  youtubeId?: string
  reminder?: string
  instructions?: string
  clinicalNotes?: string
  rest?: string
  muscles?: string
  equipment?: string
  cue?: string
  description?: string
  difficulty?: number
}

export type ProgressLog = {
  id: string
  patientId: string
  ts: number
  type: 'session'
  pain: number
  swelling: number
  difficulty: number
  done: number
  total: number
  completion: number
}

type TemplateExercise = {
  name: string
  sets: number
  reps: string
  cadence: string
}

const STARTER_TEMPLATES: Record<string, { name: string; exercises: TemplateExercise[] }> = {
  acl_meniscus_protection_template: {
    name: 'ACL + Meniscus Protection Starter',
    exercises: [
      { name: 'Quad Sets', sets: 3, reps: '10', cadence: 'Daily' },
      { name: 'Heel Slides', sets: 3, reps: '12', cadence: 'Daily' },
      { name: 'Straight Leg Raise', sets: 3, reps: '10 each', cadence: 'Daily' },
      { name: 'Terminal Knee Extension', sets: 3, reps: '12', cadence: 'Daily' },
    ],
  },
  acl_meniscus_strength_template: {
    name: 'ACL + Meniscus Strength Starter',
    exercises: [
      { name: 'Terminal Knee Extension', sets: 3, reps: '15', cadence: 'Daily' },
      { name: 'Wall Slides', sets: 3, reps: '12', cadence: 'Daily' },
      { name: 'Straight Leg Raise', sets: 3, reps: '12 each', cadence: 'Daily' },
      { name: 'Lateral Band Walks', sets: 3, reps: '20 steps', cadence: '3x / week' },
      { name: 'Bilateral Calf Raises', sets: 3, reps: '20', cadence: '3x / week' },
    ],
  },
  acl_meniscus_return_template: {
    name: 'ACL + Meniscus Return Starter',
    exercises: [
      { name: 'Step-Ups', sets: 3, reps: '10 each', cadence: '3x / week' },
      { name: 'Single-Leg Romanian Deadlift Reach', sets: 3, reps: '8 each', cadence: '3x / week' },
      { name: 'Single-Leg Balance', sets: 3, reps: '30s each', cadence: '3x / week' },
      { name: 'Drop Landing Mechanics', sets: 3, reps: '6', cadence: '2x / week' },
    ],
  },
  patellar_tendon_protection_template: {
    name: 'Patellar Tendon Protection Starter',
    exercises: [
      { name: 'Isometric Knee Extension', sets: 5, reps: '30-45s hold', cadence: 'Daily' },
      { name: 'Spanish Squat - Isometric', sets: 4, reps: '30s hold', cadence: 'Daily' },
      { name: 'Glute Bridge', sets: 3, reps: '12', cadence: '3x / week' },
    ],
  },
  patellar_tendon_strength_template: {
    name: 'Patellar Tendon Strength Starter',
    exercises: [
      { name: 'Spanish Squat - Isometric', sets: 4, reps: '45s hold', cadence: 'Daily' },
      { name: 'Decline Eccentric Squat', sets: 3, reps: '12 slow', cadence: '3x / week' },
      { name: 'Heavy Slow Goblet Squat', sets: 4, reps: '6-8', cadence: '3x / week' },
      { name: 'Lateral Band Walks', sets: 3, reps: '20 steps', cadence: '3x / week' },
    ],
  },
  patellar_tendon_return_template: {
    name: 'Patellar Tendon Return Starter',
    exercises: [
      { name: 'Heavy Slow Goblet Squat', sets: 4, reps: '6-8', cadence: '2x / week' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: '8 each', cadence: '2x / week' },
      { name: 'Pogo Hops', sets: 3, reps: '20 contacts', cadence: '2x / week' },
      { name: 'Plyometric Bounding', sets: 4, reps: '10 bounds', cadence: '2x / week' },
    ],
  },
  achilles_protection_template: {
    name: 'Achilles Protection Starter',
    exercises: [
      { name: 'Ankle Pumps', sets: 3, reps: '30', cadence: 'Daily' },
      { name: 'Towel Calf Stretch', sets: 3, reps: '30s hold', cadence: 'Daily' },
      { name: 'Bilateral Calf Raises', sets: 3, reps: '12', cadence: '3x / week' },
    ],
  },
  achilles_strength_template: {
    name: 'Achilles Strength Starter',
    exercises: [
      { name: 'Bilateral Calf Raises', sets: 3, reps: '20', cadence: '3x / week' },
      { name: 'Bent-Knee Soleus Raise', sets: 3, reps: '15', cadence: '3x / week' },
      { name: 'Single-Leg Eccentric Calf Raise', sets: 3, reps: '12', cadence: '3x / week' },
      { name: 'Farmer Carry on Toes', sets: 3, reps: '20m', cadence: '2x / week' },
    ],
  },
  achilles_return_template: {
    name: 'Achilles Return Starter',
    exercises: [
      { name: 'Bent-Knee Soleus Raise', sets: 4, reps: '10', cadence: '2x / week' },
      { name: 'Farmer Carry on Toes', sets: 3, reps: '30m', cadence: '2x / week' },
      { name: 'Pogo Hops', sets: 3, reps: '20 contacts', cadence: '2x / week' },
      { name: 'Hopping Progression', sets: 3, reps: '15 each', cadence: '2x / week' },
    ],
  },
  default_conservative_template: {
    name: 'Conservative Starter Plan',
    exercises: [
      { name: 'Dynamic Warm-Up Flow', sets: 2, reps: '5 min', cadence: 'Daily' },
      { name: 'Glute Bridge', sets: 3, reps: '10', cadence: '3x / week' },
      { name: 'Farmer Carry', sets: 3, reps: '20m', cadence: '3x / week' },
    ],
  },
}

export function getTemplateKey(intake: { injuryType: string; rehabPhase?: string; week: number } | { injury_type: string; rehab_phase?: string; week: number }) {
  const injuryType = 'injuryType' in intake ? intake.injuryType : intake.injury_type
  const rehabPhase = 'injuryType' in intake ? intake.rehabPhase : intake.rehab_phase
  const normalizedInjury = String(injuryType || '').toLowerCase()
  const normalizedPhase = String(rehabPhase || '').toLowerCase()
  const week = Number(intake.week)
  const isReturnPhase = normalizedPhase.includes('return') || week >= 16
  const isStrengthPhase = normalizedPhase.includes('strength') || normalizedPhase.includes('running') || week >= 8

  if (normalizedInjury.includes('acl') && normalizedInjury.includes('meniscus')) {
    if (isReturnPhase) return 'acl_meniscus_return_template'
    return isStrengthPhase ? 'acl_meniscus_strength_template' : 'acl_meniscus_protection_template'
  }

  if (normalizedInjury.includes('patellar')) {
    if (isReturnPhase) return 'patellar_tendon_return_template'
    return isStrengthPhase ? 'patellar_tendon_strength_template' : 'patellar_tendon_protection_template'
  }

  if (normalizedInjury.includes('achilles')) {
    if (isReturnPhase) return 'achilles_return_template'
    return isStrengthPhase ? 'achilles_strength_template' : 'achilles_protection_template'
  }

  return 'default_conservative_template'
}

function assertNoError(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    throw new Error(String((error as { message: string }).message))
  }
}

export async function getCurrentPatient(userId: string) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('patients')
    .select('*')
    .eq('profile_id', userId)
    .maybeSingle()

  assertNoError(error)
  return (data || null) as PatientRecord | null
}

export async function createPatientFromIntake(user: User, intake: IntakeInput) {
  const client = requireSupabase()
  const email = user.email || ''

  const { error: profileError } = await client.from('profiles').upsert({
    id: user.id,
    email,
    full_name: intake.fullName,
  })
  assertNoError(profileError)

  const { data: patient, error: patientError } = await client
    .from('patients')
    .insert({
      profile_id: user.id,
      injury_type: intake.injuryType,
      injury_side: intake.injurySide,
      rehab_phase: intake.rehabPhase,
      week: intake.week,
      goal: intake.goal,
      baseline_pain: intake.baselinePain,
      baseline_swelling: intake.baselineSwelling,
      baseline_rom: intake.baselineRom,
      baseline_difficulty: intake.baselineDifficulty,
    })
    .select('*')
    .single()
  assertNoError(patientError)

  const { error: intakeError } = await client.from('injury_intakes').insert({
    patient_id: patient.id,
    answers: intake,
  })
  assertNoError(intakeError)

  return patient as PatientRecord
}

export async function createStarterPlan(patient: PatientRecord) {
  const client = requireSupabase()
  const templateKey = getTemplateKey(patient)
  const template = STARTER_TEMPLATES[templateKey]

  const { data: plan, error: planError } = await client
    .from('rehab_plans')
    .insert({
      patient_id: patient.id,
      template_key: templateKey,
      name: template.name,
      status: 'active',
    })
    .select('*')
    .single()
  assertNoError(planError)

  const exerciseNames = template.exercises.map((exercise) => exercise.name)
  const { data: exercises, error: exercisesError } = await client
    .from('exercises')
    .select('id,name')
    .in('name', exerciseNames)
  assertNoError(exercisesError)

  const exerciseIdByName = new Map((exercises || []).map((exercise: { id: string; name: string }) => [exercise.name, exercise.id]))
  const rows = template.exercises.map((exercise, index) => {
    const exerciseId = exerciseIdByName.get(exercise.name)
    if (!exerciseId) {
      throw new Error(`Seed exercise missing: ${exercise.name}`)
    }

    return {
      plan_id: plan.id,
      exercise_id: exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      cadence: exercise.cadence,
      sort_order: index + 1,
    }
  })

  const { error: planExerciseError } = await client.from('plan_exercises').insert(rows)
  assertNoError(planExerciseError)

  return plan as RehabPlanRecord
}

export async function getActivePlan(patientId: string) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('rehab_plans')
    .select('*')
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  assertNoError(error)
  return (data || null) as RehabPlanRecord | null
}

export async function getTodayPlan(patientId: string) {
  const client = requireSupabase()
  const plan = await getActivePlan(patientId)
  if (!plan) return []

  const { data, error } = await client
    .from('plan_exercises')
    .select(`
      id,
      sets,
      reps,
      cadence,
      sort_order,
      exercises (
        id,
        name,
        muscles,
        equipment,
        cue,
        description,
        difficulty,
        youtube_url,
        youtube_id,
        reminder,
        instructions,
        clinical_notes,
        rest
      )
    `)
    .eq('plan_id', plan.id)
    .order('sort_order', { ascending: true })

  assertNoError(error)

  return (data || []).map((row: any) => {
    const exercise = row.exercises || {}
    return {
      id: row.id,
      planExerciseId: row.id,
      exerciseId: exercise.id,
      name: exercise.name,
      sets: row.sets,
      reps: row.reps,
      done: false,
      tag: row.cadence || 'ASSIGNED',
      youtubeUrl: exercise.youtube_url,
      youtubeId: exercise.youtube_id,
      reminder: exercise.reminder,
      instructions: exercise.instructions,
      clinicalNotes: exercise.clinical_notes,
      rest: exercise.rest,
      muscles: exercise.muscles,
      equipment: exercise.equipment,
      cue: exercise.cue,
      description: exercise.description,
      difficulty: exercise.difficulty,
    } satisfies RehabItem
  })
}

export async function createSession(patientId: string, notes = '') {
  const client = requireSupabase()
  const now = new Date().toISOString()
  const { data, error } = await client
    .from('sessions')
    .insert({
      patient_id: patientId,
      started_at: now,
      completed_at: now,
      notes,
    })
    .select('*')
    .single()

  assertNoError(error)
  return data as { id: string; started_at: string; completed_at: string | null; notes: string | null }
}

export async function saveSessionLogs({
  patientId,
  sessionId,
  rehabItems,
  pain,
  swelling,
  difficulty,
  notes = '',
}: {
  patientId: string
  sessionId: string
  rehabItems: RehabItem[]
  pain: number
  swelling: number
  difficulty: number
  notes?: string
}) {
  const client = requireSupabase()
  const rows = rehabItems.map((item) => ({
    session_id: sessionId,
    patient_id: patientId,
    exercise_id: item.exerciseId,
    pain,
    swelling,
    difficulty,
    completed: Boolean(item.done),
    notes,
  }))

  const { error } = await client.from('session_logs').insert(rows)
  assertNoError(error)
}

export async function getProgressData(patientId: string) {
  const client = requireSupabase()
  const { data: sessions, error: sessionsError } = await client
    .from('sessions')
    .select('id,patient_id,started_at,completed_at,notes')
    .eq('patient_id', patientId)
    .order('started_at', { ascending: true })
  assertNoError(sessionsError)

  const sessionIds = (sessions || []).map((session: { id: string }) => session.id)
  if (sessionIds.length === 0) return []

  const { data: logs, error: logsError } = await client
    .from('session_logs')
    .select('id,session_id,patient_id,pain,swelling,difficulty,completed,created_at')
    .in('session_id', sessionIds)
  assertNoError(logsError)

  const logsBySession = (logs || []).reduce((groups: Map<string, any[]>, log: any) => {
    const sessionLogs = groups.get(log.session_id) || []
    sessionLogs.push(log)
    groups.set(log.session_id, sessionLogs)
    return groups
  }, new Map())

  return (sessions || []).map((session: any) => {
    const sessionLogs = logsBySession.get(session.id) || []
    const total = sessionLogs.length
    const done = sessionLogs.filter((log: any) => log.completed).length
    const firstLog = sessionLogs[0] || {}

    return {
      id: session.id,
      patientId,
      ts: new Date(session.completed_at || session.started_at).getTime(),
      type: 'session',
      pain: Number(firstLog.pain || 0),
      swelling: Number(firstLog.swelling || 0),
      difficulty: Number(firstLog.difficulty || 0),
      done,
      total,
      completion: total ? Math.round((done / total) * 100) : 0,
    } satisfies ProgressLog
  })
}
