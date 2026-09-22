import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, Phone, User, LogOut, Inbox, ChevronDown, HardHat, Search } from "lucide-react";
import { SITE } from "@/lib/site";
import { useCustomerAuth, signOutCustomer } from "@/lib/customer-auth";
import { CustomerAuthDialog } from "@/components/site/CustomerAuthDialog";
import { searchServices } from "@/lib/service-search";
import { usePublicServicesCatalog } from "@/lib/public-services";
import logoUrl from "@/assets/brand/logo.png";


const links = [
  { to: "/", label: "Home" },
  { to: "/about-us", label: "About Us" },
  { to: "/our-vision", label: "Our Vision" },
  { to: "/services", label: "Services" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/careers", label: "Careers" },
  { to: "/contact-us", label: "Contact Us" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { customer } = useCustomerAuth();
  const { catalog } = usePublicServicesCatalog();
  const navigate = useNavigate();
  const results = searchQuery.trim() ? searchServices(searchQuery, 8, catalog) : [];

  const goToResult = (itemSlug: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate({ to: "/services/$slug", params: { slug: itemSlug } });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${scrolled ? "border-b border-[#E5E7EB] shadow-sm" : "border-b border-transparent"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`flex min-w-0 items-center gap-2 transition-all duration-300 ${scrolled ? "py-1 sm:py-2" : "py-1.5 sm:py-3"}`}>
            {/* Brand logo */}
            <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2" aria-label="Smart Solutions Groups — Home Care 360">
              <img
                src={logoUrl}
                alt="Smart Solutions Groups — Home Care 360"
                className={`w-auto shrink-0 object-contain transition-all duration-300 ${scrolled ? "h-10 sm:h-11 lg:h-12 xl:h-14" : "h-11 sm:h-12 lg:h-14 xl:h-16"}`}
              />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[13px] font-black text-[#0B2E59] sm:text-sm lg:text-base xl:text-base">
                  Smart Solutions Groups
                </span>
                <span className="truncate text-[10px] font-semibold text-[#D4AF37] sm:text-[11px] lg:text-xs">
                  Home Care 360
                </span>
              </span>
            </Link>

            {/* Spacer pushes menu to the right */}
            <div className="flex-1" />

            {/* Menu - collapses into hamburger below lg */}
            <nav className="hidden shrink-0 items-center gap-1 xl:flex">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  activeProps={{
                    className: "text-[#0B2E59] after:scale-x-100",
                  }}
                  inactiveProps={{
                    className: "text-[#0B2E59]/75 hover:text-[#0B2E59]",
                  }}
                  className="relative whitespace-nowrap px-2 py-2 text-[13px] font-semibold transition-colors after:absolute after:left-2 after:right-2 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-[#D4AF37] after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Search pill */}
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Open search"
              aria-expanded={searchOpen}
              className="ml-2 hidden shrink-0 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs font-semibold text-[#0B2E59] transition-colors hover:border-[#D4AF37] sm:inline-flex xl:px-3"
            >
              <span className="hidden text-[#0B2E59]/70 2xl:inline">Search</span>
              <Search className="h-3.5 w-3.5" />
            </button>

            {/* Registered Service Partner */}
            <Link
              to="/agent"
              className="ml-2 hidden shrink-0 items-center gap-1 rounded-md border border-[#0B2E59] bg-white px-2 py-1 text-[10px] font-bold text-[#0B2E59] transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white lg:inline-flex"
            >
              <HardHat className="h-3 w-3" />
              <span className="whitespace-nowrap">Service Partner</span>
            </Link>

            {/* Customer Login / My Account */}
            {!customer ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="ml-2 hidden shrink-0 items-center gap-1.5 rounded-md border border-[#0B2E59] bg-white px-2 py-1.5 text-[11px] font-bold text-[#0B2E59] transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white sm:inline-flex"
              >
                <User className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">Customer Login</span>
              </button>
            ) : (
              <div className="relative ml-2 hidden shrink-0 sm:inline-block">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#0B2E59] bg-white px-2 py-1.5 text-[11px] font-bold text-[#0B2E59] transition-colors hover:border-[#D4AF37] lg:px-3 lg:py-2 lg:text-xs"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">Hi, {customer.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-lg">
                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0B2E59] hover:bg-[#F5F7FA]"
                    >
                      <User className="h-3.5 w-3.5" /> My Profile
                    </Link>
                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0B2E59] hover:bg-[#F5F7FA]"
                    >
                      <Inbox className="h-3.5 w-3.5" /> My Enquiries
                    </Link>
                    <button
                      onClick={() => { setMenuOpen(false); signOutCustomer(); }}
                      className="flex w-full items-center gap-2 border-t border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile search + menu */}
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Open search"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#0B2E59] sm:hidden"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              to="/agent"
              aria-label="Registered Service Partner"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#0B2E59] text-[#0B2E59] lg:hidden"
            >
              <HardHat className="h-4 w-4" />
            </Link>
            {customer ? (
              <Link
                to="/account"
                aria-label="My account"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#0B2E59] text-[#0B2E59] sm:hidden"
              >
                <User className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                aria-label="Customer login"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#0B2E59] text-[#0B2E59] sm:hidden"
              >
                <User className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#0B2E59] xl:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
        </div>

          {/* Mobile menu - visible below lg */}
          {open && (
            <div className="border-t border-[#E5E7EB] pb-3 pt-3 xl:hidden">
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: l.to === "/" }}
                    activeProps={{ className: "bg-[#F5F7FA] text-[#0B2E59]" }}
                    inactiveProps={{ className: "text-[#0B2E59]/80" }}
                    className="rounded-md px-3 py-2 text-sm font-medium"
                  >
                    {l.label}
                  </Link>
                ))}
                {!customer ? (
                  <button
                    onClick={() => { setOpen(false); setAuthOpen(true); }}
                    className="inline-flex items-center gap-2 rounded-md border border-[#0B2E59] bg-white px-3 py-2 text-sm font-bold text-[#0B2E59]"
                  >
                    <User className="h-4 w-4" />
                    Customer Login
                  </button>
                ) : (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-2 rounded-md border border-[#0B2E59] bg-white px-3 py-2 text-sm font-bold text-[#0B2E59]"
                    >
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                    <button
                      onClick={() => { setOpen(false); signOutCustomer(); }}
                      className="inline-flex items-center gap-2 rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-bold text-rose-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                )}
                <Link
                  to="/agent"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-md border border-[#0B2E59] bg-white px-3 py-2 text-sm font-bold text-[#0B2E59]"
                >
                  <HardHat className="h-4 w-4" />
                  Registered Service Partner
                </Link>
                <a
                  href={`tel:${SITE.contact.primary.phone}`}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-white"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              </nav>
            </div>
          )}
      </div>
      {/* Expanded horizontal search bar (below navbar, not a popup) */}
      {searchOpen && (
        <div className="animate-accordion-down overflow-hidden border-t border-[#E5E7EB] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 shrink-0 text-[#0B2E59]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results[0]) {
                    e.preventDefault();
                    goToResult(results[0].itemSlug);
                  }
                }}
                placeholder="Try “pest”, “ceiling”, “ac”, “plumber”…"
                className="min-w-0 flex-1 bg-transparent text-base text-[#0B2E59] placeholder:text-[#0B2E59]/50 focus:outline-none sm:text-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#0B2E59]/70 hover:bg-[#F5F7FA]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#0B2E59] hover:bg-[#F5F7FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {searchQuery.trim() && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-lg">
                {results.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-[#0B2E59]/70">
                    No services found for “{searchQuery}”.
                  </div>
                ) : (
                  <ul className="max-h-[60vh] divide-y divide-[#F1F2F4] overflow-y-auto">
                    {results.map((r) => {
                      const Icon = r.icon;
                      return (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => goToResult(r.itemSlug)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#F5F7FA] sm:px-4 sm:py-3"
                          >
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0B2E59]/5 text-[#0B2E59]">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-[#0B2E59]">{r.name}</span>
                              <span className="block truncate text-xs text-[#0B2E59]/60">{r.category} · {r.price}</span>
                            </span>
                            <span className="hidden shrink-0 rounded-full bg-[#D4AF37] px-3 py-1 text-[11px] font-black text-[#0B2E59] sm:inline-block">
                              Request
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <CustomerAuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
