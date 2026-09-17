import { useEffect, useMemo, useRef, useState } from "react";

const API_URL = "https://swar-saathi-backend.onrender.com";

/* ------------------------------------------------------------------ */
/* Design tokens — matched to the Swar Saathi brand: deep navy for      */
/* trust and headings, a bright teal for the brand accent, and a warm  */
/* coral for energy/encouragement, echoed in the logomark.             */
/* ------------------------------------------------------------------ */
const theme = {
  colors: {
    canvas: "#EEF6F2",
    surface: "#FFFFFF",
    surfaceAlt: "#F2F8F5",
    navy: "#16283F",
    navyDark: "#0E1B2C",
    ink: "#16283F",
    inkSoft: "#5B6B78",
    inkFaint: "#93A2AC",
    line: "#DCE7E1",
    lineSoft: "#E9F1ED",
    teal: "#149C81",
    tealDark: "#0D7A65",
    tealSoft: "#E0F3ED",
    coral: "#FF7A52",
    coralDark: "#DB5A32",
    coralSoft: "#FFE6DA",
    gold: "#DE9F2E",
    goldSoft: "#FBEBCF",
    danger: "#C6483C",
    dangerSoft: "#FBE7E4",
    success: "#1E9D74",
  },
  radius: { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 },
  shadow: "0 18px 40px -18px rgba(14,27,44,.35)",
  shadowSoft: "0 6px 18px -8px rgba(14,27,44,.18)",
  font: {
    display: '"Fraunces", Georgia, "Times New Roman", serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
};

const styles = {
  page: {
    minHeight: "100vh",
    background: theme.colors.canvas,
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
      .sdb button, .sdb input, .sdb select, .sdb table { font-family: ${theme.font.body}; }
      .sdb input[type="checkbox"] { accent-color: ${theme.colors.teal}; width: 17px; height: 17px; }
      @keyframes sdb-pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(255,122,82,.42); }
        70% { box-shadow: 0 0 0 18px rgba(255,122,82,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,122,82,0); }
      }
      @keyframes sdb-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      .sdb-recording { animation: sdb-pulse-ring 1.7s ease-out infinite; }
      .sdb-bob { animation: sdb-bob 3.2s ease-in-out infinite; }
      .sdb button:focus-visible, .sdb a:focus-visible, .sdb input:focus-visible, .sdb select:focus-visible {
        outline: 3px solid ${theme.colors.gold};
        outline-offset: 2px;
      }
      .sdb-hover-lift { transition: transform .15s ease, box-shadow .15s ease; }
      .sdb-hover-lift:hover { transform: translateY(-2px); box-shadow: ${theme.shadow}; }
      .sdb-decor { pointer-events: none; }
      @media (max-width: 860px) { .sdb-decor { display: none; } }
      ::selection { background: ${theme.colors.coralSoft}; }
    `}</style>
  );
}

/* ---------------------------- Icons -------------------------------- */
const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
function IconMail(props) { return <svg {...iconProps} width={18} height={18} {...props}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></svg>; }
function IconLock(props) { return <svg {...iconProps} width={18} height={18} {...props}><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>; }
function IconEye(props) { return <svg {...iconProps} width={18} height={18} {...props}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>; }
function IconEyeOff(props) { return <svg {...iconProps} width={18} height={18} {...props}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.4 4.3M6.6 6.6C4 8.3 2 12 2 12s1.4 2.7 4 4.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>; }
function IconUser(props) { return <svg {...iconProps} width={18} height={18} {...props}><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" /></svg>; }
function IconArrowRight(props) { return <svg {...iconProps} width={17} height={17} strokeWidth={2.2} {...props}><path d="M4 12h16M13 5l7 7-7 7" /></svg>; }
function IconCake(props) { return <svg {...iconProps} width={18} height={18} {...props}><path d="M4 21v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" /><path d="M2 21h20" /><path d="M8 12V8M12 12V8M16 12V8" /><path d="M12 3c-1 1-1 2 0 3s1 2 0 3" /></svg>; }

/* --------------------------- Logomark -------------------------------- */
function Logo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <clipPath id="sdbLogoClip"><circle cx="24" cy="24" r="22" /></clipPath>
      </defs>
      <circle cx="24" cy="24" r="22" fill={theme.colors.surfaceAlt} />
      <g clipPath="url(#sdbLogoClip)">
        <path d="M2 4 C18 -2 36 0 44 14 C48 24 40 36 26 32 C12 28 4 18 2 4 Z" fill={theme.colors.navy} />
        <path d="M42 8 C50 20 46 38 30 44 C18 48 4 40 6 26 C8 16 18 20 24 27 C31 35 40 26 42 8 Z" fill={theme.colors.teal} opacity="0.92" />
        <circle cx="13" cy="35" r="8.5" fill={theme.colors.coral} />
      </g>
    </svg>
  );
}

function Wordmark({ size = 24, tagline }) {
  return (
    <div>
      <div style={{ fontFamily: theme.font.display, fontWeight: 650, fontSize: size, lineHeight: 1, color: theme.colors.navy }}>
        Swar <span style={{ color: theme.colors.teal }}>Saathi</span>
      </div>
      {tagline && <div style={{ fontSize: 12.5, color: theme.colors.inkSoft, marginTop: 4 }}>{tagline}</div>}
    </div>
  );
}

/* ----------------------- Decorative illustrations --------------------- */
function Waveform({ color = theme.colors.teal, bars = 9, height = 34 }) {
  const pattern = [0.4, 0.7, 1, 0.55, 0.85, 0.35, 0.9, 0.5, 0.65];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{ width: 5, borderRadius: 3, background: color, height: `${pattern[i % pattern.length] * 100}%`, opacity: 0.85 }} />
      ))}
    </div>
  );
}

function SoundHead({ size = 220 }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <circle cx="90" cy="100" r="55" fill="none" stroke={theme.colors.navy} strokeWidth="2.5" opacity="0.3" />
      <path d="M145 72a40 40 0 0 1 0 56" fill="none" stroke={theme.colors.teal} strokeWidth="5" strokeLinecap="round" />
      <path d="M160 58a66 66 0 0 1 0 84" fill="none" stroke={theme.colors.coral} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      <path d="M175 44a92 92 0 0 1 0 112" fill="none" stroke={theme.colors.gold} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function LeafAccent({ size = 90 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <ellipse cx="35" cy="60" rx="14" ry="34" fill={theme.colors.teal} transform="rotate(-25 35 60)" opacity="0.85" />
      <ellipse cx="60" cy="55" rx="12" ry="30" fill={theme.colors.coral} transform="rotate(15 60 55)" opacity="0.85" />
    </svg>
  );
}

function blobStyle(extra) {
  return { position: "absolute", zIndex: 0, ...extra };
}

function AuthDecor() {
  return (
    <div className="sdb-decor" style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div style={blobStyle({ top: -70, left: -90, width: 260, height: 260, background: theme.colors.tealSoft, borderRadius: "62% 38% 55% 45% / 55% 45% 55% 45%" })} />
      <div style={blobStyle({ top: -60, right: -80, width: 220, height: 220, background: theme.colors.coralSoft, borderRadius: "40% 60% 65% 35% / 45% 55% 45% 55%" })} />
      <div style={blobStyle({ bottom: -100, left: -60, width: 300, height: 300, background: theme.colors.tealSoft, borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%", opacity: 0.7 })} />
      <div style={blobStyle({ bottom: -120, right: -110, width: 340, height: 340, background: theme.colors.coralSoft, borderRadius: "55% 45% 60% 40% / 45% 55% 45% 55%", opacity: 0.75 })} />
      <div style={blobStyle({ top: "38%", left: 40, opacity: 0.9 })}><Waveform height={70} bars={7} /></div>
      <div style={blobStyle({ bottom: 60, right: 30, opacity: 0.9 })}><SoundHead size={190} /></div>
      <div style={blobStyle({ bottom: 40, left: 60, opacity: 0.9 })}><LeafAccent size={80} /></div>
    </div>
  );
}

/* ------------------------------- UI kit -------------------------------- */
function Button({ children, onClick, secondary = false, disabled = false, danger = false, type = "button", full = false, icon }) {
  const bg = danger ? theme.colors.danger : secondary ? theme.colors.surface : theme.colors.navy;
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
        padding: "12px 20px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 700,
        fontSize: 14.5,
        background: bg,
        color,
        opacity: disabled ? 0.55 : 1,
        boxShadow: disabled || secondary ? "none" : theme.shadowSoft,
        width: full ? "100%" : "auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {children}
      {icon}
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
  teal: { fg: theme.colors.teal, bg: theme.colors.tealSoft },
  coral: { fg: theme.colors.coralDark, bg: theme.colors.coralSoft },
  gold: { fg: "#8A5E12", bg: theme.colors.goldSoft },
};

function ScoreCard({ icon, title, value, subtitle, accent = "teal" }) {
  const a = accentSets[accent] || accentSets.teal;
  return (
    <div style={{ ...styles.card, padding: 18, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: a.fg }} />
      <div style={{ width: 34, height: 34, borderRadius: 10, background: a.bg, color: a.fg, display: "grid", placeItems: "center", fontSize: 16, marginBottom: 10 }}>{icon}</div>
      <div style={{ color: theme.colors.inkSoft, fontSize: 13, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 29, fontWeight: 800, marginTop: 4, fontFamily: theme.font.display }}>{value}</div>
      {subtitle && <div style={{ ...styles.muted, fontSize: 12.5, marginTop: 5 }}>{subtitle}</div>}
    </div>
  );
}

function ProgressBar({ value, label }) {
  const n = Math.max(0, Math.min(100, Number(value) || 0));
  const color = n >= 85 ? theme.colors.success : n >= 70 ? theme.colors.teal : n >= 50 ? theme.colors.gold : theme.colors.danger;
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
  if (n >= 70) return theme.colors.teal;
  if (n >= 50) return theme.colors.gold;
  return theme.colors.danger;
}
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/* AUDIO ANALYSIS (unchanged from your working version)                */
/* ------------------------------------------------------------------ */
const PITCH_FRAME_MS = 40;
const PITCH_HOP_MS = 20;
const MIN_VOICE_HZ = 70;
const MAX_VOICE_HZ = 400;
const VOICED_CORRELATION_THRESHOLD = 0.32;

function detectFramePitch(frame, sampleRate) {
  const size = frame.length;
  let mean = 0;
  for (let i = 0; i < size; i++) mean += frame[i];
  mean /= size;
  const centered = new Float32Array(size);
  let energy = 0;
  for (let i = 0; i < size; i++) { centered[i] = frame[i] - mean; energy += centered[i] * centered[i]; }
  const rms = Math.sqrt(energy / size);
  if (rms < 0.012) return null;
  const minLag = Math.floor(sampleRate / MAX_VOICE_HZ);
  const maxLag = Math.min(Math.floor(sampleRate / MIN_VOICE_HZ), size - 1);
  if (maxLag <= minLag) return null;
  let bestLag = -1, bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    const n = size - lag;
    let sum = 0, normA = 0, normB = 0;
    for (let i = 0; i < n; i++) { sum += centered[i] * centered[i + lag]; normA += centered[i] * centered[i]; normB += centered[i + lag] * centered[i + lag]; }
    const denom = Math.sqrt(normA * normB) || 1e-9;
    const corr = sum / denom;
    if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
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
    try { buffer = await ctx.decodeAudioData(arrayBuffer); }
    catch { throw new Error("Couldn't process that recording. Please try again (Chrome or Edge work best)."); }
    const { length, numberOfChannels, sampleRate } = buffer;
    if (!length || !sampleRate) throw new Error("The recording had no audio data — please try again.");
    const mono = new Float32Array(length);
    for (let c = 0; c < numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) mono[i] += data[i] / numberOfChannels;
    }
    let sumSquares = 0, crossings = 0;
    for (let i = 0; i < length; i++) sumSquares += mono[i] * mono[i];
    for (let i = 1; i < length; i++) if ((mono[i - 1] < 0) !== (mono[i] < 0)) crossings++;
    const overallRms = Math.sqrt(sumSquares / Math.max(1, length));
    const zcr = crossings / Math.max(1, length);
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
      pitchMeanHz = Math.round(voicedPitches[Math.floor(voicedPitches.length / 2)]);
    }
    const voicedRatio = totalFrames ? voicedPitches.length / totalFrames : 0;
    let clarity = Math.round(Math.min(100, overallRms * 650));
    if (overallRms < 0.005) clarity = 10;
    else if (overallRms < 0.01) clarity = Math.max(25, clarity);
    if (zcr > 0.18) clarity -= 10;
    clarity = Math.max(0, Math.min(100, clarity));
    const pitchScore = pitchMeanHz > 0 ? Math.max(55, Math.min(100, 100 - Math.abs(pitchMeanHz - 180) / 4)) : 20;
    const pronunciation = Math.round(Math.max(0, Math.min(100, clarity * 0.5 + pitchScore * 0.3 + voicedRatio * 100 * 0.2)));
    const overall = Math.round((clarity + pronunciation + pitchScore) / 3);
    return {
      durationSeconds: Number(buffer.duration.toFixed(2)),
      pitchMeanHz, clarityScore: clarity, pronunciationScore: pronunciation, overallScore: overall,
      voicedRatio: Number(voicedRatio.toFixed(2)), noVoiceDetected: voicedPitches.length === 0,
    };
  } finally { await ctx.close(); }
}

/* -------------------------- Token storage -------------------------- */
/* "Remember me" decides whether the session survives closing the tab: */
/* checked -> localStorage (persists); unchecked -> sessionStorage.    */
function saveToken(value, remember) {
  if (remember) { localStorage.setItem("token", value); sessionStorage.removeItem("token"); }
  else { sessionStorage.setItem("token", value); localStorage.removeItem("token"); }
}
function readToken() { return localStorage.getItem("token") || sessionStorage.getItem("token"); }
function clearToken() { localStorage.removeItem("token"); sessionStorage.removeItem("token"); }

function App() {
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

  const authHeaders = () => ({ Authorization: `Bearer ${readToken()}` });

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
    resetAudio(); clearToken();
    setUser(null); setPatients([]); setSelectedPatient(null); setPatientDetail(null);
    setFeedback([]); setExercises([]); setPatientDashboard(null); setMessage("");
  };

  const handleLogin = async ({ email, password, remember }) => {
    setLoading(true); setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      saveToken(data.token, remember); setUser(data.user);
    } catch (err) { setMessage(err.message); } finally { setLoading(false); }
  };

  const handleRegister = async ({ fullName, email, password, role, dateOfBirth, remember }) => {
    setLoading(true); setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), password, role, dateOfBirth: dateOfBirth || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create account");
      saveToken(data.token, remember); setUser(data.user);
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

  // Asks the backend to have Claude generate a fresh batch of exercises for
  // a patient (tailored to their difficulty level, diagnosis and recent
  // scores), then re-loads whichever view is showing that patient's data.
  const generateExercises = async (patientId, afterReload) => {
    setLoading(true); setMessage("Generating new exercises...");
    try {
      await api(`/api/patients/${patientId}/generate-exercises`, { method: "POST" });
      setMessage("New exercises added!");
      await afterReload();
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
        setIsRecording(false); stream.getTracks().forEach((t) => t.stop()); streamRef.current = null;
      };
      recorder.onstop = async () => {
        setIsRecording(false); stream.getTracks().forEach((t) => t.stop()); streamRef.current = null;
        if (!chunksRef.current.length) { setMessage("No audio was captured — check your microphone permissions and try again."); return; }
        const elapsedMs = Date.now() - recordingStartedAtRef.current;
        if (elapsedMs < 400) { setMessage("That recording was too short — hold the recording for at least a second while you speak."); return; }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob)); setUploading(true); setMessage("Analyzing your speech...");
        try {
          const result = await analyzeAudio(blob); setAnalysis(result);
          setMessage(result.noVoiceDetected
            ? "No clear voice was detected in that recording — try speaking louder or closer to the mic, then record again."
            : "Analysis complete. Saving your result...");
          const saved = await uploadRecording(blob, result);
          const merged = { ...result, ...(saved.analysis || {}) }; setAnalysis(merged);
          if (!result.noVoiceDetected) {
            setMessage(
              saved.newExercisesGenerated
                ? `Saved successfully. Difficulty: Level ${saved.difficulty?.current ?? "—"}. New exercises were added for you.`
                : `Saved successfully. Difficulty: Level ${saved.difficulty?.current ?? "—"}.`
            );
          }
          await loadPatientDashboard(user.id);
        } catch (err) { setMessage(err.message || "Audio analysis/upload failed."); }
        finally { setUploading(false); }
      };
      recorder.start(250);
      recordingStartedAtRef.current = Date.now();
      setIsRecording(true); setAnalysis(null); setMessage("Recording in progress — speak clearly.");
    } catch (err) {
      setIsRecording(false); setMessage(err.message || "Microphone permission is required.");
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop(); };

  useEffect(() => {
    const t = readToken();
    if (!t) return;
    const payload = decodeJwt(t);
    if (!payload?.userId || !payload?.role) { clearToken(); return; }
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
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} loading={loading} message={message} notify={setMessage} />;
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

          <Section
            title="Your home exercises"
            subtitle="Complete your assigned exercises, then record your speech practice below. New ones are generated for you automatically as you progress."
            right={
              <Button
                secondary
                disabled={loading}
                onClick={() => generateExercises(user.id, () => loadPatientDashboard(user.id))}
              >
                ✨ Get new exercises
              </Button>
            }
          >
            {exercises.length === 0 ? <Empty text="No exercises assigned yet — check back soon." /> : exercises.map((a) => <ExerciseCard key={a.id} assignment={a} />)}
          </Section>

          <Section
            title="Speech practice"
            subtitle="Record directly in the browser. The score is an acoustic demo score, not a clinical diagnosis."
            right={<Button secondary onClick={() => loadPatientDashboard(user.id)}>Refresh</Button>}
          >
            <div style={{ background: theme.colors.tealSoft, border: `1px solid ${theme.colors.line}`, borderRadius: theme.radius.lg, padding: "32px 24px", textAlign: "center" }}>
              <div className={isRecording ? "" : "sdb-bob"} style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <div className={isRecording ? "sdb-recording" : ""} style={{ width: 68, height: 68, borderRadius: "50%", background: isRecording ? theme.colors.coral : theme.colors.teal, display: "grid", placeItems: "center", fontSize: 26 }}>
                  {isRecording ? "🔴" : "🎙️"}
                </div>
              </div>
              <h3 style={{ fontFamily: theme.font.display, fontWeight: 650, margin: "0 0 6px" }}>{isRecording ? "Recording your speech…" : "Ready to practice?"}</h3>
              <p style={{ ...styles.muted, maxWidth: 620, margin: "0 auto 20px", lineHeight: 1.6 }}>
                {isRecording ? "Speak naturally and complete the assigned exercise." : "Allow microphone access, speak clearly, then stop the recording to get instant feedback."}
              </p>
              {!isRecording ? <Button onClick={startRecording} disabled={uploading}>Start recording</Button> : <Button danger onClick={stopRecording}>Stop recording</Button>}
              {uploading && <p style={{ marginTop: 14, marginBottom: 0, ...styles.muted }}>Processing and saving…</p>}
              {audioUrl && <div style={{ marginTop: 22 }}><audio controls src={audioUrl} style={{ width: "100%", maxWidth: 600 }} /></div>}
            </div>
          </Section>

          {analysis && <AnalysisCard analysis={analysis} />}

          {patientLatest && (
            <Section title="Your progress" subtitle="Recent saved acoustic metrics from your practice sessions.">
              <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                <ProgressBar value={patientLatest.pronunciationScore} label="Pronunciation score" />
                <ProgressBar value={patientLatest.clarityScore} label="Clarity score" />
                <div><div style={{ fontSize: 13, color: theme.colors.inkSoft }}>Pitch mean</div><strong style={{ fontSize: 24, fontFamily: theme.font.display }}>{Math.round(patientLatest.pitchMeanHz || 0)} Hz</strong></div>
                <div><div style={{ fontSize: 13, color: theme.colors.inkSoft }}>Latest session</div><strong>{formatDate(patientLatest.recordedAt)}</strong></div>
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
              <Info label="Clinical notes" value={patientDetail?.profile?.clinicalNotes || "Not specified"} />
            </div>
          </Section>

          <Section
            title="Assigned exercises"
            subtitle="Exercises currently assigned to this patient."
            right={
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  secondary
                  disabled={loading}
                  onClick={() => generateExercises(selectedPatient.id, () => loadPatientDetail(selectedPatient))}
                >
                  ✨ Generate more
                </Button>
                <Button secondary onClick={() => loadPatientDetail(selectedPatient)}>Refresh</Button>
              </div>
            }
          >
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
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{f.feedbackText || "Caregiver feedback"}</strong>
                  {f.moodRating != null && (
                    <span style={{ background: theme.colors.tealSoft, color: theme.colors.tealDark, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, height: "fit-content" }}>Mood {f.moodRating}/5</span>
                  )}
                </div>
                <div style={{ ...styles.muted, fontSize: 12, marginTop: 6 }}>{formatDate(f.createdAt)}</div>
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

          <Section title="Quick access" subtitle="Jump to what matters for today's therapy workflow." right={<Button onClick={loadPatients} disabled={loading}>{loading ? "Refreshing…" : "Refresh patients"}</Button>}>
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

  return <CaregiverPortal user={user} logout={logout} api={api} />;
}

/* ---------------------------- Auth screen ---------------------------- */
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px 13px 42px",
  border: `1.5px solid ${theme.colors.line}`,
  borderRadius: theme.radius.sm,
  fontSize: 15,
  background: theme.colors.surface,
  color: theme.colors.ink,
};

function InputField({ icon, rightSlot, ...inputProps }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: theme.colors.inkFaint, display: "flex" }}>{icon}</span>
      <input {...inputProps} style={{ ...inputStyle, paddingRight: rightSlot ? 42 : 14 }} />
      {rightSlot && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", display: "flex" }}>{rightSlot}</span>}
    </div>
  );
}

function AuthScreen({ onLogin, onRegister, loading, message, notify }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const switchMode = (next) => { setMode(next); notify(""); setShowPassword(false); };

  const submitLogin = (e) => { e.preventDefault(); onLogin({ email: loginEmail, password: loginPassword, remember }); };

  const submitSignup = (e) => {
    e.preventDefault();
    if (signupPassword.length < 8) { notify("Password must be at least 8 characters."); return; }
    if (signupPassword !== confirmPassword) { notify("Passwords don't match."); return; }
    if (role === "PATIENT" && !dateOfBirth) { notify("Date of birth is required for patient accounts."); return; }
    onRegister({ fullName, email: signupEmail, password: signupPassword, role, dateOfBirth, remember });
  };

  const forgotPassword = () => notify("Password reset isn't self-service yet — please contact your clinic administrator.");

  return (
    <div className="sdb" style={{ ...styles.page, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <GlobalStyle />
      <AuthDecor />

      <div style={{ ...styles.wrap, position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo size={44} />
          <Wordmark size={22} tagline="Better speech · Brighter futures" />
        </div>
        <div style={{ display: "none" }} className="sdb-decor" />
        <div style={{ fontSize: 13.5, color: theme.colors.inkSoft, fontWeight: 600, display: "flex", gap: 8 }} className="sdb-decor">
          <span>Support</span><span>·</span><span>Track</span><span>·</span><span>Empower</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "40px 0" }}>
        <div style={{ ...styles.card, width: "100%", maxWidth: 460, padding: "40px 36px", borderRadius: theme.radius.xl }}>
          <div style={{ textAlign: "center" }}>
            <div className="sdb-bob" style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <Logo size={64} />
            </div>
            <Wordmark size={28} />
            <p style={{ ...styles.muted, margin: "10px 0 0" }}>{mode === "login" ? "Your voice. Our support." : "Start your therapy journey."}</p>
          </div>

          <div style={{ textAlign: "center", marginTop: 26 }}>
          <img
  src="/swarsaathi logo.png"
  alt="Swar Saathi"
  style={{
    width: "220px",
    maxWidth: "85%",
    height: "auto",
    display: "block",
    margin: "0 auto 22px",
    objectFit: "contain",
  }}
/>
            <h1 style={{ margin: 0, fontFamily: theme.font.display, fontWeight: 650, fontSize: 25 }}>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
            <p style={{ ...styles.muted, margin: "6px 0 0" }}>{mode === "login" ? "Log in to continue your therapy journey" : "Join as a patient, therapist, or caregiver"}</p>
          </div>

          {mode === "login" ? (
            <form onSubmit={submitLogin}>
              <div style={{ marginTop: 24 }}>
                <InputField icon={<IconMail />} type="email" required placeholder="Email address" autoComplete="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              </div>
              <div style={{ marginTop: 14 }}>
                <InputField
                  icon={<IconLock />} type={showPassword ? "text" : "password"} required placeholder="Password" autoComplete="current-password"
                  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  rightSlot={<button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} style={{ border: 0, background: "none", cursor: "pointer", color: theme.colors.inkFaint, padding: 0, display: "flex" }}>{showPassword ? <IconEyeOff /> : <IconEye />}</button>}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 13.5 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, color: theme.colors.inkSoft, cursor: "pointer" }}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <button type="button" onClick={forgotPassword} style={{ border: 0, background: "none", cursor: "pointer", color: theme.colors.teal, fontWeight: 700, fontSize: 13.5, padding: 0 }}>Forgot password?</button>
              </div>
              <div style={{ marginTop: 22 }}>
                <Button type="submit" full disabled={loading} icon={!loading && <IconArrowRight />}>{loading ? "Logging in…" : "Log in"}</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={submitSignup}>
              <div style={{ marginTop: 24 }}>
                <InputField icon={<IconUser />} type="text" required placeholder="Full name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div style={{ marginTop: 14 }}>
                <InputField icon={<IconMail />} type="email" required placeholder="Email address" autoComplete="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
              </div>
              <div style={{ marginTop: 14 }}>
                <InputField
                  icon={<IconLock />} type={showPassword ? "text" : "password"} required placeholder="Password (min. 8 characters)" autoComplete="new-password"
                  value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                  rightSlot={<button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} style={{ border: 0, background: "none", cursor: "pointer", color: theme.colors.inkFaint, padding: 0, display: "flex" }}>{showPassword ? <IconEyeOff /> : <IconEye />}</button>}
                />
              </div>
              <div style={{ marginTop: 14 }}>
                <InputField icon={<IconLock />} type={showPassword ? "text" : "password"} required placeholder="Confirm password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                <label style={{ flex: "1 1 160px" }}>
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle, paddingLeft: 14 }}>
                    <option value="PATIENT">I'm a patient</option>
                    <option value="THERAPIST">I'm a therapist</option>
                    <option value="CAREGIVER">I'm a caregiver</option>
                  </select>
                </label>
                {role === "PATIENT" && (
                  <label style={{ flex: "1 1 160px" }}>
                    <InputField icon={<IconCake />} type="date" required placeholder="Date of birth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                  </label>
                )}
              </div>

              <div style={{ marginTop: 18 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, color: theme.colors.inkSoft, cursor: "pointer", fontSize: 13.5 }}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Keep me logged in on this device
                </label>
              </div>

              <div style={{ marginTop: 18 }}>
                <Button type="submit" full disabled={loading} icon={!loading && <IconArrowRight />}>{loading ? "Creating account…" : "Create account"}</Button>
              </div>
            </form>
          )}

          {message && <Notice text={message} />}

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: theme.colors.line }} />
            <span style={{ fontSize: 12.5, color: theme.colors.inkFaint }}>Or</span>
            <div style={{ flex: 1, height: 1, background: theme.colors.line }} />
          </div>

          {mode === "login" ? (
            <Button secondary full onClick={() => switchMode("signup")} icon={<IconUser />}>Create new account</Button>
          ) : (
            <Button secondary full onClick={() => switchMode("login")}>Already have an account? Log in</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ title, user, logout, back }) {
  return (
    <div style={{ ...styles.card, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap" }}>
      <div>
        {back && (
          <button onClick={back} style={{ border: 0, background: "none", cursor: "pointer", padding: 0, marginBottom: 10, color: theme.colors.teal, fontWeight: 700, fontSize: 13.5 }}>← Back to patients</button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={30} />
          <Wordmark size={20} />
        </div>
        <div style={{ fontWeight: 600, marginTop: 6, color: theme.colors.inkSoft, fontSize: 14 }}>{title} · {user.fullName || user.email || "User"}</div>
      </div>
      <Button secondary onClick={logout}>Log out</Button>
    </div>
  );
}

function Notice({ text }) {
  return (
    <div style={{ background: theme.colors.goldSoft, border: `1px solid ${theme.colors.gold}55`, borderRadius: theme.radius.sm, padding: 13, marginBottom: 18, marginTop: 4, color: "#6B4A0E" }}>{text}</div>
  );
}
function Empty({ text }) {
  return <div style={{ padding: 26, textAlign: "center", color: theme.colors.inkSoft, background: theme.colors.surfaceAlt, borderRadius: theme.radius.md }}>{text}</div>;
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
        <span style={{ background: theme.colors.tealSoft, color: theme.colors.tealDark, padding: "6px 12px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, height: "fit-content" }}>Level {e.difficultyLevel ?? "—"}</span>
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
      <thead><tr>{["Date", "Duration", "Pitch", "Clarity", "Pronunciation", "Level"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
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

const avatarPalette = [theme.colors.teal, theme.colors.coral, theme.colors.gold, theme.colors.navy];
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
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: avatarColor(patient.fullName || patient.id), color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontFamily: theme.font.display }}>{patient.fullName?.[0]?.toUpperCase() || "P"}</div>
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
  const text = n >= 85 ? "Performance is strong. Increase challenge gradually and introduce more complex target words."
    : n < 60 ? "Performance suggests additional guided practice. Keep the task simple and repeat the target sound."
    : "Maintain the current level and focus on consistency before increasing difficulty.";
  const headline = n >= 85 ? "Increase difficulty" : n < 60 ? "Reinforce fundamentals" : "Maintain current difficulty";
  const accent = n >= 85 ? theme.colors.success : n < 60 ? theme.colors.coralDark : theme.colors.teal;
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span>{p.fullName}</span><strong>{s}%</strong></div>
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
        <Section title="Patient monitoring" subtitle="Review assigned exercises, therapy progress and caregiver feedback." right={<Button secondary onClick={load}>{loading ? "Refreshing…" : "Refresh"}</Button>}>
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
            <Section title="Progress"><ProgressTable logs={detail.audioLogs || []} /></Section>
            <Section title="Therapist / caregiver feedback">
              <p style={styles.muted}>Feedback currently stored for this patient:</p>
              {feedback.length ? feedback.map((f, i) => (
                <div key={f.id || i} style={{ padding: 14, border: `1px solid ${theme.colors.lineSoft}`, borderRadius: theme.radius.md, marginTop: 9, background: theme.colors.surfaceAlt }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{f.feedbackText || "Feedback"}</strong>
                    {f.moodRating != null && (
                      <span style={{ background: theme.colors.tealSoft, color: theme.colors.tealDark, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, height: "fit-content" }}>Mood {f.moodRating}/5</span>
                    )}
                  </div>
                  <div style={{ ...styles.muted, fontSize: 12, marginTop: 5 }}>{formatDate(f.createdAt)}</div>
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