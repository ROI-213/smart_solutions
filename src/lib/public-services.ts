import { useEffect, useMemo, useState } from "react";
import { Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { services as seedServices, slugifyItem, type Service } from "@/data/services";
import { supabase } from "@/integrations/supabase/client";

type AnyRow = Record<string, unknown>;

const LOCAL_CATEGORIES_KEY = "ssg_admin_categories_v1";
const LOCAL_SERVICES_KEY = "ssg_admin_services_v1";

export type PublicServiceItem = {
  id: string;
  number: number;
  name: string;
  slug: string;
  categoryId: string;
  shortDesc: string;
  longDesc: string;
  image: string;
  icon: LucideIcon;
  included: string;
  suitableFor: string;
  order: number;
  featured: boolean;
  popular: boolean;
  active: boolean;
  seoTitle: string;
  seoDesc: string;
};

export type PublicServiceCategory = Omit<Service, "items"> & {
  id: string;
  image: string;
  longDesc: string;
  order: number;
  active: boolean;
  items: string[];
  serviceItems: PublicServiceItem[];
};

export type PublicServicesState = {
  catalog: PublicServiceCategory[];
  loading: boolean;
  error: string | null;
  source: "static" | "backend";
};

const seedIconBySlug = new Map(seedServices.map((category) => [category.slug, category.icon]));
const seedCategoryBySlug = new Map(seedServices.map((category) => [category.slug, category]));

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function pickString(row: AnyRow, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = asString(row[key]);
    if (value) return value;
  }
  return fallback;
}

function readLocalRows(key: string): AnyRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as AnyRow[]) : [];
  } catch {
    return [];
  }
}

function getLocalAdminRows() {
  return {
    categories: readLocalRows(LOCAL_CATEGORIES_KEY),
    services: readLocalRows(LOCAL_SERVICES_KEY),
  };
}

function pickNumber(row: AnyRow, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function pickBool(row: AnyRow, keys: string[], fallback = true) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "active", "published", "enabled"].includes(normalized)) return true;
      if (["false", "0", "no", "inactive", "draft", "disabled", "archived"].includes(normalized)) return false;
    }
  }
  return fallback;
}

function slugify(value: string) {
  return slugifyItem(value || "service");
}

function makeSeedCatalog(): PublicServiceCategory[] {
  let number = 1;
  return seedServices.map((category, categoryIndex) => {
    const serviceItems = category.items.map((item, itemIndex) => ({
      id: `${category.slug}:${slugifyItem(item)}`,
      number: number++,
      name: item,
      slug: slugifyItem(item),
      categoryId: category.slug,
      shortDesc: `${item} for homes, apartments, villas, offices and buildings.`,
      longDesc: `Professional ${item.toLowerCase()} service delivered by trained technicians with quality assurance.`,
      image: "",
      icon: category.icon,
      included: "On-site visit\nInspection\nProfessional execution\nTesting\nClean-up\nService support",
      suitableFor: "Homes\nApartments\nVillas\nOffices\nCommercial buildings",
      order: itemIndex + 1,
      featured: itemIndex === 0,
      popular: itemIndex < 2,
      active: true,
      seoTitle: `${item} — Smart Solutions Groups`,
      seoDesc: `Book ${item} with Smart Solutions Groups. Trusted, on-time, and affordable.`,
    }));

    return {
      ...category,
      id: category.slug,
      image: "",
      longDesc: category.short,
      order: categoryIndex + 1,
      active: true,
      items: serviceItems.map((item) => item.name),
      serviceItems,
    };
  });
}

function normalizeCategory(row: AnyRow, index: number): PublicServiceCategory | null {
  const title = pickString(row, ["name", "title", "category_name", "category"], "");
  const slug = slugify(pickString(row, ["slug", "category_slug"], title));
  if (!title || !slug) return null;
  const seed = seedCategoryBySlug.get(slug);
  const icon = seedIconBySlug.get(slug) ?? Wrench;

  return {
    slug,
    title,
    short: pickString(row, ["short_desc", "short_description", "shortDesc", "description", "short", "subtitle"], seed?.short ?? "Professional home and building services across Bengaluru."),
    icon,
    id: pickString(row, ["id", "category_id"], slug),
    image: pickString(row, ["image", "image_url", "banner", "banner_url", "photo_url", "thumbnail_url"]),
    longDesc: pickString(row, ["long_desc", "long_description", "longDesc", "details", "description"], seed?.short ?? ""),
    order: pickNumber(row, ["order", "display_order", "sort_order", "position", "number"], index + 1),
    active: pickBool(row, ["active", "is_active", "enabled", "published", "status"], true),
    items: [],
    serviceItems: [],
  };
}

