import { AUTO_LAUNCH_MESSAGE_TYPE } from 'openquok-common';

import { handleAutoLaunchRuntimeMessage } from './auto-launch/backgroundHandlers.js';
import { handleExternalMessage } from './messageHandler.js';
import { ensureRefreshAlarms, handleRefreshAlarm } from './refresh/alarms.js';

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
	void handleExternalMessage(message, sender).then(sendResponse);
	return true;
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (!message || typeof message !== 'object') return;

	const record = message as Record<string, unknown>;
	const type = record.type;
	if (typeof type !== 'string') return;

	const isAutoLaunch =
		type.startsWith('OPENQUOK_AUTO_LAUNCH') || type === AUTO_LAUNCH_MESSAGE_TYPE.PROGRESS;

	if (isAutoLaunch) {
		void handleAutoLaunchRuntimeMessage(record).then(sendResponse);
		return true;
	}

	return undefined;
});

chrome.alarms.onAlarm.addListener((alarm) => {
	void handleRefreshAlarm(alarm.name);
});

chrome.runtime.onInstalled.addListener(() => {
	void ensureRefreshAlarms();
});

chrome.runtime.onStartup.addListener(() => {
	void ensureRefreshAlarms();
});
