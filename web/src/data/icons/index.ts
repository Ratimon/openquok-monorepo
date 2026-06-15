// Merged icon registry for `$data/icons`.

export type IconEntry<Name extends string = string> = {
	name: Name;
	box: number;
	/** When set, `viewBox` is `0 0 box boxHeight`; otherwise square `0 0 box box`. */
	boxHeight?: number;
	/** Filled glyph (e.g. brand mark). Default is Lucide-style stroke. */
	fill?: boolean;
	svg: string;
};

export type { BrandedIconName } from './branded-icons.ts';
export type { GeneralIconName } from './general-icons.ts';

import type { BrandedIconName } from './branded-icons.ts';
import type { GeneralIconName } from './general-icons.ts';

import { brandedIcons } from './branded-icons.ts';
import { generalIcons } from './general-icons.ts';

export type IconName = BrandedIconName | GeneralIconName;

type IconRegistry = {
	[K in IconName]: IconEntry<K>;
};

export const icons = {
	...generalIcons,
	...brandedIcons
} satisfies IconRegistry;
