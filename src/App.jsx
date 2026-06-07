import { useMemo, useState } from "react";
import { useRehabData } from "./hooks/useRehabData";
import "./App.css";

function App() {
  const {
    patients = [],
    reports = [],
    logs = [],
    exercises = [],
    assignExercise,
    removeExercise,
    addWorkoutLog,
  } = useRehabData();

  const [viewMode, setViewMode] = useState("pt");
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [completedExerciseIds, setCompletedExerciseIds] = useState([]);
  const [painLevel, setPainLevel] = useState("0");
  const [notes, setNotes] = useState("");

  const [exerciseSearch, setExerciseSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [injuryFilter, setInjuryFilter] = useState("all");
  const [starredExerciseIds, setStarredExerciseIds] = useState([]);
  const [showAllExercises, setShowAllExercises] = useState(false);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) || patients[0];

  const patientReports = selectedPatient
    ? reports.filter((report) => report.patientId === selectedPatient.id)
    : [];

  const patientLogs = selectedPatient
    ? logs.filter((log) => log.patientId === selectedPatient.id)
    : [];

  const assignedExercises = useMemo(() => {
    if (!selectedPatient) return [];

    return exercises.filter((exercise) =>
      (selectedPatient.assignedExercises || []).includes(exercise.id)
    );
  }, [selectedPatient, exercises]);

  const injuryOptions = useMemo(() => {
    const injuries = exercises.flatMap((exercise) => exercise.injuries || []);
    return [...new Set(injuries)].sort();
  }, [exercises]);

  const levelOptions = useMemo(() => {
    const levels = exercises
      .map((exercise) => exercise.difficulty)
      .filter(Boolean);

    return [...new Set(levels)].sort((a, b) => a - b);
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    if (!selectedPatient) return exercises;

    const search = exerciseSearch.trim().toLowerCase();

    const filtered = exercises.filter((exercise) => {
      const patientInjury = selectedPatient.injury || selectedPatient.condition;
      const patientStage = selectedPatient.stage;

      const matchesPatientInjury =
        !exercise.injuries ||
        !patientInjury ||
        exercise.injuries.includes(patientInjury);

      const matchesPatientStage =
        !exercise.stages ||
        !patientStage ||
        exercise.stages.includes(patientStage);

      const matchesSearch =
        !search ||
        exercise.name?.toLowerCase().includes(search) ||
        exercise.muscles?.toLowerCase().includes(search) ||
        exercise.cue?.toLowerCase().includes(search) ||
        exercise.equipment?.toLowerCase().includes(search);

      const matchesLevel =
        levelFilter === "all" ||
        String(exercise.difficulty) === String(levelFilter);

      const matchesInjuryFilter =
        injuryFilter === "all" || exercise.injuries?.includes(injuryFilter);

      return (
        (matchesPatientInjury || matchesPatientStage) &&
        matchesSearch &&
        matchesLevel &&
        matchesInjuryFilter
      );
    });

    return filtered.sort((a, b) => {
      const aStarred = starredExerciseIds.includes(a.id);
      const bStarred = starredExerciseIds.includes(b.id);

      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;

      return (a.difficulty || 1) - (b.difficulty || 1);
    });
  }, [
    selectedPatient,
    exercises,
    exerciseSearch,
    levelFilter,
    injuryFilter,
    starredExerciseIds,
  ]);

  const visibleExercises = useMemo(() => {
    const hasActiveSearchOrFilter =
      exerciseSearch.trim() || levelFilter !== "all" || injuryFilter !== "all";

    if (showAllExercises || hasActiveSearchOrFilter) {
      return filteredExercises;
    }

    return filteredExercises.slice(0, 6);
  }, [
    filteredExercises,
    exerciseSearch,
    levelFilter,
    injuryFilter,
    showAllExercises,
  ]);

  const getStageClass = (stage) => {
    return String(stage || "unknown").toLowerCase().replaceAll(" ", "-");
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

  const handleToggleComplete = (exerciseId) => {
    setCompletedExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleToggleStar = (exerciseId) => {
    setStarredExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleSubmitWorkout = (event) => {
    event.preventDefault();

    if (!selectedPatient) return;

    addWorkoutLog({
      patientId: selectedPatient.id,
      completedExerciseIds,
      painLevel,
      notes,
    });

    setCompletedExerciseIds([]);
    setPainLevel("0");
    setNotes("");
  };

  const resetExerciseFilters = () => {
    setExerciseSearch("");
    setLevelFilter("all");
    setInjuryFilter("all");
    setShowAllExercises(false);
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
          selectedPatient={selectedPatient}
          selectedPatientId={selectedPatientId}
          setSelectedPatientId={setSelectedPatientId}
          patientReports={patientReports}
          patientLogs={patientLogs}
          assignedExercises={assignedExercises}
          visibleExercises={visibleExercises}
          totalFilteredExercises={filteredExercises.length}
          assignExercise={assignExercise}
          removeExercise={removeExercise}
          exerciseSearch={exerciseSearch}
          setExerciseSearch={setExerciseSearch}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          injuryFilter={injuryFilter}
          setInjuryFilter={setInjuryFilter}
          injuryOptions={injuryOptions}
          levelOptions={levelOptions}
          starredExerciseIds={starredExerciseIds}
          handleToggleStar={handleToggleStar}
          showAllExercises={showAllExercises}
          setShowAllExercises={setShowAllExercises}
          resetExerciseFilters={resetExerciseFilters}
          getStageClass={getStageClass}
          getInitials={getInitials}
          formatDate={formatDate}
        />
      ) : (
        <PatientView
          selectedPatient={selectedPatient}
          patientReports={patientReports}
          patientLogs={patientLogs}
          assignedExercises={assignedExercises}
          completedExerciseIds={completedExerciseIds}
          painLevel={painLevel}
          notes={notes}
          setPainLevel={setPainLevel}
          setNotes={setNotes}
          handleToggleComplete={handleToggleComplete}
          handleSubmitWorkout={handleSubmitWorkout}
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
  assignedExercises,
  visibleExercises,
  totalFilteredExercises,
  assignExercise,
  removeExercise,
  exerciseSearch,
  setExerciseSearch,
  levelFilter,
  setLevelFilter,
  injuryFilter,
  setInjuryFilter,
  injuryOptions,
  levelOptions,
  starredExerciseIds,
  handleToggleStar,
  showAllExercises,
  setShowAllExercises,
  resetExerciseFilters,
  getStageClass,
  getInitials,
  formatDate,
}) {
  const hasActiveSearchOrFilter =
    exerciseSearch.trim() || levelFilter !== "all" || injuryFilter !== "all";

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
                <p>{patient.injury || patient.condition}</p>
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
                <p>{selectedPatient.injury || selectedPatient.condition}</p>
              </div>

              <span
                className={`stage-pill ${getStageClass(selectedPatient.stage)}`}
              >
                {selectedPatient.stage}
              </span>
            </div>

            <div className="grid-three">
              <div className="card stat-card">
                <span>Pain</span>
                <strong>{selectedPatient.pain ?? "N/A"}/10</strong>
              </div>

              <div className="card stat-card">
                <span>Assigned</span>
                <strong>{assignedExercises.length}</strong>
              </div>

              <div className="card stat-card">
                <span>Logs</span>
                <strong>{patientLogs.length}</strong>
              </div>
            </div>

            <div className="card">
              <div className="section-heading">
                <h3>Assigned Exercises</h3>
                <span>{assignedExercises.length}</span>
              </div>

              {assignedExercises.length ? (
                <ul className="simple-list">
                  {assignedExercises.map((exercise) => (
                    <li key={exercise.id}>
                      <div>
                        <strong>{exercise.name}</strong>
                        <p className="muted">
                          {exercise.sets} sets · {exercise.reps} reps ·{" "}
                          {exercise.muscles}
                        </p>
                      </div>

                      <button
                        className="small-action danger"
                        onClick={() =>
                          removeExercise(selectedPatient.id, exercise.id)
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No exercises assigned yet.</p>
              )}
            </div>

            <div className="card">
              <div className="section-heading">
                <div>
                  <h3>Exercise Library</h3>
                  <p className="muted">
                    Search, filter, star favorites, and assign exercises.
                  </p>
                </div>

                <span>
                  {visibleExercises.length} of {totalFilteredExercises}
                </span>
              </div>

              <div className="exercise-toolbar">
                <label className="search-field">
                  <span>Search</span>
                  <input
                    type="search"
                    value={exerciseSearch}
                    onChange={(event) => setExerciseSearch(event.target.value)}
                    placeholder="Search by name, muscle, cue..."
                  />
                </label>

                <label className="filter-field">
                  <span>Level</span>
                  <select
                    value={levelFilter}
                    onChange={(event) => setLevelFilter(event.target.value)}
                  >
                    <option value="all">All levels</option>
                    {levelOptions.map((level) => (
                      <option key={level} value={level}>
                        Level {level}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="filter-field">
                  <span>Injury</span>
                  <select
                    value={injuryFilter}
                    onChange={(event) => setInjuryFilter(event.target.value)}
                  >
                    <option value="all">All injuries</option>
                    {injuryOptions.map((injury) => (
                      <option key={injury} value={injury}>
                        {injury}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="library-helper-row">
                {starredExerciseIds.length > 0 ? (
                  <p className="starred-summary">
                    ★ {starredExerciseIds.length} favorite exercise
                    {starredExerciseIds.length === 1 ? "" : "s"} saved
                  </p>
                ) : (
                  <p className="muted">
                    Showing top suggestions first. Use search or filters to
                    explore the full library.
                  </p>
                )}

                {hasActiveSearchOrFilter && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={resetExerciseFilters}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {visibleExercises.length ? (
                <div className="exercise-library">
                  {visibleExercises.map((exercise) => {
                    const isAssigned = assignedExercises.some(
                      (assignedExercise) => assignedExercise.id === exercise.id
                    );

                    const isStarred = starredExerciseIds.includes(exercise.id);

                    return (
                      <article
                        key={exercise.id}
                        className={`exercise-card ${
                          isStarred ? "starred" : ""
                        }`}
                      >
                        <div>
                          <div className="exercise-card-header">
                            <div>
                              <h4>{exercise.name}</h4>

                              <div className="exercise-tags">
                                {(exercise.injuries || []).map((injury) => (
                                  <span key={injury}>{injury}</span>
                                ))}
                              </div>
                            </div>

                            <span className="difficulty">
                              Level {exercise.difficulty || 1}
                            </span>
                          </div>

                          <p>{exercise.cue}</p>

                          <div className="exercise-meta">
                            <span>{exercise.muscles}</span>
                            <span>
                              {exercise.sets} sets · {exercise.reps} reps
                            </span>
                            <span>{exercise.equipment || "No equipment"}</span>
                          </div>
                        </div>

                        <div className="exercise-actions">
                          <button
                            type="button"
                            className={`star-button ${
                              isStarred ? "active" : ""
                            }`}
                            onClick={() => handleToggleStar(exercise.id)}
                            aria-label={
                              isStarred
                                ? `Unstar ${exercise.name}`
                                : `Star ${exercise.name}`
                            }
                          >
                            {isStarred ? "★" : "☆"}
                          </button>

                          <button
                            className="small-action"
                            disabled={isAssigned}
                            onClick={() =>
                              assignExercise(selectedPatient.id, exercise.id)
                            }
                          >
                            {isAssigned ? "Assigned" : "Assign"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="muted">No exercises match your filters.</p>
              )}

              {!hasActiveSearchOrFilter &&
                !showAllExercises &&
                totalFilteredExercises > visibleExercises.length && (
                  <button
                    type="button"
                    className="show-more-button"
                    onClick={() => setShowAllExercises(true)}
                  >
                    Show all {totalFilteredExercises} matching exercises
                  </button>
                )}

              {!hasActiveSearchOrFilter && showAllExercises && (
                <button
                  type="button"
                  className="show-more-button"
                  onClick={() => setShowAllExercises(false)}
                >
                  Show fewer exercises
                </button>
              )}
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
                      <strong>{formatDate(report)}</strong>
                      <p>{report.summary || report.note || "No summary"}</p>
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
                  {patientLogs.map((log) => {
                    const completedCount =
                      log.completedExerciseIds?.length ||
                      log.completedExercises?.length ||
                      0;

                    return (
                      <article key={log.id} className="report-card">
                        <strong>{formatDate(log)}</strong>
                        <p>
                          Completed {completedCount} exercise
                          {completedCount === 1 ? "" : "s"} · Pain{" "}
                          {log.painLevel ?? "N/A"}/10
                        </p>
                        <p>
                          {log.notes || log.note || log.summary || "No notes"}
                        </p>
                      </article>
                    );
                  })}
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
  assignedExercises,
  completedExerciseIds,
  painLevel,
  notes,
  setPainLevel,
  setNotes,
  handleToggleComplete,
  handleSubmitWorkout,
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
            <strong>
              {selectedPatient.injury || selectedPatient.condition}
            </strong>
            .
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
            <span>{assignedExercises.length}</span>
          </div>

          {assignedExercises.length ? (
            <form className="workout-form" onSubmit={handleSubmitWorkout}>
              <div className="exercise-checklist">
                {assignedExercises.map((exercise) => (
                  <label key={exercise.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={completedExerciseIds.includes(exercise.id)}
                      onChange={() => handleToggleComplete(exercise.id)}
                    />

                    <span>{exercise.name}</span>
                  </label>
                ))}
              </div>

              <label className="form-label">
                Pain level after workout
                <select
                  value={painLevel}
                  onChange={(event) => setPainLevel(event.target.value)}
                >
                  <option value="0">0 - No pain</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5 - Moderate</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10 - Severe</option>
                </select>
              </label>

              <label className="form-label">
                Notes for your PT
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Example: Knee felt stiff during heel slides..."
                />
              </label>

              <button
                className="primary-button"
                disabled={completedExerciseIds.length === 0}
              >
                Submit Workout Log
              </button>
            </form>
          ) : (
            <p className="muted">Your PT has not assigned exercises yet.</p>
          )}
        </div>

        <div className="card">
          <div className="section-heading">
            <h3>Exercise Instructions</h3>
          </div>

          {assignedExercises.length ? (
            <div className="report-list">
              {assignedExercises.map((exercise) => (
                <article key={exercise.id} className="report-card">
                  <h3>{exercise.name}</h3>
                  <p>{exercise.cue}</p>
                  <p>
                    {exercise.sets} sets · {exercise.reps} reps · Rest{" "}
                    {exercise.rest || "as needed"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">No instructions available yet.</p>
          )}
        </div>
      </div>

      <div className="grid-two">
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

        <div className="card">
          <div className="section-heading">
            <h3>Your Recent Activity</h3>
          </div>

          {latestLog ? (
            <article className="report-card">
              <strong>{formatDate(latestLog)}</strong>
              <p>
                Pain {latestLog.painLevel ?? "N/A"}/10 · Completed{" "}
                {latestLog.completedExerciseIds?.length ||
                  latestLog.completedExercises?.length ||
                  0}{" "}
                exercise
                {(latestLog.completedExerciseIds?.length ||
                  latestLog.completedExercises?.length ||
                  0) === 1
                  ? ""
                  : "s"}
              </p>
              <p>
                {latestLog.notes ||
                  latestLog.note ||
                  latestLog.summary ||
                  "No log details"}
              </p>
            </article>
          ) : (
            <p className="muted">No activity logged yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default App;