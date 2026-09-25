import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase, GraduationCap, User, FileText, ShieldCheck, CheckCircle2,
  ChevronRight, ChevronLeft, Upload, X, Loader2, ArrowRight, Sparkles,
  Building2, Users, TrendingUp, Award, Handshake, Clock, Info,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import heroImg from "@/assets/careers-hero.jpg";
import {
  DEFAULT_POSITIONS, DEFAULT_LOCATIONS, EMPLOYMENT_TYPES, QUALIFICATIONS,
  LANGUAGES, NOTICE_PERIODS, generateReference, uploadCareerFile,
  submitCareerApplication, saveCareerApplicationLocally, getCareerErrorMessage,
  type CandidateType,
} from "@/lib/careers";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Join Smart Solutions Groups | Bengaluru Jobs" },
      { name: "description", content: "Apply for jobs at Smart Solutions Groups Bengaluru. Openings for electricians, plumbers, carpenters, coordinators, field executives and office roles." },
      { property: "og:title", content: "Careers at Smart Solutions Groups — Bengaluru" },
      { property: "og:description", content: "Build your career with a trusted Bengaluru home & building services team. Freshers and experienced professionals welcome." },
    ],
  }),
  component: CareersPage,
});

const STEPS = [
  { key: "candidate", label: "Candidate", Icon: Briefcase },
  { key: "personal", label: "Personal", Icon: User },
  { key: "education", label: "Education", Icon: GraduationCap },
  { key: "experience", label: "Experience", Icon: TrendingUp },
  { key: "documents", label: "Documents", Icon: FileText },
  { key: "submit", label: "Submit", Icon: ShieldCheck },
] as const;

type FilesMap = Record<string, File[]>;

