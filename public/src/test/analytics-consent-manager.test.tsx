import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ANALYTICS_CONSENT_STORAGE_KEY } from "@/lib/analytics-consent";
import { AnalyticsConsentManager } from "@/components/common/AnalyticsConsentManager";

vi.mock("@/lib/firebase", () => ({
  applyAnalyticsConsent: vi.fn().mockResolvedValue(undefined),
}));

describe("AnalyticsConsentManager", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("shows the choice before any analytics consent has been stored", async () => {
    render(<AnalyticsConsentManager />);

    expect(await screen.findByRole("region", { name: "Privacy preferences" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Allow analytics" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reject optional analytics" })).toBeTruthy();
  });

  it("persists rejection and lets the visitor reopen privacy settings", async () => {
    render(<AnalyticsConsentManager />);

    fireEvent.click(await screen.findByRole("button", { name: "Reject optional analytics" }));

    await waitFor(() => {
      expect(window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe("denied");
    });
    fireEvent.click(screen.getByRole("button", { name: "Open privacy settings" }));
    expect(screen.getByRole("region", { name: "Privacy preferences" })).toBeTruthy();
  });

  it("persists an explicit opt-in", async () => {
    render(<AnalyticsConsentManager />);

    fireEvent.click(await screen.findByRole("button", { name: "Allow analytics" }));

    await waitFor(() => {
      expect(window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe("granted");
    });
  });
});
