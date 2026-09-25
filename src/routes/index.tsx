import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Phone, MessageCircle, Clock, BadgeCheck, Wallet,
  Zap, Droplets, Wrench, Sparkles, ShieldCheck, Hammer, Trees, Home as HomeIcon,
  PaintBucket, Camera, Bug, Star, Send, Quote,
  AirVent, Refrigerator, Truck, Utensils, PaintRoller, MoreHorizontal,
  Building2, Headphones, Leaf, FileText, ChevronLeft, ChevronRight,
  MapPin, CalendarCheck, Grid3x3, Bed, ShowerHead, Settings, Check,
} from "lucide-react";
import { Briefcase, Store, Castle, Users } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";
import cutawayHome from "@/assets/cutaway-home.jpg";
import bengaluruApt from "@/assets/hero-bengaluru-apt.jpg";
import svcElectrical from "@/assets/svc-electrical.jpg";
import svcPlumbing from "@/assets/svc-plumbing.jpg";
import svcCleaning from "@/assets/svc-cleaning.jpg";
import svcSecurity from "@/assets/svc-security.jpg";
import svcCatInterior from "@/assets/svc-pop-ceiling.jpg";
import svcCatElectrical from "@/assets/svc-house-wiring.jpg";
import svcCatPlumbing from "@/assets/svc-plumbing-repair.jpg";
import svcCatAppliance from "@/assets/svc-ac-service.jpg";
import svcCatCleaning from "@/assets/svc-deep-cleaning.jpg";
import svcCatMaintenance from "@/assets/svc-maintenance-team.jpg";
import svcCatSecurity from "@/assets/svc-security-guard.jpg";
import svcCatOutdoor from "@/assets/svc-outdoor-gardening.jpg";
import svcCatFinancial from "@/assets/svc-financial-consultancy.jpg";
import interiorConstructionBanner from "@/assets/interior-construction-banner.png";
import electricalBanner from "@/assets/banner-electrical.jpg";
import plumbingBanner from "@/assets/banner-plumbing.jpg";
import applianceBanner from "@/assets/banner-ac.jpg";
import cleaningBanner from "@/assets/banner-cleaning.jpg";
import maintenanceBanner from "@/assets/banner-maintenance.jpg";
import homeImprovementBanner from "@/assets/banner-home-improvement.jpg";
import safetySecurityBanner from "@/assets/banner-safety-security.jpg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import popPopCeiling from "@/assets/svc-work-pop-ceiling.jpg";
import popWiring from "@/assets/svc-work-wiring.jpg";
import popPlumbing from "@/assets/svc-work-plumbing.jpg";
import popAc from "@/assets/svc-work-ac.jpg";
import popCleaning from "@/assets/svc-work-cleaning.jpg";
import popSecurity from "@/assets/svc-work-security.jpg";
import popCctv from "@/assets/svc-work-cctv.jpg";
import popPainting from "@/assets/svc-work-painting.jpg";
import popKitchen from "@/assets/svc-work-kitchen.jpg";
import popWaterTank from "@/assets/svc-work-watertank.jpg";
import popCarpentry from "@/assets/svc-work-carpentry.jpg";
import popPest from "@/assets/svc-work-pest.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MainServicesShowcase } from "@/components/site/MainServicesShowcase";
import { AnimatedCutawayHero } from "@/components/site/AnimatedCutawayHero";
import { SITE } from "@/lib/site";
import { slugifyItem } from "@/data/services";
import { SERVICE_ITEM_IMAGES, resolveServiceImage } from "@/data/service-item-images";
import { AgreementConsent } from "@/components/site/AgreementConsent";
import type { EnquiryAgreement } from "@/lib/enquiries-store";
import { useCustomerAuth, updateCurrentCustomerPhone } from "@/lib/customer-auth";
import { CustomerAuthDialog } from "@/components/site/CustomerAuthDialog";
import { usePublicServicesCatalog } from "@/lib/public-services";

const HOME_IMPROVEMENT_BANNER_URL = "/assets/svc-home-improvement.jpg?v=202607080620";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Solutions Groups — Home Care 360" },
      { name: "description", content: "One call for all home & building services — interior, electrical, plumbing, cleaning, maintenance, security and more." },
      { property: "og:title", content: "Smart Solutions Groups — Home Care 360" },
      { property: "og:description", content: "Quality work, best price, trusted service, quick response — all under one roof." },
    ],
  }),
  component: Index,
});

const popular = [
  { name: "POP False Ceiling", category: "Interior", Icon: Hammer, image: popPopCeiling },
  { name: "House Wiring", category: "Electrical", Icon: Zap, image: popWiring },
  { name: "Plumbing Repairs", category: "Plumbing", Icon: Droplets, image: popPlumbing },
  { name: "AC Installation & Servicing", category: "Appliance", Icon: Wrench, image: popAc },
  { name: "Deep Home Cleaning", category: "Cleaning", Icon: Sparkles, image: popCleaning },
  { name: "Security Guard Services", category: "Security", Icon: ShieldCheck, image: popSecurity },
  { name: "CCTV Installation", category: "Security", Icon: Camera, image: popCctv },
  { name: "Painting Works", category: "Interior", Icon: PaintBucket, image: popPainting },
  { name: "Modular Kitchen Installation", category: "Interior", Icon: Hammer, image: popKitchen },
  { name: "Water Tank Cleaning", category: "Cleaning", Icon: Droplets, image: popWaterTank },
  { name: "Carpentry Works", category: "Interior", Icon: Hammer, image: popCarpentry },
  { name: "Pest Control", category: "Outdoor", Icon: Bug, image: popPest },
] as const;

const whyUs = [
  { title: "One Call for All Services", body: "No more juggling vendors. Every service is just one phone call away.", Icon: Phone },
  { title: "Quality Work", body: "Skilled, trained technicians who take pride in the finish, not just the fix.", Icon: BadgeCheck },
  { title: "Best Price", body: "Transparent, upfront quotes — no hidden charges, ever.", Icon: Wallet },
  { title: "Trusted Service", body: "Verified team serving homes, apartments, villas, offices and buildings.", Icon: ShieldCheck },
  { title: "Quick Response", body: "Same-day booking and fast technician assignment when you need it.", Icon: Clock },
  { title: "Complete Building Support", body: "Interior, repair, cleaning, maintenance, security and consultancy — all in-house.", Icon: HomeIcon },
] as const;

const steps = [
  ["Contact Us", "Customer calls, WhatsApps, or fills the enquiry form."],
  ["Requirement Understanding", "Team understands the exact home or building service requirement."],
  ["Service Assignment", "The right technician or service team is assigned."],
  ["Site Visit & Execution", "Team visits the location and completes the required work."],
  ["Quality Check", "Work is inspected for quality and customer satisfaction."],
  ["Completion & Support", "Service is wrapped up with support for future maintenance."],
] as const;

const testimonials = [
  { name: "Priya R.", service: "Deep Cleaning", location: "Whitefield", rating: 5, quote: "From cleaning to electrical fixes, the team handles everything. Total peace of mind." },
  { name: "Rahul S.", service: "AMC", location: "HSR Layout", rating: 5, quote: "Our AMC has cut downtime dramatically. Quick response every single time." },
  { name: "Anita K.", service: "Interior Works", location: "JP Nagar", rating: 5, quote: "They redid our villa interiors and now maintain it monthly. Professional and honest." },
] as const;

