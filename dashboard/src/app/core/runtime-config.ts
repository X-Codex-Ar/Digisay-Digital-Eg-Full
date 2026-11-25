export interface DigiSayRuntimeConfig {
  apiBaseUrl?: string;
  storageBaseUrl?: string;
  publicBaseUrl?: string;
}

declare global {
  interface Window {
    digisayRuntimeConfig?: DigiSayRuntimeConfig;
  }
}
