import { libraryIndex, landIndex, getBook, getCreature, showcase } from "@/lib/catalogue";
import { LandingPage } from "@/components/library/LandingPage";
import type { FeaturedVolume, World } from "@/components/library/Featured";

/* The landing showcase moves between land, sky and sea, all photographed in the wild. */
const SHOWCASE = [
  "giant-pacific-octopus",
  "cheetah",
  "peregrine-falcon",
  "leafy-seadragon",
  "jaguar",
  "ruby-throated-hummingbird",
  "mimic-octopus",
  "african-bush-elephant",
  "snowy-owl",
  "blue-dragon",
  "fennec-fox",
  "monarch-butterfly",
  "orca",
  "peacock-mantis-shrimp",
  "lion",
  "blue-whale",
  "lions-mane-jellyfish",
  "giraffe",
];

/* One featured volume from each world. */
const FEATURED: { slug: string; world: string }[] = [
  { slug: "cheetah", world: "Land" },
  { slug: "peregrine-falcon", world: "Air" },
  { slug: "giant-pacific-octopus", world: "Sea" },
];

/* The photograph that stands for each world on the triptych. */
const WORLD_IMAGE = { land: "african-bush-elephant", air: "andean-condor", sea: "leafy-seadragon" };

export default function Home() {
  const entries = libraryIndex();
  const land = landIndex();
  const fliers = land.filter((e) => e.flight);

  const featured: FeaturedVolume[] = FEATURED.flatMap(({ slug, world }) => {
    const b = getBook(slug);
    if (!b) return [];
    return [
      {
        slug,
        world,
        commonName: b.creature.commonName,
        scientificName: b.creature.scientificName,
        summary: b.creature.summary,
        image: b.creature.image,
        chapters: b.pages.map((p) => ({ chapter: p.chapter, title: p.title })),
      },
    ];
  });

  const worlds: World[] = [
    { key: "land", title: "Land", line: "Rainforest, desert, savanna and ice — and the animals that walk, climb and burrow there.", href: "#land", count: land.length - fliers.length, image: getCreature(WORLD_IMAGE.land)?.image ?? null },
    { key: "air", title: "Air", line: "Wings of feather, skin and chitin: animals that soar, dive, hover and hunt by sound.", href: "#air", count: fliers.length, image: getCreature(WORLD_IMAGE.air)?.image ?? null },
    { key: "sea", title: "Sea", line: "Five oceans, from the sunlit shallows to the trenches, shelved ocean by ocean.", href: "#library", count: entries.length, image: getCreature(WORLD_IMAGE.sea)?.image ?? null },
  ];

  return <LandingPage entries={entries} land={land} slides={showcase(SHOWCASE)} featured={featured} worlds={worlds} />;
}
