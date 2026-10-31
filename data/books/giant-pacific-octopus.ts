import type { Creature, MediaAsset, PageSpec } from "@/lib/types";

const M = "/media/creatures/giant-pacific-octopus";

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const octopusMedia = {
  encounter: {
    src: `${M}/encounter.webp`, width: 1920, height: 1440,
    alt: "A deep-red giant Pacific octopus resting against the glass, one eye open, suckers curled in the foreground.",
    caption: "Giant Pacific octopus at Monterey Bay Aquarium.",
    creator: "Bill Abbott", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    sourceUrl: commons("Giant_Pacific_octopus_at_Monterey_Bay_Aquarium_2014-1.jpg"),
    species: "Enteroctopus dofleini", type: "photograph", setting: "aquarium", focal: "52% 45%", tone: "dark",
  },
  eye: {
    src: `${M}/eye.webp`, width: 1920, height: 1440,
    alt: "Close-up of a giant Pacific octopus's eye with its horizontal slit pupil, set in wrinkled red skin.",
    caption: "The horizontal pupil of a giant Pacific octopus.",
    creator: "Bill Abbott", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    sourceUrl: commons("Giant_Pacific_octopus_at_Monterey_Bay_Aquarium_2014-2.jpg"),
    species: "Enteroctopus dofleini", type: "photograph", setting: "aquarium", focal: "48% 30%", tone: "dark",
  },
  fullBody: {
    src: `${M}/full-body.webp`, width: 1920, height: 1280,
    alt: "A giant Pacific octopus raised up on its arms on gravel, suckers visible along every arm.",
    caption: "Raised on its arms: the octopus walks as easily as it swims.",
    creator: "Cliff (Arlington, Virginia)", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    sourceUrl: commons("Giant_Pacific_Octopus_(Octopus_dofleini)_(7007259144).jpg"),
    species: "Enteroctopus dofleini", type: "photograph", setting: "aquarium", focal: "50% 50%", tone: "dark",
  },
  brooding: {
    src: `${M}/brooding.webp`, width: 1920, height: 1280,
    alt: "A female octopus watching from beneath the ceiling of her den, which is hung with dense pale strands of eggs.",
    caption: "A female beneath her hanging egg strands.",
    creator: "Un-chan (운짱)", license: "CC BY-SA 2.0 KR", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/kr/deed.en",
    sourceUrl: commons("Enteroctopus_dofleini_to_spawn.jpg"),
    species: "Enteroctopus dofleini", type: "photograph", setting: "aquarium", focal: "50% 40%", tone: "dark",
  },
  armsSpread: {
    src: `${M}/arms-spread.webp`, width: 1920, height: 1440,
    alt: "A giant Pacific octopus spreading its arms wide across pale rock, the webbing between them stretched.",
    caption: "Arms flung wide across the rock — the web between them can envelop prey.",
    creator: "Ricardo Tulio Gandelman", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    sourceUrl: commons("Oceanário_de_Lisboa_(8)_-_Mar_2010.jpg"),
    species: "Enteroctopus dofleini", type: "photograph", setting: "aquarium", focal: "50% 55%", tone: "dark",
  },
  magenta: {
    src: `${M}/magenta.webp`, width: 1920, height: 2107,
    alt: "A giant Pacific octopus under violet light, an arm curled to show rows of pale-rimmed suckers.",
    caption: "Two rows of suckers run the length of each arm.",
    creator: "Rhododendrites", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    sourceUrl: commons("Giant_Pacific_octopus_(11778)a.jpg"),
    species: "Enteroctopus dofleini", type: "photograph", setting: "aquarium", focal: "55% 60%", tone: "dark",
  },
  suckers: {
    src: `${M}/suckers.webp`, width: 1920, height: 1440,
    alt: "Arms of a giant Pacific octopus coiled over rock, rows of cream-coloured suckers facing the camera.",
    caption: "Each sucker can grip, taste and feel on its own.",
    creator: "Jim G (Silicon Valley, CA)", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    sourceUrl: commons("DSC26549,_Monterey_Bay_Aquarium,_California,_USA_(6364691645).jpg"),
    species: "Enteroctopus dofleini", type: "photograph", setting: "aquarium", focal: "60% 50%", tone: "dark",
  },
  orange: {
    src: `${M}/orange.webp`, width: 1920, height: 1440,
    alt: "A rust-orange giant Pacific octopus spread over rocks, its pale eye catching the light.",
    caption: "Giant Pacific octopus at the National Aquarium, Washington D.C.",
    creator: "Bachrach44", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: commons("Enteroctopus_dofleini_in_aquarium_rotated.jpg"),
    species: "Enteroctopus dofleini", type: "photograph", setting: "aquarium", focal: "50% 50%", tone: "dark",
  },
  denVideo: {
    src: `${M}/den.mp4`, poster: `${M}/den-poster.webp`, width: 1280, height: 720,
    alt: "Video: under a rocky ledge, a giant Pacific octopus shifts inside its den on the seafloor.",
    caption: "In its den on the Honey Bear wreck, Cove 2, Seattle, Washington. Excerpt, stabilised by the uploader.",
    creator: "John (Wikimedia Commons)", license: "CC BY 3.0", licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    sourceUrl: commons("Giant_Pacific_Octopus_in_Washington.webm"),
    species: "Enteroctopus dofleini", type: "video", setting: "in situ", tone: "dark",
  },
  eggsVideo: {
    src: `${M}/eggs.mp4`, poster: `${M}/eggs-poster.webp`, width: 1280, height: 720,
    alt: "Video: festoons of pale yellow eggs hang from a rock ceiling while the mother's suckers move among them.",
    caption: "A mother tends her eggs, Cove 2, Alki, Seattle. Excerpt.",
    creator: "Laura James", license: "CC BY 3.0", licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    sourceUrl: commons("Eggs_of_Giant_Pacific_Octopus.webm"),
    species: "Enteroctopus dofleini", type: "video", setting: "in situ", tone: "dark",
  },
} satisfies Record<string, MediaAsset>;

