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
    const analyticsSdk = await import("firebase/analytics");
    const { trackPageView } = await import("@/lib/firebase");

    await trackPageView("/");

    expect(analyticsSdk.isSupported).not.toHaveBeenCalled();
    expect(analyticsSdk.getAnalytics).not.toHaveBeenCalled();
    expect(analyticsSdk.logEvent).not.toHaveBeenCalled();
  });

  it("initializes and tracks page views only after explicit opt-in", async () => {
    const analyticsSdk = await import("firebase/analytics");
    saveAnalyticsConsent("granted");
    const { trackPageView } = await import("@/lib/firebase");

    await trackPageView("/about");

    expect(analyticsSdk.setConsent).toHaveBeenCalledWith({
      analytics_storage: "granted",
      ad_storage: "denied",
    });
    expect(analyticsSdk.getAnalytics).toHaveBeenCalledOnce();
    expect(analyticsSdk.logEvent).toHaveBeenCalledWith({}, "page_view", {
      page_path: "/about",
      page_title: document.title,
    });
  });

  it("stops tracking and revokes Firebase Analytics consent after rejection", async () => {
    const analyticsSdk = await import("firebase/analytics");
    saveAnalyticsConsent("granted");
    const firebase = await import("@/lib/firebase");
    await firebase.trackPageView("/");

    saveAnalyticsConsent("denied");
    await firebase.applyAnalyticsConsent("denied");
    await firebase.trackPageView("/contact");

    expect(analyticsSdk.setConsent).toHaveBeenLastCalledWith({
      analytics_storage: "denied",
      ad_storage: "denied",
    });
    expect(analyticsSdk.logEvent).toHaveBeenCalledTimes(1);
  });

  it("does not initialize analytics if consent is withdrawn while the SDK is loading", async () => {
    const analyticsSdk = await import("firebase/analytics");
    let resolveSupport!: (supported: boolean) => void;
    let notifySupportStarted!: () => void;
    const supportStarted = new Promise<void>((resolve) => (notifySupportStarted = resolve));
    vi.mocked(analyticsSdk.isSupported).mockImplementationOnce(() => {
      notifySupportStarted();
      return new Promise<boolean>((resolve) => (resolveSupport = resolve));
    });

    saveAnalyticsConsent("granted");
    const { trackPageView } = await import("@/lib/firebase");
    const pendingTracking = trackPageView("/");

    await supportStarted;
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "denied");
    resolveSupport(true);
    await pendingTracking;

    expect(analyticsSdk.getAnalytics).not.toHaveBeenCalled();
    expect(analyticsSdk.logEvent).not.toHaveBeenCalled();
  });
});
