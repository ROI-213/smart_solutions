import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Info, Eye, Wrench, MessageSquare, Phone, Mail, Share2, Layout,
  LogOut, Menu, X, Users, HardHat, Briefcase, Contact,
} from "lucide-react";
import { signOutAdmin } from "@/lib/admin-auth";
import { useNewContactCount } from "@/lib/contact-enquiries";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/about-us", label: "About Us Management", Icon: Info },
  { to: "/admin/vision", label: "Vision Management", Icon: Eye },
  { to: "/admin/services", label: "Services Management", Icon: Wrench },
  { to: "/admin/testimonials", label: "Testimonials Management", Icon: MessageSquare },
  { to: "/admin/contact-us", label: "Contact Us Management", Icon: Contact },
  { to: "/admin/contact", label: "Contact Management", Icon: Phone, badgeKey: "contact" as const },
  { to: "/admin/enquiries", label: "Enquiry Management", Icon: Mail },
  { to: "/admin/customers", label: "Customers", Icon: Users },
  { to: "/admin/agents", label: "Registered Service Partners / Technicians", Icon: HardHat },
  { to: "/admin/careers", label: "Careers Management", Icon: Briefcase },
  { to: "/admin/social-links", label: "Social Media", Icon: Share2 },
  { to: "/admin/footer", label: "Footer Management", Icon: Layout },
] as const;

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const newContact = useNewContactCount();

  function logout() {
    signOutAdmin();
    navigate({ to: "/admin" });
  }

  const Nav = (
    <nav className="flex flex-col gap-1">
      {items.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          activeProps={{ className: "bg-primary text-primary-foreground shadow-card" }}
          inactiveProps={{ className: "text-foreground/80 hover:bg-muted" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        >
          <Icon className="h-4 w-4" />
          <span className="flex-1">{label}</span>
          {to === "/admin/contact" && newContact > 0 && (
            <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-black text-accent-foreground">
              {newContact}
            </span>
          )}
        </Link>
      ))}
      <button
        onClick={logout}
        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-md border border-border p-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Link to="/admin/dashboard" className="text-sm font-black tracking-tight text-primary">
              SMART SOLUTIONS · Admin
            </Link>
          </div>
          <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-primary">
            ← Back to website
          </Link>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-card p-4 shadow-lift">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-black text-primary">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md border border-border p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            {Nav}
          </aside>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-2xl border border-border bg-card p-3 shadow-card lg:block">
          {Nav}
        </aside>
        <main className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-primary">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
