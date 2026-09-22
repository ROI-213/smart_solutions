import { services, slugifyItem } from "@/data/services";
import type { LucideIcon } from "lucide-react";
import type { PublicServiceCategory } from "@/lib/public-services";

export type ServiceSearchResult = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  itemSlug: string;
  icon: LucideIcon;
  price: string;
  score: number;
};

// Curated aliases / spelling-tolerant keywords per service item
const ITEM_KEYWORDS: Record<string, string[]> = {
  "POP False Ceiling": ["ceiling", "ciling", "false ceiling", "pop", "pop ceiling", "gypsum", "roof design", "interior ceiling"],
  "False Ceiling Repairs": ["ceiling", "ciling", "false ceiling", "ceiling repair", "pop repair"],
  "Modular Kitchen Installation": ["kitchen", "modular", "modular kitchen", "kitchen installation"],
  "Wardrobe Installation": ["wardrobe", "cupboard", "almirah", "closet"],
  "Carpentry Works": ["carpentry", "carpenter", "wood", "woodwork", "furniture"],
  "Carpentry Work": ["carpentry", "carpenter", "wood", "woodwork", "furniture"],
  "Painting Works": ["paint", "painting", "painter", "wall paint", "interior paint"],
  "Painting Touch-Up Works": ["paint", "painting", "touch up", "touchup"],
  "Granite & Tiles Fixing": ["granite", "tiles", "tile fixing", "marble", "flooring"],
  "Tile & Granite Repairs": ["tile", "tiles", "granite", "tile repair"],
  "SS Railing Works": ["ss railing", "stainless steel", "railing", "handrail"],
  "Glass Partition Works": ["glass", "partition", "glass partition"],
  "Waterproofing Works": ["waterproof", "waterproofing", "leak proofing", "terrace waterproof"],

  "House Wiring": ["wiring", "wire", "house wiring", "electrical wiring", "electric"],
  "Fan, Light & Switch Installation": ["fan", "light", "switch", "bulb", "socket", "plug"],
  "Electrical Repairs": ["electrical", "electric", "electrician", "electritian", "repair", "power"],
  "Inverter Installation": ["inverter", "ups", "backup power", "battery"],
  "CCTV Installation & Maintenance": ["cctv", "camera", "security camera", "surveillance"],
  "Video Door Phone Installation": ["video door phone", "door phone", "intercom", "doorbell"],
  "Smart Lock Installation": ["smart lock", "lock", "digital lock", "door lock"],

  "Plumbing Repairs": ["plumbing", "plumber", "plumer", "pipe", "tap", "leak", "leakage", "sink", "drainage"],
  "Bathroom Fittings": ["bathroom", "bath fitting", "shower", "tap", "faucet", "toilet"],
  "Water Tank Cleaning": ["water tank", "tank cleaning", "sump cleaning"],
  "Borewell Motor Repairs": ["borewell", "motor", "water motor", "pump"],
  "Borewell Motor Repair": ["borewell", "motor", "water motor", "pump"],

  "AC Installation & Servicing": ["ac", "air conditioner", "ac service", "ac install", "cooling"],
  "RO Water Purifier Service": ["ro", "water purifier", "purifier", "water filter"],
  "Refrigerator Repair": ["fridge", "refrigerator", "cooling"],
  "Washing Machine Repair": ["washing machine", "washer", "laundry"],
  "Geyser Repair": ["geyser", "water heater", "heater"],
  "TV Mounting & Repair": ["tv", "television", "tv mount", "tv repair"],

  "Deep Home Cleaning": ["deep cleaning", "home cleaning", "house cleaning", "cleaning"],
  "Sofa Cleaning": ["sofa", "couch", "upholstery"],
  "Carpet Cleaning": ["carpet", "rug"],
  "Bathroom Cleaning": ["bathroom", "toilet cleaning", "washroom"],
  "Kitchen Cleaning": ["kitchen", "kitchen cleaning", "chimney cleaning"],
  "Balcony Cleaning": ["balcony", "terrace cleaning"],
  "Outdoor Cleaning": ["outdoor cleaning", "exterior cleaning"],
  "Floor Cleaning": ["floor", "mopping", "floor cleaning"],
  "Move-in / Move-out Cleaning": ["move in", "move out", "shifting cleaning"],

  "Housekeeping Staff": ["housekeeping", "maid", "helper", "domestic"],
  "Security Guard Services": ["security", "guard", "watchman", "security guard"],
  "Electrician On Call": ["electrician", "electritian", "electric", "on call"],
  "Plumber On Call": ["plumber", "plumer", "on call", "pipe"],
  "Pest Control": ["pest", "pest control", "pestcontroll", "insects", "cockroach", "termite", "bed bug", "mosquito", "ants", "bug"],
  "Gardening Services": ["gardening", "garden", "lawn", "landscaping", "plants"],
  "Gardening": ["gardening", "garden", "lawn", "landscaping", "plants"],
  "Monthly Maintenance Contracts": ["maintenance", "amc", "monthly contract"],

  "Curtain Installation": ["curtain", "blinds", "drapes"],
  "Mosquito Mesh Installation": ["mosquito mesh", "mesh", "net", "window mesh"],
  "False Ceiling Repair": ["ceiling repair", "false ceiling", "pop"],

  "Compound Cleaning": ["compound", "outdoor cleaning", "yard"],
  "Pressure Washing": ["pressure washing", "jet wash", "high pressure"],
};

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

