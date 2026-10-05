import { useEffect, useMemo, useRef, useState } from "react";
import { AiCoachChat, WellnessCheckIn, AiReportPanel } from "./AiFeatures";
import LandingPage from "./LandingPage";
import WelcomeHost, { announceWelcome } from "./WelcomePopup";

const API_URL = "https://swar-saathi-backend.onrender.com";

/* ------------------------------------------------------------------ */
/* Design tokens — matched to the Swar Saathi brand: deep navy for      */
/* trust and headings, a bright teal for the brand accent, and a warm  */
/* coral for energy/encouragement, echoed in the logomark.             */
/* ------------------------------------------------------------------ */
/* ---------------------------------------------------------------------- */
/* WARM WELLNESS — calm, human, premium therapy-platform palette: deep    */
/* navy for trust, soft mint for progress, soft coral used sparingly for  */
/* CTAs, on a warm cream canvas. Soft diffused shadows and light borders  */
/* replace the old hard "sticker" offsets. Token names are kept the same */
/* so every component below (Button, Section, ScoreCard, etc.) restyles  */
/* automatically.                                                        */
/* ---------------------------------------------------------------------- */
const theme = {
  colors: {
    canvas: "#FFFBF5",      // Warm off-white / cream
    surface: "#FFFFFF",
    surfaceAlt: "#F6F1E7",  // Soft beige
    navy: "#1E293B",        // Deep navy — primary, typography & structure
    navyDark: "#14202F",
    ink: "#1E293B",
    inkSoft: "#6B7280",     // Muted warm gray
    inkFaint: "#9CA3AF",
    line: "#E7DFD0",        // Soft warm border, not chunky dark ink
    lineSoft: "#EFE8DA",
    accent: "#FF7A59",      // Soft coral — used sparingly, primary CTA
    accentSoft: "#FFE7DE",
    teal: "#34D399",        // Soft mint green — secondary, recovery/progress
    tealDark: "#0F9D6E",
    tealSoft: "#E4F9EF",    // Very pale mint
    coral: "#FF7A59",       // Soft coral (kept as its own token for reuse)
    coralDark: "#C75A3D",
    coralSoft: "#FFE7DE",
    gold: "#F2B441",        // Warm supporting amber, used lightly
    goldSoft: "#FBF0DC",
    danger: "#E4574C",
    dangerSoft: "#FBE6E3",
    success: "#10B981",
  },
  radius: { sm: 10, md: 18, lg: 26, xl: 32, pill: 999 },
  border: "1.5px",
  // Soft, diffused shadows — calm and premium rather than a hard offset.
  shadow: "0 10px 30px rgba(30,41,59,0.10)",
  shadowSoft: "0 6px 20px rgba(30,41,59,0.07)",
  shadowHover: "0 16px 34px rgba(30,41,59,0.14)",
  shadowActive: "0 4px 12px rgba(30,41,59,0.10)",
  ease: "cubic-bezier(0.22, 1, 0.36, 1)", // smooth, gentle settle — no overshoot
  font: {
    display: '"Outfit", system-ui, -apple-system, "Segoe UI", sans-serif',
    body: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
  },
};

/* ---------------------------------------------------------------------- */
/* HERO PALETTE — a separate, deliberately darker set used only by the    */
/* marketing homepage hero: deep forest green, three desaturated card     */
/* tones (sage / slate-teal / rust), cream type, and a sandy illustration */
/* accent set. Kept apart from the main `theme` so the rest of the app    */
/* (dashboards, forms) stays on the light warm palette.                   */
/* ---------------------------------------------------------------------- */
const hero = {
  bg: "#2C4A3E",
  bgDeep: "#233C32",
  cream: "#F5F1E8",
  sage: "#5C7A63",
  sageDark: "#465F4C",
  slate: "#4E6B72",
  slateDark: "#3B535A",
  rust: "#B4531A",
  rustDark: "#8C4014",
  butter: "#E8B94E",
  dustySage: "#93AA8C",
  paleBlue: "#AECBCB",
  ink: "#1B1B18",
};

// Subtle fractal-noise data URI — gives cards/hero a faint grain instead of
// a flat vector fill, echoing the retro-textured illustration look.
const GRAIN_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

