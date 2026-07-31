import type { Mall } from "../types";
import { haversineKm } from "../geo";

/**
 * Demo seed data: Kuala Lumpur city-centre mall competition analysis.
 * The subject (target) is LaLaport BBCC; every other entry is a competitor
 * and its threatLevel is "the threat that mall poses to the subject".
 *
 * NOTE: demo data. Figures come from public reporting and manual estimates;
 * not yet wired to Google Places / footfall APIs.
 */
export const TARGET_MALL_ID = "lalaport-bbcc";

export const malls: Mall[] = [
  {
    id: "lalaport-bbcc",
    name: "LaLaport BBCC",
    area: "Bukit Bintang · BBCC",
    lat: 3.141,
    lng: 101.7085,
    opened: "2022.1",
    sizeLabel: "~860,000 sf / 400+ stores",
    modelSf: 860_000,
    trafficLabel: "~15M/yr (est.)",
    trafficM: 15,
    positioning: [
      "Mitsui Fudosan's first LaLaport in Southeast Asia",
      "Japanese family positioning; large Nitori / Tsutaya Books anchors",
      "Core retail of the BBCC mixed-use development",
    ],
    positioningTag: "Japanese family",
    segments: ["japanese", "family", "mass", "food"],
    threatLevel: "target",
    threatNote: "Subject (analysis focus)",
  },
  {
    id: "118-mall",
    name: "118 Mall @ Merdeka 118",
    area: "Merdeka 118",
    lat: 3.1417,
    lng: 101.7008,
    opened: "2026.8",
    sizeLabel: "800,000+ sf / 300+ stores",
    modelSf: 850_000,
    trafficLabel: "~22M/yr (proj.)",
    trafficM: 22,
    positioning: [
      "World's 2nd-tallest tower, national landmark, high media exposure",
      "Park Hyatt KL draws premium tourists",
      "8,000 parking bays (most in KL)",
      "Makanizm food hall & Malaysian artisan zone compete head-on with BBCC's Tuah 1895 / Malaysia Grand Bazaar",
    ],
    positioningTag: "National landmark",
    segments: ["mass", "food", "family", "tourist"],
    threatLevel: "extreme",
    threatNote: "Head-to-head",
  },
  {
    id: "trx",
    name: "The Exchange TRX",
    area: "TRX",
    lat: 3.1421,
    lng: 101.718,
    opened: "2023.11",
    sizeLabel: "1.3M sf / 400+ stores",
    modelSf: 1_300_000,
    trafficLabel: "~30M/yr (strong Y1 est.)",
    trafficM: 30,
    positioning: [
      "Seibu department store's first SEA outlet",
      "Premium brands pull high-spend customers: Apple flagship, LV, Chanel, Maison Kitsuné, Gentle Monster, Alo Yoga",
      "10-acre TRX City Park rooftop, dwarfing BBCC's 1,700 m² rooftop garden",
    ],
    positioningTag: "Premium luxury",
    segments: ["luxury", "premium", "tourist", "japanese"],
    threatLevel: "high",
    threatNote: "Upmarket threat",
  },
  {
    id: "pavilion-kl",
    name: "Pavilion KL",
    area: "Bukit Bintang",
    lat: 3.1491,
    lng: 101.7134,
    opened: "2007",
    sizeLabel: "1.61M sf / 700+ stores",
    modelSf: 1_610_000,
    trafficLabel: "30–33M/yr",
    trafficM: 31.5,
    positioning: ["Premium mainstream"],
    positioningTag: "Premium mainstream",
    segments: ["premium", "luxury", "mass", "tourist"],
    threatLevel: "medium",
    threatNote: "Already segmented",
  },
  {
    id: "lot-10",
    name: "Lot 10",
    area: "Bukit Bintang",
    lat: 3.147,
    lng: 101.7112,
    opened: "1990s",
    sizeLabel: "~700,000 sf",
    modelSf: 700_000,
    trafficLabel: "~12M/yr (est.)",
    trafficM: 12,
    positioning: ["Japanese theme (Ten's Hutong food court, Isetan heritage)"],
    positioningTag: "Japanese theme",
    segments: ["japanese", "food", "youth"],
    threatLevel: "medium",
    threatNote: "Japanese positioning overlap",
  },
  {
    id: "berjaya-times-square",
    name: "Berjaya Times Square",
    area: "Imbi",
    lat: 3.1428,
    lng: 101.7103,
    opened: "2003",
    sizeLabel: "7.5M sf / 1,000+ stores",
    modelSf: 2_500_000, // 7.5M sf gross incl. hotel/office; effective retail area estimated
    trafficLabel: "~2.5M/month",
    trafficM: 30,
    positioning: ["Mass-market, youth, indoor theme park"],
    positioningTag: "Mass entertainment",
    segments: ["mass", "youth", "family", "themepark"],
    threatLevel: "low",
    threatNote: "Different customer base",
  },
  {
    id: "suria-klcc",
    name: "Suria KLCC",
    area: "KLCC",
    lat: 3.1578,
    lng: 101.7117,
    opened: "1998",
    sizeLabel: "~1M sf / 400+ stores",
    modelSf: 1_000_000,
    trafficLabel: "~45M/yr (est.)",
    trafficM: 45,
    positioning: [
      "Iconic mall beneath the Petronas Twin Towers",
      "Premium + tourist anchor with Isetan and Parkson",
    ],
    positioningTag: "Tourist anchor",
    segments: ["luxury", "premium", "tourist", "family"],
    threatLevel: "medium",
    threatNote: "Tourist magnet, different tier",
  },
  {
    id: "fahrenheit-88",
    name: "Fahrenheit 88",
    area: "Bukit Bintang",
    lat: 3.1466,
    lng: 101.7106,
    opened: "2010",
    sizeLabel: "~300,000 sf",
    modelSf: 300_000,
    trafficLabel: "~15M/yr (est.)",
    trafficM: 15,
    positioning: [
      "Youth / mass with a large Uniqlo and Japanese tenants",
      "H&M and street-fashion focus",
    ],
    positioningTag: "Youth / Japanese",
    segments: ["youth", "mass", "japanese", "food"],
    threatLevel: "high",
    threatNote: "Japanese/mass overlap, adjacent",
  },
  {
    id: "starhill",
    name: "The Starhill",
    area: "Bukit Bintang",
    lat: 3.1478,
    lng: 101.7116,
    opened: "2005",
    sizeLabel: "~300,000 sf",
    modelSf: 300_000,
    trafficLabel: "~8M/yr (est.)",
    trafficM: 8,
    positioning: ["Ultra-luxury boutiques and fine dining"],
    positioningTag: "Ultra-luxury",
    segments: ["luxury", "premium", "tourist"],
    threatLevel: "low",
    threatNote: "Different tier",
  },
  {
    id: "sungei-wang",
    name: "Sungei Wang Plaza",
    area: "Bukit Bintang",
    lat: 3.1448,
    lng: 101.7098,
    opened: "1977",
    sizeLabel: "~500,000 sf",
    modelSf: 500_000,
    trafficLabel: "~20M/yr (est.)",
    trafficM: 20,
    positioning: ["Mass-market, youth fashion and value dining"],
    positioningTag: "Mass value",
    segments: ["mass", "youth", "food"],
    threatLevel: "medium",
    threatNote: "Adjacent, mass overlap",
  },
  {
    id: "nu-sentral",
    name: "NU Sentral",
    area: "KL Sentral",
    lat: 3.1339,
    lng: 101.6867,
    opened: "2014",
    sizeLabel: "~650,000 sf",
    modelSf: 650_000,
    trafficLabel: "~25M/yr (est.)",
    trafficM: 25,
    positioning: ["Transit-hub mall, mass family with Parkson anchor"],
    positioningTag: "Transit family",
    segments: ["mass", "family", "food"],
    threatLevel: "medium",
    threatNote: "Family overlap, transit hub",
  },
  {
    id: "quill-city",
    name: "Quill City Mall",
    area: "Jalan Sultan Ismail",
    lat: 3.1627,
    lng: 101.6969,
    opened: "2015",
    sizeLabel: "~470,000 sf",
    modelSf: 470_000,
    trafficLabel: "~12M/yr (est.)",
    trafficM: 12,
    positioning: ["Mid-market family and dining"],
    positioningTag: "Mid-market family",
    segments: ["mass", "family", "food"],
    threatLevel: "low",
    threatNote: "Distant, mid-market",
  },
  {
    id: "sunway-putra",
    name: "Sunway Putra Mall",
    area: "Chow Kit",
    lat: 3.1657,
    lng: 101.6931,
    opened: "2016",
    sizeLabel: "~700,000 sf",
    modelSf: 700_000,
    trafficLabel: "~18M/yr (est.)",
    trafficM: 18,
    positioning: ["Mass family, value fashion and F&B"],
    positioningTag: "Mass family",
    segments: ["mass", "family"],
    threatLevel: "low",
    threatNote: "Distant, mass",
  },
  {
    id: "mid-valley",
    name: "Mid Valley Megamall",
    area: "Mid Valley City",
    lat: 3.1177,
    lng: 101.6774,
    opened: "1999",
    sizeLabel: "~1.8M sf / 400+ stores",
    modelSf: 1_800_000,
    trafficLabel: "~40M/yr (est.)",
    trafficM: 40,
    positioning: ["Mega mass-family destination with AEON & Metrojaya"],
    positioningTag: "Mega family",
    segments: ["mass", "family", "food"],
    threatLevel: "medium",
    threatNote: "Family giant but distant",
  },
  {
    id: "the-gardens",
    name: "The Gardens Mall",
    area: "Mid Valley City",
    lat: 3.1181,
    lng: 101.6766,
    opened: "2007",
    sizeLabel: "~800,000 sf",
    modelSf: 800_000,
    trafficLabel: "~20M/yr (est.)",
    trafficM: 20,
    positioning: ["Premium wing beside Mid Valley, Robinsons/Isetan heritage"],
    positioningTag: "Premium family",
    segments: ["premium", "luxury", "family"],
    threatLevel: "low",
    threatNote: "Premium, distant",
  },
];

export const mallById = (id: string): Mall | undefined =>
  malls.find((m) => m.id === id);

export const targetMall = (): Mall => mallById(TARGET_MALL_ID)!;

/** Distance (km) from the subject mall (LaLaport BBCC) */
export function distanceFromTargetKm(m: Mall): number {
  const t = targetMall();
  return haversineKm(t.lat, t.lng, m.lat, m.lng);
}

/**
 * Malls within `radiusKm` of the subject mall.
 * The subject itself is always included.
 */
export function mallsWithinRadius(radiusKm: number): Mall[] {
  return malls.filter(
    (m) => m.id === TARGET_MALL_ID || distanceFromTargetKm(m) <= radiusKm
  );
}

/** Fuzzy-match a mall by id or English name (for LLM-supplied names) */
export function resolveMall(query: string): Mall | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return malls.find(
    (m) =>
      m.id === q ||
      m.name.toLowerCase().includes(q) ||
      q.includes(m.name.toLowerCase())
  );
}
