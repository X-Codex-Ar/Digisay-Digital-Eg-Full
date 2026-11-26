import './runtime-config';

const API_BASE_URL = (window.digisayRuntimeConfig?.apiBaseUrl ?? 'http://localhost:5080').replace(
  /\/$/,
  '',
);

export function apiUrl(path: string): string {
  return `${API_BASE_URL}/api/v1/${path.replace(/^\/+/, '')}`;
}

export function apiHealthUrl(): string {
  return `${API_BASE_URL}/health/ready`;
}
