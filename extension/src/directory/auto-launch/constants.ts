/** Relative to API root (`/api/v1`). */
export const AUTO_LAUNCH_COMPLETE_PATH = '/auto-launch/submissions/complete';

export const AUTO_LAUNCH_PROFILES_PATH = '/auto-launch/profiles';

export const AUTO_LAUNCH_SUBMISSION_INTENT_PATH = '/auto-launch/submissions/intent';

export const AUTO_LAUNCH_REFRESH_INTENT_PATH = '/auto-launch/submissions/intent/refresh';

export const AUTO_LAUNCH_STORAGE_KEY = 'openquok:auto-launch:session';

export const AUTO_LAUNCH_PANEL_POSITION_KEY = 'openquok:auto-launch:panel-position';

/** Side panel / popup → background: focus handoff tab and show the on-page step rail. */
export const OPENQUOK_AUTO_LAUNCH_SHOW_PANEL = 'OPENQUOK_AUTO_LAUNCH_SHOW_PANEL';

/** Side panel / popup → background: open or focus the directory site for the selected channel chip. */
export const OPENQUOK_AUTO_LAUNCH_OPEN_DIRECTORY_PAGE =
	'OPENQUOK_AUTO_LAUNCH_OPEN_DIRECTORY_PAGE';

/** Side panel / popup → background: focus the directory tab for the active (or selected) launch. */
export const OPENQUOK_AUTO_LAUNCH_FOCUS_TAB = 'OPENQUOK_AUTO_LAUNCH_FOCUS_TAB';

/** Side panel / popup → background → content: dock the on-page fill panel to the default top-left anchor. */
export const OPENQUOK_AUTO_LAUNCH_RESET_PANEL_POSITION =
	'OPENQUOK_AUTO_LAUNCH_RESET_PANEL_POSITION';

/** Background → content: hide step rail when handoff moved to another directory tab. */
export const OPENQUOK_AUTO_LAUNCH_DISMISS_PANEL = 'OPENQUOK_AUTO_LAUNCH_DISMISS_PANEL';

/** Side panel → background: reload product profile snapshot from OpenQuok after dashboard edits. */
export const OPENQUOK_AUTO_LAUNCH_REFRESH_PROFILE = 'OPENQUOK_AUTO_LAUNCH_REFRESH_PROFILE';

/** Content script: show step rail without a launch session (Fill actions disabled). */
export const OPENQUOK_AUTO_LAUNCH_SHOW_IDLE_PANEL = 'OPENQUOK_AUTO_LAUNCH_SHOW_IDLE_PANEL';

/** Background: list main + variant profiles for the active launch product. */
export const OPENQUOK_AUTO_LAUNCH_PROFILE_SOURCES = 'OPENQUOK_AUTO_LAUNCH_PROFILE_SOURCES';

/** Background: switch compare/fill snapshot to another profile in the product family. */
export const OPENQUOK_AUTO_LAUNCH_SWITCH_PROFILE_SOURCE = 'OPENQUOK_AUTO_LAUNCH_SWITCH_PROFILE_SOURCE';

/** Background: read another family profile snapshot without switching the active handoff. */
export const OPENQUOK_AUTO_LAUNCH_PEEK_PROFILE_SNAPSHOT =
	'OPENQUOK_AUTO_LAUNCH_PEEK_PROFILE_SNAPSHOT';
