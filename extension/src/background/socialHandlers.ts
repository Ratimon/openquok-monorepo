import {
	installSocialContextMenus,
	registerSocialContextMenuListeners,
} from '../social/contextMenu.js';

/** Context menu, session draft, and side panel routing for the Social composer. */
export function registerSocialBackgroundHandlers(): void {
	registerSocialContextMenuListeners();
}

export function installSocialExtensionSurfaces(): void {
	installSocialContextMenus();
}
