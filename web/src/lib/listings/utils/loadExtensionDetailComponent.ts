import type { Component } from 'svelte';

import type { ExtensionDetailViewModel } from '$lib/listings/index';

export type ExtensionBookmarkToggleResult =
	| { ok: true; bookmarked: boolean }
	| { ok: false; error: string };

export type ExtensionRatingMutationResult = { ok: true } | { ok: false; error: string };

export type ExtensionDetailComponentProps = {
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
	) => Promise<ExtensionBookmarkToggleResult>;
	communityEnabled?: boolean;
	submitRating?: (listingId: string, rating: number) => Promise<ExtensionRatingMutationResult>;
	submittingRating?: boolean;
	onRatingSignInRequired?: () => void;
	onRatingUpgradeRequired?: () => void;
};

export type ExtensionDetailComponent = Component<ExtensionDetailComponentProps>;

export function loadExtensionDetailComponent(
	extensionType: ExtensionDetailViewModel['extensionType']
): Promise<{ default: ExtensionDetailComponent }> {
	if (extensionType === 'mcp') {
		return import('$lib/ui/templates/extensions/McpExtensionDetail.svelte');
	}
	if (extensionType === 'both') {
		return import('$lib/ui/templates/extensions/BothExtensionDetail.svelte');
	}
	return import('$lib/ui/templates/extensions/SkillExtensionDetail.svelte');
}
