import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Phone, MessageCircle, Mail, Trash2, X, Search, Eye, CheckCircle2, Clock,
  Inbox, Loader2, AlertCircle,
} from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import {
  useContactEnquiries,
  updateContactEnquiry,
  deleteContactEnquiry,
  CONTACT_STATUSES,
  type ContactEnquiry,
  type ContactStatus,
} from "@/lib/contact-enquiries";

export const Route = createFileRoute("/admin/contact")({
  head: () => ({ meta: [{ title: "Contact Management — Admin" }] }),
  component: ContactManagement,
});

function ContactManagement() {
  const { enquiries, loading, error, refresh } = useContactEnquiries();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ContactStatus>("All");
  const [dateFilter, setDateFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const subj = subjectFilter.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (statusFilter !== "All" && e.status !== statusFilter) return false;
      if (dateFilter && !e.createdAt.startsWith(dateFilter)) return false;
      if (subj && !(e.subject ?? "").toLowerCase().includes(subj)) return false;
      if (!q) return true;
      return (
        e.fullName.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        (e.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [enquiries, query, statusFilter, dateFilter, subjectFilter]);

  const counts = useMemo(() => ({
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === "New").length,
    inProgress: enquiries.filter((e) => e.status === "In Progress").length,
    resolved: enquiries.filter((e) => e.status === "Resolved").length,
  }), [enquiries]);

  return (
    <AdminShell title="Contact Management" subtitle="Enquiries submitted via the Contact Us page.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total" value={counts.total} Icon={Inbox} />
        <Stat label="New" value={counts.new} Icon={AlertCircle} tone="accent" />
        <Stat label="In Progress" value={counts.inProgress} Icon={Clock} />
        <Stat label="Resolved" value={counts.resolved} Icon={CheckCircle2} tone="secondary" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email"
            className="w-full rounded-xl border border-border bg-background px-9 py-2.5 text-sm outline-none focus:border-primary-glow"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "All" | ContactStatus)} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
          <option value="All">All statuses</option>
          {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
        <input value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} placeholder="Filter by subject" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <div>
            <div className="font-semibold">Couldn't load enquiries.</div>
            <div className="text-xs opacity-80">{error}</div>
          </div>
          <button onClick={() => void refresh()} className="ml-auto rounded-md border border-destructive/40 px-2 py-1 text-xs font-bold">Retry</button>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <Th>Name</Th><Th>Phone</Th><Th>Email</Th><Th>Subject</Th>
              <Th>Message</Th><Th>Status</Th><Th>Submitted</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No enquiries found.</td></tr>
            ) : filtered.map((e) => (
              <tr key={e.id} className="border-t border-border align-top">
                <Td className="font-semibold">{e.fullName}</Td>
                <Td>{e.phone}</Td>
                <Td className="break-all">{e.email || "—"}</Td>
                <Td className="max-w-[220px]">{e.subject || "—"}</Td>
                <Td className="max-w-[260px] text-muted-foreground">{truncate(e.message, 80)}</Td>
                <Td>
                  <select
                    value={e.status}
                    onChange={async (ev) => {
                      const next = ev.target.value as ContactStatus;
                      try { await updateContactEnquiry(e.id, { status: next }, e.sourceTable); await refresh(); }
                      catch (err) { alert("Failed to update status."); console.error(err); }
                    }}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold"
                  >
                    {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Td>
                <Td className="whitespace-nowrap text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <IconLink title="View / Edit" onClick={() => setSelected(e)} Icon={Eye} />
                    <IconLink title="Call" href={`tel:${e.phone}`} Icon={Phone} />
                    <IconLink title="WhatsApp" href={waHref(e.phone)} external Icon={MessageCircle} tone="secondary" />
                    {e.email && <IconLink title="Email" href={`mailto:${e.email}`} Icon={Mail} />}
                    <IconLink
                      title="Delete"
                      onClick={async () => {
                        if (!confirm(`Delete enquiry from ${e.fullName}?`)) return;
                        try { await deleteContactEnquiry(e.id, e.sourceTable); await refresh(); }
                        catch (err) { alert("Delete failed. Please try again."); console.error(err); }
                      }}
                      Icon={Trash2}
                      tone="destructive"
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <DetailDrawer
          enquiry={selected}
          onClose={() => setSelected(null)}
          onSaved={async () => { await refresh(); }}
        />
      )}
    </AdminShell>
  );
}

