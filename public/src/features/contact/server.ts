import { brand } from "@/data/site";
import { contactSchema, type ContactFormData, generateMailtoUrl } from "./schema";

const DEFAULT_RECIPIENT = brand.email || "info@digisay.com";

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

/**
 * Sends validated public inquiries to the ASP.NET API. If the API is not
 * configured or is unavailable, preserve the existing honest mailto fallback.
 */
export async function submitContactInquiry(rawData: unknown): Promise<ContactSubmissionResult> {
  // 1. Zod Validation
  const validationResult = contactSchema.safeParse(rawData);
  if (!validationResult.success) {
    const errors: Record<string, string> = {};
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0]?.toString() ?? "general";
      if (!errors[field]) {
        errors[field] = issue.message;
      }
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

  // 2. Honeypot Bot Spam Check
  if (data.botField && data.botField.length > 0) {
    // Silently drop bot submissions without alerting the scraper
    return {
      success: true,
      delivered: false,
      fallback: false,
      message: "Inquiry processed.",
      recipient: DEFAULT_RECIPIENT,
    };
  }

  const configuredApiUrl = import.meta.env.VITE_DIGISAY_API_BASE_URL;
  const apiBaseUrl = (
    configuredApiUrl || (import.meta.env.DEV ? "http://localhost:5080" : "")
  ).replace(/\/$/, "");
  if (apiBaseUrl) {
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

      if (response.status === 429) {
        return {
          success: false,
          delivered: false,
          fallback: false,
          message: "Too many submission attempts. Please wait a few minutes and try again.",
          recipient: DEFAULT_RECIPIENT,
        };
      }
    } catch (error) {
      console.warn("DigiSay API is unavailable; using the email draft fallback.", error);
    }
  }

  // Safe fallback: generate a pre-filled email draft when API persistence is unavailable.
  const mailtoUrl = generateMailtoUrl(data);
  return {
    success: true,
    delivered: false,
    stored: false,
    fallback: true,
    message:
      "Inquiry draft prepared. Click below to send directly to info@digisay.com or copy the inquiry details.",
    mailtoUrl,
    recipient: DEFAULT_RECIPIENT,
  };
}
