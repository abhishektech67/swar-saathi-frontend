/* ======================================================================
 * Swar Saathi — voiceScoring.js
 * ----------------------------------------------------------------------
 * Converts measured voice features (from audioAnalyzer.js) into four
 * 0-100 practice scores and one weighted overall score.
 *
 * Every score is a deterministic function of the recording — no random
 * numbers, no device-specific constants. All constants are listed here so
 * the maths can be explained live:
 *
 *  1. PITCH STEADINESS   (weight 30%)
 *     Input : sigmaCents  = robust spread of pitch around its median, in
 *                           cents (100 cents = 1 semitone), steady core only
 *             jitterCents = mean frame-to-frame pitch change (cents)
 *             octaveOutlierFrames / voicedFrames = unreliable-pitch share
 *     Map   : spreadScore  = 100 at <= 10 cents, falling linearly to 10
 *                            at >= 120 cents
 *             jitterScore  = 100 at <= 8 cents, falling to 10 at >= 80
 *             score = (0.65*spreadScore + 0.35*jitterScore) * (1 - penalty)
 *             penalty = min(0.4, 1.5 * outlierShare)   (pitch jumping around)
 *
 *  2. VOLUME STEADINESS  (weight 25%)
 *     Input : sigmaDb = robust spread of frame loudness in decibels over
 *                       the steady core (dB makes it independent of mic gain)
 *             rmsCV   = std/mean of RMS (secondary check)
 *     Map   : dbScore = 100 at <= 1.5 dB, falling to 10 at >= 9 dB
 *             cvScore = 100 at <= 0.10, falling to 10 at >= 0.60
 *             score = 0.75*dbScore + 0.25*cvScore
 *
 *  3. BREATH CONTROL     (weight 25%)
 *     Estimated from how long and how continuously the sound is held:
 *             sustain    = longest continuous voiced run / 8 s (cap 1)
 *             voicedFill = voiced frames / all frames / 0.85    (cap 1)
 *             continuity = longest run / total voiced time      (cap 1)
 *             endurance  = 1 - clamp((fadeDb - 3) / 9)  — penalises the
 *                          sound fading > 3 dB near the end (air running out)
 *             score = 100*(0.50*sustain + 0.20*voicedFill
 *                        + 0.15*continuity + 0.15*endurance)
 *
 *  4. PROJECTION         (weight 20%)
 *     "Adequate, consistent vocal energy" — NOT "louder is better":
 *             snrScore   = 0 at <= 8 dB above the room noise floor,
 *                          100 at >= 30 dB (saturates: extra loudness adds 0);
 *                          if the clip has no quiet frames, clarityScore is used
 *             levelScore = bell curve on the voiced level in dBFS:
 *                          100 inside -32..-12 dBFS, ramping down to 0 at
 *                          -50 dBFS (too faint) and down to 55 at -3 dBFS
 *                          (too hot / clipping)
 *             clarityScore = periodicity (0.6..1.0 -> 0..100)
 *             score = (0.50*snrScore + 0.25*levelScore + 0.25*clarityScore)
 *                     minus a clipping penalty (up to 25 points)
 *
 *  OVERALL = Pitch*0.30 + Volume*0.25 + Breath*0.25 + Projection*0.20
 *            (computed from the four rounded scores, then clamped 0-100)
 *
 *  WEAKEST TWO: sort the four scores ascending; the two lowest are the
 *  focus areas (ties broken by weight: pitch, volume, breath, projection).
 *
 * This is a practice aid for a hackathon prototype, not a clinical measure.
 * ====================================================================== */

export const WEIGHTS = Object.freeze({
  pitch: 0.3,
  volume: 0.25,
  breath: 0.25,
  projection: 0.2,
});

export const METRIC_ORDER = ["pitch", "volume", "breath", "projection"];

export const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Linear map: `best` or better -> 100, `worst` or worse -> 10 (never a fake 0). */
function descending(value, best, worst) {
  const t = clamp01((value - best) / (worst - best));
  return 100 - 90 * t;
}