function normalizeService(row: AnyRow, index: number, categoryLookup: Map<string, PublicServiceCategory>): PublicServiceItem | null {
  const name = pickString(row, ["name", "title", "service_name", "service", "label"], "");
  const slug = slugify(pickString(row, ["slug", "service_slug"], name));
  if (!name || !slug) return null;

  const rawCategory = pickString(row, ["category_id", "categoryId", "category_slug", "category", "category_name", "category_title"]);
  const category = categoryLookup.get(rawCategory) ?? categoryLookup.get(slugify(rawCategory));
  const categoryId = category?.slug ?? slugify(rawCategory);
  const icon = category?.icon ?? Wrench;

  return {
    id: pickString(row, ["id", "service_id"], `${categoryId}:${slug}`),
    number: pickNumber(row, ["number", "service_number", "serial", "sort_order", "display_order"], index + 1),
    name,
    slug,
    categoryId,
    shortDesc: pickString(row, ["short_desc", "short_description", "shortDesc", "description", "summary", "short"], `${name} for homes and offices.`),
    longDesc: pickString(row, ["long_desc", "long_description", "longDesc", "details", "description"], `Professional ${name.toLowerCase()} service delivered by trained technicians.`),
    image: pickString(row, ["image", "image_url", "photo_url", "thumbnail", "thumbnail_url", "banner_url"]),
    icon,
    included: pickString(row, ["included", "what_is_included", "includes"], "On-site visit\nInspection\nProfessional execution\nQuality check"),
    suitableFor: pickString(row, ["suitable_for", "suitableFor", "properties"], "Homes\nApartments\nVillas\nOffices"),
    order: pickNumber(row, ["order", "display_order", "sort_order", "position"], index + 1),
    featured: pickBool(row, ["featured", "is_featured"], false),
    popular: pickBool(row, ["popular", "is_popular", "most_booked"], false),
    active: pickBool(row, ["active", "is_active", "enabled", "published", "status"], true),
    seoTitle: pickString(row, ["seo_title", "seoTitle", "meta_title"], `${name} — Smart Solutions Groups`),
    seoDesc: pickString(row, ["seo_desc", "seo_description", "seoDesc", "meta_description"], `Book ${name} with Smart Solutions Groups.`),
  };
}

