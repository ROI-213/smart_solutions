import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Publishable (public) project credentials — safe to ship in the client bundle.
// Kept inline so the frontend stays connected to the backend even if .env is absent.
const FALLBACK_URL = "https://betiyppfkhphspbzxgco.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldGl5cHBma2hwaHNwYnp4Z2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NzIwNDksImV4cCI6MjA5OTE0ODA0OX0.KezkAz3zbUoK88ADq-_fo-1mroFEIUr65o-GCrUfNGA";

const url = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL).trim();
const anon = ((import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined ?? FALLBACK_ANON).trim();

// Fallback stub so a missing env var never crashes modules that import this.
function makeStub(): SupabaseClient {
  const err = { message: "Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)." };
  const settled = { data: null, error: err, count: 0 };
  const base: any = function () {};
  const builder: any = new Proxy(base, {
    get: (_t, prop) => {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve(settled);
      if (prop === "getPublicUrl") return () => ({ data: { publicUrl: "" }, error: err });
      if (prop === Symbol.toPrimitive || prop === "toString" || prop === "valueOf") return () => "";
      return builder;
    },
    apply: () => builder,
  });
  return builder as SupabaseClient;
}

export const supabase: SupabaseClient = url && anon ? createClient(url, anon) : makeStub();

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn("[supabase] Missing env vars — using stub client. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}