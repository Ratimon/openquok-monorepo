<script lang="ts">
	import type { ExtensionCardViewModel } from '$lib/listings/index';

	import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { url } from '$lib/utils/path';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ExtensionCard from '$lib/ui/templates/extensions/ExtensionCard.svelte';
	import ExtensionBookmarkButton from '$lib/ui/components/extensions/ExtensionBookmarkButton.svelte';

	type ToggleResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

	type Props = {
		extensionsVm: ExtensionCardViewModel[];
		loading?: boolean;
		isLoggedIn?: boolean;
		bookmarksPaidEnabled?: boolean | null;
		upgradeHref?: string;
		togglingBookmarkId?: string | null;
		isBookmarked?: (listingId: string) => boolean;
		onToggleBookmark: (listingId: string, nextBookmarked: boolean) => Promise<ToggleResult>;
	};

	let {
		extensionsVm,
		loading = false,
		isLoggedIn = true,
		bookmarksPaidEnabled = true,
		upgradeHref,
		togglingBookmarkId = null,
		isBookmarked = () => true,
		onToggleBookmark
	}: Props = $props();

	const extensionsHubHref = url(`/${getRootPathPublicBuildingBlocks()}`);
	let expandedId = $state<string | null>(null);

	function toggleExpanded(id: string) {
		expandedId = expandedId === id ? null : id;
	}
</script>

{#if loading}
	<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
		Loading bookmarks…
	</p>
{:else if extensionsVm.length === 0}
	<div class="rounded-2xl border border-dashed border-base-content/15 p-10 text-center">
		<AbstractIcon
			name={icons.Bookmark.name}
			class="mx-auto mb-4 size-10 text-base-content/40"
			width="40"
			height="40"
			aria-hidden="true"
		/>
		<h2 class="text-lg font-semibold text-base-content">No building blocks bookmarked yet</h2>
		<p class="mt-2 text-sm text-base-content/70">
			Save building blocks from the public hub to build your personal shortlist.
		</p>
		<div class="mt-6">
			<Button href={extensionsHubHref} variant="primary">
				Browse building blocks
			</Button>
		</div>
	</div>
{:else}
	<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		{#each extensionsVm as extensionVm (extensionVm.id)}
			<li class="relative">
				<div class="absolute top-3 right-3 z-10">
					<ExtensionBookmarkButton
						listingId={extensionVm.id}
						isBookmarked={isBookmarked(extensionVm.id)}
						{isLoggedIn}
						{bookmarksPaidEnabled}
						{upgradeHref}
						disabled={togglingBookmarkId === extensionVm.id}
						onToggle={onToggleBookmark}
					/>
				</div>
				<ExtensionCard
					extensionVm={extensionVm}
					expanded={expandedId === extensionVm.id}
					onToggle={toggleExpanded}
				/>
			</li>
		{/each}
	</ul>
{/if}