const WHATSAPP_URL = `https://wa.me/91${SITE.contact.primary.phone}?text=${encodeURIComponent("Hi Smart Solutions Groups, I need help with home/building service. Please contact me.")}`;

type HeroSlide = {
  tab: string;
  eyebrow: string;
  heading: string;
  highlight: string;
  subheading: string;
  description: string;
  image: string;
  imageAlt: string;
  ctas: { label: string; href: string; variant: "primary" | "outline" | "ghost"; external?: boolean; icon?: typeof Phone }[];
  chips?: string[];
  badges?: { label: string; Icon: typeof BadgeCheck }[];
  cards?: { label: string; Icon: typeof BadgeCheck }[];
  floats: { Icon: typeof Zap; pos: string; delay: string }[];
};

const heroSlides: HeroSlide[] = [
  {
    tab: "Welcome",
    eyebrow: "Bengaluru's trusted home & building partner",
    heading: "Welcome to Smart Solutions Groups",
    highlight: "Home Care 360",
    subheading: "All Home & Building Services Under One Roof",
    description:
      "Your trusted Bengaluru-based service partner for homes, apartments, villas, offices and buildings. From interiors to maintenance, repairs, cleaning, security and consultancy — we provide complete service support through one trusted team.",
    image: hero1,
    imageAlt: "Smart Solutions Groups team in front of a Bengaluru apartment",
    ctas: [
      { label: "Book a Service", href: "#enquiry", variant: "primary", icon: ArrowRight },
      { label: "Explore Services", href: "/services", variant: "outline" },
      { label: "Call Now", href: `tel:${SITE.contact.primary.phone}`, variant: "ghost", icon: Phone, external: true },
    ],
    badges: [
      { label: "Trusted Local Service Provider", Icon: ShieldCheck },
      { label: "Quick Response Team", Icon: Clock },
      { label: "Quality Work", Icon: BadgeCheck },
      { label: "Best Price", Icon: Wallet },
    ],
    floats: [
      { Icon: HomeIcon, pos: "top-4 -left-4 sm:-left-8", delay: "0s" },
      { Icon: Building2, pos: "top-1/4 -right-4 sm:-right-8", delay: "0.4s" },
      { Icon: Headphones, pos: "bottom-1/3 -left-6 sm:-left-10", delay: "0.8s" },
      { Icon: BadgeCheck, pos: "bottom-6 -right-2 sm:-right-6", delay: "1.2s" },
    ],
  },
];

