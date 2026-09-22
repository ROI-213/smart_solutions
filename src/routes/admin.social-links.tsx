import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save, Plus, Trash2, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import {
  type SocialLink,
  type SocialIconName,
  SOCIAL_ICONS,
  getSocialLinks,
  setSocialLinks,
} from "@/lib/settings-store";

export const Route = createFileRoute("/admin/social-links")({
  head: () => ({ meta: [{ title: "Social Media — Admin" }] }),
  component: SocialLinksAdmin,
});

const ICON_OPTIONS: SocialIconName[] = [
  "facebook", "instagram", "youtube", "linkedin", "whatsapp", "google", "globe",
];

function SocialLinksAdmin() {
  const [rows, setRows] = useState<SocialLink[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setRows(getSocialLinks()); }, []);

  const update = (id: string, patch: Partial<SocialLink>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [
      ...rs,
      {
        id: `social-${Date.now()}`,
        platform: "New Platform",
        url: "https://",
        icon: "globe",
        active: true,
        order: rs.length + 1,
      },
    ]);
  const save = () => {
    setSocialLinks([...rows].sort((a, b) => a.order - b.order));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminShell
      title="Social Media Management"
      subtitle="Manage social links shown in Header, Footer and Contact Us page."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={add}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          <Plus className="h-4 w-4" /> Add Platform
        </button>
        <button
          onClick={save}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-card"
        >
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>
      {saved && (
        <div className="mb-4 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-2 text-sm">
          Saved. Changes will reflect across the website.
        </div>
      )}

      <div className="space-y-3">
        {rows.map((r) => {
          const Icon = SOCIAL_ICONS[r.icon] || SOCIAL_ICONS.globe;
          return (
            <div
              key={r.id}
              className="grid gap-3 rounded-xl border border-border bg-background p-3 md:grid-cols-[auto_1.2fr_2fr_1fr_auto_auto_auto]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-hero text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <input
                value={r.platform}
                onChange={(e) => update(r.id, { platform: e.target.value })}
                placeholder="Platform name"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-glow"
              />
              <div className="flex items-center gap-2">
                <input
                  value={r.url}
                  onChange={(e) => update(r.id, { url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-glow"
                />
                <a href={r.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Open">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <select
                value={r.icon}
                onChange={(e) => update(r.id, { icon: e.target.value as SocialIconName })}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <input
                type="number"
                value={r.order}
                onChange={(e) => update(r.id, { order: Number(e.target.value) || 0 })}
                className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                title="Display order"
              />
              <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={r.active}
                  onChange={(e) => update(r.id, { active: e.target.checked })}
                />
                Active
              </label>
              <button
                onClick={() => remove(r.id)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No social links yet. Click "Add Platform" to start.
          </div>
        )}
      </div>
    </AdminShell>
  );
}