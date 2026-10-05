import { motion, useReducedMotion } from "framer-motion";
import { AnimatedText } from "./AnimatedText";

/* ------------------------------------------------------------------ */
/* Swar Saathi — landing page (replaces the old HomePage)              */
/* Props: onGetStarted(role?)  onLogin()                               */
/* Self-contained: own fonts, styles and animations.                   */
/* ------------------------------------------------------------------ */

const h = {
  bg: "#2C4A3E", bgDeep: "#233C32", cream: "#F5F1E8", sage: "#5C7A63", slate: "#4E6B72", rust: "#B4531A",
  butter: "#E8B94E", dustySage: "#93AA8C", paleBlue: "#AECBCB", ink: "#1B1B18", canvas: "#FFFBF5",
  navy: "#1E293B", soft: "#6B7280", line: "#E7DFD0", coral: "#FF7A59", mint: "#34D399",
};
const display = '"Outfit", system-ui, -apple-system, "Segoe UI", sans-serif';
const bodyFont = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
const wrap = { maxWidth: 1180, margin: "0 auto", padding: "0 20px" };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
.ss * { box-sizing: border-box; }
.ss { font-family: ${bodyFont}; color: ${h.navy}; background: ${h.canvas}; scroll-behavior: smooth; overflow-x: hidden; }
.ss button { font-family: ${display}; }
@keyframes ssBar { 0%,100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
@keyframes ssFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes ssDrift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,-22px) scale(1.06); } }
@keyframes ssShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@keyframes ssBeat { 0%,100% { transform: scale(1); } 15% { transform: scale(1.3); } 30% { transform: scale(1); } 45% { transform: scale(1.22); } 60% { transform: scale(1); } }
.ss-heart { display: inline-block; animation: ssBeat 1.6s ease-in-out infinite; }
.ss-bar { transform-origin: bottom; animation: ssBar 1.3s ease-in-out infinite; }
.ss-float { animation: ssFloat 5s ease-in-out infinite; }
.ss-drift { animation: ssDrift 11s ease-in-out infinite; }
.ss-lift { transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s cubic-bezier(.22,1,.36,1); }
.ss-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(30,41,59,.16) !important; }
.ss-btn { transition: transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s; cursor: pointer; }
.ss-btn:hover { transform: translateY(-2px); }
.ss-btn:active { transform: translateY(0); }
.ss a:focus-visible, .ss button:focus-visible { outline: 3px solid ${h.butter}; outline-offset: 3px; }
.ss-navlinks { display: flex; gap: 6px; }
@media (max-width: 780px) { .ss-navlinks { display: none; } .ss-hide-sm { display: none !important; } }
@media (prefers-reduced-motion: reduce) {
  .ss-bar, .ss-float, .ss-drift, .ss-heart { animation: none !important; }
  .ss-lift, .ss-btn { transition: none !important; }
}
`;

/* scroll-reveal wrapper */
function Reveal({ children, delay = 0, y = 28, style }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Waveform({ bars = 24, height = 70, color = h.butter }) {
  const pattern = [0.45, 0.8, 0.6, 1, 0.5, 0.9, 0.35, 0.75, 0.55, 0.95, 0.4, 0.7];
  return (
    <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 5, height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="ss-bar"
          style={{ width: 6, height: `${pattern[i % pattern.length] * 100}%`, borderRadius: 4, background: color, opacity: 0.9, animationDelay: `${(i % 9) * 0.11}s` }}
        />
      ))}
    </div>
  );
}

/* ------------------------------- data ------------------------------- */
const ROLES = [
  { role: "PATIENT", label: "Patient", tag: "For me", icon: "🗣️", color: h.sage, desc: "Practice exercises, record your voice, chat with your AI coach and watch your progress grow." },
  { role: "THERAPIST", label: "Therapist", tag: "For my patients", icon: "🩺", color: h.slate, desc: "Assign exercises, review acoustic analytics, and get AI progress reports for every patient." },
  { role: "CAREGIVER", label: "Caregiver", tag: "For someone I care for", icon: "💛", color: h.rust, desc: "Follow therapy progress, send updates to the care team and get simple home-support tips." },
];

const STEPS = [
  { n: "1", title: "Create your account", text: "Sign up as a patient, therapist or caregiver in under a minute." },
  { n: "2", title: "Practice & record", text: "Do short guided exercises and record your voice right in the browser." },
  { n: "3", title: "Get feedback & grow", text: "See instant scores, trends, streaks and AI guidance after every session." },
];

const FEATURES = [
  { icon: "🎙️", title: "Instant voice analysis", text: "Pronunciation, clarity and pitch feedback straight from your browser — nothing to install.", tint: "#FFE7DE" },
  { icon: "🤖", title: "AI speech coach", text: "Ask questions any time and get friendly, health-aware guidance based on your own practice.", tint: "#E4F9EF" },
  { icon: "🎮", title: "Gamified exercises", text: "Points, streaks and badges turn daily home practice into a habit worth keeping.", tint: "#FBF0DC" },
  { icon: "💧", title: "Wellness check-ins", text: "Track mood, tiredness, sleep, water and throat comfort so practice fits how you feel.", tint: "#E7EAF0" },
  { icon: "📈", title: "Progress you can see", text: "Clear trend charts and AI-written reports for therapists, patients and families.", tint: "#FFE7DE" },
  { icon: "🤝", title: "Caregiver collaboration", text: "Families share updates with the therapy team so no one is left guessing.", tint: "#E4F9EF" },
];

/* ------------------------------ sections ----------------------------- */
function Nav({ onLogin, onGetStarted }) {
  const pill = { background: "transparent", border: "none", color: h.cream, fontWeight: 600, fontSize: 14.5, padding: "8px 14px", borderRadius: 99, cursor: "pointer", fontFamily: bodyFont, opacity: 0.9 };
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(44,74,62,0.88)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid rgba(245,241,232,0.14)" }}>
      <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: display, fontWeight: 700, fontSize: 22, color: h.cream }}>
          <span style={{ width: 36, height: 36, borderRadius: "50%", background: h.cream, display: "grid", placeItems: "center", overflow: "hidden", padding: 3 }}>
            <img src="/swarsaathi-logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => (e.currentTarget.style.display = "none")} />
          </span>
          <span>Swar <span style={{ color: h.butter }}>Saathi</span></span>
        </div>
        <div className="ss-navlinks">
          <button style={pill} onClick={() => scrollTo("how")}>How it works</button>
          <button style={pill} onClick={() => scrollTo("features")}>Features</button>
          <button style={pill} onClick={() => scrollTo("coach")}>AI coach</button>
          <button style={pill} onClick={() => scrollTo("roles")}>Who it's for</button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ss-btn" onClick={onLogin} style={{ background: "transparent", color: h.cream, border: "1.5px solid rgba(245,241,232,0.5)", borderRadius: 999, padding: "10px 20px", fontWeight: 700, fontSize: 14.5 }}>Log in</button>
          <button className="ss-btn" onClick={() => onGetStarted("PATIENT")} style={{ background: h.cream, color: h.ink, border: "1.5px solid transparent", borderRadius: 999, padding: "10px 20px", fontWeight: 700, fontSize: 14.5, boxShadow: "0 8px 20px rgba(0,0,0,0.22)" }}>Get started</button>
        </div>
      </div>
    </div>
  );
}

function PreviewCard() {
  const metric = (label, value, color) => (
    <div style={{ flex: 1, background: "rgba(245,241,232,0.1)", border: "1px solid rgba(245,241,232,0.18)", borderRadius: 18, padding: "12px 14px" }}>
      <div style={{ fontSize: 11.5, opacity: 0.75 }}>{label}</div>
      <div style={{ fontFamily: display, fontWeight: 800, fontSize: 24, color, marginTop: 2 }}>{value}</div>
    </div>
  );
  return (
    <div className="ss-float" style={{ position: "relative" }}>
      <div style={{ background: "linear-gradient(160deg,rgba(245,241,232,0.16),rgba(245,241,232,0.06))", border: "1px solid rgba(245,241,232,0.25)", borderRadius: 30, padding: 24, color: h.cream, boxShadow: "0 30px 70px rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: display, fontWeight: 700 }}>🎙️ Live voice practice</div>
          <span style={{ fontSize: 11, background: "rgba(232,185,78,0.2)", color: h.butter, padding: "4px 10px", borderRadius: 99, fontWeight: 700 }}>Sample preview</span>
        </div>
        <div style={{ display: "grid", placeItems: "center", background: "rgba(0,0,0,0.18)", borderRadius: 20, padding: "18px 10px" }}>
          <Waveform bars={26} height={72} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {metric("Pronunciation", "86%", h.butter)}
          {metric("Clarity", "78%", h.mint)}
          {metric("Streak", "5 🔥", h.cream)}
        </div>
        <div style={{ marginTop: 14, fontSize: 13, background: "rgba(52,211,153,0.16)", borderRadius: 14, padding: "10px 14px", lineHeight: 1.5 }}>
          ✨ Nice and steady! Try one more slow, easy-onset round.
        </div>
      </div>
    </div>
  );
}

function Hero({ onGetStarted, onLogin }) {
  const badge = { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,241,232,0.12)", border: "1px solid rgba(245,241,232,0.28)", color: h.cream, borderRadius: 99, padding: "7px 16px", fontSize: 13.5, fontWeight: 600 };
  return (
    <div style={{ position: "relative", overflow: "hidden", background: `radial-gradient(1200px 600px at 80% -10%, #3D6454 0%, ${h.bg} 55%, ${h.bgDeep} 100%)` }}>
      <div aria-hidden="true" className="ss-drift" style={{ position: "absolute", top: -90, right: -70, width: 300, height: 300, borderRadius: "50%", background: h.butter, opacity: 0.13 }} />
      <div aria-hidden="true" className="ss-drift" style={{ position: "absolute", top: "40%", left: -100, width: 260, height: 260, borderRadius: "50%", background: h.paleBlue, opacity: 0.12, animationDelay: "-4s" }} />
      <div aria-hidden="true" className="ss-drift" style={{ position: "absolute", bottom: 40, right: "18%", width: 170, height: 170, borderRadius: "42% 58% 60% 40% / 48% 42% 58% 52%", background: h.dustySage, opacity: 0.16, animationDelay: "-7s" }} />

      <Nav onLogin={onLogin} onGetStarted={onGetStarted} />

      <div style={{ ...wrap, position: "relative", zIndex: 1, padding: "70px 20px 130px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 48 }}>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={badge}>
            ✨ Free · AI-assisted · Works in your browser
          </motion.div>

          <div style={{ marginTop: 22 }}>
            <AnimatedText
              text={"Every voice deserves\nto be heard."}
              align="left"
              highlight="heard"
              highlightColor={h.butter}
              delay={0.2}
              style={{ fontFamily: display, fontWeight: 800, fontSize: "clamp(36px,6vw,62px)", lineHeight: 1.08, color: h.cream }}
            />
          </div>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} style={{ fontSize: 17.5, lineHeight: 1.65, color: h.cream, opacity: 0.88, maxWidth: 520, margin: "28px 0 30px" }}>
            Swar Saathi brings speech therapy home. Patients practise and get instant feedback, therapists track real progress, and families stay connected — all in one place.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.6 }} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="ss-btn" onClick={() => onGetStarted("PATIENT")} style={{ background: h.butter, color: h.ink, border: "none", borderRadius: 999, padding: "15px 30px", fontWeight: 800, fontSize: 16.5, boxShadow: "0 12px 28px rgba(232,185,78,0.35)" }}>
              Get started free →
            </button>
            <button className="ss-btn" onClick={onLogin} style={{ background: "transparent", color: h.cream, border: "1.5px solid rgba(245,241,232,0.5)", borderRadius: 999, padding: "15px 28px", fontWeight: 700, fontSize: 16.5 }}>
              I have an account
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7, duration: 0.8 }} style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 28, color: h.cream, opacity: 0.8, fontSize: 13.5 }}>
            <span>✓ No downloads</span><span>✓ Secure login</span><span>✓ Phone & laptop friendly</span>
          </motion.div>
        </div>

        <motion.div className="ss-hide-sm-keep" initial={{ opacity: 0, scale: 0.94, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ flex: "1 1 340px", minWidth: 0, maxWidth: 480 }}>
          <PreviewCard />
        </motion.div>
      </div>

      <svg viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", bottom: -2, left: 0, display: "block", width: "100%", height: 90 }}>
        <path d="M0,64 C240,110 480,10 720,32 C960,54 1200,104 1440,56 L1440,110 L0,110 Z" fill={h.canvas} />
      </svg>
    </div>
  );
}

