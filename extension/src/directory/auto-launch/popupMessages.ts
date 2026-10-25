import type { AutoLaunchProgressPayload } from 'openquok-common';

import type { StoredAutoLaunchState } from './sessionStorage.js';

/** Messages broadcast from the background service worker to directory UI (popup + side panel). */
export const POPUP_UI_MESSAGE = {
	STATE_CHANGED: 'OPENQUOK_AUTO_LAUNCH_STATE_CHANGED',
	PROGRESS: 'OPENQUOK_AUTO_LAUNCH_PROGRESS',
} as const;

export type PopupUiMessage =
	| { type: typeof POPUP_UI_MESSAGE.STATE_CHANGED; state: StoredAutoLaunchState | null }
	| { type: typeof POPUP_UI_MESSAGE.PROGRESS; progress: AutoLaunchProgressPayload };
