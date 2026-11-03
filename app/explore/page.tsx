import type { Metadata } from "next";
import { regionCards } from "@/lib/explore";
import { ExploreGlobe } from "@/components/explore/ExploreGlobe";

export const metadata: Metadata = {
  title: "The Living World",
  description: "Turn the globe to find where the world's animals live, from the Amazon to the open ocean.",
};

export default function ExplorePage() {
  return <ExploreGlobe regions={regionCards()} />;
}
