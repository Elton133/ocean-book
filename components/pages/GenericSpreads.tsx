"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { MediaAsset } from "@/lib/types";
import type { PageProps } from "@/components/book/BookPage";
import { categoryTitle } from "@/lib/categories";
import { EASE_OUT } from "@/lib/motion";
import { usePageMotion } from "@/components/motion/PageContext";
import { Parallax, Reveal, Rule, SplitText } from "@/components/motion/Reveal";
import { CertaintyTag, CinematicImage, Credit, MarineSnow, Ref } from "@/components/media/Media";
import { TaxonomyLadder } from "@/components/diagrams/TaxonomyLadder";
import { DepthGauge } from "@/components/diagrams/DepthGauge";
import { ChapterMark, PageFrame, PageTitle, Side } from "./Frame";

/** When a species has no verified photograph, the cover is purely typographic. */
function TypeCover({ name }: { name: string }) {
  const { reduced } = usePageMotion();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 70% 35%, rgba(111,214,200,0.18), transparent 70%), radial-gradient(50% 50% at 20% 80%, rgba(10,29,51,0.9), transparent)" }}
        animate={reduced ? undefined : { scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <Parallax depth={30} className="absolute -right-[5vw] top-[8vh] select-none">
        <span aria-hidden className="display block text-[42vw] italic leading-none text-ivory/[0.04]">
          {name.charAt(0)}
        </span>
      </Parallax>
    </div>
  );
}

/* Cover -------------------------------------------------------------- */
export function CoverSpread({ book }: PageProps) {
  const c = book.creature;
  const long = c.commonName.length > 18;
  return (
    <div className="absolute inset-0">
      {c.image ? (
        <>
          <CinematicImage media={c.image} priority zoom={[1.2, 1.04]} duration={18} depth={24} />
          <div className={`absolute inset-0 bg-gradient-to-r ${c.image.tone === "light" ? "from-abyss/95 via-abyss/70" : "from-abyss/90 via-abyss/45"} to-transparent`} />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss via-transparent to-abyss/40" />
        </>
      ) : (
        <TypeCover name={c.commonName} />
      )}
      <MarineSnow density={60} />
      <div className="absolute inset-0 flex flex-col justify-end px-5 pb-36 sm:px-10 lg:px-16 lg:pb-32">
        <h1 className={`display max-w-[16ch] leading-[0.86] ${long ? "text-[clamp(3rem,8vw,8.5rem)]" : "text-[clamp(3.4rem,11vw,11.5rem)]"}`}>
          <SplitText text={c.commonName} by="char" delay={0.2} stagger={0.03} />
        </h1>
        <Reveal delay={1.1} className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="display text-2xl italic opacity-90">{c.scientificName}</span>
          {c.authority && <span className="annot opacity-60">{c.authority}</span>}
        </Reveal>
        <Reveal delay={1.3}>
          <p className="lede mt-4 max-w-xl opacity-85">{c.tagline}.</p>
        </Reveal>
      </div>
      {c.image && <Credit media={c.image} className="absolute bottom-24 right-5 max-w-xs text-right sm:right-10 lg:bottom-[5.5rem] lg:right-16" />}
    </div>
  );
}

