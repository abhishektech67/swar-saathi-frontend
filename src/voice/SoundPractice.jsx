/* ======================================================================
 * Swar Saathi — SoundPractice.jsx
 * ----------------------------------------------------------------------
 * Two buttons for every assigned exercise:
 *   ▶ Play demo   – plays the sound THIS exercise asks for (snake -> "sssss",
 *                   bee -> "zzzz", lion -> roar, "aaah", "mmm" ...). The sound
 *                   is picked from the exercise's own title/description/
 *                   instructions, so a snake exercise can only ever play a
 *                   snake sound.
 *   ● Record      – records the patient trying the same sound, then lets them
 *                   play their own recording back and compare it with the demo.
 *
 * No audio files and no new npm packages: demo sounds are synthesised with the
 * Web Audio API (or spoken with speechSynthesis for syllable exercises).
 * Recordings stay in the browser and are never uploaded.
 *
 * Only one sound plays / records at a time across the whole page.
 * ====================================================================== */
import { useEffect, useRef, useState } from "react";
import { VoiceRecorder, isRecordingSupported } from "./audioRecorder";
import { useI18n } from "../i18n";

/* ------------------------- which sound does an exercise want? ------------------------- */
// First match wins. Order matters: specific animals before generic vowels.
const SOUND_RULES = [
  { kind: "hiss", re: /snake|hiss|\bsss+|सांप|साँप|सर्प|फुफकार/i, label: { en: "Snake hiss — “sssss”", hi: "साँप की फुफकार — “ssss”" } },
  { kind: "buzz", re: /\bbee\b|buzz|\bzzz+|mosquito|मधुमक्खी|भनभन|मच्छर/i, label: { en: "Bee buzz — “zzzzz”", hi: "मधुमक्खी की भनभन — “zzzz”" } },
  { kind: "bark", re: /\bdog\b|bark|woof|puppy|कुत्ता|कुत्ते|भौं|भौंक/i, label: { en: "Dog bark — “woof woof woof”", hi: "कुत्ते की भौं — “भौं भौं भौं”" } },
  { kind: "meow", re: /\bcat\b|meow|kitten|बिल्ली|म्याऊँ|म्याऊ/i, label: { en: "Cat meow — “mee-ow”", hi: "बिल्ली की म्याऊँ — “म्याऊँ”" } },
  { kind: "hoot", re: /\bowl\b|hoot|उल्लू/i, label: { en: "Owl hoot — “hoo… hoo”", hi: "उल्लू की हू-हू — “हू… हू”" } },
  { kind: "roar", re: /lion|tiger|roar|growl|\brrr+|शेर|बाघ|दहाड़|गुर्र/i, label: { en: "Lion roar — “rrrraaa”", hi: "शेर की दहाड़ — “rrraa”" } },
  { kind: "shh", re: /\bshh+|quiet|hush|sh sound|शश|चुप/i, label: { en: "Hush — “shhhh”", hi: "शांत — “shhhh”" } },
  { kind: "pop", re: /balloon|\bpop\b|puh|\bpa\b|\bba\b|lip|bubble|गुब्बारा|पॉप|होंठ/i, label: { en: "Lip pop — “pa pa pa”", hi: "होंठ से “प प प”" } },
  { kind: "hum", re: /\bhum\b|humming|hummm|\bmmm+|गुनगुन/i, label: { en: "Hum — “mmmmm”", hi: "गुनगुनाना — “mmmm”" } },
  { kind: "ah", re: /aaa+h?|\bah\b|vowel|sustain|hold.*note|note hold|आआह|स्वर/i, label: { en: "Steady “aaah”", hi: "स्थिर “आआह”" } },
];

