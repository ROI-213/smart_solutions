import { useEffect, useState } from "react";
import {
  createFileRoute,
  Outlet,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import {
  isAdminAuthed,
  signInAdmin,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from "@/lib/admin-auth";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Smart Solutions Groups" }] }),
  component: AdminGate,
});

function AdminGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(isAdminAuthed());
    setReady(true);
  }, []);

  if (!ready) return null;

  // Logged in but landed on /admin → push to dashboard
  if (authed && pathname === "/admin") {
    if (typeof window !== "undefined") navigate({ to: "/admin/dashboard", replace: true });
    return null;
  }

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return <Outlet />;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (signInAdmin(email, password)) {
      onSuccess();
      navigate({ to: "/admin/dashboard" });
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-hero p-6 text-primary-foreground">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-8 text-foreground shadow-lift">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            {SITE.brand}
          </div>
          <h1 className="mt-1 text-2xl font-black text-primary">{SITE.product}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{SITE.tagline}</p>
        </div>

        {forgot ? (
          <div className="space-y-4">
            <p className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
              Password reset is not available in this UI-only scaffold. Enable Lovable Cloud
              to send real reset emails, or contact your developer.
            </p>
            <button
              onClick={() => setForgot(false)}
              className="w-full rounded-full border border-border py-2.5 text-sm font-semibold hover:bg-muted"
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartsolutions.co.in"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</span>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-accent py-2.5 text-sm font-bold text-accent-foreground shadow-card transition-transform hover:scale-[1.02]"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setForgot(true)}
              className="block w-full text-center text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              Forgot password?
            </button>

            <p className="rounded-lg bg-muted px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              <strong>Demo credentials:</strong> {DEMO_EMAIL} / {DEMO_PASSWORD}
              <br />Enable Lovable Cloud to replace this with real authentication.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
