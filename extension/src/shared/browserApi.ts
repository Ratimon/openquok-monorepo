/**
 * Cross-browser WebExtension API (Chromium + Firefox). Prefer this over bare `chrome.*` in
 * background paths that differ by store build (sidebar vs side panel, optional polyfill).
 */
import browser from 'webextension-polyfill';

export { browser };
