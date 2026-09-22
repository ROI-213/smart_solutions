import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Eye, Trash2, Download, Phone, MessageCircle, CheckCircle2, Inbox,
  Clock, Loader2, XCircle, FileText, X,
} from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import {
  useEnquiriesStore, updateEnquiry, deleteEnquiry, addNote, downloadEnquiriesCSV,
  ENQUIRY_STATUSES, assignEnquiryToAgent, type Enquiry, type EnquiryStatus,
} from "@/lib/enquiries-store";
import { useAllAgents } from "@/lib/agents-store";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => ({ meta: [{ title: "Enquiries — Admin" }] }),
  component: EnquiriesPage,
});

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  New: "bg-accent text-accent-foreground",
  Contacted: "bg-primary text-primary-foreground",
  "In Progress": "bg-secondary text-secondary-foreground",
  Completed: "bg-emerald-500 text-white",
  Rejected: "bg-destructive text-destructive-foreground",
};

const STAT_ICONS = {
  Total: Inbox, New: Inbox, Contacted: CheckCircle2,
  "In Progress": Loader2, Completed: CheckCircle2, Rejected: XCircle,
} as const;

function EnquiriesPage() {
  const { enquiries } = useEnquiriesStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | EnquiryStatus>("All");
  const [viewing, setViewing] = useState<Enquiry | null>(null);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return enquiries.filter((e) =>
      (filter === "All" || e.status === filter) &&
      (ql === "" || [e.name, e.phone, e.email, e.service, e.category, e.location].join(" ").toLowerCase().includes(ql))
    );
  }, [enquiries, q, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Total: enquiries.length };
    for (const s of ENQUIRY_STATUSES) c[s] = enquiries.filter((e) => e.status === s).length;
    return c;
  }, [enquiries]);

  const wa = (phone: string) =>
    `https://wa.me/91${phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
      "Hi, this is Smart Solutions Groups regarding your enquiry."
    )}`;

  return (
    <AdminShell title="Enquiry Management" subtitle="All submissions from the website forms appear here in real time.">
      {/* Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(["Total", ...ENQUIRY_STATUSES] as const).map((k) => {
          const Icon = STAT_ICONS[k as keyof typeof STAT_ICONS] ?? Inbox;
          return (
            <div key={k} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="mt-0.5 text-2xl font-black text-primary">{counts[k] ?? 0}</div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, service, location..." className="w-full bg-transparent text-sm outline-none" />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-border p-1">
          {(["All", ...ENQUIRY_STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{s}</button>
          ))}
        </div>
        <button
          onClick={() => downloadEnquiriesCSV(filtered)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-card"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Phone</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Service</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Preferred</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Submitted</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-border align-top">
                <td className="px-3 py-3">
                  <div className="font-semibold">{e.name || "—"}</div>
                  <div className="text-[11px] text-muted-foreground">{e.id}</div>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{e.phone || "—"}</td>
                <td className="px-3 py-3">{e.category || "—"}</td>
                <td className="px-3 py-3">{e.service || "—"}</td>
                <td className="px-3 py-3 text-muted-foreground">{e.location || "—"}</td>
                <td className="px-3 py-3 text-muted-foreground">{e.preferredDate || "—"}</td>
                <td className="px-3 py-3">
                  <select
                    value={e.status}
                    onChange={(ev) => updateEnquiry(e.id, { status: ev.target.value as EnquiryStatus })}
                    className={`rounded-md px-2 py-1 text-[11px] font-bold ${STATUS_STYLES[e.status]}`}
                  >
                    {ENQUIRY_STATUSES.map((s) => <option key={s} value={s} className="bg-background text-foreground">{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setViewing(e)} className="rounded-md border border-border p-1.5 hover:bg-muted" title="View"><Eye className="h-3.5 w-3.5" /></button>
                    {e.phone && (
                      <>
                        <a href={`tel:${e.phone}`} className="rounded-md border border-border p-1.5 hover:bg-muted" title="Call"><Phone className="h-3.5 w-3.5" /></a>
                        <a href={wa(e.phone)} target="_blank" rel="noreferrer" className="rounded-md border border-border p-1.5 text-emerald-600 hover:bg-muted" title="WhatsApp"><MessageCircle className="h-3.5 w-3.5" /></a>
                      </>
                    )}
                    {e.status === "New" && (
                      <button onClick={() => updateEnquiry(e.id, { status: "Contacted" })} className="rounded-md border border-border p-1.5 hover:bg-muted" title="Mark contacted"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                    )}
                    <button onClick={() => { if (confirm("Delete enquiry?")) deleteEnquiry(e.id); }} className="rounded-md border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No enquiries match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && <EnquiryDialog enquiry={viewing} onClose={() => setViewing(null)} />}
    </AdminShell>
  );
}

function EnquiryDialog({ enquiry, onClose }: { enquiry: Enquiry; onClose: () => void }) {
  const current = useEnquiriesStore().enquiries.find((e) => e.id === enquiry.id) ?? enquiry;
  const agents = useAllAgents().filter((a) => a.status === "Approved");
  const assignedAgent = agents.find((a) => a.id === current.agentId);
  const [note, setNote] = useState("");
  const wa = `https://wa.me/91${current.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
    `Hi ${current.name}, this is ${SITE.brand} regarding your enquiry for ${current.service || current.category}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card shadow-lift sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{current.id} · {current.source}</div>
            <h3 className="text-lg font-black">{current.name || "Unnamed enquiry"}</h3>
          </div>
          <button onClick={onClose} className="rounded-md border border-border p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Phone" value={current.phone} />
            <Info label="Email" value={current.email} />
            <Info label="Service Category" value={current.category} />
            <Info label="Service Required" value={current.service} />
            <Info label="Location" value={current.location} />
            <Info label="Preferred Date" value={current.preferredDate} />
            <Info label="Submitted" value={new Date(current.createdAt).toLocaleString()} />
          </div>

          {current.message && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Message</div>
              <p className="mt-1 rounded-xl border border-border bg-background p-3 text-sm">{current.message}</p>
            </div>
          )}

          {current.agreement && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" /> Customer Agreement
              </div>
              <div className="mt-2 grid gap-1.5 text-xs text-emerald-900 sm:grid-cols-2">
                <div><b>Customer Accepted Through:</b> {current.agreement.acceptedVia}</div>
                <div><b>Terms Accepted:</b> Yes</div>
                <div><b>OTP Status:</b> {current.agreement.otpStatus}</div>
                <div><b>Accepted Date &amp; Time:</b> {new Date(current.agreement.acceptedAt).toLocaleString()}</div>
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</div>
            <select
              value={current.status}
              onChange={(ev) => updateEnquiry(current.id, { status: ev.target.value as EnquiryStatus })}
              className={`mt-1 rounded-lg px-3 py-2 text-xs font-bold ${STATUS_STYLES[current.status]}`}
            >
              {ENQUIRY_STATUSES.map((s) => <option key={s} value={s} className="bg-background text-foreground">{s}</option>)}
            </select>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Registered Service Partner / Technician</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <select
                value={current.agentId ?? ""}
                onChange={(ev) => assignEnquiryToAgent(current.id, ev.target.value || undefined)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold outline-none"
              >
                <option value="">— Unassigned —</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id}) · {a.skills.slice(0, 2).join(", ")}
                  </option>
                ))}
              </select>
              {assignedAgent && (
                <span className="text-[11px] text-muted-foreground">
                  📞 {assignedAgent.phone} · Assigned {current.assignedAt ? new Date(current.assignedAt).toLocaleString() : "—"}
                </span>
              )}
              {agents.length === 0 && (
                <span className="text-[11px] text-muted-foreground">No approved registered service partners yet. Approve them from the Registered Service Partners page.</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Internal Notes
            </div>
            <ul className="mt-2 space-y-2">
              {current.notes.length === 0 && <li className="text-xs text-muted-foreground">No notes yet.</li>}
              {current.notes.map((n) => (
                <li key={n.id} className="rounded-lg border border-border bg-background p-3 text-sm">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1">{n.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Add a note..." className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none" />
              <button
                onClick={() => { if (note.trim()) { addNote(current.id, note.trim()); setNote(""); } }}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >Add</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {current.phone && (
              <>
                <a href={`tel:${current.phone}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"><Phone className="h-3.5 w-3.5" /> Call</a>
                <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
              </>
            )}
            <button
              onClick={() => { if (confirm("Delete enquiry?")) { deleteEnquiry(current.id); onClose(); } }}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-destructive/30 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
            ><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold break-words">{value || "—"}</div>
    </div>
  );
}