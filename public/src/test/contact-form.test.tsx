import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  contactSchema,
  generateMailtoUrl,
  formatInquirySummary,
  type ContactFormData,
} from "@/features/contact/schema";
import { submitContactInquiry } from "@/features/contact/server";
import { ContactForm } from "@/features/contact/components/ContactForm";

const validData: ContactFormData = {
  firstName: "Elena",
  lastName: "Rostova",
  email: "elena@media-house.com",
  service: "Content Production",
  message: "Need 4K studio production and localized video editing.",
  botField: "",
};

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

    const result = await submitContactInquiry(validData);
    expect(result.success).toBe(false);
    expect(result.fallback).toBe(true);
    expect(result.mailtoUrl).toBeDefined();
    expect(result.recipient).toBe("info@digisay.com");
    expect(result.message).toMatch(/check your connection and retry/i);
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
    expect(result.success).toBe(false);
    expect(result.delivered).toBe(false);
    expect(result.fallback).toBe(false); // No mailto or delivery triggered for bot
  });

  it("maps API validation failures to safe field guidance", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: { Email: ["secret server detail"] } }), {
        status: 400,
      }),
    );

    const result = await submitContactInquiry(validData);

    expect(result.success).toBe(false);
    expect(result.fallback).toBe(false);
    expect(result.errors?.email).toBe("Please check this field and try again.");
    expect(JSON.stringify(result)).not.toContain("secret server detail");
  });

  it("maps rate limiting to a wait-and-retry message with a separate email action", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 429 }));

    const result = await submitContactInquiry(validData);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/wait a few minutes/i);
    expect(result.fallback).toBe(true);
    expect(result.mailtoUrl).toContain("mailto:");
  });

  it("offers a safe email fallback when the API returns a server error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "database password leaked" }), { status: 500 }),
    );

    const result = await submitContactInquiry(validData);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/temporarily unavailable/i);
    expect(JSON.stringify(result)).not.toContain("database password leaked");
    expect(result.mailtoUrl).toContain("mailto:");
  });

  it("distinguishes a timeout from a network failure without exposing exception text", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new DOMException("secret timeout detail", "TimeoutError"),
    );
    const timeoutResult = await submitContactInquiry(validData);
    expect(timeoutResult.message).toMatch(/timed out/i);
    expect(timeoutResult.message).not.toContain("secret timeout detail");

    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("secret network detail"));
    const networkResult = await submitContactInquiry(validData);
    expect(networkResult.message).toMatch(/could not reach our service/i);
    expect(networkResult.message).not.toContain("secret network detail");
  });

  it("allows a retry after a failed request", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    fetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "retry-id", createdAtUtc: new Date().toISOString() }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const firstAttempt = await submitContactInquiry(validData);
    const retry = await submitContactInquiry(validData);

    expect(firstAttempt.success).toBe(false);
    expect(retry.success).toBe(true);
    expect(retry.stored).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("locks the form during an in-flight request and prevents duplicate submissions", async () => {
    let resolveRequest!: (response: Response) => void;
    const request = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    const fetch = vi.spyOn(globalThis, "fetch").mockReturnValue(request);
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: "Elena" } });
    fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: "Rostova" } });
    fireEvent.change(screen.getByLabelText(/Email Address/), {
      target: { value: "elena@media-house.com" },
    });
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("option", { name: "Content Production" }));

    const form = screen.getByRole("button", { name: /Send Message/ }).closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    expect(form?.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("button", { name: /Sending Inquiry/ }).hasAttribute("disabled")).toBe(
      true,
    );
    fireEvent.submit(form!);
    expect(fetch).toHaveBeenCalledTimes(1);

    resolveRequest(
      new Response(JSON.stringify({ id: "in-flight-id", createdAtUtc: new Date().toISOString() }), {
        status: 201,
      }),
    );
    expect(await screen.findByText("Inquiry Received!")).toBeTruthy();
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
