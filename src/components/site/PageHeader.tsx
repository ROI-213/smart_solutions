export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="bg-gradient-hero text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        {eyebrow && <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-secondary">{eyebrow}</div>}
        <h1 className="max-w-3xl text-3xl font-black sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base text-primary-foreground/80 sm:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
