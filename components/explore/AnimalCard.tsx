"use client";

import Image from "next/image";
import Link from "next/link";
import type { RegionAnimal } from "@/lib/explore";
import { biomeBySlug } from "@/lib/world";
import { markFromLibrary } from "@/components/library/CreatureLibrary";

/**
 * A field card for one animal. Documented animals open their book; the rest
 * say so plainly rather than lead to an empty page.
 */
export function AnimalCard({
  a,
  size = "md",
  highlight = false,
  onHover,
  onPick,
}: {
  a: RegionAnimal;
  size?: "sm" | "md" | "lg";
  highlight?: boolean;
  onHover?: (slug: string | null) => void;
  /** Used when the animal has no book yet. */
  onPick?: () => void;
}) {
  const biome = biomeBySlug(a.biome);
  const body = (
    <>
      <div className="absolute inset-0 overflow-hidden bg-deep">
        {a.thumb ? (
          <Image
            src={a.thumb.src}
            alt={a.thumb.alt}
            fill
            sizes={size === "lg" ? "(max-width: 640px) 50vw, 280px" : "160px"}
            className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <span aria-hidden className="display absolute -right-2 -top-6 text-[7rem] italic leading-none text-ivory/[0.07]">
            {a.commonName.charAt(0)}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      </div>
      <div className="relative mt-auto p-3">
        <span className="annot inline-flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.16em] opacity-75">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: biome.colour }} />
          {biome.name}
        </span>
        <span className={`display mt-1 block leading-tight ${size === "sm" ? "text-base" : "text-lg"}`}>{a.commonName}</span>
        <span className="block truncate text-[0.7rem] italic opacity-70">{a.scientificName}</span>
        {!a.documented && <span className="annot mt-1.5 block text-[0.55rem] uppercase tracking-[0.14em] text-sand">Documentary coming soon</span>}
      </div>
    </>
  );
  const cls = `group relative flex h-full w-full flex-col overflow-hidden rounded-[3px] border text-left text-ivory shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] transition-[border-color,transform] duration-500 ${
    highlight ? "border-ivory/70" : "border-ivory/15 hover:border-ivory/50"
  }`;
  const hover = {
    onPointerEnter: () => onHover?.(a.slug),
    onPointerLeave: () => onHover?.(null),
    onFocus: () => onHover?.(a.slug),
    onBlur: () => onHover?.(null),
  };
  return a.documented ? (
    <Link href={`/creatures/${a.slug}`} onClick={markFromLibrary} className={cls} {...hover}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onPick} className={cls} {...hover} aria-label={`${a.commonName} — documentary coming soon`}>
      {body}
    </button>
  );
}