/* Profile ------------------------------------------------------------ */
export function ProfileSpread({ book, page }: PageProps) {
  const c = book.creature;
  const rows: [string, string, string?][] = [
    ["Phylum", c.taxonomy.phylum],
    ["Class", c.taxonomy.class],
    ["Order", c.taxonomy.order],
    ["Family", c.taxonomy.family],
    ["Species", c.scientificName, c.authority],
  ];
  const stats: [string, string][] = [
    ["Size", c.stats.size],
    ["Depth", c.stats.depth],
    ["Range", c.stats.range],
    ["Diet", c.stats.diet],
    ["Status", c.stats.conservation],
  ];
  const vintage = c.image && (c.image.type === "illustration" || c.image.setting === "illustration");
  return (
    <PageFrame>
      <div className="grid h-full gap-10 lg:grid-cols-12 lg:gap-10">
        <Side part="a" className="flex flex-col justify-center lg:col-span-4 lg:justify-start">
          <ChapterMark chapter={page.chapter} label={c.group} />
          <PageTitle text={page.title} className="mt-4 text-[clamp(2.6rem,4.6vw,4.8rem)]" />
          <Reveal delay={0.7}>
            <p className="lede mt-5 opacity-80">{c.summary}</p>
          </Reveal>
          <div className="mt-8">
            <TaxonomyLadder rows={rows} delay={0.8} />
          </div>
          {c.categories.length > 0 && (
            <Reveal delay={1.4} className="mt-6">
              <p className="text-sm italic opacity-70">Shelved under {c.categories.map(categoryTitle).join(", ")}.</p>
            </Reveal>
          )}
        </Side>

        <Side part="b" className="flex flex-col justify-center lg:col-span-5">
          {c.image ? (
            <Reveal delay={0.3} from="none" duration={1.6}>
              {/* A plate: double rule, number, figure caption — photograph or engraving alike */}
              <figure className="relative border border-ink/45 p-3 outline outline-1 outline-offset-[5px] outline-ink/20">
                <div className="flex items-baseline justify-between border-b border-ink/20 pb-2">
                  <span className="display text-sm uppercase tracking-[0.3em]">Plate I.</span>
                  <span className="display text-sm italic opacity-70">{c.taxonomy.family}</span>
                </div>
                <div className={`relative mt-3 aspect-[4/3] w-full overflow-hidden ${vintage ? "" : "bg-ink/5"}`}>
                  <motion.div
                    className="absolute inset-0"
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={{ clipPath: "inset(0 0% 0 0)" }}
                    transition={{ duration: 1.6, delay: 0.9, ease: [0.83, 0, 0.17, 1] }}
                  >
                    <Image
                      src={c.image.src}
                      alt={c.image.alt}
                      fill
                      sizes="(min-width:1024px) 40vw, 100vw"
                      className={vintage ? "object-contain mix-blend-multiply [filter:sepia(0.45)_contrast(1.08)]" : "object-cover"}
                      style={vintage ? undefined : { objectPosition: c.image.focal }}
                    />
                  </motion.div>
                </div>
                <figcaption className="mt-3 border-t border-ink/20 pt-2">
                  <p className="text-sm italic leading-snug opacity-80">
                    <span className="not-italic opacity-60">Fig. 1. </span>
                    {c.image.caption}
                  </p>
                  <Credit media={c.image} className="mt-1" />
                </figcaption>
              </figure>
            </Reveal>
          ) : (
            <div className="grid aspect-[4/3] place-items-center border border-ink/15">
              <p className="display max-w-xs text-center text-lg italic opacity-60">No openly licensed, verified photograph of this species was found. We would rather show none than the wrong animal.</p>
            </div>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 lg:hidden">
            {stats.slice(0, 4).map(([k, v]) => (
              <div key={k} className="border-t border-ink/20 pt-1.5">
                <dt className="annot uppercase tracking-[0.2em] opacity-50">{k}</dt>
                <dd className="text-sm leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
        </Side>

        <Side part="b" className="hidden flex-col justify-center gap-4 lg:col-span-3 lg:flex">
          <dl className="contents">
            {stats.map(([k, v], i) => (
              <Reveal key={k} delay={1.1 + i * 0.1} className="border-t border-ink/20 pt-2.5">
                <dt className="annot uppercase tracking-[0.2em] opacity-50">{k}</dt>
                <dd className="mt-1 text-[0.95rem] leading-snug">{v}</dd>
              </Reveal>
            ))}
          </dl>
        </Side>
      </div>
    </PageFrame>
  );
}

/* Feature fact ------------------------------------------------------- */
export function FeatureSpread({ book, page }: PageProps) {
  const c = book.creature;
  const d = (page.data ?? {}) as { fact: number; media?: MediaAsset };
  const f = c.facts[d.fact];
  const media = d.media;
  return (
    <div className="absolute inset-0">
      {media && (
        <div className="absolute inset-y-0 right-0 w-full lg:w-[58%]">
          <CinematicImage media={media} sizes="(min-width:1024px) 60vw, 100vw" zoom={[1.16, 1.04]} />
          {media.tone === "light" && <div className="absolute inset-0 bg-abyss/30" />}
          <div className="absolute inset-0 bg-abyss/55 lg:bg-transparent" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-abyss via-abyss/20 to-transparent lg:block" />
          <Credit media={media} className="absolute bottom-24 right-5 max-w-xs text-right sm:right-10 lg:bottom-[5.5rem] lg:right-16" />
        </div>
      )}
      {!media && (
        <>
          <MarineSnow density={40} className="opacity-60" />
          <Parallax depth={24} className="pointer-events-none absolute -right-[4vw] bottom-[6vh] select-none">
            <span aria-hidden className="display block text-[38vw] italic leading-none text-ivory/[0.045] lg:text-[30vw]">
              {c.scientificName.split(" ")[0]}
            </span>
          </Parallax>
        </>
      )}
      <PageFrame>
        <div className={`flex h-full flex-col justify-center ${media ? "max-w-xl" : "max-w-3xl"}`}>
          <ChapterMark chapter={page.chapter} label="Feature" />
          <PageTitle text={f.title} className="mt-5 text-[clamp(3rem,6.5vw,7rem)] leading-[0.9]" />
          <Rule delay={0.6} className="my-6 w-24" />
          <Reveal delay={0.8}>
            <p className="display text-[clamp(1.4rem,2vw,2rem)] leading-snug opacity-90">
              {f.text}
              <Ref n={f.ref} />
            </p>
          </Reveal>
          <Reveal delay={1.1} className="mt-5">
            <CertaintyTag certainty={f.certainty} />
          </Reveal>
        </div>
      </PageFrame>
    </div>
  );
}

/* Field notes -------------------------------------------------------- */
export function FactSpread({ book, page }: PageProps) {
  const c = book.creature;
  const from = ((page.data ?? {}) as { from?: number }).from ?? 0;
  const facts = c.facts.slice(from);
  return (
    <div className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 85% 20%, rgba(111,214,200,0.12), transparent 70%)" }} />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-4 lg:justify-start">
            <ChapterMark chapter={page.chapter} />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3rem,6vw,6.4rem)] italic" />
            <Reveal delay={0.6}>
              <p className="lede mt-4 max-w-sm opacity-75">
                {c.commonName}, <i>{c.scientificName}</i> — observations from the literature, marked by how certain science is.
              </p>
            </Reveal>
            <Reveal delay={0.8} className="mt-6 flex flex-col gap-2">
              <CertaintyTag certainty="confirmed" />
              <CertaintyTag certainty="hypothesis" />
              <CertaintyTag certainty="uncertain" />
            </Reveal>
          </Side>
          <Side part="b" className="grid content-center gap-x-10 gap-y-7 sm:grid-cols-2 lg:col-span-8">
            {facts.map((f, i) => (
              <Reveal key={f.title} as="li" delay={0.7 + i * 0.14} className="relative">
                <Rule delay={0.7 + i * 0.14} className="mb-4" />
                <div className="flex items-start gap-4">
                  <span className="display text-5xl leading-none opacity-30">{String(i + from + 1).padStart(2, "0")}</span>
                  <div>
                    <CertaintyTag certainty={f.certainty} />
                    <p className="display mt-2 text-[1.75rem] leading-tight">{f.title}</p>
                    <p className="mt-2 text-sm leading-relaxed opacity-75">
                      {f.text}
                      <Ref n={f.ref} />
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}

/* Plate: a single photograph, given room ---------------------------- */
export function PlateSpread({ page }: PageProps) {
  const media = ((page.data ?? {}) as { media: MediaAsset }).media;
  return (
    <div className="absolute inset-0">
      <CinematicImage media={media} zoom={[1.08, 1]} duration={20} />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-abyss to-transparent" />
      <div className="absolute bottom-28 left-5 max-w-xl sm:left-10 lg:left-16">
        <ChapterMark chapter={page.chapter} label="Plate" />
        <Reveal delay={0.6}>
          <p className="display mt-3 text-2xl italic leading-snug sm:text-3xl">{media.caption}</p>
          <Credit media={media} className="mt-2" />
        </Reveal>
      </div>
    </div>
  );
}

/* Its world: depth and range ---------------------------------------- */
export function DepthSpread({ book, page }: PageProps) {
  const c = book.creature;
  const { active, delay, reduced } = usePageMotion();
  return (
    <div className="absolute inset-0">
      <MarineSnow density={50} className="opacity-70" />
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(111,214,200,0.12) 0%, rgba(6,20,36,0) 35%, rgba(0,0,0,0.6) 100%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 2, delay: active ? delay : 0, ease: EASE_OUT }}
      />
      <PageFrame>
        <div className="grid h-full gap-10 lg:grid-cols-12">
          <Side part="a" className="flex flex-col justify-center lg:col-span-6 lg:justify-start">
            <ChapterMark chapter={page.chapter} />
            <PageTitle text={page.title} className="mt-4 text-[clamp(3.2rem,7vw,7rem)]" />
            <dl className="mt-8 grid max-w-xl gap-6">
              {[
                ["Where", c.stats.range],
                ["How deep", c.stats.depth],
                ["What it eats", c.stats.diet],
              ].map(([k, v], i) => (
                <Reveal key={k} delay={0.7 + i * 0.15} className="grid grid-cols-[7rem_1fr] gap-4 border-t border-ivory/15 pt-3">
                  <dt className="annot uppercase tracking-[0.18em] opacity-50">{k}</dt>
                  <dd className="lede opacity-90">{v}</dd>
                </Reveal>
              ))}
            </dl>
          </Side>
          <Side part="b" className="flex items-center justify-center lg:col-span-6">
            <DepthGauge min={c.depthRange.min} max={c.depthRange.max} label={c.commonName} approx={c.depthRange.approx} className="w-full max-w-sm" height={400} />
          </Side>
        </div>
      </PageFrame>
    </div>
  );
}
