import { useEffect, useState } from "react";
import {
  Home, Building, Building2, Castle, Briefcase, Wrench, Hammer, Shield, ShieldCheck,
  Users, MapPin, Layers, BadgeCheck, Sparkles, Clock, PhoneCall, HeartHandshake,
  Wallet, Headphones, Award, Target, Eye, Smile, CheckCircle2, Star, Zap, Droplets,
  Hash, type LucideIcon,
} from "lucide-react";

export type IconName =
  | "home" | "building" | "building2" | "castle" | "briefcase" | "wrench" | "hammer"
  | "shield" | "shield-check" | "users" | "map-pin" | "layers" | "badge-check"
  | "sparkles" | "clock" | "phone-call" | "heart-handshake" | "wallet" | "headphones"
  | "award" | "target" | "eye" | "smile" | "check" | "star" | "zap" | "droplets" | "hash";

export const ICONS: Record<IconName, LucideIcon> = {
  home: Home, building: Building, building2: Building2, castle: Castle, briefcase: Briefcase,
  wrench: Wrench, hammer: Hammer, shield: Shield, "shield-check": ShieldCheck, users: Users,
  "map-pin": MapPin, layers: Layers, "badge-check": BadgeCheck, sparkles: Sparkles, clock: Clock,
  "phone-call": PhoneCall, "heart-handshake": HeartHandshake, wallet: Wallet, headphones: Headphones,
  award: Award, target: Target, eye: Eye, smile: Smile, check: CheckCircle2, star: Star,
  zap: Zap, droplets: Droplets, hash: Hash,
};

export const ICON_OPTIONS: IconName[] = Object.keys(ICONS) as IconName[];

export type Block = {
  id: string;
  title: string;
  desc: string;
  icon: IconName;
  order: number;
  active: boolean;
};

export type Strength = Block & { value: string };

export type AboutContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  introHeading: string;
  introBody1: string;
  introBody2: string;
  introBullets: string[];
  whatWeDoHeading: string;
  whatWeDoEyebrow: string;
  whatWeDo: Block[];
  whoWeServeHeading: string;
  whoWeServeEyebrow: string;
  whoWeServe: Block[];
  strengthsHeading: string;
  strengthsEyebrow: string;
  strengths: Strength[];
  trustHeading: string;
  trustEyebrow: string;
  trust: Block[];
  finalCtaHeading: string;
  finalCtaBody: string;
  finalCtaPrimaryText: string;
  finalCtaSecondaryText: string;
  heroImage: string;
  status: "active" | "draft";
};

export type VisionContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  visionEyebrow: string;
  visionTitle: string;
  visionStatement: string;
  visionBody: string;
  missionEyebrow: string;
  missionTitle: string;
  missionStatement: string;
  valuesHeading: string;
  valuesEyebrow: string;
  valuesSubtitle: string;
  values: Block[];
  ctaHeading: string;
  ctaBody: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  heroImage: string;
  status: "active" | "draft";
};

const ABOUT_KEY = "ssg_about_content_v1";
const VISION_KEY = "ssg_vision_content_v1";

const id = () => Math.random().toString(36).slice(2, 10);

