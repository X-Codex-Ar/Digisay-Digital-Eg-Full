import { getApp, getApps, initializeApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";

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
  if (typeof window === "undefined") return null;
  analyticsPromise ??= (async () => {
    try {
      const analyticsSdk = await import("firebase/analytics");
      if (!(await analyticsSdk.isSupported())) return null;
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      return analyticsSdk.getAnalytics(app);
    } catch {
      return null;
    }
  })();
  return analyticsPromise;
}

export async function trackPageView(path: string): Promise<void> {
  const analytics = await getClientAnalytics();
  if (!analytics) return;
  const { logEvent } = await import("firebase/analytics");
  logEvent(analytics, "page_view", { page_path: path, page_title: document.title });
}
