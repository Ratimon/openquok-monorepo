import manifest from '../manifest.json';

/** Matches `manifest.json` version; surfaced in PING responses. */
export const EXTENSION_VERSION = manifest.version;

/** Minimum interval for periodic cookie refresh alarms (24 hours). */
export const REFRESH_PERIOD_MINUTES = 24 * 60;

/** Relative to API root (`/api/v1`). */
export const EXTENSION_REFRESH_PATH = '/integrations/extension-refresh';

export const REFRESH_ALARM_PREFIX = 'openquok-refresh:';

export const REFRESH_STORAGE_PREFIX = 'openquok:refresh:';
