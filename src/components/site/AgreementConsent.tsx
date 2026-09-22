import { useEffect, useMemo, useState } from "react";
import { Check, FileText, ShieldCheck, X } from "lucide-react";
import { TERMS } from "@/components/site/TermsAndOtp";
import type { EnquiryAgreement } from "@/lib/enquiries-store";

type Props = {
  phone: string;
  onChange: (agreement: EnquiryAgreement | null) => void;
  verifiedPhone?: string;
};

export function AgreementConsent({ phone, onChange, verifiedPhone }: Props) {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState<{ at: string } | null>(null);

  const normalized = useMemo(() => phone.replace(/\D/g, "").slice(-10), [phone]);
  const otpVerified = Boolean(
    verifiedPhone && normalized === verifiedPhone.replace(/\D/g, "").slice(-10),
  );

  // Reset if phone changes
  useEffect(() => {
    setAccepted(null);
  }, [phone]);

  useEffect(() => {
    if (accepted) {
      onChange({
        acceptedVia: "Mobile OTP Verification",
        otpStatus: "Verified",
        termsAccepted: true,
        acceptedAt: accepted.at,
        otpVerifiedAt: otpVerified ? accepted.at : accepted.at,
      });
    } else {
      onChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accepted]);

  const confirm = () => {
    setAccepted({ at: new Date().toISOString() });
    setOpen(false);
  };

  return (
    <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <label className="flex items-start gap-3 cursor-pointer">
        <span
          role="checkbox"
          aria-checked={Boolean(accepted)}
          onClick={(e) => {
            e.preventDefault();
            if (accepted) {
              setAccepted(null);
            } else {
              setAccepted({ at: new Date().toISOString() });
            }
          }}
          className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded border ${
            accepted ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
          }`}
        >
          {accepted && <Check className="h-3.5 w-3.5" />}
        </span>
        <span className="text-sm text-foreground">
          I have read and accepted the{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-bold text-primary underline underline-offset-2 hover:opacity-80"
          >
            Customer Service Agreement &amp; Terms and Conditions
          </button>
          .
          {accepted && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              <ShieldCheck className="h-3 w-3" /> Accepted
            </span>
          )}
        </span>
      </label>
      <div className="mt-2 pl-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          <FileText className="h-3.5 w-3.5" /> View Terms &amp; Conditions
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border bg-gradient-hero px-5 py-4 text-primary-foreground">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">Smart Solutions Groups</p>
                <h3 className="text-base font-black leading-tight sm:text-lg">
                  Customer Service Agreement &amp; Registration Acknowledgement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-primary-foreground/90 hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scroll area */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Customer Acceptance</p>
                <ol className="mt-2 space-y-2">
                  {TERMS.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground">
                      <span><b className="text-muted-foreground">{i + 1}.</b> {t}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-3 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
                <p className="font-bold text-foreground">Mobile Verification</p>
                <p className="mt-1">
                  Customer Mobile: <b className="text-foreground">+91 {normalized || "—"}</b>
                  {" · "}
                  OTP Status:{" "}
                  <b className={otpVerified ? "text-emerald-600" : "text-foreground"}>
                    {otpVerified ? "Verified" : "Pending"}
                  </b>
                </p>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-border bg-background px-5 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-accent px-5 py-2 text-sm font-bold text-accent-foreground shadow-card disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> Accept &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}