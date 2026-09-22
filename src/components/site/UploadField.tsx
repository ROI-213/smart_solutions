import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, Upload, X, Replace } from "lucide-react";
import { MAX_UPLOAD_BYTES, ACCEPTED_MIMES } from "@/lib/agents-store";

export type UploadedFile = {
  name: string;
  mime: string;
  size: number;
  dataUrl: string;
};

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function fileToDataUrl(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(f);
  });
}

function validateFile(f: File): string | null {
  if (!(ACCEPTED_MIMES as readonly string[]).includes(f.type)) {
    return "Only JPG, PNG, WEBP or PDF files are allowed.";
  }
  if (f.size > MAX_UPLOAD_BYTES) return `File is too large. Max 5 MB.`;
  return null;
}

export function UploadField({
  label,
  required,
  value,
  onChange,
  hint,
}: {
  label: string;
  required?: boolean;
  value?: UploadedFile | null;
  onChange: (f: UploadedFile | null) => void;
  hint?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) return;
    const f = files[0];
    const err = validateFile(f);
    if (err) { setError(err); return; }
    try {
      const dataUrl = await fileToDataUrl(f);
      onChange({ name: f.name, mime: f.type, size: f.size, dataUrl });
    } catch {
      setError("Could not read file. Please try again.");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs font-bold text-[#0B2E59]">{label}</div>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${required ? "bg-rose-100 text-rose-700" : "bg-muted text-muted-foreground"}`}>
          {required ? "Required" : "Optional"}
        </span>
      </div>
      {hint && <p className="mb-2 text-[10px] text-muted-foreground">{hint}</p>}

      {value ? (
        <div className="flex items-center gap-3">
          {value.mime.startsWith("image/") ? (
            <img src={value.dataUrl} alt={value.name} className="h-14 w-14 rounded-md object-cover" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-md bg-rose-50 text-rose-600">
              <FileText className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-foreground">{value.name}</div>
            <div className="text-[10px] text-muted-foreground">{fmtSize(value.size)} · {value.mime.split("/")[1]?.toUpperCase()}</div>
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={() => ref.current?.click()} className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted" title="Replace">
              <Replace className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onChange(null)} className="rounded-md border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50" title="Remove">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#D4AF37]/70 bg-[#FFF8E1]/50 px-3 py-4 text-xs font-bold text-[#0B2E59] hover:bg-[#FFF8E1]"
        >
          <Upload className="h-4 w-4" /> Choose file (JPG, PNG, WEBP, PDF · max 5 MB)
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept={ACCEPTED_MIMES.join(",")}
        className="hidden"
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }}
      />
      {error && <div className="mt-2 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">{error}</div>}
    </div>
  );
}

export function MultiUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: UploadedFile[];
  onChange: (v: UploadedFile[]) => void;
  hint?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) return;
    const accepted: UploadedFile[] = [];
    for (const f of Array.from(files)) {
      const err = validateFile(f);
      if (err) { setError(err); continue; }
      const dataUrl = await fileToDataUrl(f);
      accepted.push({ name: f.name, mime: f.type, size: f.size, dataUrl });
    }
    if (accepted.length) onChange([...value, ...accepted]);
  }

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs font-bold text-[#0B2E59]">{label}</div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">Optional · Multi</span>
      </div>
      {hint && <p className="mb-2 text-[10px] text-muted-foreground">{hint}</p>}

      {value.length > 0 && (
        <ul className="mb-2 space-y-1">
          {value.map((f, i) => (
            <li key={i} className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-[11px]">
              {f.mime.startsWith("image/") ? <ImageIcon className="h-3.5 w-3.5 text-[#0B2E59]" /> : <FileText className="h-3.5 w-3.5 text-rose-600" />}
              <span className="truncate flex-1">{f.name}</span>
              <span className="text-muted-foreground">{fmtSize(f.size)}</span>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="rounded p-0.5 text-rose-600 hover:bg-rose-50">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#D4AF37]/70 bg-[#FFF8E1]/50 px-3 py-2.5 text-xs font-bold text-[#0B2E59] hover:bg-[#FFF8E1]"
      >
        <Upload className="h-4 w-4" /> Add files
      </button>
      <input ref={ref} type="file" multiple accept={ACCEPTED_MIMES.join(",")} className="hidden" onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
      {error && <div className="mt-2 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">{error}</div>}
    </div>
  );
}