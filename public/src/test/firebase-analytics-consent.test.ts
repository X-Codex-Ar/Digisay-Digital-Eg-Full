import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ANALYTICS_CONSENT_STORAGE_KEY, saveAnalyticsConsent } from "@/lib/analytics-consent";

vi.mock("firebase/app", () => ({
  getApp: vi.fn(),
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase/analytics", () => ({
  getAnalytics: vi.fn(() => ({})),
  isSupported: vi.fn().mockResolvedValue(true),
  logEvent: vi.fn(),
  setConsent: vi.fn(),
}));

import { getAnalytics, isSupported, logEvent, setConsent } from "firebase/analytics";

describe("Firebase Analytics consent gate", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("does not initialize Firebase Analytics without an explicit opt-in", async () => {
    const { trackPageView } = await import("@/lib/firebase");

    await trackPageView("/");

    expect(isSupported).not.toHaveBeenCalled();
    expect(getAnalytics).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it("initializes and tracks page views only after explicit opt-in", async () => {
    saveAnalyticsConsent("granted");
    const { trackPageView } = await import("@/lib/firebase");

    await trackPageView("/about");

    expect(setConsent).toHaveBeenCalledWith({
      analytics_storage: "granted",
      ad_storage: "denied",
    });
    expect(getAnalytics).toHaveBeenCalledOnce();
    expect(logEvent).toHaveBeenCalledWith({}, "page_view", {
      page_path: "/about",
      page_title: document.title,
    });
  });

  it("stops tracking and revokes Firebase Analytics consent after rejection", async () => {
    saveAnalyticsConsent("granted");
    const firebase = await import("@/lib/firebase");
    await firebase.trackPageView("/");

    saveAnalyticsConsent("denied");
    await firebase.applyAnalyticsConsent("denied");
    await firebase.trackPageView("/contact");

    expect(setConsent).toHaveBeenLastCalledWith({
      analytics_storage: "denied",
      ad_storage: "denied",
    });
    expect(logEvent).toHaveBeenCalledTimes(1);
  });

  it("does not initialize analytics if consent is withdrawn while the SDK is loading", async () => {
    let resolveSupport!: (supported: boolean) => void;
    vi.mocked(isSupported).mockImplementationOnce(
      () => new Promise<boolean>((resolve) => (resolveSupport = resolve)),
    );

    saveAnalyticsConsent("granted");
    const { trackPageView } = await import("@/lib/firebase");
    const pendingTracking = trackPageView("/");

    saveAnalyticsConsent("denied");
    resolveSupport(true);
    await pendingTracking;

    expect(getAnalytics).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
  });
});
