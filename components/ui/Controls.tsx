"use client";

import { motion } from "framer-motion";
import { useId, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

/*
 * Controls that read like the book rather than like an app: figure variants
 * set in italic, actions written as marginal instructions, a hairline slider.
 */

/** A set of figure variants — "a. Pale · b. Rock · c. Kelp" — one of which is shown. */
export function FigureChoice<T extends string>({
  options,
  value,
  onChange,
  label,
  className = "",
  numbered = true,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
  numbered?: boolean;
}) {
  const group = useId();
  return (
    <div role="radiogroup" aria-label={label} data-no-drag className={`flex flex-wrap items-baseline gap-x-1 gap-y-1 ${className}`}>
      {options.map((o, i) => {
        const on = o.id === value;
        return (
          <span key={o.id} className="inline-flex items-baseline">
            {i > 0 && <span aria-hidden className="mx-1.5 opacity-30">·</span>}
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.id)}
              className={`group relative inline-flex items-baseline gap-1.5 pb-1 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-50 hover:opacity-90"}`}
            >
              {numbered && <span className="annot opacity-60">{String.fromCharCode(97 + i)}.</span>}
              <span className="display text-lg italic leading-none sm:text-xl">{o.label}</span>
              {on && (
                <motion.span
                  layoutId={`fig-${group}`}
                  className="absolute inset-x-0 bottom-0 h-px bg-current"
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                />
              )}
            </button>
          </span>
        );
      })}
    </div>
  );
}

/** A written instruction the reader can act on: "↳ Startle it". */
export function Action({
  children,
  onClick,
  disabled,
  className = "",
  pressed,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      data-no-drag
      className={`group relative inline-flex items-baseline gap-2 pb-1 text-left transition-opacity duration-500 disabled:opacity-40 ${className}`}
    >
      <span aria-hidden className="annot opacity-60 transition-transform duration-500 group-hover:translate-x-0.5">↳</span>
      <span className="display text-lg italic leading-none sm:text-xl">{children}</span>
      <span aria-hidden className="absolute bottom-0 left-5 right-0 h-px origin-left scale-x-[0.25] bg-current opacity-60 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-disabled:scale-x-0" />
    </button>
  );
}

/** A hairline slider with words at either end. */
export function HairlineSlider({
  value,
  onChange,
  from,
  to,
  label,
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  from: string;
  to: string;
  label: string;
  className?: string;
}) {
  return (
    <label className={`flex items-center gap-3 ${className}`} data-no-drag>
      <span className="display shrink-0 text-base italic opacity-60">{from}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="book-range w-full"
        aria-label={label}
      />
      <span className="display shrink-0 text-base italic opacity-60">{to}</span>
    </label>
  );
}
