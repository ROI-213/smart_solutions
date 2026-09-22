import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, User as UserIcon, Phone, Mail, CheckCircle2 } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { useAllCustomers } from "@/lib/customer-auth";
import { useEnquiriesStore } from "@/lib/enquiries-store";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }] }),
  component: CustomersAdmin,
});

function CustomersAdmin() {
  const customers = useAllCustomers();
  const { enquiries } = useEnquiriesStore();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.phone, c.id].some((v) => v.toLowerCase().includes(s)),
    );
  }, [customers, q]);

  const requestsByCustomer = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of enquiries) {
      const key = e.customerId ?? `phone:${e.phone.replace(/\D/g, "").slice(-10)}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [enquiries]);

  return (
    <AdminShell title="Customers" subtitle={`${customers.length} registered customer${customers.length === 1 ? "" : "s"}`}>
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, phone or ID"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
          No customers yet. Customers appear here after they sign up on the website.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">OTP</th>
                <th className="px-4 py-3">Signed Up</th>
                <th className="px-4 py-3">Requests</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const count = requestsByCustomer.get(c.id) ?? requestsByCustomer.get(`phone:${c.phone}`) ?? 0;
                return (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-hero text-primary-foreground">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{c.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> +91 {c.phone}</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {c.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">{count}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}