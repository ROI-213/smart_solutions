import { createFileRoute } from "@tanstack/react-router";
import { AgentShell } from "@/components/site/AgentShell";
import { useAgentAuth } from "@/lib/agents-store";

export const Route = createFileRoute("/agent/profile")({
  head: () => ({ meta: [{ title: "My Profile — Registered Service Partner Portal" }] }),
  component: AgentProfile,
});

function AgentProfile() {
  const { agent, ready } = useAgentAuth();
  if (!ready || !agent) return null;

  return (
    <AgentShell agent={agent} title="My Profile" subtitle="Details submitted during registration.">
      <div className="space-y-6">
        <Section title="Basic Details">
          <Row k="Full Name" v={agent.name} />
          <Row k="Registered Service Partner ID" v={agent.id} />
          <Row k="Phone" v={agent.phone} />
          <Row k="Email" v={agent.email} />
          <Row k="Gender" v={agent.gender} />
          <Row k="Date of Birth" v={agent.dob} />
          <Row k="City" v={agent.city} />
          <Row k="Pincode" v={agent.pincode} />
          <Row k="Address" v={agent.address} full />
        </Section>

        <Section title="Work Details">
          <Row k="Skills" v={agent.skills.join(", ")} full />
          <Row k="Experience" v={agent.experienceYears ? `${agent.experienceYears} years` : "—"} />
          <Row k="Languages" v={(agent.languages ?? []).join(", ")} />
          <Row k="Working Areas" v={agent.workingAreas} full />
        </Section>

        <Section title="Bank / Payout">
          <Row k="Bank" v={agent.bankName} />
          <Row k="Account" v={agent.bankAccount ? `••••${agent.bankAccount.slice(-4)}` : "—"} />
          <Row k="IFSC" v={agent.ifsc} />
          <Row k="UPI" v={agent.upi} />
        </Section>

        <Section title="ID / KYC">
          <Row k="Aadhaar" v={agent.aadhaar ? `••••${agent.aadhaar.slice(-4)}` : "—"} />
          <Row k="PAN" v={agent.pan} />
          <Row k="Notes" v={agent.idProofNote} full />
        </Section>

        <Section title="Safety">
          <Row k="Police Verification" v={agent.policeVerified ? "Agreed" : "Not agreed"} />
          <Row k="Emergency Contact" v={agent.emergencyContactName} />
          <Row k="Emergency Phone" v={agent.emergencyContactPhone} />
        </Section>

        <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          To update your details, please contact admin at{" "}
          <a className="font-semibold text-primary" href="mailto:admin@smartsolutions.co.in">admin@smartsolutions.co.in</a>.
        </div>
      </div>
    </AgentShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="grid gap-3 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Row({ k, v, full }: { k: string; v?: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-0.5 break-words text-sm font-semibold">{v || "—"}</div>
    </div>
  );
}