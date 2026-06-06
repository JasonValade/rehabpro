import { useState } from "react";
import { useRehabData } from "./hooks/useRehabData";
import "./App.css";

function App() {
  const { patients = [], reports = [], logs = [] } = useRehabData();

  const [viewMode, setViewMode] = useState("pt");
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) || patients[0];

  const patientReports = selectedPatient
    ? reports.filter((report) => report.patientId === selectedPatient.id)
    : [];

  const patientLogs = selectedPatient
    ? logs.filter((log) => log.patientId === selectedPatient.id)
    : [];

  const getStageClass = (stage) => {
    return String(stage || "unknown")
      .toLowerCase()
      .replaceAll(" ", "-");
  };

  const getInitials = (name) => {
    return String(name || "?")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (item) => {
    if (item.date) return item.date;
    if (item.ts) return new Date(item.ts).toLocaleDateString();
    return "No date";
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">RehabPro</p>
          <h1>
            {viewMode === "pt" ? "PT Dashboard" : "Patient Recovery View"}
          </h1>
        </div>

        <div className="view-toggle">
          <button
            className={viewMode === "pt" ? "active" : ""}
            onClick={() => setViewMode("pt")}
          >
            PT View
          </button>

          <button
            className={viewMode === "patient" ? "active" : ""}
            onClick={() => setViewMode("patient")}
          >
            Patient View
          </button>
        </div>
      </header>

      {viewMode === "pt" ? (
        <PTView
          patients={patients}
          reports={reports}
          logs={logs}
          selectedPatient={selectedPatient}
          selectedPatientId={selectedPatientId}
          setSelectedPatientId={setSelectedPatientId}
          patientReports={patientReports}
          patientLogs={patientLogs}
          getStageClass={getStageClass}
          getInitials={getInitials}
          formatDate={formatDate}
        />
      ) : (
        <PatientView
          selectedPatient={selectedPatient}
          patientReports={patientReports}
          patientLogs={patientLogs}
          getStageClass={getStageClass}
          formatDate={formatDate}
        />
      )}
    </main>
  );
}

function PTView({
  patients,
  selectedPatient,
  selectedPatientId,
  setSelectedPatientId,
  patientReports,
  patientLogs,
  getStageClass,
  getInitials,
  formatDate,
}) {
  return (
    <section className="layout">
      <aside className="sidebar card">
        <div className="section-heading">
          <h2>Patients</h2>
          <span>{patients.length}</span>
        </div>

        <div className="patient-list">
          {patients.map((patient) => (
            <button
              key={patient.id}
              className={
                selectedPatient?.id === patient.id ||
                selectedPatientId === patient.id
                  ? "patient-row active"
                  : "patient-row"
              }
              onClick={() => setSelectedPatientId(patient.id)}
            >
              <div className="avatar">{getInitials(patient.name)}</div>

              <div>
                <strong>{patient.name}</strong>
                <p>{patient.injury}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="main-panel">
        {selectedPatient ? (
          <>
            <div className="patient-hero card">
              <div>
                <p className="eyebrow">Selected Patient</p>
                <h2>{selectedPatient.name}</h2>
                <p>{selectedPatient.injury}</p>
              </div>

              <span
                className={`stage-pill ${getStageClass(selectedPatient.stage)}`}
              >
                {selectedPatient.stage}
              </span>
            </div>

            <div className="grid-two">
              <div className="card">
                <div className="section-heading">
                  <h3>Recovery Snapshot</h3>
                </div>

                <div className="metric-list">
                  <div>
                    <span>Pain</span>
                    <strong>{selectedPatient.pain ?? "N/A"}/10</strong>
                  </div>

                  <div>
                    <span>ROM</span>
                    <strong>{selectedPatient.rom ?? "N/A"}</strong>
                  </div>

                  <div>
                    <span>Compliance</span>
                    <strong>{selectedPatient.compliance ?? "N/A"}%</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="section-heading">
                  <h3>Assigned Exercises</h3>
                </div>

                {selectedPatient.assignedExercises?.length ? (
                  <ul className="simple-list">
                    {selectedPatient.assignedExercises.map((exerciseId) => (
                      <li key={exerciseId}>{exerciseId}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No exercises assigned yet.</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="section-heading">
                <h3>Reports</h3>
                <span>{patientReports.length}</span>
              </div>

              {patientReports.length ? (
                <div className="report-list">
                  {patientReports.map((report) => (
                    <article key={report.id} className="report-card">
                      <div>
                        <strong>{formatDate(report)}</strong>
                        <p>{report.summary || report.note || "No summary"}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted">No reports for this patient yet.</p>
              )}
            </div>

            <div className="card">
              <div className="section-heading">
                <h3>Recent Logs</h3>
                <span>{patientLogs.length}</span>
              </div>

              {patientLogs.length ? (
                <div className="report-list">
                  {patientLogs.map((log) => (
                    <article key={log.id} className="report-card">
                      <div>
                        <strong>{formatDate(log)}</strong>
                        <p>{log.note || log.summary || "No log details"}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted">No logs yet.</p>
              )}
            </div>
          </>
        ) : (
          <div className="card">
            <p>No patients found.</p>
          </div>
        )}
      </section>
    </section>
  );
}

function PatientView({
  selectedPatient,
  patientReports,
  patientLogs,
  getStageClass,
  formatDate,
}) {
  if (!selectedPatient) {
    return (
      <section className="card">
        <p>No patient selected.</p>
      </section>
    );
  }

  const latestReport = patientReports[0];
  const latestLog = patientLogs[0];

  return (
    <section className="patient-portal">
      <div className="patient-welcome card">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>{selectedPatient.name}</h2>
          <p>
            Your current recovery focus is{" "}
            <strong>{selectedPatient.injury}</strong>.
          </p>
        </div>

        <span className={`stage-pill ${getStageClass(selectedPatient.stage)}`}>
          {selectedPatient.stage}
        </span>
      </div>

      <div className="grid-three">
        <div className="card stat-card">
          <span>Pain Level</span>
          <strong>{selectedPatient.pain ?? "N/A"}/10</strong>
        </div>

        <div className="card stat-card">
          <span>Range of Motion</span>
          <strong>{selectedPatient.rom ?? "N/A"}</strong>
        </div>

        <div className="card stat-card">
          <span>Program Compliance</span>
          <strong>{selectedPatient.compliance ?? "N/A"}%</strong>
        </div>
      </div>

      <div className="grid-two">
        <div className="card">
          <div className="section-heading">
            <h3>Today’s Program</h3>
          </div>

          {selectedPatient.assignedExercises?.length ? (
            <ul className="simple-list">
              {selectedPatient.assignedExercises.map((exerciseId) => (
                <li key={exerciseId}>
                  <span>{exerciseId}</span>
                  <button className="small-action">View</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Your PT has not assigned exercises yet.</p>
          )}
        </div>

        <div className="card">
          <div className="section-heading">
            <h3>Latest PT Note</h3>
          </div>

          {latestReport ? (
            <article className="report-card">
              <strong>{formatDate(latestReport)}</strong>
              <p>{latestReport.summary || latestReport.note || "No summary"}</p>
            </article>
          ) : (
            <p className="muted">No PT notes yet.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-heading">
          <h3>Your Recent Activity</h3>
        </div>

        {latestLog ? (
          <article className="report-card">
            <strong>{formatDate(latestLog)}</strong>
            <p>{latestLog.note || latestLog.summary || "No log details"}</p>
          </article>
        ) : (
          <p className="muted">No activity logged yet.</p>
        )}
      </div>
    </section>
  );
}

export default App;