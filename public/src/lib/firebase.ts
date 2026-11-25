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
let consentUpdateSequence = 0;

async function getClientAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || getAnalyticsConsent() !== "granted") return null;

  analyticsPromise ??= (async () => {
    try {
      const analyticsSdk = await import("firebase/analytics");
      if (!(await analyticsSdk.isSupported())) return null;
      if (getAnalyticsConsent() !== "granted") return null;

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

  if (getAnalyticsConsent() !== "granted") return;

  const { logEvent } = await import("firebase/analytics");
  if (getAnalyticsConsent() !== "granted") return;
  logEvent(analytics, "page_view", { page_path: path, page_title: document.title });
}

export async function applyAnalyticsConsent(
  consent: Exclude<AnalyticsConsent, null>,
): Promise<void> {
  const requestSequence = ++consentUpdateSequence;

  // A rejection does not need to load Analytics when it has never been initialized.
  if (consent === "denied" && !analyticsPromise) return;

  const analyticsSdk = await import("firebase/analytics");

  // A newer visitor choice may have been made while the SDK chunk was loading.
  if (requestSequence !== consentUpdateSequence || getAnalyticsConsent() !== consent) {
    return;
  }

  analyticsSdk.setConsent({
    analytics_storage: consent === "granted" ? "granted" : "denied",
    ad_storage: "denied",
  });

  if (consent === "granted" && typeof window !== "undefined") {
    await trackPageView(window.location.pathname);
  }
}
