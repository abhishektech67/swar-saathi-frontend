/* ======================================================================
 * Swar Saathi — audioAnalyzer.js
 * ----------------------------------------------------------------------
 * Turns raw microphone samples into robust, explainable voice features.
 * Everything runs locally in the browser; no audio ever leaves the device.
 *
 * PIPELINE (explainable in 30 seconds)
 *  1. Mix to mono, then decimate to ~16 kHz (cheap box-filter). Voice
 *     fundamentals are < 500 Hz, so 16 kHz is plenty and ~9x faster.
 *  2. Cut the signal into 50 ms windows (non-overlapping, ~200 per 10 s).
 *  3. For every window compute
 *       - RMS loudness
 *       - pitch (F0) with the McLeod "NSDF" normalised autocorrelation
 *       - a periodicity "clarity" value (0..1) = how voice-like the window is
 *  4. A window is VOICED only if it is loud enough (relative to the
 *     recording's own noise floor) AND periodic enough AND its pitch is in
 *     a human range (70-500 Hz). Silence/noise never becomes "pitch = 0";
 *     it is simply not voiced and ignored for pitch statistics.
 *  5. Octave errors are removed: pitch values far from the recording's
 *     median (ratio outside 0.6..1.67) are dropped as unreliable.
 *  6. Summary statistics use robust measures (median, percentiles) over
 *     the "steady core" of the held sound (onset/offset ramps trimmed).
 *
 * NOT clinical-grade. This is a practice aid, not a diagnostic tool.
 * ====================================================================== */

export const FRAME_MS = 50; // analysis window == hop (≈ 50 ms resolution)
export const MIN_PITCH_HZ = 70; // lowest plausible adult voice F0
export const MAX_PITCH_HZ = 500; // highest plausible F0 (covers children)
const TARGET_RATE = 16000; // decimated analysis rate
const CLARITY_MIN = 0.6; // min NSDF peak height to call a window "voiced"
const KEY_MAX_K = 0.9; // McLeod: pick first peak >= 0.9 * highest peak
const ABS_RMS_FLOOR = 0.004; // below this a window can never be voiced
const OCTAVE_LOW = 0.6; // reliable pitch must stay within
const OCTAVE_HIGH = 1 / 0.6; //   [0.6, 1.67] x median pitch
const EDGE_TRIM_SEC = 0.25; // ignore onset/offset ramps for stability stats
const GAP_BRIDGE_FRAMES = 1; // a 1-frame (50 ms) dropout doesn't break a run

/* ----------------------------- stats helpers ----------------------------- */
export function median(arr) {
  if (!arr.length) return 0;
  const s = Array.from(arr).sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = Array.from(arr).sort((a, b) => a - b);
  const idx = (s.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}
export function mean(arr) {
  if (!arr.length) return 0;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}
export function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += (arr[i] - m) * (arr[i] - m);
  return Math.sqrt(s / (arr.length - 1));
}
/** Robust sigma estimate: (p90 - p10) / 2.563 equals sigma for a normal curve
 *  but ignores a few stray frames. */
export function robustSigma(arr) {
  if (arr.length < 3) return 0;
  return (percentile(arr, 0.9) - percentile(arr, 0.1)) / 2.563;
}
const centsBetween = (hz, refHz) => 1200 * Math.log2(hz / refHz);

/* ------------------------------ preprocessing ---------------------------- */
function toMonoDecimated(samples, sampleRate) {
  const factor = Math.max(1, Math.floor(sampleRate / TARGET_RATE));
  const outLen = Math.floor(samples.length / factor);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    let acc = 0;
    const base = i * factor;
    for (let j = 0; j < factor; j++) acc += samples[base + j];
    out[i] = acc / factor;
  }
  return { data: out, rate: sampleRate / factor };
}

/* ------------------------------- pitch (F0) ------------------------------ */
/**
 * McLeod normalised square-difference function (NSDF), an autocorrelation
 * variant that is bounded to [-1, 1]:
 *     n(t) = 2 * sum(x[i] * x[i+t]) / sum(x[i]^2 + x[i+t]^2)
 * The tallest peak ("clarity") says how periodic the window is. To avoid
 * octave errors (picking 2x the true period) we take the FIRST peak that is
 * at least 90% of the tallest, not simply the tallest.
 * Returns { hz, clarity } or null when no human-range periodicity exists.
 */
