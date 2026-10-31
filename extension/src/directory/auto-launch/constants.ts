/** Relative to API root (`/api/v1`). */
export const AUTO_LAUNCH_COMPLETE_PATH = '/auto-launch/submissions/complete';

export const AUTO_LAUNCH_PROFILES_PATH = '/auto-launch/profiles';

export const AUTO_LAUNCH_SUBMISSION_INTENT_PATH = '/auto-launch/submissions/intent';

export const AUTO_LAUNCH_STORAGE_KEY = 'openquok:auto-launch:session';

export const AUTO_LAUNCH_PANEL_POSITION_KEY = 'openquok:auto-launch:panel-position';

/** Side panel / popup → background: focus handoff tab and show the on-page step rail. */
export const OPENQUOK_AUTO_LAUNCH_SHOW_PANEL = 'OPENQUOK_AUTO_LAUNCH_SHOW_PANEL';

/** Content script: show step rail without a launch session (Fill actions disabled). */
export const OPENQUOK_AUTO_LAUNCH_SHOW_IDLE_PANEL = 'OPENQUOK_AUTO_LAUNCH_SHOW_IDLE_PANEL';
