import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import { sendAgentOtp, verifyAgentOtp } from "@/lib/otp.functions";

export function OtpVerify({
  phone,
  verified,
  onVerified,
  compact,
}: {
  phone: string;
  verified: boolean;
  onVerified: () => void;
  compact?: boolean;
}) {
  const send = useServerFn(sendAgentOtp);
  const verify = useServerFn(verifyAgentOtp);

  const [sent, setSent] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"send" | "verify" | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleSend() {
    setError(null);
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Enter a valid 10-digit mobile number first.");
      return;
    }
    setLoading("send");
    try {
      const r = await send({ data: { phone } });
      setToken(r.token);
      setSent(true);
      setDevCode(r.devCode);
      setNote(r.note);
      setCooldown(30);
    } catch (e: any) {
      setError(e?.message ?? "Could not send OTP.");
    } finally {
      setLoading(null);
    }
  }

  async function handleVerify() {
    setError(null);
    if (!token) return;
    setLoading("verify");
    try {
      await verify({ data: { phone, code, token } });
      onVerified();
    } catch (e: any) {
      setError(e?.message ?? "Verification failed.");
    } finally {
      setLoading(null);
    }
  }

  if (verified) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 ${compact ? "" : "mt-1"}`}>
        <CheckCircle2 className="h-3.5 w-3.5" /> Mobile Verified
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${compact ? "" : "rounded-xl border border-dashed border-[#D4AF37]/60 bg-[#FFF8E1]/40 p-3"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSend}
          disabled={loading !== null || cooldown > 0}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2E59] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50"
        >
          {loading === "send" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {sent ? (cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP") : "Send OTP"}
        </button>
        {sent && (
          <>
            <input
              value={code}
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className="w-32 rounded-md border border-border bg-background px-2 py-1.5 text-center text-sm font-bold tracking-widest outline-none"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading !== null || code.length !== 6}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50"
            >
              {loading === "verify" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              Verify
            </button>
          </>
        )}
      </div>
      {devCode && (
        <div className="rounded-md border border-[#D4AF37] bg-[#FFF8E1] px-2 py-1.5 text-[11px] font-semibold text-[#0B2E59]">
          Demo OTP (SMS not configured): <span className="font-black tracking-widest">{devCode}</span>
        </div>
      )}
      {note && !devCode && <div className="text-[10px] text-muted-foreground">{note}</div>}
      {error && <div className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">{error}</div>}
    </div>
  );
}