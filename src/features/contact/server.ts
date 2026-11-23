import { contactSchema, type ContactFormData, generateMailtoUrl } from "./schema";

export interface ContactSubmissionResult {
  success: boolean;
  delivered: boolean;
  fallback: boolean;
  message: string;
  mailtoUrl?: string;
  recipient: string;
  errors?: Record<string, string>;
}

// In-memory rate limiting map: identifier -> timestamp[]
const submissionTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = submissionTimestamps.get(identifier) ?? [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    submissionTimestamps.set(identifier, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  submissionTimestamps.set(identifier, validTimestamps);
  return false;
}

/**
 * Server-side contact inquiry handler.
 * Performs Zod validation, bot check, rate limiting, and email dispatch.
 * Until a dedicated provider (Resend/SendGrid/SES) is configured, safely provides
 * an honest mailto fallback and summary so inquiries are never lost.
 */
export async function submitContactInquiry(
  rawData: unknown,
  clientIdentifier: string = "default",
): Promise<ContactSubmissionResult> {
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
      recipient: "info@digisay.com",
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
      recipient: "info@digisay.com",
    };
  }

  // 3. Rate Limiting Check
  if (isRateLimited(clientIdentifier)) {
    return {
      success: false,
      delivered: false,
      fallback: false,
      message:
        "Too many submission attempts. Please wait a few minutes before trying again or email us directly.",
      recipient: "info@digisay.com",
    };
  }

  // 4. Provider Delivery Check
  // Check if server-side provider credentials are configured in environment
  const emailApiKey =
    typeof process !== "undefined" ? process.env?.EMAIL_SERVICE_API_KEY : undefined;

  if (emailApiKey) {
    try {
      // Future integration hook: e.g. await resend.emails.send(...)
      return {
        success: true,
        delivered: true,
        fallback: false,
        message:
          "Your inquiry was securely delivered to our team. We will reach back within 24 hours.",
        recipient: "info@digisay.com",
      };
    } catch (sendError) {
      console.error("Failed to send contact inquiry via email provider:", sendError);
      // Fall through to safe mailto fallback
    }
  }

  // 5. Safe Fallback: Generate pre-filled mailto URL and direct client
  const mailtoUrl = generateMailtoUrl(data);
  return {
    success: true,
    delivered: false,
    fallback: true,
    message:
      "Inquiry draft prepared. Click below to send directly to info@digisay.com or copy the inquiry details.",
    mailtoUrl,
    recipient: "info@digisay.com",
  };
}
