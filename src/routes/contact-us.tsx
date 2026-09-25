import { useEffect, useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Phone, Mail, MessageCircle, Send, MapPin, Building2, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { SITE } from "@/lib/site";
import type { EnquiryAgreement } from "@/lib/enquiries-store";
import { useSocialLinks, SOCIAL_ICONS } from "@/lib/settings-store";
import { AgreementConsent } from "@/components/site/AgreementConsent";
import { useCustomerAuth, updateCurrentCustomerPhone } from "@/lib/customer-auth";
import { CustomerAuthDialog } from "@/components/site/CustomerAuthDialog";
import { usePublicServicesCatalog } from "@/lib/public-services";
import {
  submitContactEnquiry,
  validateContactInput,
  type ContactValidationErrors,
} from "@/lib/contact-enquiries";
import {
  useContactPageSettings,
  useContactInformationCards,
  useContactSocialLinks,
} from "@/lib/contact-page-settings";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us — Smart Solutions Groups" },
      { name: "description", content: "Call, WhatsApp or message us to book any home or building service." },
      { property: "og:title", content: "Contact Smart Solutions Groups" },
      { property: "og:description", content: "We respond fast. One call for every home & building service." },
    ],
  }),
  component: ContactUs,
});

function ContactUs() {
  const [sent, setSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [agreement, setAgreement] = useState<EnquiryAgreement | null>(null);
  const { customer } = useCustomerAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [category, setCategory] = useState("");
  const { catalog } = usePublicServicesCatalog();
  const activeCategory = catalog.find((s) => s.title === category || s.slug === category);
  const serviceOptions = activeCategory?.serviceItems ?? catalog.flatMap((s) => s.serviceItems);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ContactValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const { settings } = useContactPageSettings();
  const { cards: infoCards } = useContactInformationCards();
  const { links: dbSocials } = useContactSocialLinks();
  const fs = settings.formSettings;
  useEffect(() => { if (customer) setPhone(customer.phone); }, [customer]);
  const waMessage = encodeURIComponent(settings.whatsappDefaultMessage);
  const waHref = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${waMessage}`;

  const ICONS = { Phone, Mail, Building2, MapPin } as const;
  type IconKey = keyof typeof ICONS;
  const cards = infoCards.filter((c) => c.isActive).map((c) => {
    const Icon = ICONS[(c.icon as IconKey) ?? "Phone"] ?? Phone;
    let lines: string[] = [];
    const content = c.content as Record<string, unknown>;
    if (c.cardType === "phone") {
      lines = ["Call Now"];
    } else if (c.cardType === "email") {
      lines = [content.primary as string, content.secondary as string].filter(Boolean) as string[];
    } else if (c.cardType === "support") {
      lines = [(content.text as string) || ""].filter(Boolean);
    } else if (c.cardType === "address") {
      lines = ["Bengaluru"];
    }
    const href = c.cardType === "address" ? "https://maps.google.com/?q=Bengaluru" : (c.actionUrl ?? undefined);
    return { Icon, label: c.title, lines, href };
  });

  const legacySocials = useSocialLinks();
  const socials = (dbSocials.length ? dbSocials.filter((s) => s.isActive).map((s) => ({
    Icon: SOCIAL_ICONS[(s.icon as keyof typeof SOCIAL_ICONS) ?? "globe"] ?? SOCIAL_ICONS.globe,
    label: s.platformName,
    href: s.url,
  })) : legacySocials.filter((s) => s.active).map((s) => ({
    Icon: SOCIAL_ICONS[s.icon], label: s.platform, href: s.url,
  })));

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact Us"
        title="Contact Smart Solutions Groups"
        subtitle="One call for all home and building services. Reach out today for quick service support."
      />

      {/* Section 1: Contact cards */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ Icon, label, lines, href }) => {
            const Wrap: any = href ? "a" : "div";
            return (
              <Wrap
                key={label}
                {...(href ? { href } : {})}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="space-y-0.5">
                  {lines.map((l) => (
                    <div key={l} className="break-words text-sm font-semibold text-foreground">{l}</div>
                  ))}
                </div>
              </Wrap>
            );
          })}
        </div>
      </section>

      {/* Section 2 + 3: Form + WhatsApp side panel */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 lg:grid-cols-[1.2fr_1fr]">
        <form
          ref={formRef}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!customer) { setAuthOpen(true); return; }
            if (!agreement) return;
            if (submitting) return;
            const fd = new FormData(e.currentTarget);
            const name = String(fd.get("name") || "");
            const phoneVal = String(fd.get("phone") || phone || customer?.phone || "").trim();
            const emailVal = String(fd.get("email") || "");
            const categoryVal = String(fd.get("category") || "");
            const serviceVal = String(fd.get("service") || "");
            const locationVal = String(fd.get("location") || "");
            const preferredDateVal = String(fd.get("preferredDate") || "");
            const messageVal = String(fd.get("message") || "");
            const subject = [categoryVal, serviceVal].filter(Boolean).join(" — ") || "General Enquiry";
            const input = {
              fullName: name,
              phone: phoneVal,
              email: emailVal,
              subject,
              category: categoryVal,
              service: serviceVal,
              location: locationVal,
              preferredDate: preferredDateVal,
              message: messageVal,
            };
            const v = validateContactInput(input);
            setErrors(v);
            if (Object.keys(v).length) return;
            setSubmitting(true);
            setSubmitError(null);
            try {
              await submitContactEnquiry(input);
              if (customer && !customer.phone && phoneVal) {
                updateCurrentCustomerPhone(phoneVal);
              }
              setSent(true);
              formRef.current?.reset();
              setPhone(customer?.phone || phoneVal);
              setAgreement(null);
              setCategory("");
              setErrors({});
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error("[contact-us] submit failed:", err);
              setSubmitError("We couldn't send your enquiry. Please check your connection and try again.");
            } finally {
              setSubmitting(false);
            }
          }}
          className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
        >
          <h2 className="text-2xl font-black">{settings.formHeading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {customer ? `Logged in as ${customer.name}. ${settings.formSubheading}` : "Please login to submit an enquiry — we'll get back shortly."}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label={fs.nameLabel} required error={errors.fullName}><input name="name" required type="text" className="input" placeholder={fs.namePlaceholder} maxLength={100} defaultValue={customer?.name ?? ""} /></Field>
            <Field label={fs.phoneLabel} required error={errors.phone}>
              <input
                name="phone"
                required
                type="tel"
                className="input"
                placeholder={fs.phonePlaceholder || "10-digit mobile number"}
                maxLength={15}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                readOnly={Boolean(customer && customer.phone)}
              />
            </Field>
            <Field label={fs.emailLabel} error={errors.email}><input name="email" type="email" className="input" placeholder={fs.emailPlaceholder} maxLength={255} defaultValue={customer?.email ?? ""} readOnly={Boolean(customer)} /></Field>
            <Field label={fs.categoryLabel}>
              <select
                name="category"
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>Select a category</option>
                {catalog.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
              </select>
            </Field>
            <Field label={fs.serviceLabel}>
              <select name="service" className="input" defaultValue="">
                <option value="" disabled>
                  {serviceOptions.length ? "Select a service" : "Services loading..."}
                </option>
                {serviceOptions.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </Field>
            <Field label={fs.locationLabel}><input name="location" type="text" className="input" placeholder={fs.locationPlaceholder} maxLength={150} /></Field>
            <Field label={fs.dateLabel}><input name="preferredDate" type="date" className="input" /></Field>
            <div className="sm:col-span-2">
              <Field label={fs.messageLabel} required error={errors.message}><textarea name="message" required className="input min-h-28" placeholder={fs.messagePlaceholder} maxLength={1000} /></Field>
            </div>
            {customer && <AgreementConsent phone={phone} onChange={setAgreement} verifiedPhone={customer.phone} />}
          </div>

          {customer ? (
            <>
              <button type="submit" disabled={!agreement || submitting} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-card transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Submitting…" : settings.submitButtonLabel}
              </button>
              {!agreement && !sent && <p className="mt-2 text-xs text-muted-foreground">Please read and accept the Customer Service Agreement &amp; Terms and Conditions before submitting your enquiry.</p>}
            </>
          ) : (
            <button type="button" onClick={() => setAuthOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-card transition-transform hover:scale-105">
              <Send className="h-4 w-4" /> Login to Submit Enquiry
            </button>
          )}
          {submitError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              {settings.failureMessage}
            </div>
          )}
          {sent && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-secondary" />
              {settings.successMessage}
            </div>
          )}
        </form>
        <CustomerAuthDialog open={authOpen} onClose={() => setAuthOpen(false)} initialPhone={phone} />

        <aside className="space-y-6">
          {settings.whatsappEnabled && (
          <div className="rounded-3xl border border-border bg-gradient-hero p-8 text-primary-foreground shadow-lift">
            <MessageCircle className="h-9 w-9" />
            <h3 className="mt-4 text-2xl font-black">{settings.whatsappHeading}</h3>
            <p className="mt-2 text-sm opacity-90">
              {settings.whatsappDescription}
            </p>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary shadow-card transition-transform hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" /> {settings.whatsappButtonLabel}
            </a>
          </div>
          )}

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-lg font-black">Follow Us</h3>
            <p className="mt-1 text-sm text-muted-foreground">Stay connected on social media.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background p-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {/* Section 5: Map */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="overflow-hidden rounded-3xl border border-border shadow-card">
          <iframe
            title="Smart Solutions Groups Location"
            src="https://www.google.com/maps?q=Bengaluru,+Karnataka&z=12&output=embed"
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* Section 6: CTA */}
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Need Any Home or Building Service?</h2>
          <p className="mt-3 text-base opacity-90">
            Our team is one call away — book a service today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${SITE.contact.primary.phone}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-card transition-transform hover:scale-105"
            >
              <Phone className="h-4 w-4" /> Call Now
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-card transition-transform hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Now
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-accent"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs font-semibold text-destructive">{error}</p>}
      <style>{`.input{width:100%;border-radius:0.75rem;border:1px solid var(--border);background:var(--background);padding:0.65rem 0.85rem;font-size:0.875rem;outline:none;transition:border-color .15s, box-shadow .15s}.input:focus{border-color:var(--primary-glow);box-shadow:0 0 0 3px color-mix(in oklab, var(--primary-glow) 20%, transparent)}`}</style>
    </label>
  );
}