function SectionTitle({ eyebrow, title, text }) {
  return (
    <Reveal style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
      <div style={{ color: h.rust, fontWeight: 800, letterSpacing: "0.16em", fontSize: 12.5, marginBottom: 10 }}>{eyebrow}</div>
      <h2 style={{ fontFamily: display, fontWeight: 800, fontSize: "clamp(28px,4.5vw,40px)", margin: 0, lineHeight: 1.15 }}>{title}</h2>
      {text && <p style={{ color: h.soft, lineHeight: 1.7, fontSize: 16.5, margin: "14px 0 0" }}>{text}</p>}
    </Reveal>
  );
}

function Roles({ onGetStarted }) {
  return (
    <div id="roles" style={{ ...wrap, padding: "30px 20px 80px" }}>
      <SectionTitle eyebrow="WHO IT'S FOR" title="Choose your path" text="One platform, built around the three people in every speech therapy journey." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 22 }}>
        {ROLES.map((r, i) => (
          <Reveal key={r.role} delay={i * 0.1}>
            <button
              className="ss-lift"
              onClick={() => onGetStarted(r.role)}
              style={{ position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer", border: "none", borderRadius: 28, padding: 28, minHeight: 250, background: `linear-gradient(155deg, ${r.color} 0%, ${r.color}E6 100%)`, boxShadow: "0 12px 28px rgba(30,41,59,0.16)", display: "flex", flexDirection: "column", gap: 14, color: h.cream }}
            >
              <div aria-hidden="true" style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
              <div style={{ position: "relative", width: 56, height: 56, borderRadius: "50%", background: h.cream, display: "grid", placeItems: "center", fontSize: 26, boxShadow: "0 6px 16px rgba(0,0,0,0.2)" }}>{r.icon}</div>
              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: display, fontWeight: 800, fontSize: 26 }}>{r.label}</div>
                <p style={{ margin: "10px 0 0", lineHeight: 1.6, opacity: 0.92, fontSize: 15 }}>{r.desc}</p>
              </div>
              <div style={{ position: "relative", marginTop: "auto", fontWeight: 700, fontSize: 15 }}>{r.tag} →</div>
            </button>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div id="how" style={{ background: "#fff", borderTop: `1px solid ${h.line}`, borderBottom: `1px solid ${h.line}` }}>
      <div style={{ ...wrap, padding: "80px 20px" }}>
        <SectionTitle eyebrow="HOW IT WORKS" title="From first hello to steady progress" text="Three simple steps to build a daily practice habit." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22 }}>
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div style={{ position: "relative", padding: "28px 26px", borderRadius: 26, background: h.canvas, border: `1.5px solid ${h.line}`, height: "100%" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: h.bg, color: h.butter, display: "grid", placeItems: "center", fontFamily: display, fontWeight: 800, fontSize: 20, marginBottom: 16 }}>{s.n}</div>
                <h3 style={{ margin: "0 0 8px", fontFamily: display, fontSize: 21 }}>{s.title}</h3>
                <p style={{ margin: 0, color: h.soft, lineHeight: 1.65, fontSize: 15 }}>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <div id="features" style={{ ...wrap, padding: "90px 20px" }}>
      <SectionTitle eyebrow="FEATURES" title="Everything speech therapy needs, in one place" text="Designed to keep patients motivated and give care teams clear, useful insight." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 0.1}>
            <div className="ss-lift" style={{ height: "100%", background: "#fff", border: `1.5px solid ${h.line}`, borderRadius: 26, padding: 26, boxShadow: "0 6px 20px rgba(30,41,59,0.06)" }}>
              <div style={{ width: 54, height: 54, borderRadius: 18, background: f.tint, display: "grid", placeItems: "center", fontSize: 26, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 8px", fontFamily: display, fontSize: 20 }}>{f.title}</h3>
              <p style={{ margin: 0, color: h.soft, lineHeight: 1.65, fontSize: 15 }}>{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function CoachShowcase({ onGetStarted }) {
  const bubble = (mine, text) => (
    <div style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "88%", padding: "11px 15px", borderRadius: 18, fontSize: 14.5, lineHeight: 1.55, background: mine ? h.butter : "rgba(245,241,232,0.14)", color: mine ? h.ink : h.cream, border: mine ? "none" : "1px solid rgba(245,241,232,0.2)" }}>
      {text}
    </div>
  );
  return (
    <div id="coach" style={{ background: `linear-gradient(135deg, ${h.navy} 0%, #14202F 100%)`, color: h.cream, position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="ss-drift" style={{ position: "absolute", top: -80, left: -60, width: 260, height: 260, borderRadius: "50%", background: h.mint, opacity: 0.1 }} />
      <div style={{ ...wrap, padding: "90px 20px", display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center", position: "relative" }}>
        <Reveal style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div style={{ color: h.butter, fontWeight: 800, letterSpacing: "0.16em", fontSize: 12.5, marginBottom: 10 }}>MEET YOUR AI COACH</div>
          <h2 style={{ fontFamily: display, fontWeight: 800, fontSize: "clamp(28px,4.5vw,40px)", margin: 0, lineHeight: 1.15 }}>A caring guide for every practice session</h2>
          <p style={{ lineHeight: 1.7, fontSize: 16.5, opacity: 0.85, margin: "16px 0 22px", maxWidth: 480 }}>
            Ask about breathing, voice care or tricky sounds and get short, friendly answers based on your own progress and wellness check-ins. It supports your therapist — it never replaces them, and it points you to urgent care when something sounds serious.
          </p>
          <button className="ss-btn" onClick={() => onGetStarted("PATIENT")} style={{ background: h.butter, color: h.ink, border: "none", borderRadius: 999, padding: "14px 28px", fontWeight: 800, fontSize: 16 }}>Try it free →</button>
        </Reveal>
        <Reveal delay={0.15} style={{ flex: "1 1 360px", minWidth: 0, maxWidth: 480 }}>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(245,241,232,0.2)", borderRadius: 28, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <strong style={{ fontFamily: display }}>🤖 Swar Saathi Coach</strong>
              <span style={{ fontSize: 11, color: h.butter, fontWeight: 700 }}>Example chat</span>
            </div>
            {bubble(true, "My throat feels dry after practice. What should I do?")}
            {bubble(false, "Sip some water and keep today's session gentle. Try 2 minutes of soft humming instead of loud voice work. If it lasts more than 2–3 weeks, please see a doctor.")}
            {bubble(true, "Thanks! Can you give me a quick warm-up?")}
            {bubble(false, "Sure! Breathe in for 4 counts, out on a soft 'sss' for 6. Repeat 5 times, then hum gently on 'mmm'. 💛")}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function FinalCta({ onGetStarted, onLogin }) {
  return (
    <div style={{ ...wrap, padding: "90px 20px 70px" }}>
      <Reveal>
        <div style={{ position: "relative", overflow: "hidden", textAlign: "center", borderRadius: 36, padding: "58px 24px", background: `linear-gradient(140deg, ${h.bg} 0%, ${h.bgDeep} 100%)`, color: h.cream, boxShadow: "0 24px 60px rgba(35,60,50,0.3)" }}>
          <div aria-hidden="true" className="ss-drift" style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, borderRadius: "50%", background: h.butter, opacity: 0.14 }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 18 }}><Waveform bars={18} height={46} /></div>
            <h2 style={{ fontFamily: display, fontWeight: 800, fontSize: "clamp(28px,5vw,42px)", margin: "0 0 12px" }}>Ready to find your voice?</h2>
            <p style={{ maxWidth: 520, margin: "0 auto 26px", lineHeight: 1.65, opacity: 0.88, fontSize: 16.5 }}>Join Swar Saathi today — free to start, simple to use, and built with care.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="ss-btn" onClick={() => onGetStarted("PATIENT")} style={{ background: h.butter, color: h.ink, border: "none", borderRadius: 999, padding: "15px 32px", fontWeight: 800, fontSize: 16.5 }}>Create free account</button>
              <button className="ss-btn" onClick={onLogin} style={{ background: "transparent", color: h.cream, border: "1.5px solid rgba(245,241,232,0.5)", borderRadius: 999, padding: "15px 28px", fontWeight: 700, fontSize: 16.5 }}>Log in</button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

const TEAM = ["Komal", "Abhishek", "Aaquib", "Luvvkussh", "Bhoomi"];

function Credits() {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${h.bg} 0%, ${h.bgDeep} 100%)`, color: h.cream }}>
      <div aria-hidden="true" className="ss-drift" style={{ position: "absolute", top: -70, left: -50, width: 220, height: 220, borderRadius: "50%", background: h.butter, opacity: 0.1 }} />
      <div aria-hidden="true" className="ss-drift" style={{ position: "absolute", bottom: -80, right: -40, width: 240, height: 240, borderRadius: "42% 58% 60% 40% / 48% 42% 58% 52%", background: h.dustySage, opacity: 0.14, animationDelay: "-5s" }} />
      <Reveal>
        <div style={{ ...wrap, position: "relative", textAlign: "center", padding: "54px 20px 50px" }}>
          <div style={{ fontFamily: display, fontWeight: 600, fontSize: "clamp(16px,3vw,20px)", letterSpacing: "0.04em", opacity: 0.9 }}>
            Made with LOVE <span className="ss-heart" role="img" aria-label="love">❤️</span> by
          </div>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: "clamp(30px,6vw,48px)", lineHeight: 1.1, margin: "10px 0 24px", color: h.butter }}>
            Tech Titans
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            {TEAM.map((name) => (
              <span
                key={name}
                className="ss-lift"
                style={{ background: "rgba(245,241,232,0.12)", border: "1px solid rgba(245,241,232,0.3)", borderRadius: 999, padding: "10px 22px", fontFamily: display, fontWeight: 700, fontSize: 16, color: h.cream, boxShadow: "0 6px 16px rgba(0,0,0,0.18)" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ borderTop: `1px solid ${h.line}`, background: "#fff" }}>
      <div style={{ ...wrap, padding: "30px 20px", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: 20 }}>Swar <span style={{ color: h.rust }}>Saathi</span></div>
        <p style={{ margin: 0, color: h.soft, fontSize: 13, lineHeight: 1.6, maxWidth: 640 }}>
          Swar Saathi supports speech practice and is not a substitute for professional medical advice, diagnosis or treatment. Scores are simple demo measurements. In an emergency, call 112 or 108.
        </p>
      </div>
    </div>
  );
}

export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="ss">
      <style>{css}</style>
      <Hero onGetStarted={onGetStarted} onLogin={onLogin} />
      <Roles onGetStarted={onGetStarted} />
      <HowItWorks />
      <Features />
      <CoachShowcase onGetStarted={onGetStarted} />
      <FinalCta onGetStarted={onGetStarted} onLogin={onLogin} />
      <Credits />
      <Footer />
    </div>
  );
}