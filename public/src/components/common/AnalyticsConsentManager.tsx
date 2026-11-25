import { useEffect, useState } from "react";

import {
  getAnalyticsConsent,
  saveAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-consent";

export function AnalyticsConsentManager() {
  const [consent, setConsent] = useState<AnalyticsConsent>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedConsent = getAnalyticsConsent();
    setConsent(storedConsent);
    setIsOpen(storedConsent === null);
  }, []);

  const chooseConsent = (nextConsent: Exclude<AnalyticsConsent, null>) => {
    saveAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
    setIsOpen(false);

    void import("@/lib/firebase")
      .then(({ applyAnalyticsConsent }) => applyAnalyticsConsent(nextConsent))
      .catch(() => {
        // Analytics is optional; a provider failure must never block the website.
      });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[90] rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-lg transition-colors hover:border-primary hover:text-primary"
        aria-label="Open privacy settings"
      >
        Privacy settings
      </button>
    );
  }

  return (
    <section
      role="region"
      aria-label="Privacy preferences"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl sm:inset-x-6 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-base font-bold">Your privacy choices</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Optional Firebase Analytics helps us understand visits to this public website.
            Analytics stays off unless you choose to allow it. You can change this choice at
            any time from Privacy settings. Read our{" "}
            <a className="font-semibold text-primary underline underline-offset-4" href="/privacy-policy">
              Privacy Policy
            </a>
            .
          </p>
        </div>
        {consent !== null && (
          <span className="shrink-0 text-xs text-muted-foreground">
            Current choice: {consent === "granted" ? "Allowed" : "Rejected"}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => chooseConsent("granted")}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Allow analytics
        </button>
        <button
          type="button"
          onClick={() => chooseConsent("denied")}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50"
        >
          Reject optional analytics
        </button>
      </div>
    </section>
  );
}
