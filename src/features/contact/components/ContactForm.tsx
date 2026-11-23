import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import {
  CheckCircle2,
  Send,
  Mail,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

import { contactServices, brand } from "@/data/site";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contactSchema, type ContactFormData, formatInquirySummary } from "../schema";
import { submitContactInquiry, type ContactSubmissionResult } from "../server";

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-[#d90a2c] focus:outline-none focus:ring-2 focus:ring-[#d90a2c]/20 disabled:cursor-not-allowed disabled:opacity-60";

export function ContactForm() {
  const [submissionResult, setSubmissionResult] = useState<ContactSubmissionResult | null>(null);
  const [submittedData, setSubmittedData] = useState<ContactFormData | null>(null);
  const [copied, setCopied] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: undefined,
      message: "",
      botField: "",
    },
  });

  // Lock form inputs while a prepared submission result is active
  const isLocked = isSubmitting || (!!submissionResult && submissionResult.success);

  // Invalidate any prepared submission result if a field value is modified
  useEffect(() => {
    const subscription = watch(() => {
      if (submissionResult) {
        setSubmissionResult(null);
        setSubmittedData(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, submissionResult]);

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null);
    try {
      const result = await submitContactInquiry(data);
      if (!result.success && result.errors) {
        setServerError(result.message);
        return;
      }
      // Store the exact validated inquiry snapshot to guarantee copy & mailto synchronization
      setSubmittedData(data);
      setSubmissionResult(result);
    } catch (err) {
      console.error("Submission failed:", err);
      setServerError(
        "An unexpected error occurred while preparing your inquiry. Please try again or email info@digisay.com.",
      );
    }
  };

  const handleCopySummary = async () => {
    // Always use the validated inquiry snapshot that matches the mailto draft
    const dataToCopy = submittedData ?? getValues();
    const summary = formatInquirySummary(dataToCopy);
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement("textarea");
      textarea.value = summary;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setSubmittedData(null);
    setServerError(null);
    reset();
  };

  const handleEdit = () => {
    // Unlock form for editing while retaining entered values
    setSubmissionResult(null);
    setSubmittedData(null);
    setServerError(null);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 rounded-3xl border border-border/80 bg-card p-6 shadow-xl md:p-10"
      >
        <div className="border-b border-border/40 pb-4">
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Drop us a line
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in this form and our strategy team will reach back within 24 hours.
          </p>
        </div>

        {/* Server or Rate-Limit Error Banner */}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Submission Note</p>
              <p className="text-xs mt-0.5 opacity-90">{serverError}</p>
            </div>
          </div>
        )}

        {/* Successful / Prepared Inquiry Feedback Banner */}
        {submissionResult && submissionResult.success && (
          <div
            role="status"
            className="space-y-4 rounded-2xl border border-[#d90a2c]/30 bg-[#d90a2c]/5 p-5 text-sm dark:bg-[#d90a2c]/10"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 shrink-0 text-[#d90a2c] mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground text-base">
                  {submissionResult.delivered
                    ? "Inquiry Sent to DigiSay!"
                    : "Inquiry Draft Prepared"}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {submissionResult.delivered
                    ? submissionResult.message
                    : "Your inquiry details are validated and ready. Click below to launch your email client with your pre-filled inquiry, or copy the details to send directly to info@digisay.com."}
                </p>
              </div>
            </div>

            {/* Action buttons for transparent email delivery */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {submissionResult.mailtoUrl && (
                <a
                  href={submissionResult.mailtoUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d90a2c] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#d90a2c]/20 transition-all hover:bg-[#bf0826] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Mail className="size-4" />
                  <span>Open in Mail App</span>
                  <ExternalLink className="size-3.5 opacity-80" />
                </a>
              )}

              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:border-border/80 active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Copied to Clipboard!
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4 text-muted-foreground" />
                    <span>Copy Inquiry Summary</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                <RotateCcw className="size-3.5" />
                <span>New Inquiry</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden Honeypot Field for Spam Protection */}
        <div style={{ display: "none" }} aria-hidden="true">
          <label htmlFor="botField">Do not fill this out if you are human</label>
          <input
            id="botField"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("botField")}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="firstName">
              First Name <span className="text-[#d90a2c]">*</span>
            </label>
            <input
              id="firstName"
              placeholder="e.g. John"
              maxLength={50}
              autoComplete="given-name"
              aria-required="true"
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              disabled={isLocked}
              {...register("firstName")}
              className={inputClass}
            />
            {errors.firstName && (
              <p
                id="firstName-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-destructive"
              >
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="lastName">
              Last Name <span className="text-[#d90a2c]">*</span>
            </label>
            <input
              id="lastName"
              placeholder="e.g. Doe"
              maxLength={50}
              autoComplete="family-name"
              aria-required="true"
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              disabled={isLocked}
              {...register("lastName")}
              className={inputClass}
            />
            {errors.lastName && (
              <p
                id="lastName-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-destructive"
              >
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="email">
              Email Address <span className="text-[#d90a2c]">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              maxLength={100}
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isLocked}
              {...register("email")}
              className={inputClass}
            />
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-destructive"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="phone">
              Phone Number{" "}
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              maxLength={25}
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              disabled={isLocked}
              {...register("phone")}
              className={inputClass}
            />
            {errors.phone && (
              <p
                id="phone-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-destructive"
              >
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Reusable Radix Select Dropdown */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="service">
            Service of Interest <span className="text-[#d90a2c]">*</span>
          </label>
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <Select
                modal={false}
                disabled={isLocked}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger
                  id="service"
                  className={`w-full h-12 rounded-xl border bg-background px-4 text-sm text-foreground shadow-sm transition-all focus:border-[#d90a2c] focus:ring-2 focus:ring-[#d90a2c]/20 ${
                    errors.service
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-input"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errors.service}
                  aria-describedby={errors.service ? "service-error" : undefined}
                >
                  <SelectValue placeholder="Select a service category" />
                </SelectTrigger>
                <SelectContent>
                  {contactServices.map((service) => (
                    <SelectItem
                      key={service}
                      value={service}
                      className="cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted focus:bg-muted focus:text-[#d90a2c]"
                    >
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.service && (
            <p
              id="service-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-destructive"
            >
              {errors.service.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="message">
            Message{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (optional, min. 10 chars)
            </span>
          </label>
          <textarea
            id="message"
            rows={5}
            maxLength={2000}
            placeholder="Tell us about your project, content catalog, or campaign goals..."
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
            disabled={isLocked}
            {...register("message")}
            className={inputClass}
          />
          {errors.message && (
            <p
              id="message-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-destructive"
            >
              {errors.message.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="submit"
            disabled={isLocked}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#d90a2c] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#d90a2c]/25 transition-all duration-300 hover:bg-[#bf0826] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Preparing Inquiry...</span>
              </>
            ) : (
              <>
                <span>Send Message</span>
                <Send className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </>
            )}
          </button>

          <p className="text-xs text-muted-foreground">
            Direct email:{" "}
            <a
              href={`mailto:${brand.email || "info@digisay.com"}`}
              className="font-medium text-foreground underline underline-offset-4 hover:text-[#d90a2c] transition-colors"
            >
              {brand.email || "info@digisay.com"}
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
