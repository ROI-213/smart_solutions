import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/site/AdminShell";
import { Field, TextArea, RepeatableSection, SaveBar } from "@/components/site/ContentEditor";
import { getVision, setVision, newBlock, type VisionContent } from "@/lib/content-store";

export const Route = createFileRoute("/admin/vision")({
  head: () => ({ meta: [{ title: "Vision — Admin" }] }),
  component: AdminVision,
});

function AdminVision() {
  const [data, setData] = useState<VisionContent>(getVision());
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setData(getVision()); }, []);
  const update = <K extends keyof VisionContent>(k: K, v: VisionContent[K]) => {
    setData((d) => ({ ...d, [k]: v })); setDirty(true);
  };

  return (
    <AdminShell title="Vision Management" subtitle="Edit hero, vision, mission, core values and CTA on the /our-vision page.">
      <div className="space-y-6">
        <Section title="Hero">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero Eyebrow" value={data.heroEyebrow} onChange={(v) => update("heroEyebrow", v)} />
            <Field label="Hero Image URL (optional)" value={data.heroImage} onChange={(v) => update("heroImage", v)} placeholder="https://…" />
          </div>
          <Field label="Hero Heading" value={data.heroTitle} onChange={(v) => update("heroTitle", v)} />
          <TextArea label="Hero Subheading" value={data.heroSubtitle} onChange={(v) => update("heroSubtitle", v)} rows={2} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Page Status:</span>
            <select value={data.status} onChange={(e) => update("status", e.target.value as "active" | "draft")} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold">
              <option value="active">Active</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
        </Section>

        <Section title="Vision Statement">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={data.visionEyebrow} onChange={(v) => update("visionEyebrow", v)} />
            <Field label="Title (optional)" value={data.visionTitle} onChange={(v) => update("visionTitle", v)} />
          </div>
          <TextArea label="Vision Statement" value={data.visionStatement} onChange={(v) => update("visionStatement", v)} rows={3} />
          <TextArea label="Supporting Body" value={data.visionBody} onChange={(v) => update("visionBody", v)} rows={3} />
        </Section>

        <Section title="Mission Statement">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={data.missionEyebrow} onChange={(v) => update("missionEyebrow", v)} />
            <Field label="Title" value={data.missionTitle} onChange={(v) => update("missionTitle", v)} />
          </div>
          <TextArea label="Mission Statement" value={data.missionStatement} onChange={(v) => update("missionStatement", v)} rows={4} />
        </Section>

        <Section title="Core Values">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" value={data.valuesEyebrow} onChange={(v) => update("valuesEyebrow", v)} />
            <Field label="Heading" value={data.valuesHeading} onChange={(v) => update("valuesHeading", v)} />
          </div>
          <Field label="Subtitle" value={data.valuesSubtitle} onChange={(v) => update("valuesSubtitle", v)} />
          <RepeatableSection title="Core Values" items={data.values} onChange={(v) => update("values", v)} newItem={newBlock} />
        </Section>

        <Section title="Vision CTA">
          <Field label="CTA Heading" value={data.ctaHeading} onChange={(v) => update("ctaHeading", v)} />
          <TextArea label="CTA Body" value={data.ctaBody} onChange={(v) => update("ctaBody", v)} rows={2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary Button Text" value={data.ctaPrimaryText} onChange={(v) => update("ctaPrimaryText", v)} />
            <Field label="Secondary Button Text" value={data.ctaSecondaryText} onChange={(v) => update("ctaSecondaryText", v)} />
          </div>
        </Section>

        <SaveBar dirty={dirty} onSave={() => { setVision(data); setDirty(false); }} />
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