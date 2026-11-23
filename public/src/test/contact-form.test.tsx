import { afterEach, describe, expect, it, vi } from "vitest";
import {
  contactSchema,
  generateMailtoUrl,
  formatInquirySummary,
  type ContactFormData,
} from "@/features/contact/schema";
import { submitContactInquiry } from "@/features/contact/server";

describe("Contact Form Validation & Submission", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("rejects invalid or incomplete form payloads", () => {
    const invalidPayload = {
      firstName: "",
      lastName: "",
      email: "not-an-email",
      service: "Invalid Service",
    };

    const result = contactSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("firstName");
      expect(paths).toContain("lastName");
      expect(paths).toContain("email");
      expect(paths).toContain("service");
    }
  });

  it("accepts valid form submissions with proper constraints", () => {
    const validData: ContactFormData = {
      firstName: "Sarah",
      lastName: "Connor",
      email: "sarah@cyberdyne.org",
      phone: "+1 555-0199",
      service: "Anti-Piracy",
      message: "We need comprehensive digital rights management for our upcoming release.",
      botField: "",
    };

    const parseResult = contactSchema.safeParse(validData);
    expect(parseResult.success).toBe(true);
  });

  it("rejects invalid phone numbers when provided", () => {
    const dataWithBadPhone = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123", // too short
      service: "Growth Marketing" as const,
    };

    const parseResult = contactSchema.safeParse(dataWithBadPhone);
    expect(parseResult.success).toBe(false);
  });

  it("generates a well-formed mailto URL for safe email client dispatch", () => {
    const validData: ContactFormData = {
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex@agency.com",
      phone: "+1 (800) 555-1234",
      service: "Content Management",
      message: "Looking for YouTube CMS management and rights protection across MENA.",
      botField: "",
    };

    const mailtoUrl = generateMailtoUrl(validData);
    expect(mailtoUrl).toContain("mailto:info@digisay.com");
    expect(mailtoUrl).toContain(
      encodeURIComponent("[Inquiry - Content Management] From Alex Morgan"),
    );
    expect(mailtoUrl).toContain(encodeURIComponent("Email: alex@agency.com"));
    expect(mailtoUrl).toContain(encodeURIComponent("Phone: +1 (800) 555-1234"));
  });

  it("formats inquiry summary correctly for clipboard copying", () => {
    const validData: ContactFormData = {
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex@agency.com",
      service: "Social Media Management",
      message: "Brand partnership inquiry.",
      botField: "",
    };

    const summary = formatInquirySummary(validData);
    expect(summary).toContain("DigiSay Inquiry Details");
    expect(summary).toContain("Name: Alex Morgan");
    expect(summary).toContain("Email: alex@agency.com");
    expect(summary).toContain("Service of Interest: Social Media Management");
  });

  it("stores inquiry via backend API when reachable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "mock-id-123", createdAtUtc: new Date().toISOString() }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const validData: ContactFormData = {
      firstName: "Elena",
      lastName: "Rostova",
      email: "elena@media-house.com",
      service: "Content Production",
      message: "Need 4K studio production and localized video editing.",
      botField: "",
    };

    const result = await submitContactInquiry(validData, "test-client-live");
    expect(result.success).toBe(true);
    expect(result.stored).toBe(true);
    expect(result.fallback).toBe(false);
  });

  it("server handler safely provides fallback delivery when API is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Connection refused"));

    const validData: ContactFormData = {
      firstName: "Elena",
      lastName: "Rostova",
      email: "elena@media-house.com",
      service: "Content Production",
      message: "Need 4K studio production and localized video editing.",
      botField: "",
    };

    const result = await submitContactInquiry(validData, "test-client-1");
    expect(result.success).toBe(true);
    expect(result.fallback).toBe(true);
    expect(result.mailtoUrl).toBeDefined();
    expect(result.recipient).toBe("info@digisay.com");
  });

  it("silently traps bot spam submissions via honeypot field", async () => {
    const botData = {
      firstName: "Bot",
      lastName: "Spammer",
      email: "bot@spam.com",
      service: "Anti-Piracy" as const,
      botField: "http://spam-link.ru", // Bot filled honeypot
    };

    const result = await submitContactInquiry(botData, "bot-client");
    expect(result.success).toBe(true);
    expect(result.delivered).toBe(false);
    expect(result.fallback).toBe(false); // No mailto or delivery triggered for bot
  });

  it("ensures mailto URL and copy summary use the identical validated data snapshot", () => {
    const validatedData: ContactFormData = {
      firstName: "Marcus",
      lastName: "Aurelius",
      email: "marcus@meditations.org",
      phone: "+1 555-4321",
      service: "Anti-Piracy",
      message: "Protect our philosophical literary rights globally.",
      botField: "",
    };

    const mailto = generateMailtoUrl(validatedData);
    const summary = formatInquirySummary(validatedData);

    // Verify both artifacts reflect the exact same user identity and content
    expect(mailto).toContain(encodeURIComponent("Marcus Aurelius"));
    expect(summary).toContain("Marcus Aurelius");
    expect(mailto).toContain(encodeURIComponent("marcus@meditations.org"));
    expect(summary).toContain("marcus@meditations.org");
    expect(mailto).toContain(encodeURIComponent("+1 555-4321"));
    expect(summary).toContain("+1 555-4321");
    expect(mailto).toContain(encodeURIComponent("Anti-Piracy"));
    expect(summary).toContain("Anti-Piracy");
  });
});
