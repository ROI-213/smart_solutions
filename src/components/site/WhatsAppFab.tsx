import { MessageCircle } from "lucide-react";
import { useSocialLinks } from "@/lib/settings-store";
import { SITE } from "@/lib/site";

export function WhatsAppFab() {
  const wa = useSocialLinks().find((s) => s.icon === "whatsapp" && s.active);
  const href = wa?.url || SITE.social.whatsapp;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-5 bottom-[calc(84px+env(safe-area-inset-bottom))] z-50 hidden h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lift transition-transform hover:scale-110 md:bottom-5 md:grid"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