export const DEFAULT_ABOUT: AboutContent = {
  heroEyebrow: "About Smart Solutions Groups",
  heroTitle: "Your trusted partner for complete home, apartment, villa, office and building services.",
  heroSubtitle: "One company. Multiple services. Complete peace of mind.",
  ctaButtonText: "Contact Us Today",
  ctaButtonLink: "/contact-us",
  introHeading: "Smart Solutions Groups – Home Care 360",
  introBody1:
    "Smart Solutions Groups – Home Care 360 provides complete home and building services under one roof. We help customers with interior works, construction support, electrical work, plumbing, appliance services, cleaning, maintenance, security, outdoor services and financial consultancy.",
  introBody2:
    "Our goal is to make home and building maintenance simple, reliable and affordable by offering multiple services through one trusted team.",
  introBullets: ["Single-window service", "Trained professionals", "Upfront pricing", "Service guarantee"],
  whatWeDoHeading: "Complete services under one roof",
  whatWeDoEyebrow: "What we do",
  whatWeDo: [
    { id: id(), icon: "home", title: "Home Services", desc: "Complete care for everyday home needs — repairs, fittings & upkeep.", order: 1, active: true },
    { id: id(), icon: "building2", title: "Building Services", desc: "End-to-end support for residential and commercial buildings.", order: 2, active: true },
    { id: id(), icon: "building", title: "Apartment Services", desc: "Flat-friendly solutions, AMC plans and quick on-site visits.", order: 3, active: true },
    { id: id(), icon: "castle", title: "Villa Services", desc: "Premium interior, exterior and maintenance for independent villas.", order: 4, active: true },
    { id: id(), icon: "briefcase", title: "Office Services", desc: "Workplace fit-outs, electrical, networking and facility upkeep.", order: 5, active: true },
    { id: id(), icon: "wrench", title: "Maintenance Contracts", desc: "Annual & quarterly AMC plans with priority response.", order: 6, active: true },
    { id: id(), icon: "hammer", title: "Repair Services", desc: "Appliance, plumbing, electrical and carpentry repairs — done right.", order: 7, active: true },
    { id: id(), icon: "shield", title: "Security & Facility Support", desc: "CCTV, access control and dedicated facility management.", order: 8, active: true },
  ],
  whoWeServeHeading: "Built for every kind of property",
  whoWeServeEyebrow: "Who we serve",
  whoWeServe: [
    { id: id(), icon: "home", title: "Homes", desc: "Independent houses & family residences.", order: 1, active: true },
    { id: id(), icon: "building", title: "Apartments", desc: "Individual flats in residential complexes.", order: 2, active: true },
    { id: id(), icon: "castle", title: "Villas", desc: "Luxury and premium standalone villas.", order: 3, active: true },
    { id: id(), icon: "briefcase", title: "Offices", desc: "Corporate offices and co-working spaces.", order: 4, active: true },
    { id: id(), icon: "building2", title: "Commercial Buildings", desc: "Retail, showrooms and mixed-use projects.", order: 5, active: true },
    { id: id(), icon: "layers", title: "Residential Layouts", desc: "Plotted developments and new layouts.", order: 6, active: true },
    { id: id(), icon: "users", title: "Gated Communities", desc: "Society-wide service & maintenance plans.", order: 7, active: true },
    { id: id(), icon: "map-pin", title: "Property Owners", desc: "Landlords, investors and property managers.", order: 8, active: true },
  ],
  strengthsHeading: "Trusted numbers, real results",
  strengthsEyebrow: "Our strengths",
  strengths: [
    { id: id(), icon: "layers", title: "Service Categories", value: "10+", desc: "", order: 1, active: true },
    { id: id(), icon: "wrench", title: "Home & Building Services", value: "50+", desc: "", order: 2, active: true },
    { id: id(), icon: "clock", title: "Quick Response Team", value: "24/7", desc: "", order: 3, active: true },
    { id: id(), icon: "shield-check", title: "Trusted Local Provider", value: "100%", desc: "", order: 4, active: true },
    { id: id(), icon: "phone-call", title: "One Call Support", value: "1 Call", desc: "", order: 5, active: true },
    { id: id(), icon: "badge-check", title: "Quality Work Guarantee", value: "100%", desc: "", order: 6, active: true },
  ],
  trustHeading: "Reliable service, every single time",
  trustEyebrow: "Why customers trust us",
  trust: [
    { id: id(), icon: "badge-check", title: "Professional Team", desc: "Trained, background-verified technicians equipped with the right tools.", order: 1, active: true },
    { id: id(), icon: "sparkles", title: "Transparent Service", desc: "Clear scope, upfront quotes and no hidden charges — ever.", order: 2, active: true },
    { id: id(), icon: "wallet", title: "Affordable Pricing", desc: "Honest market-friendly pricing and tailored AMC plans.", order: 3, active: true },
    { id: id(), icon: "heart-handshake", title: "Complete Support", desc: "Every service under one roof — handled by one accountable team.", order: 4, active: true },
    { id: id(), icon: "clock", title: "Quick Response", desc: "Same-day slots and priority visits for AMC customers.", order: 5, active: true },
    { id: id(), icon: "headphones", title: "Long-term Care", desc: "Dedicated relationship managers for recurring customers.", order: 6, active: true },
  ],
  finalCtaHeading: "One Company. Multiple Services. Complete Peace of Mind.",
  finalCtaBody:
    "From a quick repair to long-term maintenance — talk to our team and get a single trusted partner for your property.",
  finalCtaPrimaryText: "Book a Service Now",
  finalCtaSecondaryText: "Explore Services",
  heroImage: "",
  status: "active",
};

