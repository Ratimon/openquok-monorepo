import type { IconName } from '$data/icons';

export type AccountGettingStartedChecklistItem = {
	id: string;
	label: string;
	done: boolean;
	actionLabel?: string;
	onAction?: () => void;
	disabled?: boolean;
	href?: string;
	/** Show the action button even when `done` is true (e.g. revisit settings). */
	showActionWhenDone?: boolean;
};

export type AccountGettingStartedAutomationLink = {
	label: string;
	description?: string;
	iconName: IconName;
	href?: string;
	onClick?: () => void;
	external?: boolean;
};
