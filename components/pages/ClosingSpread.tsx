"use client";

import Image from "next/image";
import Link from "next/link";
import type { Book, MediaAsset } from "@/lib/types";
import type { PageProps } from "@/components/book/BookPage";
import { Reveal, Rule } from "@/components/motion/Reveal";
import { CertaintyTag, Ref } from "@/components/media/Media";
import { ChapterMark, PageFrame, PageTitle, Side } from "./Frame";

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

/* Before You Leave: what to remember, how it is faring, where to read next. */
export function ClosingSpread({ book, page }: PageProps) {
  const c = book.creature;
  const d = (page.data ?? {}) as { conservation?: { status: string; detail: string; refs?: number[] } };
  const status = d.conservation?.status ?? c.stats.conservation.replace(/^IUCN:\s*/i, "");
  return (
    <PageFrame>
      <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-12">
        <Side part="a" className="flex flex-col lg:col-span-5">
          <ChapterMark chapter={page.chapter} />
          <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6rem)] italic" />
          <Reveal delay={0.6} className="mt-8">
            <p className="annot mb-2 uppercase tracking-[0.2em] opacity-50">Conservation</p>
            <p className="display text-4xl text-rust">{status}</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed opacity-80">
              {d.conservation?.detail ?? `Status as recorded for ${c.scientificName}.`}
              {d.conservation?.refs?.map((r) => <Ref key={r} n={r} />)}
            </p>
          </Reveal>

          {book.related.length > 0 && (
            <Reveal delay={0.9} className="mt-auto pt-8">
              <div className="flex items-baseline justify-between border-t border-ink/20 pt-3">
                <p className="display text-2xl italic">Continue reading</p>
                <Link href="/#library" className="annot uppercase tracking-[0.2em] opacity-60 hover:opacity-100" data-no-drag>
                  Library →
                </Link>
              </div>
              <ul className="mt-3 grid grid-cols-4 gap-3">
                {book.related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/creatures/${r.slug}`} className="group block" data-no-drag>
                      <div className="relative aspect-[4/5] overflow-hidden bg-ink/10">
                        {r.image ? (
                          <Image src={r.image.src} alt={r.image.alt} fill sizes="12vw" className="object-cover transition duration-[1.4s] ease-out group-hover:scale-105" style={{ objectPosition: r.image.focal }} />
                        ) : (
                          <span className="display absolute inset-0 grid place-items-center text-4xl italic opacity-20">{r.commonName[0]}</span>
                        )}
                      </div>
                      <p className="display mt-1.5 text-base leading-tight">{r.commonName}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </Side>

        <Side part="b" className="flex flex-col justify-center lg:col-span-7">
          <Reveal delay={0.4}>
            <p className="annot mb-3 uppercase tracking-[0.2em] opacity-50">Remember this</p>
          </Reveal>
          <ol className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
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
        </Side>
      </div>
    </PageFrame>
  );
}

/* Sources & Credits: the endnotes of the book. */
export function SourcesSpread({ book, page }: PageProps) {
  const c = book.creature;
  const credits = mediaCredits(book);
  return (
    <PageFrame>
      <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-12">
        <Side part="a" className="flex flex-col lg:col-span-7">
          <ChapterMark chapter={page.chapter} />
          <PageTitle text={page.title} className="mt-4 text-[clamp(2.6rem,5vw,5rem)] italic" />
          <Reveal delay={0.5} className="mt-6">
            <p className="annot mb-3 uppercase tracking-[0.2em] opacity-50">References</p>
            <ol className="gap-8 text-[0.8rem] leading-relaxed sm:columns-2">
              {c.references.map((r, i) => (
                <li key={i} className="mb-2.5 grid break-inside-avoid grid-cols-[2rem_1fr]">
                  <span className="annot opacity-50">[{i + 1}]</span>
                  <span>
                    {r.authors && <span className="opacity-70">{r.authors} </span>}
                    {r.year && <span className="opacity-70">({r.year}). </span>}
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noreferrer" className="underline decoration-ink/30 underline-offset-2 hover:decoration-ink" data-no-drag>
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
        </Side>

        <Side part="b" className="flex flex-col justify-center gap-8 lg:col-span-5">
          <Reveal delay={0.7}>
            <p className="annot mb-3 uppercase tracking-[0.2em] opacity-50">Images &amp; film</p>
            <ul className="space-y-2 text-[0.8rem] leading-relaxed opacity-85">
              {credits.map((m) => (
                <li key={m.src}>
                  <a href={m.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-ink/30 underline-offset-2 hover:decoration-ink" data-no-drag>
                    {m.caption.replace(/\.$/, "")}
                  </a>{" "}
                  — {m.creator},{" "}
                  {m.licenseUrl ? (
                    <a href={m.licenseUrl} target="_blank" rel="noreferrer" className="hover:underline" data-no-drag>
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
          {c.notes && (
            <Reveal delay={0.9} className="border-l border-ink/30 pl-4">
              <p className="annot mb-1 uppercase tracking-[0.2em] opacity-50">Editor&apos;s note</p>
              <p className="text-xs leading-relaxed opacity-70">{c.notes}</p>
            </Reveal>
          )}
        </Side>
      </div>
    </PageFrame>
  );
}
