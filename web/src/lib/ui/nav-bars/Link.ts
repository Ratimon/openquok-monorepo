import type { NavOptions } from '$lib/config/constants/config';

export type { NavOptions };

export interface DropdownLink {
	href: string;
	title: string;
}

export interface Link {
	pathname: string;
	title: string;
	navType: NavOptions;
	dropdownItems?: DropdownLink[];
	preload?: 'hover' | 'tap' | 'off' | 'intent';
}
