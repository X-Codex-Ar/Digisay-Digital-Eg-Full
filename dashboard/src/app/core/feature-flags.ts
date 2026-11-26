import './runtime-config';

/** The AI triage control stays hidden unless the deployment explicitly turns it on. */
export function aiTriageUiEnabled(): boolean {
  return window.digisayRuntimeConfig?.aiTriageEnabled === true;
}
