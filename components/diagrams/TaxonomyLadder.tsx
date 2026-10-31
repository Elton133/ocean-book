"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";

/** Classification drawn as a descending ladder, one rank at a time. */
export function TaxonomyLadder({ rows, delay = 0.3 }: { rows: [string, string, string?][]; delay?: number }) {
  const { active, reduced, delay: base } = usePageMotion();
  const step = 0.11;
  return (
    <ol className="relative pl-6">
      <motion.span
        aria-hidden
        className="absolute bottom-3 left-[3px] top-3 w-px bg-current opacity-25"
        style={{ transformOrigin: "top" }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: active ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.4, delay: active ? base + delay : 0, ease: EASE_OUT }}
      />
      {rows.map(([rank, name, gloss], i) => {
        const italic = rank === "Genus" || rank === "Species";
        return (
          <motion.li
            key={rank}
            className="relative py-1.5"
            initial={{ opacity: 0, x: -12 }}
            animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: reduced ? 0.2 : 0.9, delay: active ? base + delay + 0.2 + i * step : 0, ease: EASE_OUT }}
          >
            <span aria-hidden className={`absolute -left-6 top-[0.95rem] h-[7px] w-[7px] rounded-full border border-current ${i === rows.length - 1 ? "bg-current" : ""}`} />
            <span className="annot block uppercase tracking-[0.2em] opacity-50">{rank}</span>
            <span className={`display block text-xl leading-tight sm:text-2xl ${italic ? "italic" : ""}`}>{name}</span>
            {gloss && <span className="block text-xs opacity-55">{gloss}</span>}
          </motion.li>
        );
      })}
    </ol>
  );
}
