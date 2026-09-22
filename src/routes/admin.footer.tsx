import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save, Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import {
  type FooterContent,
  DEFAULT_FOOTER,
  getFooterContent,
  setFooterContent,
} from "@/lib/settings-store";

export const Route = createFileRoute("/admin/footer")({
  head: () => ({ meta: [{ title: "Footer — Admin" }] }),
  component: FooterAdmin,
});

function FooterAdmin() {
  const [f, setF] = useState<FooterContent>(DEFAULT_FOOTER);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setF(getFooterContent()); }, []);

  const patch = (p: Partial<FooterContent>) => setF((cur) => ({ ...cur, ...p }));
  const save = () => {
    setFooterContent(f);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminShell title="Footer Management" subtitle="Edit footer content reflected across the website.">
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-8">
        <Section title="Brand & Tagline">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand Name" value={f.brand} onChange={(v) => patch({ brand: v })} />
            <Field label="Product" value={f.product} onChange={(v) => patch({ product: v })} />
          </div>
          <Field label="Main Tagline" value={f.tagline} onChange={(v) => patch({ tagline: v })} />
          <Field label="Company Description" textarea value={f.description} onChange={(v) => patch({ description: v })} />
        </Section>

        <Section title="Section Headings">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Quick Links Heading" value={f.quickLinksHeading} onChange={(v) => patch({ quickLinksHeading: v })} />
            <Field label="Services Heading" value={f.servicesHeading} onChange={(v) => patch({ servicesHeading: v })} />
            <Field label="Contact Heading" value={f.contactHeading} onChange={(v) => patch({ contactHeading: v })} />
            <Field label="Social Heading" value={f.socialHeading} onChange={(v) => patch({ socialHeading: v })} />
          </div>
        </Section>

        <LinkList
          title="Quick Links"
          items={f.quickLinks}
          onChange={(items) => patch({ quickLinks: items })}
        />

        <LinkList
          title="Service Links"
          items={f.serviceLinks}
          onChange={(items) => patch({ serviceLinks: items })}
        />

        <Section title="Contact Details">
          <div className="space-y-2">
            {f.contactLines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={line}
                  onChange={(e) => {
                    const next = [...f.contactLines];
                    next[i] = e.target.value;
                    patch({ contactLines: next });
                  }}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-glow"
                />
                <button
                  type="button"
                  onClick={() => patch({ contactLines: f.contactLines.filter((_, j) => j !== i) })}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => patch({ contactLines: [...f.contactLines, ""] })}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Plus className="h-4 w-4" /> Add Line
            </button>
          </div>
          <Field label="Footer Contact Text" textarea value={f.footerContactText} onChange={(v) => patch({ footerContactText: v })} />
        </Section>

        <Section title="Copyright">
          <Field label="Copyright Text" value={f.copyright} onChange={(v) => patch({ copyright: v })} />
          <p className="text-xs text-muted-foreground">
            Social media links are managed in the Social Media admin and shown automatically in the footer.
          </p>
        </Section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-card"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
          {saved && (
            <span className="text-sm text-muted-foreground">Saved. Reflected across the site.</span>
          )}
        </div>
      </form>
    </AdminShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, textarea,
}: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary-glow"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary-glow"
        />
      )}
    </label>
  );
}

function LinkList({
  title, items, onChange,
}: {
  title: string;
  items: { label: string; to: string }[];
  onChange: (items: { label: string; to: string }[]) => void;
}) {
  const set = (i: number, patch: Partial<{ label: string; to: string }>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <Section title={title}>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
            <input
              value={it.label}
              onChange={(e) => set(i, { label: e.target.value })}
              placeholder="Label"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-glow"
            />
            <input
              value={it.to}
              onChange={(e) => set(i, { to: e.target.value })}
              placeholder="/path"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-glow"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="grid h-10 w-10 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { label: "New Link", to: "/" }])}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          <Plus className="h-4 w-4" /> Add Link
        </button>
      </div>
    </Section>
  );
}