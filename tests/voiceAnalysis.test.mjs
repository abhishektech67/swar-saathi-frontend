import { analyzeSamples } from "../src/voice/audioAnalyzer.js";
import { scoreVoice, computeOverall, pickWeakest, WEIGHTS } from "../src/voice/voiceScoring.js";
import { buildRecommendations } from "../src/voice/exerciseRecommendation.js";

const SR = 48000;
let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
// glottal-ish voice: harmonics with 1/n roll-off, optional pitch wobble & loudness wobble
function voice({ sec = 10, f0 = 200, pitchWobbleCents = 0, wobbleHz = 5, ampWobble = 0, amp = 0.2, holdSec = null, lead = 0.4, noise = 0.003 }) {
  const n = Math.floor(sec * SR); const x = new Float32Array(n); let ph = 0;
  const end = holdSec == null ? sec : Math.min(sec, lead + holdSec);
  for (let i = 0; i < n; i++) {
    const t = i / SR; let s = 0;
    if (t >= lead && t < end) {
      const f = f0 * Math.pow(2, (pitchWobbleCents / 1200) * Math.sin(2 * Math.PI * wobbleHz * t) + (pitchWobbleCents ? (rnd() - 0.5) * pitchWobbleCents / 600 : 0));
      ph += 2 * Math.PI * f / SR;
      const env = Math.min(1, (t - lead) / 0.15) * Math.min(1, (end - t) / 0.15);
      const a = amp * env * (1 + ampWobble * Math.sin(2 * Math.PI * 0.7 * t) + ampWobble * 0.5 * (rnd() - 0.5));
      for (let h = 1; h <= 8; h++) s += (a / h) * Math.sin(h * ph);
    }
    x[i] = s + (rnd() - 0.5) * 2 * noise;
  }
  return x;
}
const run = (name, x) => {
  const t0 = performance.now();
  const f = analyzeSamples(x, SR); const ms = (performance.now() - t0).toFixed(0);
  if (!f.ok) { console.log(name.padEnd(26), "ERROR", f.code, `(${ms}ms)`); return null; }
  const r = scoreVoice(f);
  console.log(name.padEnd(26), JSON.stringify(r.scores), "overall", r.overall, "weakest", r.weakest.join("+"),
    `| f0 med ${r.pitchRange.medianHz} [${r.pitchRange.minHz}-${r.pitchRange.maxHz}] run ${f.sustain.longestRunSec.toFixed(1)}s snr ${f.loudness.snrDb===null?"n/a":f.loudness.snrDb.toFixed(0)}dB clar ${f.meanClarity.toFixed(2)} (${ms}ms)`);
  return r;
};
console.log("--- pitch detection accuracy (steady) ---");
for (const f0 of [95, 120, 180, 220, 300, 400]) { const r = run(`steady ${f0}Hz`, voice({ f0 })); }
console.log("--- comparisons ---");
const steady = run("steady 200Hz", voice({ f0: 200 }));
const wobbly = run("pitch wobble 80c", voice({ f0: 200, pitchWobbleCents: 80 }));
const loudVar = run("loudness varies", voice({ f0: 200, ampWobble: 0.6 }));
const short = run("hold 4s only", voice({ f0: 200, holdSec: 4 }));
const long = run("hold 9s", voice({ f0: 200, holdSec: 9 }));
const quiet = run("quiet (amp .02)", voice({ f0: 200, amp: 0.02, noise: 0.0008 }));
const faint = run("faint (amp .012)", voice({ f0: 200, amp: 0.012, noise: 0.0004 }));
const loud = run("loud (amp .4)", voice({ f0: 200, amp: 0.4 }));
const hot = run("clipping (amp 1.6)", voice({ f0: 200, amp: 1.6 }).map(v => Math.max(-1, Math.min(1, v))));
console.log("--- bad recordings ---");
run("silence", new Float32Array(SR * 10));
run("tiny noise", Float32Array.from({ length: SR * 10 }, () => (rnd() - 0.5) * 0.004));
run("loud white noise", Float32Array.from({ length: SR * 10 }, () => (rnd() - 0.5) * 0.3));
run("too short 1.5s", voice({ sec: 1.5 }));
run("mostly silence (1s voice)", voice({ f0: 200, holdSec: 1 }));
run("noisy room", voice({ f0: 200, amp: 0.05, noise: 0.03 }));
console.log("--- assertions ---");
const ok = (c, m) => { console.log(c ? "PASS" : "FAIL", m); if (!c) process.exitCode = 1; };
ok(steady.scores.pitch > wobbly.scores.pitch + 10, `pitch score drops with wobble (${steady.scores.pitch} > ${wobbly.scores.pitch})`);
ok(steady.scores.volume > loudVar.scores.volume + 10, `volume score drops with loudness variation (${steady.scores.volume} > ${loudVar.scores.volume})`);
ok(long.scores.breath > short.scores.breath + 15, `breath score drops with shorter hold (${long.scores.breath} > ${short.scores.breath})`);
ok(steady.scores.projection > faint.scores.projection + 10, `projection responds to energy (normal ${steady.scores.projection} vs faint ${faint.scores.projection})`);
ok(hot.scores.projection < loud.scores.projection, `clipping not rewarded (${hot.scores.projection} < ${loud.scores.projection})`);
const s = { pitch: 55, volume: 82, breath: 48, projection: 75 };
ok(computeOverall(s) === Math.round(55*.3+82*.25+48*.25+75*.2), `overall = weighted ${computeOverall(s)}`);
ok(Object.values(WEIGHTS).reduce((a,b)=>a+b,0).toFixed(2)==="1.00" && WEIGHTS.pitch===.3 && WEIGHTS.volume===.25 && WEIGHTS.breath===.25 && WEIGHTS.projection===.2, "weights 30/25/25/20");
ok(pickWeakest(s).join() === "breath,pitch", "weakest two = breath, pitch");
const fake = scoreVoice(steady.features); fake.scores = s; fake.weakest = pickWeakest(s);
const recs = buildRecommendations({ ...steady, scores: s, weakest: pickWeakest(s) }, "en");
ok(recs.every(r => ["breath","pitch"].includes(r.weakness)) && recs[0].weakness === "breath", "recommendations only for weakest two, weakest first");
const pr = steady.pitchRange; 
ok(recs.some(r => r.instruction.includes(String(pr.medianHz)) && r.instruction.includes(`${pr.lowHz}–${pr.highHz}`)), `instructions use observed range ${pr.lowHz}-${pr.highHz}, target ${pr.medianHz}`);
ok(pr.medianHz >= pr.lowHz && pr.medianHz <= pr.highHz, "target inside observed range");
const hi = buildRecommendations({ ...steady, scores: s, weakest: pickWeakest(s) }, "hi");
ok(/[\u0900-\u097F]/.test(hi[0].instruction) && hi[0].instruction.includes("Hz") && !/\{\w+\}/.test(hi.map(r=>r.instruction).join("")), "Hindi text resolved, placeholders filled");
console.log(recs[0].title, "|", recs[0].instruction, "|", recs[0].duration, recs[0].target, "diff", recs[0].difficulty);
// difficulty adaptation
const low = buildRecommendations({ ...steady, scores: {pitch:30,volume:90,breath:30,projection:90}, weakest:["pitch","breath"] }, "en");
const high = buildRecommendations({ ...steady, scores: {pitch:80,volume:90,breath:80,projection:90}, weakest:["pitch","breath"] }, "en");
ok(low[0].difficulty===1 && high[0].difficulty===3, "difficulty adapts to score (1 for low, 3 for high)");