export function detectPitch(frame, rate) {
  const W = frame.length;
  const maxLag = Math.min(Math.floor(rate / MIN_PITCH_HZ), W - 2);
  const minLag = Math.max(2, Math.floor(rate / MAX_PITCH_HZ));
  if (maxLag <= minLag + 2) return null;

  // remove DC offset
  let dc = 0;
  for (let i = 0; i < W; i++) dc += frame[i];
  dc /= W;
  const x = new Float32Array(W);
  for (let i = 0; i < W; i++) x[i] = frame[i] - dc;

  // prefix sums of squares so the denominator is O(1) per lag
  const sq = new Float64Array(W + 1);
  for (let i = 0; i < W; i++) sq[i + 1] = sq[i] + x[i] * x[i];

  const nsdf = new Float32Array(maxLag + 2);
  for (let t = 1; t <= maxLag + 1 && t < W; t++) {
    let acf = 0;
    const n = W - t;
    for (let i = 0; i < n; i++) acf += x[i] * x[i + t];
    const m = sq[n] + (sq[W] - sq[t]); // sum x[i]^2 (i<n) + sum x[i+t]^2
    nsdf[t] = m > 1e-12 ? (2 * acf) / m : 0;
  }

  // collect the highest local maximum of each positive lobe, after the
  // first negative dip (that skips the trivial lobe at lag 0)
  const peaks = [];
  let t = 1;
  while (t < maxLag && nsdf[t] > 0) t++; // skip initial positive lobe
  while (t < maxLag) {
    while (t < maxLag && nsdf[t] <= 0) t++; // find start of a positive lobe
    let best = -1;
    while (t < maxLag && nsdf[t] > 0) {
      if (t >= minLag && nsdf[t] >= nsdf[t - 1] && nsdf[t] >= nsdf[t + 1]) {
        if (best < 0 || nsdf[t] > nsdf[best]) best = t;
      }
      t++;
    }
    if (best > 0) peaks.push(best);
  }
  if (!peaks.length) return null;

  let top = 0;
  for (const p of peaks) top = Math.max(top, nsdf[p]);
  if (top < CLARITY_MIN) return { hz: 0, clarity: Math.max(0, top) };
  const chosen = peaks.find((p) => nsdf[p] >= KEY_MAX_K * top);

  // parabolic interpolation for sub-sample lag accuracy
  const a = nsdf[chosen - 1];
  const b = nsdf[chosen];
  const c = nsdf[chosen + 1];
  const denom = a - 2 * b + c;
  const shift = Math.abs(denom) > 1e-9 ? (0.5 * (a - c)) / denom : 0;
  const lag = chosen + Math.max(-1, Math.min(1, shift));
  const hz = rate / lag;
  if (hz < MIN_PITCH_HZ || hz > MAX_PITCH_HZ) return { hz: 0, clarity: top };
  return { hz, clarity: Math.min(1, top) };
}

/* ------------------------------ main analysis ---------------------------- */
/**
 * Analyse raw mono samples (-1..1) and return summary features, or
 * { ok:false, code } when the recording is not good enough to score.
 * Codes: TOO_SHORT, SILENCE, NO_VOICE, TOO_NOISY.
 */
