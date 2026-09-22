import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit3, Trash2, Eye, Search, Star, PlayCircle } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  useTestimonialsStore,
  saveTextTestimonial, deleteTextTestimonial,
  saveVideoTestimonial, deleteVideoTestimonial,
  newText, newVideo,
  type TextTestimonial, type VideoTestimonial, type AnyTestimonial,
} from "@/lib/testimonials-store";
import { ImageUploadField } from "@/components/site/ImageUploadField";

export const Route = createFileRoute("/admin/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials — Admin" }] }),
  component: TestimonialsAdmin,
});

type Tab = "all" | "text" | "video";

function TestimonialsAdmin() {
  const { text, video } = useTestimonialsStore();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [editText, setEditText] = useState<TextTestimonial | null>(null);
  const [editVideo, setEditVideo] = useState<VideoTestimonial | null>(null);
  const [view, setView] = useState<AnyTestimonial | null>(null);

  const rows = useMemo<AnyTestimonial[]>(() => {
    const all: AnyTestimonial[] = [...text, ...video];
    const needle = q.trim().toLowerCase();
    return all
      .filter((t) => tab === "all" || t.type === tab)
      .filter((t) =>
        !needle ||
        t.name.toLowerCase().includes(needle) ||
        t.service.toLowerCase().includes(needle),
      )
      .sort((a, b) => a.order - b.order);
  }, [text, video, tab, q]);

  return (
    <AdminShell
      title="Testimonials Management"
      subtitle="Manage text and video testimonials. Active items appear on the website instantly."
      actions={
        <>
          <button onClick={() => setEditText(newText())} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold hover:bg-muted">
            <Plus className="h-4 w-4" /> Text
          </button>
          <button onClick={() => setEditVideo(newVideo())} className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-card">
            <Plus className="h-4 w-4" /> Video
          </button>
        </>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-muted p-1">
          {(["all", "text", "video"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === t ? "bg-primary text-primary-foreground shadow-card" : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {t} ({t === "all" ? text.length + video.length : t === "text" ? text.length : video.length})
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or service…" className="pl-9" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Rating</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Order</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{t.name || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={t.type === "video" ? "default" : "secondary"} className="capitalize">
                    {t.type === "video" ? <PlayCircle className="mr-1 h-3 w-3" /> : null}
                    {t.type}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{t.service || "—"}</td>
                <td className="px-4 py-3 text-secondary">{t.type === "text" ? "★".repeat(t.rating) : "—"}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={t.active}
                    onCheckedChange={(v) => {
                      if (t.type === "text") saveTextTestimonial({ ...t, active: v });
                      else saveVideoTestimonial({ ...t, active: v });
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    value={t.order}
                    onChange={(e) => {
                      const order = parseInt(e.target.value || "1", 10);
                      if (t.type === "text") saveTextTestimonial({ ...t, order });
                      else saveVideoTestimonial({ ...t, order });
                    }}
                    className="h-8 w-16"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setView(t)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted">
                      <Eye className="h-3 w-3" /> View
                    </button>
                    <button
                      onClick={() => (t.type === "text" ? setEditText(t) : setEditVideo(t))}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                    >
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`Delete testimonial from ${t.name}?`)) return;
                        if (t.type === "text") deleteTextTestimonial(t.id);
                        else deleteVideoTestimonial(t.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No testimonials found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editText && (
        <TextDialog
          value={editText}
          onClose={() => setEditText(null)}
          onSave={(v) => { saveTextTestimonial(v); setEditText(null); }}
        />
      )}
      {editVideo && (
        <VideoDialog
          value={editVideo}
          onClose={() => setEditVideo(null)}
          onSave={(v) => { saveVideoTestimonial(v); setEditVideo(null); }}
        />
      )}
      {view && <ViewDialog value={view} onClose={() => setView(null)} />}
    </AdminShell>
  );
}

function TextDialog({ value, onClose, onSave }: { value: TextTestimonial; onClose: () => void; onSave: (v: TextTestimonial) => void }) {
  const [v, setV] = useState(value);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{value.name ? "Edit" : "Add"} Text Testimonial</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name"><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field label="Location"><Input value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} /></Field>
          <Field label="Service used"><Input value={v.service} onChange={(e) => setV({ ...v, service: e.target.value })} /></Field>
          <Field label="Rating (1-5)"><Input type="number" min={1} max={5} value={v.rating} onChange={(e) => setV({ ...v, rating: Math.min(5, Math.max(1, parseInt(e.target.value || "5", 10))) })} /></Field>
          <Field label="Customer photo" className="sm:col-span-2">
            <ImageUploadField value={v.photo} onChange={(val) => setV({ ...v, photo: val })} />
          </Field>
          <Field label="Review text" className="sm:col-span-2"><Textarea rows={4} value={v.review} onChange={(e) => setV({ ...v, review: e.target.value })} /></Field>
          <Field label="Date"><Input type="date" value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} /></Field>
          <Field label="Display order"><Input type="number" value={v.order} onChange={(e) => setV({ ...v, order: parseInt(e.target.value || "1", 10) })} /></Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch checked={v.active} onCheckedChange={(b) => setV({ ...v, active: b })} />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => onSave(v)} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VideoDialog({ value, onClose, onSave }: { value: VideoTestimonial; onClose: () => void; onSave: (v: VideoTestimonial) => void }) {
  const [v, setV] = useState(value);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{value.name ? "Edit" : "Add"} Video Testimonial</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name"><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field label="Service used"><Input value={v.service} onChange={(e) => setV({ ...v, service: e.target.value })} /></Field>
          <Field label="Video title" className="sm:col-span-2"><Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
          <Field label="Video URL (YouTube embed or mp4)" className="sm:col-span-2"><Input value={v.videoUrl} onChange={(e) => setV({ ...v, videoUrl: e.target.value })} placeholder="https://www.youtube.com/embed/…" /></Field>
          <Field label="Thumbnail image URL" className="sm:col-span-2"><Input value={v.thumbnail} onChange={(e) => setV({ ...v, thumbnail: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Short description" className="sm:col-span-2"><Textarea rows={3} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
          <Field label="Display order"><Input type="number" value={v.order} onChange={(e) => setV({ ...v, order: parseInt(e.target.value || "1", 10) })} /></Field>
          <div className="flex items-center gap-3">
            <Switch checked={v.active} onCheckedChange={(b) => setV({ ...v, active: b })} />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => onSave(v)} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewDialog({ value, onClose }: { value: AnyTestimonial; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{value.name}</DialogTitle></DialogHeader>
        <div className="space-y-2 text-sm">
          <div><span className="font-semibold">Type:</span> {value.type}</div>
          <div><span className="font-semibold">Service:</span> {value.service}</div>
          {value.type === "text" ? (
            <>
              <div><span className="font-semibold">Location:</span> {value.location}</div>
              <div className="flex gap-1 text-secondary">{Array.from({ length: value.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <blockquote className="rounded-md bg-muted p-3 italic">"{value.review}"</blockquote>
              <div className="text-xs text-muted-foreground">Date: {value.date}</div>
            </>
          ) : (
            <>
              <div><span className="font-semibold">Title:</span> {value.title}</div>
              <div><span className="font-semibold">URL:</span> <span className="break-all">{value.videoUrl}</span></div>
              <p className="text-muted-foreground">{value.description}</p>
              {value.videoUrl && (
                <div className="aspect-video overflow-hidden rounded-md border border-border">
                  <iframe src={value.videoUrl} title={value.title} className="h-full w-full" allowFullScreen />
                </div>
              )}
            </>
          )}
          <div className="text-xs text-muted-foreground">Order: {value.order} · {value.active ? "Active" : "Inactive"}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}