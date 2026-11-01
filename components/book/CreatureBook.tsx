"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "framer-motion";
import type { Book, MediaAsset, PageSpec } from "@/lib/types";
import { EASE_CINE, ENTER_DELAY, TURN_DURATION } from "@/lib/motion";
import { PageMotionContext, type SpreadPart } from "@/components/motion/PageContext";
import { PageNavigation } from "./PageNavigation";
import { BookPage, IMMERSIVE, LAYOUT_PARTS } from "./BookPage";

const THEME: Record<PageSpec["theme"], string> = {
  abyss: "bg-abyss text-ivory",
  deep: "bg-deep text-ivory",
  teal: "bg-teal text-ivory",
  ivory: "paper text-ink",
};

/* A soft light from above that says how deep this animal lives. */
const ZONE_GLOW: Record<Book["zone"], string | null> = {
  surface: "radial-gradient(110% 55% at 50% -12%, rgba(120,200,235,0.22), transparent 62%)",
  twilight: "radial-gradient(100% 45% at 50% -14%, rgba(70,130,190,0.12), transparent 60%)",
  midnight: null,
  abyssal: null,
  hadal: null,
};

/* The incoming leaf always travels the full width on top; the page beneath
   recedes and darkens — a layered turn rather than a flat carousel slide. */
const leaf: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-28%", scale: dir > 0 ? 1 : 0.94, zIndex: dir > 0 ? 2 : 1 }),
  center: { x: "0%", scale: 1, zIndex: 2 },
  exit: (dir: number) => ({ x: dir > 0 ? "-28%" : "100%", scale: dir > 0 ? 0.94 : 1, zIndex: dir > 0 ? 1 : 2 }),
};
const shade: Variants = {
  enter: (dir: number) => ({ opacity: dir > 0 ? 0 : 0.75 }),
  center: { opacity: 0 },
  exit: (dir: number) => ({ opacity: dir > 0 ? 0.75 : 0 }),
};
const fade: Variants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

const PARTS: Exclude<SpreadPart, "all">[] = ["a", "b", "c"];

export interface Entry {
  page: PageSpec;
  /** Chapter index into book.pages */
  ci: number;
  /** Part index within the spread (0 when shown whole) */
  pi: number;
  part: SpreadPart;
}

function mediaOf(page: PageSpec, book: Book): MediaAsset[] {
  const d = (page.data ?? {}) as Record<string, unknown>;
  const list = [d.media, d.still, book.creature.image].filter(Boolean) as MediaAsset[];
  return page.layout === "cover" || page.layout === "profile" ? list : list.filter((m) => m !== book.creature.image || d.media === m);
}

