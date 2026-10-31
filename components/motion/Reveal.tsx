"use client";

import { motion, useTransform } from "framer-motion";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "./PageContext";

type RevealFrom = "up" | "down" | "left" | "right" | "none";

const offset = (from: RevealFrom, d = 28) =>
  ({ up: { y: d }, down: { y: -d }, left: { x: -d }, right: { x: d }, none: {} })[from];

/** Fades, de-blurs and slides an element into place once its page is active. */
export function Reveal({
  children,
  delay = 0,
  from = "up",
  distance,
  duration = 1.1,
  blur = true,
  className,
  style,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  from?: RevealFrom;
  distance?: number;
  duration?: number;
  blur?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "p" | "span" | "li" | "section" | "figure";
}) {
  const { active, reduced, delay: base } = usePageMotion();
  const Comp = motion[as] as typeof motion.div;
  const hidden = reduced
    ? { opacity: 0 }
    : { opacity: 0, ...offset(from, distance), filter: blur ? "blur(10px)" : "blur(0px)" };
  return (
    <Comp
      className={className}
      style={style}
      initial={hidden}
      animate={active ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" } : hidden}
      transition={{ duration: reduced ? 0.3 : duration, delay: active ? base + delay : 0, ease: EASE_OUT }}
    >
      {children}
    </Comp>
  );
}

/**
 * Kinetic type: splits text into words (or characters) that rise out of a mask,
 * staggered like a title sequence.
 */
export function SplitText({
  text,
  by = "word",
  delay = 0,
  stagger,
  duration = 1.2,
  className,
  as = "span",
  italic,
}: {
  text: string;
  by?: "word" | "char";
  delay?: number;
  stagger?: number;
  duration?: number;
  className?: string;
  as?: ElementType;
  italic?: boolean;
}) {
  const { active, reduced, delay: base } = usePageMotion();
  const Tag = as;
  const words = text.split(" ");
  const step = stagger ?? (by === "char" ? 0.028 : 0.07);
  let i = 0;
  return (
    <Tag className={className} aria-label={text} style={italic ? { fontStyle: "italic" } : undefined}>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          {(by === "char" ? [...word] : [word]).map((piece, pi) => {
            const idx = i++;
            return (
              <motion.span
                key={pi}
                className="inline-block will-change-transform"
                initial={reduced ? { opacity: 0 } : { y: "110%", rotate: 4 }}
                animate={
                  active
                    ? reduced
                      ? { opacity: 1 }
                      : { y: "0%", rotate: 0 }
                    : reduced
                      ? { opacity: 0 }
                      : { y: "110%", rotate: 4 }
                }
                transition={{
                  duration: reduced ? 0.3 : duration,
                  delay: active ? base + delay + idx * step : 0,
                  ease: EASE_OUT,
                }}
              >
                {piece}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}

/** A hairline that draws itself across. */
export function Rule({
  delay = 0,
  className = "",
  vertical,
  duration = 1.4,
}: {
  delay?: number;
  className?: string;
  vertical?: boolean;
  duration?: number;
}) {
  const { active, reduced, delay: base } = usePageMotion();
  return (
    <motion.div
      aria-hidden
      className={`${vertical ? "w-px" : "h-px"} bg-current opacity-30 ${className}`}
      style={{ transformOrigin: vertical ? "top" : "left" }}
      initial={{ [vertical ? "scaleY" : "scaleX"]: 0 }}
      animate={{ [vertical ? "scaleY" : "scaleX"]: active ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : duration, delay: active ? base + delay : 0, ease: EASE_OUT }}
    />
  );
}

/** A layer that drifts against the pointer, for 2.5D depth. */
export function Parallax({
  depth = 20,
  children,
  className,
  style,
}: {
  depth?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const { px, py, reduced } = usePageMotion();
  const x = useTransform(px, (v) => (reduced ? 0 : v * -depth));
  const y = useTransform(py, (v) => (reduced ? 0 : v * -depth * 0.6));
  return (
    <motion.div className={className} style={{ ...style, x, y }}>
      {children}
    </motion.div>
  );
}
