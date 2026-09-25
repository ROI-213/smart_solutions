import { useEffect, useMemo, useState } from "react";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  HardHat, Lock, Mail, ShieldCheck, User, Phone, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, FileText, Check, X,
} from "lucide-react";
import {
  loginAgent, loginAgentByPhone, loginAgentByEmail, registerAgent, useAgentAuth, AGENT_SKILLS,
  SERVICE_CATEGORIES, DOCUMENT_LABEL, type AgentDocument, type DocumentType,
} from "@/lib/agents-store";
import { SITE } from "@/lib/site";
import { UploadField, MultiUploadField, type UploadedFile } from "@/components/site/UploadField";
import { EmailOtpVerify } from "@/components/site/EmailOtpVerify";
import { OtpVerify } from "@/components/site/OtpVerify";

export const Route = createFileRoute("/agent")({
  head: () => ({ meta: [{ title: "Registered Service Partner Portal — Smart Solutions Groups" }] }),
  component: AgentGate,
});

function AgentGate() {
  const { agent, ready } = useAgentAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && agent && pathname === "/agent") {
      navigate({ to: "/agent/dashboard", replace: true });
    }
  }, [ready, agent, pathname, navigate]);
  if (!ready) return null;
  if (!agent) return <AgentAuthScreen />;
  return <Outlet />;
}

function AgentAuthScreen() {
  const [mode, setMode] = useState<"login" | "otp" | "register">("login");
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-hero p-4 py-10">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur transition hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Home
        </button>
        <div className="mb-6 text-center text-primary-foreground">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <HardHat className="h-7 w-7" />
          </div>
          <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] opacity-90">{SITE.brand}</div>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Registered Service Partner / Technician Portal</h1>
          <p className="mt-1 text-sm opacity-90">Register, get verified, and receive job assignments.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-card p-5 text-foreground shadow-lift sm:p-8">
          <div className="mb-6 grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
            {(["login", "otp", "register"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k)}
                className={`rounded-full px-3 py-2 text-[11px] font-bold transition ${
                  mode === k ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground"
                }`}
              >
                {k === "login" ? "Password Login" : k === "otp" ? "Sign in with OTP" : "Register as Registered Service Partner"}
              </button>
            ))}
          </div>
          {mode === "login" && <AgentLoginForm />}
          {mode === "otp" && <AgentOtpLoginForm />}
          {mode === "register" && <AgentRegisterForm onDone={() => setMode("login")} />}
        </div>
      </div>
    </div>
  );
}

function AgentLoginForm() {
  const [id, setId] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    try { loginAgent(id, password); } catch (err: any) { setError(err.message ?? "Login failed."); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email or Phone" icon={<Mail className="h-4 w-4 text-muted-foreground" />}>
        <input required value={id} onChange={(e) => setId(e.target.value)} placeholder="you@example.com or 98xxxxxxxx" className="w-full bg-transparent text-sm outline-none" />
      </Field>
      <Field label="Password" icon={<Lock className="h-4 w-4 text-muted-foreground" />}>
        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent text-sm outline-none" />
      </Field>
      {error && <ErrorBox>{error}</ErrorBox>}
      <button type="submit" className="w-full rounded-full bg-gradient-accent py-2.5 text-sm font-bold text-accent-foreground shadow-card">Login</button>
    </form>
  );
}

function AgentOtpLoginForm() {
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!verified || !email.trim()) return;
    try {
      loginAgentByEmail(email.trim());
      navigate({ to: "/agent/dashboard" });
    } catch (e: any) {
      setError(e.message);
      setVerified(false);
    }
  }, [verified, email, navigate]);

  return (
    <div className="space-y-4">
      <Field label="Registered Email Address *" icon={<Mail className="h-4 w-4 text-muted-foreground" />}>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setVerified(false);
            setError(null);
          }}
          placeholder="your.email@example.com"
          className="w-full bg-transparent text-sm outline-none"
        />
      </Field>
      <EmailOtpVerify
        email={email}
        verified={verified}
        onVerified={() => setVerified(true)}
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      <p className="text-[11px] text-muted-foreground">
        A 6-digit verification code will be sent to your email inbox via our secure SMTP server. If you don't have an account yet, please use the <b>Register as Registered Service Partner</b> tab.
      </p>
    </div>
  );
}

