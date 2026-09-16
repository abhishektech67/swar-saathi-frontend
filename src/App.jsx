import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = "https://swar-saathi-backend.onrender.com";

/* ------------------------------------------------------------------ */
/* Design tokens — "voice & growth": a calm harbor teal for trust,     */
/* paired with a warm coral for encouragement/energy in the exercises, */
/* and a soft gold for milestones. Fraunces (display) + Inter (body).  */
/* ------------------------------------------------------------------ */
const theme = {
  colors: {
    canvas: "#F5F8F6",
    canvasWash: "radial-gradient(1100px 480px at 8% -10%, #E3F1EE 0%, rgba(227,241,238,0) 55%), radial-gradient(900px 420px at 100% 0%, #FFE9DF 0%, rgba(255,233,223,0) 50%)",
    surface: "#FFFFFF",
    surfaceAlt: "#EEF4F1",
    ink: "#152322",
    inkSoft: "#57695F",
    inkFaint: "#8A9A92",
    line: "#DEE7E1",
    lineSoft: "#E9EFEC",
    primary: "#1F6F6B",
    primaryDark: "#12433F",
    primarySoft: "#E3F1EE",
    coral: "#FF6F52",
    coralDark: "#D9502F",
    coralSoft: "#FFE9DF",
    gold: "#DE9F2E",
    goldSoft: "#FBEBCF",
    danger: "#C6483C",
    dangerSoft: "#FBE7E4",
    success: "#3D8E67",
  },
  radius: { sm: 10, md: 16, lg: 22, pill: 999 },
  shadow: "0 14px 34px -16px rgba(18,67,63,.28)",
  shadowSoft: "0 6px 16px -8px rgba(18,67,63,.18)",
  font: {
    display: '"Fraunces", Georgia, "Times New Roman", serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
};

const styles = {
  page: {
    minHeight: "100vh",
    background: `${theme.colors.canvasWash}, ${theme.colors.canvas}`,
    color: theme.colors.ink,
    fontFamily: theme.font.body,
    padding: "28px 20px 60px",
  },
  wrap: { maxWidth: 1180, margin: "0 auto" },
  card: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.lineSoft}`,
    borderRadius: theme.radius.lg,
    padding: 24,
    boxShadow: theme.shadowSoft,
  },
  grid: { display: "grid", gap: 16 },
  muted: { color: theme.colors.inkSoft },
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,440;9..144,560;9..144,650&family=Inter:wght@400;500;600;700;800&display=swap');
      .sdb * { box-sizing: border-box; }
      .sdb button { font-family: ${theme.font.body}; }
      .sdb input { font-family: ${theme.font.body}; }
      .sdb table { font-family: ${theme.font.body}; }
      @keyframes sdb-pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(255,111,82,.42); }
        70% { box-shadow: 0 0 0 18px rgba(255,111,82,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,111,82,0); }
      }
      @keyframes sdb-bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      .sdb-recording { animation: sdb-pulse-ring 1.7s ease-out infinite; }
      .sdb-bob { animation: sdb-bob 3.2s ease-in-out infinite; }
      .sdb button:focus-visible, .sdb a:focus-visible, .sdb input:focus-visible {
        outline: 3px solid ${theme.colors.gold};
        outline-offset: 2px;
      }
      .sdb-hover-lift { transition: transform .15s ease, box-shadow .15s ease; }
      .sdb-hover-lift:hover { transform: translateY(-2px); box-shadow: ${theme.shadow}; }
      ::selection { background: ${theme.colors.coralSoft}; }
    `}</style>
  );
}

function Waveform({ color = theme.colors.primary, bars = 9, height = 34 }) {
  const pattern = [0.4, 0.7, 1, 0.55, 0.85, 0.35, 0.9, 0.5, 0.65];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 5,
            borderRadius: 3,
            background: color,
            height: `${(pattern[i % pattern.length]) * 100}%`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

function Button({ children, onClick, secondary = false, disabled = false, danger = false, type = "button" }) {
  const bg = danger ? theme.colors.danger : secondary ? theme.colors.surface : theme.colors.primary;
  const color = secondary ? theme.colors.ink : "#fff";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="sdb-hover-lift"
      style={{
        border: secondary ? `1.5px solid ${theme.colors.line}` : "0",
        borderRadius: theme.radius.sm,
        padding: "11px 18px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 700,
        fontSize: 14.5,
        background: bg,
        color,
        opacity: disabled ? 0.55 : 1,
        boxShadow: disabled || secondary ? "none" : theme.shadowSoft,
      }}
    >
      {children}
    </button>
  );
}

