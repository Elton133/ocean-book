import type { CategorySlug, Realm } from "./types";

const INFO: Record<CategorySlug, { title: string; blurb: string }> = {
  "deep-sea": { title: "Deep-Sea Creatures", blurb: "Life below the reach of sunlight, where pressure and darkness shape every body." },
  bioluminescent: { title: "Bioluminescent Organisms", blurb: "Animals that make their own light — to hunt, hide or call to one another." },
  intelligent: { title: "Intelligent Marine Animals", blurb: "Minds built on a different plan from ours, solving problems in their own way." },
  camouflage: { title: "Masters of Camouflage", blurb: "Shape, colour and texture used to disappear in plain sight." },
  giants: { title: "Ocean Giants", blurb: "Record-breaking bodies in a world that supports enormous size." },
  venomous: { title: "Venomous Creatures", blurb: "Chemical weapons delivered by sting, spine or bite." },
  transparent: { title: "Transparent Creatures", blurb: "Bodies made of near-invisible tissue in open water." },
  reproduction: { title: "Unusual Reproduction", blurb: "Strange strategies for making the next generation." },
  ancient: { title: "Ancient Marine Survivors", blurb: "Lineages that have persisted for many millions of years." },
  "apex-predators": { title: "Apex Predators", blurb: "Hunters at the top of their food webs, shaping every animal beneath them." },
  "desert-survivors": { title: "Desert Survivors", blurb: "Bodies and habits tuned to scorching days, freezing nights and almost no water." },
  "rainforest-canopy": { title: "Life in the Canopy", blurb: "A world high above the forest floor, where many animals never touch the ground." },
  migrations: { title: "Great Journeys", blurb: "Animals that travel vast distances, following rain, grass or the seasons." },
  nocturnal: { title: "Creatures of the Night", blurb: "Senses sharpened for darkness, when the day's heat and hunters have gone." },
  endangered: { title: "On the Brink", blurb: "Species the IUCN lists as endangered or critically endangered." },
  fliers: { title: "Masters of the Air", blurb: "Wings of feather, skin and chitin: animals that soar, dive, hover and hunt by sound." },
};

/** Shelf order for each realm; camouflage and venomous appear on both. */
const SHELVES: Record<Realm, CategorySlug[]> = {
  ocean: ["deep-sea", "bioluminescent", "intelligent", "camouflage", "giants", "venomous", "transparent", "reproduction", "ancient"],
  land: ["fliers", "apex-predators", "desert-survivors", "rainforest-canopy", "migrations", "nocturnal", "camouflage", "venomous", "endangered"],
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export const shelvesFor = (realm: Realm) => SHELVES[realm].map((slug, i) => ({ slug, numeral: ROMAN[i], ...INFO[slug] }));

export const CATEGORIES = shelvesFor("ocean");
export const LAND_CATEGORIES = shelvesFor("land");

export const categoryTitle = (slug: CategorySlug) => INFO[slug]?.title ?? slug;
