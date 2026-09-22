import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, User, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { signOutAgent, type Agent } from "@/lib/agents-store";

const items = [
  { to: "/agent/dashboard", label: "My Jobs", Icon: LayoutDashboard },
  { to: "/agent/profile", label: "My Profile", Icon: User },
] as const;

export function AgentShell({
  agent,
  title,
  subtitle,
  children,
}: {
  agent: Agent;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function logout() {
    signOutAgent();
    navigate({ to: "/agent" });
  }

  const statusColor =
    agent.status === "Approved"
      ? "bg-emerald-500 text-white"
      : agent.status === "Pending"
      ? "bg-amber-500 text-white"
      : agent.status === "Rejected"
      ? "bg-destructive text-destructive-foreground"
      : "bg-muted text-foreground";

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
          <Icon className="h-4 w-4" /> {label}
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
            <Link to="/agent/dashboard" className="text-sm font-black tracking-tight text-primary">
              SMART SOLUTIONS · Registered Service Partner Portal
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:inline-flex ${statusColor}`}>
              <ShieldCheck className="mr-1 h-3 w-3" /> {agent.status}
            </span>
            <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-primary">
              ← Website
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-card p-4 shadow-lift">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-black text-primary">Menu</span>
              <button onClick={() => setOpen(false)} className="rounded-md border border-border p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            {Nav}
          </aside>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-2xl border border-border bg-card p-3 shadow-card lg:block">
          <div className="mb-3 rounded-xl bg-gradient-hero p-4 text-primary-foreground">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Registered Service Partner</div>
            <div className="mt-0.5 text-sm font-black">{agent.name}</div>
            <div className="mt-0.5 text-[11px] opacity-80">{agent.id}</div>
            <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColor}`}>
              {agent.status}
            </span>
          </div>
          {Nav}
        </aside>
        <main className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8">
          <div>
            <h1 className="text-2xl font-black text-primary">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}