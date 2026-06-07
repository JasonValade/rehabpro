import { useState, useEffect, useRef } from "react";

const C = {
  black: "#080909",
  deep: "#0f1010",
  panel: "#151717",
  lift: "#1c1f1f",
  rim: "#252929",
  rimHi: "#2f3535",
  lime: "#c8ff00",
  limeDim: "#c8ff0015",
  limeMid: "#c8ff0030",
  red: "#ff2d2d",
  redDim: "#ff2d2d15",
  amber: "#ffb800",
  amberDim: "#ffb80015",
  blue: "#38beff",
  blueDim: "#38beff15",
  bone: "#e8e4dc",
  muted: "#4a5050",
  ghost: "#2a2f2f",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Fira+Code:wght@400;500;600&display=swap');
`;

const MILESTONES = [
  { id: 1, label: "Full Extension", achieved: true, week: 2 },
  { id: 2, label: "90° Flexion", achieved: true, week: 4 },
  { id: 3, label: "Single-leg Balance", achieved: true, week: 6 },
  { id: 4, label: "120° Flexion", achieved: false, week: 10 },
  { id: 5, label: "Pain-free Jog", achieved: false, week: 14 },
  { id: 6, label: "Lateral Cuts", achieved: false, week: 20 },
  { id: 7, label: "Jump Landing", achieved: false, week: 24 },
  { id: 8, label: "Return to Sport", achieved: false, week: 28 },
];

const PERF_DATA = [
  { week: "Wk1", vertical: 0, squat: 0 },
  { week: "Wk4", vertical: 4, squat: 45 },
  { week: "Wk8", vertical: 9, squat: 95 },
  { week: "Wk12", vertical: 14, squat: 145 },
  { week: "Now", vertical: 18, squat: 185 },
];

const REHAB_TODAY = [
  { id: 1, name: "Terminal Knee Ext.", sets: 3, reps: "15", done: true, tag: "ACTIVATION" },
  { id: 2, name: "Wall Slides", sets: 3, reps: "12", done: true, tag: "STRENGTH" },
  { id: 3, name: "SLR", sets: 3, reps: "12ea", done: false, tag: "STABILITY" },
  { id: 4, name: "Lateral Band Walk", sets: 3, reps: "20 steps", done: false, tag: "GLUTE" },
  { id: 5, name: "Calf Raises", sets: 3, reps: "20", done: false, tag: "LOAD" },
];

const GYM_TODAY = [
  { id: 1, name: "Bench Press", sets: 4, reps: "6", load: "265", done: true, pr: false },
  { id: 2, name: "Incline DB Press", sets: 3, reps: "10", load: "80", done: true, pr: false },
  { id: 3, name: "Cable Row", sets: 4, reps: "10", load: "160", done: false, pr: false },
  { id: 4, name: "Lat Pulldown", sets: 3, reps: "12", load: "130", done: false, pr: false },
  { id: 5, name: "Tricep Pushdown", sets: 3, reps: "15", load: "60", done: false, pr: true },
];

const LOCKED_EXERCISES = [
  { name: "Box Jumps", unlocksAt: "120° Flexion", color: C.amber },
  { name: "Lateral Shuffle", unlocksAt: "Pain-free Jog", color: C.amber },
  { name: "Jump Rope", unlocksAt: "Lateral Cuts", color: C.red },
  { name: "Full Court Runs", unlocksAt: "Jump Landing", color: C.red },
];

const PT_MSG = {
  from: "Dr. Rivera",
  time: "2h ago",
  text: "Great progress on the wall slides. ROM looking solid. Let's push to 130° by Thursday — if no swelling after today's session, add one more set to TKE.",
};

const PT_PATIENTS = [
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
    color: C.lime,
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
    color: C.blue,
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
    color: C.yellow,
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
    color: C.purple,
    assignedExercises: ["Quad Sets", "Bridges", "Hip Hikes"],
    alert: true,
  },
];

const PT_THREADS = [
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

const EXERCISE_LIBRARY = [
  "Terminal Knee Extension",
  "Wall Slides",
  "SLR",
  "Calf Raises",
  "Step Downs",
  "Single-leg Bridge",
  "Banded Squats",
  "Heel Slides",
  "Ankle Pumps",
  "Seated Calf Raise",
  "Quad Sets",
  "Bridges",
  "Hip Hikes",
  "Heel Digs",
  "Split Squats",
  "Wall Sits",
  "Mini Band Walks",
  "Step Ups",
];

function PatientCard({ patient, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? C.limeDim : C.panel,
        border: `1px solid ${active ? C.lime : C.rim}`,
        borderRadius: 16,
        textAlign: "left",
        padding: "14px",
        display: "flex",
        gap: 14,
        width: "100%",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: patient.color + "22",
          color: patient.color,
          display: "grid",
          placeItems: "center",
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        {patient.avatar}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: C.bone }}>{patient.name}</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
              {patient.injury} · Week {patient.week}
            </div>
          </div>
          {patient.alert && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.red }} />
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.red }}>REPORT</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Tag label={patient.status} color={C.muted} />
          <Tag label={patient.stage} color={patient.color} />
          <Tag label={`${patient.assignedExercises.length} assigned`} color={C.lime} />
        </div>
      </div>
    </button>
  );
}

function PtHomeView({ patients, selectedPatientId, onSelectPatient }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, color: C.bone, lineHeight: 1.1 }}>
          Your patients
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, marginTop: 6 }}>
          Tap a patient to assign exercises and track progress.
        </div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            active={patient.id === selectedPatientId}
            onClick={() => onSelectPatient(patient.id)}
          />
        ))}
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Quick overview
          </div>
          <Tag label="PT Mode" color={C.lime} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatBox label="Patients" value={patients.length} unit="" color={C.blue} />
          <StatBox label="Alerts" value={patients.filter((p) => p.alert).length} unit="" color={C.red} />
        </div>
      </div>
    </div>
  );
}

function PtTrainView({ patient, onAssign, onUnassign }) {
  if (!patient) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: C.bone }}>No patient selected</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted }}>Choose a patient from Home to assign and review exercises.</div>
      </div>
    );
  }

  const suggestions = EXERCISE_LIBRARY.filter((ex) => !patient.assignedExercises.includes(ex)).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, lineHeight: 1.1 }}>{patient.name}</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginTop: 4 }}>
            Week {patient.week} · {patient.injury}
          </div>
        </div>
        <Tag label={patient.stage} color={patient.color} />
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: "0.1em" }}>Profile</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone }}>{patient.profile}</div>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: "0.1em" }}>Status</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone }}>{patient.status}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone }}>Assigned exercises</div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>{patient.assignedExercises.length} items</div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {patient.assignedExercises.map((name, index) => (
          <div key={`${name}-${index}`} style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.bone }}>{name}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 4 }}>Assigned by you</div>
            </div>
            <button
              type="button"
              onClick={() => onUnassign(patient.id, name)}
              style={{ padding: "10px 14px", background: C.rim, border: "none", borderRadius: 10, color: C.bone, fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: C.bone, marginBottom: 10 }}>Suggested assignments</div>
        <div style={{ display: "grid", gap: 10 }}>
          {suggestions.map((exercise) => (
            <button
              key={exercise}
              type="button"
              onClick={() => onAssign(patient.id, exercise)}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: C.limeDim,
                border: `1px solid ${C.limeMid}`,
                borderRadius: 12,
                color: C.bone,
                textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {exercise}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessagesView({ threads, activeThreadId, onSelectThread, onSendMessage, onBack }) {
  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const message = draft.trim();
    if (!message) return;
    onSendMessage(activeThread.id, message);
    setDraft("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
      {!activeThread ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, color: C.bone }}>Messages</div>
          <div style={{ display: "grid", gap: 10 }}>
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: C.panel,
                  border: `1px solid ${C.rim}`,
                  borderRadius: 16,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: C.bone }}>{thread.patientName}</div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>{thread.updated}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted }}>{thread.excerpt}</div>
                  {thread.hasReport && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red }} />
                      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.red }}>Report</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: "10px 12px",
                background: C.panel,
                border: `1px solid ${C.rim}`,
                borderRadius: 12,
                color: C.bone,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone }}>{activeThread.patientName}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>{activeThread.updated}</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
            {activeThread.messages.map((msg, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: msg.sender === "pt" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 14px",
                    borderRadius: "16px",
                    background: msg.sender === "pt" ? C.lime : C.panel,
                    color: msg.sender === "pt" ? C.black : C.bone,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write a reply..."
              style={{
                flex: 1,
                background: C.panel,
                border: `1px solid ${C.rim}`,
                borderRadius: 14,
                padding: "12px 14px",
                color: C.bone,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              style={{
                width: 48,
                borderRadius: 14,
                border: "none",
                background: C.lime,
                color: C.black,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ label, color = C.lime }) {
  return (
    <span
      style={{
        fontFamily: "'Fira Code', monospace",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.1em",
        color,
        background: color + "18",
        border: `1px solid ${color}30`,
        padding: "2px 7px",
        borderRadius: 3,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function StatBox({ label, value, unit, color = C.lime, sub }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.rim}`,
        borderTop: `2px solid ${color}`,
        borderRadius: "0 0 8px 8px",
        padding: "14px 16px",
        flex: 1,
      }}
    >
      <div
        style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 10,
          color: C.muted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 36,
          color,
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        {value}
        <span style={{ fontSize: 16, color: C.muted, marginLeft: 3 }}>{unit}</span>
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: C.muted,
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function ProgressArc({ pct, size = 100, stroke = 8, color = C.lime, label }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.rim} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: size * 0.22,
            color,
            lineHeight: 1,
          }}
        >
          {pct}%
        </div>
        {label && (
          <div
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 8,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 2,
              textAlign: "center",
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

function SparkLine({ data, color, height = 48 }) {
  const max = Math.max(...data);
  const min = 0;
  const range = max - min || 1;
  const w = 100 / (data.length - 1);
  const points = data
    .map((v, i) => `${i * w},${height - ((v - min) / range) * height}`)
    .join(" ");

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline points={`0,${height} ${points} 100,${height}`} fill={color + "18"} stroke="none" />
      {data.map((v, i) => (
        <circle key={i} cx={i * w} cy={height - ((v - min) / range) * height} r="2" fill={color} />
      ))}
    </svg>
  );
}

function HomeView({ rehabItems, gymItems }) {
  const rehabDone = rehabItems.filter((i) => i.done).length;
  const gymDone = gymItems.filter((i) => i.done).length;
  const totalDone = rehabDone + gymDone;
  const total = rehabItems.length + gymItems.length;
  const dayPct = Math.round((totalDone / total) * 100);
  const achieved = MILESTONES.filter((m) => m.achieved).length;
  const milestonePct = Math.round((achieved / MILESTONES.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          background: C.lime,
          borderRadius: 12,
          padding: "20px 20px 16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 11px)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 10,
              color: C.black + "80",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Week 14 · ACL + Meniscus (L)
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 42,
              color: C.black,
              lineHeight: 1,
              letterSpacing: "0.02em",
            }}
          >
            COME BACK
            <br />STRONGER.
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 4, background: C.black + "20", borderRadius: 2 }}>
              <div
                style={{
                  width: `${dayPct}%`,
                  height: "100%",
                  background: C.black,
                  borderRadius: 2,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 11,
                color: C.black,
                fontWeight: 600,
              }}
            >
              {dayPct}% today
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <StatBox label="Recovery" value={milestonePct} unit="%" color={C.lime} sub={`${achieved}/${MILESTONES.length} milestones`} />
        <StatBox label="Vertical" value={"+18"} unit="in" color={C.blue} sub="from baseline" />
      </div>

      <div
        style={{
          background: C.panel,
          border: `1px solid ${C.rim}`,
          borderLeft: `3px solid ${C.lime}`,
          borderRadius: "0 8px 8px 0",
          padding: "12px 14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 10,
              color: C.lime,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Dr. Rivera · PT
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted }}>
            {PT_MSG.time}
          </div>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.6 }}>
          {PT_MSG.text}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Rehab", done: rehabDone, total: rehabItems.length, color: C.amber, tag: "RECOVERY" },
          { label: "Push Day", done: gymDone, total: gymItems.length, color: C.blue, tag: "STRENGTH" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: C.panel,
              border: `1px solid ${C.rim}`,
              borderRadius: 10,
              padding: "14px 14px 10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <Tag label={s.tag} color={s.color} />
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 32,
                color: s.done === s.total ? s.color : C.bone,
                lineHeight: 1,
                letterSpacing: "0.02em",
              }}
            >
              {s.done}
              <span style={{ fontSize: 18, color: C.muted }}>/ {s.total}</span>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.muted, marginTop: 2 }}>
              {s.label}
            </div>
            <div style={{ marginTop: 10, height: 3, background: C.rim, borderRadius: 1 }}>
              <div
                style={{
                  width: `${(s.done / s.total) * 100}%`,
                  height: "100%",
                  background: s.color,
                  borderRadius: 1,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 10, overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px 8px",
            borderBottom: `1px solid ${C.rim}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 10,
              color: C.muted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Locked · Unlock via milestones
          </div>
        </div>
        {LOCKED_EXERCISES.map((ex, i) => (
          <div
            key={i}
            style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: i < LOCKED_EXERCISES.length - 1 ? `1px solid ${C.ghost}` : "none",
            }}
          >
            <div style={{ fontSize: 14 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, fontWeight: 500 }}>
                {ex.name}
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: ex.color + "80", marginTop: 1 }}>
                Unlocks after: {ex.unlocksAt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainView({ rehabItems, setRehabItems, gymItems, setGymItems }) {
  const [section, setSection] = useState("rehab");
  const items = section === "rehab" ? rehabItems : gymItems;
  const setItems = section === "rehab" ? setRehabItems : setGymItems;

  const toggle = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 8, padding: 3, gap: 3 }}>
        {[["rehab", "REHAB", C.amber], ["gym", "GYM", C.blue]].map(([id, label, color]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 6,
              background: section === id ? color : "transparent",
              color: section === id ? C.black : C.muted,
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 16,
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, letterSpacing: "0.04em" }}>
          {section === "rehab" ? "Recovery Protocol" : "Push Day"}
        </div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.muted }}>
          {items.filter((i) => i.done).length}/{items.length} done
        </div>
      </div>
      {items.map((item, idx) => {
        const color = section === "rehab" ? C.amber : C.blue;
        return (
          <div
            key={item.id}
            onClick={() => toggle(item.id)}
            style={{
              background: item.done ? color + "12" : C.panel,
              border: `1px solid ${item.done ? color + "40" : C.rim}`,
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 28,
                color: item.done ? color : C.rimHi,
                lineHeight: 1,
                minWidth: 28,
                textAlign: "center",
                transition: "color 0.2s",
              }}
            >
              {String(idx + 1).padStart(2, "0")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: item.done ? C.muted : C.bone,
                    textDecoration: item.done ? "line-through" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {item.name}
                </span>
                {item.tag && <Tag label={item.tag} color={color} />}
                {item.pr && <Tag label="PR" color={C.lime} />}
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: C.muted }}>
                {item.sets} × {item.reps}
                {item.load ? ` · ${item.load} lbs` : ""}
              </div>
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                flexShrink: 0,
                background: item.done ? color : "transparent",
                border: `2px solid ${item.done ? "transparent" : C.rimHi}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {item.done && <span style={{ color: C.black, fontSize: 13, fontWeight: 900 }}>✓</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressView() {
  const verticals = PERF_DATA.map((d) => d.vertical);
  const squats = PERF_DATA.map((d) => d.squat);
  const labels = PERF_DATA.map((d) => d.week);
  const achieved = MILESTONES.filter((m) => m.achieved).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, color: C.bone, lineHeight: 1, letterSpacing: "0.02em" }}>
          PERFORMANCE
          <br />
          <span style={{ color: C.lime }}>COMEBACK.</span>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginTop: 4 }}>
          14 weeks post-op · ACL + Meniscus (L)
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <ProgressArc pct={Math.round((achieved / MILESTONES.length) * 100)} size={90} stroke={7} color={C.lime} label="recovery" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone, letterSpacing: "0.04em" }}>
            Phase 2 of 4
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.muted, marginBottom: 8 }}>
            Early Motion → Strengthening
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {MILESTONES.map((m) => (
              <div key={m.id} style={{ flex: 1, height: 4, borderRadius: 1, background: m.achieved ? C.lime : C.rim, transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, marginTop: 4 }}>
            {achieved}/{MILESTONES.length} milestones
          </div>
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.blue, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
          Vertical Jump Recovery
        </div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, letterSpacing: "0.02em", marginBottom: 10 }}>
          +18
          <span style={{ fontSize: 16, color: C.muted }}> in gained</span>
        </div>
        <SparkLine data={verticals} color={C.blue} height={52} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {labels.map((l, i) => (
            <div key={i} style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: i === labels.length - 1 ? C.blue : C.muted, textTransform: "uppercase" }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.amber, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
          Single-leg Squat Load
        </div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: C.bone, letterSpacing: "0.02em", marginBottom: 10 }}>
          185
          <span style={{ fontSize: 16, color: C.muted }}> lbs</span>
        </div>
        <SparkLine data={squats} color={C.amber} height={52} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {labels.map((l, i) => (
            <div key={i} style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: i === labels.length - 1 ? C.amber : C.muted, textTransform: "uppercase" }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.rim}` }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: C.bone, letterSpacing: "0.06em" }}>
            MILESTONE TRACK
          </div>
        </div>
        {MILESTONES.map((m, i) => (
          <div
            key={m.id}
            style={{
              padding: "11px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: i < MILESTONES.length - 1 ? `1px solid ${C.ghost}` : "none",
              background: m.achieved ? C.limeDim : "transparent",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                flexShrink: 0,
                background: m.achieved ? C.lime : "transparent",
                border: `2px solid ${m.achieved ? C.lime : C.rimHi}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {m.achieved && <span style={{ color: C.black, fontSize: 11, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: m.achieved ? C.bone : C.muted, fontWeight: m.achieved ? 500 : 400 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: m.achieved ? C.lime : C.muted }}>
              Wk {m.week}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PT_SYSTEM = `You are Dr. Rivera, a sports-specialized physical therapist inside the RehabPro app. The patient is Jason — 20 years old, 6'2", competitive basketball player, 14 weeks post ACL + meniscus surgery (left knee). Current phase: Early Motion. He trains upper body daily and is focused on returning to full basketball performance — dunking, lateral cuts, explosiveness. He's been tracking vertical jump gains (+18 inches from baseline so far). He also trains on a PPL split for upper body.
Be direct, specific, motivating. Talk like a sports PT who works with athletes, not a hospital doctor. Keep responses under 120 words.`;

function PTChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "What's up Jason. Checked your session data — wall slides look solid. What do you need today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const updated = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: PT_SYSTEM,
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.find((b) => b.type === "text")?.text || "Can't connect right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection issue. Try again." }]);
    }

    setLoading(false);
  };

  const QUICK = ["When can I start jumping?", "Knee feels tight today", "Can I add more leg work?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", gap: 10 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: C.lime + "20",
            border: `1.5px solid ${C.lime}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 16,
            color: C.lime,
          }}
        >
          DR
        </div>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: C.bone }}>
            Dr. Rivera, DPT
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.lime }} />
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime }}>
              Active
            </span>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Tag label="Sports PT" color={C.lime} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "84%",
                padding: "11px 14px",
                borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                background: m.role === "user" ? C.lime : C.panel,
                border: m.role === "user" ? "none" : `1px solid ${C.rim}`,
                color: m.role === "user" ? C.black : C.bone,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "11px 14px", background: C.panel, border: `1px solid ${C.rim}`, borderRadius: "14px 14px 14px 3px", width: "fit-content" }}>
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.muted,
                  animation: "bounce 1.2s ease-in-out infinite",
                  animationDelay: `${j * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {QUICK.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInput(q)}
              style={{
                padding: "9px 14px",
                background: C.limeDim,
                border: `1px solid ${C.limeMid}`,
                borderRadius: 8,
                color: C.lime,
                fontSize: 12,
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask Dr. Rivera..."
          style={{
            flex: 1,
            background: C.panel,
            border: `1px solid ${C.rim}`,
            borderRadius: 10,
            padding: "12px 14px",
            color: C.bone,
            fontSize: 13,
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            width: 46,
            height: 46,
            background: C.lime,
            border: "none",
            borderRadius: 10,
            color: C.black,
            fontSize: 18,
            cursor: "pointer",
            fontWeight: 900,
            opacity: input.trim() && !loading ? 1 : 0.3,
            transition: "opacity 0.2s",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

function ReportView({ rehabItems }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ exercise: "", pain: 0, swelling: 0, location: "", note: "" });
  const [submitted, setSubmitted] = useState(false);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStep(0);
      setForm({ exercise: "", pain: 0, swelling: 0, location: "", note: "" });
    }, 2500);
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "60px 20px" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 60, color: C.lime, lineHeight: 1 }}>
          SENT.
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.muted, textAlign: "center" }}>
          Dr. Rivera has been notified and will respond shortly.
        </div>
      </div>
    );
  }

  const exercises = [...rehabItems.map((e) => e.name), "Other"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: C.red, letterSpacing: "0.02em", lineHeight: 1 }}>
          REPORT
          <br />SYMPTOM.
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, marginTop: 4 }}>
          Your PT will be notified immediately.
        </div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 1, background: i <= step ? C.red : C.rim, transition: "background 0.3s" }} />
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            Which exercise?
          </div>
          {exercises.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setF("exercise", ex);
                setStep(1);
              }}
              style={{
                padding: "13px 16px",
                background: form.exercise === ex ? C.redDim : C.panel,
                border: `1px solid ${form.exercise === ex ? C.red + "60" : C.rim}`,
                borderRadius: 8,
                color: form.exercise === ex ? C.red : C.bone,
                fontSize: 14,
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: form.exercise === ex ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontFamily:
              "'Fira Code', monospace",
            fontSize: 10,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}>
            Rate your symptoms
          </div>
          {[
            ["pain", "PAIN LEVEL", C.red],
            ["swelling", "SWELLING", C.amber],
          ].map(([key, label, color]) => (
            <div key={key}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color, letterSpacing: "0.06em", marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setF(key, n)}
                    style={{
                      flex: 1,
                      aspectRatio: "1",
                      borderRadius: 8,
                      background: form[key] >= n ? color + "25" : C.panel,
                      border: `2px solid ${form[key] >= n ? color : C.rim}`,
                      color: form[key] >= n ? color : C.muted,
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: 22,
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!form.pain || !form.swelling}
            style={{
              padding: "14px",
              background: C.red,
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 20,
              letterSpacing: "0.06em",
              cursor: "pointer",
              opacity: form.pain && form.swelling ? 1 : 0.3,
            }}
          >
            CONTINUE →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Where does it hurt?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Front of knee", "Lateral", "Medial", "Behind knee", "Below kneecap", "General"].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setF("location", loc)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 6,
                  background: form.location === loc ? C.redDim : C.panel,
                  border: `1px solid ${form.location === loc ? C.red + "50" : C.rim}`,
                  color: form.location === loc ? C.red : C.muted,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {loc}
              </button>
            ))}
          </div>
          <textarea
            value={form.note}
            onChange={(e) => setF("note", e.target.value)}
            placeholder="Describe it for Dr. Rivera — sharp, dull, when it started, anything..."
            rows={4}
            style={{
              background: C.panel,
              border: `1px solid ${C.rim}`,
              borderRadius: 8,
              padding: "12px 14px",
              color: C.bone,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              resize: "none",
              outline: "none",
              lineHeight: 1.6,
              width: "100%",
            }}
          />
          <button
            type="button"
            onClick={submit}
            style={{
              padding: "14px",
              background: C.red,
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 20,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            SEND TO DR. RIVERA
          </button>
        </div>
      )}

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          style={{
            background: "transparent",
            border: "none",
            color: C.muted,
            cursor: "pointer",
            fontSize: 13,
            textAlign: "left",
            padding: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ← back
        </button>
      )}
    </div>
  );
}