function Index() {
  const [selectedService, setSelectedService] = useState("");

  const handleRequestService = (serviceName: string) => {
    setSelectedService(serviceName);
    window.setTimeout(() => {
      document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <SiteLayout>
      <Hero />
      <ServiceShortcuts />
      <MainServicesShowcase />
      <ServiceCategories />
      <AboutPreview />
      <WhyUs />
      <PopularServices onRequestService={handleRequestService} />
      <CompleteGrid onRequestService={handleRequestService} />
      <Process />
      <TestimonialsPreview />
      <FinalCTA selectedService={selectedService} />
    </SiteLayout>
  );
}

/* ───────────────────────── HERO ───────────────────────── */
function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = heroSlides.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || total <= 1) return;
    timer.current = setInterval(() => setActive((i) => (i + 1) % total), 6500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, total]);

  const go = (i: number) => setActive(((i % total) + total) % total);

  const isLight = active === 0 || active === 1;

  return (
    <section
      className={`relative overflow-hidden transition-colors duration-700 ${
        isLight
          ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-foreground"
          : "bg-gradient-hero text-primary-foreground"
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* decorative blobs */}
      {!isLight && (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        </>
      )}
      {isLight && (
        <div aria-hidden className="pointer-events-none absolute right-10 top-10 grid grid-cols-3 gap-2 opacity-60">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-emerald-500/60" />
          ))}
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 pt-4 pb-2 sm:px-6 sm:pt-16 sm:pb-6">
        <div className="relative">
          {heroSlides.map((slide, i) =>
            i === 0 ? (
              <AnimatedCutawayHero key={slide.tab} />
            ) : i === 1 ? (
              <BengaluruApartmentServiceHeroSlide key={slide.tab} visible={i === active} />
            ) : (
              <HeroSlideView key={slide.tab} slide={slide} visible={i === active} />
            ),
          )}
        </div>

        {/* bottom service strip — visible only on welcome slide */}
        {active === 0 && <BottomServiceStrip />}

        {/* arrows */}
        {total > 1 && (
        <>
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(active - 1)}
          className={`absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full p-2.5 backdrop-blur transition-colors sm:block ${
            isLight
              ? "bg-card text-primary shadow-card hover:bg-muted"
              : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(active + 1)}
          className={`absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full p-2.5 backdrop-blur transition-colors sm:block ${
            isLight
              ? "bg-card text-primary shadow-card hover:bg-muted"
              : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {heroSlides.map((s, i) => (
            <button
              key={s.tab}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${
                i === active
                  ? "w-8 bg-emerald-500"
                  : isLight
                    ? "w-2 bg-slate-300 hover:bg-slate-400"
                    : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
              }`}
            />
          ))}
        </div>

        {/* tabs */}
        <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-6 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-3 sm:grid sm:min-w-0 sm:grid-cols-4">
            {heroSlides.map((s, i) => (
              <button
                key={s.tab}
                type="button"
                onClick={() => go(i)}
                className={`flex shrink-0 flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition-all ${
                  i === active
                    ? isLight
                      ? "border-emerald-500 bg-card shadow-lift"
                      : "border-secondary bg-primary-foreground/15 shadow-lift"
                    : isLight
                      ? "border-border bg-card/60 hover:bg-card"
                      : "border-primary-foreground/15 bg-primary-foreground/5 hover:bg-primary-foreground/10"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-emerald-600" : "text-secondary"}`}>
                  0{i + 1}
                </span>
                <span className="text-sm font-bold">{s.tab}</span>
              </button>
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </section>
  );
}

function HeroSlideView({ slide, visible }: { slide: HeroSlide; visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className={`grid gap-10 transition-all duration-700 lg:grid-cols-2 lg:items-center ${
        visible
          ? "relative opacity-100 translate-y-0"
          : "pointer-events-none absolute inset-0 opacity-0 translate-y-4"
      }`}
    >
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary backdrop-blur">
          <BadgeCheck className="h-3.5 w-3.5" /> {slide.eyebrow}
        </div>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">
          {slide.heading}{" "}
          <span className="block text-secondary">{slide.highlight}</span>
        </h1>
        <p className="mt-4 text-base font-semibold text-primary-foreground/90 sm:text-lg">
          {slide.subheading}
        </p>
        <p className="mt-3 max-w-xl text-sm text-primary-foreground/75 sm:text-base">
          {slide.description}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {slide.ctas.map((cta) => {
            const Icon = cta.icon;
            const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all";
            const cls =
              cta.variant === "primary"
                ? `${base} bg-gradient-accent text-accent-foreground shadow-card hover:scale-105`
                : cta.variant === "outline"
                  ? `${base} border border-primary-foreground/30 hover:bg-primary-foreground/10`
                  : `${base} bg-primary-foreground/10 hover:bg-primary-foreground/20`;
            return (
              <a key={cta.label} href={cta.href} className={cls}>
                {Icon ? <Icon className="h-4 w-4" /> : null} {cta.label}
              </a>
            );
          })}
        </div>

        {slide.badges && (
          <div className="mt-7 grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-2 sm:text-sm">
            {slide.badges.map(({ label, Icon }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border border-primary-foreground/10 bg-primary-foreground/10 px-3 py-2 backdrop-blur">
                <Icon className="h-4 w-4 shrink-0 text-secondary" /> <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        )}

        {slide.chips && (
          <div className="mt-6 flex flex-wrap gap-2">
            {slide.chips.map((c) => (
              <span key={c} className="rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-primary-foreground/90 backdrop-blur">
                {c}
              </span>
            ))}
          </div>
        )}

        {slide.cards && (
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {slide.cards.map(({ label, Icon }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-2 text-xs font-semibold backdrop-blur">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary/20 text-secondary">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute -inset-6 rounded-[2rem] bg-secondary/20 blur-3xl" aria-hidden />
        <div className="relative overflow-hidden rounded-[1.75rem] border border-primary-foreground/10 shadow-lift">
          <img
            src={slide.image}
            alt={slide.imageAlt}
            width={1024}
            height={1024}
            loading={visible ? "eager" : "lazy"}
            className="block aspect-[5/4] w-full object-cover sm:aspect-[4/3]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent" />
        </div>
        {slide.floats.map(({ Icon, pos, delay }, i) => (
          <div
            key={i}
            style={{ animationDelay: delay }}
            className={`absolute ${pos} grid h-11 w-11 place-items-center rounded-2xl bg-card text-primary shadow-lift animate-fade-in-up sm:h-12 sm:w-12`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────── HOME CARE CUTAWAY HERO (Welcome slide) ───────────── */
const cutawayLabels = [
  { label: "Electrical",            Icon: Zap,         pos: "left-[28%] top-[4%]",    iconBg: "bg-orange-100",  iconColor: "text-orange-600" },
  { label: "Interior / Ceiling",    Icon: PaintBucket, pos: "right-[2%] top-[6%]",    iconBg: "bg-amber-100",   iconColor: "text-amber-600" },
  { label: "Bedroom Wardrobe",      Icon: Bed,         pos: "left-[2%] top-[18%]",    iconBg: "bg-[#F5F7FA]",    iconColor: "text-[#D4AF37]" },
  { label: "Bathroom Plumbing",     Icon: ShowerHead,  pos: "left-[2%] top-[40%]",    iconBg: "bg-[#F5F7FA]",     iconColor: "text-[#0B2E59]" },
  { label: "Kitchen Plumbing",      Icon: Droplets,    pos: "right-[2%] top-[40%]",   iconBg: "bg-[#F5F7FA]",  iconColor: "text-[#D4AF37]" },
  { label: "Entrance Security / CCTV", Icon: ShieldCheck, pos: "left-[4%] top-[62%]", iconBg: "bg-orange-100",  iconColor: "text-orange-600" },
  { label: "Appliance Repair",      Icon: Wrench,      pos: "right-[2%] top-[64%]",   iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { label: "Balcony Gardening",     Icon: Leaf,        pos: "right-[2%] bottom-[6%]", iconBg: "bg-green-100",   iconColor: "text-green-600" },
] as const;

function HomeCareCutawayHero({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className={`grid gap-10 transition-all duration-700 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center ${
        visible
          ? "relative opacity-100 translate-y-0"
          : "pointer-events-none absolute inset-0 opacity-0 translate-y-4"
      }`}
    >
      {/* LEFT — brand + heading + CTAs */}
      <div>
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-orange-500 px-4 py-1.5 font-bold uppercase tracking-wide text-white shadow-card"
             style={{ fontSize: "clamp(0.6rem, 1.6vw, 0.75rem)" }}>
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span className="text-center leading-tight">Quality Work • Best Price • Trusted Service • Quick Response</span>
        </div>

        <h1 className="mt-5 font-black leading-[1.05] tracking-tight text-primary"
            style={{ fontSize: "clamp(1.9rem, 4.8vw, 3.75rem)" }}>
          Your Entire Home.
          <br />
          Our Complete Care.
        </h1>
        <div className="mt-4 text-emerald-600 font-black leading-tight"
             style={{ fontSize: "clamp(1.35rem, 3.4vw, 2.5rem)" }}>
          One Call for All Solutions
        </div>
        <div className="mt-1 text-emerald-600 font-bold leading-snug"
             style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.5rem)" }}>
          All Home &amp; Building Services Under One Roof
        </div>
        <div className="mt-3 h-1 w-24 rounded-full bg-emerald-500/70" />

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          From ceiling, kitchen, wardrobe, electrical, plumbing, appliance repair, cleaning, CCTV,
          security, gardening and maintenance — we take care of every part of your home and building.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#enquiry"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            <CalendarCheck className="h-4 w-4" /> Book a Service
          </a>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-card px-5 py-3 text-sm font-bold text-primary transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <Grid3x3 className="h-4 w-4" /> View Services
          </Link>
          <a
            href={`tel:${SITE.contact.primary.phone}`}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-orange-600"
          >
            <Phone className="h-4 w-4" /> Call Now
          </a>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground shadow-card">
          <MapPin className="h-4 w-4 text-primary" /> Proudly Serving Bengaluru &amp; Surroundings
        </div>
      </div>

      {/* RIGHT — cutaway image with floating labels */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={cutawayHome}
            alt="3-floor cutaway view of a modern Bengaluru home with Smart Solutions technicians at work"
            width={1536}
            height={1152}
            loading={visible ? "eager" : "lazy"}
            className="block w-full object-cover"
          />
        </div>

        {cutawayLabels.map(({ label, Icon, pos, iconBg, iconColor }) => (
          <div
            key={label}
            className={`absolute ${pos} hidden items-center gap-2 rounded-xl bg-white/95 px-2.5 py-1.5 shadow-lift backdrop-blur sm:flex`}
          >
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconBg} ${iconColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="whitespace-nowrap text-[11px] font-bold leading-tight text-foreground">{label}</span>
          </div>
        ))}

      </div>
    </div>
  );
}

/* ───────────── BOTTOM SERVICE STRIP ───────────── */
const stripCategories = [
  { label: "Interior & Construction", Icon: Hammer,      color: "text-emerald-600" },
  { label: "Electrical Services",     Icon: Zap,         color: "text-orange-500" },
  { label: "Plumbing Services",       Icon: Droplets,    color: "text-[#0B2E59]" },
  { label: "Appliance Services",      Icon: Wrench,      color: "text-[#D4AF37]" },
  { label: "Cleaning Services",       Icon: Sparkles,    color: "text-[#0B2E59]" },
  { label: "Maintenance Services",    Icon: Settings,    color: "text-emerald-700" },
  { label: "Safety & Security",       Icon: ShieldCheck, color: "text-[#0B2E59]" },
  { label: "Outdoor Services",        Icon: Leaf,        color: "text-green-600" },
  { label: "Consultancy Services",    Icon: Headphones,  color: "text-slate-700" },
] as const;

function BottomServiceStrip() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
      <div className="group flex w-max animate-marquee-x [will-change:transform] hover:[animation-play-state:paused]">
        {[...stripCategories, ...stripCategories].map(({ label, Icon, color }, idx) => (
          <div
            key={`${label}-${idx}`}
            className="flex shrink-0 items-center gap-2.5 border-r border-border/60 px-5 py-4"
          >
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="whitespace-nowrap text-[11px] font-bold leading-tight text-foreground sm:text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── BENGALURU APARTMENT SERVICE STORY HERO (Slide 2) ───────── */
const apartmentServiceCards = [
  { label: "Electrical", image: svcElectrical },
  { label: "Plumbing",   image: svcPlumbing },
  { label: "Cleaning",   image: svcCleaning },
  { label: "Security",   image: svcSecurity },
] as const;

const propertyStrip = [
  { label: "Homes",             Icon: HomeIcon,   color: "text-emerald-600" },
  { label: "Apartments",        Icon: Building2,  color: "text-[#0B2E59]" },
  { label: "Villas",            Icon: Castle,     color: "text-amber-600" },
  { label: "Offices",           Icon: Briefcase,  color: "text-[#D4AF37]" },
  { label: "Commercial",        Icon: Store,      color: "text-orange-500" },
  { label: "Gated Communities", Icon: Users,      color: "text-[#D4AF37]" },
] as const;

function BengaluruApartmentServiceHeroSlide({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden={!visible}
      className={`transition-all duration-700 ${
        visible
          ? "relative opacity-100 translate-y-0"
          : "pointer-events-none absolute inset-0 opacity-0 translate-y-4"
      }`}
    >
      {/* Apartment background with white-to-blue overlay */}
      <div className="relative overflow-hidden rounded-3xl border border-border shadow-lift">
        <img
          src={bengaluruApt}
          alt="Premium Bengaluru gated apartment community at golden hour"
          width={1536}
          height={1024}
          loading={visible ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-[#F5F7FA]/60 sm:from-white sm:via-white/80 sm:to-[#F5F7FA]/40"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/10" />

        <div className="relative grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-10 lg:px-12 lg:py-14">
          {/* LEFT — content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0B2E59] to-[#0A2540] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-card">
              <ShieldCheck className="h-3.5 w-3.5" /> Bengaluru's Trusted Home Care Partner
            </div>

            <div className="mt-5 flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <HomeIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-black tracking-tight text-primary sm:text-lg">SMART SOLUTIONS GROUPS</div>
                <div className="text-sm font-extrabold tracking-wide text-foreground sm:text-base">
                  HOME CARE <span className="text-emerald-600">360</span>
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                  All Home &amp; Building Services Under One Roof
                </div>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-bold text-primary-foreground shadow-card">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Bengaluru's Trusted Home Care Partner
            </div>

            <h1 className="mt-5 text-3xl font-black leading-[1.05] tracking-tight text-primary sm:text-4xl xl:text-5xl">
              Welcome to
              <br />
              Smart Solutions Groups
              <br />
              <span className="text-emerald-600">Home Care 360</span>
            </h1>
            <div className="mt-2 h-1 w-20 rounded-full bg-emerald-500/70" />

            <p className="mt-4 text-sm font-bold text-foreground sm:text-base">
              All Home &amp; Building Services Under One Roof
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              We provide professional services for homes, apartments, villas, offices and buildings
              across Bengaluru. One trusted team for interiors, repairs, cleaning, maintenance,
              safety, outdoor services and consultancy.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#enquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Book a Service <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-card transition-all hover:-translate-y-0.5"
              >
                <Grid3x3 className="h-4 w-4" /> Explore Services
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-card transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Now
              </a>
            </div>
          </div>

          {/* RIGHT — 2x2 service image cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {apartmentServiceCards.map((card) => (
              <div
                key={card.label}
                className="group relative overflow-hidden rounded-2xl border-2 border-white bg-white shadow-lift transition-transform hover:-translate-y-1"
              >
                <img
                  src={card.image}
                  alt={`${card.label} service in Bengaluru`}
                  width={768}
                  height={768}
                  loading={visible ? "eager" : "lazy"}
                  className="block aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 rounded-lg bg-white/95 px-3 py-1.5 shadow-card backdrop-blur">
                  <span className="text-[11px] font-bold text-primary sm:text-xs">{card.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom property strip */}
      <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-0 rounded-2xl border border-border bg-card shadow-lift sm:min-w-0 sm:grid sm:grid-cols-3 lg:grid-cols-6">
          {propertyStrip.map(({ label, Icon, color }, idx) => (
            <div
              key={label}
              className={`flex shrink-0 items-center gap-2.5 px-4 py-3.5 ${
                idx !== propertyStrip.length - 1 ? "border-r border-border/60" : ""
              }`}
            >
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold leading-tight text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── QUICK SERVICE CATEGORIES ─────────────────── */
const CATEGORY_IMAGES: Record<string, string> = {
  "interior-construction-works": svcCatInterior,
  "electrical-services": svcCatElectrical,
  "plumbing-services": svcCatPlumbing,
  "appliance-services": svcCatAppliance,
  "cleaning-services": svcCatCleaning,
  "maintenance-services": svcCatMaintenance,
  "home-improvement-services": HOME_IMPROVEMENT_BANNER_URL,
  "safety-security-services": svcCatSecurity,
  "outdoor-services": svcCatOutdoor,
  "financial-consultancy-services": svcCatFinancial,
};

function ServiceCategories() {
  const { catalog } = usePublicServicesCatalog();
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:py-20">
      <SectionHead eyebrow="What we do" title="Quick Service Categories" subtitle="Pick a category to explore everything we offer." />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
        {catalog.filter((s) => !["maintenance-services","home-improvement-services","safety-security-services","outdoor-services","financial-consultancy-services"].includes(s.slug)).map((s) => {
          const Icon = s.icon;
          const image = s.image || CATEGORY_IMAGES[s.slug];
          return (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {image ? (
                  <img
                    src={image}
                    alt={s.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute left-3 top-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-lg">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="text-sm font-bold leading-tight text-foreground sm:text-base">{s.title}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-xs text-muted-foreground sm:text-[13px]">{s.short}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                  View Services <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-10 flex justify-center">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-8 py-4 text-sm font-bold text-primary-foreground shadow-lift transition-all hover:scale-105 sm:text-base"
        >
          View All Services <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ───────────────────── ABOUT PREVIEW ───────────────────── */
function AboutPreview() {
  return (
    <section className="bg-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <SectionHead eyebrow="About us" title="About Smart Solutions Groups" align="left" />
          <p className="mt-5 text-muted-foreground">
            Smart Solutions Groups – Home Care 360 is a complete home and building service provider offering professional solutions for homes, apartments, villas, offices and commercial buildings. From construction works and repairs to maintenance, cleaning, security, outdoor services and consultancy, we provide everything under one trusted platform.
          </p>
          <div className="mt-6">
            <Link to="/about-us" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">
              Know More About Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="group overflow-hidden">
          <div className="flex w-max animate-marquee-x gap-4 [animation-duration:22s] [will-change:transform] group-hover:[animation-play-state:paused]">
            {[...Array(2)].flatMap((_, dup) =>
              ([
                ["1,000+", "Happy customers"],
                ["10+", "Service categories"],
                ["24/7", "Support window"],
                ["100%", "Satisfaction focus"],
              ] as const).map(([n, l], i) => (
                <div
                  key={`${dup}-${i}`}
                  className="w-[260px] shrink-0 rounded-2xl bg-card p-6 shadow-card sm:w-[240px]"
                >
                  <div className="text-3xl font-black text-primary">{n}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{l}</div>
                </div>
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── WHY CHOOSE US ───────────────────── */
function WhyUs() {
  return (
    <section className="mx-auto hidden max-w-7xl px-6 py-10 sm:block sm:py-20">
      <SectionHead eyebrow="Why choose us" title="Premium service, simple promise." subtitle="Six reasons families and businesses keep coming back to Smart Solutions." />
      <div className="mt-10 grid grid-cols-2 gap-3.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {whyUs.map(({ title, body, Icon }) => (
          <div key={title} className="flex h-full min-h-[130px] flex-col justify-center rounded-2xl border border-border bg-card p-3 shadow-card transition-transform hover:-translate-y-1 sm:min-h-0 sm:justify-start sm:p-6">
            <div className="mb-3 inline-grid h-[38px] w-[38px] place-items-center rounded-xl bg-gradient-accent text-accent-foreground sm:mb-4 sm:h-12 sm:w-12">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-sm font-bold leading-tight sm:text-lg">{title}</h3>
            <p className="mt-2 hidden text-sm text-muted-foreground sm:block">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────── POPULAR SERVICES ───────────────────── */
type PopularSub = { name: string; Icon: typeof Zap };
type PopularCategory = {
  id: string;
  title: string;
  description: string;
  Icon: typeof Zap;
  subServices: PopularSub[];
};

const popularCategories: PopularCategory[] = [
  { id: "cleaning", title: "Cleaning Services", description: "Deep home, sofa, kitchen & more", Icon: Sparkles, subServices: [
    { name: "Deep Home Cleaning", Icon: Sparkles }, { name: "Sofa Cleaning", Icon: Sparkles },
    { name: "Carpet Cleaning", Icon: Sparkles }, { name: "Bathroom Cleaning", Icon: ShowerHead },
    { name: "Kitchen Cleaning", Icon: Utensils }, { name: "Balcony Cleaning", Icon: Sparkles },
    { name: "Water Tank Cleaning", Icon: Droplets }, { name: "Outdoor Cleaning", Icon: Trees },
  ]},
  { id: "electrical", title: "Electrical Services", description: "Wiring, fittings, repairs & CCTV", Icon: Zap, subServices: [
    { name: "House Wiring", Icon: Zap }, { name: "Fan, Light & Switch Installation", Icon: Zap },
    { name: "Electrical Repairs", Icon: Wrench }, { name: "Inverter Installation", Icon: Zap },
    { name: "CCTV Installation & Maintenance", Icon: Camera }, { name: "Smart Lock Installation", Icon: ShieldCheck },
  ]},
  { id: "plumbing", title: "Plumbing Services", description: "Taps, leaks, motors & drainage", Icon: Droplets, subServices: [
    { name: "Tap Repair", Icon: Droplets }, { name: "Pipe Leakage Repair", Icon: Droplets },
    { name: "Sink Installation", Icon: Wrench }, { name: "Bathroom Fitting", Icon: ShowerHead },
    { name: "Water Motor Repair", Icon: Settings }, { name: "Drainage Cleaning", Icon: Droplets },
  ]},
  { id: "interior", title: "Interior & Construction Works", description: "Ceilings, modular kitchen, painting", Icon: Hammer, subServices: [
    { name: "POP False Ceiling", Icon: Hammer }, { name: "Modular Kitchen Installation", Icon: Utensils },
    { name: "Wardrobe Installation", Icon: Hammer }, { name: "Carpentry Works", Icon: Hammer },
    { name: "Painting Works", Icon: PaintBucket }, { name: "Granite & Tiles Fixing", Icon: Hammer },
    { name: "Glass Partition Works", Icon: Hammer }, { name: "Waterproofing Works", Icon: Droplets },
    { name: "False Ceiling Repairs", Icon: Wrench },
  ]},
  { id: "ac", title: "AC Services", description: "Install, repair, gas & deep clean", Icon: AirVent, subServices: [
    { name: "AC Installation", Icon: AirVent }, { name: "AC Repair", Icon: Wrench },
    { name: "AC Gas Filling", Icon: AirVent }, { name: "AC Deep Cleaning", Icon: Sparkles },
    { name: "AC Uninstallation", Icon: AirVent }, { name: "AC Maintenance", Icon: Settings },
  ]},
  { id: "pest", title: "Pest Control Services", description: "Cockroach, termite, bed bug & more", Icon: Bug, subServices: [
    { name: "Cockroach Control", Icon: Bug }, { name: "Termite Control", Icon: Bug },
    { name: "Bed Bug Control", Icon: Bed }, { name: "Mosquito Control", Icon: Bug },
    { name: "Ant Control", Icon: Bug }, { name: "General Pest Control", Icon: Bug },
  ]},
  { id: "appliance", title: "Appliance Repair Services", description: "Fridge, washing machine, geyser & RO", Icon: Refrigerator, subServices: [
    { name: "Refrigerator Repair", Icon: Refrigerator }, { name: "Washing Machine Repair", Icon: Settings },
    { name: "Microwave Repair", Icon: Utensils }, { name: "Chimney Repair", Icon: Utensils },
    { name: "Geyser Repair", Icon: ShowerHead }, { name: "RO Repair", Icon: Droplets },
  ]},
  { id: "carpentry", title: "Carpentry Works", description: "Furniture, door, wardrobe & cabinet", Icon: Hammer, subServices: [
    { name: "Furniture Repair", Icon: Hammer }, { name: "Door Repair", Icon: Hammer },
    { name: "Wardrobe Repair", Icon: Hammer }, { name: "Cabinet Repair", Icon: Hammer },
    { name: "Modular Furniture Work", Icon: Hammer }, { name: "Bed Repair", Icon: Bed },
  ]},
  { id: "painting", title: "Painting Services", description: "Interior, exterior, texture & waterproof", Icon: PaintBucket, subServices: [
    { name: "Interior Painting", Icon: PaintBucket }, { name: "Exterior Painting", Icon: PaintRoller },
    { name: "Wall Texture Painting", Icon: PaintBucket }, { name: "Rental House Painting", Icon: PaintRoller },
    { name: "Waterproof Painting", Icon: Droplets }, { name: "Door & Window Painting", Icon: PaintBucket },
  ]},
  { id: "movers", title: "Packers & Movers", description: "Home, office & vehicle shifting", Icon: Truck, subServices: [
    { name: "Home Shifting", Icon: Truck }, { name: "Office Shifting", Icon: Building2 },
    { name: "Furniture Moving", Icon: Truck }, { name: "Packing Service", Icon: Truck },
    { name: "Local Shifting", Icon: Truck }, { name: "Vehicle Shifting", Icon: Truck },
  ]},
];

function PopularServices({ onRequestService }: { onRequestService: (serviceName: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(popularCategories[0]?.id ?? null);
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20">
        <SectionHead
          eyebrow="Most booked"
          title="Popular Services"
          subtitle="Explore our most requested home and building services across Bengaluru"
        />
        <div className="mt-8 space-y-3 sm:mt-12 sm:space-y-4">
          {popularCategories.map((cat) => {
            const CatIcon = cat.Icon;
            const isOpen = openId === cat.id;
            return (
              <div
                key={cat.id}
                className={`overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 ${
                  isOpen ? "border-secondary/60 shadow-lift" : "border-border hover:border-secondary/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : cat.id)}
                  aria-expanded={isOpen}
                  aria-controls={`popular-panel-${cat.id}`}
                  className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-left sm:gap-5 sm:px-6 sm:py-5"
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors sm:h-12 sm:w-12 ${
                      isOpen ? "bg-gradient-accent text-accent-foreground" : "bg-primary/5 text-primary"
                    }`}
                  >
                    <CatIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-primary sm:text-base">{cat.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground sm:text-sm">{cat.description}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <span className="hidden rounded-full bg-secondary/15 px-2.5 py-1 text-[11px] font-bold text-secondary sm:inline">
                      Starts from ₹99
                    </span>
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full bg-primary/5 text-primary transition-transform duration-300 ${
                        isOpen ? "rotate-180 bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </span>
                  </span>
                </button>
                <div
                  id={`popular-panel-${cat.id}`}
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-border/70 bg-muted/30 px-4 py-4 sm:px-6 sm:py-5">
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {cat.subServices.map((sub) => {
                          const SubIcon = sub.Icon;
                          return (
                            <Link
                              key={sub.name}
                              to="/services/$slug"
                              params={{ slug: slugifyItem(sub.name) }}
                              aria-label={`View ${sub.name}`}
                              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-secondary hover:shadow-card"
                            >
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-gradient-accent group-hover:text-accent-foreground">
                                <SubIcon className="h-4 w-4" />
                              </span>
                              <span className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-sm font-semibold text-foreground">{sub.name}</span>
                                <span className="text-[11px] font-medium text-secondary">Starts from ₹99</span>
                              </span>
                              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── SERVICE SHORTCUTS (below hero) ───────────────── */
type ShortcutTarget =
  | { kind: "route"; slug: string }
  | { kind: "hash"; hash: string };

const serviceShortcuts: {
  title: string;
  badge?: string;
  badgeTone: "discount" | "new";
  Icon: typeof Zap;
  target: ShortcutTarget;
}[] = [
  { title: "ELECTRICIAN", badge: "₹75 OFF", badgeTone: "discount", Icon: Zap, target: { kind: "route", slug: "electrical-services" } },
  { title: "PLUMBER", badge: "₹75 OFF", badgeTone: "discount", Icon: Droplets, target: { kind: "route", slug: "plumbing-services" } },
  { title: "PAINTER", badgeTone: "discount", Icon: PaintRoller, target: { kind: "route", slug: "painting-works" } },
  { title: "DEEP\nCLEANING", badge: "₹100 OFF", badgeTone: "discount", Icon: Sparkles, target: { kind: "route", slug: "deep-home-cleaning" } },
  { title: "BATHROOM\nCLEANING", badgeTone: "discount", Icon: ShowerHead, target: { kind: "route", slug: "bathroom-cleaning" } },
  { title: "AC SERVICE", badge: "₹50 OFF", badgeTone: "discount", Icon: AirVent, target: { kind: "route", slug: "ac-installation-and-servicing" } },
  { title: "CARPENTER", badgeTone: "discount", Icon: Hammer, target: { kind: "route", slug: "carpentry-works" } },
  { title: "KITCHEN\nCLEANING", badgeTone: "discount", Icon: Utensils, target: { kind: "route", slug: "kitchen-cleaning" } },
  { title: "FRIDGE", badgeTone: "discount", Icon: Refrigerator, target: { kind: "route", slug: "refrigerator-repair" } },
  { title: "PACKERS &\nMOVERS", badgeTone: "discount", Icon: Truck, target: { kind: "hash", hash: "complete-service-grid" } },
  { title: "PEST CONTROL", badge: "NEW!", badgeTone: "new", Icon: Bug, target: { kind: "route", slug: "pest-control" } },
  { title: "MORE\nSERVICES", badgeTone: "discount", Icon: MoreHorizontal, target: { kind: "hash", hash: "complete-service-grid" } },
];

function ServiceShortcuts() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
          {serviceShortcuts.map((s) => {
            const Icon = s.Icon;
            const content = (
              <>
                <div className="relative">
                  <div className="grid h-16 w-16 place-items-center text-primary transition-transform duration-300 group-hover:-translate-y-1 sm:h-20 sm:w-20">
                    <Icon className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.5} />
                  </div>
                  {s.badge && (
                    <span
                      className={`absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-black uppercase leading-none text-white shadow-md transition-transform duration-300 group-hover:scale-110 ${
                        s.badgeTone === "new" ? "bg-secondary text-primary" : "bg-[hsl(347,85%,55%)]"
                      }`}
                    >
                      {s.badge}
                    </span>
                  )}
                </div>
                <div className="mt-3 whitespace-pre-line text-[12px] font-black uppercase leading-tight tracking-wide text-primary sm:text-[13px]">
                  {s.title}
                </div>
              </>
            );
            const className =
              "group flex flex-col items-center text-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
            if (s.target.kind === "route") {
              return (
                <Link
                  key={s.title}
                  to="/services/$slug"
                  params={{ slug: s.target.slug }}
                  className={className}
                  aria-label={s.title.replace(/\n/g, " ")}
                >
                  {content}
                </Link>
              );
            }
            return (
              <a key={s.title} href={`#${s.target.hash}`} className={className} aria-label={s.title.replace(/\n/g, " ")}>
                {content}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────── COMPLETE SERVICE GRID (expandable) ───────────────── */
const CATEGORY_BANNER_META: Record<string, { features: [string, string] }> = {
  "interior-construction-works": { features: ["Fast Service", "Expert Technicians"] },
  "electrical-services": { features: ["Quick Electrical Support", "Trained Electricians"] },
  "plumbing-services": { features: ["Leak & Pipe Solutions", "Skilled Plumbers"] },
  "appliance-services": { features: ["Cooling & AC Experts", "Fast Response"] },
  "cleaning-services": { features: ["Hygienic Cleaning", "Trusted Professionals"] },
  "maintenance-services": { features: ["Multi-Skill Team", "Regular Upkeep"] },
  "home-improvement-services": { features: ["Smooth Finish", "Quality Work"] },
  "safety-security-services": { features: ["Smart Security", "Reliable Installation"] },
  "outdoor-services": { features: ["Safe Treatment", "Certified Experts"] },
  "financial-consultancy-services": { features: ["Trusted Advisors", "Clear Guidance"] },
};

type ServiceCategoryBannerProps = {
  title: string;
  description: string;
  feature1: string;
  feature2: string;
  bengaluruLabel?: string;
  image: string;
  Icon: typeof HomeIcon;
};

function ServiceCategoryBanner({
  title,
  description,
  feature1,
  feature2,
  bengaluruLabel = "Proudly Serving Bangalore & Surrounding Areas",
  image,
}: ServiceCategoryBannerProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-white shadow-card sm:rounded-3xl">
      <div className="relative aspect-[16/10] w-full sm:aspect-[3/1]">
        {/* Right side image */}
        <img
          src={image}
          alt={`${title} in Bengaluru`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Left curved white panel */}
        <div
          className="absolute inset-y-0 left-0 w-[72%] bg-[#eaf1fb] sm:w-[58%]"
          style={{
            borderTopRightRadius: "22% 60%",
            borderBottomRightRadius: "22% 60%",
          }}
        >
          <div className="flex h-full flex-col justify-center px-3 py-2 pr-6 sm:px-8 sm:pr-16 md:px-10 md:pr-24">
            <h3 className="text-[15px] font-black uppercase leading-[1.1] tracking-tight text-primary sm:text-2xl md:text-3xl lg:text-4xl">
              {title}
            </h3>
            <p className="mt-1 line-clamp-2 max-w-[36ch] text-[11px] leading-snug text-muted-foreground sm:mt-2 sm:line-clamp-none sm:text-sm">
              {description}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm sm:px-3 sm:py-1 sm:text-xs">
                <Check className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" /> {feature1}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm sm:px-3 sm:py-1 sm:text-xs">
                <Check className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" /> {feature2}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] font-semibold text-primary sm:mt-3 sm:text-xs">
              <MapPin className="h-2.5 w-2.5 text-orange-500 sm:h-3.5 sm:w-3.5" />
              <span className="font-black tracking-wider">BENGALURU</span>
              <span className="text-muted-foreground">— {bengaluruLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteGrid({ onRequestService }: { onRequestService: (serviceName: string) => void }) {
  return <CompleteGridInner onRequestService={onRequestService} />;
}

function ServiceItemCard({
  name,
  CatIcon,
  index = 0,
  onRequestService,
  image: imageOverride,
  slug,
}: {
  name: string;
  CatIcon: typeof HomeIcon;
  index?: number;
  onRequestService?: (serviceName: string) => void;
  image?: string;
  slug?: string;
}) {
  const image = imageOverride || resolveServiceImage(name, slug);
  const shellClass = "group service-card-reveal flex h-full min-h-full w-full flex-col overflow-hidden rounded-3xl border bg-card shadow-card outline-none transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const cardContent = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={`${name} service in a Bengaluru home`}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-secondary/10 text-secondary">
            <CatIcon className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/70 to-transparent opacity-80" />
        <div className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-2xl border bg-card/95 text-primary shadow-md backdrop-blur">
          <CatIcon className="h-5 w-5" />
        </div>
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border bg-card/95 px-2.5 py-1 text-xs font-black text-primary shadow-sm backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
          4.8
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h4 className="min-h-10 text-base font-black leading-snug text-primary">{name}</h4>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Starts from</p>
            <p className="text-xl font-black leading-none text-primary">₹99</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-black text-primary">
            <Star className="h-3 w-3 fill-secondary text-secondary" /> 4.8
          </div>
        </div>
        {onRequestService ? (
          <button
            type="button"
            onClick={() => onRequestService(name)}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-accent px-4 text-sm font-black text-accent-foreground shadow-card transition duration-300 hover:shadow-lift hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Request Service <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <div className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-accent px-4 text-sm font-black text-accent-foreground shadow-card transition duration-300 group-hover:shadow-lift group-hover:brightness-105">
            Request Service <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </>
  );

  if (onRequestService) {
    return (
      <article className={shellClass} style={{ animationDelay: `${Math.min(index * 60, 420)}ms` }}>
        {cardContent}
      </article>
    );
  }

  return (
    <Link
      to="/services/$slug"
      params={{ slug: slug || slugifyItem(name) }}
      aria-label={`Request service for ${name}`}
      className={shellClass}
      style={{ animationDelay: `${Math.min(index * 60, 420)}ms` }}
    >
      {cardContent}
    </Link>
  );
}

function CleaningServicesCarousel({
  items,
  CatIcon,
  onRequestService,
}: {
  items: { id: string; name: string; image?: string; slug?: string }[];
  CatIcon: typeof HomeIcon;
  onRequestService: (serviceName: string) => void;
}) {
  return (
    <div className="cleaning-services-carousel">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={5}
        slidesPerGroup={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={items.length > 5}
        speed={600}
        keyboard={{ enabled: true }}
        allowTouchMove
        grabCursor
        watchOverflow
        breakpoints={{
          320: { slidesPerView: 1.15, spaceBetween: 14 },
          480: { slidesPerView: 1.3, spaceBetween: 16 },
          640: { slidesPerView: 2.1, spaceBetween: 18 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 22 },
          1280: { slidesPerView: 4.2, spaceBetween: 24 },
        }}
        className="!overflow-hidden !px-1 !pb-12 !pt-1 sm:!px-14"
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id} className="!flex !h-auto">
            <ServiceItemCard name={item.name} CatIcon={CatIcon} index={index} image={item.image} slug={item.slug} onRequestService={onRequestService} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function CompleteGridInner({ onRequestService }: { onRequestService: (serviceName: string) => void }) {
  const { catalog, loading } = usePublicServicesCatalog();
  return (
    <section id="complete-service-grid" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-20">
      <SectionHead
        eyebrow="Explore"
        title="Explore Our Home Services"
        subtitle="Trusted professional services across Bengaluru starting from ₹99"
      />

      {/* Category shortcut grid */}
      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
        {catalog.map((cat) => {
          const Icon = cat.icon;
          return (
            <a
              key={cat.slug}
              href={`#cat-${cat.slug}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(`cat-${cat.slug}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-transparent bg-card p-3 text-center transition-all hover:-translate-y-1 hover:border-border hover:shadow-card"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-accent text-accent-foreground shadow-sm transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-foreground sm:text-xs">
                {cat.title}
              </span>
            </a>
          );
        })}
      </div>

      <div className="mt-10 space-y-10">
        {catalog.map((cat) => {
          const CatIcon = cat.icon;
          const prebuiltBanner: Record<string, string> = {
            "interior-construction-works": interiorConstructionBanner,
            "electrical-services": electricalBanner,
            "plumbing-services": plumbingBanner,
            "appliance-services": applianceBanner,
            "cleaning-services": cleaningBanner,
            "maintenance-services": maintenanceBanner,
            "home-improvement-services": homeImprovementBanner,
            "safety-security-services": safetySecurityBanner,
          };
          const banner = prebuiltBanner[cat.slug];
          const items = cat.serviceItems;
          return (
            <div key={cat.slug} id={`cat-${cat.slug}`} className="scroll-mt-24 space-y-6">
              {/* Category header */}
              {banner ? (
                <div className="w-full overflow-hidden rounded-2xl border border-border bg-white shadow-card sm:rounded-3xl">
                  <img
                    src={banner}
                    alt={`${cat.title} Bengaluru Services`}
                    loading="lazy"
                    className="block aspect-[3/1] w-full object-cover object-center"
                  />
                </div>
              ) : (
                <ServiceCategoryBanner
                  title={cat.title}
                  description={cat.short}
                  feature1={CATEGORY_BANNER_META[cat.slug]?.features[0] ?? "Fast Service"}
                  feature2={CATEGORY_BANNER_META[cat.slug]?.features[1] ?? "Expert Team"}
                  image={cat.image || CATEGORY_IMAGES[cat.slug] || svcCatMaintenance}
                  Icon={CatIcon}
                />
              )}

              {/* Service cards grid */}
              {items.length > 0 && (
                <>
                  <CleaningServicesCarousel items={items} CatIcon={CatIcon} onRequestService={onRequestService} />
                  <div className="flex justify-center pt-2">
                    <Link
                      to="/services/$slug"
                      params={{ slug: cat.slug }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-black text-accent-foreground shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      View All {cat.title} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="rounded-2xl border bg-card px-5 py-4 text-sm font-semibold text-muted-foreground shadow-card">
            Refreshing latest backend services…
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────────────── PROCESS ───────────────────── */
function Process() {
  return (
    <section className="bg-muted">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-20">
        <SectionHead eyebrow="Process" title="How Our Service Works" subtitle="Six simple steps from your first call to job completion." />
        <div className="mobile-testimonials-swiper mt-12 -mx-6 overflow-hidden px-6 pt-4">
          <Swiper
            modules={[Autoplay]}
            loop
            speed={4500}
            slidesPerView={1.08}
            spaceBetween={16}
            allowTouchMove
            breakpoints={{
              640: { slidesPerView: 2.1, spaceBetween: 20 },
              1024: { slidesPerView: 3.1, spaceBetween: 20 },
            }}
            autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false }}
          >
            {[...steps, ...steps, ...steps].map(([title, body], i) => (
              <SwiperSlide key={`${title}-${i}`} className="pb-1">
                <div className="relative h-full rounded-2xl border border-border bg-card p-6 shadow-card">
                  <div className="inline-grid h-10 w-14 place-items-center rounded-full bg-gradient-accent text-sm font-black leading-none text-accent-foreground shadow-card">
                    {String((i % steps.length) + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── TESTIMONIALS ───────────────────── */
function TestimonialsPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:py-20">
      <SectionHead eyebrow="Customer love" title="What people are saying" subtitle="Real feedback from the homes and offices we serve." />
      <div className="mobile-testimonials-swiper mt-10 -mx-6 overflow-hidden px-6">
        <Swiper
          modules={[Autoplay]}
          loop
          speed={4500}
          slidesPerView={1.08}
          spaceBetween={16}
          allowTouchMove
          breakpoints={{
            640: { slidesPerView: 2.1, spaceBetween: 20 },
            1024: { slidesPerView: 3.1, spaceBetween: 20 },
          }}
          autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false }}
        >
          {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
            <SwiperSlide key={`${t.name}-${i}`} className="pb-1">
              <TestimonialCard testimonial={t} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="mt-8 text-center">
        <Link to="/testimonials" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-muted">
          View All Testimonials <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial: t }: { testimonial: (typeof testimonials)[number] }) {
  return (
    <figure className="relative h-full rounded-2xl border border-border bg-card p-6 shadow-card">
      <Quote className="absolute right-5 top-5 h-8 w-8 text-secondary/30" />
      <div className="flex gap-1 text-accent">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-4 text-sm text-foreground">"{t.quote}"</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-hero text-sm font-black text-primary-foreground">
          {t.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{t.name}</div>
          <div className="truncate text-xs text-muted-foreground">{t.service} · {t.location}</div>
        </div>
      </figcaption>
    </figure>
  );
}

/* ───────────────────── FINAL CTA ───────────────────── */
function FinalCTA({ selectedService }: { selectedService: string }) {
  return (
    <section id="enquiry" className="mx-auto max-w-7xl px-6 py-10 sm:py-20">
      <div className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-lift sm:p-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Get in touch</div>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Need Any Home or Building Service?</h2>
            <p className="mt-3 max-w-lg text-primary-foreground/80">
              Call Smart Solutions Groups today for quick, trusted and professional service.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`tel:${SITE.contact.primary.phone}`} className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-card transition-transform hover:scale-105">
                <Phone className="h-4 w-4" /> Call Now
              </a>
              <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-sm font-bold text-whatsapp-foreground shadow-card transition-transform hover:scale-105">
                <MessageCircle className="h-4 w-4" /> WhatsApp Now
              </a>
            </div>
          </div>

          <QuickEnquiry selectedService={selectedService} />
        </div>
      </div>
    </section>
  );
}

function QuickEnquiry({ selectedService }: { selectedService: string }) {
  const [sent, setSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [service, setService] = useState(selectedService);
  const [agreement, setAgreement] = useState<EnquiryAgreement | null>(null);
  const { customer, ready } = useCustomerAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const { catalog } = usePublicServicesCatalog();
  useEffect(() => {
    if (customer) setPhone(customer.phone);
  }, [customer]);
  useEffect(() => {
    setService(selectedService);
  }, [selectedService]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!customer) { setAuthOpen(true); return; }
        if (!agreement) return;
        const fd = new FormData(e.currentTarget);
        const rawPhone = String(fd.get("phone") || phone || customer.phone || "").trim();
        const cleanPhone = rawPhone.replace(/[\s-]/g, "");
        if (!cleanPhone) {
          setPhoneError("Phone number is required.");
          return;
        }
        if (!/^(?:\+?91[-\s]?)?[6-9]\d{9}$/.test(cleanPhone)) {
          setPhoneError("Enter a valid 10-digit Indian mobile number.");
          return;
        }
        setPhoneError("");
        void import("@/lib/enquiries-store").then(({ addEnquiry }) =>
          addEnquiry({
            name: String(fd.get("name") || customer.name),
            phone: cleanPhone,
            email: customer.email,
            category: "",
            service: String(fd.get("service") || ""),
            location: "",
            preferredDate: "",
            message: "",
            source: "Home Page",
            agreement,
            customerId: customer.id,
          }),
        );
        if (customer && !customer.phone && cleanPhone) {
          updateCurrentCustomerPhone(cleanPhone);
        }
        setSent(true);
        (e.currentTarget as HTMLFormElement).reset();
        setPhone(customer?.phone || cleanPhone);
        setService("");
        setAgreement(null);
      }}
      className="rounded-2xl bg-card p-6 text-foreground shadow-lift"
    >
      <div className="text-sm font-bold text-primary">Submit Enquiry</div>
      <p className="mt-1 text-xs text-muted-foreground">
        {customer ? `Logged in as ${customer.name}. We'll call you back within the hour.` : "Login to submit — we'll call you back within the hour."}
      </p>
      <div className="mt-4 flex w-full flex-col gap-3">
        <div className="flex w-full flex-col gap-1">
          <label htmlFor="qe-name" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Name</label>
          <input id="qe-name" name="name" required maxLength={100} type="text" placeholder="Your name" defaultValue={customer?.name ?? ""} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary-glow focus:ring-2 focus:ring-primary-glow/20" />
        </div>
        <div className="flex w-full flex-col gap-1">
          <label htmlFor="qe-phone" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Phone Number <span className="text-destructive font-bold">*</span>
          </label>
          <input
            id="qe-phone"
            name="phone"
            required
            maxLength={15}
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneError) setPhoneError("");
            }}
            readOnly={Boolean(customer && customer.phone)}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary-glow focus:ring-2 focus:ring-primary-glow/20"
          />
          {phoneError && <p className="text-xs font-semibold text-destructive">{phoneError}</p>}
        </div>
        <div className="flex w-full flex-col gap-1">
          <label htmlFor="qe-service" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Service Needed</label>
          <select
          id="qe-service"
          name="service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary-glow focus:ring-2 focus:ring-primary-glow/20"
        >
          <option value="">Service needed</option>
          {catalog.map((cat) => (
            <optgroup key={cat.slug} label={cat.title}>
              {cat.serviceItems.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </optgroup>
          ))}
          </select>
        </div>
        {customer ? (
          <>
            <AgreementConsent phone={phone} onChange={setAgreement} verifiedPhone={customer.phone} />
            <button type="submit" disabled={!agreement} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
              <Send className="h-4 w-4" /> Submit Enquiry
            </button>
          </>
        ) : (
          <>
            <AgreementConsent phone={phone} onChange={setAgreement} />
            <button type="button" onClick={() => setAuthOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:scale-105">
              Login to Submit Enquiry
            </button>
          </>
        )}
        {sent && <div className="rounded-lg bg-secondary/20 px-3 py-2 text-xs text-foreground">Thanks! We'll reach out shortly.</div>}
      </div>
      {ready && <CustomerAuthDialog open={authOpen} onClose={() => setAuthOpen(false)} initialPhone={phone} />}
    </form>
  );
}

/* ───────────────────── shared ───────────────────── */
function SectionHead({ eyebrow, title, subtitle, align = "center" }: { eyebrow?: string; title: string; subtitle?: string; align?: "center" | "left" }) {
  const a = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${a}`}>
      {eyebrow && <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{eyebrow}</div>}
      <h2 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
