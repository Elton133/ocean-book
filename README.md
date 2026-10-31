# The Ocean Book

An immersive, horizontally paged natural-history book of extraordinary marine animals. It is built with Next.js 16, TypeScript, Tailwind CSS 4 and Framer Motion.

```bash
npm install
npm run dev        # runs scripts/build-catalogue.mjs first, then next dev
npm run build      # same, then a production build
```

## How it is organised

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | The Ocean Library: cinematic hero, featured volume, library shelf and search. |
| `app/creatures/[slug]/page.tsx` | A creature's book. Every creature is prerendered. |
| `lib/types.ts` | Content schema: `Creature`, `MediaAsset`, `Fact`, `Reference`, `PageSpec`, `Book`. |
| `lib/catalogue.ts` | Loads creatures. Hand-authored books override the generated ones. |
| `lib/book-builder.ts` | Builds a default book from a creature record. Page count adapts to the content, and signature interactive chapters are added where they genuinely help. |
| `data/creatures/*.json` | One researched record per species. Merged into `data/catalogue.generated.json` at dev or build time, with validation. |
| `data/books/giant-pacific-octopus.ts` | The fully authored 10-chapter octopus book. Copy and media live here; visuals live in components. |
| `components/book/` | The engine: `CreatureBook` (turns, drag, swipe, wheel, keyboard, hash deep links, reduced motion), `PageNavigation` (counter, progress, contents) and `BookPage` (layout registry). |
| `components/pages/` | Reusable spreads: cover, profile, feature, field notes, plate, depth, closing (references, credits, related). |
| `components/octopus/` | Octopus interactives: anatomy plate, skin lab (chromatophores and papillae), nervous system, circulation, ink escape, life cycle, range arc. |
| `components/signature/` | Signature interactives: anglerfish lure, mantis shrimp vision and strike, barreleye eyes, dumbo octopus swimming. |
| `components/motion/` | Motion primitives: `Reveal`, `SplitText` (kinetic type), `Rule`, `Parallax`, and the per-page motion context. |

### Adding a creature

1. Add `data/creatures/<slug>.json` that follows the `Creature` schema, and put its media in `public/media/creatures/<slug>/`.
2. Run `npm run catalogue`. The creature then appears in the library with an auto-built book.
3. Optionally, give it an authored book (see `AUTHORED` in `lib/catalogue.ts`) or a signature chapter (see `SIGNATURE` in `lib/book-builder.ts`).

### Motion

- A page turn is a layered leaf. The incoming page slides over the outgoing one (expo in-out, 1.15 s), while the outgoing page recedes and darkens.
- Inside each page, the choreography starts as the turn settles: kinetic type rising from masks, hairlines drawing themselves, slow Ken Burns pushes, and parallax driven by a spring-smoothed pointer.
- With `prefers-reduced-motion`, turns become short cross-fades. Ken Burns, parallax and particle systems are disabled.

## Content standards

- Each fact carries a `certainty` (`confirmed`, `hypothesis` or `uncertain`) and a reference index. Reference URLs were checked to resolve.
- Taxonomy follows WoRMS (accepted names and AphiaIDs).
- Media is openly licensed (PD, CC0, CC BY, CC BY-SA), mostly from Wikimedia Commons. Every asset stores its source URL, creator, licence, species, type and caption. Credits appear beside the media and are collected at the end of each book.
- Photographs must show the named species. Where no verified image exists, `image` is `null` and the book uses a typographic cover; a different animal is never used as a stand-in.
- Diagrams marked "illustrative" are teaching models, not measurements.
