import { motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/* AnimatedText — letter-by-letter spring reveal + animated underline. */
/* Plain JSX port of the shadcn "animated-text" component: no Tailwind, */
/* no TypeScript, no shadcn setup needed. Only needs `framer-motion`.   */
/*                                                                      */
/*  text        : string. Use "\n" for a line break.                    */
/*  stagger     : seconds between letters (default 0.035)               */
/*  delay       : seconds before starting (default 0.1)                 */
/*  align       : "center" | "left"                                     */
/*  highlight   : a word to colour differently, e.g. "heard"            */
/*  highlightColor, underlineGradient (any CSS gradient), underlineHeight */
/*  as          : "h1" | "h2" | "div" | "span" ...                      */
/* ------------------------------------------------------------------ */
export function AnimatedText({
  text,
  as = "h1",
  stagger = 0.035,
  delay = 0.1,
  align = "center",
  highlight,
  highlightColor,
  underline = true,
  underlineGradient = "linear-gradient(90deg,#E8B94E,#FF7A59,#34D399)",
  underlineHeight = 5,
  style,
  className,
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.h1;
  const lines = String(text).split("\n");
  const totalLetters = Array.from(String(text)).length;

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay } },
  };
  const letter = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 200 } },
  };

  const norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/gi, "");
  const isHighlight = (w) => highlight && norm(w) === norm(highlight);

  return (
    <div style={{ display: "inline-block", position: "relative", textAlign: align, maxWidth: "100%" }}>
      <Tag
        variants={container}
        initial="hidden"
        animate="visible"
        className={className}
        aria-label={String(text).replace(/\n/g, " ")}
        style={{ margin: 0, ...style }}
      >
        {lines.map((line, li) => (
          <span key={li} aria-hidden="true" style={{ display: "block" }}>
            {line.split(" ").map((word, wi) => (
              <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap", marginRight: "0.28em" }}>
                {Array.from(word).map((ch, ci) => (
                  <motion.span
                    key={ci}
                    variants={letter}
                    style={{ display: "inline-block", color: isHighlight(word) ? highlightColor : undefined }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            ))}
          </span>
        ))}
      </Tag>

      {underline && (
        <motion.div
          aria-hidden="true"
          initial={{ width: "0%" }}
          animate={{ width: "72%" }}
          transition={{ delay: reduce ? 0 : delay + totalLetters * stagger * 0.8, duration: 0.8, ease: "easeOut" }}
          style={{
            height: underlineHeight,
            borderRadius: 99,
            background: underlineGradient,
            marginTop: 14,
            marginLeft: align === "center" ? "auto" : 0,
            marginRight: align === "center" ? "auto" : 0,
          }}
        />
      )}
    </div>
  );
}

export default AnimatedText;