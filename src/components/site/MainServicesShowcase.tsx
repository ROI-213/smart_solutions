import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Hammer, Zap, Droplets, Wrench, Sparkles, Home as HomeIcon,
  ShieldCheck, Trees, Wallet, BadgeCheck, Clock, ThumbsUp, Lock, Headphones,
  type LucideIcon,
} from "lucide-react";
import svcInterior from "@/assets/svc-pop-ceiling.jpg";
import svcElectrical from "@/assets/svc-house-wiring.jpg";
import svcPlumbing from "@/assets/svc-plumbing-repair.jpg";
import svcAppliance from "@/assets/svc-ac-service.jpg";
import svcCleaning from "@/assets/svc-deep-cleaning.jpg";
import svcMaintenance from "@/assets/svc-carpentry.jpg";
import svcSecurity from "@/assets/svc-security-guard.jpg";
import svcOutdoor from "@/assets/svc-outdoor-card.jpg";
import svcFinancial from "@/assets/svc-modular-kitchen.jpg";

type Card = {
  slug: string;
  title: string;
  Icon: LucideIcon;
  image: string;
  tint: string;
};

const CARDS: Card[] = [
  { slug: "interior-construction-works", title: "Interior & Construction", Icon: Hammer, image: svcInterior, tint: "#16A34A" },
  { slug: "electrical-services", title: "Electrical Services", Icon: Zap, image: svcElectrical, tint: "#F97316" },
  { slug: "plumbing-services", title: "Plumbing Services", Icon: Droplets, image: svcPlumbing, tint: "#0B2E59" },
  { slug: "appliance-services", title: "Appliance Services", Icon: Wrench, image: svcAppliance, tint: "#7C3AED" },
  { slug: "cleaning-services", title: "Cleaning Services", Icon: Sparkles, image: svcCleaning, tint: "#06B6D4" },
  { slug: "maintenance-services", title: "Maintenance Services", Icon: HomeIcon, image: svcMaintenance, tint: "#16A34A" },
  { slug: "safety-security-services", title: "Safety & Security", Icon: ShieldCheck, image: svcSecurity, tint: "#0B2E59" },
  { slug: "outdoor-services", title: "Outdoor Services", Icon: Trees, image: svcOutdoor, tint: "#16A34A" },
  { slug: "financial-consultancy-services", title: "Consultancy Services", Icon: Wallet, image: svcFinancial, tint: "#0B2E59" },
];

const TRUST = [
  { Icon: BadgeCheck, title: "Verified Professionals", desc: "Background verified experts", color: "#16A34A" },
  { Icon: Clock, title: "On-Time Service", desc: "Punctual & reliable", color: "#F97316" },
  { Icon: ThumbsUp, title: "Quality Assured", desc: "High standards, always", color: "#0B2E59" },
  { Icon: Lock, title: "Safe & Insured", desc: "Your property is protected", color: "#7C3AED" },
  { Icon: Headphones, title: "Customer Support", desc: "We’re here to help 24/7", color: "#06B6D4" },
];

