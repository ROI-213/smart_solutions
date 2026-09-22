import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, CheckCircle2, XCircle, PauseCircle, Trash2, Eye, X, Phone, Mail, MapPin, ShieldCheck, HardHat, FileText, Download, RotateCcw, MessageCircle } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import {
  useAllAgents, approveAgent, rejectAgent, suspendAgent, deleteAgent, updateAgent, updateDocumentStatus,
  AGENT_STATUSES, DOCUMENT_LABEL, DOCUMENT_STATUSES, APPROVAL_STATUSES,
  type Agent, type AgentStatus, type DocumentType, type DocumentStatus, type ApprovalStatus,
} from "@/lib/agents-store";
import { useEnquiriesStore } from "@/lib/enquiries-store";

export const Route = createFileRoute("/admin/agents")({
  head: () => ({ meta: [{ title: "Registered Service Partners — Admin" }] }),
  component: AgentsPage,
});

const STATUS_COLOR: Record<AgentStatus, string> = {
  Pending: "bg-amber-500 text-white",
  Approved: "bg-emerald-500 text-white",
  Rejected: "bg-destructive text-destructive-foreground",
  Suspended: "bg-muted text-foreground",
};

function AgentsPage() {
  const agents = useAllAgents();
  const { enquiries } = useEnquiriesStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | AgentStatus>("All");
  const [viewing, setViewing] = useState<Agent | null>(null);

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return agents.filter((a) =>
      (filter === "All" || a.status === filter) &&
      (ql === "" || [a.name, a.phone, a.email, a.id, ...(a.skills ?? []), a.city ?? ""].join(" ").toLowerCase().includes(ql))
    );
  }, [agents, q, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Total: agents.length };
    for (const s of AGENT_STATUSES) c[s] = agents.filter((a) => a.status === s).length;
    return c;
  }, [agents]);

  const jobCountFor = (id: string) => enquiries.filter((e) => e.agentId === id).length;

  return (
    <AdminShell title="Registered Service Partners / Technicians" subtitle="Approve, reject, and manage registered service partners.">
      <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(["Total", ...AGENT_STATUSES] as const).map((k) => (
          <div key={k} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero text-primary-foreground">
              <HardHat className="h-4 w-4" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="mt-0.5 text-2xl font-black text-primary">{counts[k] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, skill, city..." className="w-full bg-transparent text-sm outline-none" />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-border p-1">
          {(["All", ...AGENT_STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Registered Service Partner</th>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-left">Skills</th>
              <th className="px-3 py-2 text-left">City</th>
              <th className="px-3 py-2 text-left">Jobs</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Registered</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-border align-top">
                <td className="px-3 py-3">
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">{a.id}</div>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">
                  <div>{a.phone}</div>
                  <div>{a.email}</div>
                </td>
                <td className="px-3 py-3 text-xs">{(a.skills ?? []).slice(0, 3).join(", ")}{a.skills && a.skills.length > 3 ? "…" : ""}</td>
                <td className="px-3 py-3 text-muted-foreground">{a.city || "—"}</td>
                <td className="px-3 py-3 font-bold text-primary">{jobCountFor(a.id)}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_COLOR[a.status]}`}>{a.status}</span>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setViewing(a)} className="rounded-md border border-border p-1.5 hover:bg-muted" title="View"><Eye className="h-3.5 w-3.5" /></button>
                    {a.phone && (
                      <>
                        <a href={`tel:${a.phone}`} className="rounded-md border border-border p-1.5 hover:bg-muted" title={`Call ${a.phone}`}><Phone className="h-3.5 w-3.5" /></a>
                        <a
                          href={`https://wa.me/91${a.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi ${a.name}, this is Smart Solutions Groups.`)}`}
                          target="_blank" rel="noreferrer"
                          className="rounded-md border border-emerald-300 p-1.5 text-emerald-600 hover:bg-emerald-50"
                          title={`WhatsApp ${a.phone}`}
                        ><MessageCircle className="h-3.5 w-3.5" /></a>
                      </>
                    )}
                    {a.status !== "Approved" && (
                      <button onClick={() => approveAgent(a.id)} className="rounded-md border border-emerald-300 p-1.5 text-emerald-700 hover:bg-emerald-50" title="Approve"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                    )}
                    {a.status !== "Rejected" && (
                      <button onClick={() => { const r = prompt("Rejection reason?") || undefined; rejectAgent(a.id, r); }} className="rounded-md border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10" title="Reject"><XCircle className="h-3.5 w-3.5" /></button>
                    )}
                    {a.status === "Approved" && (
                      <button onClick={() => suspendAgent(a.id)} className="rounded-md border border-border p-1.5 hover:bg-muted" title="Suspend"><PauseCircle className="h-3.5 w-3.5" /></button>
                    )}
                    <button onClick={() => { if (confirm(`Delete registered service partner ${a.name}?`)) deleteAgent(a.id); }} className="rounded-md border border-destructive/30 p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No registered service partners match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && <AgentDialog agent={viewing} onClose={() => setViewing(null)} jobCount={jobCountFor(viewing.id)} />}
    </AdminShell>
  );
}

function AgentDialog({ agent, onClose, jobCount }: { agent: Agent; onClose: () => void; jobCount: number }) {
  const [notes, setNotes] = useState(agent.rejectionReason ?? "");
  const [adminNotes, setAdminNotes] = useState(agent.adminNotes ?? "");
  const [verifiedBy, setVerifiedBy] = useState(agent.verifiedBy ?? "Admin");
  const [agentCode, setAgentCode] = useState(agent.agentCode ?? "");
  const [dateOfJoining, setDateOfJoining] = useState(agent.dateOfJoining ?? "");
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>(agent.documentStatus ?? "Not Submitted");
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>((agent.approvalStatus as ApprovalStatus) ?? "Pending");
  const [aadhaarVerified, setAadhaarVerified] = useState(!!agent.aadhaarVerified);

  function saveVerification() {
    updateAgent(agent.id, {
      adminNotes, verifiedBy, agentCode, dateOfJoining,
      documentStatus, approvalStatus, aadhaarVerified,
      idVerified: aadhaarVerified,
      verifiedDate: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-border bg-card shadow-lift sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{agent.id}</div>
            <h3 className="text-lg font-black">{agent.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_COLOR[agent.status]}`}>{agent.status}</span>
            <button onClick={onClose} className="rounded-md border border-border p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info Icon={Phone} label="Phone" value={agent.phone} />
            <Info label="Alternate Mobile" value={agent.alternateMobile} />
            <Info Icon={Mail} label="Email" value={agent.email} />
            <Info Icon={MapPin} label="City / Pincode" value={[agent.city, agent.pincode].filter(Boolean).join(" · ")} />
            <Info Icon={ShieldCheck} label="Jobs Assigned" value={String(jobCount)} />
            <Info label="Gender / DOB" value={[agent.gender, agent.dob].filter(Boolean).join(" · ")} />
            <Info label="Registered" value={new Date(agent.createdAt).toLocaleString()} />
            <Info label="Current Address" value={agent.address} full />
            <Info label="Permanent Address" value={agent.permanentAddress} full />
          </div>

          <Section title="Work">
            <Info label="Service Category" value={agent.serviceCategory} />
            <Info label="Skills" value={(agent.skills ?? []).join(", ")} full />
            <Info label="Experience" value={agent.experienceYears ? `${agent.experienceYears} years` : "—"} />
            <Info label="Experience Details" value={agent.experienceDetails} full />
            <Info label="Previous Company / Client" value={agent.previousCompany} />
            <Info label="Previous Work Reference" value={agent.previousWorkReference} />
            <Info label="Preferred Location" value={agent.preferredLocation} />
            <Info label="Available Hours" value={agent.availableHours} />
            <Info label="Tools Available" value={agent.toolsAvailable} full />
            <Info label="Workers Under Registered Service Partner" value={agent.workersCount != null ? String(agent.workersCount) : "—"} />
            <Info label="Languages" value={(agent.languages ?? []).join(", ")} />
          </Section>

          <Section title="Bank / Payout">
            <Info label="Holder Name" value={agent.bankHolderName} />
            <Info label="Bank" value={agent.bankName} />
            <Info label="Account" value={agent.bankAccount} />
            <Info label="IFSC" value={agent.ifsc} />
            <Info label="UPI" value={agent.upi} />
            <Info label="Payment Notes" value={agent.paymentNotes} full />
          </Section>

          <Section title="KYC">
            <Info label="Aadhaar" value={agent.aadhaar} />
            <Info label="PAN" value={agent.pan} />
            <Info label="Driving Licence" value={agent.drivingLicence} />
            <Info label="Voter ID" value={agent.voterId} />
            <Info label="ID Notes" value={agent.idProofNote} full />
          </Section>

          <Section title="Safety & Vehicle">
            <Info label="Police Verification" value={agent.policeVerified ? "Agreed" : "Not agreed"} />
            <Info label="Emergency Contact" value={agent.emergencyContactName} />
            <Info label="Emergency Phone" value={agent.emergencyContactPhone} />
            <Info label="Relationship" value={agent.emergencyRelation} />
            <Info label="Uses Vehicle" value={agent.usesVehicle ? "Yes" : "No"} />
            <Info label="Vehicle Type" value={agent.vehicleType} />
            <Info label="Vehicle Number" value={agent.vehicleNumber} />
          </Section>

          <Section title="Terms & Consent">
            <Info label="Terms Accepted" value={agent.termsAccepted ? "Yes" : "No"} />
            <Info label="Accepted At" value={agent.termsAcceptedAt ? new Date(agent.termsAcceptedAt).toLocaleString() : "—"} />
            <Info label="Consent" value={agent.consentAccepted ? "Yes" : "No"} />
            <Info label="Method" value={agent.agreementAcceptanceMethod} full />
          </Section>

          {/* Documents */}
          <div>
            <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Uploaded Documents ({(agent.documents ?? []).length})</div>
            {(agent.documents ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No documents uploaded.</div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {(agent.documents ?? []).map((d) => (
                  <div key={d.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-center gap-2">
                      {d.mime.startsWith("image/") ? (
                        <img src={d.dataUrl} alt={d.name} className="h-12 w-12 rounded-md object-cover" />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-md bg-rose-50 text-rose-600"><FileText className="h-5 w-5" /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-black text-[#0B2E59]">{DOCUMENT_LABEL[d.type as DocumentType] ?? d.type}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{d.name} · {(d.size / 1024).toFixed(0)} KB</div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${d.status === "Verified" ? "bg-emerald-100 text-emerald-700" : d.status === "Rejected" ? "bg-rose-100 text-rose-700" : d.status === "Reupload Required" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{d.status}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <a href={d.dataUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-bold hover:bg-muted"><Eye className="h-3 w-3" /> View</a>
                      <a href={d.dataUrl} download={d.name} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-bold hover:bg-muted"><Download className="h-3 w-3" /> Download</a>
                      <button onClick={() => updateDocumentStatus(agent.id, d.id, "Verified")} className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Verify</button>
                      <button onClick={() => { const n = prompt("Rejection note?") || undefined; updateDocumentStatus(agent.id, d.id, "Rejected", n); }} className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700"><XCircle className="h-3 w-3" /> Reject</button>
                      <button onClick={() => { const n = prompt("Reupload note?") || undefined; updateDocumentStatus(agent.id, d.id, "Reupload Required", n); }} className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700"><RotateCcw className="h-3 w-3" /> Reupload</button>
                    </div>
                    {d.adminNotes && <p className="mt-1 truncate text-[10px] text-muted-foreground">Note: {d.adminNotes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification panel */}
          <div className="rounded-2xl border border-border bg-background p-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Verification Records</div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <SelectBox label="Approval Status" value={approvalStatus} onChange={(v) => setApprovalStatus(v as ApprovalStatus)} options={APPROVAL_STATUSES as unknown as string[]} />
              <SelectBox label="Document Status" value={documentStatus} onChange={(v) => setDocumentStatus(v as DocumentStatus)} options={DOCUMENT_STATUSES as unknown as string[]} />
              <TextBox label="Registered Service Partner Code / Technician ID" value={agentCode} onChange={setAgentCode} />
              <TextBox label="Date of Joining" type="date" value={dateOfJoining ? dateOfJoining.slice(0, 10) : ""} onChange={setDateOfJoining} />
              <TextBox label="Verified By" value={verifiedBy} onChange={setVerifiedBy} />
              <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs">
                <input type="checkbox" checked={aadhaarVerified} onChange={(e) => setAadhaarVerified(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                Aadhaar / ID Verified
              </label>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Admin Notes</div>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none" />
            </div>
            <button onClick={saveVerification} className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Save Verification</button>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Admin Note / Rejection Reason</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              placeholder="Optional note visible when rejecting..."
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <button onClick={() => { approveAgent(agent.id); onClose(); }} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
            <button onClick={() => { rejectAgent(agent.id, notes); onClose(); }} className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground"><XCircle className="h-3.5 w-3.5" /> Reject</button>
            {agent.status === "Approved" && (
              <button onClick={() => { suspendAgent(agent.id); onClose(); }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold"><PauseCircle className="h-3.5 w-3.5" /> Suspend</button>
            )}
            {agent.status !== "Pending" && (
              <button onClick={() => { updateAgent(agent.id, { status: "Pending", rejectionReason: undefined }); onClose(); }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold">Reset to Pending</button>
            )}
            <button onClick={() => { if (confirm(`Delete registered service partner ${agent.name}?`)) { deleteAgent(agent.id); onClose(); } }} className="ml-auto inline-flex items-center gap-2 rounded-full border border-destructive/30 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectBox({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function TextBox({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none" />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="grid gap-3 rounded-xl border border-border bg-background p-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Info({ label, value, Icon, full }: { label: string; value?: string; Icon?: any; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </div>
      <div className="mt-0.5 break-words text-sm font-semibold">{value || "—"}</div>
    </div>
  );
}