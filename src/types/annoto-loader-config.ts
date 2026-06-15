export interface AnnotoLoaderConfig {
  /**
   * Annoto API key (JWT). Required. Named `clientId` to match the Annoto docs.
   */
  clientId: string;

  /**
   * Annoto service region for the API key: 'eu' | 'us' | 'staging'. Default 'eu'.
   */
  region?: string;

  /**
   * Optional widget theme override: 'dark' | 'default'. Prefer setting this in
   * the Annoto dashboard; this is here only for per-embed override.
   */
  theme?: string;

  /**
   * Override the Annoto plugin.js URL (e.g. staging) if ever needed.
   */
  scriptUrl?: string;
}
