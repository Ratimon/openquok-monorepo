/** `window` event the dashboard account page listens for (dispatched from the extension content script). */
export const DASHBOARD_OPEN_ADD_CHANNEL_WINDOW_EVENT = 'openquok:open-add-channel-picker';

/** `chrome.tabs.sendMessage` payload from the extension when an account tab is already open. */
export const DASHBOARD_OPEN_ADD_CHANNEL_EXTENSION_MESSAGE = 'OPENQUOK_OPEN_ADD_CHANNEL_PICKER';

/** Short-lived URL hash after redirecting away from `?addChannel=1` (stripped once the picker opens). */
export const DASHBOARD_OPEN_ADD_CHANNEL_URL_HASH = '#openquok-add-channel';
