import { handleExternalMessage } from './messageHandler.js';
import { ensureRefreshAlarms, handleRefreshAlarm } from './refresh/alarms.js';

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
	void handleExternalMessage(message).then(sendResponse);
	return true;
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
