"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Reveal, SplitText } from "@/components/motion/Reveal";
import { usePageMotion, type SpreadPart } from "@/components/motion/PageContext";

const MIN_SCALE = 0.6;

/**
 * Safe area inside the book chrome. Pages never scroll: if a composition is
 * taller than the page, it is set slightly smaller — the way a book designer
 * would re-set type to fit the page — so nothing is ever hidden.
 */
export function PageFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const el = contentRef.current;
    if (!box || !el) return;
    let raf = 0;

    // Width stays fixed (so pictures and diagrams keep their proportions);
    // the page gains height instead, then the whole composition is set smaller
    // and centred.
    const apply = (s: number, W: number, H: number) => {
      el.style.width = `${W}px`;
      el.style.height = `${H / s}px`;
      el.style.transform = s === 1 ? "" : `translateX(${((1 - s) * W) / 2}px) scale(${s})`;
    };
    // Height of the laid-out content, ignoring transforms (entrance animations
    // move things temporarily) and anything clipped inside a masking parent.
    const contentBottom = () => {
      let max = 0;
      const offsetIn = (n: HTMLElement) => {
        let y = 0;
        let cur: HTMLElement | null = n;
        while (cur && cur !== el) {
          y += cur.offsetTop;
          cur = cur.offsetParent as HTMLElement | null;
        }
        return y;
      };
      const walk = (node: Element) => {
        for (const child of node.children) {
          if (!(child instanceof HTMLElement)) continue;
          if (child.offsetHeight === 0 && child.offsetWidth === 0) continue;
          const pos = getComputedStyle(child).position;
          if (pos === "fixed") continue;
          max = Math.max(max, offsetIn(child) + child.offsetHeight);
          const ov = getComputedStyle(child).overflowY;
          if (ov === "hidden" || ov === "clip") continue;
          walk(child);
        }
      };
      walk(el);
      return max;
    };
    const fits = (s: number, W: number, H: number) => {
      apply(s, W, H);
      return contentBottom() <= H / s + 1;
    };
    const fit = () => {
      const W = box.clientWidth;
      const H = box.clientHeight;
      if (!W || !H) return;
      if (fits(1, W, H)) return;
      let lo = MIN_SCALE;
      let hi = 1;
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid, W, H)) lo = mid;
        else hi = mid;
      }
      apply(lo, W, H);
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };

    fit();
    const ro = new ResizeObserver(schedule);
    ro.observe(box);
    el.querySelectorAll(":scope > *, :scope > * > *, :scope > * > * > *").forEach((n) => ro.observe(n));
    // Fonts arriving late, and choreography settling, change measurements.
    document.fonts?.ready.then(schedule);
    const timers = [900, 2200, 4000].map((t) => setTimeout(schedule, t));
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden px-5 pb-28 pt-16 sm:px-10 sm:pt-20 lg:px-16 lg:pb-28 lg:pt-24 ${className}`}>
      <div ref={boxRef} className="relative h-full w-full">
        <div ref={contentRef} className="absolute left-0 top-0 h-full w-full origin-top-left">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Marks which page of a spread a block belongs to. On wide screens the whole
 * spread is shown; on narrow screens each part becomes its own page.
 */
export function Side({ part, children, className }: { part: Exclude<SpreadPart, "all">; children: ReactNode; className?: string }) {
  const { part: current } = usePageMotion();
  if (current !== "all" && current !== part) return null;
  return className ? <div className={className}>{children}</div> : <>{children}</>;
}

/** True when this part of the spread is visible. */
export function useShows(part: Exclude<SpreadPart, "all">) {
  const { part: current } = usePageMotion();
  return current === "all" || current === part;
}

export function ChapterMark({ chapter, label, delay = 0, className = "" }: { chapter: string; label?: string; delay?: number; className?: string }) {
  return (
    <Reveal delay={delay} from="left" className={`eyebrow flex items-center gap-3 opacity-70 ${className}`}>
      <span>Chapter {chapter}</span>
      <span aria-hidden className="h-px w-8 bg-current opacity-50" />
      {label && <span>{label}</span>}
    </Reveal>
  );
}

export function PageTitle({
  text,
  className = "",
  delay = 0.1,
  by = "word",
  as = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  by?: "word" | "char";
  as?: "h1" | "h2" | "h3";
}) {
  return <SplitText as={as} text={text} by={by} delay={delay} className={`display block ${className}`} />;
}