const TABS = [
  { id: "home", icon: "⬡", label: "HOME" },
  { id: "train", icon: "◈", label: "TRAIN" },
  { id: "progress", icon: "◎", label: "PROGRESS" },
  { id: "pt", icon: "⊕", label: "PT" },
  { id: "report", icon: "", label: "REPORT" },
];

const PT_HOME_TABS = [
  { id: "home", icon: "⬡", label: "HOME" },
  { id: "pt", icon: "⊕", label: "MSG" },
];

const PT_PATIENT_TABS = [
  { id: "train", icon: "◈", label: "TRAIN" },
  { id: "progress", icon: "◎", label: "PROGRESS" },
  { id: "pt", icon: "⊕", label: "MSG" },
];

export default function RehabPro() {
  const [viewMode, setViewMode] = useState("patient");
  const [tab, setTab] = useState("home");
  const [rehabItems, setRehabItems] = useState(REHAB_TODAY);
  const [gymItems, setGymItems] = useState(GYM_TODAY);
  const [ptPatients, setPtPatients] = useState(PT_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [ptDetailMode, setPtDetailMode] = useState(false);
  const [ptThreads, setPtThreads] = useState(PT_THREADS);
  const [activeThreadId, setActiveThreadId] = useState(PT_THREADS[0].id);

  useEffect(() => {
    if (viewMode === "pt") {
      setPtDetailMode(false);
      setTab("home");
    } else {
      setTab("home");
    }
  }, [viewMode]);

  const selectedPatient = ptPatients.find((patient) => patient.id === selectedPatientId);

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setPtDetailMode(true);
    setTab("train");
  };

  const handleBackToPtHome = () => {
    setPtDetailMode(false);
    setTab("home");
    setActiveThreadId("");
  };

  const handleAssignExercise = (patientId, exercise) => {
    setPtPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId && !patient.assignedExercises.includes(exercise)
          ? { ...patient, assignedExercises: [...patient.assignedExercises, exercise] }
          : patient
      )
    );
  };

  const handleUnassignExercise = (patientId, exercise) => {
    setPtPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId
          ? { ...patient, assignedExercises: patient.assignedExercises.filter((item) => item !== exercise) }
          : patient
      )
    );
  };

  const handleSendPtMessage = (threadId, text) => {
    setPtThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              hasReport: false,
              updated: "Now",
              excerpt: text,
              messages: [...thread.messages, { sender: "pt", text, ts: Date.now() }],
            }
          : thread
      )
    );
  };

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
        @keyframes bounce {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
      <div
        style={{
          background: C.black,
          minHeight: "100vh",
          maxWidth: 430,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${C.rim}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: C.bone, letterSpacing: "0.04em", lineHeight: 1 }}>
                REHAB<span style={{ color: C.lime }}>PRO</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 6 }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
                  JASON · WK14 · ACL+MEN
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: "0.08em" }}>
                  {viewMode === "patient" ? "PATIENT MODE" : "PT MODE"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.lime, letterSpacing: "0.08em" }}>
                {rehabItems.filter((i) => i.done).length + gymItems.filter((i) => i.done).length}/{rehabItems.length + gymItems.length} TODAY
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            {[
              { id: "patient", label: "Patient" },
              { id: "pt", label: "PT" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setViewMode(option.id)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 12,
                  border: `1px solid ${viewMode === option.id ? C.lime : C.rim}`,
                  background: viewMode === option.id ? C.lime : C.panel,
                  color: viewMode === option.id ? C.black : C.bone,
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "pt" && ptDetailMode && (
          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              onClick={handleBackToPtHome}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: `1px solid ${C.rim}`,
                background: C.panel,
                color: C.bone,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              ← Back to patients
            </button>
          </div>
        )}

        <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
          {tab === "home" && (viewMode === "pt" ? <PtHomeView patients={ptPatients} selectedPatientId={selectedPatientId} onSelectPatient={handleSelectPatient} /> : <HomeView rehabItems={rehabItems} gymItems={gymItems} />)}
          {tab === "train" && (viewMode === "pt" ? <PtTrainView patient={selectedPatient} onAssign={handleAssignExercise} onUnassign={handleUnassignExercise} /> : <TrainView rehabItems={rehabItems} setRehabItems={setRehabItems} gymItems={gymItems} setGymItems={setGymItems} />)}
          {tab === "progress" && (viewMode === "pt" ? <ProgressView /> : <ProgressView />)}
          {tab === "pt" && (viewMode === "pt" ? <MessagesView threads={ptThreads} activeThreadId={activeThreadId} onSelectThread={setActiveThreadId} onSendMessage={handleSendPtMessage} onBack={() => setActiveThreadId("")} /> : <PTChat />)}
          {tab === "report" && viewMode !== "pt" && <ReportView rehabItems={rehabItems} />}
        </div>

        <div style={{ borderTop: `1px solid ${C.rim}`, background: C.deep, display: "flex", padding: "8px 4px 16px" }}>
          {(viewMode === "pt" ? (ptDetailMode ? PT_PATIENT_TABS : PT_HOME_TABS) : TABS).map((t) => {
            const active = tab === t.id;
            const isReport = t.id === "report";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  border: "none",
                  background: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 18, color: active ? (isReport ? C.red : C.lime) : C.muted, transition: "color 0.15s" }}>
                  {t.icon}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 10, letterSpacing: "0.1em", color: active ? (isReport ? C.red : C.lime) : C.muted, transition: "color 0.15s" }}>
                  {t.label}
                </div>
                {active && <div style={{ width: 16, height: 2, borderRadius: 1, background: isReport ? C.red : C.lime }} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
