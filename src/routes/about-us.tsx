import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, PhoneCall } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ICONS, sortActive, useAbout } from "@/lib/content-store";

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { title: "About Us — Smart Solutions Groups" },
      { name: "description", content: "Smart Solutions Groups is a single-window provider of home, apartment, villa, office and building services." },
      { property: "og:title", content: "About Smart Solutions Groups" },
      { property: "og:description", content: "Single-window provider for all home and building services." },
    ],
  }),
  component: AboutUs,
});

function AboutUs() {
  const data = useAbout();
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  useEffect(() => {
    if (!statsRef.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setStatsVisible(true), { threshold: 0.3 });
    io.observe(statsRef.current);
    return () => io.disconnect();
  }, []);

  if (data.status !== "active") {
    return (
      <SiteLayout>
        <PageHeader eyebrow="About Us" title="This page is currently unavailable." subtitle="Please check back later." />
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
      <div className="bg-gradient-hero">
        <div className="mx-auto -mt-6 max-w-7xl px-6 pb-12">
          <Button asChild size="lg" variant="secondary" className="font-bold">
            <Link to={data.ctaButtonLink as "/contact-us"}>{data.ctaButtonText}</Link>
          </Button>
        </div>
      </div>

      {/* Section 1: Company Introduction */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Who we are</div>
          <h2 className="text-3xl font-black text-primary sm:text-4xl">{data.introHeading}</h2>
          <p className="text-muted-foreground">{data.introBody1}</p>
          <p className="text-muted-foreground">{data.introBody2}</p>
          <ul className="grid gap-3 pt-2 sm:grid-cols-2">
            {data.introBullets.map((t) => (
              <li key={t} className="flex gap-2 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-secondary" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {sortActive(data.whoWeServe).slice(0, 4).map((b) => {
            const Icon = ICONS[b.icon];
            return (
              <div key={b.id} className="group rounded-3xl border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                <Icon className="h-10 w-10 text-secondary" />
                <div className="mt-4 text-lg font-bold text-primary">{b.title}</div>
                <div className="text-sm text-muted-foreground">{b.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: What We Do */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{data.whatWeDoEyebrow}</div>
            <h2 className="mt-2 text-3xl font-black text-primary sm:text-4xl">{data.whatWeDoHeading}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sortActive(data.whatWeDo).map((b) => {
              const Icon = ICONS[b.icon];
              return (
                <div key={b.id} className="rounded-2xl border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div>
                  <h3 className="mt-4 text-base font-bold text-primary">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Who We Serve */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{data.whoWeServeEyebrow}</div>
          <h2 className="mt-2 text-3xl font-black text-primary sm:text-4xl">{data.whoWeServeHeading}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sortActive(data.whoWeServe).map((b) => {
            const Icon = ICONS[b.icon];
            return (
              <div key={b.id} className="rounded-2xl border bg-card p-5 text-center shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 text-secondary"><Icon className="h-7 w-7" /></div>
                <h3 className="mt-4 text-base font-bold text-primary">{b.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Stats */}
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{data.strengthsEyebrow}</div>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">{data.strengthsHeading}</h2>
          </div>
          {/* Mobile: continuous sliding marquee */}
          <div ref={statsRef} className="overflow-hidden sm:hidden">
            <div className="flex w-max animate-marquee-x [will-change:transform]">
              {[...sortActive(data.strengths), ...sortActive(data.strengths)].map((s, idx) => {
                const Icon = ICONS[s.icon];
                return (
                  <div key={`${s.id}-${idx}`} className="mx-2 w-[220px] shrink-0 rounded-2xl border bg-card p-5 text-center shadow-card">
                    <Icon className="mx-auto h-7 w-7 text-secondary" />
                    <div className="mt-2 text-3xl font-black text-primary" style={{ opacity: statsVisible ? 1 : 0, transition: "opacity .6s" }}>{s.value}</div>
                    <div className="mt-2 text-sm font-medium text-muted-foreground">{s.title}</div>
                    {s.desc ? <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div> : null}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Tablet & up: static grid */}
          <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {sortActive(data.strengths).map((s) => {
              const Icon = ICONS[s.icon];
              return (
                <div key={s.id} className="rounded-2xl border bg-card p-6 text-center shadow-card">
                  <Icon className="mx-auto h-8 w-8 text-secondary" />
                  <div className="mt-2 text-4xl font-black text-primary" style={{ opacity: statsVisible ? 1 : 0, transition: "opacity .6s" }}>{s.value}</div>
                  <div className="mt-2 text-sm font-medium text-muted-foreground">{s.title}</div>
                  {s.desc ? <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Trust */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{data.trustEyebrow}</div>
          <h2 className="mt-2 text-3xl font-black text-primary sm:text-4xl">{data.trustHeading}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortActive(data.trust).map((b) => {
            const Icon = ICONS[b.icon];
            return (
              <div key={b.id} className="rounded-2xl border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary"><Icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-bold text-primary">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 6: CTA */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-secondary" />
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">{data.finalCtaHeading}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">{data.finalCtaBody}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="font-bold">
              <Link to="/contact-us">{data.finalCtaPrimaryText}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent font-bold text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/services"><PhoneCall className="mr-2 h-4 w-4" />{data.finalCtaSecondaryText}</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
