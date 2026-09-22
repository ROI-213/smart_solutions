import { useState } from "react";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { ICON_OPTIONS, ICONS, type IconName, type Block, type Strength } from "@/lib/content-store";

export function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary-glow"
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary-glow"
      />
    </label>
  );
}

export function IconPicker({ value, onChange }: { value: IconName; onChange: (v: IconName) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Icon</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as IconName)}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary-glow"
      >
        {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
    </label>
  );
}

export function StatusToggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
    >
      {active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {active ? "Active" : "Inactive"}
    </button>
  );
}

export function BlockRow<T extends Block | Strength>({
  item, isStrength, onUpdate, onDelete, onMove,
}: {
  item: T;
  isStrength?: boolean;
  onUpdate: (next: T) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const Icon = ICONS[item.icon];
  return (
    <div className="rounded-2xl border border-border bg-background/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
          <span className="text-sm font-bold text-primary">{item.title || "Untitled"}</span>
          <span className="text-xs text-muted-foreground">#{item.order}</span>
        </div>
        <div className="flex items-center gap-1">
          <StatusToggle active={item.active} onChange={(v) => onUpdate({ ...item, active: v })} />
          <button type="button" onClick={() => onMove(-1)} className="rounded-md p-1.5 hover:bg-muted"><ArrowUp className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => onMove(1)} className="rounded-md p-1.5 hover:bg-muted"><ArrowDown className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={onDelete} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" value={item.title} onChange={(v) => onUpdate({ ...item, title: v })} />
        <IconPicker value={item.icon} onChange={(v) => onUpdate({ ...item, icon: v })} />
        {isStrength && (
          <Field label="Value / Number" value={(item as Strength).value} onChange={(v) => onUpdate({ ...item, value: v } as T)} />
        )}
        <Field label="Order" value={String(item.order)} onChange={(v) => onUpdate({ ...item, order: Number(v) || 0 })} />
      </div>
      <div className="mt-3">
        <TextArea label="Description" value={item.desc} onChange={(v) => onUpdate({ ...item, desc: v })} rows={2} />
      </div>
    </div>
  );
}

export function RepeatableSection<T extends Block | Strength>({
  title, items, isStrength, onChange, newItem,
}: {
  title: string;
  items: T[];
  isStrength?: boolean;
  onChange: (next: T[]) => void;
  newItem: () => T;
}) {
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next.map((it, i) => ({ ...it, order: i + 1 })));
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-black text-primary">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...items, { ...newItem(), order: items.length + 1 }])}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-muted"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((it, idx) => (
          <BlockRow
            key={it.id}
            item={it}
            isStrength={isStrength}
            onUpdate={(next) => onChange(items.map((x) => (x.id === it.id ? next : x)))}
            onDelete={() => onChange(items.filter((x) => x.id !== it.id))}
            onMove={(dir) => move(idx, dir)}
          />
        ))}
        {items.length === 0 && <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No items yet — click Add.</div>}
      </div>
    </div>
  );
}

export function SaveBar({ onSave, dirty }: { onSave: () => void; dirty: boolean }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-border bg-card/95 p-4 shadow-lift backdrop-blur">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {saved ? "Saved — changes are live on the site." : dirty ? "Unsaved changes" : "All changes saved"}
      </span>
      <button
        type="button"
        onClick={() => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-card"
      >
        <Save className="h-4 w-4" /> Save Changes
      </button>
    </div>
  );
}

export function BulletsEditor({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <button type="button" onClick={() => onChange([...value, ""])} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted">
          <Plus className="h-3 w-3" />Add
        </button>
      </div>
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-glow"
            />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-md p-2 text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}