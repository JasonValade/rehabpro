import React, { useMemo, useState } from "react";
import { C } from "../../constants/colors";

const STEPS = ["About you", "Doctor script", "Current status", "Care setup"];

const labelStyle = {
  fontFamily: "'Fira Code', monospace",
  fontSize: 9,
  color: C.muted,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
};

const fieldStyle = {
  width: "100%",
  borderRadius: 12,
  border: `1px solid ${C.rim}`,
  background: C.deep,
  color: C.bone,
  padding: "12px 13px",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
};

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function ChoiceGroup({ label, value, options, onChange }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            style={{
              minHeight: 48,
              padding: "10px 11px",
              borderRadius: 12,
              border: `1px solid ${value === option.value ? C.lime : C.rim}`,
              background: value === option.value ? C.limeDim : C.deep,
              color: value === option.value ? C.lime : C.bone,
              textAlign: "left",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              lineHeight: 1.35,
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "11px 0", borderBottom: `1px solid ${C.ghost}` }}>
      <span style={{ ...labelStyle, flexShrink: 0 }}>{label}</span>
      <span style={{ color: C.bone, fontFamily: "'DM Sans', sans-serif", fontSize: 12, textAlign: "right", lineHeight: 1.45 }}>{value || "Not provided"}</span>
    </div>
  );
}

