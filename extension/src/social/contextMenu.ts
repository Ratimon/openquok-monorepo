import { openSidePanelInUserGesture } from '../background/sidePanelBehavior.js';
import {
	SIDE_PANEL_PENDING_TAB_KEY,
	SIDE_PANEL_UI_MESSAGE,
	type SidePanelFocusTab,
} from '../ui/sidepanel/sidePanelMessages.js';

import {
	type SocialComposerDraftInput,
	type SocialComposerDraftSource,
	writeSocialComposerDraft,
} from './sessionDraftStorage.js';

export const SOCIAL_CONTEXT_MENU_IDS = {
	SHARE_SELECTION: 'openquok-share-selection',
	SHARE_PAGE: 'openquok-share-page',
	SHARE_LINK: 'openquok-share-link',
	SHARE_IMAGE: 'openquok-share-image',
} as const;

export const DIRECTORY_CONTEXT_MENU_IDS = {
	FILL_PAGE: 'openquok-directory-page',
	FILL_LINK: 'openquok-directory-link',
} as const;

export const SOCIAL_CONTEXT_MENU_TITLE = 'Schedule with OpenQuok';
export const DIRECTORY_CONTEXT_MENU_TITLE = 'Auto fill Directory with OpenQuok';

const MENU_ID_TO_SOURCE: Record<string, SocialComposerDraftSource> = {
	[SOCIAL_CONTEXT_MENU_IDS.SHARE_SELECTION]: 'selection',
	[SOCIAL_CONTEXT_MENU_IDS.SHARE_PAGE]: 'page',
	[SOCIAL_CONTEXT_MENU_IDS.SHARE_LINK]: 'page',
	[SOCIAL_CONTEXT_MENU_IDS.SHARE_IMAGE]: 'image',
};

const SOCIAL_CONTEXT_MENU_IDS_SET = new Set<string>(Object.values(SOCIAL_CONTEXT_MENU_IDS));
const DIRECTORY_CONTEXT_MENU_IDS_SET = new Set<string>(Object.values(DIRECTORY_CONTEXT_MENU_IDS));

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
		const linkUrl = info.linkUrl?.trim();
		const title = pageTitle || 'Shared page';
		const url = linkUrl || pageUrl || '';
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
			id: SOCIAL_CONTEXT_MENU_IDS.SHARE_LINK,
			title: SOCIAL_CONTEXT_MENU_TITLE,
			contexts: ['link'],
		});
		chrome.contextMenus.create({
			id: SOCIAL_CONTEXT_MENU_IDS.SHARE_IMAGE,
			title: SOCIAL_CONTEXT_MENU_TITLE,
			contexts: ['image'],
		});
		chrome.contextMenus.create({
			id: DIRECTORY_CONTEXT_MENU_IDS.FILL_PAGE,
			title: DIRECTORY_CONTEXT_MENU_TITLE,
			contexts: ['page'],
		});
		chrome.contextMenus.create({
			id: DIRECTORY_CONTEXT_MENU_IDS.FILL_LINK,
			title: DIRECTORY_CONTEXT_MENU_TITLE,
			contexts: ['link'],
		});
	});
}

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

async function completeSocialContextMenuClick(
	info: chrome.contextMenus.OnClickData,
	tab?: chrome.tabs.Tab
): Promise<void> {
	const draft = buildSocialComposerDraftFromContextMenu(info, tab);
	if (draft) {
		await writeSocialComposerDraft(draft);
	}
	await focusSidePanelTab('social');
}

async function completeDirectoryContextMenuClick(): Promise<void> {
	await focusSidePanelTab('directory');
}

export function registerSocialContextMenuListeners(): void {
	chrome.contextMenus.onClicked.addListener((info, tab) => {
		const menuId = typeof info.menuItemId === 'string' ? info.menuItemId : '';
		const isDirectory = DIRECTORY_CONTEXT_MENU_IDS_SET.has(menuId);
		const isSocial = SOCIAL_CONTEXT_MENU_IDS_SET.has(menuId);
		if (!isDirectory && !isSocial) return;

		// Chrome only opens the side panel when `open()` runs in this synchronous callback.
		openSidePanelInUserGesture(tab);

		if (isDirectory) {
			void completeDirectoryContextMenuClick();
			return;
		}
		void completeSocialContextMenuClick(info, tab);
	});
}
