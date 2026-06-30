create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  injury_type text not null,
  injury_side text not null,
  rehab_phase text not null,
  week integer not null default 0,
  goal text not null,
  baseline_pain integer not null default 0 check (baseline_pain between 0 and 10),
  baseline_swelling integer not null default 0 check (baseline_swelling between 0 and 10),
  baseline_rom integer not null default 0,
  baseline_difficulty integer not null default 0 check (baseline_difficulty between 0 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.injury_intakes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscles text,
  equipment text,
  cue text,
  description text,
  difficulty integer,
  youtube_url text,
  youtube_id text,
  reminder text,
  instructions text,
  clinical_notes text,
  rest text,
  created_at timestamptz not null default now()
);

create table if not exists public.rehab_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  template_key text not null,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.rehab_plans(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  sets integer not null default 3,
  reps text not null default '10',
  cadence text not null default 'Daily',
  sort_order integer not null default 1
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.session_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  pain integer not null check (pain between 0 and 10),
  swelling integer not null check (swelling between 0 and 10),
  difficulty integer not null check (difficulty between 0 and 10),
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create trigger patients_set_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

create trigger rehab_plans_set_updated_at
before update on public.rehab_plans
for each row execute function public.set_updated_at();

create trigger sessions_set_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.injury_intakes enable row level security;
alter table public.exercises enable row level security;
alter table public.rehab_plans enable row level security;
alter table public.plan_exercises enable row level security;
alter table public.sessions enable row level security;
alter table public.session_logs enable row level security;

create policy "profiles own rows" on public.profiles
for all using (id = auth.uid())
with check (id = auth.uid());

create policy "patients own rows" on public.patients
for all using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "injury intakes own rows" on public.injury_intakes
for all using (
  exists (
    select 1 from public.patients
    where patients.id = injury_intakes.patient_id
    and patients.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.patients
    where patients.id = injury_intakes.patient_id
    and patients.profile_id = auth.uid()
  )
);

create policy "authenticated users can read exercises" on public.exercises
for select using (auth.role() = 'authenticated');

create policy "rehab plans own rows" on public.rehab_plans
for all using (
  exists (
    select 1 from public.patients
    where patients.id = rehab_plans.patient_id
    and patients.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.patients
    where patients.id = rehab_plans.patient_id
    and patients.profile_id = auth.uid()
  )
);

create policy "plan exercises own rows" on public.plan_exercises
for all using (
  exists (
    select 1
    from public.rehab_plans
    join public.patients on patients.id = rehab_plans.patient_id
    where rehab_plans.id = plan_exercises.plan_id
    and patients.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.rehab_plans
    join public.patients on patients.id = rehab_plans.patient_id
    where rehab_plans.id = plan_exercises.plan_id
    and patients.profile_id = auth.uid()
  )
);

create policy "sessions own rows" on public.sessions
for all using (
  exists (
    select 1 from public.patients
    where patients.id = sessions.patient_id
    and patients.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.patients
    where patients.id = sessions.patient_id
    and patients.profile_id = auth.uid()
  )
);

create policy "session logs own rows" on public.session_logs
for all using (
  exists (
    select 1 from public.patients
    where patients.id = session_logs.patient_id
    and patients.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.patients
    where patients.id = session_logs.patient_id
    and patients.profile_id = auth.uid()
  )
);

insert into public.exercises (
  name,
  muscles,
  equipment,
  cue,
  description,
  difficulty,
  youtube_url,
  reminder,
  instructions,
  clinical_notes,
  rest
) values
  (
    'Terminal Knee Extension',
    'Quadriceps, terminal knee control',
    'Resistance band',
    'Press the knee straight and squeeze the quad.',
    'Band-resisted terminal extension exercise for quad activation and gait carryover.',
    2,
    'https://www.youtube.com/shorts/CU7Fn11YMTw',
    'Discomfort is fine, pain is not.',
    'Anchor the band behind the knee. Start with a soft bend, then press the knee straight and squeeze the quad for one full second before returning slowly.',
    'Goal is clean terminal extension without hip compensation.',
    '45 sec'
  ),
  (
    'Heel Slides',
    'Knee flexion mobility',
    'None',
    'Slide the heel toward you without forcing pain.',
    'Foundational knee flexion range-of-motion drill.',
    1,
    'https://www.youtube.com/shorts/zcQLlI056HI',
    'Stop before sharp pain or pinching.',
    'Lie on your back and slowly slide the heel toward your hip, pause, then return with control.',
    'Prioritize smooth motion and symptom control.',
    '30 sec'
  ),
  (
    'Wall Slides',
    'Knee flexion mobility',
    'Wall',
    'Use the wall to guide a controlled knee bend.',
    'Gravity-assisted knee flexion mobility drill.',
    2,
    'https://www.youtube.com/shorts/zcQLlI056HI',
    'Stop before sharp pain or pinching.',
    'Lie on your back with your foot on the wall. Slide the heel down until you feel a firm stretch, pause, then assist the leg back up.',
    'Keep reps smooth and do not chase range if swelling feels elevated.',
    '45 sec'
  ),
  (
    'Straight Leg Raise',
    'Quadriceps, hip flexor control',
    'None',
    'Lock the knee before each lift.',
    'Foundational quad control drill used when knee extension quality matters.',
    2,
    'https://www.youtube.com/shorts/4h5wRszUH2I',
    'No quad lag. Reset if the knee bends.',
    'Lock the knee first, lift the leg to about 45 degrees, pause briefly, then lower with control.',
    'Reduce range if fatigue changes mechanics.',
    '45 sec'
  ),
  (
    'Quad Sets',
    'Quadriceps activation',
    'None',
    'Push the knee down and tighten the quad.',
    'Early-stage quadriceps activation exercise.',
    1,
    'https://www.youtube.com/watch?v=au62CidApd0',
    'Light muscle work is okay; joint pain is the stop sign.',
    'Sit or lie with the knee straight. Tighten the quad, press the back of the knee down, hold briefly, then relax.',
    'Watch for clean quad contraction without hip compensation.',
    '30 sec'
  ),
  (
    'Lateral Band Walks',
    'Glutes, hip control',
    'Resistance band',
    'Keep the knee tracking over the second toe.',
    'Hip control drill for lower-extremity alignment.',
    3,
    'https://www.youtube.com/shorts/HW9xLHrLhxI',
    'Keep the knee tracking over the second toe.',
    'Place the band above the knees, sit into a small squat, and step sideways without letting the knees cave inward.',
    'Use this as hip control work before step-up progressions.',
    '60 sec'
  ),
  (
    'Bilateral Calf Raises',
    'Calf strength, ankle control',
    'Wall or counter support',
    'Rise through the big toe side of the foot.',
    'Foundational calf capacity exercise for ankle and lower-leg loading.',
    2,
    'https://www.youtube.com/watch?v=Km0QS46bTEA',
    'Light muscle burn is okay. Joint pain is the stop sign.',
    'Stand tall with light fingertip support. Rise through the big toe side of the foot, pause, then lower slowly.',
    'Keep load symmetrical before progressing to single-leg work.',
    '60 sec'
  ),
  (
    'Glute Bridge',
    'Glutes, hamstrings, trunk control',
    'None',
    'Drive through the heels and keep hips level.',
    'Posterior-chain control exercise for glute, hamstring, and trunk coordination.',
    2,
    'https://www.youtube.com/watch?v=A7fcobCVppc',
    'Move with control and avoid back pinching.',
    'Lie on your back with knees bent. Brace gently, lift hips until shoulders-hips-knees line up, pause, then lower slowly.',
    'Keep pressure balanced through both feet.',
    '45 sec'
  )
on conflict (name) do update set
  muscles = excluded.muscles,
  equipment = excluded.equipment,
  cue = excluded.cue,
  description = excluded.description,
  difficulty = excluded.difficulty,
  youtube_url = excluded.youtube_url,
  reminder = excluded.reminder,
  instructions = excluded.instructions,
  clinical_notes = excluded.clinical_notes,
  rest = excluded.rest;
