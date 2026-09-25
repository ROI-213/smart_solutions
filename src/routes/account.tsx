import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  User as UserIcon,
  Phone,
  Mail,
  LogOut,
  Inbox,
  CalendarClock,
  MapPin,
  Tag,
  FileText,
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Search,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Wrench,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { useCustomerAuth, signOutCustomer } from "@/lib/customer-auth";
import { useEnquiriesStore, type EnquiryStatus, type Enquiry } from "@/lib/enquiries-store";
import { CustomerAuthDialog } from "@/components/site/CustomerAuthDialog";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({ meta: [{ title: "My Account & Service History — Smart Solutions Groups" }] }),
  component: AccountPage,
});

const STATUS_TONE: Record<
  EnquiryStatus,
  { badge: string; dot: string; label: string }
> = {
  New: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    label: "Under Review",
  },
  Contacted: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    label: "Technician Assigned",
  },
  "In Progress": {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    label: "In Progress",
  },
  Completed: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Service Completed",
  },
  Rejected: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    label: "Closed",
  },
};

const POPULAR_SERVICES = [
  { name: "POP False Ceiling", cat: "Interior & Construction" },
  { name: "House Rewiring", cat: "Electrical Services" },
  { name: "AC Deep Cleaning", cat: "Appliance Services" },
  { name: "Plumbing Leak Repair", cat: "Plumbing Services" },
];

