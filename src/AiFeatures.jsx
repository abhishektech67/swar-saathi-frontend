import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Swar Saathi — AI health features                                    */
/* AiCoachChat      : patient/caregiver speech & voice-health coach    */
/* WellnessCheckIn  : daily mood / fatigue / throat / water / sleep    */
/* AiReportPanel    : structured AI progress report (therapist/caregiver) */
/* All of these call your own backend, which uses the free Gemini tier */
/* and falls back to built-in rules if AI is unavailable.              */
/* ------------------------------------------------------------------ */

const c = {
  navy: "#1E293B",
  ink: "#1E293B",
  inkSoft: "#6B7280",
  inkFaint: "#9CA3AF",
  line: "#E7DFD0",
  lineSoft: "#EFE8DA",
  surface: "#FFFFFF",
  surfaceAlt: "#F6F1E7",
  coral: "#FF7A59",
  coralSoft: "#FFE7DE",
  coralDark: "#C75A3D",
  teal: "#34D399",
  tealDark: "#0F9D6E",
  tealSoft: "#E4F9EF",
  gold: "#F2B441",
  goldSoft: "#FBF0DC",
  danger: "#E4574C",
  dangerSoft: "#FBE6E3",
};
const display = '"Outfit", system-ui, -apple-system, "Segoe UI", sans-serif';
const body = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

const card = {
  background: c.surface,
  border: `1.5px solid ${c.lineSoft}`,
  borderRadius: 26,
  padding: 24,
  boxShadow: "0 6px 20px rgba(30,41,59,0.07)",
  marginBottom: 22,
  position: "relative",
  overflow: "hidden",
  paddingLeft: 26,
};

function Shell({ icon, title, subtitle, tone = c.teal, right, children }) {
  return (
    <section style={card}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 5, background: tone }} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${tone}22`, display: "grid", placeItems: "center", fontSize: 18, marginTop: 2 }}>{icon}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 21, fontFamily: display, fontWeight: 800, color: c.ink }}>{title}</h2>
            {subtitle && <p style={{ color: c.inkSoft, margin: "7px 0 0", lineHeight: 1.55, maxWidth: 640, fontSize: 14 }}>{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function PillButton({ children, onClick, disabled, secondary, small, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        border: secondary ? `1.5px solid ${c.line}` : "1.5px solid transparent",
        background: secondary ? "transparent" : c.coral,
        color: secondary ? c.ink : "#fff",
        borderRadius: 999,
        padding: small ? "8px 16px" : "12px 22px",
        fontWeight: 700,
        fontSize: small ? 13 : 14.5,
        fontFamily: display,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        boxShadow: secondary ? "none" : "0 6px 20px rgba(30,41,59,0.07)",
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* AI SPEECH COACH CHAT                                                */
/* ------------------------------------------------------------------ */
const COACH_SUGGESTIONS = [
  "Give me a 3-minute warm-up for my voice",
  "My throat feels dry — what should I do?",
  "How can I stay calm when I get stuck on a word?",
  "Why did my score go down today?",
];

export function AiCoachChat({ api, patientId, title = "Your AI speech coach" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your speech and voice-health coach. Ask me about your exercises, breathing, voice care or how to practice. I support your therapist — I don't replace them.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, sending]);

  const send = async (text) => {
    const clean = (text ?? input).trim();
    if (!clean || sending) return;
    const next = [...messages, { role: "user", text: clean }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const data = await api(`/api/patients/${patientId}/coach-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });
      setMessages((m) => [...m, { role: "assistant", text: data.reply, emergency: data.emergency }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: err.message || "Something went wrong. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <Shell icon="🤖" title={title} tone={c.teal} subtitle="Friendly, health-aware guidance based on your practice and wellness data. Not a medical diagnosis.">
      <div style={{ background: c.surfaceAlt, borderRadius: 18, padding: 14, maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "86%" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 16,
                fontSize: 14,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                background: m.emergency ? c.dangerSoft : m.role === "user" ? c.navy : c.surface,
                color: m.role === "user" ? "#fff" : c.ink,
                border: m.emergency ? `1.5px solid ${c.danger}` : m.role === "user" ? "none" : `1px solid ${c.lineSoft}`,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && <div style={{ color: c.inkSoft, fontSize: 13 }}>Coach is thinking…</div>}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {COACH_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={sending}
            style={{ border: `1px solid ${c.line}`, background: c.surface, borderRadius: 999, padding: "6px 12px", fontSize: 12.5, color: c.inkSoft, cursor: "pointer", fontFamily: body }}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{ display: "flex", gap: 10, marginTop: 12 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about exercises, breathing, voice care…"
          maxLength={800}
          style={{ flex: 1, padding: "12px 14px", border: `2px solid ${c.lineSoft}`, borderRadius: 18, fontSize: 14.5, fontFamily: body, outline: "none" }}
        />
        <PillButton type="submit" disabled={sending || !input.trim()}>
          Send
        </PillButton>
      </form>
      <div style={{ fontSize: 11.5, color: c.inkFaint, marginTop: 8 }}>
        For emergencies (sudden loss of speech, face drooping, trouble breathing or swallowing) call 112 / 108 immediately.
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* WELLNESS CHECK-IN                                                   */
/* ------------------------------------------------------------------ */
const FACES = ["😞", "😕", "😐", "🙂", "😄"];

function Scale({ label, value, onChange, lowLabel, highLabel }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => onChange(v)}
            aria-label={`${label} ${v} of 5`}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              fontSize: 16,
              cursor: "pointer",
              border: `1.5px solid ${value === v ? c.teal : c.line}`,
              background: value === v ? c.tealSoft : c.surface,
              fontFamily: body,
              fontWeight: 700,
            }}
          >
            {label.startsWith("Mood") ? FACES[v - 1] : v}
          </button>
        ))}
        <span style={{ fontSize: 11.5, color: c.inkFaint, marginLeft: 6 }}>
          {lowLabel} → {highLabel}
        </span>
      </div>
    </div>
  );
}

