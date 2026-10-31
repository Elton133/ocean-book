import { libraryIndex, getBook } from "@/lib/catalogue";
import { OceanLandingPage } from "@/components/library/OceanLandingPage";

export default function Home() {
  const entries = libraryIndex();
  const featured = getBook("giant-pacific-octopus")!;
  return (
    <OceanLandingPage
      entries={entries}
      featured={{
        creature: entries.find((e) => e.slug === featured.creature.slug)!,
        chapters: featured.pages.map((p) => ({ chapter: p.chapter, title: p.title })),
        summary: featured.creature.summary,
      }}
    />
  );
}
