import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { useTestimonialsStore } from "@/lib/testimonials-store";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — Smart Solutions Groups" },
      { name: "description", content: "What our customers say about Smart Solutions Groups — Home Care 360." },
      { property: "og:title", content: "Customer Testimonials — Smart Solutions Groups" },
      { property: "og:description", content: "Real stories from homes, apartments and offices we serve." },
    ],
  }),
  component: Testimonials,
});

function Testimonials() {
  const { text } = useTestimonialsStore();
  const activeText = text.filter((t) => t.active);
  return (
    <SiteLayout>
      <PageHeader eyebrow="Testimonials" title="Loved by the homes and offices we serve." subtitle="Real feedback from real customers across the city." />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activeText.map((t) => (
            <figure key={t.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex gap-1 text-accent">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm text-foreground">"{t.review}"</blockquote>
              <figcaption className="mt-4 text-xs">
                <div className="font-bold text-primary">{t.name}</div>
                <div className="text-muted-foreground">{t.location}{t.service ? ` · ${t.service}` : ""}</div>
              </figcaption>
            </figure>
          ))}
          {activeText.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">No testimonials yet.</p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
