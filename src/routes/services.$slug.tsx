import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Phone, MessageCircle, Send,
  Wrench, Wallet, Clock, ShieldCheck, Home, Building, Castle, Briefcase, Building2, Star,
  Hammer, CookingPot, DoorOpen, Drill, PaintRoller, Grid3X3, Fence, PanelsTopLeft, Umbrella,
  Lightbulb, type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { findService, findServiceItem, slugifyItem } from "@/data/services";
import { findServiceAlias } from "@/data/service-aliases";
import { SITE } from "@/lib/site";
import { AgreementConsent } from "@/components/site/AgreementConsent";
import { useCustomerAuth, updateCurrentCustomerPhone } from "@/lib/customer-auth";
import { CustomerAuthDialog } from "@/components/site/CustomerAuthDialog";
import { SERVICE_ITEM_IMAGES, resolveServiceImage } from "@/data/service-item-images";
import { ServiceHero } from "@/components/site/ServiceHero";
import { findServiceItemInCatalog, usePublicServicesCatalog, type PublicServiceCategory, type PublicServiceItem } from "@/lib/public-services";
import svcInterior from "@/assets/svc-interior.jpg";
import svcElectrical from "@/assets/svc-electrical.jpg";
import svcPlumbing from "@/assets/svc-plumbing.jpg";
import svcAppliance from "@/assets/svc-appliance.jpg";
import svcCleaning from "@/assets/svc-cleaning.jpg";
import svcMaintenance from "@/assets/svc-maintenance-team.jpg";
import svcImprovement from "@/assets/svc-improvement.jpg";
import svcSecurity from "@/assets/svc-security.jpg";
import svcOutdoor from "@/assets/svc-outdoor.jpg";
import svcFinancial from "@/assets/svc-financial.jpg";

const CATEGORY_HERO: Record<string, { image: string; accent: string; badges: string[] }> = {
  "interior-construction-works": { image: svcInterior, accent: "#E7B83A", badges: ["End-to-End Execution", "Skilled Craftsmen"] },
  "electrical-services": { image: svcElectrical, accent: "#F97316", badges: ["Licensed Electricians", "Safety First"] },
  "plumbing-services": { image: svcPlumbing, accent: "#0EA5E9", badges: ["24/7 Response", "Leak-Free Guarantee"] },
  "appliance-services": { image: svcAppliance, accent: "#7C3AED", badges: ["All Brands", "Genuine Spares"] },
  "cleaning-services": { image: svcCleaning, accent: "#06B6D4", badges: ["Eco-Friendly", "Trained Crew"] },
  "maintenance-services": { image: svcMaintenance, accent: "#E7B83A", badges: ["Multi-Skill Team", "Regular Upkeep"] },
  "home-improvement-services": { image: svcImprovement, accent: "#E7B83A", badges: ["Small Fixes", "Quality Finish"] },
  "safety-security-services": { image: svcSecurity, accent: "#061B55", badges: ["CCTV Certified", "Verified Guards"] },
  "outdoor-services": { image: svcOutdoor, accent: "#16A34A", badges: ["Landscape Experts", "Weekly Care"] },
  "financial-consultancy-services": { image: svcFinancial, accent: "#0B2E59", badges: ["Trusted Advisors", "Transparent Terms"] },
};

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = findService(params.slug);
    if (service) {
      return {
        kind: "category" as const,
        slug: service.slug,
        title: service.title,
        short: service.short,
      };
    }
    const match = findServiceItem(params.slug);
    if (match) {
      return {
        kind: "item" as const,
        item: match.item,
        categorySlug: match.category.slug,
        categoryTitle: match.category.title,
        categoryShort: match.category.short,
      };
    }
    return {
      kind: "unknown" as const,
      slug: params.slug,
      title: params.slug.replace(/-/g, " "),
      short: "Professional home and building service by Smart Solutions Groups.",
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? (() => {
          const title =
            loaderData.kind === "category" || loaderData.kind === "unknown" ? loaderData.title : loaderData.item;
          const desc =
            loaderData.kind === "category"
              ? loaderData.short
              : loaderData.kind === "unknown"
                ? loaderData.short
              : `${loaderData.item} by Smart Solutions Groups — ${loaderData.categoryShort}`;
          return [
            { title: `${title} — Smart Solutions Groups` },
            { name: "description", content: desc },
            { property: "og:title", content: `${title} — Smart Solutions Groups` },
            { property: "og:description", content: desc },
          ];
        })()
      : [],
  }),
  component: RouteComponent,
  notFoundComponent: () => (
    <SiteLayout>
      <PageHeader title="Service not found" subtitle="The service you're looking for doesn't exist." />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link to="/services" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to all services
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <PageHeader title="Something went wrong" subtitle={error.message} />
    </SiteLayout>
  ),
});

