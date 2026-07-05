import type { Component } from 'svelte';

import type { ExtensionDetailViewModel } from '$lib/listings/index';

export type BuildingBlockBookmarkToggleResult =
	| { ok: true; bookmarked: boolean }
	| { ok: false; error: string };

export type BuildingBlockRatingMutationResult = { ok: true } | { ok: false; error: string };

export type BuildingBlockDetailComponentProps = {
	/** Listing VM; prop name kept until listings VM rename. */
	extensionVm: ExtensionDetailViewModel;
	displayLikes: number;
	onLike: () => void | Promise<void>;
	onExternalClick?: () => void | Promise<void>;
	likeDisabled?: boolean;
	isBookmarked?: boolean;
	isLoggedIn?: boolean;
	bookmarksPaidEnabled?: boolean | null;
	upgradeHref?: string;
	onToggleBookmark?: (
		listingId: string,
		nextBookmarked: boolean
	) => Promise<BuildingBlockBookmarkToggleResult>;
	communityEnabled?: boolean;
	submitRating?: (listingId: string, rating: number) => Promise<BuildingBlockRatingMutationResult>;
	submittingRating?: boolean;
	onRatingSignInRequired?: () => void;
	onRatingUpgradeRequired?: () => void;
};

export type BuildingBlockDetailComponent = Component<BuildingBlockDetailComponentProps>;

export function loadBuildingBlockDetailComponent(
	extensionType: ExtensionDetailViewModel['extensionType']
): Promise<{ default: BuildingBlockDetailComponent }> {
	if (extensionType === 'mcp') {
		return import('$lib/ui/templates/building-blocks/McpBuildingBlockDetail.svelte');
	}
	if (extensionType === 'both') {
		return import('$lib/ui/templates/building-blocks/BothBuildingBlockDetail.svelte');
	}
	return import('$lib/ui/templates/building-blocks/SkillBuildingBlockDetail.svelte');
}

/** @deprecated Use loadBuildingBlockDetailComponent */
export type ExtensionBookmarkToggleResult = BuildingBlockBookmarkToggleResult;

/** @deprecated Use loadBuildingBlockDetailComponent */
export type ExtensionRatingMutationResult = BuildingBlockRatingMutationResult;

/** @deprecated Use BuildingBlockDetailComponentProps */
export type ExtensionDetailComponentProps = BuildingBlockDetailComponentProps;

/** @deprecated Use BuildingBlockDetailComponent */
export type ExtensionDetailComponent = BuildingBlockDetailComponent;

/** @deprecated Use loadBuildingBlockDetailComponent */
export const loadExtensionDetailComponent = loadBuildingBlockDetailComponent;
