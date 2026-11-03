import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { regionCard } from "@/lib/explore";
import { REGIONS } from "@/lib/world";
import { RegionView } from "@/components/explore/RegionView";

export function generateStaticParams() {
  return REGIONS.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/explore/[region]">): Promise<Metadata> {
  const { region } = await params;
  const r = regionCard(region);
  if (!r) return {};
  return { title: `${r.name} — The Living World`, description: r.line };
}

export default async function RegionPage({ params }: PageProps<"/explore/[region]">) {
  const { region } = await params;
  const r = regionCard(region);
  if (!r) notFound();
  return <RegionView region={r} />;
}
