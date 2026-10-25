import { openSidePanelForTab } from '../background/sidePanelBehavior.js';
import { SIDE_PANEL_UI_MESSAGE } from '../ui/sidepanel/sidePanelMessages.js';

import {
	type SocialComposerDraftInput,
	type SocialComposerDraftSource,
	writeSocialComposerDraft,
} from './sessionDraftStorage.js';

export const SOCIAL_CONTEXT_MENU_IDS = {
	SHARE_SELECTION: 'openquok-share-selection',
	SHARE_PAGE: 'openquok-share-page',
	SHARE_IMAGE: 'openquok-share-image',
} as const;

export const SOCIAL_CONTEXT_MENU_TITLE = 'Schedule with OpenQuok';

const MENU_ID_TO_SOURCE: Record<string, SocialComposerDraftSource> = {
	[SOCIAL_CONTEXT_MENU_IDS.SHARE_SELECTION]: 'selection',
	[SOCIAL_CONTEXT_MENU_IDS.SHARE_PAGE]: 'page',
	[SOCIAL_CONTEXT_MENU_IDS.SHARE_IMAGE]: 'image',
};

export function buildSocialComposerDraftFromContextMenu(
	info: chrome.contextMenus.OnClickData,
	tab?: chrome.tabs.Tab
): SocialComposerDraftInput | null {
	const source = typeof info.menuItemId === 'string' ? MENU_ID_TO_SOURCE[info.menuItemId] : undefined;
	if (!source) return null;

	const pageTitle = tab?.title?.trim() || undefined;
	const pageUrl = info.pageUrl?.trim() || tab?.url?.trim() || undefined;

	if (source === 'selection') {
		const selection = info.selectionText?.trim();
		if (!selection) return null;
		return {
			source,
			body: selection,
			pageUrl,
			pageTitle,
		};
	}

	if (source === 'page') {
		const title = pageTitle || 'Shared page';
		const url = pageUrl || '';
		const body = url ? `${title}\n\n${url}` : title;
		return {
			source,
			body,
			pageUrl: url || undefined,
			pageTitle,
		};
	}

	const mediaUrl = info.srcUrl?.trim();
	if (!mediaUrl) return null;
	return {
		source,
		body: pageTitle || 'Shared image',
		mediaUrl,
		pageUrl,
		pageTitle,
	};
}

export function installSocialContextMenus(): void {
	chrome.contextMenus.removeAll(() => {
		chrome.contextMenus.create({
			id: SOCIAL_CONTEXT_MENU_IDS.SHARE_SELECTION,
			title: SOCIAL_CONTEXT_MENU_TITLE,
			contexts: ['selection'],
		});
		chrome.contextMenus.create({
			id: SOCIAL_CONTEXT_MENU_IDS.SHARE_PAGE,
			title: SOCIAL_CONTEXT_MENU_TITLE,
			contexts: ['page'],
		});
		chrome.contextMenus.create({
			id: SOCIAL_CONTEXT_MENU_IDS.SHARE_IMAGE,
			title: SOCIAL_CONTEXT_MENU_TITLE,
			contexts: ['image'],
		});
	});
}

export async function openSocialSidePanel(tab?: chrome.tabs.Tab): Promise<void> {
	await openSidePanelForTab(tab);
	try {
		await chrome.runtime.sendMessage({
			type: SIDE_PANEL_UI_MESSAGE.FOCUS_TAB,
			tab: 'social',
		});
	} catch {
		// Panel may still be loading; draft in session storage is picked up on refresh.
	}
}

export async function handleSocialContextMenuClick(
	info: chrome.contextMenus.OnClickData,
	tab?: chrome.tabs.Tab
): Promise<void> {
	const draft = buildSocialComposerDraftFromContextMenu(info, tab);
	if (!draft) return;
	await writeSocialComposerDraft(draft);
	await openSocialSidePanel(tab);
}

export function registerSocialContextMenuListeners(): void {
	chrome.contextMenus.onClicked.addListener((info, tab) => {
		void handleSocialContextMenuClick(info, tab);
	});
}
