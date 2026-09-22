import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/supabase-check")({
  head: () => ({ meta: [{ title: "Supabase Connection Check" }] }),
  component: SupabaseCheck,
});

function SupabaseCheck() {
  const [status, setStatus] = useState("Checking...");
  const [rows, setRows] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [table, setTable] = useState("test");
  const KNOWN_TABLES = ["test", "enquiries", "customers", "site_content", "categories", "services", "testimonials"];

  async function run(tbl: string) {
    const name = tbl.trim();
    if (!name) {
      setError("Table name is required.");
      setStatus("Idle.");
      return;
    }
    setStatus("Querying...");
    setRows(null);
    setError(null);
    const { data, error } = await supabase.from(name).select("*").limit(10);
    if (error) {
      setError(`${error.code ?? ""} ${error.message}`);
      setStatus("Connected to Supabase (query failed — see error).");
    } else {
      setRows(data);
      setStatus(`OK — fetched ${data?.length ?? 0} row(s) from "${tbl}".`);
    }
  }

  useEffect(() => {
    run(table);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Supabase Connection Check</h1>
      <p className="text-sm text-muted-foreground">
        URL: <code>{import.meta.env.VITE_SUPABASE_URL as string}</code>
      </p>
      <div className="flex gap-2">
        <select
          value={KNOWN_TABLES.includes(table) ? table : ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v) { setTable(v); run(v); }
          }}
          className="rounded border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Preset…</option>
          {KNOWN_TABLES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm"
          placeholder="table name"
        />
        <button
          onClick={() => run(table)}
          className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Fetch
        </button>
      </div>
      <div className="rounded border border-border bg-muted p-3 text-sm">{status}</div>
      {error && (
        <pre className="rounded border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive whitespace-pre-wrap">
{error}
        </pre>
      )}
      {rows != null && (
        <pre className="rounded border border-border bg-background p-3 text-xs overflow-auto">
{JSON.stringify(rows, null, 2)}
        </pre>
      )}
    </div>
  );
}