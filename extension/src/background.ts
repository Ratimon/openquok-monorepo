import { isAutoLaunchMessageType } from 'openquok-common';

import { handleAutoLaunchRuntimeMessage } from './background/directoryHandlers.js';
import { handleExternalMessage } from './background/externalHandlers.js';
import {
	enableSidePanelOnActionClick,
	registerSidePanelToolbarClickFallback,
} from './background/sidePanelBehavior.js';
import {
	installSocialExtensionSurfaces,
	registerSocialBackgroundHandlers,
} from './background/socialHandlers.js';
import { OPEN_URL_MESSAGE } from './directory/directory-launch/directoryGate.js';
import { ensureRefreshAlarms, handleRefreshAlarm } from './refresh/alarms.js';

function replyWhenDone(
	promise: Promise<unknown>,
	sendResponse: (response?: unknown) => void
): void {
	void promise
		.then((result) => sendResponse(result))
		.catch((error: unknown) => {
			sendResponse({
				ok: false,
				error: error instanceof Error ? error.message : 'Extension handler failed.',
			});
		});
}

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
	replyWhenDone(handleExternalMessage(message, sender), sendResponse);
	return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (!message || typeof message !== 'object') return;

	const record = message as Record<string, unknown>;
	const type = record.type;
	if (typeof type !== 'string') return;

	const isAutoLaunch =
		type.startsWith('OPENQUOK_AUTO_LAUNCH') ||
		type === 'OPENQUOK_CHECK_DIRECTORY_GATE' ||
		type === OPEN_URL_MESSAGE ||
		isAutoLaunchMessageType(type);

	if (isAutoLaunch) {
		replyWhenDone(handleAutoLaunchRuntimeMessage(record, sender), sendResponse);
		return true;
	}

	return undefined;
});

chrome.alarms.onAlarm.addListener((alarm) => {
	void handleRefreshAlarm(alarm.name);
});

registerSocialBackgroundHandlers();
registerSidePanelToolbarClickFallback();
void enableSidePanelOnActionClick();

function bootstrapExtensionSurfaces(): void {
	installSocialExtensionSurfaces();
	void enableSidePanelOnActionClick();
	void ensureRefreshAlarms();
}

chrome.runtime.onInstalled.addListener(() => {
	bootstrapExtensionSurfaces();
});

chrome.runtime.onStartup.addListener(() => {
	bootstrapExtensionSurfaces();
});
