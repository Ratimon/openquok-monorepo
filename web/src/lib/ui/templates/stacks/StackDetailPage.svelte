<script lang="ts">
	import type { StackDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';

	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import { markdownToHtml } from '$lib/listings/index';
	import { url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import ListingComments from '$lib/ui/components/extensions/ListingComments.svelte';
	import ListingRating from '$lib/ui/components/extensions/ListingRating.svelte';

	type MutationResult = { ok: true } | { ok: false; error: string };

	type Props = {
		stack: StackDetailViewModel;
		isLoggedIn?: boolean;
		comments: import('$lib/listings/GetListing.presenter.svelte').ListingCommentViewModel[];
		communityCommentsEnabled?: boolean;
		onClone?: () => void | Promise<void>;
		cloning?: boolean;
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
	};

	let {
		stack,
		isLoggedIn = false,
		comments,
		communityCommentsEnabled = true,
		onClone,
		cloning = false,
		submitListingComment,
		submitListingRating,
		submittingComment = false,
		submittingRating = false,
		onUpgradeRequired,
		onSignInRequired
	}: Props = $props();

	const descriptionHtml = $derived(stack.content ? markdownToHtml(stack.content) : '');
</script>

<SectionOuterContainer class="py-10 md:py-14">
	<article class="container mx-auto max-w-4xl px-4">
		<header class="space-y-4 border-b border-base-content/10 pb-8">
			<p class="text-xs font-bold tracking-wider text-primary uppercase">Extension stack</p>
			<h1 class="text-3xl font-black tracking-tight text-base-content">{stack.title}</h1>
			{#if stack.excerpt}
				<p class="text-lg text-base-content/70">{stack.excerpt}</p>
			{/if}
			<div class="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
				<span>{stack.stackMembers.length} members</span>
				<span>{stack.views} views</span>
				<span>{stack.likes} likes</span>
			</div>
			<ListingRating
				listingId={stack.id}
				averageRating={stack.averageRating}
				ratingsCount={stack.ratingsCount}
				{isLoggedIn}
				communityEnabled={communityCommentsEnabled}
				submitRating={submitListingRating}
				submitting={submittingRating}
				{onSignInRequired}
				{onUpgradeRequired}
			/>
			{#if onClone}
				<Button variant="primary" onclick={() => void onClone?.()} disabled={cloning}>
					{cloning ? 'Cloning…' : 'Clone stack'}
				</Button>
			{/if}
		</header>

		{#if descriptionHtml}
			<section class="prose prose-neutral max-w-none py-8">
				{@html descriptionHtml}
			</section>
		{/if}

		<section class="border-t border-base-content/10 py-8">
			<h2 class="mb-4 text-xl font-bold">Stack members</h2>
			{#if stack.stackMembers.length === 0}
				<p class="text-base-content/70">This stack has no members yet.</p>
			{:else}
				<ul class="space-y-3">
					{#each stack.stackMembers as member (member.id)}
						<li class="rounded-xl border border-base-content/10 p-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<span class="badge badge-outline badge-sm mb-2 uppercase">{member.memberRole}</span>
									{#if member.member}
										<h3 class="font-semibold text-base-content">
											<a
												class="link link-hover"
												href={url(getRootPathPublicExtension(member.member.slug))}
											>
												{member.member.title}
											</a>
										</h3>
										{#if member.member.excerpt}
											<p class="mt-1 text-sm text-base-content/70">{member.member.excerpt}</p>
										{/if}
									{:else}
										<p class="text-sm text-base-content/60">Member unavailable</p>
									{/if}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="border-t border-base-content/10 py-10">
			<ListingComments
				{comments}
				listingId={stack.id}
				{isLoggedIn}
				{submitListingComment}
				{submittingComment}
				communityCommentsEnabled={communityCommentsEnabled}
				{onUpgradeRequired}
			/>
		</section>
	</article>
</SectionOuterContainer>
