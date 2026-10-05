import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AnimatedText } from "./AnimatedText";

/* ------------------------------------------------------------------ */
/* WELCOME POPUP                                                       */
/* After a real login / sign-up, shows "WELCOME TO SWAR SAATHI" and    */
/* the person's name, then closes itself (or on click / Esc).          */
/*                                                                     */
/* Usage:                                                              */
/*   import WelcomeHost, { announceWelcome } from "./WelcomePopup";    */
/*   announceWelcome(user.fullName, false)  // after login             */
/*   announceWelcome(user.fullName, true)   // after sign-up           */
/*   <WelcomeHost />  // render once, anywhere                         */
/* ------------------------------------------------------------------ */

export function announceWelcome(name, isNew = false) {
  window.dispatchEvent(new CustomEvent("swar-welcome", { detail: { name, isNew } }));
}

const DURATION = 4500;
const CONFETTI = ["#E8B94E", "#FF7A59", "#34D399", "#AECBCB", "#93AA8C"];

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 26 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 6 + Math.random() * 7,
      delay: Math.random() * 0.5,
      dur: 1.6 + Math.random() * 1.2,
      rot: Math.random() * 360,
      color: CONFETTI[i % CONFETTI.length],
      round: Math.random() > 0.5,
    }))
  );
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", borderRadius: 32 }}>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: 420, opacity: [0, 1, 1, 0], rotate: p.rot + 240 }}
          transition={{ delay: p.delay, duration: p.dur, ease: "easeIn" }}
          style={{ position: "absolute", top: 0, left: `${p.x}%`, width: p.size, height: p.size, background: p.color, borderRadius: p.round ? "50%" : 2 }}
        />
      ))}
    </div>
  );
}

export default function WelcomeHost() {
  const [info, setInfo] = useState(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onWelcome = (e) => setInfo({ ...e.detail, key: Date.now() });
    window.addEventListener("swar-welcome", onWelcome);
    return () => window.removeEventListener("swar-welcome", onWelcome);
  }, []);

  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => setInfo(null), DURATION);
    const onKey = (e) => e.key === "Escape" && setInfo(null);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [info]);

  const name = String(info?.name || "").trim();

  return (
    <AnimatePresence>
      {info && (
        <motion.div
          key={info.key}
          role="dialog"
          aria-modal="true"
          aria-live="polite"
          aria-label="Welcome to Swar Saathi"
          onClick={() => setInfo(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999, display: "grid", placeItems: "center", padding: 20,
            background: "rgba(20,32,47,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", cursor: "pointer",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: reduce ? 1 : 0.8, y: reduce ? 0 : 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", damping: 16, stiffness: 180 }}
            style={{
              position: "relative", width: "100%", maxWidth: 520, textAlign: "center", cursor: "default",
              background: "linear-gradient(160deg,#2C4A3E 0%,#233C32 100%)", color: "#F5F1E8",
              borderRadius: 32, padding: "44px 32px 34px", boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
              fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif', overflow: "hidden",
            }}
          >
            {!reduce && <Confetti />}
            <div aria-hidden="true" style={{ position: "absolute", top: -60, right: -50, width: 190, height: 190, borderRadius: "50%", background: "#E8B94E", opacity: 0.14 }} />
            <div aria-hidden="true" style={{ position: "absolute", bottom: -70, left: -50, width: 200, height: 200, borderRadius: "42% 58% 60% 40% / 48% 42% 58% 52%", background: "#93AA8C", opacity: 0.18 }} />

            <div style={{ position: "relative" }}>
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, stiffness: 160, delay: 0.15 }}
                style={{ width: 78, height: 78, margin: "0 auto 18px", borderRadius: "50%", background: "#F5F1E8", display: "grid", placeItems: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.25)", overflow: "hidden", padding: 8 }}
              >
                <img src="/swarsaathi-logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.textContent = "🎙️"; }} />
              </motion.div>

              <div style={{ fontSize: 13, letterSpacing: "0.28em", fontWeight: 700, opacity: 0.8, marginBottom: 10 }}>WELCOME TO</div>

              <AnimatedText
                as="h2"
                text="SWAR SAATHI"
                stagger={0.05}
                delay={0.25}
                highlight="SAATHI"
                highlightColor="#E8B94E"
                style={{ fontFamily: '"Outfit", system-ui, sans-serif', fontWeight: 800, fontSize: "clamp(32px,8vw,48px)", lineHeight: 1.1, letterSpacing: "0.04em" }}
              />

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                style={{ marginTop: 26 }}
              >
                <div style={{ fontFamily: '"Outfit", system-ui, sans-serif', fontSize: "clamp(22px,5vw,28px)", fontWeight: 700 }}>
                  {name ? <>Hello, <span style={{ color: "#E8B94E" }}>{name}</span> 👋</> : <>Hello there 👋</>}
                </div>
                <p style={{ margin: "10px auto 0", maxWidth: 360, lineHeight: 1.6, opacity: 0.85, fontSize: 15 }}>
                  {info.isNew ? "Your account is ready. Let's give every voice the practice it deserves." : "Good to see you again. Let's continue your journey."}
                </p>
                <button
                  onClick={() => setInfo(null)}
                  style={{ marginTop: 22, border: "none", borderRadius: 999, padding: "12px 28px", background: "#F5F1E8", color: "#1B1B18", fontWeight: 700, fontSize: 15, fontFamily: '"Outfit", system-ui, sans-serif', cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.25)" }}
                >
                  Let's begin →
                </button>
              </motion.div>
            </div>

            {/* auto-close timer bar */}
            <motion.div
              aria-hidden="true"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: DURATION / 1000, ease: "linear" }}
              style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "linear-gradient(90deg,#E8B94E,#FF7A59)", transformOrigin: "left" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}