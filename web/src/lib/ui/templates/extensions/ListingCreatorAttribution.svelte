<script lang="ts">
	import { getRootPathPublicCreator } from '$lib/area-public/constants/getRootPathPublicCreators';
	import { listingOwnerDisplayName } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { url } from '$lib/utils/path';

	type Owner = {
		username: string | null;
		fullName: string | null;
	} | null;

	type Props = {
		owner: Owner;
	};

	let { owner }: Props = $props();

	const displayName = $derived(listingOwnerDisplayName(owner));
	const creatorHref = $derived(
		owner?.username?.trim()
			? url(`/${getRootPathPublicCreator(owner.username.trim())}`)
			: null
	);
</script>

{#if displayName}
	{#if creatorHref}
		<a href={creatorHref} class="link link-hover">By {displayName}</a>
	{:else}
		<span>By {displayName}</span>
	{/if}
{/if}
