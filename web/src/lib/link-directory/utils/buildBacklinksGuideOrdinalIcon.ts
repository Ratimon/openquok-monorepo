import { icons, type IconName } from '$data/icons';

const ORDINAL_STEP_ICONS: readonly IconName[] = [
	icons.Dice1.name,
	icons.Dice2.name,
	icons.Dice3.name,
	icons.Dice4.name,
	icons.Dice5.name,
	icons.Dice6.name
];

/** Lucide-style dice icons for 1–6; falls back to link for higher ordinals. */
export function buildBacklinksGuideOrdinalIcon(order: number): IconName {
	const index = Math.trunc(order) - 1;
	if (index >= 0 && index < ORDINAL_STEP_ICONS.length) {
		return ORDINAL_STEP_ICONS[index];
	}
	return icons.Link.name;
}
