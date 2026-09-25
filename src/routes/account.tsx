import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { User as UserIcon, Phone, Mail, LogOut, Inbox, CalendarClock, MapPin, Tag, FileText } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { useCustomerAuth, signOutCustomer } from "@/lib/customer-auth";
import { useEnquiriesStore, type EnquiryStatus } from "@/lib/enquiries-store";
import { CustomerAuthDialog } from "@/components/site/CustomerAuthDialog";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Smart Solutions Groups" }] }),
  component: AccountPage,
});

const STATUS_TONE: Record<EnquiryStatus, string> = {
  New: "bg-[#F5F7FA] text-[#0B2E59]",
  Contacted: "bg-amber-100 text-amber-700",
  "In Progress": "bg-purple-100 text-purple-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
};

function AccountPage() {
  const { customer, ready } = useCustomerAuth();
  const { enquiries } = useEnquiriesStore();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (ready && !customer) setAuthOpen(true);
  }, [ready, customer]);

  const mine = useMemo(() => {
    if (!customer) return [];
    return enquiries.filter((e) => e.customerId === customer.id || e.phone.replace(/\D/g, "").slice(-10) === customer.phone);
  }, [enquiries, customer]);

  if (!ready) return null;

  if (!customer) {
    return (
      <SiteLayout>
        <PageHeader eyebrow="My Account" title="Login to view your requests" subtitle="Sign in or create an account to submit and track your service requests." />
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <button type="button" onClick={() => setAuthOpen(true)} className="rounded-full bg-gradient-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-card">
            Login / Sign up
          </button>
        </section>
        <CustomerAuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={() => {}} />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="My Account" title={`Welcome, ${customer.name}`} subtitle="View your profile and track every service request in one place." />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[320px_1fr]">
        {/* Profile card */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
            <UserIcon className="h-6 w-6" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer ID</div>
          <div className="font-mono text-sm font-bold text-primary">{customer.id}</div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><UserIcon className="h-4 w-4 text-muted-foreground" /> {customer.name}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {customer.phone ? `+91 ${customer.phone}` : "Mobile not linked"}</div>
            <div className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 text-muted-foreground" /> {customer.email}</div>
          </div>
          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700">
            OTP verified · Joined {new Date(customer.createdAt).toLocaleDateString()}
          </div>
          <button
            type="button"
            onClick={() => { signOutCustomer(); navigate({ to: "/" }); }}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        {/* Requests */}
        <main>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black text-primary">
                <Inbox className="h-5 w-5" /> My Service Requests
              </h2>
              <p className="text-xs text-muted-foreground">{mine.length} request{mine.length === 1 ? "" : "s"} submitted</p>
            </div>
            <Link to="/services" className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
              New Request
            </Link>
          </div>

          {mine.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">You haven't submitted any service requests yet.</p>
              <Link to="/contact-us" className="mt-4 inline-flex rounded-full bg-gradient-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-card">
                Submit your first request
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {mine.map((e) => (
                <article key={e.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[11px] font-bold text-muted-foreground">{e.id}</div>
                      <div className="mt-1 text-base font-black text-primary">{e.service || e.category || "Service Request"}</div>
                      {e.category && <div className="text-xs text-muted-foreground">{e.category}</div>}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_TONE[e.status]}`}>{e.status}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-foreground sm:grid-cols-2">
                    {e.location && <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {e.location}</div>}
                    {e.preferredDate && <div className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-muted-foreground" /> {e.preferredDate}</div>}
                    <div className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-muted-foreground" /> {e.source}</div>
                    <div className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-muted-foreground" /> Submitted {new Date(e.createdAt).toLocaleString()}</div>
                  </div>
                  {e.message && (
                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-foreground">
                      <FileText className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /> {e.message}
                    </p>
                  )}
                  {e.notes.length > 0 && (
                    <div className="mt-3 rounded-lg border border-border bg-background p-3">
                      <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Updates from our team</div>
                      <ul className="space-y-1 text-xs text-foreground">
                        {e.notes.map((n) => (
                          <li key={n.id}>• {n.text} <span className="text-muted-foreground">({new Date(n.createdAt).toLocaleDateString()})</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>
      </section>
    </SiteLayout>
  );
}