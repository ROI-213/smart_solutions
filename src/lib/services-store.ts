import { useEffect, useState } from "react";
import { services as seedServices, slugifyItem } from "@/data/services";
import { supabase } from "@/integrations/supabase/client";

const CATS_KEY = "ssg_admin_categories_v1";
const SVCS_KEY = "ssg_admin_services_v1";
const EVENT = "ssg-store-change";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  shortDesc: string;
  longDesc: string;
  order: number;
  active: boolean;
};

export type AdminService = {
  id: string;
  number: number;
  name: string;
  slug: string;
  categoryId: string;
  shortDesc: string;
  longDesc: string;
  image: string;
  icon: string;
  included: string;
  suitableFor: string;
  order: number;
  featured: boolean;
  popular: boolean;
  active: boolean;
  seoTitle: string;
  seoDesc: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function seed(): { categories: AdminCategory[]; services: AdminService[] } {
  const categories: AdminCategory[] = seedServices.map((s, i) => ({
    id: s.slug,
    name: s.title,
    slug: s.slug,
    icon: s.icon.displayName || "Wrench",
    image: "",
    shortDesc: s.short,
    longDesc: s.short,
    order: i + 1,
    active: true,
  }));
  let n = 1;
  const services: AdminService[] = [];
  seedServices.forEach((cat) => {
    cat.items.forEach((item, idx) => {
      services.push({
        id: uid(),
        number: n++,
        name: item,
        slug: slugifyItem(item),
        categoryId: cat.slug,
        shortDesc: `${item} for homes and offices.`,
        longDesc: `Professional ${item.toLowerCase()} service delivered by trained technicians with quality assurance.`,
        image: "",
        icon: cat.icon.displayName || "Wrench",
        included: "On-site visit\nInspection\nMaterial as required\nInstallation/Repair\nTesting\nClean-up\nService warranty",
        suitableFor: "Apartments\nVillas\nOffices\nCommercial buildings",
        order: idx + 1,
        featured: idx === 0,
        popular: idx < 2,
        active: true,
        seoTitle: `${item} — Smart Solutions Groups`,
        seoDesc: `Book ${item} with Smart Solutions Groups. Trusted, on-time, and affordable.`,
      });
    });
  });
  return { categories, services };
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(CATS_KEY) || !localStorage.getItem(SVCS_KEY)) {
    const { categories, services } = seed();
    localStorage.setItem(CATS_KEY, JSON.stringify(categories));
    localStorage.setItem(SVCS_KEY, JSON.stringify(services));
  }
}

export function getCategories(): AdminCategory[] {
  ensureSeeded();
  return read<AdminCategory[]>(CATS_KEY, []).sort((a, b) => a.order - b.order);
}

export function getServices(): AdminService[] {
  ensureSeeded();
  return read<AdminService[]>(SVCS_KEY, []).sort((a, b) => a.number - b.number);
}

export function saveCategory(cat: AdminCategory) {
  const all = getCategories();
  const idx = all.findIndex((c) => c.id === cat.id);
  if (idx >= 0) all[idx] = cat;
  else all.push(cat);
  write(CATS_KEY, all);
  void mirrorCategoryToSupabase(cat);
}

export function deleteCategory(id: string) {
  write(
    CATS_KEY,
    getCategories().filter((c) => c.id !== id),
  );
  void supabase.from("categories").delete().eq("id", id);
  void supabase.from("categories").delete().eq("slug", id);
}

export function saveService(svc: AdminService) {
  const all = getServices();
  const idx = all.findIndex((s) => s.id === svc.id);
  if (idx >= 0) all[idx] = svc;
  else all.push(svc);
  write(SVCS_KEY, all);
  void mirrorServiceToSupabase(svc);
}

export function deleteService(id: string) {
  write(
    SVCS_KEY,
    getServices().filter((s) => s.id !== id),
  );
  void supabase.from("services").delete().eq("id", id);
}

export function resetStore() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CATS_KEY);
  localStorage.removeItem(SVCS_KEY);
  ensureSeeded();
  window.dispatchEvent(new Event(EVENT));
}

export function newCategory(): AdminCategory {
  return {
    id: uid(),
    name: "",
    slug: "",
    icon: "Wrench",
    image: "",
    shortDesc: "",
    longDesc: "",
    order: getCategories().length + 1,
    active: true,
  };
}

