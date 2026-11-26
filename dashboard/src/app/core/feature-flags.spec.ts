import { aiTriageUiEnabled } from './feature-flags';

describe('feature flags', () => {
  afterEach(() => {
    window.digisayRuntimeConfig = undefined;
  });

  it('keeps the AI triage control hidden by default', () => {
    window.digisayRuntimeConfig = { apiBaseUrl: 'http://localhost:5080' };
    expect(aiTriageUiEnabled()).toBe(false);
  });

  it('keeps the AI triage control hidden for non-true values', () => {
    window.digisayRuntimeConfig = { aiTriageEnabled: 'true' as unknown as boolean };
    expect(aiTriageUiEnabled()).toBe(false);
  });

  it('shows the AI triage control only when explicitly enabled', () => {
    window.digisayRuntimeConfig = { aiTriageEnabled: true };
    expect(aiTriageUiEnabled()).toBe(true);
  });
});