function mergeCatalog(categoryRows: AnyRow[], serviceRows: AnyRow[]) {
  const catalog = makeSeedCatalog();
  const bySlug = new Map(catalog.map((category) => [category.slug, category]));
  const categoryLookup = new Map<string, PublicServiceCategory>();

  for (const category of catalog) {
    categoryLookup.set(category.id, category);
    categoryLookup.set(category.slug, category);
    categoryLookup.set(category.title, category);
    categoryLookup.set(slugify(category.title), category);
  }

  categoryRows.forEach((row, index) => {
    const normalized = normalizeCategory(row, index);
    if (!normalized || !normalized.active) return;
    const existing = bySlug.get(normalized.slug);
    if (existing) {
      existing.title = normalized.title || existing.title;
      existing.short = normalized.short || existing.short;
      existing.image = normalized.image || existing.image;
      existing.longDesc = normalized.longDesc || existing.longDesc;
      existing.order = normalized.order || existing.order;
      categoryLookup.set(normalized.id, existing);
      categoryLookup.set(normalized.slug, existing);
      categoryLookup.set(normalized.title, existing);
      categoryLookup.set(slugify(normalized.title), existing);
      return;
    }
    bySlug.set(normalized.slug, normalized);
    catalog.push(normalized);
    categoryLookup.set(normalized.id, normalized);
    categoryLookup.set(normalized.slug, normalized);
    categoryLookup.set(normalized.title, normalized);
    categoryLookup.set(slugify(normalized.title), normalized);
  });

  serviceRows.forEach((row, index) => {
    const normalized = normalizeService(row, index, categoryLookup);
    if (!normalized || !normalized.active) return;
    let category = bySlug.get(normalized.categoryId);
    if (!category) {
      category = bySlug.get("maintenance-services") ?? catalog[0];
      normalized.categoryId = category.slug;
    }
    const duplicateIndex = category.serviceItems.findIndex(
      (item) => item.slug === normalized.slug || item.name.toLowerCase() === normalized.name.toLowerCase(),
    );
    if (duplicateIndex >= 0) {
      category.serviceItems[duplicateIndex] = {
        ...category.serviceItems[duplicateIndex],
        ...normalized,
        image: normalized.image || category.serviceItems[duplicateIndex].image,
      };
    } else {
      category.serviceItems.push(normalized);
    }
  });

  return catalog
    .map((category) => {
      const serviceItems = category.serviceItems
        .filter((item) => item.active)
        .sort((a, b) => a.order - b.order || a.number - b.number || a.name.localeCompare(b.name));
      return { ...category, serviceItems, items: serviceItems.map((item) => item.name) };
    })
    .filter((category) => category.active && category.serviceItems.length > 0)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export const staticServicesCatalog = makeSeedCatalog();

export async function fetchPublicServicesCatalog(): Promise<PublicServiceCategory[]> {
  const localRows = getLocalAdminRows();
  const [categoryResult, serviceResult] = await Promise.all([
    supabase.from("categories").select("*"),
    supabase.from("services").select("*"),
  ]);

  const backendCategories = Array.isArray(categoryResult.data) ? (categoryResult.data as AnyRow[]) : [];
  const backendServices = Array.isArray(serviceResult.data) ? (serviceResult.data as AnyRow[]) : [];

  // Backend-first: if Supabase returned any services, treat it as the source of truth.
  // Seed catalog is only used as a fallback when backend is completely empty (pre-migration).
  if (backendServices.length > 0) {
    return mergeBackendCatalog(backendCategories, backendServices);
  }

  if (categoryResult.error && serviceResult.error) {
    if (localRows.categories.length || localRows.services.length) {
      return mergeCatalog(localRows.categories, localRows.services);
    }
    throw new Error(`${categoryResult.error.message}; ${serviceResult.error.message}`);
  }

  // No backend data yet — fall back to local admin overrides + seed.
  return mergeCatalog(localRows.categories, localRows.services);
}

// Backend-only merge: builds the catalog purely from Supabase rows, without seed items.
// Missing categories are synthesised from service.category slugs so nothing is dropped.
function mergeBackendCatalog(categoryRows: AnyRow[], serviceRows: AnyRow[]): PublicServiceCategory[] {
  const catalog: PublicServiceCategory[] = [];
  const bySlug = new Map<string, PublicServiceCategory>();
  const lookup = new Map<string, PublicServiceCategory>();

  const addCategory = (cat: PublicServiceCategory) => {
    catalog.push(cat);
    bySlug.set(cat.slug, cat);
    lookup.set(cat.id, cat);
    lookup.set(cat.slug, cat);
    lookup.set(cat.title, cat);
    lookup.set(slugify(cat.title), cat);
  };

  categoryRows.forEach((row, index) => {
    const normalized = normalizeCategory(row, index);
    if (!normalized || !normalized.active) return;
    if (bySlug.has(normalized.slug)) return;
    addCategory(normalized);
  });

  serviceRows.forEach((row, index) => {
    const normalized = normalizeService(row, index, lookup);
    if (!normalized || !normalized.active) return;
    let category = bySlug.get(normalized.categoryId);
    if (!category) {
      // Synthesise a placeholder category so the service is not dropped.
      const seed = seedCategoryBySlug.get(normalized.categoryId);
      category = {
        slug: normalized.categoryId,
        title: seed?.title ?? normalized.categoryId.replace(/-/g, " "),
        short: seed?.short ?? "",
        icon: seed?.icon ?? Wrench,
        id: normalized.categoryId,
        image: "",
        longDesc: "",
        order: catalog.length + 1,
        active: true,
        items: [],
        serviceItems: [],
      };
      addCategory(category);
    }
    const dupIndex = category.serviceItems.findIndex(
      (item) => item.slug === normalized.slug || item.name.toLowerCase() === normalized.name.toLowerCase(),
    );
    if (dupIndex >= 0) {
      category.serviceItems[dupIndex] = { ...category.serviceItems[dupIndex], ...normalized };
    } else {
      category.serviceItems.push(normalized);
    }
  });

  return catalog
    .map((category) => {
      const serviceItems = category.serviceItems
        .filter((item) => item.active)
        .sort((a, b) => a.order - b.order || a.number - b.number || a.name.localeCompare(b.name));
      return { ...category, serviceItems, items: serviceItems.map((item) => item.name) };
    })
    .filter((category) => category.serviceItems.length > 0)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function usePublicServicesCatalog(): PublicServicesState {
  const initialCatalog = useMemo(() => staticServicesCatalog, []);
  const [state, setState] = useState<PublicServicesState>({
    catalog: initialCatalog,
    loading: true,
    error: null,
    source: "static",
  });

  useEffect(() => {
    let cancelled = false;
    fetchPublicServicesCatalog()
      .then((catalog) => {
        if (!cancelled) setState({ catalog, loading: false, error: null, source: "backend" });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ catalog: initialCatalog, loading: false, error: error.message, source: "static" });
      });

    return () => {
      cancelled = true;
    };
  }, [initialCatalog]);

  return state;
}

export function findServiceItemInCatalog(catalog: PublicServiceCategory[], slug: string) {
  for (const category of catalog) {
    for (const item of category.serviceItems) {
      if (item.slug === slug || slugifyItem(item.name) === slug) return { item, category };
    }
  }
  return undefined;
}