export function detectSound(exercise) {
  // 1) the exercise names its own sound (all library exercises do)
  if (exercise?.sound) {
    const hit = SOUND_RULES.find((r) => r.kind === exercise.sound);
    if (hit) return hit;
  }
  // 2) spoken-phrase exercises have no sound effect, they speak demoText
  if (exercise?.demoText) return null;
  // 3) assigned exercises from the backend: guess from the words in the exercise
  const text = [exercise?.title, exercise?.description, exercise?.instructions].filter(Boolean).join(" ");
  for (const r of SOUND_RULES) if (r.re.test(text)) return r;
  return null;
}

/* ------------------------- one-at-a-time controller ------------------------- */
let activeStop = null; // function that stops whatever is currently playing/recording
function claim(stopFn) {
  if (activeStop) {
    try { activeStop(); } catch { /* already stopped */ }
  }
  activeStop = stopFn;
}
function release(stopFn) {
  if (activeStop === stopFn) activeStop = null;
}

/* ------------------------- Web Audio synthesis ------------------------- */
let sharedCtx = null;
function getCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx || sharedCtx.state === "closed") sharedCtx = new Ctx();
  if (sharedCtx.state === "suspended") sharedCtx.resume().catch(() => {});
  return sharedCtx;
}

function noiseBuffer(ctx, seconds) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// Builds the demo for `kind`; returns { duration, stop }.
function synth(kind, onEnd) {
  const ctx = getCtx();
  if (!ctx) return null;
  const now = ctx.currentTime;
  const nodes = [];
  const out = ctx.createGain();
  out.connect(ctx.destination);
  nodes.push(out);

  const env = (dur, peak = 0.5, attack = 0.12, release = 0.25) => {
    out.gain.setValueAtTime(0.0001, now);
    out.gain.linearRampToValueAtTime(peak, now + attack);
    out.gain.setValueAtTime(peak, now + dur - release);
    out.gain.linearRampToValueAtTime(0.0001, now + dur);
  };
  const noise = (dur) => {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuffer(ctx, dur);
    nodes.push(s);
    return s;
  };
  const osc = (type, freq) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    nodes.push(o);
    return o;
  };
  const filter = (type, freq, q = 1) => {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    nodes.push(f);
    return f;
  };

  let dur = 2.6;
  if (kind === "hiss") {
    // snake: long high-frequency noise "ssssss"
    const n = noise(dur), hp = filter("highpass", 4500, 0.7), bp = filter("bandpass", 7000, 0.8);
    n.connect(hp); hp.connect(bp); bp.connect(out);
    env(dur, 0.9, 0.2, 0.5);
    n.start(now);
  } else if (kind === "shh") {
    const n = noise(dur), bp = filter("bandpass", 2600, 0.9);
    n.connect(bp); bp.connect(out);
    env(dur, 1.1, 0.25, 0.5);
    n.start(now);
  } else if (kind === "buzz") {
    // bee: voiced "zzzz" = buzzy 170 Hz tone + high noise, wobbling
    dur = 2.6;
    const o = osc("sawtooth", 170), lfo = osc("sine", 28), lfoG = ctx.createGain();
    lfoG.gain.value = 0.35; nodes.push(lfoG);
    const amp = ctx.createGain(); amp.gain.value = 0.55; nodes.push(amp);
    lfo.connect(lfoG); lfoG.connect(amp.gain);
    const bp = filter("bandpass", 1800, 1.2);
    o.connect(amp); amp.connect(bp); bp.connect(out);
    const n = noise(dur), hp = filter("highpass", 5000), ng = ctx.createGain(); ng.gain.value = 0.25; nodes.push(ng);
    n.connect(hp); hp.connect(ng); ng.connect(out);
    env(dur, 0.7, 0.15, 0.4);
    o.start(now); lfo.start(now); n.start(now);
  } else if (kind === "roar") {
    // lion: low growl with fast tremolo, pitch glides down
    dur = 2.8;
    const o = osc("sawtooth", 130), o2 = osc("square", 65);
    o.frequency.setValueAtTime(150, now);
    o.frequency.exponentialRampToValueAtTime(85, now + dur);
    const lfo = osc("sine", 22), lfoG = ctx.createGain(); lfoG.gain.value = 0.4; nodes.push(lfoG);
    const amp = ctx.createGain(); amp.gain.value = 0.6; nodes.push(amp);
    lfo.connect(lfoG); lfoG.connect(amp.gain);
    const lp = filter("lowpass", 900, 1.5);
    o.connect(amp); o2.connect(amp); amp.connect(lp); lp.connect(out);
    const n = noise(dur), nb = filter("bandpass", 700, 0.6), ng = ctx.createGain(); ng.gain.value = 0.35; nodes.push(ng);
    n.connect(nb); nb.connect(ng); ng.connect(out);
    env(dur, 0.8, 0.15, 0.6);
    o.start(now); o2.start(now); lfo.start(now); n.start(now);
  } else if (kind === "hum") {
    // "mmmm": soft low sine + 2nd harmonic with slight vibrato
    dur = 3;
    const o = osc("sine", 190), h = osc("sine", 380), v = osc("sine", 5), vg = ctx.createGain();
    vg.gain.value = 3; nodes.push(vg);
    v.connect(vg); vg.connect(o.frequency);
    const hg = ctx.createGain(); hg.gain.value = 0.3; nodes.push(hg);
    const lp = filter("lowpass", 700);
    o.connect(lp); h.connect(hg); hg.connect(lp); lp.connect(out);
    env(dur, 0.8, 0.3, 0.5);
    o.start(now); h.start(now); v.start(now);
  } else if (kind === "ah") {
    // "aaah": glottal-like saw through two vowel formants
    dur = 3.2;
    const o = osc("sawtooth", 190), v = osc("sine", 5), vg = ctx.createGain();
    vg.gain.value = 2; nodes.push(vg);
    v.connect(vg); vg.connect(o.frequency);
    const f1 = filter("bandpass", 800, 6), f2 = filter("bandpass", 1200, 8);
    const g1 = ctx.createGain(), g2 = ctx.createGain();
    g1.gain.value = 1.4; g2.gain.value = 1; nodes.push(g1, g2);
    o.connect(f1); o.connect(f2); f1.connect(g1); f2.connect(g2); g1.connect(out); g2.connect(out);
    env(dur, 0.7, 0.2, 0.5);
    o.start(now); v.start(now);
  } else if (kind === "pop") {
    // "pa pa pa": three short noise bursts
    dur = 1.8;
    out.gain.value = 1;
    [0.1, 0.65, 1.2].forEach((t0) => {
      const n = noise(0.14), bp = filter("bandpass", 900, 0.8), g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now + t0);
      g.gain.linearRampToValueAtTime(1.2, now + t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t0 + 0.14);
      nodes.push(g);
      n.connect(bp); bp.connect(g); g.connect(out);
      n.start(now + t0);
      const o = osc("sine", 200), og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, now + t0 + 0.05);
      og.gain.linearRampToValueAtTime(0.5, now + t0 + 0.08);
      og.gain.exponentialRampToValueAtTime(0.0001, now + t0 + 0.4);
      nodes.push(og);
      o.connect(og); og.connect(out);
      o.start(now + t0 + 0.05); o.stop(now + t0 + 0.45);
    });
  } else if (kind === "bark") {
    // dog: three short "woof" bursts, pitch dropping fast
    dur = 1.7;
    out.gain.value = 1;
    [0.05, 0.6, 1.15].forEach((t0) => {
      const o = osc("sawtooth", 420);
      o.frequency.setValueAtTime(430, now + t0);
      o.frequency.exponentialRampToValueAtTime(210, now + t0 + 0.2);
      const f = filter("bandpass", 950, 2.2), g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now + t0);
      g.gain.linearRampToValueAtTime(1.0, now + t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t0 + 0.28);
      nodes.push(g);
      o.connect(f); f.connect(g); g.connect(out);
      o.start(now + t0); o.stop(now + t0 + 0.3);
      const n = noise(0.12), nb = filter("bandpass", 1500, 0.8), ng = ctx.createGain();
      ng.gain.setValueAtTime(0.5, now + t0);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + t0 + 0.1);
      nodes.push(ng);
      n.connect(nb); nb.connect(ng); ng.connect(out);
      n.start(now + t0);
    });
  } else if (kind === "meow") {
    // cat: "mee-ow" = pitch glides up then down with moving vowel formant
    dur = 3;
    out.gain.value = 1;
    [0.1, 1.6].forEach((t0) => {
      const o = osc("sawtooth", 450);
      o.frequency.setValueAtTime(450, now + t0);
      o.frequency.linearRampToValueAtTime(860, now + t0 + 0.45);
      o.frequency.linearRampToValueAtTime(520, now + t0 + 1.2);
      const f = filter("bandpass", 900, 4);
      f.frequency.setValueAtTime(2300, now + t0);
      f.frequency.linearRampToValueAtTime(900, now + t0 + 1.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now + t0);
      g.gain.linearRampToValueAtTime(1.3, now + t0 + 0.12);
      g.gain.setValueAtTime(1.3, now + t0 + 0.8);
      g.gain.linearRampToValueAtTime(0.0001, now + t0 + 1.25);
      nodes.push(g);
      o.connect(f); f.connect(g); g.connect(out);
      o.start(now + t0); o.stop(now + t0 + 1.3);
    });
  } else if (kind === "hoot") {
    // owl: two soft, rounded "hoo" notes
    dur = 2;
    out.gain.value = 1;
    [0.1, 1.0].forEach((t0) => {
      const o = osc("sine", 340), h = osc("sine", 680);
      o.frequency.setValueAtTime(350, now + t0);
      o.frequency.linearRampToValueAtTime(310, now + t0 + 0.6);
      h.frequency.setValueAtTime(700, now + t0);
      h.frequency.linearRampToValueAtTime(620, now + t0 + 0.6);
      const hg = ctx.createGain(); hg.gain.value = 0.18; nodes.push(hg);
      const lp = filter("lowpass", 900), g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now + t0);
      g.gain.linearRampToValueAtTime(1.0, now + t0 + 0.12);
      g.gain.setValueAtTime(1.0, now + t0 + 0.4);
      g.gain.linearRampToValueAtTime(0.0001, now + t0 + 0.7);
      nodes.push(g);
      o.connect(lp); h.connect(hg); hg.connect(lp); lp.connect(g); g.connect(out);
      o.start(now + t0); h.start(now + t0); o.stop(now + t0 + 0.75); h.stop(now + t0 + 0.75);
    });
  } else {
    return null;
  }

  let stopped = false;
  const timer = setTimeout(() => stop(true), dur * 1000 + 80);
  function stop(natural) {
    if (stopped) return;
    stopped = true;
    clearTimeout(timer);
    nodes.forEach((n) => {
      try { if (n.stop) n.stop(); } catch { /* not started */ }
      try { n.disconnect(); } catch { /* already gone */ }
    });
    onEnd?.(natural);
  }
  return { stop: () => stop(false) };
}