// ============ REGISTRATION ============================================

const STEPS = [
  "Basic", "Identity", "Address", "Bank", "Work", "Safety", "Documents", "Terms", "Review",
] as const;

const TERMS = [
  { key: "mobile_identity_confirmed", label: "I confirm that the above mobile number and identity details belong to me and are correct." },
  { key: "work_agreement_accepted", label: "I agree to work with Smart Solutions Groups for customer leads, service coordination and assigned work." },
  { key: "company_leads_acknowledged", label: "I understand that all customer leads provided by Smart Solutions Groups are company-generated leads and must be handled professionally." },
  { key: "customer_data_misuse_not_allowed", label: "I will not misuse, share, sell, or use customer details for personal business or third-party purposes." },
  { key: "direct_customer_dealing_not_allowed", label: "I will not directly take company-provided customers for my personal business or bypass Smart Solutions Groups." },
  { key: "price_confirmation_rule_accepted", label: "I will not confirm any price, quotation, extra work, payment terms, or commitments with customers without approval from Smart Solutions Groups." },
  { key: "work_quality_responsibility_accepted", label: "I am responsible for my work quality, behaviour, communication, safety, tools, equipment, materials and workers under me." },
  { key: "customer_property_privacy_accepted", label: "I will respect customer property, privacy and maintain professional behaviour during service work." },
  { key: "theft_damage_misconduct_responsibility_accepted", label: "Any theft, loss, damage, cheating, misconduct, illegal activity, accident or injury caused by me or my workers will be my responsibility." },
  { key: "payment_approval_rule_accepted", label: "Any customer payment, extra charges or additional work must be informed to Smart Solutions Groups before proceeding." },
  { key: "complaint_resolution_cooperation_accepted", label: "If any customer complaint or issue occurs, I will immediately inform Smart Solutions Groups and cooperate for resolution." },
  { key: "company_reputation_accepted", label: "I will maintain the reputation, trust and service standards of Smart Solutions Groups." },
  { key: "company_rules_accepted", label: "I agree to follow all company rules, service procedures and customer handling guidelines." },
] as const;

type DocMap = Partial<Record<DocumentType, UploadedFile>>;
type MultiDocMap = Partial<Record<DocumentType, UploadedFile[]>>;

