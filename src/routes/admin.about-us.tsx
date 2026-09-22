import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/site/AdminShell";
import {
  Field, TextArea, RepeatableSection, SaveBar, BulletsEditor,
} from "@/components/site/ContentEditor";
import { getAbout, setAbout, newBlock, newStrength, type AboutContent } from "@/lib/content-store";

export const Route = createFileRoute("/admin/about-us")({
  head: () => ({ meta: [{ title: "About Us — Admin" }] }),
  component: AdminAbout,
});

function AdminAbout() {
  const [data, setData] = useState<AboutContent>(getAbout());
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setData(getAbout()); }, []);
  const update = <K extends keyof AboutContent>(k: K, v: AboutContent[K]) => {
    setData((d) => ({ ...d, [k]: v })); setDirty(true);
  };

  return (
    <AdminShell title="About Us Management" subtitle="Edit every section of the /about-us page. Changes sync live across the website.">
      <div className="space-y-6">
        <Section title="Hero">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero Eyebrow" value={data.heroEyebrow} onChange={(v) => update("heroEyebrow", v)} />
            <Field label="Hero Image URL (optional)" value={data.heroImage} onChange={(v) => update("heroImage", v)} placeholder="https://…" />
          </div>
          <Field label="Hero Heading" value={data.heroTitle} onChange={(v) => update("heroTitle", v)} />
          <TextArea label="Hero Subheading" value={data.heroSubtitle} onChange={(v) => update("heroSubtitle", v)} rows={2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CTA Button Text" value={data.ctaButtonText} onChange={(v) => update("ctaButtonText", v)} />
            <Field label="CTA Button Link" value={data.ctaButtonLink} onChange={(v) => update("ctaButtonLink", v)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Page Status:</span>
            <select value={data.status} onChange={(e) => update("status", e.target.value as "active" | "draft")} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold">
              <option value="active">Active</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
        </Section>

        <Section title="Company Introduction">
          <Field label="Heading" value={data.introHeading} onChange={(v) => update("introHeading", v)} />
          <TextArea label="Body — paragraph 1" value={data.introBody1} onChange={(v) => update("introBody1", v)} rows={4} />
          <TextArea label="Body — paragraph 2" value={data.introBody2} onChange={(v) => update("introBody2", v)} rows={3} />
          <BulletsEditor label="Highlight Bullets" value={data.introBullets} onChange={(v) => update("introBullets", v)} />
        </Section>

        <Section title="What We Do">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={data.whatWeDoEyebrow} onChange={(v) => update("whatWeDoEyebrow", v)} />
            <Field label="Heading" value={data.whatWeDoHeading} onChange={(v) => update("whatWeDoHeading", v)} />
          </div>
          <RepeatableSection title="What We Do Blocks" items={data.whatWeDo} onChange={(v) => update("whatWeDo", v)} newItem={newBlock} />
        </Section>

        <Section title="Who We Serve">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={data.whoWeServeEyebrow} onChange={(v) => update("whoWeServeEyebrow", v)} />
            <Field label="Heading" value={data.whoWeServeHeading} onChange={(v) => update("whoWeServeHeading", v)} />
          </div>
          <RepeatableSection title="Who We Serve Blocks" items={data.whoWeServe} onChange={(v) => update("whoWeServe", v)} newItem={newBlock} />
        </Section>

        <Section title="Company Strengths (Stats)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={data.strengthsEyebrow} onChange={(v) => update("strengthsEyebrow", v)} />
            <Field label="Heading" value={data.strengthsHeading} onChange={(v) => update("strengthsHeading", v)} />
          </div>
          <RepeatableSection title="Strengths" items={data.strengths} isStrength onChange={(v) => update("strengths", v)} newItem={newStrength} />
        </Section>

        <Section title="Why Customers Trust Us">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={data.trustEyebrow} onChange={(v) => update("trustEyebrow", v)} />
            <Field label="Heading" value={data.trustHeading} onChange={(v) => update("trustHeading", v)} />
          </div>
          <RepeatableSection title="Trust Reasons" items={data.trust} onChange={(v) => update("trust", v)} newItem={newBlock} />
        </Section>

        <Section title="About CTA (Footer Section)">
          <Field label="CTA Heading" value={data.finalCtaHeading} onChange={(v) => update("finalCtaHeading", v)} />
          <TextArea label="CTA Body" value={data.finalCtaBody} onChange={(v) => update("finalCtaBody", v)} rows={2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary Button Text" value={data.finalCtaPrimaryText} onChange={(v) => update("finalCtaPrimaryText", v)} />
            <Field label="Secondary Button Text" value={data.finalCtaSecondaryText} onChange={(v) => update("finalCtaSecondaryText", v)} />
          </div>
        </Section>

        <SaveBar dirty={dirty} onSave={() => { setAbout(data); setDirty(false); }} />
      </div>
    </AdminShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="mb-5 text-lg font-black text-primary">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}