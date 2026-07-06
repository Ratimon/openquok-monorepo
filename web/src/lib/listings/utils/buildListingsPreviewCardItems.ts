import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type {
	ExtensionCardViewModel,
	StackCardViewModel
} from '$lib/listings/GetListing.presenter.svelte';
import type { FeatureSimpleCardItem } from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';

function listingDescription(excerpt: string | null, description: string | null): string {
	const text = excerpt?.trim() || description?.trim() || '';
	return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}

function buildingBlockIcon(extensionType: string | null, isOfficial: boolean): IconName {
	if (isOfficial) return icons.OpenQuok.name;
	if (extensionType === 'mcp') return icons.Bot.name;
	if (extensionType === 'both') return icons.FileText.name;
	return icons.Terminal.name;
}

export function playbookToPreviewCardItem(playbook: StackCardViewModel): FeatureSimpleCardItem {
	return {
		id: playbook.id,
		title: playbook.title,
		description: listingDescription(playbook.excerpt, playbook.description),
		icon: playbook.isOfficial ? icons.OpenQuok.name : icons.LayoutTemplate.name
	};
}

export function buildingBlockToPreviewCardItem(
	buildingBlock: ExtensionCardViewModel
): FeatureSimpleCardItem {
	return {
		id: buildingBlock.id,
		title: buildingBlock.title,
		description: listingDescription(buildingBlock.excerpt, buildingBlock.description),
		icon: buildingBlockIcon(buildingBlock.extensionType, buildingBlock.isOfficial)
	};
}

export function buildSeeAllPreviewCardItem(params: {
	id: string;
	href: string;
	description: string;
}): FeatureSimpleCardItem & { href: string } {
	return {
		id: params.id,
		title: 'See All',
		description: params.description,
		icon: icons.Grid3x3.name,
		href: params.href
	};
}
