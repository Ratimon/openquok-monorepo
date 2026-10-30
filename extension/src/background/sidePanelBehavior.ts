const SIDE_PANEL_PATH = 'sidepanel.html';

/**
 * Open the side panel while the user-gesture chain is still active.
 * Must run **synchronously** inside `contextMenus.onClicked` / `action.onClicked` — not inside an async IIFE.
 */
export function openSidePanelInUserGesture(tab?: chrome.tabs.Tab): void {
	try {
		if (tab?.id !== undefined) {
			void chrome.sidePanel.open({ tabId: tab.id });
			return;
		}
		if (tab?.windowId !== undefined) {
			void chrome.sidePanel.open({ windowId: tab.windowId });
			return;
		}
		void chrome.windows.getCurrent().then((window) => {
			if (window.id !== undefined) {
				void chrome.sidePanel.open({ windowId: window.id });
			}
		});
	} catch {
		/* sidePanel may be unavailable on older builds */
	}
}

/** Open the extension side panel in the tab's window (or the current window). */
export async function openSidePanelForTab(tab?: chrome.tabs.Tab): Promise<void> {
	const windowId =
		tab?.windowId !== undefined ? tab.windowId : (await chrome.windows.getCurrent()).id;
	if (windowId === undefined) return;
	await chrome.sidePanel.open({ windowId });
}

/**
 * Toolbar icon opens the side panel (no action popup).
 * Clears any cached `default_popup` path so Chrome does not try to load removed popup.html.
 */
export async function enableSidePanelOnActionClick(): Promise<void> {
	await chrome.action.setPopup({ popup: '' });
	await chrome.sidePanel.setOptions({ path: SIDE_PANEL_PATH, enabled: true });
	await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}

let toolbarClickFallbackRegistered = false;

/**
 * Fallback when `openPanelOnActionClick` is unavailable or the action still has a stale popup.
 * `action.onClicked` does not run when a popup is set; `setPopup('')` above prevents that.
 */
export function registerSidePanelToolbarClickFallback(): void {
	if (toolbarClickFallbackRegistered) return;
	toolbarClickFallbackRegistered = true;
	chrome.action.onClicked.addListener((tab) => {
		openSidePanelInUserGesture(tab);
	});
}
