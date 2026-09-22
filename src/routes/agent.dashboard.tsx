import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Phone, MessageCircle, MapPin, Calendar, CheckCircle2, Clock, AlertCircle, FileText, Download, Upload as UploadIcon } from "lucide-react";
import { AgentShell } from "@/components/site/AgentShell";
import { useAgentAuth, addOrReplaceDocument, DOCUMENT_LABEL, type DocumentType } from "@/lib/agents-store";
import { useEnquiriesStore, updateEnquiry, type EnquiryStatus } from "@/lib/enquiries-store";
import { UploadField, type UploadedFile } from "@/components/site/UploadField";

export const Route = createFileRoute("/agent/dashboard")({
  head: () => ({ meta: [{ title: "My Jobs — Registered Service Partner Portal" }] }),
  component: AgentDashboard,
});

function AgentDashboard() {
  const { agent, ready } = useAgentAuth();
  const { enquiries } = useEnquiriesStore();
  const [filter, setFilter] = useState<"All" | "Active" | "Completed">("Active");

  const jobs = useMemo(() => {
    if (!agent) return [];
    const mine = enquiries.filter((e) => e.agentId === agent.id);
    if (filter === "Active") return mine.filter((e) => e.status !== "Completed" && e.status !== "Rejected");
    if (filter === "Completed") return mine.filter((e) => e.status === "Completed");
    return mine;
  }, [enquiries, agent, filter]);

  if (!ready || !agent) return null;

  if (agent.status !== "Approved") {
    return (
      <AgentShell agent={agent} title="My Jobs">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700">
            {agent.status === "Pending" ? <Clock className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          </div>
          <h3 className="text-lg font-black text-amber-900">
            {agent.status === "Pending"
              ? "Your registration is pending approval"
              : agent.status === "Rejected"
              ? "Your registration was rejected"
              : "Your account has been suspended"}
          </h3>
          <p className="mt-2 text-sm text-amber-900/80">
            {agent.status === "Pending"
              ? "Our admin team is reviewing your details. You will be able to accept jobs once approved."
              : agent.status === "Rejected"
              ? agent.rejectionReason || "Please contact support for details."
              : "Please contact support to reactivate your account."}
          </p>
        </div>
      </AgentShell>
    );
  }

  const counts = {
    total: enquiries.filter((e) => e.agentId === agent.id).length,
    active: enquiries.filter((e) => e.agentId === agent.id && e.status !== "Completed" && e.status !== "Rejected").length,
    done: enquiries.filter((e) => e.agentId === agent.id && e.status === "Completed").length,
  };

  return (
    <AgentShell agent={agent} title="My Jobs" subtitle="Jobs assigned to you by the admin team.">
      <VerificationCard agent={agent} />
      <DocumentsCard agent={agent} />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Total Jobs" value={counts.total} />
        <Stat label="Active" value={counts.active} />
        <Stat label="Completed" value={counts.done} tone="emerald" />
      </div>

      <div className="mb-4 flex gap-1 rounded-xl border border-border p-1">
        {(["Active", "Completed", "All"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {jobs.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No jobs in this category yet.
          </div>
        )}
        {jobs.map((j) => (
          <div key={j.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{j.id} · {j.category}</div>
                <h3 className="mt-0.5 text-base font-black text-primary">{j.service || "Service Request"}</h3>
                <div className="mt-1 text-sm font-semibold">{j.name}</div>
              </div>
              <StatusBadge status={j.status} />
            </div>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              {j.location && <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {j.location}</div>}
              {j.preferredDate && <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Preferred: {j.preferredDate}</div>}
            </div>
            {j.message && (
              <p className="mt-2 rounded-lg bg-muted p-2 text-xs text-foreground">{j.message}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {j.phone && (
                <>
                  <a href={`tel:${j.phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                  <a
                    href={`https://wa.me/91${j.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi ${j.name}, this is your Smart Solutions Groups technician for ${j.service}.`)}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </>
              )}
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">Update:</span>
                <select
                  value={j.status}
                  onChange={(ev) => updateEnquiry(j.id, { status: ev.target.value as EnquiryStatus })}
                  className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-bold"
                >
                  {(["Contacted", "In Progress", "Completed"] as const).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AgentShell>
  );
}

function VerificationCard({ agent }: { agent: any }) {
  const rows: Array<{ k: string; v: string; ok: boolean }> = [
    { k: "Approval Status", v: agent.approvalStatus ?? agent.status ?? "Pending", ok: agent.status === "Approved" },
    { k: "Document Verification", v: agent.documentStatus ?? "Not Submitted", ok: agent.documentStatus === "Verified" },
    { k: "Mobile OTP", v: agent.mobileVerified ? "Verified" : "Not verified", ok: !!agent.mobileVerified },
    { k: "Aadhaar / ID", v: agent.aadhaarVerified ? "Verified" : "Pending admin review", ok: !!agent.aadhaarVerified },
    { k: "Registered Service Partner Code", v: agent.agentCode ?? "—", ok: !!agent.agentCode },
    { k: "Terms Accepted", v: agent.termsAccepted ? "Accepted" : "Not accepted", ok: !!agent.termsAccepted },
  ];
  return (
    <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verification Status</div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.k}</div>
              <div className="text-xs font-bold text-[#0B2E59]">{r.v}</div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${r.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {r.ok ? "OK" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsCard({ agent }: { agent: any }) {
  const [reupType, setReupType] = useState<DocumentType | null>(null);
  const docs = (agent.documents ?? []) as Array<any>;
  function handleReupload(f: UploadedFile | null) {
    if (!f || !reupType) return;
    addOrReplaceDocument(agent.id, { type: reupType, name: f.name, mime: f.mime, size: f.size, dataUrl: f.dataUrl });
    setReupType(null);
  }
  return (
    <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">My Documents</div>
      {docs.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {docs.map((d) => {
            const needs = d.status === "Rejected" || d.status === "Reupload Required";
            return (
              <li key={d.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0B2E59]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold">{DOCUMENT_LABEL[d.type as DocumentType] ?? d.type}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{d.name}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${d.status === "Verified" ? "bg-emerald-100 text-emerald-700" : d.status === "Rejected" ? "bg-rose-100 text-rose-700" : d.status === "Reupload Required" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{d.status}</span>
                  <a href={d.dataUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border p-1.5 hover:bg-muted" title="View"><FileText className="h-3.5 w-3.5" /></a>
                  <a href={d.dataUrl} download={d.name} className="rounded-md border border-border p-1.5 hover:bg-muted" title="Download"><Download className="h-3.5 w-3.5" /></a>
                  {needs && (
                    <button onClick={() => setReupType(d.type)} className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800"><UploadIcon className="mr-1 inline h-3 w-3" />Reupload</button>
                  )}
                </div>
                {d.adminNotes && (
                  <p className="mt-2 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-foreground">Admin note: {d.adminNotes}</p>
                )}
                {reupType === d.type && (
                  <div className="mt-2">
                    <UploadField label={`Replace ${DOCUMENT_LABEL[d.type as DocumentType]}`} value={null} onChange={handleReupload} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "emerald" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-black ${tone === "emerald" ? "text-emerald-600" : "text-primary"}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: EnquiryStatus }) {
  const cls =
    status === "Completed" ? "bg-emerald-500 text-white"
    : status === "In Progress" ? "bg-secondary text-secondary-foreground"
    : status === "Contacted" ? "bg-primary text-primary-foreground"
    : status === "Rejected" ? "bg-destructive text-destructive-foreground"
    : "bg-accent text-accent-foreground";
  const Icon = status === "Completed" ? CheckCircle2 : Clock;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${cls}`}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  );
}