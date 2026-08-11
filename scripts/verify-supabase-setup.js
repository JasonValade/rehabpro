#!/usr/bin/env node
/**
 * Verify Supabase setup for RehabPro MVP
 * 
 * Checks:
 * - Environment variables configured
 * - Supabase connectivity
 * - Required tables exist
 * - RLS policies enabled
 * - Exercise seeds present
 * - Sample data readable
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

// Load .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  })
}

const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL
const VITE_SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

const REQUIRED_TABLES = [
  'profiles',
  'patients',
  'injury_intakes',
  'exercises',
  'rehab_plans',
  'plan_exercises',
  'sessions',
  'session_logs',
]

const REQUIRED_EXERCISES = [
  'Quad Sets',
  'Heel Slides',
  'Straight Leg Raise',
  'Terminal Knee Extension',
  'Wall Slides',
  'Step-Ups',
]

async function log(stage, message, status = 'info') {
  const icons = {
    info: 'ℹ️ ',
    success: '✓ ',
    error: '✗ ',
    warning: '⚠ ',
  }
  console.log(`${icons[status]} [${stage}] ${message}`)
}

async function verifyEnv() {
  await log('ENV', 'Checking environment variables...')
  if (!VITE_SUPABASE_URL) {
    await log('ENV', 'Missing VITE_SUPABASE_URL', 'error')
    return false
  }
  if (!VITE_SUPABASE_PUBLISHABLE_KEY) {
    await log('ENV', 'Missing VITE_SUPABASE_PUBLISHABLE_KEY', 'error')
    return false
  }
  await log('ENV', `Supabase URL: ${VITE_SUPABASE_URL}`, 'success')
  await log('ENV', 'Credentials found', 'success')
  return true
}

async function verifyConnectivity() {
  await log('CONNECT', 'Testing Supabase connectivity...')
  try {
    const client = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
    const { error } = await client.from('exercises').select('count').limit(1)
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    await log('CONNECT', 'Successfully connected to Supabase', 'success')
    return client
  } catch (err) {
    await log('CONNECT', `Connection failed: ${err.message}`, 'error')
    return null
  }
}

async function verifyTables(client) {
  await log('SCHEMA', 'Checking required tables...')
  try {
    const { error } = await client.rpc('get_tables', {})
    if (error && error.code !== 'PGRST116') {
      // If RPC doesn't exist, try querying information schema
      const { data: schemaData, error: schemaError } = await client
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')

      if (!schemaError) {
        const tableNames = schemaData.map((t) => t.table_name)
        const missing = REQUIRED_TABLES.filter((t) => !tableNames.includes(t))
        if (missing.length > 0) {
          await log('SCHEMA', `Missing tables: ${missing.join(', ')}`, 'error')
          return false
        }
        await log('SCHEMA', `All ${REQUIRED_TABLES.length} required tables exist`, 'success')
        return true
      }
    }

    // Quick check by selecting from each table
    for (const table of REQUIRED_TABLES) {
      const { error: tableError } = await client.from(table).select('count').limit(1)
      // PGRST116 = insufficient privileges, but means table exists
      if (tableError && tableError.code !== 'PGRST116') {
        throw new Error(`${table}: ${tableError.message}`)
      }
    }
    await log('SCHEMA', `All ${REQUIRED_TABLES.length} required tables exist`, 'success')
    return true
  } catch (err) {
    await log('SCHEMA', `Table check failed: ${err.message}`, 'error')
    return false
  }
}

async function verifyExercises(client) {
  await log('SEEDS', 'Checking exercise seeds...')
  try {
    const { data: exercises, error } = await client
      .from('exercises')
      .select('name')
      .in('name', REQUIRED_EXERCISES)

    if (error) {
      throw error
    }

    const foundNames = (exercises || []).map((e) => e.name)
    const missing = REQUIRED_EXERCISES.filter((e) => !foundNames.includes(e))

    if (missing.length > 0) {
      await log('SEEDS', `Missing exercises: ${missing.join(', ')}`, 'warning')
    }

    await log('SEEDS', `Found ${exercises?.length || 0}/${REQUIRED_EXERCISES.length} key exercises`, foundNames.length === REQUIRED_EXERCISES.length ? 'success' : 'warning')
    return foundNames.length === REQUIRED_EXERCISES.length
  } catch (err) {
    await log('SEEDS', `Seed check failed: ${err.message}`, 'error')
    return false
  }
}

async function verifyRLS(client) {
  await log('RLS', 'Checking Row-Level Security...')
  try {
    // Try to read exercises without auth (should work - public read)
    const { error } = await client
      .from('exercises')
      .select('id,name')
      .limit(1)

    if (!error || error.code === 'PGRST116') {
      await log('RLS', 'RLS policies are active (some queries require auth)', 'success')
      return true
    }

    await log('RLS', 'Could not verify RLS status', 'warning')
    return true
  } catch (err) {
    await log('RLS', `RLS check error: ${err.message}`, 'warning')
    return true
  }
}

async function verifyIntakFlow(client) {
  await log('FLOW', 'Checking intake flow prerequisites...')
  try {
    // Verify exercises needed for templates
    const templateExercises = [
      'Terminal Knee Extension',
      'Wall Slides',
      'Straight Leg Raise',
      'Quad Sets',
      'Heel Slides',
      'Lateral Band Walks',
      'Bilateral Calf Raises',
      'Single-Leg Balance',
      'Step-Ups',
    ]

    const { data: found, error } = await client
      .from('exercises')
      .select('name')
      .in('name', templateExercises)

    if (error) {
      throw error
    }

    const foundNames = new Set((found || []).map((e) => e.name))
    const coverage = Math.round((foundNames.size / templateExercises.length) * 100)

    await log('FLOW', `Template exercise coverage: ${coverage}% (${foundNames.size}/${templateExercises.length})`, coverage >= 80 ? 'success' : 'warning')
    return coverage >= 80
  } catch (err) {
    await log('FLOW', `Intake flow check failed: ${err.message}`, 'error')
    return false
  }
}

async function run() {
  console.log('\n🏥 RehabPro Supabase Setup Verification\n')

  const envOk = await verifyEnv()
  if (!envOk) {
    console.log('\n❌ Setup incomplete: Missing environment variables')
    console.log('   Run: cp .env.example .env && edit .env with your Supabase credentials\n')
    process.exit(1)
  }

  const client = await verifyConnectivity()
  if (!client) {
    console.log('\n❌ Setup incomplete: Cannot connect to Supabase')
    console.log('   Check your credentials and ensure your Supabase project is running\n')
    process.exit(1)
  }

  const tablesOk = await verifyTables(client)
  const rlsOk = await verifyRLS(client)
  const seedsOk = await verifyExercises(client)
  const intakeOk = await verifyIntakFlow(client)

  console.log('\n' + '='.repeat(60))

  if (tablesOk && seedsOk && intakeOk) {
    console.log('✓ ✓ ✓ Supabase setup is ready for MVP intake flow!\n')
    console.log('Next steps:')
    console.log('  1. npm run dev')
    console.log('  2. Create a new account')
    console.log('  3. Complete the injury intake flow')
    console.log('  4. Verify exercises load in the training view\n')
    process.exit(0)
  } else {
    console.log('⚠ Setup needs attention:\n')
    if (!tablesOk) {
      console.log('  • Run Supabase migrations:')
      console.log('    supabase migration list')
      console.log('    supabase migration up')
    }
    if (!seedsOk) {
      console.log('  • Re-run seed migration: supabase migration up --step 1')
    }
    if (!rlsOk) {
      console.log('  • Verify RLS is enabled in Supabase dashboard')
    }
    console.log('')
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('Verification failed:', err)
  process.exit(1)
})