function AgentRegisterForm({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Basic
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [dob, setDob] = useState(""); const [address, setAddress] = useState(""); const [city, setCity] = useState("Bengaluru");
  const [pincode, setPincode] = useState(""); const [alternateMobile, setAlternateMobile] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  // Identity
  const [aadhaar, setAadhaar] = useState(""); const [pan, setPan] = useState("");
  const [drivingLicence, setDrivingLicence] = useState(""); const [voterId, setVoterId] = useState("");

  // Address
  const [permanentAddress, setPermanentAddress] = useState("");

  // Bank
  const [bankHolderName, setBankHolderName] = useState(""); const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState(""); const [bankAccount2, setBankAccount2] = useState("");
  const [ifsc, setIfsc] = useState(""); const [upi, setUpi] = useState(""); const [paymentNotes, setPaymentNotes] = useState("");

  // Work
  const [skills, setSkills] = useState<string[]>([]); const [serviceCategory, setServiceCategory] = useState<string>("Cleaning");
  const [experienceYears, setExperienceYears] = useState<number>(0); const [experienceDetails, setExperienceDetails] = useState("");
  const [previousWorkReference, setPreviousWorkReference] = useState(""); const [previousCompany, setPreviousCompany] = useState("");
  const [languages, setLanguages] = useState("Kannada, English"); const [preferredLocation, setPreferredLocation] = useState("");
  const [availableHours, setAvailableHours] = useState(""); const [toolsAvailable, setToolsAvailable] = useState("");
  const [workersCount, setWorkersCount] = useState<number>(0);

  // Safety
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [policeVerified, setPoliceVerified] = useState(false);
  const [usesVehicle, setUsesVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState(""); const [vehicleNumber, setVehicleNumber] = useState("");

  // Documents
  const [docs, setDocs] = useState<DocMap>({});
  const [multiDocs, setMultiDocs] = useState<MultiDocMap>({});
  function setDoc(t: DocumentType, f: UploadedFile | null) {
    setDocs((prev) => { const c = { ...prev }; if (f) c[t] = f; else delete c[t]; return c; });
  }
  function setMultiDoc(t: DocumentType, files: UploadedFile[]) {
    setMultiDocs((prev) => ({ ...prev, [t]: files }));
  }

  // Terms
  const [acceptedTerms, setAcceptedTerms] = useState<Record<string, boolean>>(
    () => Object.fromEntries(TERMS.map((t) => [t.key, false])),
  );
  const [consentAccepted, setConsentAccepted] = useState(false);
  const allTermsAccepted = TERMS.every((t) => acceptedTerms[t.key]);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const acceptAllTerms = (v: boolean) =>
    setAcceptedTerms(Object.fromEntries(TERMS.map((t) => [t.key, v])));

  // ---- Validation --------------------------------------------------
  const missingRequired = useMemo(() => {
    const list: string[] = [];
    const req: DocumentType[] = ["agent_photo", "aadhaar_card", "current_address_proof", "signed_agreement"];
    for (const t of req) if (!docs[t]) list.push(DOCUMENT_LABEL[t]);
    if (!docs.cancelled_cheque && !docs.passbook_front_page) list.push("Cancelled Cheque or Passbook Front Page");
    if (usesVehicle) {
      if (!docs.vehicle_rc) list.push(DOCUMENT_LABEL.vehicle_rc);
      if (!docs.vehicle_insurance) list.push(DOCUMENT_LABEL.vehicle_insurance);
      if (!docs.driving_licence) list.push(DOCUMENT_LABEL.driving_licence);
    }
    return list;
  }, [docs, usesVehicle]);

  function validateStep(): string | null {
    if (step === 0) {
      if (!name.trim()) return "Enter your full name.";
      if (phone.replace(/\D/g, "").length !== 10) return "Enter a valid 10-digit mobile number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
      if (!emailVerified) return "Please verify your email address with OTP before continuing.";
      if (password.length < 6) return "Password must be at least 6 characters.";
    }
    if (step === 3) {
      if (bankAccount && bankAccount !== bankAccount2) return "Account numbers do not match.";
    }
    if (step === 4 && skills.length === 0) return "Select at least one skill.";
    if (step === 6 && missingRequired.length > 0) return `Missing required documents: ${missingRequired.join(", ")}`;
    if (step === 7) {
      if (!allTermsAccepted) return "Please accept all Terms & Conditions before continuing.";
      if (!consentAccepted) return "Please accept the data collection consent.";
    }
    return null;
  }

  function next() {
    const err = validateStep(); if (err) { setError(err); return; }
    setError(null); setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() { setError(null); setStep((s) => Math.max(0, s - 1)); }

  function toggleSkill(s: string) {
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const err = validateStep(); if (err) { setError(err); return; }
    if (!emailVerified) { setError("Email OTP verification is required."); return; }
    if (missingRequired.length > 0) { setError(`Missing required documents: ${missingRequired.join(", ")}`); return; }
    if (!allTermsAccepted || !consentAccepted) { setError("Please accept all Terms & Conditions before submitting."); return; }

    // Build document list
    const documents: AgentDocument[] = [];
    Object.entries(docs).forEach(([t, f]) => {
      if (!f) return;
      documents.push({ id: `${t}-${Date.now()}`, type: t as DocumentType, name: f.name, mime: f.mime, size: f.size, dataUrl: f.dataUrl, uploadedAt: new Date().toISOString(), status: "Submitted" });
    });
    Object.entries(multiDocs).forEach(([t, files]) => {
      (files ?? []).forEach((f, i) => documents.push({ id: `${t}-${Date.now()}-${i}`, type: t as DocumentType, name: f.name, mime: f.mime, size: f.size, dataUrl: f.dataUrl, uploadedAt: new Date().toISOString(), status: "Submitted" }));
    });

    try {
      registerAgent({
        name, phone, email, password,
        gender, dob, address, city, pincode, alternateMobile,
        aadhaar, pan, drivingLicence, voterId,
        permanentAddress,
        bankHolderName, bankName, bankAccount, ifsc, upi, paymentNotes,
        skills, serviceCategory, experienceYears, experienceDetails, previousWorkReference, previousCompany,
        languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
        preferredLocation, availableHours, toolsAvailable, workersCount,
        workingAreas: preferredLocation,
        policeVerified, emergencyContactName, emergencyContactPhone, emergencyRelation,
        usesVehicle, vehicleType, vehicleNumber,
        emailVerified: true,
        mobileVerified: true,
        aadhaarVerified: false,
        idVerified: false,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        acceptedTerms,
        consentAccepted: true,
        agreementAcceptanceMethod: "Email OTP + Aadhaar / ID Verification",
        documents,
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "Registration failed.");
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-black text-primary">Registration submitted</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your Registered Service Partner / Technician registration has been submitted successfully. Our team will verify your details and contact you soon.
        </p>
        <button type="button" onClick={onDone} className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground">Go to Login</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-[#FFF8E1] to-white p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Smart Solutions Groups</div>
        <h3 className="mt-1 text-sm font-black text-[#0B2E59]">Registered Service Partner / Technician Agreement · Safety Documents List</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">Registered Service Partner / Technician verification ಮತ್ತು safety purpose ಗೆ ಈ documents collect ಮಾಡಬಹುದು.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
            <div className={`hidden text-[10px] font-bold uppercase tracking-wider md:block ${i <= step ? "text-primary" : "text-muted-foreground"}`}>{label}</div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-4 md:w-6 ${i < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic */}
      {step === 0 && (
        <div className="space-y-3">
          <SectionTitle n={1} title="Basic Registered Service Partner / Technician Details" />
          <div className="grid gap-3 sm:grid-cols-2">
            <PlainField label="Full Name *" value={name} onChange={setName} />
            <PlainField label="Mobile Number *" value={phone} onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit" />
            <PlainField label="Alternate Mobile" value={alternateMobile} onChange={(v) => setAlternateMobile(v.replace(/\D/g, "").slice(0, 10))} />
            <PlainField label="Email *" type="email" value={email} onChange={(v) => { setEmail(v); setEmailVerified(false); }} />
            <div className="sm:col-span-2">
              <EmailOtpVerify email={email} verified={emailVerified} onVerified={() => setEmailVerified(true)} />
            </div>
            <PlainField label="Password *" type="password" value={password} onChange={setPassword} placeholder="min 6 chars" />
            <SelectField label="Gender" value={gender} onChange={(v) => setGender(v as any)} options={["Male", "Female", "Other"]} />
            <PlainField label="Date of Birth" type="date" value={dob} onChange={setDob} />
            <PlainField label="City" value={city} onChange={setCity} />
            <PlainField label="Pincode" value={pincode} onChange={setPincode} maxLength={6} />
            <div className="sm:col-span-2"><PlainField label="Current Address" value={address} onChange={setAddress} /></div>
          </div>
        </div>
      )}

      {/* Step 2: Identity */}
      {step === 1 && (
        <div className="space-y-3">
          <SectionTitle n={2} title="Identity Proof" />
          <div className="grid gap-3 sm:grid-cols-2">
            <PlainField label="Aadhaar Card Number *" value={aadhaar} onChange={setAadhaar} maxLength={12} />
            <UploadField label="Aadhaar Card Copy" required value={docs.aadhaar_card} onChange={(f) => setDoc("aadhaar_card", f)} />
            <PlainField label="PAN Card Number" value={pan} onChange={(v) => setPan(v.toUpperCase())} maxLength={10} />
            <UploadField label="PAN Card" value={docs.pan_card} onChange={(f) => setDoc("pan_card", f)} />
            <PlainField label="Driving Licence Number" value={drivingLicence} onChange={setDrivingLicence} />
            <UploadField label="Driving Licence" value={docs.driving_licence} onChange={(f) => setDoc("driving_licence", f)} required={usesVehicle} />
            <PlainField label="Voter ID Number" value={voterId} onChange={setVoterId} />
            <UploadField label="Voter ID" value={docs.voter_id} onChange={(f) => setDoc("voter_id", f)} />
            <div className="sm:col-span-2"><UploadField label="Registered Service Partner / Technician Photo" required value={docs.agent_photo} onChange={(f) => setDoc("agent_photo", f)} hint="Passport-style photo, clear face." /></div>
          </div>
        </div>
      )}

      {/* Step 3: Address */}
      {step === 2 && (
        <div className="space-y-3">
          <SectionTitle n={3} title="Contact & Address Proof" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><PlainField label="Current Address" value={address} onChange={setAddress} /></div>
            <div className="sm:col-span-2"><PlainField label="Permanent Address" value={permanentAddress} onChange={setPermanentAddress} /></div>
            <UploadField label="Current Address Proof" required value={docs.current_address_proof} onChange={(f) => setDoc("current_address_proof", f)} hint="Electricity Bill / Rental Agreement / Aadhaar Address / Bank Statement" />
            <UploadField label="Permanent Address Proof" value={docs.permanent_address_proof} onChange={(f) => setDoc("permanent_address_proof", f)} />
          </div>
        </div>
      )}

      {/* Step 4: Bank */}
      {step === 3 && (
        <div className="space-y-3">
          <SectionTitle n={4} title="Bank & Payment Details" />
          <p className="text-[11px] text-muted-foreground">Commission / payment recordಗಾಗಿ bank details collect ಮಾಡಲಾಗುತ್ತದೆ.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <PlainField label="Bank Account Holder Name" value={bankHolderName} onChange={setBankHolderName} />
            <PlainField label="Bank Name" value={bankName} onChange={setBankName} />
            <PlainField label="Account Number" value={bankAccount} onChange={(v) => setBankAccount(v.replace(/\D/g, ""))} />
            <PlainField label="Confirm Account Number" value={bankAccount2} onChange={(v) => setBankAccount2(v.replace(/\D/g, ""))} />
            <PlainField label="IFSC Code" value={ifsc} onChange={(v) => setIfsc(v.toUpperCase())} />
            <PlainField label="UPI ID" value={upi} onChange={setUpi} placeholder="name@upi" />
            <div className="sm:col-span-2"><PlainField label="Payment Notes" value={paymentNotes} onChange={setPaymentNotes} /></div>
            <UploadField label="Cancelled Cheque" required={!docs.passbook_front_page} value={docs.cancelled_cheque} onChange={(f) => setDoc("cancelled_cheque", f)} />
            <UploadField label="Passbook Front Page" required={!docs.cancelled_cheque} value={docs.passbook_front_page} onChange={(f) => setDoc("passbook_front_page", f)} />
          </div>
        </div>
      )}

      {/* Step 5: Work */}
      {step === 4 && (
        <div className="space-y-4">
          <SectionTitle n={5} title="Work Details" />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Service Category" value={serviceCategory} onChange={setServiceCategory} options={SERVICE_CATEGORIES as unknown as string[]} />
            <PlainField label="Years of Experience" type="number" value={String(experienceYears)} onChange={(v) => setExperienceYears(Number(v) || 0)} />
            <div className="sm:col-span-2"><PlainField label="Experience Details" value={experienceDetails} onChange={setExperienceDetails} /></div>
            <PlainField label="Previous Company / Client" value={previousCompany} onChange={setPreviousCompany} />
            <PlainField label="Previous Work Reference" value={previousWorkReference} onChange={setPreviousWorkReference} />
            <PlainField label="Preferred Working Location" value={preferredLocation} onChange={setPreferredLocation} placeholder="e.g. Whitefield, HSR, Koramangala" />
            <PlainField label="Available Working Hours" value={availableHours} onChange={setAvailableHours} placeholder="e.g. 9 AM - 7 PM" />
            <PlainField label="Tools / Equipment Available" value={toolsAvailable} onChange={setToolsAvailable} />
            <PlainField label="Number of Workers Under You" type="number" value={String(workersCount)} onChange={(v) => setWorkersCount(Number(v) || 0)} />
            <div className="sm:col-span-2"><PlainField label="Languages" value={languages} onChange={setLanguages} placeholder="e.g. Kannada, English, Hindi" /></div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills / Specialization *</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {AGENT_SKILLS.map((s) => {
                const active = skills.includes(s);
                return (
                  <button type="button" key={s} onClick={() => toggleSkill(s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary"}`}>{s}</button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <UploadField label="Experience Certificate" value={docs.experience_certificate} onChange={(f) => setDoc("experience_certificate", f)} />
            <UploadField label="Reference Document" value={docs.reference_document} onChange={(f) => setDoc("reference_document", f)} />
            <MultiUploadField label="Work Portfolio Photos" value={multiDocs.portfolio_photo ?? []} onChange={(v) => setMultiDoc("portfolio_photo", v)} />
            <MultiUploadField label="Previous Work Proof" value={multiDocs.previous_work_proof ?? []} onChange={(v) => setMultiDoc("previous_work_proof", v)} />
          </div>
        </div>
      )}

      {/* Step 6: Safety */}
      {step === 5 && (
        <div className="space-y-4">
          <SectionTitle n={6} title="Safety & Responsibility Documents" />
          <div className="grid gap-3 sm:grid-cols-2">
            <PlainField label="Emergency Contact Person Name" value={emergencyContactName} onChange={setEmergencyContactName} />
            <PlainField label="Emergency Contact Mobile" value={emergencyContactPhone} onChange={(v) => setEmergencyContactPhone(v.replace(/\D/g, "").slice(0, 10))} />
            <PlainField label="Relationship With Emergency Contact" value={emergencyRelation} onChange={setEmergencyRelation} />
            <UploadField label="Emergency Contact ID Proof" value={docs.emergency_contact_id} onChange={(f) => setDoc("emergency_contact_id", f)} />
          </div>

          <label className="flex items-start gap-2 rounded-xl border border-border bg-background p-3 text-xs">
            <input type="checkbox" checked={policeVerified} onChange={(e) => setPoliceVerified(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />
            <span>I confirm that I am willing to complete <b>police verification</b> and background checks as required.</span>
          </label>

          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-xs font-bold text-[#0B2E59]">Do you use your own vehicle for work?</div>
            <div className="mt-2 flex gap-2">
              {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map((o) => (
                <button key={o.l} type="button" onClick={() => setUsesVehicle(o.v)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${usesVehicle === o.v ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{o.l}</button>
              ))}
            </div>
            {usesVehicle && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <PlainField label="Vehicle Type" value={vehicleType} onChange={setVehicleType} placeholder="Bike / Van / Car" />
                <PlainField label="Vehicle Number" value={vehicleNumber} onChange={(v) => setVehicleNumber(v.toUpperCase())} />
                <UploadField label="Vehicle RC" required value={docs.vehicle_rc} onChange={(f) => setDoc("vehicle_rc", f)} />
                <UploadField label="Vehicle Insurance" required value={docs.vehicle_insurance} onChange={(f) => setDoc("vehicle_insurance", f)} />
                <UploadField label="Driving Licence" required value={docs.driving_licence} onChange={(f) => setDoc("driving_licence", f)} />
              </div>
            )}
          </div>

          <UploadField label="Signed Registered Service Partner / Technician Agreement" required value={docs.signed_agreement} onChange={(f) => setDoc("signed_agreement", f)} hint="Download the agreement template, sign, and re-upload here." />
        </div>
      )}

      {/* Step 7: Documents review */}
      {step === 6 && (
        <div className="space-y-3">
          <SectionTitle n={7} title="Uploaded Documents Review" />
          <div className="rounded-xl border border-border bg-background p-3">
            {Object.keys(docs).length === 0 && Object.values(multiDocs).every((v) => !v || v.length === 0) ? (
              <p className="text-xs text-muted-foreground">No documents uploaded yet. Go back to earlier steps to upload.</p>
            ) : (
              <ul className="space-y-1.5">
                {Object.entries(docs).map(([t, f]) => f && (
                  <li key={t} className="flex items-center gap-2 text-xs">
                    <FileText className="h-3.5 w-3.5 text-[#0B2E59]" />
                    <span className="font-semibold">{DOCUMENT_LABEL[t as DocumentType]}</span>
                    <span className="truncate text-muted-foreground">— {f.name}</span>
                  </li>
                ))}
                {Object.entries(multiDocs).map(([t, files]) => (files ?? []).map((f, i) => (
                  <li key={`${t}-${i}`} className="flex items-center gap-2 text-xs">
                    <FileText className="h-3.5 w-3.5 text-[#0B2E59]" />
                    <span className="font-semibold">{DOCUMENT_LABEL[t as DocumentType]}</span>
                    <span className="truncate text-muted-foreground">— {f.name}</span>
                  </li>
                )))}
              </ul>
            )}
          </div>
          {missingRequired.length > 0 ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-700">
              <div className="mb-1 flex items-center gap-1 font-bold"><AlertCircle className="h-3.5 w-3.5" /> Missing required documents</div>
              <ul className="ml-5 list-disc">{missingRequired.map((m) => <li key={m}>{m}</li>)}</ul>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> All required documents uploaded.
            </div>
          )}
        </div>
      )}

      {/* Step 8: Terms */}
      {step === 7 && (
        <div className="space-y-3">
          <SectionTitle n={8} title="Terms & Conditions / Agreement Acceptance" />
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Smart Solutions Groups</div>
            <h3 className="mt-1 text-sm font-black text-[#0B2E59]">Registered Service Partner / Technician Service Agreement & Registration Acknowledgement</h3>
            <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-2">
              <Row k="Registered Service Partner / Technician Name" v={name || "—"} />
              <Row k="Mobile Number" v={phone || "—"} />
              <Row k="Alternate Number" v={alternateMobile || "—"} />
              <Row k="Address" v={[address, city, pincode].filter(Boolean).join(", ") || "—"} />
              <Row k="Aadhaar / ID" v={aadhaar || pan || drivingLicence || "—"} />
              <Row k="Date of Registration" v={new Date().toLocaleDateString()} />
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <span
                role="checkbox"
                aria-checked={allTermsAccepted}
                onClick={(e) => { e.preventDefault(); acceptAllTerms(!allTermsAccepted); }}
                className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded border ${
                  allTermsAccepted ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                }`}
              >
                {allTermsAccepted && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className="text-sm text-foreground">
                I have read and accepted the{" "}
                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  className="font-bold text-primary underline underline-offset-2 hover:opacity-80"
                >
                  Registered Service Partner Agreement &amp; Terms and Conditions
                </button>
                .
                {allTermsAccepted && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" /> Accepted
                  </span>
                )}
              </span>
            </label>
            <div className="mt-2 pl-8">
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
              >
                <FileText className="h-3.5 w-3.5" /> View Terms &amp; Conditions
              </button>
            </div>
          </div>

          {termsModalOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
              onClick={() => setTermsModalOpen(false)}
            >
              <div
                className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3 border-b border-border bg-gradient-hero px-5 py-4 text-primary-foreground">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">Smart Solutions Groups</p>
                    <h3 className="text-base font-black leading-tight sm:text-lg">
                      Registered Service Partner Agreement &amp; Terms and Conditions
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(false)}
                    className="rounded-lg p-1.5 text-primary-foreground/90 hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Acceptance</p>
                    <ol className="mt-2 space-y-2">
                      {TERMS.map((t, i) => (
                        <li key={t.key} className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground">
                          <span><b className="text-muted-foreground">{i + 1}.</b> {t.label}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-2 border-t border-border bg-background px-5 py-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { acceptAllTerms(true); setTermsModalOpen(false); }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-accent px-5 py-2 text-sm font-bold text-accent-foreground shadow-card"
                  >
                    <Check className="h-4 w-4" /> Accept &amp; Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <div className="font-bold text-[#0B2E59]">Kannada rules</div>
            <ul className="mt-1 list-disc pl-5">
              <li>Customer details misuse ಮಾಡಬಾರದು.</li>
              <li>Direct customer dealing ಮಾಡಬಾರದು.</li>
              <li>Theft / Damage / Misconduct responsibility clause accept ಮಾಡಬೇಕು.</li>
              <li>Professional behaviour agreement accept ಮಾಡಬೇಕು.</li>
            </ul>
          </div>

          <label className="flex items-start gap-2 rounded-xl border border-primary/40 bg-primary/5 p-3 text-xs">
            <input type="checkbox" checked={consentAccepted} onChange={(e) => setConsentAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />
            <span>I consent to Smart Solutions Groups collecting and verifying my identity, address, bank, work, safety, and agreement documents for registered service partner / technician registration and service assignment purposes.</span>
          </label>
        </div>
      )}

      {/* Step 9: Review */}
      {step === 8 && (
        <div className="space-y-3">
          <SectionTitle n={9} title="Review & Submit" />
          <div className="rounded-2xl border border-border bg-background p-4 text-[11px] space-y-2">
            <Group title="Basic"><Row k="Name" v={name} /><Row k="Mobile" v={phone} /><Row k="Email" v={email} /><Row k="City" v={city} /></Group>
            <Group title="Identity"><Row k="Aadhaar" v={aadhaar} /><Row k="PAN" v={pan} /></Group>
            <Group title="Bank"><Row k="Holder" v={bankHolderName} /><Row k="Bank" v={bankName} /><Row k="Account" v={bankAccount ? `••••${bankAccount.slice(-4)}` : "—"} /><Row k="IFSC" v={ifsc} /></Group>
            <Group title="Work"><Row k="Service" v={serviceCategory} /><Row k="Skills" v={skills.join(", ")} /><Row k="Experience" v={`${experienceYears} yrs`} /></Group>
            <Group title="Verification"><Row k="Mobile OTP" v={mobileVerified ? "Verified" : "Not verified"} /><Row k="Documents" v={`${Object.keys(docs).length + Object.values(multiDocs).reduce((n, v) => n + (v?.length ?? 0), 0)} uploaded`} /><Row k="Terms" v={allTermsAccepted ? "Accepted" : "Pending"} /></Group>
          </div>
          <div className="rounded-xl border border-border bg-background p-3 text-[11px]">
            <p>I have read, understood and accepted all the above terms and conditions.</p>
            <p className="mt-1">Registered Service Partner / Technician Accepted Through: <b>☑ Mobile OTP Verification &nbsp; ☑ Aadhaar / ID Verification</b></p>
            <p>Registered Service Partner / Technician Name: <b>{name || "—"}</b></p>
            <p>Smart Solutions Groups — Authorized Person: <b>Admin</b></p>
            <p>Date: <b>{new Date().toLocaleDateString()}</b></p>
          </div>
        </div>
      )}

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={back} disabled={step === 0} className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-bold text-foreground disabled:opacity-40">
          <ChevronLeft className="h-3.5 w-3.5" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground">
            Continue <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!mobileVerified || !allTermsAccepted || !consentAccepted || missingRequired.length > 0}
            className="rounded-full bg-gradient-accent px-6 py-2.5 text-xs font-bold text-accent-foreground shadow-card disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit Agent Registration
          </button>
        )}
      </div>
    </form>
  );
}

// ============ helpers ================================================

function SectionTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="border-b border-border pb-2">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Section {n}</div>
      <h4 className="mt-0.5 text-base font-black text-[#0B2E59]">{title}</h4>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex gap-1">
      <dt className="font-semibold text-muted-foreground">{k}:</dt>
      <dd className="text-foreground">{v || "—"}</dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[9px] font-black uppercase tracking-wider text-[#D4AF37]">{title}</div>
      <dl className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{children}</div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
        {icon}{children}
      </div>
    </label>
  );
}

function PlainField({ label, value, onChange, type = "text", placeholder, maxLength }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; maxLength?: number; }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}