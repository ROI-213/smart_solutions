import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFab } from "./WhatsAppFab";
import { MobileBottomNav } from "./MobileBottomNav";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <Navbar />
      <main className="flex-1 pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
      <MobileBottomNav />
    </div>
  );
}
