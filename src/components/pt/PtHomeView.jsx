import { Tag } from "../ui/Tag";
import { StatBox } from "../ui/StatBox";
import { C } from "../../constants/colors";

/**
 * @typedef {{ workout: string; highlight: string; details: string }} ScheduleItem
 */

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

/**
 * @param {{ patients: any[]; selectedPatientId: string | null; onSelectPatient: (id: string) => void; unresolvedReports?: number; recentCheckIns?: number }} props
 */
export function PtHomeView({ patients, selectedPatientId, onSelectPatient, unresolvedReports = 0, recentCheckIns = 0 }) {
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
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Alerts & reviews
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.4 }}>
              {unresolvedReports} report{unresolvedReports === 1 ? "" : "s"} waiting review.
            </div>
          </div>
          <div style={{ borderRadius: 12, padding: "8px 10px", background: C.redDim, color: C.red, fontFamily: "'Fira Code', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {unresolvedReports} new
          </div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.rim}`, borderRadius: 14, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Fresh check-ins
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.bone, lineHeight: 1.4 }}>
              {recentCheckIns} patient check-in{recentCheckIns === 1 ? "" : "s"} in the last 24h.
            </div>
          </div>
          <div style={{ borderRadius: 12, padding: "8px 10px", background: C.blueDim, color: C.blue, fontFamily: "'Fira Code', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Active
          </div>
        </div>
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