export const octopus: Creature = {
  slug: "giant-pacific-octopus",
  commonName: "Giant Pacific Octopus",
  scientificName: "Enteroctopus dofleini",
  authority: "(Wülker, 1910)",
  aphiaId: 342305,
  taxonomy: { phylum: "Mollusca", class: "Cephalopoda", order: "Octopoda", family: "Enteroctopodidae" },
  group: "Cephalopod",
  categories: ["intelligent", "camouflage", "giants", "reproduction"],
  tagline: "Eight arms, three hearts and a mind of its own",
  summary:
    "One of the largest octopuses on Earth, found across the cold North Pacific from Baja California to Japan. It learns, solves problems, recognises individual people and remakes its skin in moments.",
  ability: "colour and texture change, problem solving, taste by touch",
  stats: {
    size: "Arm span often over 4 m; adults average 20–30 kg",
    depth: "Intertidal to about 1,500 m",
    range: "North Pacific, Baja California to Alaska, the Aleutians, Japan and Korea",
    diet: "Crabs, clams, scallops, shrimp, fish; also scavenges",
    conservation: "IUCN: Least Concern (assessed 2014)",
  },
  depthRange: { min: 0, max: 1500 },
  accent: "#d9583a",
  facts: [
    { title: "Three hearts", text: "Two branchial hearts push blood through the gills; a third, the systemic heart, sends it around the body.", certainty: "confirmed", ref: 0 },
    { title: "Blue blood", text: "Its blood uses hemocyanin, a copper-based protein, to carry oxygen — which turns it blue.", certainty: "confirmed", ref: 0 },
    { title: "2,240 suckers", text: "A female carries about 2,240 suckers; males have roughly 100 fewer.", certainty: "confirmed", ref: 1 },
    { title: "Through a keyhole", text: "With a beak as its only hard part, a 20-kilogram octopus can squeeze through a hole about five centimetres wide.", certainty: "confirmed", ref: 0 },
    { title: "It knows faces", text: "In a Seattle Aquarium study, eight octopuses learned to tell apart two identically dressed people — one who fed them and one who prodded them.", certainty: "confirmed", ref: 3 },
    { title: "A single generation", text: "Females mate once, brood for up to six months without eating, and die around the time the eggs hatch.", certainty: "confirmed", ref: 0 },
  ],
  references: [
    { title: "Giant Pacific Octopus — Species Profile", publisher: "Alaska Department of Fish and Game", url: "https://www.adfg.alaska.gov/index.cfm?adfg=giantpacificoctopus.main" },
    { title: "Giant Pacific octopus — Animals A to Z", publisher: "Monterey Bay Aquarium", url: "https://www.montereybayaquarium.org/animals/animals-a-to-z/giant-pacific-octopus" },
    { title: "Enteroctopus dofleini (Wülker, 1910)", publisher: "World Register of Marine Species (WoRMS)", url: "https://www.marinespecies.org/aphia.php?p=taxdetails&id=342305" },
    { title: "Octopuses (Enteroctopus dofleini) recognize individual humans", publisher: "Journal of Applied Animal Welfare Science 13(3): 261–272", authors: "Anderson, R.C., Mather, J.A., Monette, M.Q. & Zimsen, S.R.M.", year: 2010, url: "https://pubmed.ncbi.nlm.nih.gov/20563906/" },
    { title: "Exploration, play and habituation in octopuses (Octopus dofleini)", publisher: "Journal of Comparative Psychology 113: 333–338", authors: "Mather, J.A. & Anderson, R.C.", year: 1999, url: "https://doi.org/10.1037/0735-7036.113.3.333" },
    { title: "Octopuses use a cephalopod-specific chemotactile receptor family for taste by touch", publisher: "Cell 183(3): 594–604", authors: "van Giesen, L., Kilian, P.B., Allard, C.A.H. & Bellono, N.W.", year: 2020, url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7605239" },
    { title: "An embodied view of octopus neurobiology", publisher: "Current Biology 22(20): R887–R892", authors: "Hochner, B.", year: 2012, url: "https://doi.org/10.1016/j.cub.2012.09.001" },
    { title: "Do octopuses' arms have a mind of their own?", publisher: "Okinawa Institute of Science and Technology (on Gutnick et al., Current Biology)", year: 2020, url: "https://www.oist.jp/node/35601" },
    { title: "Eye-independent, light-activated chromatophore expansion (LACE) and expression of phototransduction genes in the skin of Octopus bimaculoides", publisher: "Journal of Experimental Biology 218: 1513–1520", authors: "Ramirez, M.D. & Oakley, T.H.", year: 2015, url: "https://doi.org/10.1242/jeb.110908" },
    { title: "Cephalopod chromatophores: neurobiology and natural history", publisher: "Biological Reviews 76(4): 473–528", authors: "Messenger, J.B.", year: 2001, url: "https://doi.org/10.1017/S1464793101005772" },
    { title: "How many hearts does an octopus have?", publisher: "Live Science (interview with Kirt Onthank)", url: "https://www.livescience.com/how-many-hearts-does-an-octopus-have" },
    { title: "Enteroctopus dofleini — species summary (IUCN status)", publisher: "SeaLifeBase", url: "https://sealifebase.org/summary/58006" },
  ],
  image: octopusMedia.encounter,
  gallery: [octopusMedia.eye, octopusMedia.fullBody, octopusMedia.orange],
};

/* ------------------------------------------------------------------ */
/* The book: ten art-directed chapters. Copy lives here; visuals live   */
/* in components/octopus.                                              */
/* ------------------------------------------------------------------ */

export const octopusPages: PageSpec[] = [
  {
    id: "encounter", layout: "octo-encounter", chapter: "01", title: "The Encounter", theme: "abyss",
    data: {
      media: octopusMedia.encounter,
      lede: "In the cold coastal waters of the North Pacific lives one of the largest octopuses on Earth — a boneless animal whose arms can span more than four metres, whose skin rewrites itself in moments, and whose body can slip through a hole barely wider than its beak.",
      marks: ["Enteroctopus dofleini", "North Pacific · 0–1,500 m", "Lifespan 3–5 years"],
      refs: [0, 1],
    },
  },
  {
    id: "meet", layout: "octo-meet", chapter: "02", title: "Meet the Octopus", theme: "ivory",
    data: {
      kicker: "A mollusc that gave up its shell",
      lede: "Octopuses are cephalopods — literally ‘head-foot’ — relatives of snails and clams whose ancestors carried shells. This one keeps only a hard beak, hidden at the centre of eight arms.",
      taxonomy: [
        ["Kingdom", "Animalia", "Animals"],
        ["Phylum", "Mollusca", "Soft-bodied invertebrates"],
        ["Class", "Cephalopoda", "‘Head-foot’"],
        ["Order", "Octopoda", "Eight-armed"],
        ["Family", "Enteroctopodidae", ""],
        ["Genus", "Enteroctopus", ""],
        ["Species", "E. dofleini", "(Wülker, 1910)"],
      ],
      stats: [
        { value: "4 m+", label: "Arm span — often exceeded", ref: 1 },
        { value: "20–30 kg", label: "Typical adult weight", ref: 0 },
        { value: "≈ 71 kg", label: "Heaviest documented by researchers", ref: 0 },
        { value: "3–5 yrs", label: "Lifespan — long for an octopus", ref: 1 },
      ],
      hotspots: [
        { id: "mantle", label: "Mantle", x: 50, y: 22, text: "The muscular sac behind the head. It holds the hearts, gills and digestive organs, and pumps water over the gills." },
        { id: "eye", label: "Eye", x: 41, y: 41, text: "Camera-like eyes with a horizontal slit pupil. Experiments indicate this octopus is colour-blind." },
        { id: "siphon", label: "Siphon", x: 60, y: 45, text: "A flexible funnel. Water forced out of the mantle through it drives jet propulsion — and expels ink." },
        { id: "web", label: "Web", x: 50, y: 58, text: "Skin stretched between the arm bases. Spread wide, it can envelop prey or hold eggs." },
        { id: "arm", label: "Arm", x: 23, y: 71, text: "Eight muscular arms with no bones. Each can bend, twist, extend and shorten anywhere along its length." },
        { id: "suckers", label: "Suckers", x: 78, y: 82, text: "Two rows per arm — about 2,240 in all for a female. Each grips independently and is packed with touch and chemical sensors." },
        { id: "beak", label: "Beak", x: 50, y: 66, text: "The only hard part of the body, at the centre of the arms. It cracks shells and bites prey." },
      ],
      refs: [0, 1, 2],
    },
  },
  {
    id: "disguise", layout: "octo-disguise", chapter: "03", title: "The Master of Disguise", theme: "teal",
    data: {
      lede: "Its skin is a living display. Millions of pigment cells, each ringed by tiny muscles under direct nerve control, let the octopus shift from pale grey to deep red — and raise small bumps called papillae to mimic rock or weed.",
      layers: [
        { name: "Chromatophores", plain: "Elastic sacs of yellow, red or brown pigment. Muscles pull them open to show colour, or let them shrink to a dot.", ref: 9 },
        { name: "Iridophores", plain: "Stacks of reflective platelets beneath, producing iridescent blues and greens by reflecting light.", ref: 9 },
        { name: "Leucophores", plain: "White cells that scatter whatever light falls on them, helping the skin take on the tones of its surroundings.", ref: 9 },
      ],
      paradox: {
        title: "The colour-blind chameleon",
        text: "Experiments indicate this octopus cannot see colour — yet it matches its surroundings. Light-sensitive proteins found in the skin of a related octopus suggest the skin itself may sense light.",
        certainty: "hypothesis", ref: 8,
      },
      refs: [0, 1, 8, 9],
    },
  },
  {
    id: "arms", layout: "octo-arms", chapter: "04", title: "Eight Arms, Incredible Intelligence", theme: "abyss",
    data: {
      media: octopusMedia.suckers,
      lede: "An octopus thinks with its whole body. In the well-studied common octopus, about two-thirds of roughly 500 million neurons sit not in the brain but in the arms.",
      points: [
        { title: "Distributed control", text: "Each arm has its own nerve cord and can run motions locally, yet the brain can still direct an arm to a learned goal.", certainty: "confirmed", ref: 7 },
        { title: "Taste by touch", text: "Suckers carry both touch and chemical sensors. In the California two-spot octopus, specialised receptors let suckers ‘taste’ what they hold.", certainty: "confirmed", ref: 5 },
        { title: "≈ 500 million neurons", text: "An estimate for the common octopus, Octopus vulgaris. Counts for the giant Pacific octopus have not been published.", certainty: "confirmed", ref: 6 },
      ],
      refs: [5, 6, 7],
    },
  },
  {
    id: "hearts", layout: "octo-hearts", chapter: "05", title: "Three Hearts, Blue Blood", theme: "deep",
    data: {
      lede: "Two branchial hearts push blood through the gills; a third, the systemic heart, drives it around the body. The blood itself is blue, coloured by hemocyanin — a copper-based protein that carries oxygen.",
      notes: [
        { title: "Why pause?", text: "Jet-swimming puts such pressure on the body that the systemic heart briefly stops beating, rather than pump against it. Octopuses tend to crawl rather than swim.", certainty: "confirmed", ref: 10 },
        { title: "Blue, not red", text: "Hemoglobin uses iron; hemocyanin uses copper. Some researchers argue that in cold sea water hemocyanin performs as well as hemoglobin, or better.", certainty: "hypothesis", ref: 10 },
      ],
      refs: [0, 10],
    },
  },
  {
    id: "mind", layout: "octo-mind", chapter: "06", title: "The Intelligent Alien", theme: "abyss",
    data: {
      media: octopusMedia.eye,
      lede: "Octopus and human brains evolved separately, on branches of life that parted long before either had a brain worth the name. What they share is the ability to learn.",
      studies: [
        { year: "Aquaria", title: "Jars and puzzles", text: "Captive giant Pacific octopuses learn to open jars and solve puzzles to reach food.", certainty: "confirmed", ref: 1 },
        { year: "1999", title: "Something like play", text: "Given floating bottles, some octopuses repeatedly jetted water to push them around a current — behaviour the researchers described as play-like.", certainty: "hypothesis", ref: 4 },
        { year: "2010", title: "It knows who you are", text: "Eight octopuses learned to tell apart two identically dressed people: one who fed them and one who touched them with a bristly stick.", certainty: "confirmed", ref: 3 },
        { year: "Folklore", title: "The great escapes", text: "Stories of octopuses slipping out of tanks at night to raid neighbours are widespread, but most are anecdotes, not documented studies.", certainty: "uncertain" },
      ],
      refs: [1, 3, 4],
    },
  },
  {
    id: "survival", layout: "octo-survival", chapter: "07", title: "Survival", theme: "teal",
    data: {
      media: octopusMedia.armsSpread,
      lede: "Sea lions, seals, fish, birds and people all hunt it. With no shell and no bones, the octopus relies on hiding, vanishing and fleeing.",
      tactics: [
        { title: "Ink", text: "A sepia-coloured cloud that confuses attackers and blocks their view while the octopus escapes.", ref: 0 },
        { title: "Jet", text: "Water blasted through the siphon fires the body backwards, arms trailing.", ref: 0 },
        { title: "Den", text: "It lives mostly alone in crevices and dens. Shells piled outside — ‘middens’ — give divers a clue it is home.", ref: 0 },
        { title: "Squeeze", text: "Only the beak is rigid, so a large octopus can retreat through gaps about five centimetres wide.", ref: 0 },
      ],
      predators: ["Sea lions", "Seals", "Fish", "Birds", "People"],
      refs: [0],
    },
  },
  {
    id: "world", layout: "octo-world", chapter: "08", title: "Its World", theme: "deep",
    data: {
      video: octopusMedia.denVideo,
      lede: "A cold-water animal, found in seas around 15 °C or colder — from the shallows to about 1,500 metres or deeper — in an arc around the rim of the North Pacific.",
      range: ["Baja California", "California", "British Columbia", "Alaska", "Aleutian Islands", "Kamchatka", "Japan", "Korea"],
      depth: { min: 0, max: 1500 },
      refs: [0, 1],
    },
  },
  {
    id: "generation", layout: "octo-generation", chapter: "09", title: "The Next Generation", theme: "abyss",
    data: {
      video: octopusMedia.eggsVideo,
      still: octopusMedia.brooding,
      lede: "Each octopus breeds once. What follows is one of the most devoted acts of parental care in the sea — and the end of both parents' lives.",
      stages: [
        { label: "Mating", detail: "The male uses a specialised arm, the hectocotylus, to pass a packet of sperm into the female's mantle. He dies within weeks.", ref: 0 },
        { label: "Laying", detail: "About 40 days later, she hangs 18,000–74,000 eggs — occasionally up to 100,000 — in strands of about 250 from her den's ceiling.", ref: 1 },
        { label: "Brooding", detail: "For up to six months she cleans and aerates them, fasting the whole time.", ref: 0 },
        { label: "Hatching", detail: "Hatchlings the size of a grain of rice emerge. The mother dies around this time.", ref: 0 },
        { label: "Drifting", detail: "Paralarvae drift near the surface eating plankton for up to about three months.", ref: 1 },
        { label: "Settling", detail: "At about five grams the young octopus settles to the seafloor, reaching about 9 kg by age two.", ref: 1 },
      ],
      refs: [0, 1],
    },
  },
  {
    id: "farewell", layout: "closing", chapter: "10", title: "Before You Leave", theme: "ivory",
    data: {
      conservation: {
        status: "Least Concern",
        detail: "Listed as Least Concern by the IUCN (assessed 2014). The species is fished commercially — up to 3,500 tons a year in North America — and population sizes across the North Pacific are not known.",
        refs: [11, 1, 0],
      },
    },
  },
];
