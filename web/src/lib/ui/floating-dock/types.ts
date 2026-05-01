import type { IconName } from '$data/icons';
import type { NotificationItemViewModel } from '$lib/notifications/GetNotification.presenter.svelte';

/** Data for the header dock bell: preview list + loader (no route navigation). */
export interface DockNotificationsPreview {
	items: NotificationItemViewModel[];
	loading: boolean;
	emptyMessage: string | null;
	onOpen: () => void | Promise<void>;
	/** Optional footer link under the list */
	footerHref?: string;
	footerLabel?: string;
}

/** Compatible with store-like subscription + get (used by dock for mouse position; no svelte-motion to avoid NaN keyframes) */
export interface DockPositionStore {
	subscribe(fn: (value: number) => void): () => void;
	get(): number;
}

/** Item shown inside a dock dropdown (sublink) */
export interface DockDropdownItem {
	label: string;
	href?: string;
	iconName?: IconName;
	onclick?: () => void;
	/** Optional extra class for the item (e.g. destructive style) */
	customStyle?: string;
}

export interface DockItem {
	title: string;
	href?: string;
	/** Optional small numeric badge (e.g. unread count); shown when greater than zero */
	badge?: number;
	iconName: IconName;
	/** If set without href, renders as button with onclick */
	onclick?: () => void;
	ariaLabel?: string;
	/** If set, renders as dropdown trigger with these items instead of link/button */
	sublinks?: DockDropdownItem[];
	/** Optional text shown above sublinks when dropdown is open (e.g. current user name) */
	dropdownHeader?: string;
	/** Header dock: bell opens a notifications panel instead of navigating */
	notificationsPopover?: boolean;
	notificationsPreview?: DockNotificationsPreview;
}