const NARROW = "(max-width: 1023px)";
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function CreatureBook({ book }: { book: Book }) {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);

  /* On narrow screens each spread becomes one or more single pages. */
  const entries = useMemo<Entry[]>(
    () =>
      book.pages.flatMap((page, ci): Entry[] => {
        const n = narrow ? (LAYOUT_PARTS[page.layout] ?? 1) : 1;
        return n === 1 ? [{ page, ci, pi: 0, part: "all" }] : PARTS.slice(0, n).map((part, pi) => ({ page, ci, pi, part }));
      }),
    [book.pages, narrow],
  );

  const [pos, setPos] = useState({ ci: 0, pi: 0, dir: 1 });
  const indexOf = (p: { ci: number; pi: number }, es: Entry[]) => {
    const exact = es.findIndex((e) => e.ci === p.ci && e.pi === p.pi);
    return exact >= 0 ? exact : Math.max(0, es.findIndex((e) => e.ci === p.ci));
  };
  const index = indexOf(pos, entries);
  const total = entries.length;

  const posRef = useRef(pos);
  const entriesRef = useRef(entries);
  useEffect(() => {
    posRef.current = pos;
    entriesRef.current = entries;
  }, [pos, entries]);
  const lockUntil = useRef(0);
  const [contentsOpen, setContentsOpen] = useState(false);

  const go = useCallback(
    (target: number, force = false) => {
      const es = entriesRef.current;
      const cur = indexOf(posRef.current, es);
      const t = Math.max(0, Math.min(es.length - 1, target));
      if (t === cur) return;
      const now = performance.now();
      if (!force && now < lockUntil.current) return;
      lockUntil.current = now + (reduced ? 250 : 720);
      const next = { ci: es[t].ci, pi: es[t].pi, dir: t > cur ? 1 : -1 };
      posRef.current = next;
      setPos(next);
    },
    [reduced],
  );
  const step = useCallback((d: number) => go(indexOf(posRef.current, entriesRef.current) + d), [go]);
  const goChapter = useCallback((ci: number) => go(entriesRef.current.findIndex((e) => e.ci === ci), true), [go]);

  const close = useCallback(() => {
    let fromLibrary = false;
    try {
      fromLibrary = sessionStorage.getItem("ob:from-library") === "1";
      sessionStorage.removeItem("ob:from-library");
    } catch {}
    if (fromLibrary && window.history.length > 1) router.back();
    else router.push("/#library");
  }, [router]);

  /* Deep links: #3 opens chapter three, #3b its second page on small screens.
     The hash is kept in sync without adding history entries, so Back always
     returns to the library. */
  useEffect(() => {
    const read = () => {
      const m = window.location.hash.match(/^#(\d+)([bc])?$/);
      if (!m) return;
      const ci = parseInt(m[1], 10) - 1;
      if (ci < 0 || ci >= book.pages.length) return;
      const pi = m[2] ? PARTS.indexOf(m[2] as "b" | "c") : 0;
      if (ci === posRef.current.ci && pi === posRef.current.pi) return;
      const next = { ci, pi, dir: 1 };
      posRef.current = next;
      setPos(next);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [book.pages.length]);
  const entry = entries[index];
  useEffect(() => {
    const suffix = entry.pi > 0 ? PARTS[entry.pi] : "";
    const url = `${window.location.pathname}${window.location.search}#${entry.ci + 1}${suffix}`;
    window.history.replaceState(window.history.state, "", url);
  }, [entry.ci, entry.pi]);

  /* Lock the document while reading. */
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  /* Keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable=true]")) return;
      if (e.key === "Escape") {
        if (contentsOpen) setContentsOpen(false);
        else close();
        return;
      }
      if (contentsOpen) return;
      if (["ArrowRight", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey && !el.closest("button"))) {
        e.preventDefault();
        step(1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(entriesRef.current.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, go, close, contentsOpen]);

  /* Pointer parallax, spring-smoothed so layers glide rather than track. */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 38, damping: 18, mass: 1 });
  const py = useSpring(rawY, { stiffness: 38, damping: 18, mass: 1 });

  /* Drag / swipe */
  const dragX = useMotionValue(0);
  const drag = useRef<{ x: number; y: number; t: number; id: number; horizontal: boolean | null } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (contentsOpen) return;
    const el = e.target as HTMLElement;
    if (el.closest("button, a, input, [data-no-drag]")) return;
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, horizontal: null };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    }
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.horizontal === null && Math.hypot(dx, dy) > 8) {
      d.horizontal = Math.abs(dx) > Math.abs(dy);
      if (d.horizontal) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (d.horizontal) {
      const i = indexOf(posRef.current, entriesRef.current);
      const atEdge = (dx > 0 && i === 0) || (dx < 0 && i === entriesRef.current.length - 1);
      dragX.set(dx * (atEdge ? 0.12 : 0.38));
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.horizontal) return;
    const dx = e.clientX - d.x;
    const v = dx / Math.max(1, performance.now() - d.t);
    const threshold = Math.min(140, window.innerWidth * 0.18);
    const i = indexOf(posRef.current, entriesRef.current);
    if (dx < -threshold || v < -0.55) go(i + 1, true);
    else if (dx > threshold || v > 0.55) go(i - 1, true);
    animate(dragX, 0, { type: "spring", stiffness: 260, damping: 32 });
  };

  /* Wheel and trackpad: one gesture turns one page. */
  const wheel = useRef({ acc: 0, timer: 0 as unknown as ReturnType<typeof setTimeout> });
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (contentsOpen) return;
      e.preventDefault();
      const w = wheel.current;
      w.acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      clearTimeout(w.timer);
      w.timer = setTimeout(() => (w.acc = 0), 180);
      if (Math.abs(w.acc) > 70) {
        step(w.acc > 0 ? 1 : -1);
        w.acc = 0;
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [step, contentsOpen]);

  const page = entry.page;
  const immersive = IMMERSIVE.has(page.layout);
  const dark = page.theme !== "ivory";
  const glow = dark && !immersive ? ZONE_GLOW[book.zone] : null;
  const neighbours = [entries[index + 1]?.page, entries[index - 1]?.page].filter((p): p is PageSpec => !!p && p !== page);

  return (
    <div
      className="fixed inset-0 select-none overflow-hidden bg-black"
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
        animate(dragX, 0, { type: "spring", stiffness: 260, damping: 32 });
      }}
    >
      <main aria-live="polite" aria-label={`${book.creature.commonName}, chapter ${page.chapter}: ${page.title}`} className="absolute inset-0">
        <AnimatePresence initial={false} custom={pos.dir}>
          <motion.section
            key={`${page.id}-${entry.part}`}
            custom={pos.dir}
            variants={reduced ? fade : leaf}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduced ? 0.35 : TURN_DURATION, ease: EASE_CINE }}
            className={`absolute inset-0 ${THEME[page.theme]} ${reduced ? "" : "shadow-[-40px_0_80px_rgba(0,0,0,0.55)]"}`}
            aria-roledescription="page"
          >
            <motion.div className="absolute inset-0" style={{ x: dragX }}>
              <PageMotionContext.Provider value={{ active: true, reduced, delay: reduced ? 0 : ENTER_DELAY, px, py, part: entry.part }}>
                <BookPage page={page} book={book} index={index} total={total} goTo={go} />
              </PageMotionContext.Provider>
              {glow && <div aria-hidden className="pointer-events-none absolute inset-0 z-20 mix-blend-screen" style={{ background: glow }} />}
              {/* The fold between the two pages of a spread. */}
              {!immersive && entry.part === "all" && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-40 -translate-x-1/2 lg:block"
                  style={{
                    background: dark
                      ? "linear-gradient(90deg, transparent, rgba(0,0,0,0.22) 48%, rgba(255,255,255,0.025) 50.5%, transparent)"
                      : "linear-gradient(90deg, transparent, rgba(70,45,15,0.09) 48%, rgba(255,255,255,0.18) 50.5%, transparent)",
                  }}
                />
              )}
            </motion.div>
            {!reduced && (
              <motion.div
                aria-hidden
                custom={pos.dir}
                variants={shade}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: TURN_DURATION, ease: EASE_CINE }}
                className="pointer-events-none absolute inset-0 z-40 bg-black"
              />
            )}
          </motion.section>
        </AnimatePresence>
      </main>

      {/* Warm the next and previous spreads' imagery so turns never reveal a blank page. */}
      <div aria-hidden className="pointer-events-none fixed h-px w-px overflow-hidden opacity-0">
        {neighbours.flatMap((p) =>
          mediaOf(p, book)
            .filter((m) => m.type !== "video")
            .map((m) => <Image key={p.id + m.src} src={m.src} alt="" width={16} height={9} sizes="100vw" loading="eager" />),
        )}
      </div>

      <PageNavigation
        book={book}
        entries={entries}
        index={index}
        immersive={immersive}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onGoChapter={goChapter}
        onClose={close}
        contentsOpen={contentsOpen}
        setContentsOpen={setContentsOpen}
      />
    </div>
  );
}
