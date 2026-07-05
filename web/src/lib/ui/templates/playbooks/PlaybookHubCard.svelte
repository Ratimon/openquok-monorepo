<script lang="ts">
	import type { StackCardViewModel } from '$lib/listings/index';

	import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { resolvePublicPlaybookPath } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { url } from '$lib/utils/path';
	import { cn } from '$lib/ui/helpers/common';

	import BuildingBlockBookmarkButton from '$lib/ui/components/building-blocks/BuildingBlockBookmarkButton.svelte';

	type ToggleResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

	type Props = {
		playbookVm: StackCardViewModel;
		class?: string;
		/** Show `By @{username}` below the title (e.g. global playbooks hub). */
		showOwnerSubtitle?: boolean;
		ownerUsernameFallback?: string | null;
		showBookmark?: boolean;
		isBookmarked?: boolean;
		isLoggedIn?: boolean;
		bookmarksPaidEnabled?: boolean | null;
		upgradeHref?: string;
		onToggleBookmark?: (listingId: string, nextBookmarked: boolean) => Promise<ToggleResult>;
	};

	let {
		playbookVm,
		class: className = '',
		showOwnerSubtitle = true,
		ownerUsernameFallback = null,
		showBookmark = false,
		isBookmarked = false,
		isLoggedIn = false,
		bookmarksPaidEnabled = null,
		upgradeHref,
		onToggleBookmark
	}: Props = $props();

	const detailHref = $derived.by(() => {
		const path = resolvePublicPlaybookPath(
			playbookVm.ownerUsername ? { username: playbookVm.ownerUsername } : null,
			playbookVm.slug
		);
		return path ? url(`/${path}`) : url(`/${getRootPathPublicPlaybooks()}`);
	});
	const hasBookmark = $derived(showBookmark && !!onToggleBookmark);
	const ownerUsername = $derived(
		playbookVm.ownerUsername?.trim() || ownerUsernameFallback?.trim() || null
	);
</script>

<div class={cn('relative', className)}>
	{#if hasBookmark}
		<div class="absolute top-3 right-3 z-10">
			<BuildingBlockBookmarkButton
				listingId={playbookVm.id}
				listingKind="stack"
				{isBookmarked}
				{isLoggedIn}
				{bookmarksPaidEnabled}
				{upgradeHref}
				onToggle={onToggleBookmark!}
			/>
		</div>
	{/if}

	<a
		class={cn(
			'block h-full rounded-2xl border border-base-content/10 p-5 transition hover:border-primary/40 hover:shadow-md',
			hasBookmark && 'pr-14'
		)}
		href={detailHref}
	>
		<h2 class="text-lg font-semibold text-base-content">{playbookVm.title}</h2>
		{#if showOwnerSubtitle && ownerUsername}
			<p class="mt-1 text-sm text-base-content/60">By @{ownerUsername}</p>
		{/if}
		{#if playbookVm.excerpt}
			<p class="mt-2 line-clamp-3 text-sm text-base-content/70">{playbookVm.excerpt}</p>
		{/if}
		<p class="mt-4 text-xs text-base-content/50">
			{playbookVm.memberCount} building block{playbookVm.memberCount === 1 ? '' : 's'} · {playbookVm.likes} likes
		</p>
	</a>
</div>
