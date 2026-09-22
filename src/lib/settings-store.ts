import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
  MapPin,
  Globe,
  type LucideIcon,
} from "lucide-react";

export type SocialIconName =
  | "facebook"
  | "instagram"
  | "youtube"
  | "linkedin"
  | "whatsapp"
  | "google"
  | "globe";

export const SOCIAL_ICONS: Record<SocialIconName, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  google: MapPin,
  globe: Globe,
};

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon: SocialIconName;
  active: boolean;
  order: number;
};

export type FooterContent = {
  brand: string;
  product: string;
  tagline: string;
  description: string;
  quickLinksHeading: string;
  servicesHeading: string;
  contactHeading: string;
  socialHeading: string;
  quickLinks: { label: string; to: string }[];
  serviceLinks: { label: string; to: string }[];
  contactLines: string[];
  footerContactText: string;
  copyright: string;
};

const SOCIAL_KEY = "ssg_social_links_v1";
const FOOTER_KEY = "ssg_footer_v1";

const DEFAULT_SOCIALS: SocialLink[] = [
  { id: "facebook", platform: "Facebook", url: "https://facebook.com", icon: "facebook", active: true, order: 1 },
  { id: "instagram", platform: "Instagram", url: "https://instagram.com", icon: "instagram", active: true, order: 2 },
  { id: "youtube", platform: "YouTube", url: "https://youtube.com", icon: "youtube", active: true, order: 3 },
  { id: "linkedin", platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin", active: true, order: 4 },
  { id: "whatsapp", platform: "WhatsApp", url: "https://wa.me/919844345088", icon: "whatsapp", active: true, order: 5 },
  { id: "google", platform: "Google Business", url: "https://google.com", icon: "google", active: true, order: 6 },
];

const DEFAULT_FOOTER: FooterContent = {
  brand: "SMART SOLUTIONS GROUPS",
  product: "HOME CARE 360",
  tagline: "All Home & Building Services Under One Roof",
  description:
    "Trusted one-stop partner for every home and building service — quality work, best price, quick response.",
  quickLinksHeading: "Quick Links",
  servicesHeading: "Services",
  contactHeading: "Contact",
  socialHeading: "Social Media",
  quickLinks: [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about-us" },
    { label: "Our Vision", to: "/our-vision" },
    { label: "Services", to: "/services" },
    { label: "Testimonials", to: "/testimonials" },
    { label: "Contact Us", to: "/contact-us" },
  ],
  serviceLinks: [
    { label: "Interior & Construction", to: "/services/interior-construction" },
    { label: "Electrical", to: "/services/electrical" },
    { label: "Plumbing", to: "/services/plumbing" },
    { label: "Cleaning", to: "/services/cleaning" },
    { label: "Appliance Repair", to: "/services/appliance-repair" },
    { label: "Maintenance", to: "/services/maintenance" },
    { label: "Security", to: "/services/security" },
    { label: "Outdoor Services", to: "/services/outdoor-services" },
  ],
  contactLines: [
    "Bengaluru",
    "mail-id - hr.accounts@smartsolutions.co.in",
    "customercare@homecare-smartsolutions.co.in",
  ],
  footerContactText: "Call us anytime — one call for all home & building services.",
  copyright: `© 2026 Smart Solutions Groups. All rights reserved.`,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...(fallback as object), ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function readArray<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ssg-settings-change"));
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  if (typeof window !== "undefined") {
    window.addEventListener("ssg-settings-change", onStorage);
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("ssg-settings-change", onStorage);
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getSocialLinks(): SocialLink[] {
  return readArray<SocialLink>(SOCIAL_KEY, DEFAULT_SOCIALS).sort(
    (a, b) => a.order - b.order,
  );
}
export function setSocialLinks(next: SocialLink[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOCIAL_KEY, JSON.stringify(next));
  emit();
}
export function getFooterContent(): FooterContent {
  const content = read<FooterContent>(FOOTER_KEY, DEFAULT_FOOTER);
  const rawLines = content.contactLines || [];
  const cleanLines = rawLines
    .filter((l) => Boolean(l && l.trim().length > 0))
    .map((l) => {
      if (
        l.includes("Magadi") ||
        l.includes("Sunkadakatte") ||
        l.includes("48/1") ||
        l.includes("SG Kaval") ||
        l.includes("2nd Floor") ||
        l.includes("560091")
      ) {
        return "Bengaluru";
      }
      return l.trim();
    });

  if (!cleanLines.some((l) => l.toLowerCase().includes("bengaluru"))) {
    cleanLines.unshift("Bengaluru");
  }

  return {
    ...content,
    contactLines: cleanLines,
  };
}
export function setFooterContent(next: FooterContent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FOOTER_KEY, JSON.stringify(next));
  emit();
}
export function getSocialByIcon(icon: SocialIconName): SocialLink | undefined {
  return getSocialLinks().find((s) => s.icon === icon && s.active);
}

export function useSocialLinks(): SocialLink[] {
  const [snap, setSnap] = useState<SocialLink[]>(DEFAULT_SOCIALS);
  useEffect(() => {
    setSnap(getSocialLinks());
    return subscribe(() => setSnap(getSocialLinks()));
  }, []);
  return snap;
}

export function useFooterContent(): FooterContent {
  const [snap, setSnap] = useState<FooterContent>(DEFAULT_FOOTER);
  useEffect(() => {
    setSnap(getFooterContent());
    return subscribe(() => setSnap(getFooterContent()));
  }, []);
  return snap;
}

// silence unused import (kept for potential future use)
void useSyncExternalStore;

export { DEFAULT_SOCIALS, DEFAULT_FOOTER };