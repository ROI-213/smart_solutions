import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wrench, FolderTree, Mail, Inbox, MessageSquare, Video, Phone, Share2,
  Plus, Edit3, Eye, ArrowRight,
} from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { services } from "@/data/services";
import { testimonials } from "@/data/admin-mock";
import { useEnquiriesStore } from "@/lib/enquiries-store";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { enquiries } = useEnquiriesStore();
  const totalServices = services.reduce((n, c) => n + c.items.length, 0);
  const newEnquiries = enquiries.filter((e) => e.status === "New").length;
  const videoCount = testimonials.filter((t) => t.type === "Video").length;
  const socialCount = Object.keys(SITE.social).length;

  const cards: { label: string; value: number | string; Icon: any; tone: string }[] = [
    { label: "Total Services", value: totalServices, Icon: Wrench, tone: "from-primary to-primary-glow" },
    { label: "Service Categories", value: services.length, Icon: FolderTree, tone: "from-secondary to-secondary" },
    { label: "Total Enquiries", value: enquiries.length, Icon: Inbox, tone: "from-primary to-secondary" },
    { label: "New Enquiries", value: newEnquiries, Icon: Mail, tone: "from-accent to-accent" },
    { label: "Total Testimonials", value: testimonials.length, Icon: MessageSquare, tone: "from-primary to-primary-glow" },
    { label: "Video Testimonials", value: videoCount, Icon: Video, tone: "from-secondary to-primary" },
    { label: "Contact Details", value: 4, Icon: Phone, tone: "from-primary to-secondary" },
    { label: "Social Links", value: socialCount, Icon: Share2, tone: "from-accent to-primary" },
  ];

  const quickActions = [
    { to: "/admin/services", label: "Add Service", Icon: Plus },
    { to: "/admin/testimonials", label: "Add Testimonial", Icon: Plus },
    { to: "/admin/contact", label: "Update Contact Details", Icon: Edit3 },
    { to: "/admin/enquiries", label: "View Enquiries", Icon: Eye },
  ] as const;

  return (
    <AdminShell title="Dashboard" subtitle="Overview of your website content and recent activity.">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tone} text-primary-foreground`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-1 text-3xl font-black text-primary">{value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-muted-foreground">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold shadow-card transition-transform hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* Enquiry status */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(["New", "Contacted", "In Progress", "Completed", "Rejected"] as const).map((s) => {
          const n = enquiries.filter((e) => e.status === s).length;
          const color = s === "New" ? "bg-accent text-accent-foreground" : s === "Contacted" ? "bg-primary text-primary-foreground" : s === "Completed" ? "bg-emerald-500 text-white" : s === "Rejected" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground";
          return (
            <div key={s} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-card">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s}</div>
                <div className="mt-1 text-3xl font-black text-primary">{n}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${color}`}>{s}</span>
            </div>
          );
        })}
      </div>

      {/* Latest enquiries + testimonials */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Latest Enquiries</h3>
            <Link to="/admin/enquiries" className="text-xs font-bold text-primary hover:underline">View all →</Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Service</th><th className="px-3 py-2 text-left">Status</th></tr>
              </thead>
              <tbody>
                {enquiries.slice(0, 5).map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-3 py-2 font-semibold">{e.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.service}</td>
                    <td className="px-3 py-2"><span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Latest Testimonials</h3>
            <Link to="/admin/testimonials" className="text-xs font-bold text-primary hover:underline">Manage →</Link>
          </div>
          <ul className="space-y-3">
            {testimonials.slice(0, 4).map((t) => (
              <li key={t.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{t.name} <span className="font-normal text-muted-foreground">· {t.location}</span></span>
                  <span className="text-xs font-semibold text-secondary">{"★".repeat(t.rating)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">"{t.quote}"</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
