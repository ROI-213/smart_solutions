import { MapPin, CheckCircle2, ShieldCheck, type LucideIcon } from "lucide-react";

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
 * Reusable premium split-banner hero for service category pages.
 * Left: light-blue gradient content area. Right: hero image with a curved divider.
 */
export function ServiceHero({
  title,
  subtitle,
  featureBadges,
  locationText,
  image,
  icon: Icon,
  accentColor = "#E7B83A",
  badgeText = "SERVING BENGALURU",
}: ServiceHeroProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
      <div
        className="relative overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-30px_rgba(6,27,85,0.35)] ring-1 ring-[#DCEEFF]"
      >
        <img
          src={image}
          alt={title}
          className="block h-auto w-full"
          loading="eager"
          width={1920}
          height={640}
        />
      </div>
    </section>
  );
}