function Grain({ opacity = 0.07 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0, backgroundImage: `url("${GRAIN_URI}")`,
        opacity, mixBlendMode: "overlay", pointerEvents: "none",
      }}
    />
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: theme.colors.canvas,
    backgroundImage: `radial-gradient(${theme.colors.lineSoft} 1.5px, transparent 1.5px)`,
    backgroundSize: "22px 22px",
    color: theme.colors.ink,
    fontFamily: theme.font.body,
    padding: "28px 20px 60px",
  },
  wrap: { maxWidth: 1180, margin: "0 auto" },
  card: {
    background: theme.colors.surface,
    border: `1.5px solid ${theme.colors.lineSoft}`,
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
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      .sdb * { box-sizing: border-box; }
      .sdb button, .sdb input, .sdb select, .sdb textarea, .sdb table { font-family: ${theme.font.body}; }
      .sdb input[type="checkbox"] { accent-color: ${theme.colors.accent}; width: 17px; height: 17px; }
      @keyframes sdb-pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(255,122,89,.35); }
        70% { box-shadow: 0 0 0 18px rgba(255,122,89,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,122,89,0); }
      }
      @keyframes sdb-bob { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-5px) rotate(-2deg); } }
      @keyframes sdb-pop { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes sdb-wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(3deg); } 75% { transform: rotate(-3deg); } }
      .sdb-recording { animation: sdb-pulse-ring 1.7s ease-out infinite; }
      .sdb-bob { animation: sdb-bob 2.6s ${theme.ease} infinite; }
      .sdb-pop { animation: sdb-pop .4s ${theme.ease}; }
      .sdb-hover-lift:hover .sdb-wiggle-icon { animation: sdb-wiggle .5s ${theme.ease}; }
      .sdb button:focus-visible, .sdb a:focus-visible, .sdb select:focus-visible {
        outline: 3px solid ${theme.colors.accent};
        outline-offset: 2px;
      }
      .sdb input:focus-visible, .sdb textarea:focus-visible {
        outline: none;
        border-color: ${theme.colors.accent} !important;
        box-shadow: 0 0 0 3px ${theme.colors.accentSoft};
      }
      .sdb-hover-lift { transition: transform .2s ${theme.ease}, box-shadow .2s ${theme.ease}; }
      .sdb-card-lift { transition: transform .25s ${theme.ease}, box-shadow .25s ${theme.ease}; }
      .sdb-card-lift:hover { transform: translateY(-3px); box-shadow: ${theme.shadowHover}; }
      .sdb-decor { pointer-events: none; }
      @media (max-width: 860px) { .sdb-decor { display: none; } }

      /* ---- Entrance choreography: one staggered reveal per screen ---- */
      @keyframes sdb-rise {
        from { opacity: 0; transform: translateY(14px) scale(0.99); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .sdb-enter {
        opacity: 0;
        animation: sdb-rise .6s ${theme.ease} forwards;
        animation-delay: calc(var(--sdb-i, 0) * 70ms);
      }

      /* ---- Hero headline: one gentle gradient sweep on load, not a loop ---- */
      @keyframes sdb-shine {
        from { background-position: 200% 0; }
        to { background-position: -20% 0; }
      }
      .sdb-shine-text {
        background-image: linear-gradient(100deg, ${hero.cream} 40%, ${hero.butter} 50%, ${hero.cream} 60%);
        background-size: 260% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: sdb-shine 2.4s ${theme.ease} .3s 1 both;
      }

      /* ---- Button ripple: answers the click, doesn't loop ---- */
      @keyframes sdb-ripple {
        from { transform: scale(0); opacity: .45; }
        to { transform: scale(1); opacity: 0; }
      }
      .sdb-ripple {
        position: absolute;
        border-radius: 50%;
        background: currentColor;
        pointer-events: none;
        animation: sdb-ripple .55s ${theme.ease} forwards;
      }

      /* ---- Reward burst on completing an exercise ---- */
      @keyframes sdb-confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(70px) rotate(220deg); opacity: 0; }
      }
      .sdb-confetti-piece { position: absolute; animation: sdb-confetti-fall .9s ${theme.ease} forwards; }

      @keyframes sdb-check-draw {
        from { stroke-dashoffset: 24; }
        to { stroke-dashoffset: 0; }
      }
      .sdb-check-draw path { stroke-dasharray: 24; animation: sdb-check-draw .35s ${theme.ease} forwards; }

      @keyframes sdb-count-glow {
        0% { text-shadow: 0 0 0 rgba(255,122,89,0); }
        40% { text-shadow: 0 0 14px rgba(255,122,89,.35); }
        100% { text-shadow: 0 0 0 rgba(255,122,89,0); }
      }
      .sdb-count-glow { animation: sdb-count-glow .7s ${theme.ease}; }

      @media (prefers-reduced-motion: reduce) {
        .sdb-bob, .sdb-recording, .sdb-pop, .sdb-hover-lift:hover .sdb-wiggle-icon,
        .sdb-enter, .sdb-shine-text, .sdb-ripple, .sdb-confetti-piece, .sdb-check-draw path, .sdb-count-glow {
          animation: none !important;
        }
        .sdb-enter { opacity: 1; }
        .sdb-shine-text { -webkit-background-clip: initial; background-clip: initial; color: ${hero.cream}; }
        .sdb-hover-lift, .sdb-card-lift { transition: none !important; }
        .sdb-card-lift:hover { transform: none; }
      }
      ::selection { background: ${theme.colors.coralSoft}; }
    `}</style>
  );
}

/* ---------------------- Motion helpers -------------------------------- */
// Wraps a group of siblings (a stat-card row, a list of rows) so they rise
// into place together with a small stagger — one orchestrated moment per
// screen rather than scattered per-element animation.
function Stagger({ children, as: Tag = "div", style, ...rest }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <Tag style={style} {...rest}>
      {items.map((child, i) =>
        child ? (
          <div key={child.key ?? i} className="sdb-enter" style={{ "--sdb-i": i }}>
            {child}
          </div>
        ) : null
      )}
    </Tag>
  );
}

// Counts a numeric value up from its previous value whenever it changes,
// so stat cards feel alive without looping or distracting once settled.
function AnimatedNumber({ value, format }) {
  const numeric = typeof value === "number" ? value : parseFloat(value);
  const isNumeric = Number.isFinite(numeric);
  const [display, setDisplay] = useState(isNumeric ? numeric : null);
  const fromRef = useRef(isNumeric ? numeric : 0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!isNumeric) return;
    const from = fromRef.current;
    const to = numeric;
    if (from === to) { setDisplay(to); return; }
    const duration = 550;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else { fromRef.current = to; setPulse((p) => p + 1); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeric, isNumeric]);

  if (!isNumeric) return <>{value}</>;
  const rounded = Math.round(display);
  return <span key={pulse} className={pulse ? "sdb-count-glow" : ""}>{format ? format(rounded) : rounded}</span>;
}

// A short, celebratory burst of color used right where a positive action
// just happened (completing an exercise) — motion that answers the click.
function ConfettiBurst() {
  const pieces = useMemo(() => {
    const colors = [theme.colors.coral, theme.colors.teal, theme.colors.gold, theme.colors.tealDark];
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: 6 + Math.random() * 88,
      delay: Math.random() * 120,
      size: 5 + Math.random() * 4,
      color: colors[i % colors.length],
      round: Math.random() > 0.5,
    }));
  }, []);
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="sdb-confetti-piece"
          style={{
            left: `${p.left}%`, top: "-4px", width: p.size, height: p.size,
            background: p.color, borderRadius: p.round ? "50%" : 2,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------------------- Icons -------------------------------- */
const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" };
function IconMail(props) { return <svg {...iconProps} width={18} height={18} {...props}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></svg>; }
function IconLock(props) { return <svg {...iconProps} width={18} height={18} {...props}><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>; }
function IconEye(props) { return <svg {...iconProps} width={18} height={18} {...props}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>; }
function IconEyeOff(props) { return <svg {...iconProps} width={18} height={18} {...props}><path d="M3 3l18 18" /><path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.4 4.3M6.6 6.6C4 8.3 2 12 2 12s1.4 2.7 4 4.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>; }
function IconUser(props) { return <svg {...iconProps} width={18} height={18} {...props}><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" /></svg>; }
function IconArrowRight(props) { return <svg {...iconProps} width={17} height={17} strokeWidth={2.2} {...props}><path d="M4 12h16M13 5l7 7-7 7" /></svg>; }
function IconCake(props) { return <svg {...iconProps} width={18} height={18} {...props}><path d="M4 21v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" /><path d="M2 21h20" /><path d="M8 12V8M12 12V8M16 12V8" /><path d="M12 3c-1 1-1 2 0 3s1 2 0 3" /></svg>; }
function IconFlame(props) { return <svg {...iconProps} width={16} height={16} {...props}><path d="M12 2c1 4-4 5-4 9a4 4 0 0 0 8 0c2 1 3 3 3 5a7 7 0 0 1-14 0c0-5 4-7 4-11 1 1 1 2 1 3 1-2 1-4 2-6Z" /></svg>; }
function IconCheck(props) { return <svg {...iconProps} width={16} height={16} strokeWidth={2.4} {...props}><path d="M20 6 9 17l-5-5" /></svg>; }
function IconStar(props) { return <svg {...iconProps} width={16} height={16} fill="currentColor" stroke="none" {...props}><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7L12 17.3 5.7 20.9l1.7-7L2 9.2l7.1-.6L12 2z" /></svg>; }
function IconSparkle(props) { return <svg {...iconProps} width={16} height={16} {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>; }

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

/* ------------------------------- UI kit -------------------------------- */
function Button({ children, onClick, secondary = false, disabled = false, danger = false, type = "button", full = false, icon, small = false }) {
  const bg = danger ? theme.colors.danger : secondary ? "transparent" : theme.colors.accent;
  const color = secondary ? theme.colors.ink : "#fff";
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const [ripples, setRipples] = useState([]);
  const shadow = disabled ? "none" : active ? theme.shadowActive : hover ? theme.shadowHover : theme.shadowSoft;
  const translate = disabled ? "none" : active ? "translateY(0px)" : hover ? "translateY(-2px)" : "translateY(0)";

  const handleClick = (e) => {
    if (!disabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const id = Date.now() + Math.random();
      setRipples((r) => [...r, { id, size, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2 }]);
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
    }
    onClick?.(e);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      className="sdb-hover-lift"
      style={{
        position: "relative",
        overflow: "hidden",
        border: secondary ? `1.5px solid ${theme.colors.line}` : "1.5px solid transparent",
        borderRadius: theme.radius.pill,
        padding: small ? "8px 16px" : "12px 22px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 700,
        fontSize: small ? 13 : 14.5,
        fontFamily: theme.font.display,
        background: secondary && hover && !disabled ? theme.colors.surfaceAlt : bg,
        color,
        opacity: disabled ? 0.55 : 1,
        boxShadow: secondary ? "none" : shadow,
        transform: secondary ? "none" : translate,
        width: full ? "100%" : "auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {children}
      {icon}
      {ripples.map((r) => (
        <span key={r.id} className="sdb-ripple" style={{ width: r.size, height: r.size, left: r.x, top: r.y, color: secondary ? theme.colors.line : "rgba(255,255,255,.9)" }} />
      ))}
    </button>
  );
}

const SECTION_TONES = {
  teal: theme.colors.teal,
  coral: theme.colors.coral,
  gold: theme.colors.gold,
  navy: theme.colors.navy,
};

function Section({ title, subtitle, children, right, icon, tone = "navy" }) {
  const barColor = SECTION_TONES[tone] || theme.colors.navy;
  return (
    <section style={{ ...styles.card, marginBottom: 22, position: "relative", overflow: "hidden", paddingLeft: 26 }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 5, background: barColor }} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {icon && (
            <div style={{
              width: 38, height: 38, borderRadius: theme.radius.sm, flexShrink: 0,
              background: `${barColor}1A`, color: barColor, display: "grid", placeItems: "center", fontSize: 17, marginTop: 2,
            }}>{icon}</div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: 21, fontFamily: theme.font.display, fontWeight: 800 }}>{title}</h2>
            {subtitle && <p style={{ ...styles.muted, margin: "7px 0 0", lineHeight: 1.55, maxWidth: 640 }}>{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

const accentSets = {
  teal: { fg: theme.colors.tealDark, bg: theme.colors.tealSoft, strong: theme.colors.teal, grad: "linear-gradient(135deg,#E4F9EF 0%,#CBF3E3 100%)" },
  coral: { fg: theme.colors.coralDark, bg: theme.colors.coralSoft, strong: theme.colors.coral, grad: "linear-gradient(135deg,#FFE7DE 0%,#FFD5C7 100%)" },
  gold: { fg: "#92620A", bg: theme.colors.goldSoft, strong: theme.colors.gold, grad: "linear-gradient(135deg,#FBF0DC 0%,#F7E2B8 100%)" },
  violet: { fg: theme.colors.accent, bg: theme.colors.accentSoft, strong: theme.colors.accent, grad: "linear-gradient(135deg,#FFE7DE 0%,#FFD5C7 100%)" },
  navy: { fg: theme.colors.navy, bg: "#E7EAF0", strong: theme.colors.navy, grad: "linear-gradient(135deg,#EEF1F6 0%,#DEE3EC 100%)" },
};

function renderScoreValue(value) {
  if (typeof value === "number") return <AnimatedNumber value={value} />;
  if (typeof value === "string") {
    const percentMatch = value.match(/^(-?\d+(?:\.\d+)?)%$/);
    if (percentMatch) return <><AnimatedNumber value={Number(percentMatch[1])} />%</>;
    const hzMatch = value.match(/^(-?\d+(?:\.\d+)?)\s?Hz$/);
    if (hzMatch) return <><AnimatedNumber value={Number(hzMatch[1])} /> Hz</>;
  }
  return value;
}

function ScoreCard({ icon, title, value, subtitle, accent = "teal" }) {
  const a = accentSets[accent] || accentSets.teal;
  return (
    <div
      className="sdb-card-lift"
      style={{
        ...styles.card,
        padding: "18px 18px 18px",
        position: "relative",
        overflow: "hidden",
        background: a.grad,
        border: `1.5px solid ${theme.colors.surface}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: a.strong }} />
      {/* Oversized, low-opacity watermark of the card's own icon — fills the
          card's upper corner with a deliberate motif instead of empty gradient. */}
      <div aria-hidden="true" style={{ position: "absolute", top: -6, right: -6, fontSize: 76, lineHeight: 1, opacity: 0.14, transform: "rotate(8deg)", pointerEvents: "none" }}>{icon}</div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <div className="sdb-pop" style={{
          width: 42, height: 42, borderRadius: theme.radius.md,
          background: theme.colors.surface, color: a.fg, boxShadow: theme.shadowSoft,
          display: "grid", placeItems: "center", fontSize: 18,
        }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: a.fg, background: "rgba(255,255,255,.55)", padding: "4px 10px", borderRadius: 99 }}>{title}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 14, fontFamily: theme.font.display, color: theme.colors.navy, position: "relative" }}>{renderScoreValue(value)}</div>
      {subtitle && <div style={{ fontSize: 12.5, marginTop: 5, color: theme.colors.ink, opacity: 0.55, position: "relative" }}>{subtitle}</div>}
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
/* GAMIFICATION — points, streaks, badges                              */
/* ------------------------------------------------------------------ */
// Badge thresholds are simple and explainable, matching the adaptive-
// difficulty philosophy of the rest of the app: no hidden logic.
const POINT_BADGES = [
  { min: 500, label: "Gold Voice", icon: "🥇" },
  { min: 200, label: "Silver Voice", icon: "🥈" },
  { min: 50, label: "Bronze Voice", icon: "🥉" },
];
const STREAK_BADGES = [
  { min: 14, label: "2-Week Streak", icon: "🔥" },
  { min: 7, label: "Week Streak", icon: "🔥" },
  { min: 3, label: "3-Day Streak", icon: "🔥" },
];

