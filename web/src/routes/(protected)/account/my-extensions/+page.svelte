<script lang="ts">
	import type { PageData } from './$types';
	import type { ListingTableItem } from '$lib/ui/components/listing-manager/ListingExtensionsTable.svelte';

	import { onMount } from 'svelte';

	import {
		getRootPathAccount,
		getRootPathMyExtensions,
		getRootPathNewExtension,
		getAccountExtensionEditorPath,
		userListingExtensionsManagerPagePresenter
	} from '$lib/area-protected';
	import { deleteMyListingVerificationPresenter } from '$lib/listings';
	import { route, url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import ListingExtensionsTable from '$lib/ui/components/listing-manager/ListingExtensionsTable.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const rootPathAccount = getRootPathAccount();
	const rootPathMyExtensions = getRootPathMyExtensions();
	const rootPathNewExtension = getRootPathNewExtension();
	const newExtensionHref = url(
		`${route(rootPathAccount)}/${rootPathMyExtensions}/${rootPathNewExtension}`
	);

	const isLoading = $derived(userListingExtensionsManagerPagePresenter.loading);
	const listings = $derived(userListingExtensionsManagerPagePresenter.allListingsToManageVm);
	const hasListings = $derived(listings.length > 0);

	onMount(async () => {
		await userListingExtensionsManagerPagePresenter.loadAllListings('extension');
	});

	const getEditHref = (listing: ListingTableItem) =>
		url(`${route(rootPathAccount)}/${getAccountExtensionEditorPath(listing.id)}`);

	const tableListings: ListingTableItem[] = $derived(
		listings.map((listing) => ({
			id: listing.id,
			title: listing.title,
			description: listing.description,
			excerpt: listing.excerpt,
			createdAt: listing.createdAt,
			isUserPublished: listing.isUserPublished,
			isAdminPublished: listing.isAdminPublished,
			logoImageUrl: listing.logoImageUrl
		}))
	);

	function handleListingDeleted(listing: ListingTableItem) {
		userListingExtensionsManagerPagePresenter.removeListing(listing.id);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">My extensions</h1>
			<p class="text-sm text-base-content/70">
				Extension listings you own. You can publish when ready; admins approve catalog visibility.
			</p>
		</div>
		<Button variant="primary" size="sm" href={newExtensionHref}>New extension</Button>
	</div>

	{#if isLoading}
		<div class="mt-6">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if !hasListings}
		<div
			class="mt-6 flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
		>
			<div class="flex flex-col items-center gap-2 text-center">
				<h3 class="text-2xl font-bold tracking-tight text-base-content">No extensions yet</h3>
				<p class="max-w-md text-sm text-base-content/70">
					Submit a skills or MCP extension for the Extensions Hub.
				</p>
				<Button variant="primary" size="sm" href={newExtensionHref} class="mt-2">
					Add extension
				</Button>
			</div>
		</div>
	{:else}
		<div class="mt-6">
			<ListingExtensionsTable
				listings={tableListings}
				{getEditHref}
				onListingDeleted={handleListingDeleted}
				deleteVerificationPresenter={deleteMyListingVerificationPresenter}
			/>
		</div>
	{/if}
</div>
