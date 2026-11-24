import { brand } from "@/data/site";
import { contactSchema, type ContactFormData, generateMailtoUrl } from "./schema";

const DEFAULT_RECIPIENT = brand.email || "info@digisay.com";
const VALIDATION_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "service",
  "message",
] as const;

export interface ContactSubmissionResult {
  success: boolean;
  delivered: boolean;
  stored?: boolean;
  fallback: boolean;
  message: string;
  mailtoUrl?: string;
  recipient: string;
  errors?: Record<string, string>;
}

function emailFallback(data: ContactFormData, message: string): ContactSubmissionResult {
  return {
    success: false,
    delivered: false,
    stored: false,
    fallback: true,
    message,
    mailtoUrl: generateMailtoUrl(data),
    recipient: DEFAULT_RECIPIENT,
  };
}

async function readValidationErrors(response: Response): Promise<Record<string, string>> {
  try {
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || !("errors" in body)) return {};

    const payload = (body as { errors?: unknown }).errors;
    if (!payload || typeof payload !== "object") return {};

    const errors: Record<string, string> = {};
    for (const field of VALIDATION_FIELDS) {
      const entry = Object.entries(payload).find(
        ([key]) => key.toLowerCase() === field.toLowerCase(),
      )?.[1];
      if (entry !== undefined) errors[field] = "Please check this field and try again.";
    }
    return errors;
  } catch {
    return {};
  }
}

/** Sends validated public inquiries to the ASP.NET API and reports only confirmed persistence as success. */
export async function submitContactInquiry(rawData: unknown): Promise<ContactSubmissionResult> {
  const validationResult = contactSchema.safeParse(rawData);
  if (!validationResult.success) {
    const errors: Record<string, string> = {};
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0]?.toString() ?? "general";
      if (!errors[field]) errors[field] = issue.message;
    }
    return {
      success: false,
      delivered: false,
      fallback: false,
      message: "Please correct the highlighted errors in the form.",
      recipient: DEFAULT_RECIPIENT,
      errors,
    };
  }

  const data: ContactFormData = validationResult.data;
  if (data.botField) {
    return {
      success: false,
      delivered: false,
      fallback: false,
      message: "Unable to submit this inquiry.",
      recipient: DEFAULT_RECIPIENT,
    };
  }

  const configuredApiUrl = import.meta.env.VITE_DIGISAY_API_BASE_URL;
  const apiBaseUrl = (
    configuredApiUrl || (import.meta.env.DEV ? "http://localhost:5080" : "")
  ).replace(/\/$/, "");
  if (!apiBaseUrl) {
    return emailFallback(
      data,
      "We could not submit your inquiry right now. You can retry or open your email app with a prepared message.",
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/contact-inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(8000),
    });

    if (response.status === 201) {
      return {
        success: true,
        delivered: false,
        stored: true,
        fallback: false,
        message: "Your inquiry was received. Our team will reach back within one business day.",
        recipient: DEFAULT_RECIPIENT,
      };
    }

    if (response.status === 400 || response.status === 422) {
      const errors = await readValidationErrors(response);
      return {
        success: false,
        delivered: false,
        fallback: false,
        message: "Some details need attention. Review the highlighted fields and try again.",
        recipient: DEFAULT_RECIPIENT,
        ...(Object.keys(errors).length > 0 ? { errors } : {}),
      };
    }

    if (response.status === 429) {
      return emailFallback(
        data,
        "Too many submission attempts. Wait a few minutes before retrying, or open your email app to send this inquiry.",
      );
    }

    return emailFallback(
      data,
      response.status >= 500
        ? "Our service is temporarily unavailable. Please retry shortly or open your email app to send this inquiry."
        : "We could not submit your inquiry. Please retry or open your email app to send it.",
    );
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return emailFallback(
      data,
      timedOut
        ? "The request timed out. Check your connection and retry, or open your email app to send this inquiry."
        : "We could not reach our service. Check your connection and retry, or open your email app to send this inquiry.",
    );
  }
}
