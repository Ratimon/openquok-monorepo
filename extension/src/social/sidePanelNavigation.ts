import { openSidePanelInUserGesture } from '../background/sidePanelBehavior.js';
import {
	SIDE_PANEL_PENDING_TAB_KEY,
	SIDE_PANEL_UI_MESSAGE,
	type SidePanelFocusTab,
} from '../ui/sidepanel/sidePanelMessages.js';

async function focusSidePanelTab(tab: SidePanelFocusTab): Promise<void> {
	try {
		await chrome.storage.session.set({ [SIDE_PANEL_PENDING_TAB_KEY]: tab });
	} catch {
		/* ignore */
	}
	try {
		await chrome.runtime.sendMessage({
			type: SIDE_PANEL_UI_MESSAGE.FOCUS_TAB,
			tab,
		});
	} catch {
		// Panel may still be loading; pending tab is read on sidepanel init.
	}
}

export async function openSocialSidePanel(tab?: chrome.tabs.Tab): Promise<void> {
	openSidePanelInUserGesture(tab);
	await focusSidePanelTab('social');
}

export async function openDirectorySidePanel(tab?: chrome.tabs.Tab): Promise<void> {
	openSidePanelInUserGesture(tab);
	await focusSidePanelTab('directory');
}
