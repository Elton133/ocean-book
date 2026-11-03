"use client";

import dynamic from "next/dynamic";
import type { RegionCard } from "@/lib/explore";

/* The globe draws with canvas and reads the window, so it is never prerendered. */
const WorldGlobe = dynamic(() => import("./WorldGlobe"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#02050a]" aria-hidden />,
});

export function ExploreGlobe({ regions }: { regions: RegionCard[] }) {
  return <WorldGlobe regions={regions} />;
}
