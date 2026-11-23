export interface DigiSayRuntimeConfig {
  apiBaseUrl?: string;
  storageBaseUrl?: string;
}

declare global {
  interface Window {
    digisayRuntimeConfig?: DigiSayRuntimeConfig;
  }
}
