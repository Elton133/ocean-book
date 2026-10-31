import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { creatures, getBook, getCreature } from "@/lib/catalogue";
import { CreatureBook } from "@/components/book/CreatureBook";

export function generateStaticParams() {
  return creatures.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/creatures/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCreature(slug);
  if (!c) return {};
  return {
    title: `${c.commonName} (${c.scientificName})`,
    description: c.summary,
    openGraph: c.image ? { images: [{ url: c.image.src, width: c.image.width, height: c.image.height, alt: c.image.alt }] } : undefined,
  };
}

export default async function CreaturePage({ params }: PageProps<"/creatures/[slug]">) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();
  return <CreatureBook book={book} />;
}
