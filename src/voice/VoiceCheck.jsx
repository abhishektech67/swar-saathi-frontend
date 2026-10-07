import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { VoiceRecorder, isRecordingSupported } from "./audioRecorder";
import { analyzeSamples } from "./audioAnalyzer";
import { METRIC_ORDER, WEIGHTS, scoreBand, scoreVoice } from "./voiceScoring";
import { buildRecommendations } from "./exerciseRecommendation";

/* ======================================================================
 * Swar Saathi — VoiceCheck.jsx
 * Patient-home "Voice Check": record -> analyse -> score -> exercises.
 * States: idle | recording | processing | result | error
 * All analysis is local; the recording is never uploaded or stored.
 * Styling reuses the Swar Saathi palette (navy / mint / coral / cream).
 * ====================================================================== */

const MAX_SECONDS = 10;
const MIN_STOP_SECONDS = 3;

const c = {
  navy: "#1E293B",
  navyDark: "#14202F",
  inkSoft: "#6B7280",
  inkFaint: "#9CA3AF",
  line: "#E7DFD0",
  lineSoft: "#EFE8DA",
  surface: "#FFFFFF",
  surfaceAlt: "#F6F1E7",
  coral: "#FF7A59",
  coralDark: "#C75A3D",
  coralSoft: "#FFE7DE",
  teal: "#34D399",
  tealDark: "#0F9D6E",
  tealSoft: "#E4F9EF",
  gold: "#F2B441",
  goldSoft: "#FBF0DC",
  danger: "#E4574C",
  dangerSoft: "#FBE6E3",
};
const display = '"Outfit", "Noto Sans Devanagari", system-ui, -apple-system, "Segoe UI", sans-serif';
const body = '"Plus Jakarta Sans", "Noto Sans Devanagari", system-ui, -apple-system, "Segoe UI", sans-serif';

const cardStyle = {
  background: c.surface,
  border: `1.5px solid ${c.lineSoft}`,
  borderRadius: 26,
  padding: 24,
  boxShadow: "0 6px 20px rgba(30,41,59,0.07)",
  position: "relative",
  overflow: "hidden",
  marginBottom: 22,
  fontFamily: body,
  color: c.navy,
};

const BAND_COLOR = { strong: c.tealDark, good: c.teal, developing: c.gold, practice: c.coral };

function VcButton({ children, onClick, disabled, secondary, danger, full, small }) {
  const bg = danger ? c.navy : secondary ? "transparent" : c.coral;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: secondary ? `1.5px solid ${c.line}` : "1.5px solid transparent",
        background: bg,
        color: secondary ? c.navy : "#fff",
        borderRadius: 999,
        padding: small ? "9px 18px" : "14px 28px",
        minHeight: small ? 40 : 52,
        fontWeight: 700,
        fontSize: small ? 13.5 : 16,
        fontFamily: display,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: secondary ? "none" : "0 8px 22px rgba(255,122,89,0.28)",
        width: full ? "100%" : "auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}

/** Circular progress ring; animates from 0 to `value` once mounted. */
function Ring({ value, size = 120, stroke = 11, color, children, label }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }} role="img" aria-label={label}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.surfaceAlt} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.max(0, Math.min(100, shown)) / 100)}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>{children}</div>
    </div>
  );
}

/** Live microphone waveform drawn from the recorder's AnalyserNode. */
function LiveWaveform({ recorderRef }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx2d = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 300;
    const h = canvas.clientHeight || 70;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx2d.scale(dpr, dpr);
    const data = new Uint8Array(512);
    const bars = 40;
    let raf;
    const draw = () => {
      const analyser = recorderRef.current?.analyser;
      ctx2d.clearRect(0, 0, w, h);
      if (analyser) {
        analyser.getByteTimeDomainData(data);
        const step = Math.floor(data.length / bars);
        for (let i = 0; i < bars; i++) {
          let peak = 0;
          for (let j = 0; j < step; j++) peak = Math.max(peak, Math.abs(data[i * step + j] - 128));
          const amp = Math.min(1, (peak / 128) * 2.2);
          const bh = Math.max(4, amp * h);
          ctx2d.fillStyle = i % 5 === 0 ? c.coral : c.teal;
          const bw = w / bars;
          ctx2d.fillRect(i * bw + bw * 0.2, (h - bh) / 2, bw * 0.6, bh);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [recorderRef]);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ width: "100%", maxWidth: 420, height: 70, display: "block", margin: "0 auto" }} />;
}