const whyChoose = [
  { icon: Wrench, title: "Skilled Technicians", desc: "Trained, background-verified specialists for every job." },
  { icon: Wallet, title: "Affordable Pricing", desc: "Honest, upfront quotes — no hidden charges." },
  { icon: Clock, title: "Quick Response", desc: "Same-day slots and priority visits for AMC customers." },
  { icon: ShieldCheck, title: "Trusted Service Support", desc: "Service guarantee and dedicated relationship managers." },
];

const suitableFor = [
  { icon: Home, label: "Homes" },
  { icon: Building, label: "Apartments" },
  { icon: Castle, label: "Villas" },
  { icon: Briefcase, label: "Offices" },
  { icon: Building2, label: "Commercial Buildings" },
];

const servicesData: { name: string; icon: LucideIcon }[] = [
  { name: "POP False Ceiling", icon: Hammer },
  { name: "Modular Kitchen Installation", icon: CookingPot },
  { name: "Wardrobe Installation", icon: DoorOpen },
  { name: "Carpentry Works", icon: Drill },
  { name: "Painting Works", icon: PaintRoller },
  { name: "Granite & Tiles Fixing", icon: Grid3X3 },
  { name: "SS Railing Works", icon: Fence },
  { name: "Glass Partition Works", icon: PanelsTopLeft },
  { name: "Waterproofing Works", icon: Umbrella },
  { name: "False Ceiling Repairs", icon: Lightbulb },
];

const serviceIconByName = servicesData.reduce<Record<string, LucideIcon>>((acc, service) => {
  acc[service.name] = service.icon;
  return acc;
}, {});

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^(?:\+?91[-\s]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  service: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2, "Enter your location").max(150),
  message: z.string().trim().max(1000).optional(),
});

function EnquiryForm({ categoryTitle }: { categoryTitle: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phone, setPhone] = useState("");
  const [agreement, setAgreement] = useState<import("@/lib/enquiries-store").EnquiryAgreement | null>(null);
  const { customer } = useCustomerAuth();
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => { if (customer) setPhone(customer.phone); }, [customer]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) { setAuthOpen(true); return; }
    if (!agreement) {
      toast.error("Please verify OTP and accept the terms before submitting.");
      return;
    }
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.phone = String(data.phone || phone || customer?.phone || "").trim().replace(/[\s-]/g, "");
    const parsed = enquirySchema.safeParse(data);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[String(issue.path[0])] = issue.message;
      setErrors(fe);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const v = parsed.data;
    void import("@/lib/enquiries-store").then(({ addEnquiry }) =>
      addEnquiry({
        name: v.name,
        phone: v.phone,
        email: v.email,
        category: categoryTitle,
        service: v.service,
        location: v.location,
        preferredDate: "",
        message: v.message ?? "",
        source: "Service Page",
        agreement,
        customerId: customer.id,
      }),
    );
    if (customer && !customer.phone && v.phone) {
      updateCurrentCustomerPhone(v.phone);
    }
    setTimeout(() => {
      setSubmitting(false);
      form.reset();
      setPhone(customer?.phone || v.phone);
      setAgreement(null);
      toast.success("Enquiry submitted — our team will call you shortly.");
    }, 600);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" maxLength={100} required defaultValue={customer?.name ?? ""} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="phone">
          Phone <span className="text-destructive font-bold">*</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          maxLength={15}
          required
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
          }}
          readOnly={Boolean(customer && customer.phone)}
        />
        {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" maxLength={255} required defaultValue={customer?.email ?? ""} readOnly={Boolean(customer)} />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="service">Service Required</Label>
        <Input id="service" name="service" defaultValue={categoryTitle} readOnly className="bg-muted/50" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" maxLength={150} required />
        {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location}</p>}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={4} maxLength={1000} />
      </div>
      {customer && <AgreementConsent phone={phone} onChange={setAgreement} verifiedPhone={customer.phone} />}
      <div className="sm:col-span-2">
        {customer ? (
          <>
            <Button type="submit" size="lg" disabled={submitting || !agreement} className="w-full font-bold">
              <Send className="mr-2 h-4 w-4" /> {submitting ? "Sending..." : "Submit Enquiry"}
            </Button>
            {!agreement && <p className="mt-2 text-center text-[11px] text-muted-foreground">Please read and accept the Customer Service Agreement &amp; Terms and Conditions before submitting your enquiry.</p>}
          </>
        ) : (
          <Button type="button" onClick={() => setAuthOpen(true)} size="lg" className="w-full font-bold">
            <Send className="mr-2 h-4 w-4" /> Login to Submit Enquiry
          </Button>
        )}
      </div>
      <CustomerAuthDialog open={authOpen} onClose={() => setAuthOpen(false)} initialPhone={phone} />
    </form>
  );
}

