import { Phone, Mail, MapPin } from "lucide-react";
import { SITE } from "@/lib/site";

export function TopBar() {
  return (
    <div className="relative animate-fade-in">
      <div
        className="relative text-white"
        style={{
          background:
            "linear-gradient(90deg, #0B2E59 0%, #0B2E59 45%, #0B2E59 75%, #D4AF37 100%)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-2 gap-x-6 px-6 py-3 text-xs md:text-[13px]">
          <a
            href={`tel:${SITE.contact.primary.phone}`}
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#D4AF37] shadow-[0_2px_10px_rgba(0,194,212,0.5)]">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium">Call Us</span>
          </a>
          <a
            href={`mailto:${SITE.contact.email}`}
            className="hidden items-center gap-2 transition-opacity hover:opacity-90 md:flex"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#D4AF37] shadow-[0_2px_10px_rgba(0,194,212,0.5)]">
              <Mail className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium">{SITE.contact.email}</span>
          </a>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#D4AF37] shadow-[0_2px_10px_rgba(0,194,212,0.5)]">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <span className="max-w-sm truncate font-medium text-white/95">
              {SITE.contact.serviceArea}
            </span>
          </div>
        </div>
        {/* Curved bottom mask matching page background */}
        <svg
          className="absolute inset-x-0 bottom-[-1px] h-5 w-full"
          viewBox="0 0 1440 40"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,40 L0,40 Z" fill="var(--background)" />
        </svg>
      </div>
      {/* Thin teal decorative wave */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-[-10px] h-4 w-full"
        viewBox="0 0 1440 30"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,12 C360,32 1080,-8 1440,12"
          stroke="#D4AF37"
          strokeWidth="2"
          fill="none"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}