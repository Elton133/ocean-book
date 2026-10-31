"use client";

import type { ReactNode } from "react";
import { Reveal, SplitText } from "@/components/motion/Reveal";

/**
 * Safe area inside the book chrome. On small screens a spread may scroll
 * vertically inside itself; on larger screens it is composed to fit.
 */
export function PageFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-scroll
      className={`no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain px-5 pb-32 pt-20 sm:px-10 lg:overflow-hidden lg:px-16 lg:pb-28 lg:pt-24 ${className}`}
    >
      {children}
    </div>
  );
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
