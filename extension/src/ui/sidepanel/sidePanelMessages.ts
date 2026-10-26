/** Messages sent to the extension side panel (e.g. from context menu or background). */
export const SIDE_PANEL_UI_MESSAGE = {
	FOCUS_TAB: 'OPENQUOK_SIDE_PANEL_FOCUS_TAB',
} as const;

export type SidePanelFocusTab = 'social' | 'directory';

export type SidePanelUiMessage = {
	type: typeof SIDE_PANEL_UI_MESSAGE.FOCUS_TAB;
	tab: SidePanelFocusTab;
};

export const SIDE_PANEL_PENDING_TAB_KEY = 'openquok:sidepanel-pending-tab';
