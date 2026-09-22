import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Edit3, Trash2, Eye, RotateCcw, Search, Star, Flame, CheckCircle2, XCircle } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { ImageUploadField } from "@/components/site/ImageUploadField";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  useStore, saveCategory, deleteCategory, saveService, deleteService,
  newCategory, newService, resetStore, slugify,
  type AdminCategory, type AdminService,
} from "@/lib/services-store";

export const Route = createFileRoute("/admin/services")({
  head: () => ({ meta: [{ title: "Services — Admin" }] }),
  component: ServicesAdmin,
});

function ServicesAdmin() {
  const { categories, services } = useStore();
  const [tab, setTab] = useState<"services" | "categories">("services");
  const [editCat, setEditCat] = useState<AdminCategory | null>(null);
  const [editSvc, setEditSvc] = useState<AdminService | null>(null);
  const [viewSvc, setViewSvc] = useState<AdminService | null>(null);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");

  const filteredSvcs = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return services.filter((s) => {
      if (catFilter !== "all" && s.categoryId !== catFilter) return false;
      if (!needle) return true;
      return s.name.toLowerCase().includes(needle) || s.slug.includes(needle);
    });
  }, [services, q, catFilter]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <AdminShell
      title="Services Management"
      subtitle="Add, edit and organise all categories and services. Changes save instantly."
      actions={
        <>
          <button
            onClick={() => { if (confirm("Reset all categories and services to defaults?")) resetStore(); }}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
          </button>
          {tab === "categories" ? (
            <button onClick={() => setEditCat(newCategory())} className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-card">
              <Plus className="h-4 w-4" /> Add Category
            </button>
          ) : (
            <button onClick={() => setEditSvc(newService())} className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-card">
              <Plus className="h-4 w-4" /> Add Service
            </button>
          )}
        </>
      }
    >
      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-full border border-border bg-muted p-1">
        {(["services", "categories"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t ? "bg-primary text-primary-foreground shadow-card" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {t === "services" ? `Services (${services.length})` : `Categories (${categories.length})`}
          </button>
        ))}
      </div>

      {tab === "categories" ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="px-4 py-2 text-left">Services</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">{c.order}</td>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">/services/{c.slug}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{services.filter((s) => s.categoryId === c.id).length}</td>
                  <td className="px-4 py-3">
                    {c.active ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => saveCategory({ ...c, active: !c.active })} className="rounded-md border border-border p-1.5 text-xs hover:bg-muted" title={c.active ? "Deactivate" : "Activate"}>
                        {c.active ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => setEditCat(c)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><Edit3 className="h-3 w-3" />Edit</button>
                      <button onClick={() => { if (confirm(`Delete category "${c.name}"?`)) deleteCategory(c.id); }} className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" />Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or slug…" className="pl-9" />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Flags</th>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSvcs.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-3 py-3 text-xs text-muted-foreground">#{s.number}</td>
                    <td className="px-3 py-3">
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">/services/{s.slug}</div>
                    </td>
                    <td className="px-3 py-3 text-xs">{catName(s.categoryId)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        {s.featured && <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100"><Star className="h-3 w-3" />Featured</Badge>}
                        {s.popular && <Badge className="gap-1 bg-rose-100 text-rose-800 hover:bg-rose-100"><Flame className="h-3 w-3" />Popular</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs">{s.order}</td>
                    <td className="px-3 py-3">
                      {s.active ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setViewSvc(s)} className="rounded-md border border-border p-1.5 text-xs hover:bg-muted" title="View"><Eye className="h-3.5 w-3.5" /></button>
                        <button onClick={() => saveService({ ...s, active: !s.active })} className="rounded-md border border-border p-1.5 text-xs hover:bg-muted" title={s.active ? "Deactivate" : "Activate"}>
                          {s.active ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => setEditSvc(s)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><Edit3 className="h-3 w-3" />Edit</button>
                        <button onClick={() => { if (confirm(`Delete "${s.name}"?`)) deleteService(s.id); }} className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSvcs.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">No services match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <CategoryDialog cat={editCat} onClose={() => setEditCat(null)} />
      <ServiceDialog svc={editSvc} categories={categories} onClose={() => setEditSvc(null)} />
      <ViewServiceDialog svc={viewSvc} categoryName={viewSvc ? catName(viewSvc.categoryId) : ""} onClose={() => setViewSvc(null)} />
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function CategoryDialog({ cat, onClose }: { cat: AdminCategory | null; onClose: () => void }) {
  const [draft, setDraft] = useState<AdminCategory | null>(cat);
  // sync when prop changes
  if (cat && (!draft || draft.id !== cat.id)) setDraft(cat);
  if (!cat || !draft) return (
    <Dialog open={false} onOpenChange={(o) => !o && onClose()}><DialogContent /></Dialog>
  );

  const set = <K extends keyof AdminCategory>(k: K, v: AdminCategory[K]) => setDraft({ ...draft, [k]: v });

  return (
    <Dialog open={!!cat} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{cat.name ? `Edit "${cat.name}"` : "Add Category"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Field label="Category name">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slug || slugify(e.target.value) })} />
          </Field>
          <Field label="Slug"><Input value={draft.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></Field>
          <Field label="Icon (lucide name)"><Input value={draft.icon} onChange={(e) => set("icon", e.target.value)} placeholder="Wrench" /></Field>
          <Field label="Image"><ImageUploadField value={draft.image} onChange={(v) => set("image", v)} /></Field>
          <div className="sm:col-span-2"><Field label="Short description"><Textarea rows={2} value={draft.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Long description"><Textarea rows={4} value={draft.longDesc} onChange={(e) => set("longDesc", e.target.value)} /></Field></div>
          <Field label="Display order"><Input type="number" value={draft.order} onChange={(e) => set("order", Number(e.target.value) || 0)} /></Field>
          <div className="flex items-end gap-3">
            <Switch checked={draft.active} onCheckedChange={(v) => set("active", v)} id="cat-active" />
            <Label htmlFor="cat-active" className="text-sm">{draft.active ? "Active" : "Inactive"}</Label>
          </div>
        </div>
        <DialogFooter>
          <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button
            onClick={() => { if (!draft.name.trim()) { alert("Name is required"); return; } saveCategory({ ...draft, slug: draft.slug || slugify(draft.name) }); onClose(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ServiceDialog({ svc, categories, onClose }: { svc: AdminService | null; categories: AdminCategory[]; onClose: () => void }) {
  const [draft, setDraft] = useState<AdminService | null>(svc);
  if (svc && (!draft || draft.id !== svc.id)) setDraft(svc);
  if (!svc || !draft) return (
    <Dialog open={false} onOpenChange={(o) => !o && onClose()}><DialogContent /></Dialog>
  );

  const set = <K extends keyof AdminService>(k: K, v: AdminService[K]) => setDraft({ ...draft, [k]: v });

  return (
    <Dialog open={!!svc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>{svc.name ? `Edit "${svc.name}"` : "Add Service"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Field label="Service number"><Input type="number" value={draft.number} onChange={(e) => set("number", Number(e.target.value) || 0)} /></Field>
          <Field label="Display order"><Input type="number" value={draft.order} onChange={(e) => set("order", Number(e.target.value) || 0)} /></Field>
          <Field label="Service name">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slug || slugify(e.target.value) })} />
          </Field>
          <Field label="Slug"><Input value={draft.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></Field>
          <Field label="Category">
            <Select value={draft.categoryId} onValueChange={(v) => set("categoryId", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Icon (lucide name)"><Input value={draft.icon} onChange={(e) => set("icon", e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Short description"><Textarea rows={2} value={draft.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Long description"><Textarea rows={4} value={draft.longDesc} onChange={(e) => set("longDesc", e.target.value)} /></Field></div>
          <Field label="Image"><ImageUploadField value={draft.image} onChange={(v) => set("image", v)} /></Field>
          <div />
          <Field label="What is included (one per line)"><Textarea rows={5} value={draft.included} onChange={(e) => set("included", e.target.value)} /></Field>
          <Field label="Suitable for (one per line)"><Textarea rows={5} value={draft.suitableFor} onChange={(e) => set("suitableFor", e.target.value)} /></Field>
          <Field label="SEO title"><Input value={draft.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} /></Field>
          <Field label="SEO description"><Input value={draft.seoDesc} onChange={(e) => set("seoDesc", e.target.value)} /></Field>
          <div className="flex items-center gap-3"><Switch id="svc-feat" checked={draft.featured} onCheckedChange={(v) => set("featured", v)} /><Label htmlFor="svc-feat">Featured</Label></div>
          <div className="flex items-center gap-3"><Switch id="svc-pop" checked={draft.popular} onCheckedChange={(v) => set("popular", v)} /><Label htmlFor="svc-pop">Popular</Label></div>
          <div className="flex items-center gap-3 sm:col-span-2"><Switch id="svc-act" checked={draft.active} onCheckedChange={(v) => set("active", v)} /><Label htmlFor="svc-act">{draft.active ? "Active" : "Inactive"}</Label></div>
        </div>
        <DialogFooter>
          <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button
            onClick={() => { if (!draft.name.trim()) { alert("Name is required"); return; } saveService({ ...draft, slug: draft.slug || slugify(draft.name) }); onClose(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewServiceDialog({ svc, categoryName, onClose }: { svc: AdminService | null; categoryName: string; onClose: () => void }) {
  if (!svc) return null;
  return (
    <Dialog open={!!svc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{svc.name}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">#{svc.number}</Badge>
            <Badge variant="outline">{categoryName}</Badge>
            {svc.featured && <Badge className="bg-amber-100 text-amber-800">Featured</Badge>}
            {svc.popular && <Badge className="bg-rose-100 text-rose-800">Popular</Badge>}
            <Badge className={svc.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>{svc.active ? "Active" : "Inactive"}</Badge>
          </div>
          <div><span className="font-semibold">Slug:</span> <Link to="/services/$slug" params={{ slug: svc.slug }} className="text-primary underline">/services/{svc.slug}</Link></div>
          <div><span className="font-semibold">Short:</span> {svc.shortDesc}</div>
          <div><span className="font-semibold">Long:</span> <p className="mt-1 text-muted-foreground">{svc.longDesc}</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><div className="font-semibold">What is included</div><ul className="mt-1 list-disc pl-5 text-muted-foreground">{svc.included.split("\n").filter(Boolean).map((l, i) => <li key={i}>{l}</li>)}</ul></div>
            <div><div className="font-semibold">Suitable for</div><ul className="mt-1 list-disc pl-5 text-muted-foreground">{svc.suitableFor.split("\n").filter(Boolean).map((l, i) => <li key={i}>{l}</li>)}</ul></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
