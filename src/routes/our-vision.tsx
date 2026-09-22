import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Target, Eye, Quote, ArrowRight, PhoneCall } from "lucide-react";
import { ICONS, sortActive, useVision } from "@/lib/content-store";

export const Route = createFileRoute("/our-vision")({
  head: () => ({
    meta: [
      { title: "Our Vision — Smart Solutions Groups" },
      { name: "description", content: "Building India's most trusted single-window service for homes, apartments, villas, offices and buildings." },
      { property: "og:title", content: "Our Vision — Smart Solutions Groups" },
      { property: "og:description", content: "A trusted, simple, premium service experience for every property." },
    ],
  }),
  component: Vision,
});

function Vision() {
  const data = useVision();
  if (data.status !== "active") {
    return (
      <SiteLayout>
        <PageHeader eyebrow="Our Vision" title="This page is currently unavailable." subtitle="Please check back later." />
      </SiteLayout>
    );
  }
  return (
    <SiteLayout>
      <PageHeader
        eyebrow={data.heroEyebrow}
        title={data.heroTitle}
        subtitle={data.heroSubtitle}
      />

      {/* Vision statement */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border bg-card p-8 shadow-lift sm:p-12">
          <Quote className="absolute -right-4 -top-4 h-32 w-32 text-secondary/10" />
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground"><Eye className="h-6 w-6" /></div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{data.visionEyebrow}</div>
          </div>
          {data.visionTitle ? <h2 className="mt-4 text-2xl font-black text-primary sm:text-3xl">{data.visionTitle}</h2> : null}
          <p className="mt-6 text-xl font-semibold leading-relaxed text-primary sm:text-2xl">{data.visionStatement}</p>
          <p className="mt-4 text-muted-foreground">{data.visionBody}</p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border bg-card p-8 shadow-card sm:p-12">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Target className="h-6 w-6" /></div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{data.missionEyebrow}</div>
            </div>
            <h2 className="mt-4 text-2xl font-black text-primary sm:text-3xl">{data.missionTitle}</h2>
            <p className="mt-4 text-muted-foreground">{data.missionStatement}</p>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{data.valuesEyebrow}</div>
          <h2 className="mt-2 text-3xl font-black text-primary sm:text-4xl">{data.valuesHeading}</h2>
          {data.valuesSubtitle ? <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{data.valuesSubtitle}</p> : null}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortActive(data.values).map((v) => {
            const Icon = ICONS[v.icon];
            return (
              <div key={v.id} className="group rounded-2xl border bg-card p-7 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-black text-primary">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">{data.ctaHeading}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">{data.ctaBody}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <Link to="/services">{data.ctaPrimaryText} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent font-bold text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact-us"><PhoneCall className="mr-2 h-4 w-4" />{data.ctaSecondaryText}</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
