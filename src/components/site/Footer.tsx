import { Link } from "@tanstack/react-router";
import { useFooterContent, useSocialLinks, SOCIAL_ICONS } from "@/lib/settings-store";

export function Footer() {
  const footer = useFooterContent();
  const socials = useSocialLinks().filter((s) => s.active);
  return (
    <footer className="mt-20 bg-[#0A2540] text-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="text-lg font-black tracking-tight">{footer.brand}</div>
          <div className="mt-1 text-sm font-semibold text-secondary">{footer.product}</div>
          <p className="mt-3 text-sm text-primary-foreground/80">{footer.tagline}</p>
          <p className="mt-3 text-sm text-primary-foreground/70">{footer.description}</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-secondary">{footer.quickLinksHeading}</h4>
          <ul className="space-y-2 text-sm">
            {footer.quickLinks.map((l) => (
              <li key={l.to}>
                <a href={l.to} className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-secondary">{footer.servicesHeading}</h4>
          <ul className="space-y-2 text-sm">
            {footer.serviceLinks.map((s) => (
              <li key={s.to}>
                <a href={s.to} className="text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-secondary">{footer.contactHeading}</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            {footer.contactLines.filter(Boolean).map((l, i) => (
              <li key={`${l}-${i}`} className="whitespace-pre-wrap break-words">{l}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-primary-foreground/60">{footer.footerContactText}</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-secondary">{footer.socialHeading}</h4>
          <div className="flex flex-wrap gap-2">
            {socials.map((s) => {
              const I = SOCIAL_ICONS[s.icon];
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.platform}
                  className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-secondary hover:text-primary"
                >
                  <I className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-primary-foreground/70 sm:flex-row">
          <div suppressHydrationWarning>{footer.copyright}</div>
          <div>{footer.tagline}</div>
        </div>
      </div>
    </footer>
  );
}

// Keep Link import usage for typing/future use
void Link;