export function analyzeSamples(samples, sampleRate) {
  if (!samples || !samples.length || !sampleRate) return { ok: false, code: "TOO_SHORT" };
  const durationSec = samples.length / sampleRate;
  if (durationSec < 3) return { ok: false, code: "TOO_SHORT", durationSec };

  // clipping check on the original signal
  let clipped = 0;
  for (let i = 0; i < samples.length; i++) if (Math.abs(samples[i]) > 0.98) clipped++;
  const clipFraction = clipped / samples.length;

  const { data, rate } = toMonoDecimated(samples, sampleRate);
  const W = Math.round((rate * FRAME_MS) / 1000);
  const total = Math.floor(data.length / W);
  if (total < 20) return { ok: false, code: "TOO_SHORT", durationSec };

  // ---- pass 1: per-frame RMS ----
  const rms = new Float32Array(total);
  for (let f = 0; f < total; f++) {
    let s = 0;
    const o = f * W;
    for (let i = 0; i < W; i++) s += data[o + i] * data[o + i];
    rms[f] = Math.sqrt(s / W);
  }
  const rmsP90 = percentile(rms, 0.9);
  if (rmsP90 < 0.006) return { ok: false, code: "SILENCE", durationSec };

  // A window can only be voiced if it carries real energy (>= ~-20 dB below
  // the loud frames, and above a tiny absolute floor). Whether it is *voice*
  // is then decided by periodicity, not by loudness, so natural loudness
  // wobble stays visible to the volume-steadiness score.
  const activity = Math.max(ABS_RMS_FLOOR, rmsP90 * 0.1);

  // ---- pass 2: pitch for frames that are loud enough ----
  const pitch = new Float32Array(total); // 0 = not voiced
  const clarity = new Float32Array(total);
  for (let f = 0; f < total; f++) {
    if (rms[f] < activity) continue;
    const r = detectPitch(data.subarray(f * W, (f + 1) * W), rate);
    if (!r) continue;
    clarity[f] = r.clarity;
    if (r.hz > 0) pitch[f] = r.hz;
  }

  // ---- octave / outlier filtering against the median pitch ----
  const rawVoiced = [];
  for (let f = 0; f < total; f++) if (pitch[f] > 0) rawVoiced.push(pitch[f]);
  if (rawVoiced.length < 8) return { ok: false, code: "NO_VOICE", durationSec };
  const rawMedian = median(rawVoiced);
  let outliers = 0;
  for (let f = 0; f < total; f++) {
    if (pitch[f] <= 0) continue;
    const ratio = pitch[f] / rawMedian;
    if (ratio < OCTAVE_LOW || ratio > OCTAVE_HIGH) {
      pitch[f] = 0;
      outliers++;
    }
  }
  const voicedMask = new Uint8Array(total);
  let voicedFrames = 0;
  for (let f = 0; f < total; f++) {
    if (pitch[f] > 0) {
      voicedMask[f] = 1;
      voicedFrames++;
    }
  }
  const voicedRatio = voicedFrames / total;
  const framesPerSec = 1000 / FRAME_MS;
  if (voicedFrames < Math.ceil(1.0 * framesPerSec) || voicedRatio < 0.15) {
    return { ok: false, code: "NO_VOICE", durationSec };
  }

  // ---- loudness / noise ----
  const voicedRms = [];
  const quietRms = [];
  for (let f = 0; f < total; f++) (voicedMask[f] ? voicedRms : quietRms).push(rms[f]);
  const medianVoicedRms = median(voicedRms);
  // Noise reference = RMS of the NON-periodic windows (silence/room noise).
  // Only trusted when there are enough of them (>= 5% of the clip) and they
  // are clearly quieter than the voice. If "aaah" fills the whole clip there
  // is no silent reference; snrDb is then null and periodicity (clarity)
  // is used as the noise proxy instead.
  const noiseFloor = Math.max(1e-5, median(quietRms));
  const hasNoiseReference = quietRms.length >= Math.max(8, Math.ceil(total * 0.05)) && noiseFloor < 0.5 * medianVoicedRms;
  const snrDb = hasNoiseReference ? 20 * Math.log10(medianVoicedRms / noiseFloor) : null;
  if (snrDb !== null && snrDb < 8) return { ok: false, code: "TOO_NOISY", durationSec };

  // ---- continuous voiced runs (bridge 1-frame dropouts) ----
  const bridged = Uint8Array.from(voicedMask);
  for (let f = 1; f < total - 1; f++) {
    if (!bridged[f] && voicedMask[f - 1] && voicedMask[f + 1] && GAP_BRIDGE_FRAMES >= 1) bridged[f] = 1;
  }
  let longestRun = 0;
  let run = 0;
  let runStart = 0;
  let bestStart = 0;
  for (let f = 0; f <= total; f++) {
    if (f < total && bridged[f]) {
      if (run === 0) runStart = f;
      run++;
    } else {
      if (run > longestRun) {
        longestRun = run;
        bestStart = runStart;
      }
      run = 0;
    }
  }
  const longestRunSec = longestRun / framesPerSec;
  const totalVoicedSec = voicedFrames / framesPerSec;

  // ---- steady core: trim onset/offset ramps of the whole voiced span ----
  let first = -1;
  let last = -1;
  for (let f = 0; f < total; f++) {
    if (voicedMask[f]) {
      if (first < 0) first = f;
      last = f;
    }
  }
  const trim = Math.round(EDGE_TRIM_SEC * framesPerSec);
  const spanFrames = last - first + 1;
  const useTrim = spanFrames > trim * 2 + 8;
  const coreFrom = useTrim ? first + trim : first;
  const coreTo = useTrim ? last - trim : last;

  const corePitch = [];
  const coreDb = [];
  const coreClarity = [];
  for (let f = coreFrom; f <= coreTo; f++) {
    if (!voicedMask[f]) continue;
    corePitch.push(pitch[f]);
    coreDb.push(20 * Math.log10(Math.max(rms[f], 1e-6)));
    coreClarity.push(clarity[f]);
  }
  if (corePitch.length < 6) return { ok: false, code: "NO_VOICE", durationSec };
  const meanClarityCore = mean(coreClarity);
  // Voiced frames only barely periodic => noise is competing with the voice.
  if (meanClarityCore < 0.65) return { ok: false, code: "TOO_NOISY", durationSec };

  // ---- pitch statistics (robust) ----
  const medHz = median(corePitch);
  const centsDev = corePitch.map((hz) => centsBetween(hz, medHz));
  const sigmaCents = robustSigma(centsDev); // spread of the held note
  let jitterSum = 0;
  let jitterN = 0;
  for (let i = 1; i < corePitch.length; i++) {
    jitterSum += Math.abs(centsBetween(corePitch[i], corePitch[i - 1]));
    jitterN++;
  }
  const jitterCents = jitterN ? jitterSum / jitterN : 0; // frame-to-frame wobble
  const allVoicedPitch = [];
  for (let f = 0; f < total; f++) if (voicedMask[f]) allVoicedPitch.push(pitch[f]);

  // ---- loudness statistics ----
  const sigmaDb = robustSigma(coreDb); // dB-domain => independent of mic gain
  const coreRms = [];
  for (let f = coreFrom; f <= coreTo; f++) if (voicedMask[f]) coreRms.push(rms[f]);
  const rmsMean = mean(coreRms);
  const rmsCV = rmsMean > 0 ? stdDev(coreRms) / rmsMean : 0;
  const levelDbfs = 20 * Math.log10(Math.max(medianVoicedRms, 1e-6));

  // ---- endurance: does the sound fade near the end (running out of breath)? ----
  const runEnd = bestStart + longestRun - 1;
  const third = Math.max(1, Math.floor(longestRun / 3));
  const midDb = [];
  const endDb = [];
  for (let f = bestStart + third; f < bestStart + 2 * third; f++) if (voicedMask[f]) midDb.push(20 * Math.log10(Math.max(rms[f], 1e-6)));
  for (let f = Math.max(bestStart + 2 * third, runEnd - third + 1); f <= runEnd; f++) if (voicedMask[f]) endDb.push(20 * Math.log10(Math.max(rms[f], 1e-6)));
  const enduranceDropDb = midDb.length >= 3 && endDb.length >= 3 ? Math.max(0, median(midDb) - median(endDb)) : 0;

  return {
    ok: true,
    durationSec: Number(durationSec.toFixed(2)),
    frameMs: FRAME_MS,
    totalFrames: total,
    voicedFrames,
    voicedRatio,
    octaveOutlierFrames: outliers,
    pitch: {
      medianHz: medHz,
      minHz: Math.min(...allVoicedPitch),
      maxHz: Math.max(...allVoicedPitch),
      p10Hz: percentile(allVoicedPitch, 0.1),
      p90Hz: percentile(allVoicedPitch, 0.9),
      sigmaCents,
      jitterCents,
    },
    loudness: {
      medianRms: medianVoicedRms,
      meanRms: rmsMean,
      rmsCV,
      sigmaDb,
      snrDb,
      hasNoiseReference,
      levelDbfs,
      noiseFloorRms: noiseFloor,
    },
    sustain: {
      longestRunSec,
      totalVoicedSec,
      enduranceDropDb,
    },
    clipFraction,
    meanClarity: meanClarityCore,
  };
}

/* ------------------------ decode helper (uploaded blobs) ----------------- */
/** Optional helper: analyse an encoded Blob (used only if a caller already has
 *  a recording file). The live recorder passes raw PCM straight to
 *  analyzeSamples and never needs this. */
export async function analyzeBlob(blob) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) throw new Error("UNSUPPORTED");
  const ctx = new Ctx();
  try {
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    const mono = new Float32Array(buf.length);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < buf.length; i++) mono[i] += ch[i] / buf.numberOfChannels;
    }
    return analyzeSamples(mono, buf.sampleRate);
  } finally {
    ctx.close();
  }
}