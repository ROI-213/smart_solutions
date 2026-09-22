import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Mail, Briefcase, MessageCircle } from "lucide-react";
import { useSocialLinks } from "@/lib/settings-store";
import { SITE } from "@/lib/site";

type Item = {
  key: string;
  label: string;
  icon: typeof Home;
  to?: string;
  href?: string;
  external?: boolean;
  match?: (path: string) => boolean;
  accent?: boolean;
};

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const wa = useSocialLinks().find((s) => s.icon === "whatsapp" && s.active);
  const waHref = wa?.url || SITE.social.whatsapp;
  const items: Item[] = [
    { key: "home", label: "Home", icon: Home, to: "/", match: (p) => p === "/" },
    { key: "services", label: "Services", icon: LayoutGrid, to: "/services", match: (p) => p.startsWith("/services") },
    { key: "contact", label: "Contact", icon: Mail, to: "/contact-us", match: (p) => p.startsWith("/contact-us") },
    { key: "careers", label: "Careers", icon: Briefcase, to: "/careers", match: (p) => p.startsWith("/careers") },
    { key: "wa", label: "WhatsApp", icon: MessageCircle, href: waHref, external: true, accent: true },
  ];

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-lg shadow-[0_-8px_24px_-12px_rgba(10,37,64,0.25)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.match ? it.match(path) : false;
          const base =
            "relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-semibold tracking-wide transition-all duration-200 active:scale-95";
          const state = active
            ? "text-primary"
            : it.accent
              ? "text-whatsapp"
              : "text-muted-foreground hover:text-foreground";
          const inner = (
            <>
              <span
                className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
                  active ? "bg-primary/10" : it.accent ? "bg-whatsapp/10" : ""
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </span>
              <span className="leading-none">{it.label}</span>
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </>
          );
          if (it.to) {
            return (
              <li key={it.key}>
                <Link to={it.to} className={`${base} ${state}`}>
                  {inner}
                </Link>
              </li>
            );
          }
          return (
            <li key={it.key}>
              <a
                href={it.href}
                {...(it.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className={`${base} ${state}`}
              >
                {inner}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}