export function MainServicesShowcase() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: false,
      containScroll: false,
      duration: 32,
    },
    [Autoplay({ delay: 2800, stopOnMouseEnter: true, stopOnInteraction: false })],
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActive(emblaApi.selectedScrollSnap() % CARDS.length);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F7FA] via-white to-[#F5F7FA] py-6 sm:py-12">
      {/* Soft premium glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#D4AF37]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-0 bottom-0 h-[420px] w-[600px] rounded-full bg-[#0B2E59]/10 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, #0B2E59 1px, transparent 1px), linear-gradient(90deg, #0B2E59 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0B2E59]/30 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0B2E59] shadow-sm">
            <HomeIcon className="h-3 w-3 text-[#0B2E59]" /> What We Do Best
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#0B2E59] sm:text-3xl lg:text-4xl">
            Our Main Services
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-[#0B2E59]/70">
            Complete home, apartment, villa, office &amp; building services across{" "}
            <span className="font-bold text-[#0B2E59]">Bengaluru</span>.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2" aria-hidden>
            <span className="h-[2px] w-10 rounded-full bg-[#D4AF37]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B2E59]" />
          </div>
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden">
        {/* Arrows */}
        <button
          aria-label="Previous"
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#0B2E59] shadow-xl transition-all hover:scale-110 hover:bg-[#0B2E59] hover:text-white md:grid"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next"
          onClick={scrollNext}
          className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#0B2E59] shadow-xl transition-all hover:scale-110 hover:bg-[#0B2E59] hover:text-white md:grid"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Desktop / tablet: Embla snap carousel with arrows & dots */}
        <div ref={emblaRef} className="hidden overflow-hidden px-6 pb-4 md:block">
          <div className="flex gap-4 [touch-action:pan-y]">
          {CARDS.map((c) => (
            <Link
              key={c.slug}
              to="/services/$slug"
              params={{ slug: c.slug }}
              className="group relative flex h-[320px] w-[200px] shrink-0 overflow-hidden rounded-2xl border border-white/40 bg-white shadow-[0_14px_40px_-22px_rgba(0,59,122,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-22px_rgba(0,59,122,0.5)] [transform:translateZ(0)] [backface-visibility:hidden] [will-change:transform]"
            >
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  width={800}
                  height={1200}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E59] via-[#0B2E59]/55 to-transparent" />
                <div className="relative z-10 mt-auto flex w-full flex-col items-center gap-2 p-4 text-center">
                  <h3 className="text-sm font-black leading-tight text-white drop-shadow">
                    {c.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#0B2E59] transition-all group-hover:bg-gradient-to-r group-hover:from-[#D4AF37] group-hover:to-[#E5C158] group-hover:text-white">
                  View Services
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
          </div>
        </div>

        {/* Mobile: continuous seamless marquee */}
        <div className="overflow-hidden px-4 pb-4 md:hidden">
          <div className="flex w-max gap-4 animate-marquee-x [will-change:transform]">
            {[...CARDS, ...CARDS].map((c, i) => (
              <Link
                key={`${c.slug}-${i}`}
                to="/services/$slug"
                params={{ slug: c.slug }}
                className="group relative flex h-[280px] w-[180px] shrink-0 overflow-hidden rounded-2xl border border-white/40 bg-white shadow-[0_14px_40px_-22px_rgba(0,59,122,0.35)] [transform:translateZ(0)] [backface-visibility:hidden]"
              >
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  width={800}
                  height={1200}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E59] via-[#0B2E59]/55 to-transparent" />
                <div className="relative z-10 mt-auto flex w-full flex-col items-center gap-2 p-3 text-center">
                  <h3 className="text-sm font-black leading-tight text-white drop-shadow">
                    {c.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#0B2E59]">
                    View Services
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dot indicators (desktop only) */}
        <div className="mt-4 hidden items-center justify-center gap-1.5 md:flex">
          {CARDS.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${i === active ? "w-6 bg-[#0B2E59]" : "w-1.5 bg-[#0B2E59]/25 hover:bg-[#0B2E59]/50"}`}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B2E59]/60">
          Services keep sliding
        </p>
      </div>

      {/* Trust strip — continuous marquee on all viewports */}
      <div className="relative mx-auto mt-8 max-w-6xl px-6">
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-3 shadow-[0_14px_40px_-24px_rgba(0,59,122,0.35)]">
          <div className="flex w-max animate-marquee-x [will-change:transform]">
            {[...TRUST, ...TRUST].map((t, i) => (
              <div key={`${t.title}-${i}`} className="flex min-w-[220px] items-center gap-2.5 px-5">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                  style={{ backgroundColor: `${t.color}1A`, color: t.color }}
                >
                  <t.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight text-[#0B2E59]">{t.title}</p>
                  <p className="text-[11px] text-[#0B2E59]/60">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}