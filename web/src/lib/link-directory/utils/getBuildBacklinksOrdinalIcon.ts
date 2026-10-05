import { icons } from '$data/icons';
import type { IconName } from '$data/icons';

const ORDINAL_ICONS: readonly IconName[] = [
	icons.Dice1.name,
	icons.Dice2.name,
	icons.Dice3.name,
	icons.Dice4.name,
	icons.Dice5.name,
	icons.Dice6.name
];

/** Lucide dice icons (1–6) for numbered opportunities and sub-steps; cycles for higher indices. */
export function getBuildBacklinksOrdinalIcon(index: number): IconName {
	const value = Math.trunc(index);
	if (!Number.isFinite(value) || value < 1) {
		return icons.Link.name;
	}
	return ORDINAL_ICONS[(value - 1) % ORDINAL_ICONS.length];
}
