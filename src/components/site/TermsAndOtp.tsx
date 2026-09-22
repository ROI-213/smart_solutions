import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ShieldCheck, Smartphone, CheckCircle2, Lock } from "lucide-react";
import type { EnquiryAgreement } from "@/lib/enquiries-store";

export const TERMS: string[] = [
  "I confirm that the above mobile number and customer details provided by me are correct.",
  "I agree to take service assistance from Smart Solutions Groups for my required home/building service work.",
  "I understand that Smart Solutions Groups provides service coordination / technician arrangement / lead assistance as per my requirement.",
  "I agree that the assigned technician/worker may be a third-party service person arranged for completing the work.",
  "I have checked and accepted the service details, work requirements, quotation/charges and process before starting the work.",
  "Any extra work, additional materials or changes in work scope will be done only after my approval and applicable charges.",
  "I will provide correct information about my site condition, existing damages, requirements and work details.",
  "I am responsible for my personal valuable items, furniture, belongings and site safety during the service work.",
  "Technician/worker work quality, tools, materials, equipment, behaviour and personal dealings are subject to the technician/customer service understanding.",
  "Any theft, loss, damage, cheating, misconduct, illegal activity, accident, injury or any wrong action caused by technician/worker will be handled as per applicable rules and responsibility of concerned persons.",
  "I agree to clear the payment as per the agreed terms and conditions.",
  "I will inform Smart Solutions Groups immediately if any complaint or issue occurs during the service.",
  "I agree to maintain proper communication and cooperation with Smart Solutions Groups and assigned technician.",
];

type Props = {
  phone: string;
  onChange: (agreement: EnquiryAgreement | null) => void;
  verifiedPhone?: string; // if this matches the entered phone, skip OTP step
};

export function TermsAndOtp({ phone, onChange, verifiedPhone }: Props) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifiedAt, setVerifiedAt] = useState<string>("");
  const [acceptedAt, setAcceptedAt] = useState<string>("");
  const lastPhone = useRef(phone);

  const normalized = useMemo(() => phone.replace(/\D/g, "").slice(-10), [phone]);
  const phoneValid = normalized.length === 10;
  const prefilledVerified = Boolean(verifiedPhone && normalized === verifiedPhone.replace(/\D/g, "").slice(-10));

  // Auto-mark verified when phone matches the logged-in customer's verified number.
  useEffect(() => {
    if (prefilledVerified && !verifiedAt) {
      setVerifiedAt(new Date().toISOString());
    }
    if (!prefilledVerified && verifiedAt && lastPhone.current !== phone) {
      // handled by reset effect below
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledVerified]);

  // Reset OTP state if phone changes
  useEffect(() => {
    if (lastPhone.current !== phone) {
      lastPhone.current = phone;
      setOtpSent(false);
      setOtpCode("");
      setOtpInput("");
      setOtpError("");
      setVerifiedAt("");
      setAcceptedAt("");
    }
  }, [phone]);

  useEffect(() => {
    if (verifiedAt && acceptedAt) {
      onChange({
        acceptedVia: "Mobile OTP Verification",
        otpStatus: "Verified",
        termsAccepted: true,
        acceptedAt,
        otpVerifiedAt: verifiedAt,
      });
    } else {
      onChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedAt, acceptedAt]);

  const sendOtp = () => {
    if (!phoneValid) {
      setOtpError("Enter a valid 10-digit mobile number first.");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpCode(code);
    setOtpSent(true);
    setOtpError("");
  };

  const verifyOtp = () => {
    if (otpInput.trim() === otpCode) {
      setVerifiedAt(new Date().toISOString());
      setOtpError("");
    } else {
      setOtpError("Incorrect OTP. Please try again.");
    }
  };

  const acceptAll = () => {
    setAcceptedAt(new Date().toISOString());
  };

  const bothDone = Boolean(verifiedAt && acceptedAt);

  return (
    <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-black text-primary">Customer Acceptance &amp; OTP Agreement</h3>
          <p className="text-xs text-muted-foreground">Verify your mobile number and accept the terms below to submit your request.</p>
        </div>
      </div>

      {/* OTP block */}
      <div className="mt-4 rounded-xl border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Smartphone className="h-3.5 w-3.5" /> Mobile OTP Verification
        </div>
        {!verifiedAt ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!otpSent ? (
              <button
                type="button"
                onClick={sendOtp}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Send OTP to {phoneValid ? `+91 ${normalized}` : "mobile"}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
                  className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
                >
                  Verify OTP
                </button>
                <button
                  type="button"
                  onClick={sendOtp}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Resend
                </button>
                <span className="text-[11px] text-muted-foreground">Demo OTP: <b className="text-foreground">{otpCode}</b></span>
              </>
            )}
            {otpError && <p className="w-full text-xs text-destructive">{otpError}</p>}
          </div>
        ) : (
          <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Mobile OTP Verified for +91 {normalized}
          </p>
        )}
      </div>

      {/* Terms block */}
      <div className="mt-4 rounded-xl border border-border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Terms &amp; Conditions</div>
          <button
            type="button"
            onClick={acceptAll}
            disabled={!verifiedAt || Boolean(acceptedAt)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-card disabled:opacity-50"
          >
            {acceptedAt ? <><Lock className="h-3.5 w-3.5" /> Terms Locked &amp; Accepted</> : <><Check className="h-3.5 w-3.5" /> Select All &amp; Accept Terms</>}
          </button>
        </div>
        {!verifiedAt && (
          <p className="mt-2 text-[11px] text-muted-foreground">Verify your mobile OTP first to accept the terms.</p>
        )}
        <ol className="mt-3 space-y-2">
          {TERMS.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-foreground">
              <span
                aria-checked={Boolean(acceptedAt)}
                role="checkbox"
                className={`mt-0.5 grid h-4 w-4 flex-shrink-0 place-items-center rounded border ${
                  acceptedAt ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                }`}
              >
                {acceptedAt && <Check className="h-3 w-3" />}
              </span>
              <span><b className="text-muted-foreground">{i + 1}.</b> {t}</span>
            </li>
          ))}
        </ol>
      </div>

      {bothDone && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          Mobile OTP Verified. Customer has accepted all terms and conditions.
        </div>
      )}
    </div>
  );
}