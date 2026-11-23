import { z } from "zod";
import { contactServices, brand } from "@/data/site";

export const contactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(100, "Email must not exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .max(25, "Phone number must not exceed 25 characters")
    .refine(
      (val) => !val || /^(\+?[0-9\s\-().]{7,25})$/.test(val),
      "Please enter a valid phone number (e.g. +1 555-0123)",
    )
    .optional()
    .or(z.literal("")),
  service: z.enum(contactServices, {
    errorMap: () => ({ message: "Please select a service of interest" }),
  }),
  message: z
    .string()
    .trim()
    .max(2000, "Message must not exceed 2000 characters")
    .refine(
      (val) => !val || val.length >= 10,
      "Please provide at least 10 characters for your message",
    )
    .optional()
    .or(z.literal("")),
  // Honeypot field for spam bots (should be empty for humans)
  botField: z.string().optional().or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export function generateMailtoUrl(data: ContactFormData): string {
  const recipient = brand.email || "info@digisay.com";
  const subject = `[Inquiry - ${data.service}] From ${data.firstName} ${data.lastName}`;
  const lines = [
    `Name: ${data.firstName} ${data.lastName}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    `Service of Interest: ${data.service}`,
    "",
    "Message:",
    data.message ? data.message : "(No additional message provided)",
    "",
    "---",
    `Sent via DigiSay Digital Agency Website (${new Date().toLocaleDateString()})`,
  ].filter((line): line is string => line !== null);

  const body = lines.join("\n");
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatInquirySummary(data: ContactFormData): string {
  const lines = [
    `DigiSay Inquiry Details`,
    `-----------------------`,
    `Name: ${data.firstName} ${data.lastName}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    `Service of Interest: ${data.service}`,
    `Date: ${new Date().toLocaleString()}`,
    "",
    `Message:`,
    data.message || "(No additional message provided)",
  ].filter((line): line is string => line !== null);

  return lines.join("\n");
}