function AccountPage() {
  const { customer, ready } = useCustomerAuth();
  const { enquiries } = useEnquiriesStore();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");

  const [activeTab, setActiveTab] = useState<"history" | "requests" | "profile">(() => {
    if (search.tab === "requests") return "requests";
    if (search.tab === "profile") return "profile";
    return "history";
  });

  useEffect(() => {
    if (search.tab === "requests") setActiveTab("requests");
    else if (search.tab === "profile") setActiveTab("profile");
    else if (search.tab === "history") setActiveTab("history");
  }, [search.tab]);

  useEffect(() => {
    if (ready && !customer) setAuthOpen(true);
  }, [ready, customer]);

  const mine = useMemo(() => {
    if (!customer) return [];
    const custPhone = customer.phone ? customer.phone.replace(/\D/g, "").slice(-10) : "";
    const custEmail = customer.email ? customer.email.trim().toLowerCase() : "";
    return enquiries
      .filter((e) => {
        const matchId = e.customerId && e.customerId === customer.id;
        const matchPhone = custPhone && e.phone.replace(/\D/g, "").slice(-10) === custPhone;
        const matchEmail = custEmail && e.email && e.email.trim().toLowerCase() === custEmail;
        return Boolean(matchId || matchPhone || matchEmail);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [enquiries, customer]);

  // Filtered list for Service History search & status pills
  const filteredHistory = useMemo(() => {
    return mine.filter((e) => {
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "completed"
            ? e.status === "Completed"
            : e.status === "New" || e.status === "Contacted" || e.status === "In Progress";

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        e.service.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        (e.location && e.location.toLowerCase().includes(query)) ||
        e.id.toLowerCase().includes(query);

      return matchStatus && matchSearch;
    });
  }, [mine, statusFilter, searchQuery]);

  // Statistics for history
  const stats = useMemo(() => {
    const total = mine.length;
    const completed = mine.filter((e) => e.status === "Completed").length;
    const active = mine.filter((e) => e.status === "In Progress" || e.status === "Contacted" || e.status === "New").length;
    const categories = new Set(mine.map((e) => e.category).filter(Boolean)).size;
    return { total, completed, active, categories };
  }, [mine]);

  if (!ready) return null;

  if (!customer) {
    return (
      <SiteLayout>
        <PageHeader
          eyebrow="Customer Portal"
          title="Login to View Service History"
          subtitle="Sign in to view all the services you have enquired for, track updates, and manage your bookings."
        />
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-lift">
            <History className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-primary">Access Your Service History</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Enter your email to receive a secure one-time passcode and access your enquiries.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="rounded-full bg-gradient-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-card hover:opacity-90"
            >
              Login / Sign Up
            </button>
          </div>
        </section>
        <CustomerAuthDialog open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={() => {}} />
      </SiteLayout>
    );
  }

  const getWhatsAppEnquiryUrl = (e: Enquiry) => {
    const text = encodeURIComponent(
      `Hello Smart Solutions, I am checking on my service enquiry:\n• Ref ID: ${e.id}\n• Service: ${e.service || e.category}\n• Location: ${e.location || "Bangalore"}`
    );
    const phone = SITE.contact.primary.phone.replace(/\D/g, "").slice(-10);
    return `https://wa.me/91${phone}?text=${text}`;
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Customer Portal"
        title={`Welcome, ${customer.name}`}
        subtitle="Manage your profile, track your service requests, and review your complete service history."
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Profile & Navigation Card */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              <div className="bg-gradient-hero p-6 text-primary-foreground">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                    <UserIcon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                      Customer Profile
                    </div>
                    <h2 className="truncate text-lg font-black">{customer.name}</h2>
                    <p className="truncate text-xs opacity-80">{customer.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="p-3">
                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold transition-all ${
                      activeTab === "history"
                        ? "bg-[#061B55] text-white shadow-sm"
                        : "text-primary hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <History className="h-4 w-4 text-secondary" />
                      <span>Service History</span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                        activeTab === "history"
                          ? "bg-white/20 text-white"
                          : "bg-secondary/15 text-primary"
                      }`}
                    >
                      {mine.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("requests")}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold transition-all ${
                      activeTab === "requests"
                        ? "bg-[#061B55] text-white shadow-sm"
                        : "text-primary hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-secondary" />
                      <span>Active Requests</span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                        activeTab === "requests"
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stats.active}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold transition-all ${
                      activeTab === "profile"
                        ? "bg-[#061B55] text-white shadow-sm"
                        : "text-primary hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <UserIcon className="h-4 w-4 text-secondary" />
                      <span>Profile Details</span>
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>
                </nav>
              </div>

              {/* Quick Customer Info */}
              <div className="border-t border-border px-5 py-4">
                <div className="space-y-2.5 text-xs text-foreground">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Customer ID:</span>
                    <span className="font-mono font-bold text-primary">{customer.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-semibold text-primary">
                      {customer.phone ? `+91 ${customer.phone}` : "Not linked"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    signOutCustomer();
                    navigate({ to: "/" });
                  }}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>

            {/* Need Assistance Card */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50/60 to-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                <Sparkles className="h-4 w-4" /> Dedicated Support
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Questions about an enquiry? Contact our customer relationship team.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <a
                  href={`tel:${SITE.contact.primary.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-primary/90"
                >
                  <Phone className="h-3.5 w-3.5" /> Call {SITE.contact.primary.phone}
                </a>
                <a
                  href={SITE.social.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-3 py-2 text-xs font-bold text-whatsapp-foreground transition hover:opacity-90"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Support
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Tab Content */}
          <main className="lg:col-span-8">
            {/* ─────────────── TAB 1: SERVICE HISTORY ─────────────── */}
            {activeTab === "history" && (
              <div className="space-y-6">
                {/* Header & Stats Banner */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
                        <History className="h-3.5 w-3.5" /> SERVICE HISTORY
                      </div>
                      <h1 className="mt-2 text-2xl font-black text-primary sm:text-3xl">
                        Enquired Services History
                      </h1>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        View every service you have enquired about, check technician assignments, or re-book anytime.
                      </p>
                    </div>

                    <Link
                      to="/services"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-card transition hover:opacity-95"
                    >
                      <Wrench className="h-3.5 w-3.5" /> Enquire New Service
                    </Link>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-center">
                      <div className="text-2xl font-black text-primary">{stats.total}</div>
                      <div className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                        Total Enquiries
                      </div>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3.5 text-center">
                      <div className="text-2xl font-black text-purple-700">{stats.active}</div>
                      <div className="mt-0.5 text-[11px] font-semibold text-purple-800">
                        In Progress
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-center">
                      <div className="text-2xl font-black text-emerald-700">{stats.completed}</div>
                      <div className="mt-0.5 text-[11px] font-semibold text-emerald-800">
                        Completed
                      </div>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3.5 text-center">
                      <div className="text-2xl font-black text-amber-700">{stats.categories}</div>
                      <div className="mt-0.5 text-[11px] font-semibold text-amber-800">
                        Categories
                      </div>
                    </div>
                  </div>

                  {/* Search & Filter Toolbar */}
                  {mine.length > 0 && (
                    <div className="mt-6 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search enquired services, category, location..."
                          className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-foreground outline-none transition focus:border-primary focus:bg-white"
                        />
                      </div>

                      <div className="flex gap-1.5 overflow-x-auto rounded-full border border-slate-200 bg-slate-50/80 p-1">
                        {(["all", "active", "completed"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setStatusFilter(mode)}
                            className={`rounded-full px-3 py-1.5 text-[11px] font-bold capitalize transition ${
                              statusFilter === mode
                                ? "bg-primary text-white shadow-xs"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                          >
                            {mode === "all" ? `All (${mine.length})` : mode === "active" ? `Active (${stats.active})` : `Completed (${stats.completed})`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Enquiries List */}
                {filteredHistory.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-card sm:p-14">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/5 text-primary">
                      <Inbox className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-lg font-black text-primary">
                      {searchQuery || statusFilter !== "all"
                        ? "No matching enquiries found"
                        : "No service history yet"}
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground sm:text-sm">
                      {searchQuery || statusFilter !== "all"
                        ? "Try clearing your search or status filter to see all your service enquiries."
                        : "You haven't enquired about any home or building services yet. Browse our verified offerings to get started."}
                    </p>

                    {searchQuery || statusFilter !== "all" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                        }}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-primary shadow-xs hover:bg-slate-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
                      </button>
                    ) : (
                      <div className="mt-6">
                        <Link
                          to="/services"
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-xs font-bold text-accent-foreground shadow-card hover:opacity-95"
                        >
                          Browse Services <ArrowRight className="h-4 w-4" />
                        </Link>

                        {/* Popular Quick Links */}
                        <div className="mt-8 border-t border-slate-100 pt-6">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Popular services in Bengaluru
                          </p>
                          <div className="mt-3 flex flex-wrap justify-center gap-2">
                            {POPULAR_SERVICES.map((ps) => (
                              <Link
                                key={ps.name}
                                to="/services"
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-primary shadow-2xs hover:border-primary hover:bg-slate-50"
                              >
                                <CheckCircle2 className="h-3 w-3 text-secondary" />
                                {ps.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredHistory.map((e) => {
                      const tone = STATUS_TONE[e.status] ?? STATUS_TONE.New;
                      const serviceTitle = e.service || e.category || "General Home Service";
                      return (
                        <article
                          key={e.id}
                          className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-lift"
                        >
                          {/* Top Row: Service Name & Status Badge */}
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                  #{e.id}
                                </span>
                                {e.category && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                                    <Tag className="h-3 w-3" />
                                    {e.category}
                                  </span>
                                )}
                              </div>
                              <h3 className="mt-1.5 text-lg font-black text-primary sm:text-xl">
                                {serviceTitle}
                              </h3>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${tone.badge}`}
                            >
                              <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                              {tone.label}
                            </span>
                          </div>

                          {/* Key Details Grid */}
                          <div className="mt-4 grid gap-2.5 rounded-2xl bg-slate-50/80 p-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="truncate">
                                <span className="font-semibold text-muted-foreground">Enquired:</span>{" "}
                                <b className="text-foreground">
                                  {new Date(e.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </b>
                              </span>
                            </div>

                            {e.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">
                                  <span className="font-semibold text-muted-foreground">Location:</span>{" "}
                                  <b className="text-foreground">{e.location}</b>
                                </span>
                              </div>
                            )}

                            {e.preferredDate && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">
                                  <span className="font-semibold text-muted-foreground">Preferred:</span>{" "}
                                  <b className="text-foreground">{e.preferredDate}</b>
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="truncate">
                                <span className="font-semibold text-muted-foreground">Channel:</span>{" "}
                                <b className="text-foreground">{e.source || "Website Enquiry"}</b>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="truncate">
                                <span className="font-semibold text-muted-foreground">Contact:</span>{" "}
                                <b className="text-foreground">+91 {e.phone}</b>
                              </span>
                            </div>
                          </div>

                          {/* Customer Message / Requirement */}
                          {e.message && (
                            <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 text-xs">
                              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-muted-foreground">Requirement note: </span>
                                <span className="text-foreground">{e.message}</span>
                              </div>
                            </div>
                          )}

                          {/* Team Notes & Progress Updates */}
                          {e.notes && e.notes.length > 0 && (
                            <div className="mt-3.5 rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                                <Clock className="h-3.5 w-3.5 text-secondary" />
                                Team Updates
                              </div>
                              <ul className="mt-2 space-y-1.5 text-xs text-foreground">
                                {e.notes.map((n) => (
                                  <li key={n.id} className="flex items-start gap-2">
                                    <span className="text-secondary">•</span>
                                    <span>
                                      {n.text}{" "}
                                      <span className="text-[11px] text-muted-foreground">
                                        ({new Date(n.createdAt).toLocaleDateString("en-IN")})
                                      </span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Action Footer */}
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <div className="text-[11px] text-muted-foreground">
                              Reference: <span className="font-mono font-semibold">{e.id}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={getWhatsAppEnquiryUrl(e)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full bg-whatsapp px-3.5 py-1.5 text-xs font-bold text-whatsapp-foreground shadow-2xs transition hover:opacity-90"
                              >
                                <MessageCircle className="h-3.5 w-3.5" /> Check Status
                              </a>

                              <Link
                                to="/services"
                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-primary shadow-2xs transition hover:border-primary hover:bg-slate-50"
                              >
                                <RotateCcw className="h-3 w-3" /> Enquire Again
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─────────────── TAB 2: ACTIVE REQUESTS ─────────────── */}
            {activeTab === "requests" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                        <Clock className="h-3.5 w-3.5" /> ACTIVE BOOKINGS
                      </div>
                      <h2 className="mt-2 text-2xl font-black text-primary">Active Service Requests</h2>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        These services are currently under review, scheduled, or being serviced by our technicians.
                      </p>
                    </div>

                    <Link
                      to="/services"
                      className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                    >
                      New Request
                    </Link>
                  </div>

                  <div className="mt-6 space-y-4">
                    {mine.filter((e) => e.status !== "Completed" && e.status !== "Rejected").length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          No active requests right now. All previous services are completed or closed.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab("history")}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary underline"
                        >
                          View complete service history <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      mine
                        .filter((e) => e.status !== "Completed" && e.status !== "Rejected")
                        .map((e) => {
                          const tone = STATUS_TONE[e.status] ?? STATUS_TONE.New;
                          return (
                            <div
                              key={e.id}
                              className="rounded-2xl border border-slate-200 p-5 shadow-xs transition hover:shadow-card"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
                                    #{e.id}
                                  </span>
                                  <h4 className="text-base font-black text-primary">
                                    {e.service || e.category}
                                  </h4>
                                </div>
                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold ${tone.badge}`}
                                >
                                  {tone.label}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Location: <b>{e.location || "Bengaluru"}</b> • Date:{" "}
                                <b>{new Date(e.createdAt).toLocaleDateString("en-IN")}</b>
                              </p>
                              {e.message && (
                                <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-foreground">
                                  {e.message}
                                </p>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────── TAB 3: PROFILE DETAILS ─────────────── */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
                  <div className="border-b border-slate-100 pb-6">
                    <h2 className="text-2xl font-black text-primary">Customer Account Information</h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      Your verified contact details and authentication credentials with Smart Solutions Groups.
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Full Name
                      </div>
                      <div className="mt-1 text-base font-bold text-primary">{customer.name}</div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Email Address
                      </div>
                      <div className="mt-1 text-base font-bold text-primary">{customer.email}</div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Used for secure login OTPs, invoices, and service confirmations.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Phone Number
                      </div>
                      <div className="mt-1 text-base font-bold text-primary">
                        {customer.phone ? `+91 ${customer.phone}` : "Mobile not linked"}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Verified Indian mobile number for technician coordinator contact and appointment dispatch.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Account Registered On
                      </div>
                      <div className="mt-1 text-sm font-semibold text-primary">
                        {new Date(customer.createdAt).toLocaleString("en-IN", {
                          dateStyle: "long",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </SiteLayout>
  );
}