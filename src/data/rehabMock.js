import { EXERCISE_LIBRARY as EXERCISE_LIBRARY_OBJECTS } from "./exerciseLibrary";

export const MILESTONES = [
  { id: 1, label: "Full Extension", achieved: true, week: 2 },
  { id: 2, label: "90° Flexion", achieved: true, week: 4 },
  { id: 3, label: "Single-leg Balance", achieved: true, week: 6 },
  { id: 4, label: "120° Flexion", achieved: false, week: 10 },
  { id: 5, label: "Pain-free Jog", achieved: false, week: 14 },
  { id: 6, label: "Lateral Cuts", achieved: false, week: 20 },
  { id: 7, label: "Jump Landing", achieved: false, week: 24 },
  { id: 8, label: "Return to Sport", achieved: false, week: 28 },
];

export const PERF_DATA = [
  { week: "Wk1", vertical: 0, squat: 0 },
  { week: "Wk4", vertical: 4, squat: 45 },
  { week: "Wk8", vertical: 9, squat: 95 },
  { week: "Wk12", vertical: 14, squat: 145 },
  { week: "Now", vertical: 18, squat: 185 },
];

export const REHAB_TODAY = [
  { id: 1, name: "Terminal Knee Ext.", sets: 3, reps: "15", done: true, tag: "ACTIVATION" },
  { id: 2, name: "Wall Slides", sets: 3, reps: "12", done: true, tag: "STRENGTH" },
  { id: 3, name: "SLR", sets: 3, reps: "12ea", done: false, tag: "STABILITY" },
  { id: 4, name: "Lateral Band Walk", sets: 3, reps: "20 steps", done: false, tag: "GLUTE" },
  { id: 5, name: "Calf Raises", sets: 3, reps: "20", done: false, tag: "LOAD" },
];

export const GYM_TODAY = [
  { id: 1, name: "Bench Press", sets: 4, reps: "6", load: "265", done: true, pr: false },
  { id: 2, name: "Incline DB Press", sets: 3, reps: "10", load: "80", done: true, pr: false },
  { id: 3, name: "Cable Row", sets: 4, reps: "10", load: "160", done: false, pr: false },
  { id: 4, name: "Lat Pulldown", sets: 3, reps: "12", load: "130", done: false, pr: false },
  { id: 5, name: "Tricep Pushdown", sets: 3, reps: "15", load: "60", done: false, pr: true },
];

export const LOCKED_EXERCISES = [
  { name: "Box Jumps", unlocksAt: "120° Flexion", color: "#ffb800" },
  { name: "Lateral Shuffle", unlocksAt: "Pain-free Jog", color: "#ffb800" },
  { name: "Jump Rope", unlocksAt: "Lateral Cuts", color: "#ff2d2d" },
  { name: "Full Court Runs", unlocksAt: "Jump Landing", color: "#ff2d2d" },
];

export const PT_MSG = {
  from: "Dr. Rivera",
  time: "2h ago",
  text: "Great progress on the wall slides. ROM looking solid. Let's push to 130° by Thursday — if no swelling after today's session, add one more set to TKE.",
};

export const PT_PATIENTS = [
  {
    id: "pt_jason",
    name: "Jason M.",
    age: 22,
    injury: "ACL + Meniscus",
    stage: "Early Motion",
    week: 14,
    status: "At home",
    profile: "Competitive basketball athlete",
    avatar: "JM",
    color: "#c8ff00",
    assignedExercises: ["Terminal Knee Extension", "Wall Slides", "SLR", "Calf Raises"],
    alert: true,
  },
  {
    id: "pt_sara",
    name: "Sara K.",
    age: 31,
    injury: "Patellar Tendon",
    stage: "Strengthening",
    week: 22,
    status: "Remote",
    profile: "Weekend pickleball player",
    avatar: "SK",
    color: "#38beff",
    assignedExercises: ["Step Downs", "Single-leg Bridge", "Banded Squats"],
    alert: false,
  },
  {
    id: "pt_mike",
    name: "Mike T.",
    age: 26,
    injury: "Achilles",
    stage: "Protection",
    week: 5,
    status: "At home",
    profile: "Recreational soccer",
    avatar: "MT",
    color: "#f5c842",
    assignedExercises: ["Heel Slides", "Ankle Pumps", "Seated Calf Raise"],
    alert: false,
  },
  {
    id: "pt_emma",
    name: "Emma R.",
    age: 19,
    injury: "ACL + Meniscus",
    stage: "Prehab",
    week: 0,
    status: "Pre-surgery",
    profile: "Soccer recruit",
    avatar: "ER",
    color: "#a78bfa",
    assignedExercises: ["Quad Sets", "Bridges", "Hip Hikes"],
    alert: true,
  },
];

export const PT_THREADS = [
  {
    id: "thread_jason",
    patientId: "pt_jason",
    patientName: "Jason M.",
    updated: "2h ago",
    excerpt: "Knee is tight after the heel slides. Need to adjust today.",
    hasReport: true,
    messages: [
      { sender: "patient", text: "Knee is tight after the heel slides. Need to adjust today.", ts: Date.now() - 1000 * 60 * 60 * 2 },
      { sender: "pt", text: "Keep load light and avoid end-range pain. Let's swap in heel digs for wall slides tonight.", ts: Date.now() - 1000 * 60 * 60 * 1 },
    ],
  },
  {
    id: "thread_sara",
    patientId: "pt_sara",
    patientName: "Sara K.",
    updated: "45m ago",
    excerpt: "Can I swap split squats for wall sits today? Tendon feels cranky.",
    hasReport: false,
    messages: [
      { sender: "patient", text: "Can I swap split squats for wall sits today? Tendon feels cranky.", ts: Date.now() - 1000 * 60 * 42 },
      { sender: "pt", text: "Yes, keep it lighter and stay below 3/10 pain. We'll return to split squats tomorrow if it feels good.", ts: Date.now() - 1000 * 60 * 30 },
    ],
  },
  {
    id: "thread_mike",
    patientId: "pt_mike",
    patientName: "Mike T.",
    updated: "5h ago",
    excerpt: "Swelling returned after walk. Need a plan for tomorrow.",
    hasReport: true,
    messages: [
      { sender: "patient", text: "Swelling returned after walk. Need a plan for tomorrow.", ts: Date.now() - 1000 * 60 * 60 * 5 },
      { sender: "pt", text: "Keep elevation and ice tonight, and hold off on resistance until morning. We'll reduce volume by 1 set.", ts: Date.now() - 1000 * 60 * 60 * 4 },
    ],
  },
  {
    id: "thread_emma",
    patientId: "pt_emma",
    patientName: "Emma R.",
    updated: "1d ago",
    excerpt: "Feeling strong in prehab, want to add landings soon.",
    hasReport: false,
    messages: [
      { sender: "patient", text: "Feeling strong in prehab, want to add landings soon.", ts: Date.now() - 1000 * 60 * 60 * 24 },
      { sender: "pt", text: "Let’s build tolerance with low-impact hops first, then progress to landings next week.", ts: Date.now() - 1000 * 60 * 60 * 23 },
    ],
  },
];

export const EXERCISE_NAMES = EXERCISE_LIBRARY_OBJECTS.map((exercise) => exercise.name);
