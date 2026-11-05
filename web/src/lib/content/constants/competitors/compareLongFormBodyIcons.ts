import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

/** Narrative compare sections that render icon + paragraph rows. */
export type CompareLongFormNarrativeSectionId =
	| 'why-people-look'
	| 'your-options'
	| 'when-they-win'
	| 'other-alternatives';

const WHY_PEOPLE_LOOK_BODY_ICONS: readonly IconName[] = [
	icons.Target.name,
	icons.Sparkles.name,
	icons.ListOrdered.name
];

const YOUR_OPTIONS_BODY_ICONS: readonly IconName[] = [
	icons.Columns2.name,
	icons.DollarSign.name,
	icons.ShieldCheck.name
];

const WHEN_THEY_WIN_BODY_ICONS: readonly IconName[] = [
	icons.Users.name,
	icons.LayoutTemplate.name,
	icons.HourGlass.name
];

const OTHER_ALTERNATIVES_BODY_ICONS: readonly IconName[] = [icons.Grid3x3.name, icons.Table.name];

const COMPARE_LONG_FORM_BODY_ICONS: Record<
	CompareLongFormNarrativeSectionId,
	readonly IconName[]
> = {
	'why-people-look': WHY_PEOPLE_LOOK_BODY_ICONS,
	'your-options': YOUR_OPTIONS_BODY_ICONS,
	'when-they-win': WHEN_THEY_WIN_BODY_ICONS,
	'other-alternatives': OTHER_ALTERNATIVES_BODY_ICONS
};

export function isCompareLongFormNarrativeSectionId(
	sectionId: string
): sectionId is CompareLongFormNarrativeSectionId {
	return sectionId in COMPARE_LONG_FORM_BODY_ICONS;
}

/** Icon per paragraph index; falls back to the last icon in the set when copy adds extra rows. */
export function resolveCompareLongFormBodyIcon(sectionId: string, paragraphIndex: number): IconName {
	const iconsForSection = isCompareLongFormNarrativeSectionId(sectionId)
		? COMPARE_LONG_FORM_BODY_ICONS[sectionId]
		: null;
	if (!iconsForSection?.length) {
		return icons.CircleCheck.name;
	}
	const clampedIndex = Math.min(Math.max(paragraphIndex, 0), iconsForSection.length - 1);
	return iconsForSection[clampedIndex] ?? icons.CircleCheck.name;
}