function DetailDrawer({ enquiry, onClose, onSaved }: { enquiry: ContactEnquiry; onClose: () => void; onSaved: () => Promise<void> }) {
  const [status, setStatus] = useState<ContactStatus>(enquiry.status);
  const [notes, setNotes] = useState(enquiry.adminNotes ?? "");
  const [fullName, setFullName] = useState(enquiry.fullName);
  const [phone, setPhone] = useState(enquiry.phone);
  const [email, setEmail] = useState(enquiry.email ?? "");
  const [subject, setSubject] = useState(enquiry.subject ?? "");
  const [message, setMessage] = useState(enquiry.message);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function save(next?: Partial<{ status: ContactStatus }>) {
    setSaving(true); setErr(null); setOkMsg(null);
    try {
      const nextStatus = next?.status ?? status;
      await updateContactEnquiry(
        enquiry.id,
        {
          status: nextStatus,
          adminNotes: notes,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() ? email.trim() : null,
          subject: subject.trim() ? subject.trim() : null,
          message: message.trim(),
        },
        enquiry.sourceTable,
      );
      if (next?.status) setStatus(next.status);
      await onSaved();
      setOkMsg("Saved.");
    } catch (e) {
      console.error(e);
      setErr("Failed to save. Please try again.");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-card p-6 shadow-lift sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Edit Enquiry</div>
            <h2 className="text-xl font-black">{fullName || "Enquiry"}</h2>
            <div className="mt-1 text-xs text-muted-foreground">{new Date(enquiry.createdAt).toLocaleString()}</div>
          </div>
          <button onClick={onClose} className="rounded-md border border-border p-1.5" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <Field label="Full Name"><input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} /></Field>
          <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Field>
          <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="optional" /></Field>
          <Field label="Subject"><input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} placeholder="optional" /></Field>
          <Field label="Message"><textarea value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputCls} min-h-24`} /></Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={`tel:${enquiry.phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold"><Phone className="h-3.5 w-3.5" /> Call</a>
          <a href={waHref(enquiry.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
          {enquiry.email && <a href={`mailto:${enquiry.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold"><Mail className="h-3.5 w-3.5" /> Email</a>}
        </div>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContactStatus)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              placeholder="Internal notes for the team…"
            />
          </label>

          {err && <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</div>}
          {okMsg && <div className="rounded-xl border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs text-secondary">{okMsg}</div>}

          <div className="flex flex-wrap gap-2">
            <button disabled={saving} onClick={() => save()} className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-card disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
            </button>
            <button disabled={saving} onClick={() => save({ status: "Contacted" })} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold disabled:opacity-50">Mark Contacted</button>
            <button disabled={saving} onClick={() => save({ status: "Resolved" })} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold disabled:opacity-50">Mark Resolved</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value, Icon, tone }: { label: string; value: number; Icon: React.ComponentType<{ className?: string }>; tone?: "accent" | "secondary" }) {
  const bg = tone === "accent" ? "bg-accent/10 text-accent" : tone === "secondary" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${bg}`}><Icon className="h-4 w-4" /></div>
      </div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ContactStatus }) {
  const map: Record<ContactStatus, string> = {
    New: "bg-accent/15 text-accent",
    "In Progress": "bg-primary/15 text-primary",
    Contacted: "bg-amber-500/15 text-amber-600",
    Resolved: "bg-secondary/15 text-secondary",
    Closed: "bg-muted-foreground/15 text-muted-foreground",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${map[status]}`}>{status}</span>;
}

function IconLink({ title, href, external, onClick, Icon, tone }: {
  title: string; href?: string; external?: boolean; onClick?: () => void;
  Icon: React.ComponentType<{ className?: string }>; tone?: "destructive" | "secondary";
}) {
  const cls = `inline-flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors ${
    tone === "destructive" ? "text-destructive hover:bg-destructive/10" :
    tone === "secondary" ? "text-secondary hover:bg-secondary/10" :
    "text-foreground hover:bg-muted"
  }`;
  if (href) return <a title={title} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={cls}><Icon className="h-4 w-4" /></a>;
  return <button title={title} onClick={onClick} className={cls}><Icon className="h-4 w-4" /></button>;
}

function Th({ children }: { children: React.ReactNode }) { return <th className="px-3 py-2 font-semibold">{children}</th>; }
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <td className={`px-3 py-3 ${className}`}>{children}</td>; }
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}
const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary-glow";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n) + "…" : s; }
function waHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const withCc = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCc}`;
}