function computeBadges(totalPoints, longestStreak) {
  const badges = [];
  const pointBadge = POINT_BADGES.find((b) => (totalPoints || 0) >= b.min);
  if (pointBadge) badges.push(pointBadge);
  const streakBadge = STREAK_BADGES.find((b) => (longestStreak || 0) >= b.min);
  if (streakBadge) badges.push(streakBadge);
  return badges;
}

function GamificationPanel({ totalPoints = 0, currentStreak = 0, longestStreak = 0 }) {
  const badges = computeBadges(totalPoints, longestStreak);
  return (
    <div
      style={{
        ...styles.card, marginBottom: 22, color: "#fff", border: "none", boxShadow: theme.shadow,
        position: "relative", overflow: "hidden",
        background: `linear-gradient(120deg, ${theme.colors.tealDark} 0%, ${theme.colors.navy} 55%, ${theme.colors.navyDark} 100%)`,
      }}
    >
      <Grain opacity={0.06} />
      <div className="sdb-decor" style={{ position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: "50%", background: theme.colors.coral, opacity: 0.18 }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="sdb-bob" style={{ width: 46, height: 46, borderRadius: "50%", background: theme.colors.accent, display: "grid", placeItems: "center", fontSize: 22, boxShadow: "0 6px 16px rgba(255,122,89,.4)" }}>🏆</div>
          <div>
            <div style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 650 }}><AnimatedNumber value={totalPoints} /> points</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2, display: "flex", alignItems: "center", gap: 6, color: theme.colors.gold }}>
              <IconFlame /> {currentStreak}-day streak {longestStreak > currentStreak && `· best ${longestStreak}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {badges.length ? badges.map((b) => (
            <span key={b.label} className="sdb-pop" style={{ background: "rgba(255,255,255,.14)", padding: "7px 13px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(255,255,255,.18)" }}>
              <span>{b.icon}</span>{b.label}
            </span>
          )) : (
            <span style={{ fontSize: 12.5, opacity: 0.7 }}>Complete exercises to earn your first badge</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TREND CHART — dependency-free inline SVG line chart for milestone   */
/* trends over recent sessions (pronunciation + clarity over time).    */
/* ------------------------------------------------------------------ */
function TrendChart({ logs, height = 220 }) {
  const points = useMemo(() => {
    // logs are newest-first; chart reads oldest -> newest left to right
    return [...logs].reverse().slice(-14);
  }, [logs]);

  if (!points.length) return <Empty text="Record a few sessions to see your trend line." />;

  const width = 640;
  const padding = 34;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const n = points.length;
  const xFor = (i) => padding + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yFor = (v) => padding + innerH - (Math.max(0, Math.min(100, v)) / 100) * innerH;

  const lineFor = (key) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(Number(p[key] || 0)).toFixed(1)}`).join(" ");

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width, display: "block" }}>
        {gridLines.map((g) => (
          <g key={g}>
            <line x1={padding} x2={width - padding} y1={yFor(g)} y2={yFor(g)} stroke={theme.colors.lineSoft} strokeWidth="1" />
            <text x={4} y={yFor(g) + 4} fontSize="10" fill={theme.colors.inkFaint}>{g}</text>
          </g>
        ))}
        <path d={lineFor("clarityScore")} fill="none" stroke={theme.colors.coral} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        <path d={lineFor("pronunciationScore")} fill="none" stroke={theme.colors.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={`p-${i}`} cx={xFor(i)} cy={yFor(Number(p.pronunciationScore || 0))} r="3.5" fill={theme.colors.teal} />
        ))}
        {points.map((p, i) => (
          <circle key={`c-${i}`} cx={xFor(i)} cy={yFor(Number(p.clarityScore || 0))} r="3.5" fill={theme.colors.coral} />
        ))}
      </svg>
      <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12.5, color: theme.colors.inkSoft }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 99, background: theme.colors.teal, display: "inline-block" }} />Pronunciation</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 99, background: theme.colors.coral, display: "inline-block" }} />Clarity</span>
      </div>
    </div>
  );
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

  // Logged-out visitors see the marketing home page first, then land on
  // the auth screen already set to the mode/role they picked there.
  const [publicView, setPublicView] = useState("home"); // "home" | "auth"
  const [authIntent, setAuthIntent] = useState({ mode: "login", role: "PATIENT" });

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [patientDashboard, setPatientDashboard] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [recommendationLoading, setRecommendationLoading] = useState(false);

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
    setFeedback([]); setExercises([]); setPatientDashboard(null); setMessage(""); setRecommendation("");
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
      saveToken(data.token, remember); setUser(data.user); announceWelcome(data.user.fullName, false);
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
      saveToken(data.token, remember); setUser(data.user); announceWelcome(data.user.fullName, true);
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
    setSelectedPatient(patient); setLoading(true); setMessage(""); setExercises([]); setFeedback([]); setPatientDetail(null); setRecommendation("");
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
      const gen = await api(`/api/patients/${patientId}/generate-exercises`, { method: "POST" });
      setMessage(gen.source === "offline" ? "New exercises added (built-in set — AI is busy)." : "New AI exercises added!");
      await afterReload();
    } catch (err) { setMessage(err.message); } finally { setLoading(false); }
  };

  // Marks an exercise assignment complete and awards its points — this is
  // what makes the gamification panel (points/streak/badges) move.
  const completeExercise = async (assignmentId, afterReload) => {
    setCompletingId(assignmentId); setMessage("");
    try {
      const data = await api(`/api/exercise-assignments/${assignmentId}/complete`, { method: "POST" });
      if (data.alreadyCompleted) setMessage("Already marked complete.");
      else setMessage(`Nice work! +${data.pointsAwarded} points.`);
      await afterReload();
    } catch (err) { setMessage(err.message); } finally { setCompletingId(null); }
  };

  const fetchRecommendation = async (patientId) => {
    setRecommendationLoading(true); setMessage("");
    try {
      const data = await api(`/api/patients/${patientId}/ai-recommendation`, { method: "POST" });
      setRecommendation(data.recommendation || "");
    } catch (err) { setMessage(err.message); } finally { setRecommendationLoading(false); }
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
    api("/api/auth/me").then((d) => setUser(d.user)).catch(() => { clearToken(); setUser(null); });
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
    if (publicView === "home") {
      return (
        <LandingPage
          onGetStarted={(role) => { setAuthIntent({ mode: "signup", role: role || "PATIENT" }); setPublicView("auth"); }}
          onLogin={() => { setAuthIntent({ mode: "login", role: "PATIENT" }); setPublicView("auth"); }}
        />
      );
    }
    return (
      <AuthScreen
        onBack={() => setPublicView("home")}
        initialMode={authIntent.mode}
        initialRole={authIntent.role}
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={loading}
        message={message}
        notify={setMessage}
      />
    );
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

          <GamificationPanel totalPoints={profile.totalPoints} currentStreak={profile.currentStreak} longestStreak={profile.longestStreak} />

          <Stagger style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", marginBottom: 18 }}>
            <ScoreCard icon="🎯" accent="teal" title="Current level" value={`Level ${currentLevel}`} subtitle="Adjusts with your practice" />
            <ScoreCard icon="📝" accent="gold" title="Exercises" value={exercises.length} subtitle="Assigned to you" />
            <ScoreCard icon="🎙️" accent="coral" title="Practice sessions" value={patientLogs.length} subtitle="Saved recordings" />
            <ScoreCard icon="📈" accent="teal" title="Avg. pronunciation" value={`${avgScore}%`} subtitle="Across all sessions" />
          </Stagger>

          <Section
            icon="📝"
            tone="gold"
            title="Your home exercises"
            subtitle="Complete your assigned exercises to earn points, then record your speech practice below. New ones are generated for you automatically as you progress."
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
            {exercises.length === 0 ? <Empty text="No exercises assigned yet — check back soon." /> : exercises.map((a) => (
              <ExerciseCard
                key={a.id}
                assignment={a}
                onComplete={() => completeExercise(a.id, () => loadPatientDashboard(user.id))}
                completing={completingId === a.id}
              />
            ))}
          </Section>

          <WellnessCheckIn api={api} patientId={user.id} />
          <AiCoachChat api={api} patientId={user.id} />

          <Section
            icon="🎙️"
            tone="coral"
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
            <Section icon="📈" tone="teal" title="Your progress" subtitle="Recent saved acoustic metrics from your practice sessions.">
              <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                <ProgressBar value={patientLatest.pronunciationScore} label="Pronunciation score" />
                <ProgressBar value={patientLatest.clarityScore} label="Clarity score" />
                <div><div style={{ fontSize: 13, color: theme.colors.inkSoft }}>Pitch mean</div><strong style={{ fontSize: 24, fontFamily: theme.font.display }}>{Math.round(patientLatest.pitchMeanHz || 0)} Hz</strong></div>
                <div><div style={{ fontSize: 13, color: theme.colors.inkSoft }}>Latest session</div><strong>{formatDate(patientLatest.recordedAt)}</strong></div>
              </div>
              {patientLogs.length > 1 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontFamily: theme.font.display, fontSize: 15.5, margin: "0 0 12px" }}>Milestone trend</h3>
                  <TrendChart logs={patientLogs} />
                </div>
              )}
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
    const pf = patientDetail?.profile || {};
    return (
      <div className="sdb" style={styles.page}>
        <GlobalStyle />
        <div style={styles.wrap}>
          <Header title="Therapist · patient profile" user={user} logout={logout} back={() => { setSelectedPatient(null); setPatientDetail(null); setFeedback([]); setRecommendation(""); }} />
          {message && <Notice text={message} />}

          <GamificationPanel totalPoints={pf.totalPoints} currentStreak={pf.currentStreak} longestStreak={pf.longestStreak} />

          <Stagger style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", marginBottom: 18 }}>
            <ScoreCard icon="👤" accent="teal" title="Patient" value={selectedPatient.fullName} subtitle={selectedPatient.email} />
            <ScoreCard icon="🎯" accent="gold" title="Difficulty" value={`Level ${pf.currentDifficultyLevel ?? "—"}`} subtitle="Current adaptive level" />
            <ScoreCard icon="🎙️" accent="coral" title="Sessions" value={logs.length} subtitle="Audio logs" />
            <ScoreCard icon="📈" accent="teal" title="Avg. pronunciation" value={`${average}%`} subtitle="Across saved sessions" />
          </Stagger>

          <Section icon="👤" tone="navy" title="Patient overview" subtitle="Clinical context stored in the therapy profile.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
              <Info label="Name" value={patientDetail?.patient?.fullName || selectedPatient.fullName} />
              <Info label="Email" value={patientDetail?.patient?.email || selectedPatient.email} />
              <Info label="Diagnosis" value={pf.diagnosis || "Not specified"} />
              <Info label="Date of birth" value={pf.dateOfBirth ? new Date(pf.dateOfBirth).toLocaleDateString() : "Not specified"} />
              <Info label="Clinical notes" value={pf.clinicalNotes || "Not specified"} />
            </div>
          </Section>

          <Section
            icon="📋"
            tone="gold"
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

          <Section icon="📊" tone="teal" title="Audio analysis & progress" subtitle="Stored metrics from the patient's speech practice.">
            {latest && (
              <Stagger style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginBottom: 20 }}>
                <ScoreCard icon="🗣️" accent="teal" title="Latest pronunciation" value={`${Math.round(latest.pronunciationScore || 0)}%`} subtitle={scoreLabel(latest.pronunciationScore)} />
                <ScoreCard icon="🔊" accent="coral" title="Latest clarity" value={`${Math.round(latest.clarityScore || 0)}%`} subtitle="Acoustic quality heuristic" />
                <ScoreCard icon="〰️" accent="gold" title="Pitch mean" value={`${Math.round(latest.pitchMeanHz || 0)} Hz`} subtitle="Estimated mean pitch" />
                <ScoreCard icon="⏱️" accent="teal" title="Duration" value={`${Number(latest.durationSeconds || 0).toFixed(1)}s`} subtitle={formatDate(latest.recordedAt)} />
              </Stagger>
            )}
            {logs.length > 1 && (
              <div style={{ marginBottom: 22 }}>
                <h3 style={{ fontFamily: theme.font.display, fontSize: 15.5, margin: "0 0 12px" }}>Milestone trend</h3>
                <TrendChart logs={logs} />
              </div>
            )}
            {logs.length ? <ProgressTable logs={logs} /> : <Empty text="No audio sessions have been saved yet." />}
          </Section>

          <Section icon="💬" tone="coral" title="Caregiver feedback" subtitle="Feedback already stored for this patient.">
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

          <AiReportPanel api={api} patientId={selectedPatient.id} patientName={selectedPatient.fullName} />

          <Section
            icon="✨"
            tone="navy"
            title="AI-assisted recommendation"
            subtitle="Ask Claude for a fresh, explainable recommendation based on this patient's diagnosis and most recent scores."
            right={<Button secondary disabled={recommendationLoading} onClick={() => fetchRecommendation(selectedPatient.id)}>{recommendationLoading ? "Thinking…" : "✨ Get AI recommendation"}</Button>}
          >
            {recommendation ? (
              <div style={{ padding: 18, borderRadius: theme.radius.md, background: theme.colors.tealSoft, borderLeft: `4px solid ${theme.colors.teal}`, lineHeight: 1.65 }}>
                {recommendation}
              </div>
            ) : (
              <Recommendation score={latest?.pronunciationScore || 0} difficulty={pf.currentDifficultyLevel} />
            )}
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

          <Stagger style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", marginBottom: 18 }}>
            <ScoreCard icon="👥" accent="teal" title="Patients" value={patients.length} subtitle="Patient accounts" />
            <ScoreCard icon="🎙️" accent="coral" title="Audio sessions" value={totalSessions} subtitle="Saved practice sessions" />
            <ScoreCard icon="📈" accent="teal" title="Avg. pronunciation" value={`${avg}%`} subtitle="Latest patient scores" />
            <ScoreCard icon="🧠" accent="gold" title="Adaptive therapy" value="Active" subtitle="Difficulty adjusts from scores" />
          </Stagger>

          <Section icon="⚡" tone="gold" title="Quick access" subtitle="Jump to what matters for today's therapy workflow." right={<Button onClick={loadPatients} disabled={loading}>{loading ? "Refreshing…" : "Refresh patients"}</Button>}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button secondary onClick={loadPatients}>Patient records</Button>
              <Button secondary onClick={() => document.getElementById("patients")?.scrollIntoView({ behavior: "smooth" })}>Progress analytics</Button>
            </div>
          </Section>

          <Section icon="👥" tone="teal" title="Patients" subtitle="Open a patient to view exercises, audio analytics, progress and caregiver feedback.">
            <div id="patients">
              {patients.length ? patients.map((p) => <PatientRow key={p.id} patient={p} onOpen={() => loadPatientDetail(p)} />) : <Empty text={loading ? "Loading patients…" : "No patients found."} />}
            </div>
          </Section>

          {patients.length > 0 && (
            <Section icon="📊" tone="coral" title="Team snapshot" subtitle="Latest pronunciation scores across your patient roster.">
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
  border: `2px solid ${theme.colors.lineSoft}`,
  borderRadius: theme.radius.md,
  fontSize: 15,
  background: theme.colors.surface,
  color: theme.colors.ink,
  outline: "none",
  transition: `border-color .15s ${theme.ease}, box-shadow .15s ${theme.ease}`,
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

/* ---------------------------- Home / marketing page -------------------- */
const ROLE_CARDS = [
  {
    role: "PATIENT",
    label: "Patient",
    tagline: "For me",
    card: hero.sage,
    cardDark: hero.sageDark,
    icon: "🗣️",
    desc: "Practice exercises, record your voice, and watch your progress grow.",
  },
  {
    role: "THERAPIST",
    label: "Therapist",
    tagline: "For my patients",
    card: hero.slate,
    cardDark: hero.slateDark,
    icon: "🩺",
    desc: "Assign exercises, review acoustic analytics, and adjust care plans.",
  },
  {
    role: "CAREGIVER",
    label: "Caregiver",
    tagline: "For someone I care for",
    card: hero.rust,
    cardDark: hero.rustDark,
    icon: "💛",
    desc: "Follow along with therapy notes and send updates to the care team.",
  },
];

function NavPill({ children, ...rest }) {
  return (
    <span {...rest} style={{ background: "rgba(245,241,232,0.1)", color: hero.cream, border: `1.5px solid rgba(245,241,232,0.35)`, borderRadius: 99, padding: "8px 16px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
      {children}
    </span>
  );
}

function HomeRoleCard({ card, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onClick(card.role)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        textAlign: "left",
        cursor: "pointer",
        border: "none",
        borderRadius: theme.radius.lg,
        padding: 28,
        background: card.card,
        boxShadow: hover ? `0 18px 34px rgba(0,0,0,0.28)` : `0 10px 22px rgba(0,0,0,0.20)`,
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        transition: `transform .25s ${theme.ease}, box-shadow .25s ${theme.ease}`,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 220,
      }}
    >
      <Grain opacity={0.08} />
      <div style={{ position: "relative", width: 52, height: 52, borderRadius: "50%", background: hero.cream, border: `1.5px solid ${hero.ink}`, display: "grid", placeItems: "center", fontSize: 24 }}>
        {card.icon}
      </div>
      <div style={{ position: "relative" }}>
        <h3 style={{ margin: 0, fontFamily: theme.font.display, fontSize: 24, fontWeight: 800, color: hero.cream }}>{card.label}</h3>
        <p style={{ margin: "10px 0 0", color: hero.cream, opacity: 0.88, lineHeight: 1.5, fontSize: 14 }}>{card.desc}</p>
      </div>
      <div style={{ position: "relative", marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: hero.cream }}>
        {card.tagline} <IconArrowRight />
      </div>
    </button>
  );
}

function HomePage({ onGetStarted, onLogin }) {
  return (
    <div className="sdb" style={{ padding: 0, background: theme.colors.canvas }}>
      <GlobalStyle />

      {/* Nav + Hero share the forest-green field */}
      <div style={{ position: "relative", overflow: "hidden", background: hero.bg }}>
        <Grain opacity={0.05} />
        {/* sandy illustration-accent shapes */}
        <div className="sdb-decor" style={{ position: "absolute", top: -70, right: -60, width: 260, height: 260, borderRadius: "50%", background: hero.butter, opacity: 0.14 }} />
        <div className="sdb-decor" style={{ position: "absolute", top: "34%", left: -80, width: 220, height: 220, borderRadius: "50%", background: hero.paleBlue, opacity: 0.12 }} />
        <div className="sdb-decor" style={{ position: "absolute", bottom: 40, right: "12%", width: 160, height: 160, borderRadius: "42% 58% 60% 40% / 48% 42% 58% 52%", background: hero.dustySage, opacity: 0.14 }} />

        {/* Nav */}
        <div style={{ position: "relative", zIndex: 1, borderBottom: "1px solid rgba(245,241,232,0.14)" }}>
          <div style={{ ...styles.wrap, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
            <div style={{ fontFamily: theme.font.display, fontWeight: 700, fontSize: 22, color: hero.cream }}>
              Swar <span style={{ color: hero.butter }}>Saathi</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div className="sdb-decor" style={{ display: "flex", gap: 8, marginRight: 8 }}>
                <NavPill>Support</NavPill>
                <NavPill>Track</NavPill>
                <NavPill>Empower</NavPill>
              </div>
              <button
                onClick={onLogin}
                className="sdb-hover-lift"
                style={{ background: "transparent", color: hero.cream, border: `1.5px solid rgba(245,241,232,0.5)`, borderRadius: 999, padding: "11px 22px", fontFamily: theme.font.display, fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}
              >
                Log in
              </button>
              <button
                onClick={() => onGetStarted("PATIENT")}
                className="sdb-hover-lift"
                style={{ background: hero.cream, color: hero.ink, border: "1.5px solid transparent", borderRadius: 999, padding: "11px 22px", fontFamily: theme.font.display, fontWeight: 700, fontSize: 14.5, cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.22)" }}
              >
                Get started
              </button>
            </div>
          </div>
        </div>

        {/* Hero copy + role cards */}
        <div style={{ position: "relative", zIndex: 1, padding: "72px 20px 120px" }}>
          <div style={{ ...styles.wrap, textAlign: "center" }}>
            <h1 className="sdb-shine-text" style={{ fontFamily: theme.font.display, fontWeight: 800, fontSize: "clamp(34px,6vw,56px)", margin: "0 0 18px", lineHeight: 1.1 }}>
              Every voice deserves<br />to be heard.
            </h1>
            <p style={{ fontSize: 17, maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.6, color: hero.cream, opacity: 0.82 }}>
              Swar Saathi helps NGOs, therapists, patients and families manage speech therapy end to end — recordings, exercises, progress, and caregiver updates, all in one place.
            </p>
            <div style={{ fontWeight: 700, fontSize: 15, color: hero.cream, marginBottom: 24 }}>Who are you signing up as?</div>
          </div>

          <Stagger style={{ ...styles.wrap, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {ROLE_CARDS.map((c) => (
              <HomeRoleCard key={c.role} card={c} onClick={onGetStarted} />
            ))}
          </Stagger>
        </div>

        {/* Cream wave cutting into the green, revealing white below */}
        <svg
          viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true"
          style={{ position: "relative", zIndex: 1, display: "block", width: "100%", height: 90, marginTop: -2 }}
        >
          <path d="M0,64 C240,110 480,10 720,32 C960,54 1200,104 1440,56 L1440,110 L0,110 Z" fill={theme.colors.canvas} />
        </svg>
      </div>

      {/* Feature strip — plain light section below the wave */}
      <div style={{ background: "#FFFFFF" }}>
        <div style={{ ...styles.wrap, padding: "10px 20px 64px" }}>
          <Stagger style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
            <ScoreCard icon="🎙️" accent="violet" title="Record & analyze" value="Instant" subtitle="Pronunciation & pitch feedback in the browser" />
            <ScoreCard icon="🎮" accent="coral" title="Home exercises" value="Gamified" subtitle="Points, streaks and badges keep patients engaged" />
            <ScoreCard icon="📊" accent="gold" title="Progress tracking" value="Visual" subtitle="Dashboards for therapists, patients and caregivers" />
          </Stagger>
        </div>
      </div>
    </div>
  );
}

const AUTH_HIGHLIGHTS = [
  { icon: "🎙️", text: "Practice pronunciation right in your browser — no downloads." },
  { icon: "📈", text: "Watch pronunciation and clarity trend upward, session by session." },
  { icon: "🎮", text: "Earn points, keep a streak, and unlock badges as you practice." },
];

function AuthSidePanel({ mode }) {
  return (
    <div
      className="sdb-decor"
      style={{
        position: "relative", overflow: "hidden", flex: "1 1 340px", minWidth: 300,
        background: `linear-gradient(155deg, ${hero.bg} 0%, ${hero.bgDeep} 100%)`,
        padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between",
        color: hero.cream,
      }}
    >
      <Grain opacity={0.06} />
      <div className="sdb-decor" style={{ position: "absolute", top: -60, right: -50, width: 200, height: 200, borderRadius: "50%", background: hero.butter, opacity: 0.14 }} />
      <div className="sdb-decor" style={{ position: "absolute", bottom: -40, left: -60, width: 200, height: 200, borderRadius: "42% 58% 60% 40% / 48% 42% 58% 52%", background: hero.dustySage, opacity: 0.16 }} />

      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: theme.font.display, fontWeight: 700, fontSize: 22 }}>
          Swar <span style={{ color: hero.butter }}>Saathi</span>
        </div>
        <h2 style={{ fontFamily: theme.font.display, fontWeight: 800, fontSize: 30, lineHeight: 1.2, margin: "28px 0 14px", maxWidth: 320 }}>
          {mode === "login" ? "Welcome back to your practice space." : "Every voice deserves to be heard."}
        </h2>
        <p style={{ opacity: 0.8, lineHeight: 1.6, maxWidth: 320, margin: 0 }}>
          One place for recordings, exercises, progress, and caregiver updates.
        </p>
      </div>

      <Stagger style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16, margin: "36px 0" }}>
        {AUTH_HIGHLIGHTS.map((h) => (
          <div key={h.text} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(245,241,232,0.14)", display: "grid", placeItems: "center", fontSize: 16, flexShrink: 0 }}>{h.icon}</div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, opacity: 0.88, paddingTop: 5 }}>{h.text}</p>
          </div>
        ))}
      </Stagger>

      <div className="sdb-bob" style={{ position: "relative", display: "flex", justifyContent: "center", opacity: 0.9 }}>
        <Waveform height={44} bars={11} color={hero.butter} />
      </div>
    </div>
  );
}

function AuthScreen({ onLogin, onRegister, loading, message, notify, onBack, initialMode = "login", initialRole = "PATIENT" }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(initialRole);
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
    <div className="sdb" style={{ ...styles.page, display: "flex", flexDirection: "column", position: "relative" }}>
      <GlobalStyle />

      <div style={{ ...styles.wrap, position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px 0" }}>
        {onBack ? (
          <button onClick={onBack} style={{ border: 0, background: "none", cursor: "pointer", padding: 0, color: theme.colors.ink, fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><IconArrowRight /></span> Back to home
          </button>
        ) : <span />}
        <div style={{ fontSize: 13, fontWeight: 700, display: "flex", gap: 10 }} className="sdb-decor">
          <span style={{ background: theme.colors.accentSoft, color: theme.colors.coralDark, borderRadius: 99, padding: "5px 14px" }}>Support</span>
          <span style={{ background: theme.colors.tealSoft, color: theme.colors.tealDark, borderRadius: 99, padding: "5px 14px" }}>Track</span>
          <span style={{ background: theme.colors.goldSoft, color: "#8A5E12", borderRadius: 99, padding: "5px 14px" }}>Empower</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "40px 20px" }}>
        <div
          className="sdb-enter"
          style={{
            width: "100%", maxWidth: 900, borderRadius: theme.radius.xl, boxShadow: theme.shadow,
            overflow: "hidden", display: "flex", flexWrap: "wrap", background: theme.colors.surface,
          }}
        >
          <AuthSidePanel mode={mode} />

          <div style={{ flex: "1.15 1 380px", minWidth: 300, padding: "40px 36px" }}>
          <div style={{ textAlign: "center" }}>
            <img
              src="/swarsaathi-logo.png"
              alt="Swar Saathi"
              style={{ width: 96, height: 96, objectFit: "contain", display: "block", margin: "0 auto 10px" }}
            />
            <h1 style={{ margin: 0, fontFamily: theme.font.display, fontWeight: 650, fontSize: 25, color: theme.colors.navy }}>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
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
    </div>
  );
}

function greetingForHour() {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good evening";
}

function Header({ title, user, logout, back }) {
  const name = (user.fullName || user.email || "there").split(" ")[0].split("@")[0];
  return (
    <div
      style={{
        position: "relative", overflow: "hidden", marginBottom: 18,
        borderRadius: theme.radius.lg, padding: "22px 26px",
        background: `linear-gradient(120deg, ${theme.colors.navy} 0%, ${theme.colors.navyDark} 100%)`,
        boxShadow: theme.shadow, color: "#fff",
      }}
    >
      <Grain opacity={0.05} />
      <div className="sdb-decor" style={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: theme.colors.teal, opacity: 0.16 }} />
      <div className="sdb-decor" style={{ position: "absolute", bottom: -70, right: 140, width: 150, height: 150, borderRadius: "50%", background: theme.colors.coral, opacity: 0.16 }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: theme.radius.md, background: "#fff", flexShrink: 0,
              display: "grid", placeItems: "center", boxShadow: theme.shadowSoft, padding: 6,
            }}
          >
            <img src="/swarsaathi-logo.png" alt="Swar Saathi" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            {back && (
              <button onClick={back} style={{ border: 0, background: "none", cursor: "pointer", padding: 0, marginBottom: 8, color: theme.colors.teal, fontWeight: 700, fontSize: 13.5 }}>← Back to patients</button>
            )}
            <div style={{ fontFamily: theme.font.display, fontWeight: 650, fontSize: 20, lineHeight: 1 }}>
              Swar <span style={{ color: theme.colors.teal }}>Saathi</span>
            </div>
            <div style={{ fontWeight: 700, marginTop: 8, fontSize: 18, fontFamily: theme.font.display }}>
              {greetingForHour()}, {name} <span style={{ opacity: 0.55, fontWeight: 500, fontSize: 14 }}>· {title}</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="sdb-hover-lift"
          style={{
            border: "1.5px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.08)", color: "#fff",
            borderRadius: theme.radius.pill, padding: "12px 22px", fontWeight: 700, fontSize: 14.5,
            fontFamily: theme.font.display, cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

function Notice({ text }) {
  return (
    <div style={{ background: theme.colors.goldSoft, borderRadius: theme.radius.md, padding: "13px 16px", marginBottom: 18, marginTop: 4, color: "#7A540F", fontWeight: 600, borderLeft: `3px solid ${theme.colors.gold}` }}>{text}</div>
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

function ExerciseCard({ assignment, therapist, onComplete, completing }) {
  const e = assignment.exercise || {};
  const done = Boolean(assignment.isCompleted);
  const wasDoneRef = useRef(done);
  const [justCompleted, setJustCompleted] = useState(false);
  useEffect(() => {
    if (done && !wasDoneRef.current) {
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 900);
      return () => clearTimeout(t);
    }
    wasDoneRef.current = done;
  }, [done]);
  return (
    <div style={{ position: "relative", padding: 18, border: `2px solid ${done ? theme.colors.tealDark : theme.colors.lineSoft}`, borderRadius: theme.radius.md, marginTop: 12, background: done ? theme.colors.tealSoft : "transparent", transition: `background .3s ${theme.ease}, border-color .3s ${theme.ease}` }}>
      {justCompleted && <ConfettiBurst />}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: theme.font.display, fontWeight: 600, fontSize: 17 }}>{e.title || "Exercise"}</h3>
          <p style={{ ...styles.muted, margin: "6px 0" }}>{e.description || "Speech therapy exercise"}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ background: theme.colors.tealSoft, color: theme.colors.tealDark, padding: "6px 12px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, height: "fit-content" }}>Level {e.difficultyLevel ?? "—"}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: theme.colors.gold, fontWeight: 700 }}><IconStar />{e.gamePointsValue ?? 10} pts</span>
        </div>
      </div>
      <div style={{ marginTop: 12, padding: 14, background: theme.colors.surfaceAlt, borderRadius: 10 }}>
        <strong style={{ fontSize: 13.5 }}>Instructions</strong>
        <p style={{ ...styles.muted, margin: "5px 0 0" }}>{e.instructions || "Follow the therapist's instructions."}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 12, color: theme.colors.inkFaint }}>
          {e.category || "Therapy"}{assignment.dueDate ? ` · Due ${new Date(assignment.dueDate).toLocaleDateString()}` : ""}{therapist ? " · Therapist view" : ""}
        </div>
        {!therapist && (
          done ? (
            <span className="sdb-pop" style={{ display: "flex", alignItems: "center", gap: 6, color: theme.colors.success, fontWeight: 700, fontSize: 13 }}>
              <IconCheck /> Completed{assignment.pointsAwarded ? ` · +${assignment.pointsAwarded} pts` : ""}
            </span>
          ) : (
            <Button small onClick={onComplete} disabled={completing}>{completing ? "Saving…" : "Mark complete"}</Button>
          )
        )}
      </div>
    </div>
  );
}

function AnalysisCard({ analysis }) {
  return (
    <Section icon="🗣️" tone="coral" title="Speech analysis" subtitle="Instant browser-based acoustic feedback. These values are demo heuristics, not clinical measurements.">
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

const avatarPalette = [theme.colors.accent, theme.colors.coral, theme.colors.gold, theme.colors.tealDark];
function avatarColor(seed) {
  const s = String(seed || "");
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return avatarPalette[sum % avatarPalette.length];
}

function PatientRow({ patient, onOpen }) {
  const score = Number(patient.latestPronunciationScore || 0);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, padding: 16, border: `2px solid ${theme.colors.lineSoft}`, borderRadius: theme.radius.md, marginTop: 11, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: avatarColor(patient.fullName || patient.id), color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontFamily: theme.font.display }}>{patient.fullName?.[0]?.toUpperCase() || "P"}</div>
        <div>
          <strong>{patient.fullName}</strong>
          <div style={{ ...styles.muted, fontSize: 13 }}>{patient.email}</div>
          <div style={{ ...styles.muted, fontSize: 12, marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span>Sessions: {patient.audioLogCount || 0} · Exercises: {patient.exerciseCount || 0}</span>
            {Number(patient.totalPoints || 0) > 0 && <span style={{ color: theme.colors.gold, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><IconStar />{patient.totalPoints} pts</span>}
            {Number(patient.currentStreak || 0) > 0 && <span style={{ color: theme.colors.coralDark, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><IconFlame />{patient.currentStreak}d</span>}
          </div>
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
      <div style={{ fontSize: 11.5, color: theme.colors.inkFaint, marginTop: 10 }}>Rule-based fallback shown until an AI recommendation is requested above.</div>
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

/* ------------------------- Feedback submission form ----------------- */
function FeedbackForm({ onSubmit, submitting }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState(4);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ feedbackText: text.trim(), moodRating: mood }, () => setText(""));
  };

  const moodEmoji = ["😞", "😕", "😐", "🙂", "😄"];

  return (
    <form onSubmit={submit} style={{ padding: 16, border: `1px dashed ${theme.colors.line}`, borderRadius: theme.radius.md, marginBottom: 16, background: theme.colors.surfaceAlt }}>
      <strong style={{ fontSize: 13.5 }}>Share an update</strong>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="How did practice go today? Anything the therapist should know?"
        rows={3}
        style={{ ...inputStyle, paddingLeft: 14, marginTop: 10, resize: "vertical", fontFamily: theme.font.body }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => setMood(v)}
              aria-label={`Mood ${v} of 5`}
              style={{
                width: 36, height: 36, borderRadius: 10, fontSize: 17, cursor: "pointer",
                border: `1.5px solid ${mood === v ? theme.colors.teal : theme.colors.line}`,
                background: mood === v ? theme.colors.tealSoft : theme.colors.surface,
              }}
            >
              {moodEmoji[v - 1]}
            </button>
          ))}
        </div>
        <Button type="submit" small disabled={submitting || !text.trim()}>{submitting ? "Sending…" : "Send feedback"}</Button>
      </div>
    </form>
  );
}

function CaregiverPortal({ user, logout, api }) {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [detail, setDetail] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

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

  const submitFeedback = async ({ feedbackText, moodRating }, onDone) => {
    if (!selected) return;
    setSubmittingFeedback(true); setMessage("");
    try {
      await api(`/api/patients/${selected.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackText, moodRating }),
      });
      setMessage("Feedback sent!");
      onDone?.();
      const f = await api(`/api/patients/${selected.id}/feedback`).catch(() => []);
      setFeedback(Array.isArray(f) ? f : []);
    } catch (e) { setMessage(e.message); }
    finally { setSubmittingFeedback(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="sdb" style={styles.page}>
      <GlobalStyle />
      <div style={styles.wrap}>
        <Header title="Caregiver portal" user={user} logout={logout} />
        {message && <Notice text={message} />}
        <Section icon="👀" tone="teal" title="Patient monitoring" subtitle="Review assigned exercises, therapy progress and caregiver feedback." right={<Button secondary onClick={load}>{loading ? "Refreshing…" : "Refresh"}</Button>}>
          {patients.length ? patients.map((p) => <PatientRow key={p.id} patient={p} onOpen={() => open(p)} />) : <Empty text={loading ? "Loading patients…" : "No patients available."} />}
        </Section>
        {selected && detail && (
          <>
            <GamificationPanel totalPoints={detail.profile?.totalPoints} currentStreak={detail.profile?.currentStreak} longestStreak={detail.profile?.longestStreak} />
            <AiReportPanel api={api} patientId={selected.id} patientName={selected.fullName} />
            <AiCoachChat api={api} patientId={selected.id} title="Ask the AI coach about this patient" />
            <Section icon="🗒️" tone="navy" title={`${selected.fullName}'s therapy summary`} subtitle="Current therapy data.">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                <Info label="Current difficulty" value={`Level ${detail.profile?.currentDifficultyLevel ?? "—"}`} />
                <Info label="Diagnosis" value={detail.profile?.diagnosis || "Not specified"} />
                <Info label="Practice sessions" value={detail.audioLogs?.length ?? 0} />
                <Info label="Assigned exercises" value={detail.exercises?.length ?? 0} />
              </div>
            </Section>
            <Section icon="📋" tone="gold" title="Assigned exercises">
              {detail.exercises?.length ? detail.exercises.map((a) => <ExerciseCard key={a.id} assignment={a} therapist />) : <Empty text="No exercises assigned." />}
            </Section>
            <Section icon="📈" tone="teal" title="Progress">
              {detail.audioLogs?.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                  <TrendChart logs={detail.audioLogs} />
                </div>
              )}
              <ProgressTable logs={detail.audioLogs || []} />
            </Section>
            <Section icon="💬" tone="coral" title="Therapist / caregiver feedback" subtitle="Send a remote update to the therapy team, or review what's already been shared.">
              <FeedbackForm onSubmit={submitFeedback} submitting={submittingFeedback} />
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

function Root() {
  return (
    <>
      <App />
      <WelcomeHost />
    </>
  );
}

export default Root;