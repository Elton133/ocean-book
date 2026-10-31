"use client";

import Image from "next/image";
import Link from "next/link";
import type { Book, MediaAsset } from "@/lib/types";
import type { PageProps } from "@/components/book/BookPage";
import { Reveal, Rule } from "@/components/motion/Reveal";
import { CertaintyTag, Ref } from "@/components/media/Media";
import { ChapterMark, PageTitle } from "./Frame";

const isMedia = (v: unknown): v is MediaAsset =>
  !!v && typeof v === "object" && "src" in v && "license" in v && "sourceUrl" in v;

/** Every asset used anywhere in the book, so credits are always complete. */
function mediaCredits(book: Book): MediaAsset[] {
  const seen = new Map<string, MediaAsset>();
  const add = (m: unknown) => isMedia(m) && !seen.has(m.src) && seen.set(m.src, m);
  add(book.creature.image);
  book.creature.gallery?.forEach(add);
  for (const p of book.pages) Object.values(p.data ?? {}).forEach(add);
  return [...seen.values()];
}

export function ClosingSpread({ book, page }: PageProps) {
  const c = book.creature;
  const d = (page.data ?? {}) as { conservation?: { status: string; detail: string; refs?: number[] } };
  const credits = mediaCredits(book);
  const status = d.conservation?.status ?? c.stats.conservation.replace(/^IUCN:\s*/i, "");
  return (
    <div data-scroll className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain px-5 pb-36 pt-20 sm:px-10 lg:px-16 lg:pt-24">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Left: title, in brief, conservation */}
        <div className="lg:col-span-4">
          <ChapterMark chapter={page.chapter} />
          <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6rem)] italic" />
          <Reveal delay={0.6} className="mt-8">
            <p className="annot mb-2 uppercase tracking-[0.2em] opacity-50">Conservation</p>
            <p className="display text-4xl text-rust">{status}</p>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              {d.conservation?.detail ?? `Status as recorded for ${c.scientificName}.`}
              {d.conservation?.refs?.map((r) => <Ref key={r} n={r} />)}
            </p>
          </Reveal>
          {c.notes && (
            <Reveal delay={0.8} className="mt-8 border-l border-ink/30 pl-4">
              <p className="annot mb-1 uppercase tracking-[0.2em] opacity-50">Editor&apos;s note</p>
              <p className="text-xs leading-relaxed opacity-70">{c.notes}</p>
            </Reveal>
          )}
        </div>

        {/* Middle: facts in brief */}
        <div className="lg:col-span-4">
          <Reveal delay={0.4}>
            <p className="annot mb-3 uppercase tracking-[0.2em] opacity-50">Remember this</p>
          </Reveal>
          <ol className="space-y-4">
            {c.facts.map((f, i) => (
              <Reveal key={f.title} as="li" delay={0.5 + i * 0.08}>
                <Rule delay={0.5 + i * 0.08} className="mb-3" />
                <div className="flex items-baseline justify-between gap-3">
                  <p className="display text-2xl leading-tight">{f.title}</p>
                  <CertaintyTag certainty={f.certainty} className="shrink-0" />
                </div>
                <p className="mt-1 text-sm leading-relaxed opacity-75">
                  {f.text}
                  <Ref n={f.ref} />
                </p>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Right: references and credits */}
        <div className="lg:col-span-4">
          <Reveal delay={0.6}>
            <p className="annot mb-3 uppercase tracking-[0.2em] opacity-50">References</p>
            <ol className="space-y-2.5">
              {c.references.map((r, i) => (
                <li key={i} className="grid grid-cols-[2rem_1fr] text-xs leading-relaxed">
                  <span className="annot opacity-50">[{i + 1}]</span>
                  <span>
                    {r.authors && <span className="opacity-70">{r.authors} </span>}
                    {r.year && <span className="opacity-70">({r.year}). </span>}
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noreferrer" className="underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
                        {r.title}
                      </a>
                    ) : (
                      r.title
                    )}
                    <span className="opacity-60"> — {r.publisher}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.8} className="mt-8">
            <p className="annot mb-3 uppercase tracking-[0.2em] opacity-50">Image &amp; film credits</p>
            <ul className="space-y-1.5 text-xs leading-relaxed opacity-80">
              {credits.map((m) => (
                <li key={m.src}>
                  <a href={m.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
                    {m.caption.replace(/\.$/, "")}
                  </a>{" "}
                  — {m.creator},{" "}
                  {m.licenseUrl ? (
                    <a href={m.licenseUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      {m.license}
                    </a>
                  ) : (
                    m.license
                  )}
                  . <i>{m.species}</i>
                  {m.setting ? `, ${m.setting}` : ""}.
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* Continue reading */}
      {book.related.length > 0 && (
        <Reveal delay={1} className="mt-14">
          <div className="flex items-baseline justify-between border-t border-ink/20 pt-4">
            <p className="display text-3xl italic">Continue reading</p>
            <Link href="/#library" className="annot uppercase tracking-[0.2em] opacity-60 hover:opacity-100" data-no-drag>
              The full library →
            </Link>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {book.related.map((r) => (
              <li key={r.slug}>
                <Link href={`/creatures/${r.slug}`} className="group block" data-no-drag>
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink/10">
                    {r.image ? (
                      <Image src={r.image.src} alt={r.image.alt} fill sizes="25vw" className="object-cover transition duration-[1.4s] ease-out group-hover:scale-105" style={{ objectPosition: r.image.focal }} />
                    ) : (
                      <span className="display absolute inset-0 grid place-items-center text-6xl italic opacity-20">{r.commonName[0]}</span>
                    )}
                  </div>
                  <p className="display mt-2 text-xl leading-tight transition group-hover:translate-x-1">{r.commonName}</p>
                  <p className="text-xs italic opacity-60">{r.scientificName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  );
}