function CareersPage() {
  const [step, setStep] = useState(0);
  const formTop = useRef<HTMLDivElement | null>(null);

  const [candidateType, setCandidateType] = useState<CandidateType | "">("");
  const [position, setPosition] = useState("");
  const [customPosition, setCustomPosition] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("Indian");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Karnataka");
  const [pin, setPin] = useState("");

  const [qualification, setQualification] = useState("");
  const [customQualification, setCustomQualification] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [yearOfPassing, setYearOfPassing] = useState("");
  const [percentage, setPercentage] = useState("");

  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState("");

  const [expYears, setExpYears] = useState("");
  const [expMonths, setExpMonths] = useState("");
  const [lastCompany, setLastCompany] = useState("");
  const [lastTitle, setLastTitle] = useState("");
  const [lastSalary, setLastSalary] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState("Monthly");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [expectedPeriod, setExpectedPeriod] = useState("Monthly");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [customNotice, setCustomNotice] = useState("");
  const [keySkills, setKeySkills] = useState<string[]>([]);
  const [reasonLeaving, setReasonLeaving] = useState("");

  const [files, setFiles] = useState<FilesMap>({});
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [declaration, setDeclaration] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isExperienced = candidateType === "experienced";

  const scrollFormTop = () => {
    formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!candidateType) return "Please select a candidate type.";
      if (!position) return "Please select a position.";
      if (position === "Other" && !customPosition.trim()) return "Please specify the position.";
      if (!preferredLocation) return "Please select a preferred location.";
      if (!employmentType) return "Please select an employment type.";
    }
    if (step === 1) {
      if (!fullName.trim()) return "Please enter your full name.";
      if (!dob) return "Please enter your date of birth.";
      if (new Date(dob) > new Date()) return "Date of birth cannot be in the future.";
      if (!gender) return "Please select gender.";
      if (!/^[6-9]\d{9}$/.test(mobile.trim())) return "Please provide a valid 10-digit Indian mobile number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please provide a valid email address.";
      if (!address.trim()) return "Please provide your current address.";
    }
    if (step === 2) {
      if (!qualification) return "Please select your highest qualification.";
      if (qualification === "Other" && !customQualification.trim()) return "Please specify your qualification.";
      if (yearOfPassing) {
        const y = Number(yearOfPassing);
        if (!/^\d{4}$/.test(yearOfPassing) || y < 1950 || y > new Date().getFullYear() + 1)
          return "Please enter a valid year of passing.";
      }
    }
    if (step === 3 && isExperienced) {
      if (!expYears && !expMonths) return "Please enter your total experience.";
      if (!lastCompany.trim()) return "Please enter your current/last company.";
      if (!lastTitle.trim()) return "Please enter your current/last job title.";
      if (keySkills.length === 0) return "Please add at least one key skill.";
    }
    if (step === 4) {
      if (!files.resume?.length) return "Please upload your resume/CV.";
      if (!files.photo?.length) return "Please upload a passport-size photo.";
      if (!files.governmentId?.length) return "Please upload a government ID proof.";
      if (!files.educationalCertificates?.length) return "Please upload at least one educational certificate.";
      if (isExperienced) {
        if (!files.experienceCertificate?.length) return "Please upload experience certificate(s).";
        if (!files.relievingLetter?.length) return "Please upload the relieving letter.";
        if (!files.salarySlips?.length) return "Please upload at least one salary slip.";
      }
    }
    if (step === 5) {
      if (!declaration) return "Please accept the declaration.";
      if (!privacyAccepted) return "Please accept the Privacy Policy and Terms & Conditions.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    scrollFormTop();
  };
  const back = () => { setError(null); setStep((s) => Math.max(0, s - 1)); scrollFormTop(); };

  const submit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setSubmitting(true);
    setError(null);
    const ref = generateReference();

    const documents: Record<string, unknown> = {};
    try {
      const uploadField = async (field: string, multi = false) => {
        const fs = files[field] ?? [];
        if (!fs.length) return;
        setUploadStatus(`Uploading ${field}…`);
        const paths: unknown[] = [];
        for (const f of fs) {
          const { path, error: upErr } = await uploadCareerFile(ref, field, f);
          if (upErr) {
            console.warn(`[careers] upload failed for ${field}/${f.name}:`, upErr);
            paths.push({ name: f.name, size: f.size, type: f.type, uploadStatus: "not_uploaded" });
          } else {
            paths.push(path);
          }
        }
        documents[field] = multi ? paths : paths[0];
      };
      await uploadField("resume");
      await uploadField("photo");
      await uploadField("governmentId");
      await uploadField("educationalCertificates", true);
      if (isExperienced) {
        await uploadField("experienceCertificate", true);
        await uploadField("relievingLetter");
        await uploadField("salarySlips", true);
      }
      await uploadField("professionalCertifications", true);
      await uploadField("drivingLicense");
      await uploadField("passport");
      await uploadField("portfolio");
      await uploadField("otherDocuments", true);

      setUploadStatus("Saving application…");
      const application = {
        application_reference: ref,
        candidate_type: candidateType as CandidateType,
        position_applied_for: position,
        custom_position: position === "Other" ? customPosition.trim() : null,
        preferred_job_location: preferredLocation,
        employment_type: employmentType,
        full_name: fullName.trim(),
        date_of_birth: dob,
        gender,
        nationality: nationality || null,
        mobile_number: mobile.trim(),
        email: email.trim(),
        current_address: address.trim(),
        city: city || null,
        state: stateName || null,
        pin_code: pin || null,
        highest_qualification: qualification,
        custom_qualification: qualification === "Other" ? customQualification.trim() : null,
        course_degree: course || null,
        institution: institution || null,
        year_of_passing: yearOfPassing ? Number(yearOfPassing) : null,
        percentage_cgpa: percentage || null,
        technical_skills: technicalSkills.length ? technicalSkills : null,
        languages_known: languages.length ? languages : null,
        total_experience_years: expYears ? Number(expYears) : null,
        total_experience_months: expMonths ? Number(expMonths) : null,
        current_last_company: lastCompany || null,
        current_last_job_title: lastTitle || null,
        current_last_salary: lastSalary || null,
        salary_period: lastSalary ? salaryPeriod : null,
        expected_salary: expectedSalary || null,
        expected_salary_period: expectedSalary ? expectedPeriod : null,
        notice_period: noticePeriod || null,
        custom_notice_period: noticePeriod === "Other" ? customNotice : null,
        key_skills: keySkills.length ? keySkills : null,
        reason_for_leaving: reasonLeaving || null,
        documents,
        portfolio_url: portfolioUrl || null,
        declaration_confirmed: declaration,
        privacy_terms_accepted: privacyAccepted,
      };
      const res = await submitCareerApplication(application);
      if (res.ok) {
        setReference(ref);
        return;
      }

      console.warn("[careers] Supabase save failed; saving locally:", res.error);
      const local = saveCareerApplicationLocally(application);
      if (!local.ok) throw new Error(local.error || res.error || "Could not save application.");
      setReference(ref);
    } catch (e) {
      setError(getCareerErrorMessage(e, "Could not submit the application. Please try again."));
    } finally {
      setSubmitting(false);
      setUploadStatus("");
    }
  };

  const reset = () => {
    setReference(null);
    setStep(0);
    setSubmitting(false);
    setError("");
    setUploadStatus("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (reference) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-[#0B2E59] sm:text-4xl">Application Submitted Successfully</h1>
          <p className="mt-4 text-[15px] text-[#0B2E59]/75">
            Thank you for applying to Smart Solutions. Our recruitment team will review your application and contact you if your profile matches an available opportunity.
          </p>
          <div className="mt-8 inline-flex flex-col items-center rounded-2xl border border-[#D4AF37]/40 bg-[#FFF8E5] px-8 py-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0B2E59]/70">Application Reference</span>
            <span className="mt-1 font-mono text-2xl font-black text-[#0B2E59]">{reference}</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-[#0B2E59] px-6 py-3 text-sm font-bold text-white hover:bg-[#0B2E59]/90">
              Return to Home
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-[#0B2E59] bg-white px-6 py-3 text-sm font-bold text-[#0B2E59] hover:bg-[#F5F7FA]"
            >
              Submit Another Application
            </button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F5F7FA] via-white to-[#EAF1FB]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#FFF8E5] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B2E59]">
              <Sparkles className="h-3.5 w-3.5" /> Build Your Career With Us
            </span>
            <h1 className="mt-4 text-4xl font-black leading-tight text-[#0B2E59] sm:text-5xl lg:text-6xl">
              Join the Smart Solutions Team
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#0B2E59]/75 sm:text-base">
              Become part of a growing team committed to delivering reliable home, commercial and professional service solutions. Whether you are beginning your career or bringing valuable experience, we welcome talented and responsible individuals to apply.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className="inline-flex items-center gap-2 rounded-full bg-[#0B2E59] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#0B2E59]/20 hover:bg-[#0B2E59]/90">
                Apply Now <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#intro" className="inline-flex items-center gap-2 rounded-full border border-[#0B2E59] bg-white px-6 py-3 text-sm font-bold text-[#0B2E59] hover:border-[#D4AF37] hover:bg-[#FFF8E5]">
                Explore Opportunities
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-[#0B2E59]/20 ring-1 ring-black/5">
              <img src={heroImg} alt="Smart Solutions team" width={1024} height={1024} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section id="intro" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-black text-[#0B2E59] sm:text-4xl">Grow With Smart Solutions</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#0B2E59]/75">
              At Smart Solutions, we believe our people are the foundation of our success. We provide opportunities for freshers, experienced professionals, technical experts, service executives and field staff to develop their skills and grow within a supportive working environment.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: TrendingUp, title: "Career Growth" },
              { Icon: Award, title: "Professional Training" },
              { Icon: Users, title: "Supportive Team" },
              { Icon: Briefcase, title: "Diverse Opportunities" },
            ].map(({ Icon, title }) => (
              <div key={title} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF1FB] text-[#0B2E59]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-bold text-[#0B2E59]">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#F5F7FA] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-[#0B2E59] sm:text-4xl">Why Work With Smart Solutions</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[#0B2E59]/70">
              A workplace built for learning, growth and long-term success across Bengaluru.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: GraduationCap, title: "Learning & Skill Development", body: "Structured training programmes and on-the-job mentorship." },
              { Icon: Building2, title: "Professional Work Environment", body: "Organised processes, clear responsibilities and safe workplaces." },
              { Icon: TrendingUp, title: "Performance-Based Growth", body: "Merit-based promotions, recognition and rewards for consistent performance." },
              { Icon: Handshake, title: "Field & Office Opportunities", body: "Roles across service delivery, coordination, sales and administration." },
              { Icon: Users, title: "Experienced Team Support", body: "Learn alongside senior technicians, supervisors and managers." },
              { Icon: Clock, title: "Long-Term Career Opportunities", body: "Stable employment with a growing Bengaluru-based services group." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#0B2E59] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#0B2E59]">{title}</h3>
                <p className="mt-2 text-sm text-[#0B2E59]/75">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="mx-auto max-w-5xl px-4 py-16 sm:px-6" ref={formTop}>
        <div className="text-center">
          <h2 className="text-3xl font-black text-[#0B2E59] sm:text-4xl">Job Application Form</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#0B2E59]/70">
            Complete the form below and upload the required documents. Fields marked with an asterisk are mandatory.
          </p>
        </div>

        {/* Stepper */}
        <div className="mt-8 overflow-x-auto">
          <ol className="flex min-w-max items-center justify-center gap-2">
            {STEPS.map((s, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <li key={s.key} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                    active ? "border-[#D4AF37] bg-[#FFF8E5] text-[#0B2E59]"
                    : done ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-[#E5E7EB] bg-white text-[#0B2E59]/60"
                  }`}>
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-black ${
                      active ? "bg-[#0B2E59] text-white" : done ? "bg-emerald-600 text-white" : "bg-[#E5E7EB] text-[#0B2E59]/70"
                    }`}>{done ? "✓" : i + 1}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-[#0B2E59]/30" />}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xl shadow-[#0B2E59]/5 sm:p-8">
          {step === 0 && (
            <StepCandidate
              candidateType={candidateType} setCandidateType={setCandidateType}
              position={position} setPosition={setPosition}
              customPosition={customPosition} setCustomPosition={setCustomPosition}
              preferredLocation={preferredLocation} setPreferredLocation={setPreferredLocation}
              employmentType={employmentType} setEmploymentType={setEmploymentType}
            />
          )}
          {step === 1 && (
            <StepPersonal
              {...{ fullName, setFullName, dob, setDob, gender, setGender, nationality, setNationality,
                mobile, setMobile, email, setEmail, address, setAddress,
                city, setCity, stateName, setStateName, pin, setPin }}
            />
          )}
          {step === 2 && (
            <StepEducation
              {...{ qualification, setQualification, customQualification, setCustomQualification,
                course, setCourse, institution, setInstitution,
                yearOfPassing, setYearOfPassing, percentage, setPercentage }}
            />
          )}
          {step === 3 && (isExperienced ? (
            <StepExperienced
              {...{ expYears, setExpYears, expMonths, setExpMonths, lastCompany, setLastCompany,
                lastTitle, setLastTitle, lastSalary, setLastSalary, salaryPeriod, setSalaryPeriod,
                expectedSalary, setExpectedSalary, expectedPeriod, setExpectedPeriod,
                noticePeriod, setNoticePeriod, customNotice, setCustomNotice,
                keySkills, setKeySkills, reasonLeaving, setReasonLeaving }}
            />
          ) : (
            <StepFresher
              {...{ technicalSkills, setTechnicalSkills, languages, setLanguages,
                customLanguage, setCustomLanguage }}
            />
          ))}
          {step === 4 && (
            <StepDocuments files={files} setFiles={setFiles} isExperienced={isExperienced}
              portfolioUrl={portfolioUrl} setPortfolioUrl={setPortfolioUrl} />
          )}
          {step === 5 && (
            <StepSubmit
              declaration={declaration} setDeclaration={setDeclaration}
              privacyAccepted={privacyAccepted} setPrivacyAccepted={setPrivacyAccepted}
              onViewTerms={() => setShowTerms(true)}
            />
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}
          {uploadStatus && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" /> {uploadStatus}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-6">
            <button
              type="button"
              onClick={back}
              disabled={step === 0 || submitting}
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-bold text-[#0B2E59] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-full bg-[#0B2E59] px-6 py-3 text-sm font-bold text-white hover:bg-[#0B2E59]/90"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-white hover:bg-[#c9a230] disabled:opacity-60"
              >
                {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Submitting Application…</>) : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#F5F7FA] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-[#0B2E59] sm:text-4xl">Our Recruitment Process</h2>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {["Submit Application","Profile Review","Initial Discussion","Interview or Skill Assessment","Final Selection"].map((s, i) => (
              <li key={s} className="relative rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <span className="text-xs font-black text-[#D4AF37]">STEP {i + 1}</span>
                <p className="mt-1 text-sm font-bold text-[#0B2E59]">{s}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-center text-xs text-[#0B2E59]/60">
            Only shortlisted candidates will be contacted by the Smart Solutions recruitment team.
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EAF1FB] text-[#0B2E59]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0B2E59]">Privacy & Document Security</h3>
              <p className="mt-2 text-sm text-[#0B2E59]/75">
                Your personal information and uploaded documents are stored securely and used only for recruitment purposes. Documents are held in a private, access-controlled storage and are visible only to authorised Smart Solutions recruitment personnel through secure signed links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-[#0B2E59] to-[#12406e] py-14 text-center text-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-3xl font-black sm:text-4xl">Ready to Build Your Future?</h2>
          <p className="mt-3 text-sm text-white/80">Apply today and join a growing Bengaluru services team.</p>
          <a href="#apply" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-white hover:bg-[#c9a230]">
            Apply Now <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} onAccept={() => { setPrivacyAccepted(true); setShowTerms(false); }} />}
    </SiteLayout>
  );
}

/* ----------------- Sub-components ----------------- */

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#0B2E59]">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-[#0B2E59]/60">{hint}</span>}
    </label>
  );
}

const inputCls = "block w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#0B2E59] outline-none transition-colors focus:border-[#0B2E59] focus:ring-2 focus:ring-[#0B2E59]/10";

function StepCandidate(props: any) {
  const { candidateType, setCandidateType, position, setPosition, customPosition, setCustomPosition,
    preferredLocation, setPreferredLocation, employmentType, setEmploymentType } = props;
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#0B2E59]">Candidate Type <span className="text-rose-500">*</span></p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[{ v: "fresher", label: "Fresher", desc: "Starting my career" },
            { v: "experienced", label: "Experienced", desc: "I have prior work experience" }].map((o) => (
            <label key={o.v} className={`cursor-pointer rounded-2xl border-2 p-4 transition-colors ${
              candidateType === o.v ? "border-[#D4AF37] bg-[#FFF8E5]" : "border-[#E5E7EB] bg-white hover:border-[#0B2E59]/30"
            }`}>
              <input type="radio" name="candidateType" value={o.v} checked={candidateType === o.v}
                onChange={() => setCandidateType(o.v)} className="sr-only" />
              <p className="text-sm font-black text-[#0B2E59]">{o.label}</p>
              <p className="mt-1 text-xs text-[#0B2E59]/70">{o.desc}</p>
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Position Applied For" required>
          <select className={inputCls} value={position} onChange={(e) => setPosition(e.target.value)}>
            <option value="">Select a position</option>
            {DEFAULT_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        {position === "Other" && (
          <Field label="Please Specify the Position" required>
            <input className={inputCls} value={customPosition} onChange={(e) => setCustomPosition(e.target.value)} />
          </Field>
        )}
        <Field label="Preferred Job Location" required>
          <select className={inputCls} value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)}>
            <option value="">Select a location</option>
            {DEFAULT_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Employment Type" required>
          <select className={inputCls} value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
            <option value="">Select</option>
            {EMPLOYMENT_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

function StepPersonal(p: any) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full Name" required><input className={inputCls} value={p.fullName} onChange={(e) => p.setFullName(e.target.value)} /></Field>
      <Field label="Date of Birth" required><input type="date" className={inputCls} value={p.dob} onChange={(e) => p.setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} /></Field>
      <Field label="Gender" required>
        <select className={inputCls} value={p.gender} onChange={(e) => p.setGender(e.target.value)}>
          <option value="">Select</option>
          {["Male", "Female", "Other", "Prefer Not to Say"].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </Field>
      <Field label="Nationality"><input className={inputCls} value={p.nationality} onChange={(e) => p.setNationality(e.target.value)} /></Field>
      <Field label="Mobile Number" required hint="10-digit Indian mobile number">
        <input inputMode="numeric" maxLength={10} className={inputCls} value={p.mobile}
          onChange={(e) => p.setMobile(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" />
      </Field>
      <Field label="Email Address" required><input type="email" className={inputCls} value={p.email} onChange={(e) => p.setEmail(e.target.value)} /></Field>
      <div className="sm:col-span-2">
        <Field label="Current Address" required>
          <textarea rows={3} className={inputCls} value={p.address} onChange={(e) => p.setAddress(e.target.value)} />
        </Field>
      </div>
      <Field label="City"><input className={inputCls} value={p.city} onChange={(e) => p.setCity(e.target.value)} /></Field>
      <Field label="State"><input className={inputCls} value={p.stateName} onChange={(e) => p.setStateName(e.target.value)} /></Field>
      <Field label="PIN Code"><input inputMode="numeric" maxLength={6} className={inputCls} value={p.pin} onChange={(e) => p.setPin(e.target.value.replace(/\D/g, ""))} /></Field>
    </div>
  );
}

function StepEducation(p: any) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Highest Qualification" required>
        <select className={inputCls} value={p.qualification} onChange={(e) => p.setQualification(e.target.value)}>
          <option value="">Select</option>
          {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
        </select>
      </Field>
      {p.qualification === "Other" && (
        <Field label="Please specify" required>
          <input className={inputCls} value={p.customQualification} onChange={(e) => p.setCustomQualification(e.target.value)} />
        </Field>
      )}
      <Field label="Course / Degree"><input className={inputCls} value={p.course} onChange={(e) => p.setCourse(e.target.value)} /></Field>
      <Field label="College / University / Institution"><input className={inputCls} value={p.institution} onChange={(e) => p.setInstitution(e.target.value)} /></Field>
      <Field label="Year of Passing"><input inputMode="numeric" maxLength={4} className={inputCls} value={p.yearOfPassing} onChange={(e) => p.setYearOfPassing(e.target.value.replace(/\D/g, ""))} placeholder="2024" /></Field>
      <Field label="Percentage / CGPA" hint="e.g. 75% or 8.2 CGPA"><input className={inputCls} value={p.percentage} onChange={(e) => p.setPercentage(e.target.value)} /></Field>
    </div>
  );
}

function TagInput({ label, value, setValue, options, required, hint }: {
  label: string; value: string[]; setValue: (v: string[]) => void; options?: string[]; required?: boolean; hint?: string;
}) {
  const [txt, setTxt] = useState("");
  const add = (v: string) => {
    const t = v.trim();
    if (!t) return;
    if (value.includes(t)) return;
    setValue([...value, t]);
    setTxt("");
  };
  return (
    <Field label={label} required={required} hint={hint}>
      <div className="flex flex-wrap gap-2 rounded-lg border border-[#E5E7EB] bg-white p-2">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-[#EAF1FB] px-3 py-1 text-xs font-semibold text-[#0B2E59]">
            {v}
            <button type="button" onClick={() => setValue(value.filter((x) => x !== v))} className="text-[#0B2E59]/60 hover:text-rose-500">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[140px] bg-transparent px-2 py-1 text-sm text-[#0B2E59] outline-none"
          value={txt} onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(txt); } }}
          onBlur={() => txt && add(txt)}
          placeholder="Type and press Enter"
        />
      </div>
      {options && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {options.filter((o) => !value.includes(o)).map((o) => (
            <button type="button" key={o} onClick={() => add(o)}
              className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0B2E59]/70 hover:border-[#D4AF37] hover:text-[#0B2E59]">
              + {o}
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}

function StepFresher(p: any) {
  return (
    <div className="space-y-5">
      <TagInput label="Technical Skills" value={p.technicalSkills} setValue={p.setTechnicalSkills}
        options={["Electrical Work","Plumbing","Carpentry","CCTV Installation","Interior Works","Customer Support","Computer Skills","Digital Marketing"]}
      />
      <TagInput label="Languages Known" value={p.languages} setValue={p.setLanguages} options={LANGUAGES} />
    </div>
  );
}

function StepExperienced(p: any) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Total Experience (Years)" required><input inputMode="numeric" maxLength={2} className={inputCls} value={p.expYears} onChange={(e) => p.setExpYears(e.target.value.replace(/\D/g, ""))} /></Field>
      <Field label="Total Experience (Months)"><input inputMode="numeric" maxLength={2} className={inputCls} value={p.expMonths} onChange={(e) => p.setExpMonths(e.target.value.replace(/\D/g, ""))} /></Field>
      <Field label="Current / Last Company" required><input className={inputCls} value={p.lastCompany} onChange={(e) => p.setLastCompany(e.target.value)} /></Field>
      <Field label="Current / Last Job Title" required><input className={inputCls} value={p.lastTitle} onChange={(e) => p.setLastTitle(e.target.value)} /></Field>
      <Field label="Current / Last Salary (₹)">
        <div className="flex gap-2">
          <input inputMode="numeric" className={inputCls} value={p.lastSalary} onChange={(e) => p.setLastSalary(e.target.value.replace(/\D/g, ""))} />
          <select className={inputCls + " w-32"} value={p.salaryPeriod} onChange={(e) => p.setSalaryPeriod(e.target.value)}>
            <option>Monthly</option><option>Annual</option>
          </select>
        </div>
      </Field>
      <Field label="Expected Salary (₹)">
        <div className="flex gap-2">
          <input inputMode="numeric" className={inputCls} value={p.expectedSalary} onChange={(e) => p.setExpectedSalary(e.target.value.replace(/\D/g, ""))} />
          <select className={inputCls + " w-32"} value={p.expectedPeriod} onChange={(e) => p.setExpectedPeriod(e.target.value)}>
            <option>Monthly</option><option>Annual</option>
          </select>
        </div>
      </Field>
      <Field label="Notice Period">
        <select className={inputCls} value={p.noticePeriod} onChange={(e) => p.setNoticePeriod(e.target.value)}>
          <option value="">Select</option>
          {NOTICE_PERIODS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </Field>
      {p.noticePeriod === "Other" && (
        <Field label="Specify Notice Period"><input className={inputCls} value={p.customNotice} onChange={(e) => p.setCustomNotice(e.target.value)} /></Field>
      )}
      <div className="sm:col-span-2">
        <TagInput label="Key Skills" required value={p.keySkills} setValue={p.setKeySkills} hint="Add each skill and press Enter" />
      </div>
      <div className="sm:col-span-2">
        <Field label="Reason for Leaving">
          <textarea rows={3} className={inputCls} value={p.reasonLeaving} onChange={(e) => p.setReasonLeaving(e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

const FILE_LIMITS: Record<string, { max: number; types: string[] }> = {
  resume: { max: 5, types: ["pdf", "doc", "docx"] },
  photo: { max: 3, types: ["jpg", "jpeg", "png", "webp"] },
  governmentId: { max: 5, types: ["pdf", "jpg", "jpeg", "png"] },
  educationalCertificates: { max: 5, types: ["pdf", "jpg", "jpeg", "png"] },
  experienceCertificate: { max: 5, types: ["pdf", "jpg", "jpeg", "png"] },
  relievingLetter: { max: 5, types: ["pdf", "jpg", "jpeg", "png"] },
  salarySlips: { max: 5, types: ["pdf", "jpg", "jpeg", "png"] },
  professionalCertifications: { max: 5, types: ["pdf", "jpg", "jpeg", "png"] },
  drivingLicense: { max: 5, types: ["pdf", "jpg", "jpeg", "png"] },
  passport: { max: 5, types: ["pdf", "jpg", "jpeg", "png"] },
  portfolio: { max: 10, types: ["pdf"] },
  otherDocuments: { max: 10, types: ["pdf", "jpg", "jpeg", "png"] },
};

function UploadArea({ field, label, required, multiple, files, setFiles }: {
  field: string; label: string; required?: boolean; multiple?: boolean;
  files: FilesMap; setFiles: (fn: (prev: FilesMap) => FilesMap) => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const limit = FILE_LIMITS[field];
  const cur = files[field] ?? [];
  const onSelect = (list: FileList | null) => {
    if (!list) return;
    setErr(null);
    const chosen: File[] = [];
    for (const f of Array.from(list)) {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      if (!limit.types.includes(ext)) { setErr(`Only ${limit.types.join(", ")} allowed.`); return; }
      if (f.size > limit.max * 1024 * 1024) { setErr(`Max size ${limit.max} MB.`); return; }
      chosen.push(f);
    }
    setFiles((prev) => ({ ...prev, [field]: multiple ? [...(prev[field] ?? []), ...chosen] : chosen.slice(0, 1) }));
  };
  const remove = (idx: number) => {
    setFiles((prev) => {
      const arr = [...(prev[field] ?? [])];
      arr.splice(idx, 1);
      return { ...prev, [field]: arr };
    });
  };
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFBFD] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#0B2E59]">{label} {required && <span className="text-rose-500">*</span>}</p>
          <p className="mt-0.5 text-[11px] text-[#0B2E59]/60">{limit.types.join(", ").toUpperCase()} · Max {limit.max} MB</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#0B2E59] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0B2E59]/90">
          <Upload className="h-3.5 w-3.5" /> {multiple ? "Add Files" : "Upload"}
          <input type="file" className="hidden" multiple={multiple}
            accept={limit.types.map((t) => "." + t).join(",")}
            onChange={(e) => onSelect(e.target.files)} />
        </label>
      </div>
      {err && <p className="mt-2 text-xs font-semibold text-rose-600">{err}</p>}
      {cur.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {cur.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs">
              <span className="truncate text-[#0B2E59]">{f.name} <span className="text-[#0B2E59]/50">({(f.size/1024/1024).toFixed(2)} MB)</span></span>
              <button type="button" onClick={() => remove(i)} className="text-rose-500 hover:text-rose-700"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StepDocuments({ files, setFiles, isExperienced, portfolioUrl, setPortfolioUrl }: {
  files: FilesMap; setFiles: React.Dispatch<React.SetStateAction<FilesMap>>; isExperienced: boolean;
  portfolioUrl: string; setPortfolioUrl: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-xs text-[#0B2E59]/70">Please upload clear and readable documents. Your documents will be stored securely and used only for recruitment purposes.</p>
      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-[#0B2E59]">Mandatory Documents</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <UploadArea field="resume" label="Resume / CV" required files={files} setFiles={setFiles} />
          <UploadArea field="photo" label="Passport Size Photo" required files={files} setFiles={setFiles} />
          <UploadArea field="governmentId" label="Government ID Proof" required files={files} setFiles={setFiles} />
          <UploadArea field="educationalCertificates" label="Educational Certificates" required multiple files={files} setFiles={setFiles} />
        </div>
      </div>
      {isExperienced && (
        <div>
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-[#0B2E59]">Experienced Candidates</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <UploadArea field="experienceCertificate" label="Experience Certificate(s)" required multiple files={files} setFiles={setFiles} />
            <UploadArea field="relievingLetter" label="Relieving Letter" required files={files} setFiles={setFiles} />
            <UploadArea field="salarySlips" label="Last 3 Months Salary Slips" required multiple files={files} setFiles={setFiles} />
          </div>
        </div>
      )}
      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-[#0B2E59]">Optional Documents</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <UploadArea field="professionalCertifications" label="Professional Certifications" multiple files={files} setFiles={setFiles} />
          <UploadArea field="drivingLicense" label="Driving License" files={files} setFiles={setFiles} />
          <UploadArea field="passport" label="Passport" files={files} setFiles={setFiles} />
          <UploadArea field="portfolio" label="Portfolio (PDF)" files={files} setFiles={setFiles} />
          <UploadArea field="otherDocuments" label="Other Supporting Documents" multiple files={files} setFiles={setFiles} />
          <Field label="Portfolio URL (optional)">
            <input className={inputCls} value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://…" />
          </Field>
        </div>
      </div>
    </div>
  );
}

function StepSubmit({ declaration, setDeclaration, privacyAccepted, setPrivacyAccepted, onViewTerms }: any) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFBFD] p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#0B2E59]" />
          <p className="text-sm text-[#0B2E59]/80">
            Review your details in the previous steps if needed. Once submitted, our team will review your application and contact you if shortlisted.
          </p>
        </div>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <input type="checkbox" checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} className="mt-1 h-4 w-4 accent-[#0B2E59]" />
        <span className="text-sm text-[#0B2E59]">I certify that all the information provided in this application is true and complete.</span>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[#0B2E59]" />
        <span className="text-sm text-[#0B2E59]">
          I agree to the{" "}
          <button type="button" onClick={onViewTerms} className="font-bold text-[#0B2E59] underline underline-offset-2 hover:text-[#D4AF37]">Privacy Policy and Terms & Conditions</button>.
        </span>
      </label>
    </div>
  );
}

function TermsModal({ onClose, onAccept }: { onClose: () => void; onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <h3 className="text-lg font-black text-[#0B2E59]">Privacy Policy & Terms and Conditions</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-[#0B2E59]/60 hover:bg-[#F5F7FA]"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-5 py-4 text-sm text-[#0B2E59]/80">
          <p>By submitting this application, you agree that Smart Solutions Groups may collect, process and store your personal data and uploaded documents for the sole purpose of evaluating your candidature.</p>
          <p>Your documents are stored in a secure, access-controlled storage and are visible only to authorised recruitment personnel through short-lived signed links.</p>
          <p>Your information will not be sold or shared with third parties for marketing purposes.</p>
          <p>You may request deletion of your application data by contacting our recruitment team at any time.</p>
          <p>False or misleading information may lead to disqualification of your application or termination of employment if subsequently discovered.</p>
          <p>Only shortlisted candidates will be contacted. Interview participation does not guarantee an offer of employment.</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#E5E7EB] bg-[#FAFBFD] px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-bold text-[#0B2E59]">Close</button>
          <button type="button" onClick={onAccept} className="rounded-full bg-[#0B2E59] px-5 py-2 text-sm font-bold text-white hover:bg-[#0B2E59]/90">Accept & Continue</button>
        </div>
      </div>
    </div>
  );
}