import { getApp, getApps, initializeApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import { getAnalyticsConsent, type AnalyticsConsent } from "./analytics-consent";

const firebaseConfig = {
  apiKey: "AIzaSyCZYutIGnilBQC5MgS_g2BGGfybHKrDzNM",
  authDomain: "digisay-db.firebaseapp.com",
  projectId: "digisay-db",
  storageBucket: "digisay-db.firebasestorage.app",
  messagingSenderId: "601536904736",
  appId: "1:601536904736:web:9e43c5f56d5be041ca4645",
  measurementId: "G-G88JF3TYYD",
};

let analyticsPromise: Promise<Analytics | null> | undefined;

async function getClientAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || getAnalyticsConsent() !== "granted") return null;

  analyticsPromise ??= (async () => {
    try {
      const analyticsSdk = await import("firebase/analytics");
      if (!(await analyticsSdk.isSupported())) return null;

      analyticsSdk.setConsent({
        analytics_storage: "granted",
        ad_storage: "denied",
      });

      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      return analyticsSdk.getAnalytics(app);
    } catch {
      return null;
    }
  })();

  return analyticsPromise;
}

export async function trackPageView(path: string): Promise<void> {
  if (getAnalyticsConsent() !== "granted") return;

  const analytics = await getClientAnalytics();
  if (!analytics) return;

  const { logEvent } = await import("firebase/analytics");
  logEvent(analytics, "page_view", { page_path: path, page_title: document.title });
}

export async function applyAnalyticsConsent(
  consent: Exclude<AnalyticsConsent, null>,
): Promise<void> {
  if (consent === "denied") {
    if (!analyticsPromise) return;

    try {
      const analyticsSdk = await import("firebase/analytics");
      analyticsSdk.setConsent({
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    } catch {
      // Consent remains denied in local storage even if the SDK is unavailable.
    }
    return;
  }

  const analyticsSdk = await import("firebase/analytics");
  analyticsSdk.setConsent({
    analytics_storage: "granted",
    ad_storage: "denied",
  });

  if (typeof window !== "undefined") {
    await trackPageView(window.location.pathname);
  }
}
