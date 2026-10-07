/* ======================================================================
 * Swar Saathi — exerciseRecommendation.js
 * ----------------------------------------------------------------------
 * Deterministic personalisation (no randomness, no network, no AI call):
 *
 *  1. WEAKEST TWO   voiceScoring.pickWeakest() sorts the four scores
 *                   ascending and returns the two lowest.
 *  2. DIFFICULTY    per weakness, from that metric's own score:
 *                     score < 45  -> level 1 (shorter holds, fewer reps)
 *                     45 - 74     -> level 2
 *                     >= 75       -> level 3 (longer control tasks)
 *                   Changes are deliberately small (e.g. 4 s -> 8 s hold).
 *  3. SELECTION     for each weakness choose the 2 library exercises whose
 *                   baseDifficulty is closest to that level. The weakest
 *                   area is listed first, then the second weakest.
 *  4. PITCH RANGE   {target} = the median of today's reliable pitch values
 *                   (always inside the observed range), {low}/{high} = the
 *                   10th-90th percentile range. It is described as an
 *                   "observed practice range", never an ideal pitch.
 *
 * Output objects follow the structure
 *   { id, title, weakness, description, instruction, difficulty,
 *     duration, target }
 * and are rebuilt on language change so Hindi/English switch instantly
 * without re-analysing the recording.
 * ====================================================================== */

import { EXERCISES } from "./exerciseLibrary.js";

export function difficultyFor(score) {
  if (score < 45) return 1;
  if (score < 75) return 2;
  return 3;
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

const MIN_UNIT = { en: "min", hi: "मिनट" };

/**
 * @param {object} result  output of scoreVoice()
 * @param {"en"|"hi"} lang
 * @param {number} perWeakness  exercises per weak area (default 2)
 */
export function buildRecommendations(result, lang = "en", perWeakness = 2) {
  const L = lang === "hi" ? "hi" : "en";
  const { scores, weakest, pitchRange } = result;
  const out = [];

  for (const weakness of weakest) {
    const level = difficultyFor(scores[weakness]);
    const byCloseness = EXERCISES.filter((e) => e.weakness === weakness)
      .sort((a, b) => Math.abs(a.baseDifficulty - level) - Math.abs(b.baseDifficulty - level) || a.baseDifficulty - b.baseDifficulty);
    // always offer a mix: the best classic exercise AND the best sound game (snake, dog bark ...)
    const classic = byCloseness.filter((e) => !e.game);
    const games = byCloseness.filter((e) => e.game);
    const picks = [];
    if (classic[0]) picks.push(classic[0]);
    if (games[0]) picks.push(games[0]);
    for (const e of byCloseness) { if (picks.length >= perWeakness) break; if (!picks.includes(e)) picks.push(e); }
    picks.length = Math.min(picks.length, Math.max(perWeakness, 1));

    for (const ex of picks) {
      const p = ex.levels[level];
      const vars = {
        target: pitchRange.medianHz,
        low: pitchRange.lowHz,
        high: pitchRange.highHz,
        hold: p.hold,
        reps: p.reps,
      };
      out.push({
        id: ex.id,
        title: ex.title[L],
        weakness,
        description: ex.description[L],
        instruction: fill(ex.instruction[L], vars),
        difficulty: level,
        duration: `${p.mins} ${MIN_UNIT[L]}`,
        target: fill(ex.targetTpl[L], vars),
        sound: ex.sound,
        demoText: ex.demoText ? ex.demoText[L] : undefined,
        game: Boolean(ex.game),
      });
    }
  }
  return out;
}
