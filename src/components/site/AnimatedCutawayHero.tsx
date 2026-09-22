import { Link } from "@tanstack/react-router";
import {
  Phone, ShieldCheck, CalendarCheck, Grid3x3, MapPin,
  Zap, Droplets, PaintBucket, Wrench, Camera, Sparkles, Leaf, Hammer, ChefHat,
} from "lucide-react";
import { SITE } from "@/lib/site";
import houseImg from "@/assets/cutaway-house.webp";

type Tag = {
  id: string;
  label: string;
  Icon: typeof Zap;
  tone: string;
  pos: string;      // absolute positioning on the scene
  delay: string;
};

const TAGS: Tag[] = [
  { id: "ceiling",   label: "Interior / Ceiling",       Icon: PaintBucket, tone: "text-amber-600",   pos: "left-[-2%] top-[6%]",     delay: "0s"   },
  { id: "electric",  label: "Electrical",               Icon: Zap,         tone: "text-orange-500",  pos: "right-[-2%] top-[4%]",    delay: "0.3s" },
  { id: "wardrobe",  label: "Bedroom Wardrobe",         Icon: Hammer,      tone: "text-[#B45309]",   pos: "left-[-4%] top-[24%]",    delay: "0.6s" },
  { id: "bath",      label: "Bathroom Plumbing",        Icon: Droplets,    tone: "text-sky-600",     pos: "right-[-3%] top-[22%]",   delay: "0.9s" },
  { id: "kitchen",   label: "Kitchen Plumbing",         Icon: ChefHat,     tone: "text-emerald-600", pos: "left-[-4%] top-[46%]",    delay: "0.2s" },
  { id: "clean",     label: "Cleaning",                 Icon: Sparkles,    tone: "text-[#0B2E59]",   pos: "right-[-2%] top-[48%]",   delay: "0.5s" },
  { id: "cctv",      label: "Entrance Security / CCTV", Icon: Camera,      tone: "text-orange-600",  pos: "left-[-3%] bottom-[16%]", delay: "0.8s" },
  { id: "appliance", label: "Appliance Repair",         Icon: Wrench,      tone: "text-emerald-700", pos: "right-[-3%] bottom-[14%]",delay: "0.4s" },
  { id: "garden",    label: "Balcony Gardening",        Icon: Leaf,        tone: "text-green-600",   pos: "left-[-2%] bottom-[-2%]", delay: "0.7s" },
];

export function AnimatedCutawayHero() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center lg:gap-14">
      {/* LEFT */}
      <div className="animate-fade-in">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-orange-500 px-4 py-1.5 font-bold uppercase tracking-wide text-white shadow-card"
             style={{ fontSize: "clamp(0.6rem, 1.6vw, 0.75rem)" }}>
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span className="text-center leading-tight">Quality Work • Best Price • Trusted Service • Quick Response</span>
        </div>

        <h1 className="mt-6 font-black leading-[1.05] tracking-tight text-primary"
            style={{ fontSize: "clamp(1.9rem, 4.8vw, 3.75rem)" }}>
          One Call for All Solutions
          <br />
          <span className="text-emerald-600">All Home & Building services under one roof.</span>
        </h1>
        <div className="mt-3 h-1 w-24 rounded-full bg-emerald-500/70" />

        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          From ceiling, kitchen, wardrobe, electrical, plumbing, appliance repair,
          cleaning, CCTV, security, gardening and maintenance — we take care of every
          part of your home and building.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#enquiry" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-emerald-700">
            <CalendarCheck className="h-4 w-4" /> Book a Service
          </a>
          <Link to="/services" className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-card px-5 py-3 text-sm font-bold text-primary transition-all hover:-translate-y-0.5 hover:border-primary/40">
            <Grid3x3 className="h-4 w-4" /> View Services
          </Link>
          <a href={`tel:${SITE.contact.primary.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-orange-600">
            <Phone className="h-4 w-4" /> Call Now
          </a>
        </div>

        <div className="mt-6 hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground shadow-card md:inline-flex">
          <MapPin className="h-4 w-4 text-primary" /> Proudly Serving Bengaluru &amp; Surroundings
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative animate-fade-in hidden md:block">
        {/* Soft ambient glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 blur-3xl">
          <div className="absolute left-1/4 top-1/4 h-2/3 w-2/3 rounded-full bg-emerald-200/40" />
          <div className="absolute right-1/4 bottom-1/4 h-1/2 w-1/2 rounded-full bg-sky-200/40" />
        </div>

        <div className="relative mx-auto max-w-[640px] px-6 sm:px-12 lg:px-14">
          <img
            src={houseImg}
            alt="Realistic cutaway view of a modern home showing technicians providing electrical, plumbing, cleaning, wardrobe, appliance, CCTV, and gardening services"
            width={1100}
            height={821}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="block w-full drop-shadow-[0_25px_45px_rgba(11,46,89,0.18)] transition-transform duration-500 ease-out hover:scale-[1.015]"
          />

          {/* Floating labels */}
          {TAGS.map((t) => {
            const Icon = t.Icon;
            return (
              <div
                key={t.id}
                className={`absolute ${t.pos} hidden items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-lift ring-1 ring-slate-200/70 backdrop-blur sm:inline-flex`}
                style={{ animation: `hero-float 4.5s ease-in-out ${t.delay} infinite` }}
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 ${t.tone}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="whitespace-nowrap text-[11px] font-bold text-foreground">{t.label}</span>
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @keyframes hero-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="hero-float"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}