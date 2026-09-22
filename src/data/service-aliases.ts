import { slugifyItem, services as seedServices } from "@/data/services";

// Every service name that appears anywhere on the site must resolve to a
// working detail page. This registry backs up the seed/backend catalog with
// slug aliases and extra services the marketing site advertises so the
// "Service not found" page is reserved for truly unknown URLs.

export type ServiceAlias = {
  slug: string;
  name: string;
  categorySlug: string; // must match a seed category slug
  description?: string;
};

// categorySlug values map to seed categories in src/data/services.ts:
// interior-construction-works, electrical-services, plumbing-services,
// appliance-services, cleaning-services, maintenance-services,
// home-improvement-services, safety-security-services, outdoor-services,
// financial-consultancy-services.

const EXTRA_SERVICES: ServiceAlias[] = [
  // ── Category-style landing slugs users may reach directly ──
  { slug: "cleaning-services", name: "Cleaning Services", categorySlug: "cleaning-services" },
  { slug: "maintenance-services", name: "Maintenance Services", categorySlug: "maintenance-services" },
  { slug: "home-improvement", name: "Home Improvement", categorySlug: "home-improvement-services" },
  { slug: "safety-security", name: "Safety & Security", categorySlug: "safety-security-services" },
  { slug: "outdoor-services", name: "Outdoor Services", categorySlug: "outdoor-services" },
  { slug: "financial-consultancy", name: "Financial Consultancy", categorySlug: "financial-consultancy-services" },
  { slug: "ac-services", name: "AC Services", categorySlug: "appliance-services" },
  { slug: "pest-control-services", name: "Pest Control Services", categorySlug: "maintenance-services" },
  { slug: "appliance-repair-services", name: "Appliance Repair Services", categorySlug: "appliance-services" },
  { slug: "carpentry-works", name: "Carpentry Works", categorySlug: "interior-construction-works" },
  { slug: "painting-services", name: "Painting Services", categorySlug: "interior-construction-works" },
  { slug: "packers-and-movers", name: "Packers & Movers", categorySlug: "maintenance-services" },
  { slug: "packers-movers", name: "Packers & Movers", categorySlug: "maintenance-services" },
  { slug: "waterproofing-services", name: "Waterproofing Services", categorySlug: "interior-construction-works" },
  { slug: "bathroom-cleaning", name: "Bathroom Cleaning", categorySlug: "cleaning-services" },
  { slug: "kitchen-cleaning", name: "Kitchen Cleaning", categorySlug: "cleaning-services" },

  // ── AC Services sub-services ──
  { slug: "ac-installation", name: "AC Installation", categorySlug: "appliance-services" },
  { slug: "ac-repair", name: "AC Repair", categorySlug: "appliance-services" },
  { slug: "ac-gas-filling", name: "AC Gas Filling", categorySlug: "appliance-services" },
  { slug: "ac-deep-cleaning", name: "AC Deep Cleaning", categorySlug: "appliance-services" },
  { slug: "ac-uninstallation", name: "AC Uninstallation", categorySlug: "appliance-services" },
  { slug: "ac-maintenance", name: "AC Maintenance", categorySlug: "appliance-services" },

  // ── Pest Control sub-services ──
  { slug: "cockroach-control", name: "Cockroach Control", categorySlug: "maintenance-services" },
  { slug: "termite-control", name: "Termite Control", categorySlug: "maintenance-services" },
  { slug: "bed-bug-control", name: "Bed Bug Control", categorySlug: "maintenance-services" },
  { slug: "mosquito-control", name: "Mosquito Control", categorySlug: "maintenance-services" },
  { slug: "ant-control", name: "Ant Control", categorySlug: "maintenance-services" },
  { slug: "general-pest-control", name: "General Pest Control", categorySlug: "maintenance-services" },

  // ── Appliance Repair aliases ──
  { slug: "microwave-repair", name: "Microwave Repair", categorySlug: "appliance-services" },
  { slug: "chimney-repair", name: "Chimney Repair", categorySlug: "appliance-services" },
  { slug: "ro-repair", name: "RO Repair", categorySlug: "appliance-services" },

  // ── Carpentry sub-services ──
  { slug: "furniture-repair", name: "Furniture Repair", categorySlug: "interior-construction-works" },
  { slug: "door-repair", name: "Door Repair", categorySlug: "interior-construction-works" },
  { slug: "wardrobe-repair", name: "Wardrobe Repair", categorySlug: "interior-construction-works" },
  { slug: "cabinet-repair", name: "Cabinet Repair", categorySlug: "interior-construction-works" },
  { slug: "modular-furniture-work", name: "Modular Furniture Work", categorySlug: "interior-construction-works" },
  { slug: "bed-repair", name: "Bed Repair", categorySlug: "interior-construction-works" },

  // ── Painting sub-services ──
  { slug: "interior-painting", name: "Interior Painting", categorySlug: "interior-construction-works" },
  { slug: "exterior-painting", name: "Exterior Painting", categorySlug: "interior-construction-works" },
  { slug: "wall-texture-painting", name: "Wall Texture Painting", categorySlug: "interior-construction-works" },
  { slug: "rental-house-painting", name: "Rental House Painting", categorySlug: "interior-construction-works" },
  { slug: "waterproof-painting", name: "Waterproof Painting", categorySlug: "interior-construction-works" },
  { slug: "door-and-window-painting", name: "Door & Window Painting", categorySlug: "interior-construction-works" },

  // ── Plumbing aliases ──
  { slug: "tap-repair", name: "Tap Repair", categorySlug: "plumbing-services" },
  { slug: "pipe-leakage-repair", name: "Pipe Leakage Repair", categorySlug: "plumbing-services" },
  { slug: "bathroom-fitting", name: "Bathroom Fitting", categorySlug: "plumbing-services" },
  { slug: "water-motor-repair", name: "Water Motor Repair", categorySlug: "plumbing-services" },
  { slug: "drainage-cleaning", name: "Drainage Cleaning", categorySlug: "plumbing-services" },

  // ── Packers & Movers sub-services ──
  { slug: "home-shifting", name: "Home Shifting", categorySlug: "maintenance-services" },
  { slug: "office-shifting", name: "Office Shifting", categorySlug: "maintenance-services" },
  { slug: "furniture-moving", name: "Furniture Moving", categorySlug: "maintenance-services" },
  { slug: "packing-service", name: "Packing Service", categorySlug: "maintenance-services" },
  { slug: "local-shifting", name: "Local Shifting", categorySlug: "maintenance-services" },
  { slug: "vehicle-shifting", name: "Vehicle Shifting", categorySlug: "maintenance-services" },

  // ── Waterproofing sub-services ──
  { slug: "terrace-waterproofing", name: "Terrace Waterproofing", categorySlug: "interior-construction-works" },
  { slug: "bathroom-waterproofing", name: "Bathroom Waterproofing", categorySlug: "interior-construction-works" },
  { slug: "wall-seepage-repair", name: "Wall Seepage Repair", categorySlug: "interior-construction-works" },
  { slug: "roof-waterproofing", name: "Roof Waterproofing", categorySlug: "interior-construction-works" },
  { slug: "basement-waterproofing", name: "Basement Waterproofing", categorySlug: "interior-construction-works" },

  // ── Outdoor sub-services ──
  { slug: "garden-maintenance", name: "Garden Maintenance", categorySlug: "outdoor-services" },
  { slug: "building-exterior-cleaning", name: "Building Exterior Cleaning", categorySlug: "outdoor-services" },
  { slug: "terrace-cleaning", name: "Terrace Cleaning", categorySlug: "outdoor-services" },

  // ── Maintenance sub-services ──
  { slug: "general-maintenance", name: "General Maintenance", categorySlug: "maintenance-services" },
  { slug: "apartment-maintenance", name: "Apartment Maintenance", categorySlug: "maintenance-services" },
  { slug: "villa-maintenance", name: "Villa Maintenance", categorySlug: "maintenance-services" },
  { slug: "office-maintenance", name: "Office Maintenance", categorySlug: "maintenance-services" },
  { slug: "building-maintenance", name: "Building Maintenance", categorySlug: "maintenance-services" },
  { slug: "multi-skill-maintenance", name: "Multi-Skill Maintenance", categorySlug: "maintenance-services" },

  // ── Home Improvement sub-services ──
  { slug: "wall-fixture-installation", name: "Wall Fixture Installation", categorySlug: "home-improvement-services" },
  { slug: "small-home-repairs", name: "Small Home Repairs", categorySlug: "home-improvement-services" },
  { slug: "door-fitting", name: "Door Fitting", categorySlug: "home-improvement-services" },
  { slug: "shelf-installation", name: "Shelf Installation", categorySlug: "home-improvement-services" },
  { slug: "home-finishing-work", name: "Home Finishing Work", categorySlug: "home-improvement-services" },

  // ── Safety & Security aliases ──
  { slug: "cctv-installation", name: "CCTV Installation", categorySlug: "safety-security-services" },
  { slug: "security-system-installation", name: "Security System Installation", categorySlug: "safety-security-services" },
  { slug: "gate-security-support", name: "Gate Security Support", categorySlug: "safety-security-services" },

  // ── Financial Consultancy aliases ──
  { slug: "home-loan-consultancy", name: "Home Loan Consultancy", categorySlug: "financial-consultancy-services" },
  { slug: "insurance-support", name: "Insurance Support", categorySlug: "financial-consultancy-services" },
  { slug: "property-loan-guidance", name: "Property Loan Guidance", categorySlug: "financial-consultancy-services" },
  { slug: "documentation-support", name: "Documentation Support", categorySlug: "financial-consultancy-services" },
  { slug: "customer-consultancy", name: "Customer Consultancy", categorySlug: "financial-consultancy-services" },
];

const ALIAS_MAP: Map<string, ServiceAlias> = (() => {
  const map = new Map<string, ServiceAlias>();
  for (const alias of EXTRA_SERVICES) {
    map.set(alias.slug, alias);
    map.set(slugifyItem(alias.name), alias);
  }
  return map;
})();

export function findServiceAlias(slug: string): ServiceAlias | undefined {
  const s = slug.toLowerCase();
  return ALIAS_MAP.get(s) ?? ALIAS_MAP.get(slugifyItem(s));
}

export function findAliasCategory(categorySlug: string) {
  return seedServices.find((c) => c.slug === categorySlug);
}