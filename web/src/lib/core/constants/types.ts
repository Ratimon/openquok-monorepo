import type { IconName } from '$data/icon';

export interface LocalImage {
	file: File | undefined;
	preview: string | undefined;
	isDefault: boolean;
	isNew: boolean;
	uploadedFilename: string | undefined;
}

export interface SidebarElement {
	label: string;
	href?: string;
	isScrollLink: boolean;
	iconName?: IconName;
	trailingIconName?: IconName;
	sublinks?: SidebarElement[];
	onclick?: () => void;
}

