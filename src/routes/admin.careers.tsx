import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Briefcase, Search, Download, Trash2, Phone, MessageCircle, Mail, Eye, X, Loader2, FileText,
} from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  listCareerApplications, updateCareerStatus, deleteCareerApplication, signedUrlFor,
  APPLICATION_STATUSES, type ApplicationStatus, type CareerApplication,
} from "@/lib/careers";

export const Route = createFileRoute("/admin/careers")({
  component: AdminCareers,
});

function AdminCareers() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selected, setSelected] = useState<CareerApplication | null>(null);

  useEffect(() => {
    if (!isAdminAuthed()) { navigate({ to: "/admin" }); return; }
    void refresh();
  }, [navigate]);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listCareerApplications();
      setRows(data);
    } catch (err) {
      console.error("[admin.careers] listCareerApplications failed:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter && r.application_status !== statusFilter) return false;
      if (typeFilter && r.candidate_type !== typeFilter) return false;
      if (q) {
        const s = q.toLowerCase();
        return [r.full_name, r.application_reference, r.mobile_number, r.email, r.position_applied_for]
          .some((v) => String(v ?? "").toLowerCase().includes(s));
      }
      return true;
    });
  }, [rows, q, statusFilter, typeFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Total: rows.length };
    for (const s of APPLICATION_STATUSES) c[s] = 0;
    for (const r of rows) if (r.application_status) c[r.application_status] = (c[r.application_status] ?? 0) + 1;
    return c;
  }, [rows]);

  return (
    <AdminShell title="Careers Management" subtitle="Review and manage job applications">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {["Total","New","Under Review","Shortlisted","Interview Scheduled","Selected","Rejected"].map((k) => (
          <div key={k} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground">{k}</p>
            <p className="mt-1 text-2xl font-black text-primary">{counts[k] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, reference, mobile, email…"
            className="w-full rounded-lg border border-border bg-card px-9 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option value="">All Types</option>
          <option value="fresher">Fresher</option>
          <option value="experienced">Experienced</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              {["Reference","Candidate","Type","Position","Location","Mobile","Submitted","Status","Actions"].map((h) => (
                <th key={h} className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">No applications yet.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-xs">{r.application_reference}</td>
                <td className="px-3 py-2 font-semibold">{r.full_name}</td>
                <td className="px-3 py-2 capitalize">{r.candidate_type}</td>
                <td className="px-3 py-2">{r.position_applied_for}{r.custom_position ? ` — ${r.custom_position}` : ""}</td>
                <td className="px-3 py-2">{r.preferred_job_location}</td>
                <td className="px-3 py-2">{r.mobile_number}</td>
                <td className="px-3 py-2 text-xs">{(r as any).submitted_at ? new Date((r as any).submitted_at).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2">
                  <select value={r.application_status ?? "New"} onChange={async (e) => {
                    await updateCareerStatus(r.id!, e.target.value as ApplicationStatus);
                    await refresh();
                  }} className="rounded border border-border bg-card px-2 py-1 text-xs">
                    {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setSelected(r)} title="View" className="rounded p-1.5 hover:bg-muted"><Eye className="h-4 w-4" /></button>
                    <a href={`tel:${r.mobile_number}`} title="Call" className="rounded p-1.5 hover:bg-muted"><Phone className="h-4 w-4" /></a>
                    <a href={`https://wa.me/91${r.mobile_number}`} target="_blank" rel="noreferrer" title="WhatsApp" className="rounded p-1.5 hover:bg-muted"><MessageCircle className="h-4 w-4" /></a>
                    <a href={`mailto:${r.email}`} title="Email" className="rounded p-1.5 hover:bg-muted"><Mail className="h-4 w-4" /></a>
                    <button onClick={async () => {
                      if (!confirm("Delete this application?")) return;
                      await deleteCareerApplication(r.id!);
                      await refresh();
                    }} title="Delete" className="rounded p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <DetailModal app={selected} onClose={() => setSelected(null)} onChanged={refresh} />}
    </AdminShell>
  );
}

function DetailModal({ app, onClose, onChanged }: { app: CareerApplication; onClose: () => void; onChanged: () => void }) {
  const [note, setNote] = useState((app as any).admin_notes ?? "");
  const docs = (app.documents ?? {}) as Record<string, string | string[]>;
  const docEntries = Object.entries(docs).flatMap(([k, v]) =>
    Array.isArray(v) ? v.map((p, i) => ({ key: `${k}-${i}`, label: `${k} (${i + 1})`, path: p }))
                     : [{ key: k, label: k, path: v as string }],
  );

  const openDoc = async (path: string) => {
    const url = await signedUrlFor(path, 300);
    if (url) window.open(url, "_blank", "noopener");
    else alert("Could not generate signed link.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground">{app.application_reference}</p>
            <h3 className="text-lg font-black text-primary">{app.full_name}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-5 text-sm">
          <Section title="Position">
            <KV k="Applied For" v={`${app.position_applied_for}${app.custom_position ? ` — ${app.custom_position}` : ""}`} />
            <KV k="Location" v={app.preferred_job_location} />
            <KV k="Employment" v={app.employment_type} />
            <KV k="Candidate Type" v={app.candidate_type} />
          </Section>
          <Section title="Personal">
            <KV k="DOB" v={app.date_of_birth} />
            <KV k="Gender" v={app.gender} />
            <KV k="Mobile" v={app.mobile_number} />
            <KV k="Email" v={app.email} />
            <KV k="Address" v={`${app.current_address}${app.city ? ", " + app.city : ""}${app.state ? ", " + app.state : ""}${app.pin_code ? " - " + app.pin_code : ""}`} />
          </Section>
          <Section title="Education">
            <KV k="Qualification" v={`${app.highest_qualification}${app.custom_qualification ? ` — ${app.custom_qualification}` : ""}`} />
            <KV k="Course" v={app.course_degree ?? "—"} />
            <KV k="Institution" v={app.institution ?? "—"} />
            <KV k="Year" v={app.year_of_passing ?? "—"} />
            <KV k="Percentage/CGPA" v={app.percentage_cgpa ?? "—"} />
          </Section>
          {app.candidate_type === "experienced" ? (
            <Section title="Experience">
              <KV k="Total" v={`${app.total_experience_years ?? 0}y ${app.total_experience_months ?? 0}m`} />
              <KV k="Company" v={app.current_last_company ?? "—"} />
              <KV k="Title" v={app.current_last_job_title ?? "—"} />
              <KV k="Last Salary" v={app.current_last_salary ? `₹${app.current_last_salary} (${app.salary_period})` : "—"} />
              <KV k="Expected" v={app.expected_salary ? `₹${app.expected_salary} (${app.expected_salary_period})` : "—"} />
              <KV k="Notice" v={app.notice_period ?? "—"} />
              <KV k="Key Skills" v={(app.key_skills ?? []).join(", ") || "—"} />
              <KV k="Reason" v={app.reason_for_leaving ?? "—"} />
            </Section>
          ) : (
            <Section title="Skills">
              <KV k="Technical" v={(app.technical_skills ?? []).join(", ") || "—"} />
              <KV k="Languages" v={(app.languages_known ?? []).join(", ") || "—"} />
            </Section>
          )}
          <Section title="Documents">
            {docEntries.length === 0 ? <p className="text-muted-foreground">No documents uploaded.</p> : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {docEntries.map((d) => (
                  <li key={d.key}>
                    <button onClick={() => openDoc(d.path)} className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-left text-xs font-semibold text-primary hover:bg-muted">
                      <FileText className="h-4 w-4" /> <span className="truncate">{d.label}</span> <Download className="ml-auto h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <Section title="Admin Notes">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
            <button onClick={async () => {
              await updateCareerStatus(app.id!, app.application_status ?? "New", note);
              onChanged();
            }} className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Save Note</button>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-primary">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="grid grid-cols-[130px_1fr] gap-2 text-xs"><span className="font-bold text-muted-foreground">{k}</span><span className="text-foreground">{v}</span></div>;
}