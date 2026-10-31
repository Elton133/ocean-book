import type { CategorySlug } from "./types";

export const CATEGORIES: { slug: CategorySlug; title: string; blurb: string; numeral: string }[] = [
  { slug: "deep-sea", numeral: "I", title: "Deep-Sea Creatures", blurb: "Life below the reach of sunlight, where pressure and darkness shape every body." },
  { slug: "bioluminescent", numeral: "II", title: "Bioluminescent Organisms", blurb: "Animals that make their own light — to hunt, hide or call to one another." },
  { slug: "intelligent", numeral: "III", title: "Intelligent Marine Animals", blurb: "Minds built on a different plan from ours, solving problems in their own way." },
  { slug: "camouflage", numeral: "IV", title: "Masters of Camouflage", blurb: "Shape, colour and texture used to disappear in plain sight." },
  { slug: "giants", numeral: "V", title: "Ocean Giants", blurb: "Record-breaking bodies in a world that supports enormous size." },
  { slug: "venomous", numeral: "VI", title: "Venomous Creatures", blurb: "Chemical weapons delivered by sting, spine or bite." },
  { slug: "transparent", numeral: "VII", title: "Transparent Creatures", blurb: "Bodies made of near-invisible tissue in open water." },
  { slug: "reproduction", numeral: "VIII", title: "Unusual Reproduction", blurb: "Strange strategies for making the next generation." },
  { slug: "ancient", numeral: "IX", title: "Ancient Marine Survivors", blurb: "Lineages that have persisted for many millions of years." },
];

export const categoryTitle = (slug: CategorySlug) => CATEGORIES.find((c) => c.slug === slug)?.title ?? slug;