export function IntakeView({ intake, onChange, onComplete, onOpenPlan }) {
  const [step, setStep] = useState(intake.completed ? STEPS.length : Math.min(intake.step || 0, STEPS.length));
  const update = (field, value) => onChange({ ...intake, [field]: value, step });

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(intake.firstName && intake.lastName && intake.dateOfBirth && intake.injury && intake.injurySide && intake.treatmentStage);
    if (step === 1) return Boolean(intake.scriptFileName || intake.scriptText?.trim());
    if (step === 2) {
      const pain = Number(intake.pain);
      const swelling = Number(intake.swelling);
      return intake.pain !== "" && intake.swelling !== "" && pain >= 0 && pain <= 10 && swelling >= 0 && swelling <= 10 && Boolean(intake.primaryGoal?.trim()) && intake.redFlags === "no";
    }
    if (step === 3) return Boolean(intake.oversight);
    return true;
  }, [intake, step]);

  const goNext = () => {
    if (!canContinue) return;
    const nextStep = Math.min(step + 1, STEPS.length);
    setStep(nextStep);
    onChange({ ...intake, step: nextStep });
  };

  const complete = () => {
    onComplete({ ...intake, completed: true, completedAt: Date.now(), step: STEPS.length });
    setStep(STEPS.length);
  };

  if (intake.completed) {
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <section style={{ borderRadius: 20, padding: 20, background: C.lime, color: C.black }}>
          <div style={{ ...labelStyle, color: "rgba(8,9,9,0.58)" }}>Intake received</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, lineHeight: 1, marginTop: 8 }}>YOUR STARTER PLAN IS READY.</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.55, marginTop: 10 }}>
            We saved your script details and current symptoms. Start with low-load movements while your care setup is reviewed.
          </div>
          <button type="button" onClick={onOpenPlan} style={{ width: "100%", marginTop: 16, padding: "13px 16px", border: "none", borderRadius: 12, background: C.black, color: C.bone, fontWeight: 700 }}>
            Open starter plan
          </button>
        </section>

        <section style={{ borderRadius: 16, border: `1px solid ${C.rim}`, background: C.panel, padding: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: C.bone }}>INTAKE SUMMARY</div>
          <SummaryRow label="Patient" value={`${intake.firstName} ${intake.lastName}`} />
          <SummaryRow label="Injury" value={`${intake.injury} · ${intake.injurySide}`} />
          <SummaryRow label="Script" value={intake.scriptFileName || "Entered manually"} />
          <SummaryRow label="Goal" value={intake.primaryGoal} />
          <SummaryRow label="Care" value={intake.oversight === "pt" ? "PT-guided care" : "Self-guided starter plan"} />
          <button type="button" onClick={() => { onChange({ ...intake, completed: false }); setStep(0); }} style={{ width: "100%", marginTop: 14, padding: 11, borderRadius: 11, border: `1px solid ${C.rim}`, background: C.deep, color: C.muted, fontSize: 12 }}>
            Edit intake
          </button>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ ...labelStyle, color: C.lime }}>New patient intake</div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, color: C.bone, lineHeight: 1, marginTop: 7 }}>BUILD YOUR FIRST PLAN.</div>
        <div style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.55, marginTop: 8 }}>
          Tell us what your clinician prescribed and how you feel today. Your answers save automatically on this device.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 6 }}>
        {STEPS.map((name, index) => (
          <div key={name}>
            <div style={{ height: 4, borderRadius: 99, background: index <= step ? C.lime : C.rim }} />
            <div style={{ ...labelStyle, color: index === step ? C.lime : C.muted, fontSize: 7, marginTop: 6 }}>{name}</div>
          </div>
        ))}
      </div>

      <section style={{ borderRadius: 16, border: `1px solid ${C.rim}`, background: C.panel, padding: 16, display: "grid", gap: 16 }}>
        {step === 0 ? (
          <>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone }}>ABOUT YOU</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="First name"><input aria-label="First name" value={intake.firstName} onChange={(event) => update("firstName", event.target.value)} style={fieldStyle} /></Field>
              <Field label="Last name"><input aria-label="Last name" value={intake.lastName} onChange={(event) => update("lastName", event.target.value)} style={fieldStyle} /></Field>
            </div>
            <Field label="Date of birth"><input aria-label="Date of birth" type="date" value={intake.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} style={fieldStyle} /></Field>
            <Field label="Primary injury or diagnosis"><input aria-label="Primary injury or diagnosis" value={intake.injury} onChange={(event) => update("injury", event.target.value)} placeholder="Example: ACL reconstruction" style={fieldStyle} /></Field>
            <ChoiceGroup label="Injury side" value={intake.injurySide} onChange={(value) => update("injurySide", value)} options={[{ value: "Left", label: "Left" }, { value: "Right", label: "Right" }, { value: "Both", label: "Both" }, { value: "Not applicable", label: "Not applicable" }]} />
            <ChoiceGroup label="Where are you in treatment?" value={intake.treatmentStage} onChange={(value) => update("treatmentStage", value)} options={[{ value: "Pre-surgery", label: "Preparing for surgery" }, { value: "Post-surgery", label: "After surgery" }, { value: "Non-surgical", label: "Non-surgical rehab" }, { value: "Not sure", label: "Not sure yet" }]} />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone }}>ADD YOUR DOCTOR SCRIPT</div>
              <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginTop: 5 }}>Attach a PDF or photo, or enter the important instructions below.</div>
            </div>
            <label style={{ display: "grid", placeItems: "center", minHeight: 118, padding: 18, borderRadius: 14, border: `1px dashed ${intake.scriptFileName ? C.lime : C.rimHi}`, background: intake.scriptFileName ? C.limeDim : C.deep, textAlign: "center", cursor: "pointer" }}>
              <input aria-label="Doctor script file" type="file" accept=".pdf,image/*" onChange={(event) => update("scriptFileName", event.target.files?.[0]?.name || "")} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: intake.scriptFileName ? C.lime : C.bone }}>{intake.scriptFileName || "CHOOSE PDF OR PHOTO"}</span>
              <span style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>The demo stores the filename only, not the document.</span>
            </label>
            <Field label="Script instructions"><textarea aria-label="Script instructions" rows={6} value={intake.scriptText} onChange={(event) => update("scriptText", event.target.value)} placeholder="Diagnosis, precautions, weight-bearing status, frequency, or protocol notes..." style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.55 }} /></Field>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone }}>CURRENT STATUS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Pain today (0-10)"><input aria-label="Pain today" type="number" min="0" max="10" value={intake.pain} onChange={(event) => update("pain", event.target.value)} style={fieldStyle} /></Field>
              <Field label="Swelling (0-10)"><input aria-label="Swelling" type="number" min="0" max="10" value={intake.swelling} onChange={(event) => update("swelling", event.target.value)} style={fieldStyle} /></Field>
            </div>
            <Field label="Primary recovery goal"><textarea aria-label="Primary recovery goal" rows={3} value={intake.primaryGoal} onChange={(event) => update("primaryGoal", event.target.value)} placeholder="What activity do you most want to return to?" style={{ ...fieldStyle, resize: "none" }} /></Field>
            <ChoiceGroup label="Any new numbness, calf pain, fever, chest pain, or trouble breathing?" value={intake.redFlags} onChange={(value) => update("redFlags", value)} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes, I need guidance" }]} />
            {intake.redFlags === "yes" ? <div role="alert" style={{ padding: 12, borderRadius: 12, border: `1px solid ${C.red}`, background: C.redDim, color: C.bone, fontSize: 12, lineHeight: 1.5 }}>Do not begin the starter plan. Contact your clinician now; call emergency services for chest pain or trouble breathing.</div> : null}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: C.bone }}>CHOOSE YOUR CARE SETUP</div>
              <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginTop: 5 }}>You can change this later. A clinician should clear any post-operative exercise plan.</div>
            </div>
            <ChoiceGroup label="Care preference" value={intake.oversight} onChange={(value) => update("oversight", value)} options={[{ value: "pt", label: "Connect me with a PT" }, { value: "self", label: "Start self-guided" }]} />
            <Field label="Anything else your care team should know?"><textarea aria-label="Additional care notes" rows={4} value={intake.additionalNotes} onChange={(event) => update("additionalNotes", event.target.value)} style={{ ...fieldStyle, resize: "none" }} /></Field>
          </>
        ) : null}

        {step === STEPS.length ? (
          <>
            <div>
              <div style={{ ...labelStyle, color: C.lime }}>Ready to submit</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 26, color: C.bone, marginTop: 5 }}>REVIEW YOUR INTAKE</div>
            </div>
            <SummaryRow label="Patient" value={`${intake.firstName} ${intake.lastName}`} />
            <SummaryRow label="Injury" value={`${intake.injury} · ${intake.injurySide}`} />
            <SummaryRow label="Treatment" value={intake.treatmentStage} />
            <SummaryRow label="Script" value={intake.scriptFileName || "Instructions entered manually"} />
            <SummaryRow label="Symptoms" value={`Pain ${intake.pain}/10 · Swelling ${intake.swelling}/10`} />
            <SummaryRow label="Goal" value={intake.primaryGoal} />
            <SummaryRow label="Care" value={intake.oversight === "pt" ? "PT-guided care" : "Self-guided starter plan"} />
          </>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: step > 0 ? "auto 1fr" : "1fr", gap: 8, paddingTop: 2 }}>
          {step > 0 ? <button type="button" onClick={() => { const previous = step - 1; setStep(previous); onChange({ ...intake, step: previous }); }} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.rim}`, background: C.deep, color: C.muted }}>Back</button> : null}
          <button type="button" disabled={step < STEPS.length && !canContinue} onClick={step === STEPS.length ? complete : goNext} style={{ padding: "12px 14px", borderRadius: 12, border: "none", background: C.lime, color: C.black, fontWeight: 800, opacity: step === STEPS.length || canContinue ? 1 : 0.35 }}>
            {step === STEPS.length ? "Submit intake" : "Continue"}
          </button>
        </div>
      </section>
    </div>
  );
}
