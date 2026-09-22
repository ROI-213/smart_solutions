import { useEffect } from "react";

/**
 * Global cinematic scroll layer — hydration-safe.
 *
 * IMPORTANT: this layer must NEVER add classes/attributes to React-managed
 * elements around hydration time. Doing so previously produced server/client
 * HTML mismatches (data-cine-tagged / cine-reveal appearing in the prerendered
 * HTML but not in the client render), which made React throw away the SSR tree
 * and re-render — the "blank / partial page until I refresh" bug.
 *
 * Content is therefore visible by default (CSS only). The only JS work is
 * parallax on explicitly authored [data-parallax] elements, and it starts only
 * after hydration has settled and the user actually scrolls.
 */
export function CinematicRoot() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parallaxEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]"),
    );
    if (parallaxEls.length === 0) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const vh = window.innerHeight;
        for (const el of parallaxEls) {
          const rect = el.getBoundingClientRect();
          const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
          const speed = Number(el.dataset.parallax) || 0.15;
          el.style.transform = `translate3d(0, ${(-progress * speed * 100).toFixed(2)}px, 0)`;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}