<script lang="ts">
	import type { ListingTableItem } from '$lib/ui/components/listing-manager/ListingExtensionsTable.svelte';

	import { onMount } from 'svelte';

	import { adminListingExtensionsManagerPagePresenter } from '$lib/area-admin';
	import {
		getRootPathSecretAdminListingManagerNewExtension,
		getRootPathSecretAdminListingManagerExtensionEditor
	} from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import ListingExtensionsTable from '$lib/ui/components/listing-manager/ListingExtensionsTable.svelte';

	const newExtensionHref = url(getRootPathSecretAdminListingManagerNewExtension());

	const isLoading = $derived(adminListingExtensionsManagerPagePresenter.loading);
	const listings = $derived(adminListingExtensionsManagerPagePresenter.allListingsToManageVm);
	const hasListings = $derived(listings.length > 0);

	onMount(async () => {
		await adminListingExtensionsManagerPagePresenter.loadAllListings();
	});

	const getEditHref = (listing: ListingTableItem) =>
		url(getRootPathSecretAdminListingManagerExtensionEditor(listing.id));

	const tableListings: ListingTableItem[] = $derived(
		listings.map((l) => ({
			id: l.id,
			title: l.title,
			description: l.description,
			excerpt: l.excerpt,
			createdAt: l.createdAt,
			isUserPublished: l.isUserPublished,
			isAdminPublished: l.isAdminPublished,
			logoImageUrl: l.logoImageUrl
		}))
	);

	function handleListingDeleted(listing: ListingTableItem) {
		adminListingExtensionsManagerPagePresenter.removeListing(listing.id);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">Extensions</h1>
			<p class="text-sm text-base-content/70">Manage extension listings. Platform admin only.</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="primary" size="sm" href={newExtensionHref}>New extension</Button>
		</div>
	</div>

	{#if isLoading}
		<div class="mt-6">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if !hasListings}
		<div
			class="mt-6 flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
		>
			<div class="flex flex-col items-center gap-1 text-center">
				<h3 class="text-2xl font-bold tracking-tight text-base-content">You have no extensions</h3>
				<p class="text-sm text-base-content/70">Create your first extension listing to get started.</p>
				<Button variant="primary" size="sm" href={newExtensionHref} class="mt-4">Add extension</Button>
			</div>
		</div>
	{:else}
		<ListingExtensionsTable
			listings={tableListings}
			getEditHref={getEditHref}
			onListingDeleted={handleListingDeleted}
		/>
	{/if}
</div>