// Fallback: speak a short sound/phrase (used when no animal/sound keyword is found).
function speak(text, lang, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "hi" ? "hi-IN" : "en-IN";
  u.rate = 0.7;
  let done = false;
  const finish = (natural) => { if (!done) { done = true; onEnd?.(natural); } };
  u.onend = () => finish(true);
  u.onerror = () => finish(false);
  window.speechSynthesis.speak(u);
  return { stop: () => { window.speechSynthesis.cancel(); finish(false); } };
}

/* ------------------------- the component ------------------------- */
const COPY = {
  en: {
    play: "Play demo", stop: "Stop", record: "Record", stopRec: "Stop recording", myRec: "Play my recording",
    heading: "Listen, then copy the sound", hearThis: "You will hear:", generic: "Listen to the demo, then record yourself copying it.",
    recording: "Recording…", recDone: "Recorded! Play it back and compare with the demo.",
    noSpeech: "Demo audio isn't supported on this browser.",
    err: {
      PERMISSION_DENIED: "Microphone permission was denied. Allow it in your browser settings and try again.",
      NO_MIC: "No microphone found.", MIC_BUSY: "The microphone is being used by another app.",
      UNSUPPORTED: "Recording isn't supported on this browser (use Chrome or Safari over https).", STREAM_ENDED: "The microphone disconnected.",
      EMPTY: "Nothing was recorded. Please try again.",
    },
    private: "Your recording stays on this device.",
  },
  hi: {
    play: "डेमो सुनें", stop: "रोकें", record: "रिकॉर्ड करें", stopRec: "रिकॉर्डिंग रोकें", myRec: "मेरी रिकॉर्डिंग सुनें",
    heading: "पहले सुनें, फिर वही आवाज़ निकालें", hearThis: "आप सुनेंगे:", generic: "डेमो सुनें, फिर उसी आवाज़ की नकल करके रिकॉर्ड करें।",
    recording: "रिकॉर्ड हो रहा है…", recDone: "रिकॉर्ड हो गया! इसे सुनकर डेमो से मिलाएँ।",
    noSpeech: "इस ब्राउज़र में डेमो ऑडियो उपलब्ध नहीं है।",
    err: {
      PERMISSION_DENIED: "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति देकर फिर कोशिश करें।",
      NO_MIC: "माइक्रोफ़ोन नहीं मिला।", MIC_BUSY: "माइक्रोफ़ोन किसी और ऐप में इस्तेमाल हो रहा है।",
      UNSUPPORTED: "इस ब्राउज़र में रिकॉर्डिंग समर्थित नहीं है (https पर Chrome या Safari इस्तेमाल करें)।", STREAM_ENDED: "माइक्रोफ़ोन डिस्कनेक्ट हो गया।",
      EMPTY: "कुछ रिकॉर्ड नहीं हुआ। कृपया फिर कोशिश करें।",
    },
    private: "आपकी रिकॉर्डिंग इसी डिवाइस पर रहती है।",
  },
};

