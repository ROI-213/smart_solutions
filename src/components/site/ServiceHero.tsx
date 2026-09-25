import {
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Star,
  Send,
  Phone,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export type ServiceHeroProps = {
  title: string;
  subtitle: string;
  featureBadges: string[];
  locationText: string;
  image: string;
  icon: LucideIcon;
  accentColor?: string;
  badgeText?: string;
};

/**
 * Reusable hero card for service category pages.
 * Displays service details and CTAs on the left,
 * and the service image inside a neat, compact card on the right.
 */
export function ServiceHero({
  title,
  subtitle,
  featureBadges,
  locationText,
  image,
  icon: Icon,
  accentColor = "#E7B83A",
  badgeText = "SMART SOLUTIONS GROUPS",
}: ServiceHeroProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-sky-50/30 to-blue-50/50 p-6 shadow-lift sm:p-8 lg:p-10 ring-1 ring-[#DCEEFF]">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Column: Details & CTAs */}
          <div className="space-y-4 lg:col-span-7">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Icon className="h-3.5 w-3.5" />
                {badgeText}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900">
                <MapPin className="h-3.5 w-3.5 text-amber-600" />
                {locationText}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-black tracking-tight text-primary sm:text-3xl lg:text-4xl xl:text-5xl">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {subtitle}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {featureBadges.map((badge) => (
                <div
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-primary shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{badge}</span>
                </div>
              ))}
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-primary shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Verified Professionals</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-3">
              <Button
                asChild
                size="lg"
                className="bg-[#061B55] font-bold text-white shadow-card hover:bg-[#061B55]/90"
              >
                <a href="#enquiry">
                  <Send className="mr-2 h-4 w-4" /> Book a Service
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-gradient-accent font-bold text-accent-foreground shadow-card hover:opacity-90"
              >
                <a href={`tel:${SITE.contact.primary.phone}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call Now
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-whatsapp font-bold text-whatsapp-foreground shadow-card hover:opacity-90"
              >
                <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
                </a>
              </Button>
            </div>
          </div>

          {/* Right Column: Small Image Card */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <div className="w-full max-w-sm sm:max-w-md">
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-card transition-all duration-300 hover:shadow-lift">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                    width={640}
                    height={480}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Floating Rating Pill */}
                  <div className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/95 px-2.5 py-1 text-xs font-black text-primary shadow-sm backdrop-blur">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    4.9 (500+ Reviews)
                  </div>

                  {/* Floating Service Badge */}
                  <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-lg bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Doorstep Service
                  </div>
                </div>

                {/* Card Caption Footer */}
                <div className="mt-2.5 flex items-center justify-between px-1.5 py-1">
                  <div>
                    <p className="text-xs font-bold text-primary">Smart Care Assured</p>
                    <p className="text-[11px] text-muted-foreground">Certified Experts • Upfront Pricing</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                    Same-Day Slot
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}