<script lang="ts">
	import type { StackCardViewModel } from '$lib/listings/index';

	import { getRootPathPublicPlaybook } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { url } from '$lib/utils/path';
	import { cn } from '$lib/ui/helpers/common';

	import ExtensionBookmarkButton from '$lib/ui/components/extensions/ExtensionBookmarkButton.svelte';

	type ToggleResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

	type Props = {
		stackVm: StackCardViewModel;
		class?: string;
		showBookmark?: boolean;
		isBookmarked?: boolean;
		isLoggedIn?: boolean;
		bookmarksPaidEnabled?: boolean | null;
		upgradeHref?: string;
		onToggleBookmark?: (listingId: string, nextBookmarked: boolean) => Promise<ToggleResult>;
	};

	let {
		stackVm,
		class: className = '',
		showBookmark = false,
		isBookmarked = false,
		isLoggedIn = false,
		bookmarksPaidEnabled = null,
		upgradeHref,
		onToggleBookmark
	}: Props = $props();

	const detailHref = $derived(url(`/${getRootPathPublicPlaybook(stackVm.slug)}`));
	const hasBookmark = $derived(showBookmark && !!onToggleBookmark);
</script>

<div class={cn('relative', className)}>
	{#if hasBookmark}
		<div class="absolute top-3 right-3 z-10">
			<ExtensionBookmarkButton
				listingId={stackVm.id}
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
		<h2 class="text-lg font-semibold text-base-content">{stackVm.title}</h2>
		{#if stackVm.excerpt}
			<p class="mt-2 line-clamp-3 text-sm text-base-content/70">{stackVm.excerpt}</p>
		{/if}
		<p class="mt-4 text-xs text-base-content/50">
			{stackVm.memberCount} members · {stackVm.likes} likes
		</p>
	</a>
</div>
