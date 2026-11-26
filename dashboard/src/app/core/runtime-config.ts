export interface DigiSayRuntimeConfig {
  apiBaseUrl?: string;
  storageBaseUrl?: string;
  publicBaseUrl?: string;
  /** Shows the admin AI triage control. Off unless a deployment sets it to true. */
  aiTriageEnabled?: boolean;
}

declare global {
  interface Window {
    digisayRuntimeConfig?: DigiSayRuntimeConfig;
  }
}
