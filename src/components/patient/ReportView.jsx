import React, { useState } from "react";
import { C } from "../../constants/colors";

export function ReportView({ rehabItems, onSubmit }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ exercise: "", pain: 0, swelling: 0, location: "", note: "" });
  const [submitted, setSubmitted] = useState(false);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    onSubmit(form);
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
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 60, color: C.lime, lineHeight: 1 }}>SENT.</div>
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
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Rate your symptoms
          </div>
          {[
            ["pain", "PAIN LEVEL", C.red],
            ["swelling", "SWELLING", C.amber],
          ].map(([key, label, color]) => (
            <div key={key}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color, letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
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
