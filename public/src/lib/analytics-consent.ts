export type AnalyticsConsent = "granted" | "denied" | null;

export const ANALYTICS_CONSENT_STORAGE_KEY = "digisay_analytics_consent_v1";

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    // Keep the in-memory choice for this page session if browser storage is unavailable.
  }
}