function MetricCard({ metric, score, t }) {
  const band = scoreBand(score);
  const color = BAND_COLOR[band];
  return (
    <div style={{ border: `1.5px solid ${c.lineSoft}`, borderRadius: 20, padding: 16, background: c.surface, display: "flex", gap: 14, alignItems: "center" }}>
      <Ring value={score} size={84} stroke={9} color={color} label={`${t(`voice.metrics.${metric}`)}: ${t("voice.score", { n: score })}`}>
        <span style={{ fontFamily: display, fontWeight: 800, fontSize: 24, color: c.navy }}>{score}</span>
      </Ring>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 16, lineHeight: 1.25 }}>{t(`voice.metrics.${metric}`)}</div>
        <div style={{ display: "inline-block", marginTop: 5, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: `${color}22`, color: band === "good" ? c.tealDark : color === c.gold ? "#92620A" : color }}>
          {t(`voice.band.${band}`)} · {t("voice.weight", { n: Math.round(WEIGHTS[metric] * 100) })}
        </div>
        <div style={{ fontSize: 12.5, color: c.inkSoft, marginTop: 6, lineHeight: 1.45 }}>{t(`voice.metricHelp.${metric}`)}</div>
      </div>
    </div>
  );
}

function RangePanel({ result, t }) {
  const { minHz, maxHz, medianHz, lowHz, highHz } = result.pitchRange;
  const span = Math.max(1, maxHz - minHz);
  const pct = (hz) => Math.max(0, Math.min(100, ((hz - minHz) / span) * 100));
  const tile = (label, value) => (
    <div style={{ background: c.surfaceAlt, borderRadius: 16, padding: "12px 14px", flex: "1 1 120px" }}>
      <div style={{ fontSize: 12, color: c.inkSoft }}>{label}</div>
      <div style={{ fontFamily: display, fontWeight: 800, fontSize: 24, marginTop: 4 }}>
        {value} <span style={{ fontSize: 13, fontWeight: 600, color: c.inkSoft }}>Hz</span>
      </div>
    </div>
  );
  return (
    <div style={{ marginTop: 22 }}>
      <h3 style={{ fontFamily: display, fontSize: 17, margin: "0 0 12px" }}>{t("voice.rangeTitle")}</h3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {tile(t("voice.lowest"), minHz)}
        {tile(t("voice.median"), medianHz)}
        {tile(t("voice.highest"), maxHz)}
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 99, background: c.surfaceAlt, margin: "18px 4px 8px" }} aria-hidden="true">
        <div style={{ position: "absolute", left: `${pct(lowHz)}%`, width: `${Math.max(2, pct(highHz) - pct(lowHz))}%`, top: 0, bottom: 0, background: c.teal, borderRadius: 99 }} />
        <div style={{ position: "absolute", left: `${pct(medianHz)}%`, top: -4, width: 4, height: 18, borderRadius: 2, background: c.coral, transform: "translateX(-2px)" }} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{t("voice.practiceRange", { low: lowHz, high: highHz })}</div>
      <div style={{ fontSize: 12.5, color: c.inkSoft, marginTop: 4, lineHeight: 1.5 }}>{t("voice.rangeNote")}</div>
    </div>
  );
}

function Chip({ k, v }) {
  return (
    <span style={{ background: c.surfaceAlt, borderRadius: 99, padding: "5px 12px", fontSize: 12.5 }}>
      <span style={{ color: c.inkSoft }}>{k}: </span>
      <strong>{v}</strong>
    </span>
  );
}

function ExerciseTile({ ex, t }) {
  return (
    <article style={{ border: `1.5px solid ${c.lineSoft}`, borderRadius: 20, padding: 18, marginTop: 12, background: c.surface }}>
      <span style={{ fontSize: 12, fontWeight: 700, background: c.tealSoft, color: c.tealDark, borderRadius: 99, padding: "4px 12px" }}>
        {t("voice.forArea", { area: t(`voice.metrics.${ex.weakness}`) })}
      </span>
      <h4 style={{ fontFamily: display, fontSize: 18, margin: "10px 0 4px" }}>{ex.title}</h4>
      <p style={{ margin: 0, color: c.inkSoft, fontSize: 14, lineHeight: 1.5 }}>{ex.description}</p>
      <p style={{ margin: "12px 0 0", padding: 14, borderRadius: 14, background: c.goldSoft, fontSize: 14.5, lineHeight: 1.6 }}>{ex.instruction}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <Chip k={t("voice.difficulty")} v={t(`voice.difficultyLevels.${ex.difficulty}`)} />
        <Chip k={t("voice.duration")} v={ex.duration} />
        <Chip k={t("voice.target")} v={ex.target} />
      </div>
    </article>
  );
}