// Damerau-Levenshtein-ish distance (simple Levenshtein for speed)
function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp: number[] = Array(b.length + 1).fill(0);
  for (let j = 0; j <= b.length; j++) dp[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
}

function fuzzyContains(haystack: string, needle: string): number {
  if (!needle) return 0;
  if (haystack.includes(needle)) return 1;
  // token-level fuzzy: allow small edit distance for words length >= 4
  if (needle.length >= 4) {
    const tokens = haystack.split(/(?<=\D)(?=\D)/); // fallback: whole haystack
    // Slide a window of size needle.length ± 1 and compare
    const windowSizes = [needle.length - 1, needle.length, needle.length + 1].filter((n) => n > 0);
    for (const w of windowSizes) {
      for (let i = 0; i + w <= haystack.length; i++) {
        const slice = haystack.slice(i, i + w);
        const d = distance(slice, needle);
        if (d <= (needle.length >= 6 ? 2 : 1)) return 0.7 - d * 0.1;
      }
    }
    void tokens;
  }
  return 0;
}

type Entry = {
  name: string;
  category: string;
  categorySlug: string;
  itemSlug: string;
  icon: LucideIcon;
  haystacks: string[]; // normalized keyword strings
};

function buildIndex(catalog?: PublicServiceCategory[]): Entry[] {
  if (catalog?.length) {
    return catalog.flatMap((cat) =>
      cat.serviceItems.map((item) => {
        const keywords = [item.name, item.shortDesc, item.longDesc, cat.title, ...(ITEM_KEYWORDS[item.name] ?? [])];
        return {
          name: item.name,
          category: cat.title,
          categorySlug: cat.slug,
          itemSlug: item.slug || slugifyItem(item.name),
          icon: item.icon || cat.icon,
          haystacks: Array.from(new Set(keywords.map(norm))).filter(Boolean),
        };
      }),
    );
  }

  return services.flatMap((cat) =>
  cat.items.map((item) => {
    const keywords = [
      item,
      cat.title,
      ...(ITEM_KEYWORDS[item] ?? []),
    ];
    return {
      name: item,
      category: cat.title,
      categorySlug: cat.slug,
      itemSlug: slugifyItem(item),
      icon: cat.icon,
      haystacks: Array.from(new Set(keywords.map(norm))).filter(Boolean),
    };
  }),
);
}

const INDEX: Entry[] = buildIndex();

export function searchServices(query: string, limit = 8, catalog?: PublicServiceCategory[]): ServiceSearchResult[] {
  const q = norm(query);
  if (!q) return [];
  const results: ServiceSearchResult[] = [];
  const index = catalog?.length ? buildIndex(catalog) : INDEX;
  for (const e of index) {
    let best = 0;
    for (const h of e.haystacks) {
      const s = fuzzyContains(h, q);
      if (s > best) best = s;
      // also try prefix bonus
      if (h.startsWith(q)) best = Math.max(best, 1.1);
    }
    if (best > 0) {
      results.push({
        id: `${e.categorySlug}:${e.itemSlug}`,
        name: e.name,
        category: e.category,
        categorySlug: e.categorySlug,
        itemSlug: e.itemSlug,
        icon: e.icon,
        price: "Starts from ₹99",
        score: best,
      });
    }
  }
  results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  // De-dupe by name preserving highest score
  const seen = new Set<string>();
  const unique: ServiceSearchResult[] = [];
  for (const r of results) {
    if (seen.has(r.name)) continue;
    seen.add(r.name);
    unique.push(r);
    if (unique.length >= limit) break;
  }
  return unique;
}