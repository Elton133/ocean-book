"use client";

import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { MediaAsset } from "@/lib/types";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";

/**
 * Full-bleed photograph with a slow Ken Burns push and pointer parallax —
 * the "camera move" of each spread.
 */
export function CinematicImage({
  media,
  priority,
  className = "",
  depth = 18,
  zoom = [1.14, 1.04],
  sizes = "100vw",
  focal,
  duration = 14,
}: {
  media: MediaAsset;
  priority?: boolean;
  className?: string;
  depth?: number;
  zoom?: [number, number];
  sizes?: string;
  focal?: string;
  duration?: number;
}) {
  const { active, reduced, px, py } = usePageMotion();
  const x = useTransform(px, (v) => (reduced ? 0 : v * -depth));
  const y = useTransform(py, (v) => (reduced ? 0 : v * -depth * 0.6));
  const ratio = media.width / media.height;
  const extreme = ratio > 2.1 || ratio < 0.7 || media.width < 1200;
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div className="absolute -inset-[4%]" style={{ x, y }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: reduced ? 1 : zoom[0], opacity: 0 }}
          animate={active ? { scale: reduced ? 1 : zoom[1], opacity: 1 } : { scale: reduced ? 1 : zoom[0], opacity: 0.4 }}
          transition={{
            scale: { duration: active ? duration : 0.6, ease: EASE_OUT },
            opacity: { duration: 1.2, ease: EASE_OUT },
          }}
        >
          {extreme ? (
            <>
              {/* Very wide plates or tall portraits are shown whole over a blurred wash of themselves. */}
              <Image src={media.src} alt="" fill sizes="50vw" className="scale-125 object-cover opacity-40 blur-2xl" />
              <Image
                src={media.src}
                alt={media.alt}
                fill
                priority={priority}
                sizes={sizes}
                className="object-contain px-[6vw] pb-[42vh] pt-[11vh] lg:pb-[36vh] lg:pl-[26vw]"
              />
            </>
          ) : (
            <Image
              src={media.src}
              alt={media.alt}
              fill
              priority={priority}
              sizes={sizes}
              className="object-cover"
              style={{ objectPosition: focal ?? media.focal ?? "50% 50%" }}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Short, muted documentary loop that only plays while its page is open. */
export function VideoClip({
  media,
  className = "",
  fit = "cover",
}: {
  media: MediaAsset;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const { active, reduced } = usePageMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && !reduced) v.play().catch(() => {});
    else v.pause();
  }, [active, reduced]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div className={`overflow-hidden ${/\babsolute\b/.test(className) ? "" : "relative"} ${className}`}>
      <video
        ref={ref}
        className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
        src={active ? media.src : undefined}
        poster={media.poster}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        muted
        loop
        playsInline
        preload="none"
        aria-label={media.alt}
      />
      <button
        type="button"
        onClick={toggle}
        data-no-drag
        className="annot absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-black/40 px-2.5 py-1.5 text-ivory/90 backdrop-blur-sm transition hover:bg-black/60"
        aria-label={playing ? "Pause video" : "Play video"}
      >
        <span aria-hidden className="inline-block w-2.5 text-center">{playing ? "❚❚" : "▶"}</span>
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}

/** Small attribution line. Always rendered next to the media it credits. */
export function Credit({ media, className = "" }: { media: MediaAsset; className?: string }) {
  return (
    <p className={`annot leading-snug opacity-60 ${className}`}>
      {media.type === "video" ? "Film" : media.type === "illustration" ? "Illustration" : "Photo"}:{" "}
      <a href={media.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:opacity-100">
        {media.creator}
      </a>{" "}
      ·{" "}
      {media.licenseUrl ? (
        <a href={media.licenseUrl} target="_blank" rel="noreferrer" className="hover:underline">
          {media.license}
        </a>
      ) : (
        media.license
      )}
    </p>
  );
}

/** Drifting particles of marine snow, rendered on a single canvas. */
export function MarineSnow({ density = 70, className = "" }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { active, reduced } = usePageMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const flakes = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      s: Math.random() * 0.00025 + 0.00008,
      d: Math.random() * Math.PI * 2,
      a: Math.random() * 0.5 + 0.15,
    }));
    let t = 0;
    const tick = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.s;
        f.x += Math.sin(t * 0.004 + f.d) * 0.00012;
        if (f.y > 1.02) {
          f.y = -0.02;
          f.x = Math.random();
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(225, 240, 235, ${f.a})`;
        ctx.arc(f.x * w, f.y * h, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    if (active) raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active, reduced, density]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

/** Certainty marker used beside every fact. */
export function CertaintyTag({ certainty, className = "" }: { certainty: "confirmed" | "hypothesis" | "uncertain"; className?: string }) {
  const map = {
    confirmed: { label: "Established", dot: "bg-current" },
    hypothesis: { label: "Hypothesis", dot: "border border-current" },
    uncertain: { label: "Uncertain", dot: "border border-dashed border-current" },
  }[certainty];
  return (
    <span className={`annot inline-flex items-center gap-1.5 uppercase tracking-[0.18em] opacity-70 ${className}`}>
      <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}

/** Superscript reference marker. */
export function Ref({ n }: { n?: number }) {
  if (n == null) return null;
  return (
    <sup className="annot ml-0.5 align-super text-[0.6rem] opacity-60" title={`Reference ${n + 1}`}>
      [{n + 1}]
    </sup>
  );
}