/**
 * @param {(result|null)=>void} onResult   called with each new scored result
 * @param {(text:string)=>void} [onAskCoach] optional: hand a summary to the AI coach
 */
export default function VoiceCheck({ onResult, onAskCoach }) {
  const { t, lang } = useI18n();
  const [phase, setPhase] = useState("idle"); // idle | recording | processing | result | error
  const [requesting, setRequesting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const recRef = useRef(null);
  const busyRef = useRef(false); // blocks double-starts

  const fail = useCallback((code) => {
    setErrorCode(code);
    setPhase("error");
  }, []);

  const begin = useCallback(async () => {
    if (busyRef.current) return;
    if (!isRecordingSupported()) {
      fail("UNSUPPORTED");
      return;
    }
    busyRef.current = true;
    setResult(null);
    onResult?.(null);
    setErrorCode(null);
    setElapsed(0);
    setRequesting(true);

    const rec = new VoiceRecorder({ maxSeconds: MAX_SECONDS, onProgress: setElapsed });
    recRef.current = rec;
    try {
      await rec.start(); // microphone permission is requested here, only now
    } catch (err) {
      recRef.current = null;
      busyRef.current = false;
      setRequesting(false);
      fail(err?.code || "UNSUPPORTED");
      return;
    }
    setRequesting(false);
    setPhase("recording");

    try {
      const { samples, sampleRate } = await rec.done; // resolves on stop() or at 10 s
      setPhase("processing");
      await new Promise((r) => setTimeout(r, 60)); // let the "analyzing" UI paint first
      const features = analyzeSamples(samples, sampleRate);
      if (!features.ok) {
        fail(features.code);
        return;
      }
      const scored = scoreVoice(features);
      setResult(scored);
      setPhase("result");
      onResult?.(scored);
    } catch (err) {
      if (err?.code === "CANCELLED") return;
      fail(err?.code || "ANALYSIS_FAILED");
    } finally {
      recRef.current = null;
      busyRef.current = false;
    }
  }, [fail, onResult]);

  const stopEarly = () => {
    if (recRef.current && elapsed >= MIN_STOP_SECONDS) recRef.current.stop();
  };

  // release the microphone if the user leaves the page mid-recording
  useEffect(() => () => recRef.current?.cancel(), []);

  const recommendations = useMemo(() => (result ? buildRecommendations(result, lang) : []), [result, lang]);

  const askCoach = () => {
    if (!result || !onAskCoach) return;
    onAskCoach(
      t("voice.coachPrompt", {
        pitch: result.scores.pitch,
        volume: result.scores.volume,
        breath: result.scores.breath,
        projection: result.scores.projection,
        overall: result.overall,
        low: result.pitchRange.lowHz,
        high: result.pitchRange.highHz,
      })
    );
  };

  const remaining = Math.max(0, Math.ceil(MAX_SECONDS - elapsed));
  const canStop = elapsed >= MIN_STOP_SECONDS;
  const headline =
    phase === "recording"
      ? t("voice.recordingHeadline")
      : phase === "processing"
        ? t("voice.processingHeadline")
        : phase === "result"
          ? t("voice.resultHeadline")
          : phase === "error"
            ? t("voice.errorHeadline")
            : t("voice.idleHeadline");

  return (
    <section style={cardStyle} aria-labelledby="vc-title">
      <style>{`
        @keyframes vc-pulse { 0% { box-shadow: 0 0 0 0 rgba(255,122,89,.40); } 70% { box-shadow: 0 0 0 22px rgba(255,122,89,0); } 100% { box-shadow: 0 0 0 0 rgba(255,122,89,0); } }
        @keyframes vc-spin { to { transform: rotate(360deg); } }
        .vc-pulse { animation: vc-pulse 1.6s ease-out infinite; }
        .vc-spin { animation: vc-spin 1s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .vc-pulse, .vc-spin { animation: none !important; } }
      `}</style>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 5, background: c.coral }} />

      <div style={{ paddingLeft: 6 }}>
        <h2 id="vc-title" style={{ margin: 0, fontFamily: display, fontWeight: 800, fontSize: 22 }}>
          🎙️ {t("voice.title")}
        </h2>
        <p style={{ margin: "6px 0 0", color: c.inkSoft, fontSize: 14, lineHeight: 1.5 }}>{t("voice.subtitle")}</p>

        {/* ---------------- state panel ---------------- */}
        <div
          style={{
            marginTop: 18,
            borderRadius: 22,
            padding: "28px 20px",
            textAlign: "center",
            background: phase === "error" ? c.dangerSoft : phase === "recording" ? c.coralSoft : c.tealSoft,
            border: `1px solid ${phase === "error" ? c.danger : c.line}`,
          }}
        >
          <div role="status" aria-live="polite" style={{ fontFamily: display, fontWeight: 800, fontSize: 21, marginBottom: 10 }}>
            {headline}
          </div>

          {phase === "idle" && (
            <>
              <p style={{ maxWidth: 520, margin: "0 auto 18px", lineHeight: 1.6, fontSize: 16 }}>{t("voice.instruction")}</p>
              <ol style={{ listStyle: "none", padding: 0, margin: "0 auto 20px", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", maxWidth: 640 }}>
                {["step1", "step2", "step3"].map((s, i) => (
                  <li key={s} style={{ background: "#fff", borderRadius: 16, padding: "10px 14px", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, flex: "1 1 170px", textAlign: "left" }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: c.navy, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                    {t(`voice.${s}`)}
                  </li>
                ))}
              </ol>
              <VcButton onClick={begin} disabled={requesting}>
                🎙️ {t("voice.start")}
              </VcButton>
              {requesting && <p style={{ marginTop: 12, fontSize: 13.5, color: c.inkSoft }}>{t("voice.micPrompt")}</p>}
              <p style={{ margin: "16px auto 0", fontSize: 12.5, color: c.inkSoft, maxWidth: 520 }}>{t("voice.quietTip")}</p>
            </>
          )}

          {phase === "recording" && (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <div className="vc-pulse" style={{ borderRadius: "50%" }}>
                  <Ring value={(elapsed / MAX_SECONDS) * 100} size={132} stroke={10} color={c.coral} label={t("voice.timeLeft", { s: remaining })}>
                    <div>
                      <div style={{ fontFamily: display, fontWeight: 800, fontSize: 38, lineHeight: 1 }}>{remaining}</div>
                      <div style={{ fontSize: 11.5, color: c.inkSoft, marginTop: 2 }}>{t("voice.secUnit")}</div>
                    </div>
                  </Ring>
                </div>
              </div>
              <LiveWaveform recorderRef={recRef} />
              <p style={{ margin: "12px auto 4px", color: c.inkSoft, fontSize: 14, maxWidth: 460, lineHeight: 1.5 }}>{t("voice.recordingHint")}</p>
              <p style={{ margin: "0 0 16px", fontSize: 12.5, color: c.tealDark, fontWeight: 700 }}>● {t("voice.listening")}</p>
              <VcButton danger onClick={stopEarly} disabled={!canStop}>
                ⏹ {t("voice.stop")}
              </VcButton>
            </>
          )}

          {phase === "processing" && (
            <>
              <div className="vc-spin" aria-hidden="true" style={{ width: 46, height: 46, margin: "6px auto 14px", borderRadius: "50%", border: `5px solid ${c.surface}`, borderTopColor: c.teal }} />
              <p style={{ margin: 0, color: c.inkSoft, fontSize: 14.5 }}>{t("voice.processingBody")}</p>
            </>
          )}

          {phase === "error" && (
            <>
              <p role="alert" style={{ maxWidth: 520, margin: "0 auto 18px", lineHeight: 1.6, fontSize: 15.5 }}>
                {t(`voiceErrors.${errorCode || "ANALYSIS_FAILED"}`)}
              </p>
              <VcButton onClick={begin}>{t("voice.tryAgain")}</VcButton>
            </>
          )}

          {phase === "result" && <p style={{ margin: 0, color: c.inkSoft, fontSize: 14 }}>{t("voice.resultSub")}</p>}
        </div>

        {/* ---------------- result ---------------- */}
        {phase === "result" && result && (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", background: c.navy, color: "#fff", borderRadius: 22, padding: 22 }}>
              <Ring
                value={result.overall}
                size={156}
                stroke={13}
                color={BAND_COLOR[scoreBand(result.overall)]}
                label={`${t("voice.overall")}: ${t("voice.score", { n: result.overall })}`}
              >
                <div>
                  <div style={{ fontFamily: display, fontWeight: 800, fontSize: 46, lineHeight: 1, color: "#fff" }}>{result.overall}</div>
                  <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 4 }}>{t("voice.outOf")}</div>
                </div>
              </Ring>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontSize: 13, color: "#CBD5E1" }}>{t("voice.overall")}</div>
                <div style={{ fontFamily: display, fontWeight: 800, fontSize: 30 }}>{t("voice.score", { n: result.overall })}</div>
                <span style={{ display: "inline-block", marginTop: 6, background: "rgba(255,255,255,0.14)", borderRadius: 99, padding: "4px 14px", fontWeight: 700, fontSize: 13 }}>
                  {t(`voice.band.${scoreBand(result.overall)}`)}
                </span>
                <div style={{ fontSize: 12.5, color: "#CBD5E1", marginTop: 12, lineHeight: 1.5 }}>
                  {METRIC_ORDER.map((m) => `${t(`voice.metrics.${m}`)} ${Math.round(WEIGHTS[m] * 100)}%`).join(" · ")}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 14, marginTop: 16 }}>
              {METRIC_ORDER.map((m) => (
                <MetricCard key={m} metric={m} score={result.scores[m]} t={t} />
              ))}
            </div>

            <RangePanel result={result} t={t} />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18, fontSize: 13 }}>
              <span style={{ background: c.surfaceAlt, borderRadius: 99, padding: "6px 14px" }}>
                {t("voice.detailSustain")}: <strong>{t("voice.seconds", { n: result.features.sustain.longestRunSec.toFixed(1) })}</strong>
              </span>
              <span style={{ background: c.surfaceAlt, borderRadius: 99, padding: "6px 14px" }}>
                {t("voice.detailVoiced")}: <strong>{Math.round(result.features.voicedRatio * 100)}%</strong>
              </span>
              <span style={{ background: c.surfaceAlt, borderRadius: 99, padding: "6px 14px" }}>
                {t("voice.detailFrames")}: <strong>{result.features.totalFrames}</strong> × {result.features.frameMs} ms
              </span>
            </div>

            <div style={{ marginTop: 22, padding: 16, borderRadius: 18, background: c.coralSoft, borderLeft: `4px solid ${c.coral}`, lineHeight: 1.6 }}>
              <strong style={{ fontFamily: display }}>{t("voice.focusTitle")}</strong>
              <div style={{ fontSize: 14.5, marginTop: 4 }}>
                {t("voice.focusBody", { a: t(`voice.metrics.${result.weakest[0]}`), b: t(`voice.metrics.${result.weakest[1]}`) })}
              </div>
              <div style={{ fontSize: 13.5, color: c.inkSoft, marginTop: 4 }}>{t("voice.strongestNote", { a: t(`voice.metrics.${result.strongest}`) })}</div>
            </div>

            <div style={{ marginTop: 26 }}>
              <h3 style={{ fontFamily: display, fontSize: 20, margin: 0 }}>{t("voice.exercisesTitle")}</h3>
              <p style={{ margin: "4px 0 0", color: c.inkSoft, fontSize: 14 }}>{t("voice.exercisesSub")}</p>
              {recommendations.map((ex) => (
                <ExerciseTile key={ex.id} ex={ex} t={t} />
              ))}
            </div>

            <div style={{ marginTop: 22, padding: 16, borderRadius: 18, background: c.tealSoft }}>
              <strong style={{ fontFamily: display }}>{t("voice.practiceGuidance")}</strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.7, fontSize: 14 }}>
                <li>{t("voice.guidance1")}</li>
                <li>{t("voice.guidance2")}</li>
                <li>{t("voice.guidance3")}</li>
              </ul>
              <p style={{ margin: "10px 0 0", fontSize: 13, color: c.inkSoft }}>{t("voice.stopPain")}</p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
              <VcButton onClick={begin}>🔁 {t("voice.recordAgain")}</VcButton>
              {onAskCoach && (
                <VcButton secondary onClick={askCoach}>
                  🤖 {t("voice.askCoach")}
                </VcButton>
              )}
            </div>
          </div>
        )}

        {/* ---------------- always-visible notes ---------------- */}
        <p style={{ margin: "18px 0 0", fontSize: 12.5, color: c.inkSoft, lineHeight: 1.5 }}>🔒 {t("voice.privacy")}</p>
        <p style={{ margin: "6px 0 0", fontSize: 12.5, color: c.inkSoft, lineHeight: 1.5 }}>ℹ️ {t("voice.disclaimer")}</p>
      </div>
    </section>
  );
}