import type { FlightStyle } from "./types";

/** The shelves of "Masters of the Air", in reading order. */
export const FLIGHT_STYLES: { slug: FlightStyle; title: string; line: string }[] = [
  { slug: "diving", title: "Divers", line: "Folding the wings and falling on prey faster than any other animal." },
  { slug: "soaring", title: "Soarers", line: "Riding rising air for hours without a wingbeat." },
  { slug: "hovering", title: "Hoverers", line: "Holding still in mid-air on a blur of wings." },
  { slug: "silent", title: "Silent Hunters", line: "Feathers built to make no sound at all." },
  { slug: "echolocating", title: "Night Fliers", line: "Finding their way and their food in the dark, by sound." },
  { slug: "migrating", title: "Great Travellers", line: "Wings that carry them across a continent, and back." },
  { slug: "foraging", title: "Foragers", line: "Flying the same routes, flower to flower, all day long." },
];

export const flightTitle = (s: FlightStyle) => FLIGHT_STYLES.find((f) => f.slug === s)?.title ?? s;
