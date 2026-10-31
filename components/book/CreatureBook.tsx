"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { PageMotionContext } from "@/components/motion/PageContext";
import { PageNavigation } from "./PageNavigation";
import { BookPage } from "./BookPage";

const THEME: Record<PageSpec["theme"], string> = {
  abyss: "bg-abyss text-ivory",
  deep: "bg-deep text-ivory",
  teal: "bg-teal text-ivory",
  ivory: "bg-ivory text-ink",
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

function mediaOf(page: PageSpec, book: Book): MediaAsset[] {
  const d = (page.data ?? {}) as Record<string, unknown>;
  const list = [d.media, d.still, book.creature.image].filter(Boolean) as MediaAsset[];
  return page.layout === "cover" || page.layout === "profile" ? list : list.filter((m) => m !== book.creature.image || d.media === m);
}

export function CreatureBook({ book }: { book: Book }) {
  const router = useRouter();
  const total = book.pages.length;
  const reduced = useReducedMotion() ?? false;
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const indexRef = useRef(0);
  const lockUntil = useRef(0);
  const [contentsOpen, setContentsOpen] = useState(false);

  const go = useCallback(
    (target: number, force = false) => {
      const t = Math.max(0, Math.min(total - 1, target));
      if (t === indexRef.current) return;
      const now = performance.now();
      if (!force && now < lockUntil.current) return;
      lockUntil.current = now + (reduced ? 250 : 720);
      setState([t, t > indexRef.current ? 1 : -1]);
      indexRef.current = t;
    },
    [total, reduced],
  );
  const next = useCallback(() => go(indexRef.current + 1), [go]);
  const prev = useCallback(() => go(indexRef.current - 1), [go]);

  const close = useCallback(() => {
    let fromLibrary = false;
    try {
      fromLibrary = sessionStorage.getItem("ob:from-library") === "1";
      sessionStorage.removeItem("ob:from-library");
    } catch {}
    if (fromLibrary && window.history.length > 1) router.back();
    else router.push("/#library");
  }, [router]);

  /* Deep links: #3 opens chapter three. The hash is kept in sync without
     adding history entries, so Back always returns to the library. */
  useEffect(() => {
    const read = () => {
      const n = parseInt(window.location.hash.slice(1), 10);
      if (n >= 1 && n <= total && n - 1 !== indexRef.current) {
        indexRef.current = n - 1;
        setState([n - 1, 1]);
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [total]);
  useEffect(() => {
    const url = `${window.location.pathname}${window.location.search}#${index + 1}`;
    window.history.replaceState(window.history.state, "", url);
  }, [index]);

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
        next();
      } else if (["ArrowLeft", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey)) {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, total, close, contentsOpen]);

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
      const atEdge = (dx > 0 && indexRef.current === 0) || (dx < 0 && indexRef.current === total - 1);
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
    if (dx < -threshold || v < -0.55) go(indexRef.current + 1, true);
    else if (dx > threshold || v > 0.55) go(indexRef.current - 1, true);
    animate(dragX, 0, { type: "spring", stiffness: 260, damping: 32 });
  };

  /* Wheel and trackpad: one gesture turns one page. */
  const wheel = useRef({ acc: 0, timer: 0 as unknown as ReturnType<typeof setTimeout> });
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (contentsOpen) return;
      const scroller = (e.target as HTMLElement).closest<HTMLElement>("[data-scroll]");
      if (scroller && scroller.scrollHeight > scroller.clientHeight + 2 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const atTop = scroller.scrollTop <= 0 && e.deltaY < 0;
        const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2 && e.deltaY > 0;
        if (!atTop && !atBottom) return;
      }
      e.preventDefault();
      const w = wheel.current;
      w.acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      clearTimeout(w.timer);
      w.timer = setTimeout(() => (w.acc = 0), 180);
      if (Math.abs(w.acc) > 70) {
        if (w.acc > 0) next();
        else prev();
        w.acc = 0;
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [next, prev, contentsOpen]);

  const page = book.pages[index];
  const neighbours = [book.pages[index + 1], book.pages[index - 1]].filter(Boolean);

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
        <AnimatePresence initial={false} custom={dir}>
          <motion.section
            key={page.id}
            custom={dir}
            variants={reduced ? fade : leaf}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduced ? 0.35 : TURN_DURATION, ease: EASE_CINE }}
            className={`absolute inset-0 ${THEME[page.theme]} ${reduced ? "" : "shadow-[-40px_0_80px_rgba(0,0,0,0.55)]"}`}
            aria-roledescription="page"
          >
            <motion.div className="absolute inset-0" style={{ x: dragX }}>
              <PageMotionContext.Provider value={{ active: true, reduced, delay: reduced ? 0 : ENTER_DELAY, px, py }}>
                <BookPage page={page} book={book} index={index} total={total} goTo={go} />
              </PageMotionContext.Provider>
            </motion.div>
            {!reduced && (
              <motion.div
                aria-hidden
                custom={dir}
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
        index={index}
        onPrev={prev}
        onNext={next}
        onGo={(i) => go(i, true)}
        onClose={close}
        contentsOpen={contentsOpen}
        setContentsOpen={setContentsOpen}
      />
    </div>
  );
}
