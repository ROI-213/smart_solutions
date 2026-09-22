import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PhoneCall, MessageCircle, Send, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { slugifyItem } from "@/data/services";
import { SITE } from "@/lib/site";
import { SERVICE_ITEM_IMAGES, resolveServiceImage } from "@/data/service-item-images";
import { usePublicServicesCatalog } from "@/lib/public-services";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — Smart Solutions Groups" },
      { name: "description", content: "Explore our full catalogue: interior, electrical, plumbing, cleaning, maintenance, security, outdoor and financial consultancy." },
      { property: "og:title", content: "Our Services — Smart Solutions Groups" },
      { property: "og:description", content: "All home and building services under one roof." },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  const [active, setActive] = useState<string>("all");
  const { catalog, loading } = usePublicServicesCatalog();
  const filters = useMemo(
    () => [{ id: "all", label: "All" }, ...catalog.map((cat) => ({ id: cat.slug, label: cat.title }))],
    [catalog],
  );
  const visible = useMemo(
    () => (active === "all" ? catalog : catalog.filter((s) => s.slug === active)),
    [active, catalog]
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Our Services"
        title="Complete home, building, apartment, villa and office services under one roof."
        subtitle="Our services are available for homes, apartments, villas, offices, shops, schools, hospitals and commercial buildings. Browse by category and book in one click."
      />
      <div className="bg-gradient-hero">
        <div className="mx-auto -mt-6 max-w-7xl px-6 pb-12">
          <Button asChild size="lg" variant="secondary" className="font-bold">
            <Link to="/contact-us" hash="enquiry">Book a Service</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <section className="border-b bg-background/95">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const isActive = active === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActive(f.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-card"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl space-y-16 px-6 py-16">
        {visible.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.slug} id={cat.slug} className="scroll-mt-40">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-black text-primary sm:text-3xl">{cat.title}</h2>
                  </div>
                  <p className="mt-3 max-w-2xl text-muted-foreground">{cat.short}</p>
                </div>
                <Link
                  to="/services/$slug"
                  params={{ slug: cat.slug }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  View category page <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cat.serviceItems.map((service, index) => {
                  const image = service.image || resolveServiceImage(service.name, cat.slug);
                  return (
                    <Link
                      key={service.id}
                      to="/services/$slug"
                      params={{ slug: service.slug || slugifyItem(service.name) }}
                      aria-label={`Request service for ${service.name}`}
                      className="group service-card-reveal flex min-h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-card outline-none transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {image ? (
                          <img
                            src={image}
                            alt={`${service.name} service in a Bengaluru home`}
                            loading="lazy"
                            width={1024}
                            height={768}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-secondary/10 text-secondary">
                            <Icon className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/70 to-transparent opacity-80" />
                        <div className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-2xl border bg-card/95 text-primary shadow-md backdrop-blur">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border bg-card/95 px-2.5 py-1 text-xs font-black text-primary shadow-sm backdrop-blur">
                          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                          4.8
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <h3 className="min-h-10 text-base font-black leading-snug text-primary">{service.name}</h3>
                        {service.shortDesc && (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{service.shortDesc}</p>
                        )}
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
                })}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="rounded-2xl border bg-card px-5 py-4 text-sm font-semibold text-muted-foreground shadow-card">
            Refreshing latest backend services…
          </div>
        )}
      </section>

      {/* Enquiry CTA */}
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Need Help Choosing the Right Service?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Contact Smart Solutions Groups and our team will guide you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <a href={`tel:${SITE.contact.primary.phone}`}>
                <PhoneCall className="mr-2 h-4 w-4" /> Call Now
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-[hsl(var(--whatsapp,142_70%_45%))] font-bold text-white hover:opacity-90"
            >
              <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Now
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent font-bold text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/contact-us" hash="enquiry">
                <Send className="mr-2 h-4 w-4" /> Submit Enquiry
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