const btn = (bg, color, border) => ({
  display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 99, cursor: "pointer",
  fontWeight: 700, fontSize: 14, border: `2px solid ${border}`, background: bg, color, fontFamily: "inherit",
});

export default function SoundPractice({ exercise, colors = {} }) {
  const { lang } = useI18n();
  const L = COPY[lang] || COPY.en;
  const sound = detectSound(exercise);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [playingMine, setPlayingMine] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [hasRec, setHasRec] = useState(false);

  const demoRef = useRef(null);
  const recRef = useRef(null);
  const takeRef = useRef(null);     // { samples, sampleRate }
  const mineRef = useRef(null);     // playback of my recording
  const stopAllRef = useRef(() => {});

  const teal = colors.tealDark || "#0f766e";
  const tealSoft = colors.tealSoft || "#e6f4f1";
  const coral = colors.danger || "#d9534f";

  // stops anything this card is doing (also called when ANOTHER card starts)
  stopAllRef.current = () => {
    demoRef.current?.stop(); demoRef.current = null; setPlaying(false);
    mineRef.current?.stop(); mineRef.current = null; setPlayingMine(false);
    if (recRef.current) { recRef.current.cancel(); recRef.current = null; setRecording(false); }
  };
  const myStop = useRef(() => stopAllRef.current()).current;

  useEffect(() => () => { myStop(); release(myStop); window.speechSynthesis?.cancel?.(); }, [myStop]);

  const playDemo = () => {
    if (playing) { demoRef.current?.stop(); return; }
    setError(""); setStatus("");
    claim(myStop);
    const onEnd = () => { demoRef.current = null; setPlaying(false); release(myStop); };
    let h = null;
    if (sound) h = synth(sound.kind, onEnd);
    if (!h) {
      // no known sound for this exercise: speak the exercise title so the patient still hears a model
      h = speak(exercise?.demoText || exercise?.title || "", lang, onEnd);
    }
    if (!h) { setError(L.noSpeech); release(myStop); return; }
    demoRef.current = h;
    setPlaying(true);
  };

  const startRecording = async () => {
    setError(""); setStatus("");
    if (!isRecordingSupported()) { setError(L.err.UNSUPPORTED); return; }
    claim(myStop);
    const rec = new VoiceRecorder({ maxSeconds: 10, onProgress: setElapsed });
    recRef.current = rec;
    setElapsed(0); setHasRec(false); takeRef.current = null;
    try {
      await rec.start();
    } catch (err) {
      recRef.current = null; release(myStop);
      setError(L.err[err?.code] || L.err.UNSUPPORTED);
      return;
    }
    setRecording(true); setStatus(L.recording);
    try {
      const take = await rec.done; // resolves on stop() or after 10 s
      recRef.current = null; setRecording(false); release(myStop);
      if (!take.samples.length) { setError(L.err.EMPTY); setStatus(""); return; }
      takeRef.current = take; setHasRec(true); setStatus(L.recDone);
    } catch (err) {
      if (err?.code === "CANCELLED") return;
      recRef.current = null; setRecording(false); release(myStop); setStatus("");
      setError(L.err[err?.code] || L.err.UNSUPPORTED);
    }
  };

  const playMine = () => {
    if (playingMine) { mineRef.current?.stop(); return; }
    const take = takeRef.current;
    const ctx = getCtx();
    if (!take || !ctx) return;
    claim(myStop);
    const buf = ctx.createBuffer(1, take.samples.length, take.sampleRate);
    buf.getChannelData(0).set(take.samples);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.connect(ctx.destination);
    src.onended = () => { mineRef.current = null; setPlayingMine(false); release(myStop); };
    mineRef.current = { stop: () => { try { src.stop(); } catch { /* ended */ } } };
    setPlayingMine(true);
    src.start();
  };

  return (
    <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: tealSoft, border: `1.5px dashed ${teal}` }}>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: teal }}>🎧 {L.heading}</div>
      <div style={{ fontSize: 13, margin: "4px 0 10px", opacity: 0.85 }}>
        {sound ? <>{L.hearThis} <strong>{sound.label[lang] || sound.label.en}</strong></> : L.generic}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={playDemo} disabled={recording} style={{ ...btn(teal, "#fff", teal), opacity: recording ? 0.5 : 1 }} aria-label={playing ? L.stop : L.play}>
          {playing ? "⏹" : "▶"} {playing ? L.stop : L.play}
        </button>
        {!recording ? (
          <button type="button" onClick={startRecording} style={btn("#fff", coral, coral)} aria-label={L.record}>
            <span style={{ width: 11, height: 11, borderRadius: 99, background: coral, display: "inline-block" }} /> {L.record}
          </button>
        ) : (
          <button type="button" onClick={() => recRef.current?.stop()} style={btn(coral, "#fff", coral)} aria-label={L.stopRec}>
            ⏹ {L.stopRec} · {elapsed.toFixed(1)}s
          </button>
        )}
        {hasRec && !recording && (
          <button type="button" onClick={playMine} style={btn("#fff", teal, teal)}>
            {playingMine ? "⏹" : "🔊"} {playingMine ? L.stop : L.myRec}
          </button>
        )}
      </div>

      <div aria-live="polite" style={{ minHeight: 18, marginTop: 8, fontSize: 12.5 }}>
        {error ? <span style={{ color: coral, fontWeight: 600 }}>{error}</span> : status}
      </div>
      <div style={{ fontSize: 11.5, opacity: 0.6 }}>{L.private}</div>
    </div>
  );
}