function ServiceCard({ item, categoryIcon: CategoryIcon, index, image: imageOverride, slug, categorySlug }: { item: string; categoryIcon: LucideIcon; index: number; image?: string; slug?: string; categorySlug?: string }) {
  const image = imageOverride || resolveServiceImage(item, categorySlug);
  const ItemIcon = serviceIconByName[item] ?? CategoryIcon;

  return (
    <Link
      to="/services/$slug"
      params={{ slug: slug || slugifyItem(item) }}
      aria-label={`Request service for ${item}`}
      className="group service-card-reveal flex min-h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-card outline-none transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={`${item} service in a Bengaluru home`}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-secondary/10 text-secondary">
            <ItemIcon className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/70 to-transparent opacity-80" />
        <div className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-2xl border bg-card/95 text-primary shadow-md backdrop-blur">
          <ItemIcon className="h-5 w-5" />
        </div>
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border bg-card/95 px-2.5 py-1 text-xs font-black text-primary shadow-sm backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
          4.8
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="min-h-10 text-base font-black leading-snug text-primary">{item}</h3>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Starts from</p>
            <p className="text-xl font-black leading-none text-primary">₹99</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-black text-primary">
            <Star className="h-3 w-3 fill-secondary text-secondary" /> 4.8
          </div>
        </div>
        <div className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-accent px-4 text-sm font-black text-accent-foreground shadow-card transition duration-300 group-hover:shadow-lift group-hover:brightness-105">
          Request Service <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function RouteComponent() {
  const data = Route.useLoaderData();
  const { catalog, loading } = usePublicServicesCatalog();
  const requestedSlug = data.kind === "item" ? slugifyItem(data.item) : data.slug;
  const service = catalog.find((category) => category.slug === requestedSlug);
  if (service) return <ServiceDetail service={service} catalog={catalog} />;
  const match = findServiceItemInCatalog(catalog, requestedSlug);
  if (match) return <ServiceItemDetail item={match.item} category={match.category} />;

  // Fallback: synthesize a detail page from the alias registry so every
  // service linked from the site resolves to a working page.
  const alias = findServiceAlias(requestedSlug);
  if (alias) {
    const parent =
      catalog.find((c) => c.slug === alias.categorySlug) ?? catalog[0];
    if (parent) {
      const synthesized: PublicServiceItem = {
        id: `alias:${alias.slug}`,
        number: 0,
        name: alias.name,
        slug: alias.slug,
        categoryId: parent.slug,
        shortDesc:
          alias.description ??
          `${alias.name} for homes, apartments, villas, offices and buildings across Bengaluru.`,
        longDesc:
          alias.description ??
          `Professional ${alias.name.toLowerCase()} service delivered by Smart Solutions Groups' trained technicians with quality assurance.`,
        image: "",
        icon: parent.icon,
        included: "On-site visit\nInspection\nProfessional execution\nTesting\nClean-up\nService support",
        suitableFor: "Homes\nApartments\nVillas\nOffices\nCommercial buildings",
        order: 999,
        featured: false,
        popular: false,
        active: true,
        seoTitle: `${alias.name} — Smart Solutions Groups`,
        seoDesc: `Book ${alias.name} with Smart Solutions Groups in Bengaluru.`,
      };
      return <ServiceItemDetail item={synthesized} category={parent} />;
    }
  }

  if (loading) {
    return (
      <SiteLayout>
        <PageHeader title="Loading service" subtitle="Fetching the latest service details." />
      </SiteLayout>
    );
  }
  return (
    <SiteLayout>
      <PageHeader title="Service not found" subtitle="We couldn't find that service. Try one of the popular options below." />
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <Link to="/services" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to all services
        </Link>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Popular categories</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.slice(0, 9).map((c) => (
              <li key={c.slug}>
                <Link to="/services/$slug" params={{ slug: c.slug }} className="text-primary hover:underline">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SiteLayout>
  );
}

function ServiceDetail({ service, catalog }: { service: PublicServiceCategory; catalog: PublicServiceCategory[] }) {
  const Icon = service.icon;
  const related = catalog.filter((s) => s.slug !== service.slug).slice(0, 4);
  const hero = CATEGORY_HERO[service.slug] ?? {
    image: svcMaintenance,
    accent: "#E7B83A",
    badges: ["Trusted Team", "On-Time Service"],
  };

  return (
    <SiteLayout>
      <ServiceHero
        title={service.title}
        subtitle={service.short}
        featureBadges={hero.badges}
        locationText="Proudly Serving Bangalore & Surrounding Areas"
        image={hero.image}
        icon={Icon}
        accentColor={hero.accent}
      />

      {/* Hero CTAs */}
      <div className="mx-auto mt-6 flex max-w-7xl flex-wrap gap-3 px-4 sm:px-6">
        <Button asChild size="lg" className="bg-[#061B55] font-bold text-white hover:bg-[#061B55]/90">
          <a href="#enquiry"><Send className="mr-2 h-4 w-4" /> Book a Service</a>
        </Button>
        <Button asChild size="lg" className="bg-gradient-accent font-bold text-accent-foreground hover:opacity-90">
          <a href={`tel:${SITE.contact.primary.phone}`}><Phone className="mr-2 h-4 w-4" /> Call Now</a>
        </Button>
        <Button asChild size="lg" className="bg-whatsapp font-bold text-whatsapp-foreground hover:opacity-90">
          <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
          </a>
        </Button>
      </div>

      {/* Overview */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-lift">
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-black text-primary">About {service.title}</h2>
        <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
          {service.short} Our team handles every job end-to-end — from inspection and material to execution and quality checks — so you get reliable results without juggling multiple vendors.
        </p>
      </section>

      {/* Most booked service cards */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Most Booked</div>
            <h2 className="mt-2 text-3xl font-black text-primary sm:text-4xl">Most Booked Services</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Professional home services across Bengaluru starting from ₹99
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {service.serviceItems.map((item, index: number) => (
              <ServiceCard key={item.id} item={item.name} categoryIcon={Icon} index={index} image={item.image} slug={item.slug} categorySlug={service.slug} />
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Why choose us</div>
          <h2 className="mt-2 text-3xl font-black text-primary">Trusted for {service.title}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.map(({ icon: I, title, desc }) => (
            <div key={title} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><I className="h-6 w-6" /></div>
              <h3 className="mt-4 text-lg font-bold text-primary">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Suitable for */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Suitable for</div>
            <h2 className="mt-2 text-3xl font-black text-primary">Built for every property type</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {suitableFor.map(({ icon: I, label }) => (
              <div key={label} className="rounded-2xl border bg-card p-5 text-center shadow-card transition hover:-translate-y-1">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 text-secondary"><I className="h-7 w-7" /></div>
                <div className="mt-3 text-sm font-bold text-primary">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form + related */}
      <section id="enquiry" className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border bg-card p-6 shadow-lift sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Enquiry form</div>
          <h2 className="mt-2 text-2xl font-black text-primary sm:text-3xl">Book {service.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Share a few details and our team will call you back with a quote.</p>
          <div className="mt-6">
            <EnquiryForm categoryTitle={service.title} />
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-lift">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Talk to us</div>
            <div className="mt-4 flex flex-col gap-2">
              <a href={`tel:${SITE.contact.primary.phone}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-4 py-2.5 text-sm font-bold text-accent-foreground">
                <Phone className="h-4 w-4" /> Call Now
              </a>
              <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-sm font-bold text-whatsapp-foreground">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="text-sm font-bold text-primary">Related categories</div>
            <ul className="mt-3 space-y-2 text-sm">
              {related.map((r) => (
                <li key={r.slug} className="flex items-center justify-between gap-2">
                  <Link to="/services/$slug" params={{ slug: r.slug }} className="text-primary hover:underline">
                    {r.title}
                  </Link>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Need {service.title.toLowerCase()}? Contact Smart Solutions Groups today.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-accent font-bold text-accent-foreground hover:opacity-90">
              <a href={`tel:${SITE.contact.primary.phone}`}><Phone className="mr-2 h-4 w-4" /> Call Now</a>
            </Button>
            <Button asChild size="lg" className="bg-whatsapp font-bold text-whatsapp-foreground hover:opacity-90">
              <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Now
              </a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

const includedSteps = [
  "Site inspection",
  "Requirement understanding",
  "Material/work discussion",
  "Professional execution",
  "Quality checking",
  "Final customer confirmation",
  "Future support if required",
];

function ServiceItemDetail({ item, category }: { item: PublicServiceItem; category: PublicServiceCategory }) {
  const Icon = category.icon;
  const related = category.serviceItems.filter((i) => i.slug !== item.slug).slice(0, 6);

  return (
    <SiteLayout>
      <PageHeader eyebrow={category.title} title={item.name} subtitle={item.shortDesc || `${item.name} by Smart Solutions Groups — professional, affordable and quick.`} />

      {/* Hero CTAs */}
      <div className="bg-gradient-hero">
        <div className="mx-auto -mt-6 flex max-w-7xl flex-wrap gap-3 px-6 pb-12">
          <Button asChild size="lg" variant="secondary" className="font-bold">
            <a href="#enquiry"><Send className="mr-2 h-4 w-4" /> Book Now</a>
          </Button>
          <Button asChild size="lg" className="bg-gradient-accent font-bold text-accent-foreground hover:opacity-90">
            <a href={`tel:${SITE.contact.primary.phone}`}><Phone className="mr-2 h-4 w-4" /> Call Now</a>
          </Button>
          <Button asChild size="lg" className="bg-whatsapp font-bold text-whatsapp-foreground hover:opacity-90">
            <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
            </a>
          </Button>
        </div>
      </div>

      {/* Overview */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-lift">
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-black text-primary">About {item.name}</h2>
        <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
          {item.longDesc || `${item.name} is part of our ${category.title.toLowerCase()} offering.`} Our trained team handles the job
          end-to-end — inspection, material, execution and quality checks — so you get reliable, long-lasting
          results without coordinating multiple vendors.
        </p>
        <div className="mt-6">
          <Link to="/services/$slug" params={{ slug: category.slug }} className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to {category.title}
          </Link>
        </div>
      </section>

      {/* What is included */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">What's included</div>
            <h2 className="mt-2 text-3xl font-black text-primary">Every {item.name} booking includes</h2>
            <p className="mt-3 text-muted-foreground">
              A standard process designed for transparency, quality and complete peace of mind.
            </p>
          </div>
          <ul className="grid gap-3 rounded-2xl border bg-card p-6 shadow-card">
            {includedSteps.map((step) => (
              <li key={step} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-secondary" />
                <span className="text-sm text-primary">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Suitable for */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Suitable for</div>
          <h2 className="mt-2 text-3xl font-black text-primary">Built for every property type</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {suitableFor.map(({ icon: I, label }) => (
            <div key={label} className="rounded-2xl border bg-card p-5 text-center shadow-card transition hover:-translate-y-1">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 text-secondary"><I className="h-7 w-7" /></div>
              <div className="mt-3 text-sm font-bold text-primary">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Why choose us</div>
            <h2 className="mt-2 text-3xl font-black text-primary">Trusted for {item.name}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map(({ icon: I, title, desc }) => (
              <div key={title} className="rounded-2xl border bg-card p-6 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><I className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-bold text-primary">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form + sidebar */}
      <section id="enquiry" className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border bg-card p-6 shadow-lift sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Enquiry form</div>
          <h2 className="mt-2 text-2xl font-black text-primary sm:text-3xl">Book {item.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Share a few details and our team will call you back with a quote.</p>
          <div className="mt-6">
            <EnquiryForm categoryTitle={item.name} />
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-lift">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Talk to us</div>
            <div className="mt-4 flex flex-col gap-2">
              <a href={`tel:${SITE.contact.primary.phone}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-4 py-2.5 text-sm font-bold text-accent-foreground">
                <Phone className="h-4 w-4" /> Call Now
              </a>
              <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-4 py-2.5 text-sm font-bold text-whatsapp-foreground">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
          {related.length > 0 && (
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="text-sm font-bold text-primary">More in {category.title}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {related.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2">
                    <Link to="/services/$slug" params={{ slug: r.slug || slugifyItem(r.name) }} className="text-primary hover:underline">
                      {r.name}
                    </Link>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Need this service? Call Smart Solutions Groups today.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-accent font-bold text-accent-foreground hover:opacity-90">
              <a href={`tel:${SITE.contact.primary.phone}`}>
                <Phone className="mr-2 h-4 w-4" /> Call Now
              </a>
            </Button>
            <Button asChild size="lg" className="bg-whatsapp font-bold text-whatsapp-foreground hover:opacity-90">
              <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Now
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <a href="#enquiry"><Send className="mr-2 h-4 w-4" /> Submit Enquiry</a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
