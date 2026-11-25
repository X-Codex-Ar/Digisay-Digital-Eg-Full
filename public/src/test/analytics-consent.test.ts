import { afterEach, describe, expect, it } from "vitest";

import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  getAnalyticsConsent,
  saveAnalyticsConsent,
} from "@/lib/analytics-consent";

describe("analytics consent storage", () => {
  afterEach(() => window.localStorage.clear());

  it("defaults to no consent when no valid choice exists", () => {
    expect(getAnalyticsConsent()).toBeNull();
  });

  it("accepts only explicit granted or denied values", () => {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "unknown");
    expect(getAnalyticsConsent()).toBeNull();

    saveAnalyticsConsent("granted");
    expect(getAnalyticsConsent()).toBe("granted");

    saveAnalyticsConsent("denied");
    expect(getAnalyticsConsent()).toBe("denied");
  });
});