export function newService(): AdminService {
  const svcs = getServices();
  const cats = getCategories();
  return {
    id: uid(),
    number: (svcs.at(-1)?.number ?? 0) + 1,
    name: "",
    slug: "",
    categoryId: cats[0]?.id ?? "",
    shortDesc: "",
    longDesc: "",
    image: "",
    icon: "Wrench",
    included: "",
    suitableFor: "",
    order: 1,
    featured: false,
    popular: false,
    active: true,
    seoTitle: "",
    seoDesc: "",
  };
}

export function useStore() {
  const [snap, setSnap] = useState<{ categories: ReturnType<typeof getCategories>; services: ReturnType<typeof getServices>; tick: number }>({ categories: [], services: [], tick: 0 });
  useEffect(() => {
    const update = () => setSnap((s) => ({ categories: getCategories(), services: getServices(), tick: s.tick + 1 }));
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    // Hydrate from Supabase (backend-first). If backend has data, replace local cache.
    void hydrateFromSupabase().then((changed) => { if (changed) update(); });
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return snap;
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ---------- Supabase mirroring ----------

async function mirrorCategoryToSupabase(cat: AdminCategory) {
  try {
    await supabase.from("categories").upsert(
      {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.shortDesc,
        image_url: cat.image,
        icon: cat.icon,
        is_active: cat.active,
        display_order: cat.order,
      },
      { onConflict: "slug" },
    );
  } catch {
    /* offline / stub — local write already succeeded */
  }
}

async function mirrorServiceToSupabase(svc: AdminService) {
  try {
    // Look up backend category UUID by slug so the FK is correct.
    const cats = getCategories();
    const localCat = cats.find((c) => c.id === svc.categoryId);
    const catSlug = localCat?.slug ?? svc.categoryId;
    const { data: catRow } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", catSlug)
      .maybeSingle();
    const category_id = (catRow as { id?: string } | null)?.id ?? svc.categoryId;
    await supabase.from("services").upsert(
      {
        id: svc.id,
        name: svc.name,
        slug: svc.slug,
        category_id,
        short_description: svc.shortDesc,
        full_description: svc.longDesc,
        image_url: svc.image,
        icon: svc.icon,
        display_order: svc.order,
        is_active: svc.active,
        is_featured: svc.featured,
        show_on_homepage: svc.popular,
      },
      { onConflict: "slug" },
    );
  } catch {
    /* offline / stub — local write already succeeded */
  }
}

async function hydrateFromSupabase(): Promise<boolean> {
  try {
    const [{ data: cats }, { data: svcs }] = await Promise.all([
      supabase.from("categories").select("*"),
      supabase.from("services").select("*"),
    ]);
    const catRows = Array.isArray(cats) ? cats : [];
    const svcRows = Array.isArray(svcs) ? svcs : [];
    if (!svcRows.length) return false;

    const catBySlug = new Map<string, string>(); // slug -> backend id
    const localCats: AdminCategory[] = catRows.map((c: Record<string, unknown>, i) => {
      const slug = String(c.slug ?? c.id ?? "");
      const id = String(c.id ?? slug);
      catBySlug.set(slug, id);
      return {
        id,
        name: String(c.name ?? slug),
        slug,
        icon: String(c.icon ?? "Wrench"),
        image: String(c.image_url ?? ""),
        shortDesc: String(c.description ?? ""),
        longDesc: String(c.description ?? ""),
        order: Number(c.display_order ?? i + 1) || i + 1,
        active: c.is_active !== false,
      };
    });

    const localSvcs: AdminService[] = svcRows.map((s: Record<string, unknown>, i) => ({
      id: String(s.id ?? `${s.slug}`),
      number: Number(s.display_order ?? i + 1) || i + 1,
      name: String(s.name ?? ""),
      slug: String(s.slug ?? slugifyItem(String(s.name ?? ""))),
      categoryId: String(s.category_id ?? ""),
      shortDesc: String(s.short_description ?? ""),
      longDesc: String(s.full_description ?? ""),
      image: String(s.image_url ?? ""),
      icon: String(s.icon ?? "Wrench"),
      included: "On-site visit\nInspection\nProfessional execution\nQuality check",
      suitableFor: "Homes\nApartments\nVillas\nOffices\nCommercial buildings",
      order: Number(s.display_order ?? i + 1) || i + 1,
      featured: !!s.is_featured,
      popular: s.show_on_homepage !== false,
      active: s.is_active !== false,
      seoTitle: `${s.name} — Smart Solutions Groups`,
      seoDesc: `Book ${s.name} with Smart Solutions Groups.`,
    }));

    localStorage.setItem(CATS_KEY, JSON.stringify(localCats));
    localStorage.setItem(SVCS_KEY, JSON.stringify(localSvcs));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}