export function WellnessCheckIn({ api, patientId, onSaved }) {
  const [mood, setMood] = useState(4);
  const [fatigue, setFatigue] = useState(2);
  const [throatComfort, setThroatComfort] = useState(4);
  const [hydration, setHydration] = useState(4);
  const [sleepHours, setSleepHours] = useState(7);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await api(`/api/patients/${patientId}/wellness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, fatigue, throatComfort, hydration, sleepHours, notes }),
      });
      setResult(data);
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const numberInput = { padding: "10px 12px", border: `2px solid ${c.lineSoft}`, borderRadius: 14, fontSize: 14.5, width: 110, fontFamily: body };

  return (
    <Shell icon="💧" title="Daily wellness check-in" tone={c.gold} subtitle="30 seconds. Your voice works best when your body is rested and hydrated — this helps your coach and therapist tailor your practice.">
      <form onSubmit={submit}>
        <Scale label="Mood today" value={mood} onChange={setMood} lowLabel="low" highLabel="great" />
        <Scale label="Tiredness" value={fatigue} onChange={setFatigue} lowLabel="fresh" highLabel="exhausted" />
        <Scale label="Throat comfort" value={throatComfort} onChange={setThroatComfort} lowLabel="sore" highLabel="comfortable" />
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>
            Glasses of water today
            <div><input type="number" min="0" max="20" value={hydration} onChange={(e) => setHydration(e.target.value)} style={numberInput} /></div>
          </label>
          <label style={{ fontSize: 13, fontWeight: 700 }}>
            Hours slept last night
            <div><input type="number" min="0" max="24" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} style={numberInput} /></div>
          </label>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Anything else? (optional) e.g. cold, cough, hoarse voice"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", border: `2px solid ${c.lineSoft}`, borderRadius: 18, fontSize: 14, fontFamily: body, resize: "vertical" }}
        />
        <div style={{ marginTop: 14 }}>
          <PillButton type="submit" disabled={saving}>{saving ? "Saving…" : "Save check-in"}</PillButton>
        </div>
      </form>

      {error && <div style={{ marginTop: 12, color: c.danger, fontWeight: 600 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 16, padding: 16, borderRadius: 18, background: result.emergency ? c.dangerSoft : c.tealSoft, borderLeft: `4px solid ${result.emergency ? c.danger : c.teal}` }}>
          {result.emergency && <p style={{ margin: "0 0 10px", fontWeight: 700 }}>{result.emergencyMessage}</p>}
          <strong style={{ fontFamily: display }}>Today's tips</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.7, fontSize: 14 }}>
            {result.tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* AI PROGRESS REPORT (therapist / caregiver)                          */
/* ------------------------------------------------------------------ */
const ADVICE = {
  increase: { label: "Increase difficulty", color: c.tealDark, bg: c.tealSoft },
  keep: { label: "Keep current level", color: "#92620A", bg: c.goldSoft },
  decrease: { label: "Lower difficulty for now", color: c.coralDark, bg: c.coralSoft },
};

function ListBlock({ title, items, color }) {
  if (!items?.length) return null;
  return (
    <div style={{ background: c.surfaceAlt, borderRadius: 18, padding: 16 }}>
      <div style={{ fontFamily: display, fontWeight: 700, color, marginBottom: 6 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.65, fontSize: 13.5 }}>
        {items.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}

export function AiReportPanel({ api, patientId, patientName }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    setError("");
  }, [patientId]);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api(`/api/patients/${patientId}/ai-report`, { method: "POST" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const r = data?.report;
  const advice = r ? ADVICE[r.difficultyAdvice] || ADVICE.keep : null;
  const w = data?.wellness;

  return (
    <Shell
      icon="🧠"
      title="AI health & progress report"
      tone={c.navy}
      subtitle={`A structured review of ${patientName || "this patient"}: score trends, wellness data, risks, and next steps. Decision support only — clinical judgement stays with the therapist.`}
      right={<PillButton secondary disabled={loading} onClick={generate}>{loading ? "Analyzing…" : r ? "↻ Regenerate" : "✨ Generate report"}</PillButton>}
    >
      {error && <div style={{ color: c.danger, fontWeight: 600 }}>{error}</div>}

      {!r && !loading && !error && (
        <div style={{ padding: 22, textAlign: "center", color: c.inkSoft, background: c.surfaceAlt, borderRadius: 18 }}>
          Click "Generate report" to get an AI-assisted review.
        </div>
      )}

      {r && (
        <div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontFamily: display, fontSize: 18 }}>{r.headline}</h3>
            <span style={{ background: advice.bg, color: advice.color, padding: "5px 12px", borderRadius: 99, fontSize: 12.5, fontWeight: 700 }}>{advice.label}</span>
            <span style={{ background: c.surfaceAlt, color: c.inkSoft, padding: "5px 12px", borderRadius: 99, fontSize: 12.5, fontWeight: 700 }}>Trend: {r.trend}</span>
            <span style={{ fontSize: 11.5, color: c.inkFaint }}>{r.source === "ai" ? "Generated by AI" : "Rule-based summary (AI unavailable)"}</span>
          </div>

          <p style={{ lineHeight: 1.65, margin: "0 0 14px" }}>{r.summary}</p>

          {r.redFlags?.length > 0 && (
            <div style={{ background: c.dangerSoft, borderLeft: `4px solid ${c.danger}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <strong style={{ color: c.danger }}>⚠ Needs clinical follow-up</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18, lineHeight: 1.6, fontSize: 13.5 }}>
                {r.redFlags.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
            <ListBlock title="Strengths" items={r.strengths} color={c.tealDark} />
            <ListBlock title="Concerns" items={r.concerns} color={c.coralDark} />
            <ListBlock title="Focus areas" items={r.focusAreas} color={c.navy} />
            <ListBlock title="Caregiver tips" items={r.caregiverTips} color="#92620A" />
          </div>

          {w && (
            <div style={{ marginTop: 14, fontSize: 13, color: c.inkSoft, lineHeight: 1.6 }}>
              <strong style={{ color: c.ink }}>Wellness (last {w.count} check-ins):</strong> mood {w.avgMood}/5 · tiredness {w.avgFatigue}/5 · throat comfort {w.avgThroatComfort}/5 · water {w.avgHydration} glasses · sleep {w.avgSleep}h
            </div>
          )}

          <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: c.tealSoft, borderLeft: `4px solid ${c.teal}`, fontSize: 14 }}>
            💬 {r.encouragement}
          </div>
        </div>
      )}
    </Shell>
  );
}