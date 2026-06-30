<script lang="ts">
	import type { ExtensionCardViewModel, ExtensionDetailViewModel } from '$lib/listings/index';
	import type { ListingCommentViewModel } from '$lib/listings/GetListing.presenter.svelte';

	import { publicExtensionBySlugPagePresenter } from '$lib/area-public/index';

	import { toast } from '$lib/ui/sonner';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';

	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';
	import SkillExtensionDetail from '$lib/ui/templates/extensions/SkillExtensionDetail.svelte';
	import McpExtensionDetail from '$lib/ui/templates/extensions/McpExtensionDetail.svelte';
	import BothExtensionDetail from '$lib/ui/templates/extensions/BothExtensionDetail.svelte';
	import ListingComments from '$lib/ui/components/extensions/ListingComments.svelte';
	import ListingRating from '$lib/ui/components/extensions/ListingRating.svelte';
	import ExtensionBookmarkButton from '$lib/ui/components/extensions/ExtensionBookmarkButton.svelte';

	type MutationResult = { ok: true } | { ok: false; error: string };
	type BookmarkToggleResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

	type Props = {
		extension: ExtensionDetailViewModel;
		relatedExtensions: ExtensionCardViewModel[];
		commentsVm: ListingCommentViewModel[];
		isLoggedIn?: boolean;
		communityCommentsEnabled?: boolean;
		submitListingComment: (params: {
			listingId: string;
			content: string;
			parentId: string | null;
		}) => Promise<MutationResult>;
		submitListingRating: (listingId: string, rating: number) => Promise<MutationResult>;
		submittingComment?: boolean;
		submittingRating?: boolean;
		onUpgradeRequired?: () => void;
		onSignInRequired?: () => void;
		bookmarksPaidEnabled?: boolean | null;
		upgradeHref?: string;
		isBookmarked?: boolean;
		onToggleBookmark?: (listingId: string, nextBookmarked: boolean) => Promise<BookmarkToggleResult>;
	};

	let {
		extension,
		relatedExtensions,
		commentsVm,
		isLoggedIn = false,
		communityCommentsEnabled = true,
		submitListingComment,
		submitListingRating,
		submittingComment = false,
		submittingRating = false,
		onUpgradeRequired,
		onSignInRequired,
		bookmarksPaidEnabled = null,
		upgradeHref,
		isBookmarked = false,
		onToggleBookmark
	}: Props = $props();

	const pagePresenter = publicExtensionBySlugPagePresenter;

	let extraLikes = $state(0);
	let displayLikes = $derived(extension.likes + extraLikes);
	let expandedRelatedId = $state<string | null>(null);

	async function handleLike() {
		const result = await pagePresenter.trackExtensionLike(extension.id);
		if (result.ok) {
			extraLikes += 1;
			toast.success('Thanks for the like!');
			return;
		}
		toast.error(result.error);
	}

	function handleExternalClick() {
		void pagePresenter.trackExtensionClick(extension.id);
	}

	function toggleRelatedExpanded(id: string) {
		expandedRelatedId = expandedRelatedId === id ? null : id;
	}
</script>

<SectionOuterContainer class="py-10 md:py-14">
	<article class="container mx-auto max-w-4xl px-4">
		{#if onToggleBookmark}
			<div class="mb-4 flex justify-end">
				<ExtensionBookmarkButton
					listingId={extension.id}
					{isBookmarked}
					{isLoggedIn}
					{bookmarksPaidEnabled}
					{upgradeHref}
					onToggle={onToggleBookmark}
				/>
			</div>
		{/if}
		{#if extension.extensionType === 'mcp'}
			<McpExtensionDetail
				{extension}
				{displayLikes}
				onLike={handleLike}
				onExternalClick={handleExternalClick}
				likeDisabled={pagePresenter.submittingLike}
			/>
		{:else if extension.extensionType === 'both'}
			<BothExtensionDetail
				{extension}
				{displayLikes}
				onLike={handleLike}
				onExternalClick={handleExternalClick}
				likeDisabled={pagePresenter.submittingLike}
			/>
		{:else}
			<SkillExtensionDetail
				{extension}
				{displayLikes}
				onLike={handleLike}
				onExternalClick={handleExternalClick}
				likeDisabled={pagePresenter.submittingLike}
			/>
		{/if}

		{#if relatedExtensions.length > 0}
			<section class="border-t border-base-content/10 py-10">
				<h2 class="mb-4 text-xl font-bold">Related extensions</h2>
				<ul class="space-y-4">
					{#each relatedExtensions as relatedVm (relatedVm.id)}
						<li>
							<ExtensionCard
								extensionVm={relatedVm}
								expanded={expandedRelatedId === relatedVm.id}
								onToggle={toggleRelatedExpanded}
								showBookmark={Boolean(onToggleBookmark)}
								isBookmarked={false}
								{isLoggedIn}
								{bookmarksPaidEnabled}
								{upgradeHref}
								onToggleBookmark={onToggleBookmark}
							/>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="border-t border-base-content/10 py-10">
			<ListingRating
				listingId={extension.id}
				averageRating={extension.averageRating}
				ratingsCount={extension.ratingsCount}
				{isLoggedIn}
				communityEnabled={communityCommentsEnabled}
				submitRating={submitListingRating}
				submitting={submittingRating}
				{onSignInRequired}
				{onUpgradeRequired}
			/>
		</section>

		<section class="border-t border-base-content/10 py-10">
			<ListingComments
				comments={commentsVm}
				listingId={extension.id}
				{isLoggedIn}
				{submitListingComment}
				{submittingComment}
				{communityCommentsEnabled}
				{onUpgradeRequired}
			/>
		</section>
	</article>
</SectionOuterContainer>