export const DEFAULT_VISION: VisionContent = {
  heroEyebrow: "Our Vision",
  heroTitle: "To become the most trusted one-stop solution for home and building services.",
  heroSubtitle: "Quality work. Honest pricing. Quick response. Complete care — for every property we serve.",
  visionEyebrow: "Our Vision",
  visionTitle: "",
  visionStatement:
    "Our vision is to simplify home and building maintenance by providing every essential service under one trusted platform.",
  visionBody:
    "We aim to deliver quality work, affordable pricing, reliable service and quick response for every customer — no matter the size of the job.",
  missionEyebrow: "Our Mission",
  missionTitle: "Professional care, honest service, lasting trust.",
  missionStatement:
    "Our mission is to provide professional home care, building care, repair, maintenance, improvement, safety and consultancy services with honesty, quality and customer satisfaction.",
  valuesHeading: "What we stand for",
  valuesEyebrow: "Core Values",
  valuesSubtitle: "Six promises that guide every visit, every quote and every job we complete.",
  values: [
    { id: id(), icon: "award", title: "Quality", desc: "We focus on delivering neat, professional and long-lasting work.", order: 1, active: true },
    { id: id(), icon: "shield-check", title: "Trust", desc: "We build long-term trust with transparent service and reliable support.", order: 2, active: true },
    { id: id(), icon: "wallet", title: "Affordability", desc: "We provide the best possible service at fair and reasonable prices.", order: 3, active: true },
    { id: id(), icon: "clock", title: "Quick Response", desc: "We understand urgent service needs and respond quickly.", order: 4, active: true },
    { id: id(), icon: "layers", title: "Complete Support", desc: "Multiple services under one roof, reducing customer effort.", order: 5, active: true },
    { id: id(), icon: "smile", title: "Customer Satisfaction", desc: "Every service is completed with customer satisfaction as the priority.", order: 6, active: true },
  ],
  ctaHeading: "Your Home. Your Building. Our Complete Care.",
  ctaBody: "Talk to our team or explore the full range of services we offer under one trusted roof.",
  ctaPrimaryText: "Explore Services",
  ctaSecondaryText: "Contact Us",
  heroImage: "",
  status: "active",
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

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ssg-content-change"));
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const fn = () => cb();
  if (typeof window !== "undefined") {
    window.addEventListener("ssg-content-change", fn);
    window.addEventListener("storage", fn);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("ssg-content-change", fn);
      window.removeEventListener("storage", fn);
    }
  };
}

export function getAbout(): AboutContent { return read(ABOUT_KEY, DEFAULT_ABOUT); }
export function setAbout(v: AboutContent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ABOUT_KEY, JSON.stringify(v));
  emit();
}
export function getVision(): VisionContent { return read(VISION_KEY, DEFAULT_VISION); }
export function setVision(v: VisionContent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VISION_KEY, JSON.stringify(v));
  emit();
}

export function useAbout(): AboutContent {
  const [s, set] = useState<AboutContent>(DEFAULT_ABOUT);
  useEffect(() => { set(getAbout()); return subscribe(() => set(getAbout())); }, []);
  return s;
}
export function useVision(): VisionContent {
  const [s, set] = useState<VisionContent>(DEFAULT_VISION);
  useEffect(() => { set(getVision()); return subscribe(() => set(getVision())); }, []);
  return s;
}

export function newBlock(): Block {
  return { id: id(), title: "New item", desc: "", icon: "star", order: 99, active: true };
}
export function newStrength(): Strength {
  return { id: id(), title: "New stat", value: "0+", desc: "", icon: "star", order: 99, active: true };
}

export const sortActive = <T extends { active: boolean; order: number }>(arr: T[]) =>
  arr.filter((x) => x.active).sort((a, b) => a.order - b.order);