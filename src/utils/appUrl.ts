/**
 * Application URL Helper
 * Provides the public URL for Anime Quest, accessible to all users and mobile devices
 * without encountering 403 Forbidden errors from the internal dev container.
 */

export const PUBLIC_APP_URL = 'https://ais-pre-jgpdzwlpyej24irb2sqqke-215634348583.europe-west2.run.app';

/**
 * Returns the public, globally accessible URL of the app.
 * If currently viewed in an internal dev container ('ais-dev-'), it maps it to the public preview ('ais-pre-').
 */
export function getPublicAppUrl(): string {
  if (typeof window === 'undefined') {
    return PUBLIC_APP_URL;
  }

  const hostname = window.location.hostname;
  if (hostname.includes('ais-dev-')) {
    return `${window.location.protocol}//${hostname.replace('ais-dev-', 'ais-pre-')}${window.location.pathname}${window.location.search}`;
  }

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return PUBLIC_APP_URL;
  }

  return window.location.href;
}

/**
 * Checks whether the current window is running inside the private dev sandbox
 */
export function isDevEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('ais-dev-') || window.location.hostname.includes('localhost');
}