/* --------------------------- individual scores --------------------------- */
export function scorePitchSteadiness(f) {
  const spreadScore = descending(f.pitch.sigmaCents, 10, 120);
  const jitterScore = descending(f.pitch.jitterCents, 8, 80);
  const outlierShare = f.voicedFrames + f.octaveOutlierFrames > 0 ? f.octaveOutlierFrames / (f.voicedFrames + f.octaveOutlierFrames) : 0;
  const penalty = Math.min(0.4, 1.5 * outlierShare);
  return clamp((0.65 * spreadScore + 0.35 * jitterScore) * (1 - penalty));
}

export function scoreVolumeSteadiness(f) {
  const dbScore = descending(f.loudness.sigmaDb, 1.5, 9);
  const cvScore = descending(f.loudness.rmsCV, 0.1, 0.6);
  return clamp(0.75 * dbScore + 0.25 * cvScore);
}

export function scoreBreathControl(f) {
  const sustain = clamp01(f.sustain.longestRunSec / 8);
  const voicedFill = clamp01(f.voicedRatio / 0.85);
  const continuity = f.sustain.totalVoicedSec > 0 ? clamp01(f.sustain.longestRunSec / f.sustain.totalVoicedSec) : 0;
  const endurance = 1 - clamp01((f.sustain.enduranceDropDb - 3) / 9);
  return clamp(100 * (0.5 * sustain + 0.2 * voicedFill + 0.15 * continuity + 0.15 * endurance));
}

export function scoreProjection(f) {
  const clarityScore = clamp(((f.meanClarity - 0.6) / 0.4) * 100);
  // If the clip had no quiet frames to compare against, periodicity
  // (how clean/harmonic the voice is) stands in for signal-to-noise.
  const snrScore = f.loudness.snrDb === null ? clarityScore : clamp(((f.loudness.snrDb - 8) / (30 - 8)) * 100);
  const db = f.loudness.levelDbfs;
  let levelScore;
  if (db < -50) levelScore = 0;
  else if (db < -32) levelScore = ((db + 50) / 18) * 100; // ramp up
  else if (db <= -12) levelScore = 100; // comfortable band
  else levelScore = 100 - ((Math.min(db, -3) + 12) / 9) * 45; // gentle fall to 55
  const clipPenalty = Math.min(25, f.clipFraction * 2500); // 1% clipped => 25 pts
  return clamp(0.5 * snrScore + 0.25 * levelScore + 0.25 * clarityScore - clipPenalty);
}

/* ------------------------------ overall score ---------------------------- */
export function computeOverall(scores) {
  const raw =
    scores.pitch * WEIGHTS.pitch +
    scores.volume * WEIGHTS.volume +
    scores.breath * WEIGHTS.breath +
    scores.projection * WEIGHTS.projection;
  return Math.round(clamp(raw));
}

/** Two lowest metrics, weakest first. Ties resolved by weight (heavier first). */
export function pickWeakest(scores, count = 2) {
  return [...METRIC_ORDER]
    .sort((a, b) => scores[a] - scores[b] || WEIGHTS[b] - WEIGHTS[a])
    .slice(0, count);
}

/** Main entry: features -> full result object (language neutral). */
export function scoreVoice(features) {
  const scores = {
    pitch: Math.round(scorePitchSteadiness(features)),
    volume: Math.round(scoreVolumeSteadiness(features)),
    breath: Math.round(scoreBreathControl(features)),
    projection: Math.round(scoreProjection(features)),
  };
  const overall = computeOverall(scores);
  const weakest = pickWeakest(scores, 2);
  const strongest = [...METRIC_ORDER].sort((a, b) => scores[b] - scores[a])[0];

  // Observed practice range: 10th-90th percentile of reliable pitch values
  // (ignores stray frames). min/max are kept for display too.
  const lowHz = Math.round(features.pitch.p10Hz);
  const highHz = Math.round(Math.max(features.pitch.p90Hz, features.pitch.p10Hz));
  const medianHz = Math.round(features.pitch.medianHz);

  return {
    scores,
    overall,
    weakest,
    strongest,
    pitchRange: {
      minHz: Math.round(features.pitch.minHz),
      maxHz: Math.round(features.pitch.maxHz),
      medianHz,
      lowHz: Math.min(lowHz, medianHz),
      highHz: Math.max(highHz, medianHz),
    },
    features,
    createdAt: Date.now(),
  };
}

/** Score band for friendly, non-diagnostic labels (key into translations). */
export function scoreBand(score) {
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "developing";
  return "practice";
}