function Section({ title, subtitle, children, right }) {
  return (
    <section style={{ ...styles.card, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 21, fontFamily: theme.font.display, fontWeight: 650 }}>{title}</h2>
          {subtitle && <p style={{ ...styles.muted, margin: "7px 0 0", lineHeight: 1.55, maxWidth: 640 }}>{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

const accentSets = {
  teal: { fg: theme.colors.primary, bg: theme.colors.primarySoft },
  coral: { fg: theme.colors.coralDark, bg: theme.colors.coralSoft },
  gold: { fg: "#8A5E12", bg: theme.colors.goldSoft },
};

function ScoreCard({ icon, title, value, subtitle, accent = "teal" }) {
  const a = accentSets[accent] || accentSets.teal;
  return (
    <div style={{ ...styles.card, padding: 18, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: a.fg }} />
      <div
        style={{
          width: 34, height: 34, borderRadius: 10, background: a.bg, color: a.fg,
          display: "grid", placeItems: "center", fontSize: 16, marginBottom: 10,
        }}
      >
        {icon}
      </div>
      <div style={{ color: theme.colors.inkSoft, fontSize: 13, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 29, fontWeight: 800, marginTop: 4, fontFamily: theme.font.display }}>{value}</div>
      {subtitle && <div style={{ ...styles.muted, fontSize: 12.5, marginTop: 5 }}>{subtitle}</div>}
    </div>
  );
}

function ProgressBar({ value, label }) {
  const n = Math.max(0, Math.min(100, Number(value) || 0));
  const color = n >= 85 ? theme.colors.success : n >= 70 ? theme.colors.primary : n >= 50 ? theme.colors.gold : theme.colors.danger;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
        <span>{label}</span>
        <strong>{Math.round(n)}%</strong>
      </div>
      <div style={{ height: 9, background: theme.colors.surfaceAlt, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${n}%`, height: "100%", background: color, borderRadius: 99, transition: "width .4s ease" }} />
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function scoreLabel(score) {
  const n = Number(score) || 0;
  if (n >= 85) return "Excellent";
  if (n >= 70) return "Good";
  if (n >= 50) return "Needs practice";
  return "Keep practicing";
}

function scoreColor(score) {
  const n = Number(score) || 0;
  if (n >= 85) return theme.colors.success;
  if (n >= 70) return theme.colors.primary;
  if (n >= 50) return theme.colors.gold;
  return theme.colors.danger;
}

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* AUDIO ANALYSIS — rewritten                                          */
/*                                                                      */
/* Bugs fixed vs. the previous version:                                */
/*  1. The old autocorrelation sum was never normalized by frame        */
/*     length, so it was structurally biased toward the shortest lag   */
/*     (highest frequency) no matter what was actually said.           */
/*  2. It only ever looked at the first 1.5s of audio, so any startup  */
/*     silence corrupted the whole estimate.                           */
/*  3. There was no "is this frame actually voiced speech" check, so   */
/*     silence/noise still produced a confident (wrong) pitch number.  */
/*                                                                      */
/* Fix: normalized autocorrelation computed over ~40ms overlapping      */
/* frames across the WHOLE recording, keeping only frames whose peak   */
/* correlation is strong enough to count as voiced, then taking the    */
/* median of those frame pitches (median is robust to stray outliers). */
/* ------------------------------------------------------------------ */

const PITCH_FRAME_MS = 40;
const PITCH_HOP_MS = 20;
const MIN_VOICE_HZ = 70;
const MAX_VOICE_HZ = 400;
const VOICED_CORRELATION_THRESHOLD = 0.32; // 0..1, higher = stricter "this frame is a clear pitch"

function detectFramePitch(frame, sampleRate) {
  const size = frame.length;

  // Remove DC offset so correlation isn't skewed by mic bias.
  let mean = 0;
  for (let i = 0; i < size; i++) mean += frame[i];
  mean /= size;

  const centered = new Float32Array(size);
  let energy = 0;
  for (let i = 0; i < size; i++) {
    centered[i] = frame[i] - mean;
    energy += centered[i] * centered[i];
  }
  const rms = Math.sqrt(energy / size);
  if (rms < 0.012) return null; // effectively silent — not a voiced frame

  const minLag = Math.floor(sampleRate / MAX_VOICE_HZ);
  const maxLag = Math.min(Math.floor(sampleRate / MIN_VOICE_HZ), size - 1);
  if (maxLag <= minLag) return null;

  let bestLag = -1;
  let bestCorr = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    const n = size - lag;
    let sum = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < n; i++) {
      sum += centered[i] * centered[i + lag];
      normA += centered[i] * centered[i];
      normB += centered[i + lag] * centered[i + lag];
    }
    const denom = Math.sqrt(normA * normB) || 1e-9;
    const corr = sum / denom; // normalized to roughly -1..1, independent of window length
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  if (bestLag <= 0 || bestCorr < VOICED_CORRELATION_THRESHOLD) return null;
  return sampleRate / bestLag;
}

async function analyzeAudio(blob) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error("Web Audio API is not supported in this browser.");

  const arrayBuffer = await blob.arrayBuffer();
  if (!arrayBuffer || arrayBuffer.byteLength < 800) {
    throw new Error("That recording was too short or empty — please record for at least 1-2 seconds.");
  }

  const ctx = new AudioContextClass();
  try {
    let buffer;
    try {
      buffer = await ctx.decodeAudioData(arrayBuffer);
    } catch (decodeErr) {
      throw new Error("Couldn't process that recording. Please try again (Chrome or Edge work best).");
    }

    const { length, numberOfChannels, sampleRate } = buffer;
    if (!length || !sampleRate) throw new Error("The recording had no audio data — please try again.");

    const mono = new Float32Array(length);
    for (let c = 0; c < numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) mono[i] += data[i] / numberOfChannels;
    }

    // Overall clarity heuristic — computed over the WHOLE recording.
    let sumSquares = 0;
    let crossings = 0;
    for (let i = 0; i < length; i++) sumSquares += mono[i] * mono[i];
    for (let i = 1; i < length; i++) if ((mono[i - 1] < 0) !== (mono[i] < 0)) crossings++;
    const overallRms = Math.sqrt(sumSquares / Math.max(1, length));
    const zcr = crossings / Math.max(1, length);

    // Frame-by-frame pitch across the whole clip.
    const frameSize = Math.max(256, Math.round(sampleRate * (PITCH_FRAME_MS / 1000)));
    const hopSize = Math.max(128, Math.round(sampleRate * (PITCH_HOP_MS / 1000)));
    const voicedPitches = [];
    let totalFrames = 0;

    for (let start = 0; start + frameSize <= length; start += hopSize) {
      totalFrames++;
      const frame = mono.subarray(start, start + frameSize);
      const pitch = detectFramePitch(frame, sampleRate);
      if (pitch && pitch >= MIN_VOICE_HZ && pitch <= MAX_VOICE_HZ) voicedPitches.push(pitch);
    }

    let pitchMeanHz = 0;
    if (voicedPitches.length) {
      voicedPitches.sort((a, b) => a - b);
      pitchMeanHz = Math.round(voicedPitches[Math.floor(voicedPitches.length / 2)]); // median = robust to outliers
    }

    const voicedRatio = totalFrames ? voicedPitches.length / totalFrames : 0;

    let clarity = Math.round(Math.min(100, overallRms * 650));
    if (overallRms < 0.005) clarity = 10;
    else if (overallRms < 0.01) clarity = Math.max(25, clarity);
    if (zcr > 0.18) clarity -= 10;
    clarity = Math.max(0, Math.min(100, clarity));

    const pitchScore = pitchMeanHz > 0 ? Math.max(55, Math.min(100, 100 - Math.abs(pitchMeanHz - 180) / 4)) : 20;
    const pronunciation = Math.round(
      Math.max(0, Math.min(100, clarity * 0.5 + pitchScore * 0.3 + voicedRatio * 100 * 0.2))
    );
    const overall = Math.round((clarity + pronunciation + pitchScore) / 3);

    return {
      durationSeconds: Number(buffer.duration.toFixed(2)),
      pitchMeanHz,
      clarityScore: clarity,
      pronunciationScore: pronunciation,
      overallScore: overall,
      voicedRatio: Number(voicedRatio.toFixed(2)),
      noVoiceDetected: voicedPitches.length === 0,
    };
  } finally {
    await ctx.close();
  }
}

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [patientDashboard, setPatientDashboard] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingStartedAtRef = useRef(0);

  const token = () => localStorage.getItem("token");
  const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

  const api = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
    let data = null;
    try { data = await response.json(); } catch { data = {}; }
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  };

  const resetAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setAudioUrl(null); setAnalysis(null); setIsRecording(false);
  };

  const logout = () => {
    resetAudio(); localStorage.removeItem("token");
    setUser(null); setPatients([]); setSelectedPatient(null); setPatientDetail(null);
    setFeedback([]); setExercises([]); setPatientDashboard(null); setMessage(""); setEmail(""); setPassword("");
  };

  const login = async (e) => {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token); setUser(data.user); setMessage("");
    } catch (err) { setMessage(err.message); } finally { setLoading(false); }
  };

  const loadPatientDashboard = async (id = user?.id) => {
    if (!id) return;
    try {
      const data = await api(`/api/patients/${id}/dashboard`);
      setPatientDashboard(data); setExercises(data.exercises || []);
    } catch (err) { setMessage(err.message); }
  };

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await api("/api/therapist/dashboard");
      setPatients(data.patients || []);
      setMessage("");
    } catch (err) { setMessage(err.message); } finally { setLoading(false); }
  };

  const loadPatientDetail = async (patient) => {
    setSelectedPatient(patient); setLoading(true); setMessage(""); setExercises([]); setFeedback([]); setPatientDetail(null);
    try {
      const [detail, fb] = await Promise.all([
        api(`/api/therapist/patients/${patient.id}`),
        api(`/api/patients/${patient.id}/feedback`).catch(() => []),
      ]);
      setPatientDetail(detail); setExercises(detail.exercises || []); setFeedback(Array.isArray(fb) ? fb : []);
    } catch (err) { setMessage(err.message); } finally { setLoading(false); }
  };

  const uploadRecording = async (blob, result) => {
    const fd = new FormData(); fd.append("audio", blob, "recording.webm");
    fd.append("durationSeconds", String(result.durationSeconds)); fd.append("pitchMeanHz", String(result.pitchMeanHz));
    fd.append("clarityScore", String(result.clarityScore)); fd.append("pronunciationScore", String(result.pronunciationScore));
    const data = await api("/api/audio/upload", { method: "POST", body: fd });
    return data;
  };

  const startRecording = async () => {
    if (isRecording) return;
    setMessage("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone recording isn't supported in this browser.");
      if (typeof MediaRecorder === "undefined") throw new Error("This browser doesn't support MediaRecorder — try Chrome or Edge.");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream; chunksRef.current = [];

      const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]
        .find((x) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x));
      const recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data?.size) chunksRef.current.push(e.data); };

      recorder.onerror = (e) => {
        setMessage(`Recording error: ${e.error?.message || "unknown error"}`);
        setIsRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.onstop = async () => {
        setIsRecording(false); stream.getTracks().forEach((t) => t.stop()); streamRef.current = null;

        if (!chunksRef.current.length) {
          setMessage("No audio was captured — check your microphone permissions and try again.");
          return;
        }
        const elapsedMs = Date.now() - recordingStartedAtRef.current;
        if (elapsedMs < 400) {
          setMessage("That recording was too short — hold the recording for at least a second while you speak.");
          return;
        }

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob)); setUploading(true); setMessage("Analyzing your speech...");
        try {
          const result = await analyzeAudio(blob);
          setAnalysis(result);
          if (result.noVoiceDetected) {
            setMessage("No clear voice was detected in that recording — try speaking louder or closer to the mic, then record again.");
          } else {
            setMessage("Analysis complete. Saving your result...");
          }
          const saved = await uploadRecording(blob, result);
          const merged = { ...result, ...(saved.analysis || {}) }; setAnalysis(merged);
          if (!result.noVoiceDetected) {
            setMessage(`Saved successfully. Difficulty: Level ${saved.difficulty?.current ?? "—"}.`);
          }
          await loadPatientDashboard(user.id);
        } catch (err) { setMessage(err.message || "Audio analysis/upload failed."); }
        finally { setUploading(false); }
      };

      recorder.start(250);
      recordingStartedAtRef.current = Date.now();
      setIsRecording(true); setAnalysis(null); setMessage("Recording in progress — speak clearly.");
    } catch (err) {
      setIsRecording(false);
      setMessage(err.message || "Microphone permission is required.");
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop(); };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    const payload = decodeJwt(t);
    if (!payload?.userId || !payload?.role) { localStorage.removeItem("token"); return; }
    setUser({ id: payload.userId, role: payload.role });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === "PATIENT") loadPatientDashboard(user.id);
    if (user.role === "THERAPIST") loadPatients();
  }, [user]);

  useEffect(() => () => resetAudio(), []);

  const patientLogs = patientDashboard?.audioLogs || [];
  const patientLatest = patientDashboard?.latestAnalysis || patientLogs[0] || null;
  const avgScore = useMemo(() => {
    if (!patientLogs.length) return 0;
    return Math.round(patientLogs.reduce((s, x) => s + Number(x.pronunciationScore || 0), 0) / patientLogs.length);
  }, [patientLogs]);

  if (!user) {
    return <Login email={email} password={password} setEmail={setEmail} setPassword={setPassword} login={login} loading={loading} message={message} />;
  }

  if (user.role === "PATIENT") {
    const profile = patientDashboard?.profile || {};
    const currentLevel = profile.currentDifficultyLevel || 2;
    return (
      <div className="sdb" style={styles.page}>
        <GlobalStyle />
        <div style={styles.wrap}>
          <Header title="Patient portal" user={user} logout={logout} />
          {message && <Notice text={message} />}

          <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", marginBottom: 18 }}>
            <ScoreCard icon="🎯" accent="teal" title="Current level" value={`Level ${currentLevel}`} subtitle="Adjusts with your practice" />
            <ScoreCard icon="📝" accent="gold" title="Exercises" value={exercises.length} subtitle="Assigned to you" />
            <ScoreCard icon="🎙️" accent="coral" title="Practice sessions" value={patientLogs.length} subtitle="Saved recordings" />
            <ScoreCard icon="📈" accent="teal" title="Avg. pronunciation" value={`${avgScore}%`} subtitle="Across all sessions" />
          </div>

          <Section title="Your home exercises" subtitle="Complete your assigned exercises, then record your speech practice below.">
            {exercises.length === 0 ? <Empty text="No exercises assigned yet — check back soon." /> : exercises.map((a) => <ExerciseCard key={a.id} assignment={a} />)}
          </Section>

          <Section
            title="Speech practice"
            subtitle="Record directly in the browser. The score is an acoustic demo score, not a clinical diagnosis."
            right={<Button secondary onClick={() => loadPatientDashboard(user.id)}>Refresh</Button>}
          >
            <div
              style={{
                background: theme.colors.primarySoft,
                border: `1px solid ${theme.colors.line}`,
                borderRadius: theme.radius.lg,
                padding: "32px 24px",
                textAlign: "center",
              }}
            >
              <div className={isRecording ? "" : "sdb-bob"} style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <div
                  className={isRecording ? "sdb-recording" : ""}
                  style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: isRecording ? theme.colors.coral : theme.colors.primary,
                    display: "grid", placeItems: "center", fontSize: 26,
                  }}
                >
                  {isRecording ? "🔴" : "🎙️"}
                </div>
              </div>
              <h3 style={{ fontFamily: theme.font.display, fontWeight: 650, margin: "0 0 6px" }}>
                {isRecording ? "Recording your speech…" : "Ready to practice?"}
              </h3>
              <p style={{ ...styles.muted, maxWidth: 620, margin: "0 auto 20px", lineHeight: 1.6 }}>
                {isRecording
                  ? "Speak naturally and complete the assigned exercise."
                  : "Allow microphone access, speak clearly, then stop the recording to get instant feedback."}
              </p>
              {!isRecording ? (
                <Button onClick={startRecording} disabled={uploading}>Start recording</Button>
              ) : (
                <Button danger onClick={stopRecording}>Stop recording</Button>
              )}
              {uploading && <p style={{ marginTop: 14, marginBottom: 0, ...styles.muted }}>Processing and saving…</p>}
              {audioUrl && (
                <div style={{ marginTop: 22 }}>
                  <audio controls src={audioUrl} style={{ width: "100%", maxWidth: 600 }} />
                </div>
              )}
            </div>
          </Section>

          {analysis && <AnalysisCard analysis={analysis} />}

          {patientLatest && (
            <Section title="Your progress" subtitle="Recent saved acoustic metrics from your practice sessions.">
              <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                <ProgressBar value={patientLatest.pronunciationScore} label="Pronunciation score" />
                <ProgressBar value={patientLatest.clarityScore} label="Clarity score" />
                <div>
                  <div style={{ fontSize: 13, color: theme.colors.inkSoft }}>Pitch mean</div>
                  <strong style={{ fontSize: 24, fontFamily: theme.font.display }}>{Math.round(patientLatest.pitchMeanHz || 0)} Hz</strong>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: theme.colors.inkSoft }}>Latest session</div>
                  <strong>{formatDate(patientLatest.recordedAt)}</strong>
                </div>
              </div>
              <div style={{ marginTop: 22, overflowX: "auto" }}><ProgressTable logs={patientLogs} /></div>
            </Section>
          )}
        </div>
      </div>
    );
  }

  if (user.role === "THERAPIST" && selectedPatient) {
    const logs = patientDetail?.audioLogs || [];
    const latest = logs[0] || null;
    const average = logs.length ? Math.round(logs.reduce((s, x) => s + Number(x.pronunciationScore || 0), 0) / logs.length) : 0;
    return (
      <div className="sdb" style={styles.page}>
        <GlobalStyle />
        <div style={styles.wrap}>
          <Header title="Therapist · patient profile" user={user} logout={logout} back={() => { setSelectedPatient(null); setPatientDetail(null); setFeedback([]); }} />
          {message && <Notice text={message} />}

          <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", marginBottom: 18 }}>
            <ScoreCard icon="👤" accent="teal" title="Patient" value={selectedPatient.fullName} subtitle={selectedPatient.email} />
            <ScoreCard icon="🎯" accent="gold" title="Difficulty" value={`Level ${patientDetail?.profile?.currentDifficultyLevel ?? "—"}`} subtitle="Current adaptive level" />
            <ScoreCard icon="🎙️" accent="coral" title="Sessions" value={logs.length} subtitle="Audio logs" />
            <ScoreCard icon="📈" accent="teal" title="Avg. pronunciation" value={`${average}%`} subtitle="Across saved sessions" />
          </div>

          <Section title="Patient overview" subtitle="Clinical context stored in the therapy profile.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
              <Info label="Name" value={patientDetail?.patient?.fullName || selectedPatient.fullName} />
              <Info label="Email" value={patientDetail?.patient?.email || selectedPatient.email} />
              <Info label="Diagnosis" value={patientDetail?.profile?.diagnosis || "Not specified"} />
              <Info label="Date of birth" value={patientDetail?.profile?.dateOfBirth ? new Date(patientDetail.profile.dateOfBirth).toLocaleDateString() : "Not specified"} />
            </div>
          </Section>

          <Section title="Assigned exercises" subtitle="Exercises currently assigned to this patient." right={<Button secondary onClick={() => loadPatientDetail(selectedPatient)}>Refresh</Button>}>
            {loading && !patientDetail ? <p>Loading…</p> : exercises.length ? exercises.map((a) => <ExerciseCard key={a.id} assignment={a} therapist />) : <Empty text="No exercises assigned." />}
          </Section>

          <Section title="Audio analysis & progress" subtitle="Stored metrics from the patient's speech practice.">
            {latest && (
              <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginBottom: 20 }}>
                <ScoreCard icon="🗣️" accent="teal" title="Latest pronunciation" value={`${Math.round(latest.pronunciationScore || 0)}%`} subtitle={scoreLabel(latest.pronunciationScore)} />
                <ScoreCard icon="🔊" accent="coral" title="Latest clarity" value={`${Math.round(latest.clarityScore || 0)}%`} subtitle="Acoustic quality heuristic" />
                <ScoreCard icon="〰️" accent="gold" title="Pitch mean" value={`${Math.round(latest.pitchMeanHz || 0)} Hz`} subtitle="Estimated mean pitch" />
                <ScoreCard icon="⏱️" accent="teal" title="Duration" value={`${Number(latest.durationSeconds || 0).toFixed(1)}s`} subtitle={formatDate(latest.recordedAt)} />
              </div>
            )}
            {logs.length ? <ProgressTable logs={logs} /> : <Empty text="No audio sessions have been saved yet." />}
          </Section>

          <Section title="Caregiver feedback" subtitle="Feedback already stored for this patient.">
            {feedback.length ? feedback.map((f, i) => (
              <div key={f.id || i} style={{ padding: 15, border: `1px solid ${theme.colors.lineSoft}`, borderRadius: theme.radius.md, marginBottom: 10, background: theme.colors.surfaceAlt }}>
                <strong>{f.message || f.feedback || f.comment || "Caregiver feedback"}</strong>
                <div style={{ ...styles.muted, fontSize: 12, marginTop: 6 }}>{formatDate(f.createdAt || f.updatedAt)}</div>
              </div>
            )) : <Empty text="No caregiver feedback recorded yet." />}
          </Section>

          <Section title="Adaptive recommendation" subtitle="A simple, explainable recommendation based on recent performance.">
            <Recommendation score={latest?.pronunciationScore || 0} difficulty={patientDetail?.profile?.currentDifficultyLevel} />
          </Section>
        </div>
      </div>
    );
  }

  if (user.role === "THERAPIST") {
    const totalSessions = patients.reduce((s, p) => s + Number(p.audioLogCount || 0), 0);
    const scores = patients.filter((p) => p.latestPronunciationScore).map((p) => Number(p.latestPronunciationScore));
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return (
      <div className="sdb" style={styles.page}>
        <GlobalStyle />
        <div style={styles.wrap}>
          <Header title="Therapist dashboard" user={user} logout={logout} />
          {message && <Notice text={message} />}

          <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", marginBottom: 18 }}>
            <ScoreCard icon="👥" accent="teal" title="Patients" value={patients.length} subtitle="Patient accounts" />
            <ScoreCard icon="🎙️" accent="coral" title="Audio sessions" value={totalSessions} subtitle="Saved practice sessions" />
            <ScoreCard icon="📈" accent="teal" title="Avg. pronunciation" value={`${avg}%`} subtitle="Latest patient scores" />
            <ScoreCard icon="🧠" accent="gold" title="Adaptive therapy" value="Active" subtitle="Difficulty adjusts from scores" />
          </div>

          <Section
            title="Quick access"
            subtitle="Jump to what matters for today's therapy workflow."
            right={<Button onClick={loadPatients} disabled={loading}>{loading ? "Refreshing…" : "Refresh patients"}</Button>}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button secondary onClick={loadPatients}>Patient records</Button>
              <Button secondary onClick={() => document.getElementById("patients")?.scrollIntoView({ behavior: "smooth" })}>Progress analytics</Button>
            </div>
          </Section>

          <Section title="Patients" subtitle="Open a patient to view exercises, audio analytics, progress and caregiver feedback.">
            <div id="patients">
              {patients.length ? patients.map((p) => <PatientRow key={p.id} patient={p} onOpen={() => loadPatientDetail(p)} />) : <Empty text={loading ? "Loading patients…" : "No patients found."} />}
            </div>
          </Section>

          {patients.length > 0 && (
            <Section title="Team snapshot" subtitle="Latest pronunciation scores across your patient roster.">
              <MiniBars patients={patients} />
            </Section>
          )}
        </div>
      </div>
    );
  }

  // CAREGIVER: the current backend exposes patient list + feedback read APIs, so this portal
  // uses those existing endpoints without inventing a write API.
  return <CaregiverPortal user={user} logout={logout} api={api} />;
}

function Login({ email, password, setEmail, setPassword, login, loading, message }) {
  return (
    <div className="sdb" style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GlobalStyle />
      <div
        style={{
          ...styles.card,
          width: "100%",
          maxWidth: 460,
          padding: "38px 34px",
          background: `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surface} 70%, ${theme.colors.primarySoft} 200%)`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="sdb-bob" style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <Waveform />
          </div>
          <h1 style={{ margin: "6px 0 4px", fontFamily: theme.font.display, fontWeight: 650, fontSize: 32, color: theme.colors.primaryDark }}>Swar Saathi</h1>
          <p style={{ ...styles.muted, margin: 0 }}>Speech & language therapy, from clinic to home practice.</p>
        </div>

        <form onSubmit={login}>
          <label style={{ display: "block", marginTop: 24, fontWeight: 700, fontSize: 14 }}>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Enter your email" style={inputStyle} />
          </label>
          <label style={{ display: "block", marginTop: 16, fontWeight: 700, fontSize: 14 }}>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Enter your password" style={inputStyle} />
          </label>
          <div style={{ marginTop: 22 }}>
            <Button type="submit" disabled={loading}>{loading ? "Logging in…" : "Log in"}</Button>
          </div>
        </form>

        {message && <Notice text={message} />}

        <div style={{ marginTop: 22, padding: 16, background: theme.colors.surfaceAlt, borderRadius: theme.radius.md, fontSize: 12.5, color: theme.colors.inkSoft, lineHeight: 1.8 }}>
          <strong style={{ color: theme.colors.ink }}>Demo accounts</strong>
          <div>Therapist — therapist@hopespeech.org</div>
          <div>Patient — patient.aarav@hopespeech.org</div>
          <div>Caregiver — parent@hopespeech.org</div>
          <div>Password — Password123!</div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: 7,
  padding: "13px 14px",
  border: `1.5px solid ${theme.colors.line}`,
  borderRadius: theme.radius.sm,
  fontSize: 15,
  background: theme.colors.surface,
  color: theme.colors.ink,
};

function Header({ title, user, logout, back }) {
  return (
    <div style={{ ...styles.card, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap" }}>
      <div>
        {back && (
          <button onClick={back} style={{ border: 0, background: "none", cursor: "pointer", padding: 0, marginBottom: 10, color: theme.colors.primary, fontWeight: 700, fontSize: 13.5 }}>
            ← Back to patients
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Waveform color={theme.colors.primary} height={20} />
          <h1 style={{ margin: 0, fontFamily: theme.font.display, fontWeight: 650, fontSize: 24 }}>Swar Saathi</h1>
        </div>
        <div style={{ fontWeight: 600, marginTop: 6, color: theme.colors.inkSoft, fontSize: 14 }}>{title} · {user.fullName || user.email || "User"}</div>
      </div>
      <Button secondary onClick={logout}>Log out</Button>
    </div>
  );
}

function Notice({ text }) {
  return (
    <div style={{ background: theme.colors.goldSoft, border: `1px solid ${theme.colors.gold}55`, borderRadius: theme.radius.sm, padding: 13, marginBottom: 18, color: "#6B4A0E" }}>
      {text}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ padding: 26, textAlign: "center", color: theme.colors.inkSoft, background: theme.colors.surfaceAlt, borderRadius: theme.radius.md }}>
      {text}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ padding: 15, background: theme.colors.surfaceAlt, borderRadius: theme.radius.md }}>
      <div style={{ fontSize: 12, color: theme.colors.inkSoft }}>{label}</div>
      <strong style={{ display: "block", marginTop: 5 }}>{value}</strong>
    </div>
  );
}

function ExerciseCard({ assignment, therapist }) {
  const e = assignment.exercise || {};
  return (
    <div style={{ padding: 18, border: `1px solid ${theme.colors.lineSoft}`, borderRadius: theme.radius.md, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: theme.font.display, fontWeight: 600, fontSize: 17 }}>{e.title || "Exercise"}</h3>
          <p style={{ ...styles.muted, margin: "6px 0" }}>{e.description || "Speech therapy exercise"}</p>
        </div>
        <span style={{ background: theme.colors.primarySoft, color: theme.colors.primaryDark, padding: "6px 12px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, height: "fit-content" }}>
          Level {e.difficultyLevel ?? "—"}
        </span>
      </div>
      <div style={{ marginTop: 12, padding: 14, background: theme.colors.surfaceAlt, borderRadius: 10 }}>
        <strong style={{ fontSize: 13.5 }}>Instructions</strong>
        <p style={{ ...styles.muted, margin: "5px 0 0" }}>{e.instructions || "Follow the therapist's instructions."}</p>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: theme.colors.inkFaint }}>
        {e.category || "Therapy"}{assignment.dueDate ? ` · Due ${new Date(assignment.dueDate).toLocaleDateString()}` : ""}{therapist ? " · Therapist view" : ""}
      </div>
    </div>
  );
}

function AnalysisCard({ analysis }) {
  return (
    <Section title="Speech analysis" subtitle="Instant browser-based acoustic feedback. These values are demo heuristics, not clinical measurements.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
        <ScoreCard icon="🗣️" accent="teal" title="Pronunciation" value={`${Math.round(analysis.pronunciationScore)}%`} subtitle={scoreLabel(analysis.pronunciationScore)} />
        <ScoreCard icon="🔊" accent="coral" title="Clarity" value={`${Math.round(analysis.clarityScore)}%`} subtitle="Acoustic quality" />
        <ScoreCard icon="〰️" accent="gold" title="Pitch" value={analysis.pitchMeanHz ? `${Math.round(analysis.pitchMeanHz)} Hz` : "No pitch detected"} subtitle="Estimated mean pitch" />
        <ScoreCard icon="🎯" accent="teal" title="Overall" value={`${Math.round(analysis.overallScore)}%`} subtitle={scoreLabel(analysis.overallScore)} />
      </div>
    </Section>
  );
}

function ProgressTable({ logs }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
      <thead>
        <tr>{["Date", "Duration", "Pitch", "Clarity", "Pronunciation", "Level"].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {logs.map((x, i) => (
          <tr key={x.id || i}>
            <td style={td}>{formatDate(x.recordedAt)}</td>
            <td style={td}>{Number(x.durationSeconds || 0).toFixed(1)}s</td>
            <td style={td}>{Math.round(x.pitchMeanHz || 0)} Hz</td>
            <td style={{ ...td, color: scoreColor(x.clarityScore), fontWeight: 700 }}>{Math.round(x.clarityScore || 0)}%</td>
            <td style={{ ...td, color: scoreColor(x.pronunciationScore), fontWeight: 700 }}>{Math.round(x.pronunciationScore || 0)}%</td>
            <td style={td}>Level {x.difficultyAtAttempt ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th = { textAlign: "left", padding: "10px 8px", borderBottom: `2px solid ${theme.colors.lineSoft}`, fontSize: 12, color: theme.colors.inkSoft, fontWeight: 700 };
const td = { padding: "11px 8px", borderBottom: `1px solid ${theme.colors.lineSoft}`, fontSize: 13.5 };

const avatarPalette = [theme.colors.primary, theme.colors.coral, theme.colors.gold, theme.colors.primaryDark];
function avatarColor(seed) {
  const s = String(seed || "");
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return avatarPalette[sum % avatarPalette.length];
}

function PatientRow({ patient, onOpen }) {
  const score = Number(patient.latestPronunciationScore || 0);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, padding: 16, border: `1px solid ${theme.colors.lineSoft}`, borderRadius: theme.radius.md, marginTop: 11, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: avatarColor(patient.fullName || patient.id), color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontFamily: theme.font.display }}>
          {patient.fullName?.[0]?.toUpperCase() || "P"}
        </div>
        <div>
          <strong>{patient.fullName}</strong>
          <div style={{ ...styles.muted, fontSize: 13 }}>{patient.email}</div>
          <div style={{ ...styles.muted, fontSize: 12, marginTop: 4 }}>Sessions: {patient.audioLogCount || 0} · Exercises: {patient.exerciseCount || 0}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ textAlign: "right" }}>
          <strong style={{ color: scoreColor(score), fontSize: 17 }}>{score}%</strong>
          <div style={{ fontSize: 11, color: theme.colors.inkFaint }}>latest pronunciation</div>
        </div>
        <Button onClick={onOpen}>View patient</Button>
      </div>
    </div>
  );
}

function Recommendation({ score, difficulty }) {
  const n = Number(score) || 0;
  const text = n >= 85
    ? "Performance is strong. Increase challenge gradually and introduce more complex target words."
    : n < 60
    ? "Performance suggests additional guided practice. Keep the task simple and repeat the target sound."
    : "Maintain the current level and focus on consistency before increasing difficulty.";
  const headline = n >= 85 ? "Increase difficulty" : n < 60 ? "Reinforce fundamentals" : "Maintain current difficulty";
  const accent = n >= 85 ? theme.colors.success : n < 60 ? theme.colors.coralDark : theme.colors.primary;
  return (
    <div style={{ padding: 18, borderRadius: theme.radius.md, background: theme.colors.surfaceAlt, borderLeft: `4px solid ${accent}` }}>
      <strong style={{ color: accent, fontFamily: theme.font.display, fontSize: 16 }}>{headline}</strong>
      <p style={{ ...styles.muted, lineHeight: 1.65, margin: "8px 0" }}>{text}</p>
      <div style={{ fontSize: 13 }}>Current recorded level: <strong>Level {difficulty ?? "—"}</strong></div>
    </div>
  );
}

function MiniBars({ patients }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {patients.map((p) => {
        const s = Number(p.latestPronunciationScore || 0);
        return (
          <div key={p.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
              <span>{p.fullName}</span>
              <strong>{s}%</strong>
            </div>
            <div style={{ height: 12, background: theme.colors.surfaceAlt, borderRadius: 99 }}>
              <div style={{ width: `${Math.max(3, Math.min(100, s))}%`, height: "100%", background: scoreColor(s), borderRadius: 99, transition: "width .4s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CaregiverPortal({ user, logout, api }) {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [detail, setDetail] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const ps = await api("/api/patients"); setPatients(ps || []); setMessage(""); }
    catch (e) { setMessage(e.message); }
    finally { setLoading(false); }
  };

  const open = async (p) => {
    setSelected(p); setLoading(true);
    try {
      const [d, f] = await Promise.all([api(`/api/patients/${p.id}/dashboard`), api(`/api/patients/${p.id}/feedback`).catch(() => [])]);
      setDetail(d); setFeedback(Array.isArray(f) ? f : []);
    } catch (e) { setMessage(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="sdb" style={styles.page}>
      <GlobalStyle />
      <div style={styles.wrap}>
        <Header title="Caregiver portal" user={user} logout={logout} />
        {message && <Notice text={message} />}

        <Section
          title="Patient monitoring"
          subtitle="Review assigned exercises, therapy progress and caregiver feedback."
          right={<Button secondary onClick={load}>{loading ? "Refreshing…" : "Refresh"}</Button>}
        >
          {patients.length ? patients.map((p) => <PatientRow key={p.id} patient={p} onOpen={() => open(p)} />) : <Empty text={loading ? "Loading patients…" : "No patients available."} />}
        </Section>

        {selected && detail && (
          <>
            <Section title={`${selected.fullName}'s therapy summary`} subtitle="Current therapy data.">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                <Info label="Current difficulty" value={`Level ${detail.profile?.currentDifficultyLevel ?? "—"}`} />
                <Info label="Diagnosis" value={detail.profile?.diagnosis || "Not specified"} />
                <Info label="Practice sessions" value={detail.audioLogs?.length ?? 0} />
                <Info label="Assigned exercises" value={detail.exercises?.length ?? 0} />
              </div>
            </Section>
            <Section title="Assigned exercises">
              {detail.exercises?.length ? detail.exercises.map((a) => <ExerciseCard key={a.id} assignment={a} />) : <Empty text="No exercises assigned." />}
            </Section>
            <Section title="Progress">
              <ProgressTable logs={detail.audioLogs || []} />
            </Section>
            <Section title="Therapist / caregiver feedback">
              <p style={styles.muted}>Feedback currently stored for this patient:</p>
              {feedback.length ? feedback.map((f, i) => (
                <div key={f.id || i} style={{ padding: 14, border: `1px solid ${theme.colors.lineSoft}`, borderRadius: theme.radius.md, marginTop: 9, background: theme.colors.surfaceAlt }}>
                  <strong>{f.message || f.feedback || f.comment || "Feedback"}</strong>
                  <div style={{ ...styles.muted, fontSize: 12, marginTop: 5 }}>{formatDate(f.createdAt || f.updatedAt)}</div>
                </div>
              )) : <Empty text="No feedback recorded yet." />}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

export default App;