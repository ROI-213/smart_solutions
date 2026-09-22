import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

const MAX = 5 * 1024 * 1024;
const OK = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageUploadField({
  value,
  onChange,
  placeholder = "https://… or upload below",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);

  function handle(files: FileList | null) {
    setErr(null);
    const f = files?.[0];
    if (!f) return;
    if (!OK.includes(f.type)) { setErr("Only JPG, PNG, WEBP or GIF."); return; }
    if (f.size > MAX) { setErr("Max 5 MB."); return; }
    const fr = new FileReader();
    fr.onload = () => onChange(String(fr.result));
    fr.onerror = () => setErr("Could not read file.");
    fr.readAsDataURL(f);
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary-glow"
      />
      <div className="flex items-center gap-2">
        {value ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-1.5">
            <img src={value} alt="preview" className="h-10 w-10 rounded object-cover" />
            <button type="button" onClick={() => onChange("")} className="rounded p-1 text-rose-600 hover:bg-rose-50" title="Clear">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
        >
          <Upload className="h-3.5 w-3.5" /> Upload image (max 5 MB)
        </button>
        <input
          ref={ref}
          type="file"
          accept={OK.join(",")}
          className="hidden"
          onChange={(e) => { handle(e.target.files); e.target.value = ""; }}
        />
      </div>
      {err && <div className="rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">{err}</div>}
    </div>
  );
}