<script lang="ts">
	import type { PageData } from './$types';
	import type { ListingTableItem } from '$lib/ui/components/listing-manager/ListingExtensionsTable.svelte';

	import { onMount } from 'svelte';

	import {
		getRootPathAccount,
		getRootPathStacks,
		getRootPathNewStack,
		getAccountStackEditorPath,
		userListingStacksManagerPagePresenter
	} from '$lib/area-protected';
	import { deleteMyListingVerificationPresenter } from '$lib/listings';
	import { route, url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import ListingStacksTable from '$lib/ui/components/listing-manager/ListingStacksTable.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	// /account/stacks/new
	const rootPathAccount = getRootPathAccount();
	const rootPathStacks = getRootPathStacks();
	const rootPathNewStack = getRootPathNewStack();
	const newStackHref = url(`${route(rootPathAccount)}/${rootPathStacks}/${rootPathNewStack}`);

	const isLoading = $derived(userListingStacksManagerPagePresenter.loading);
	const listings = $derived(userListingStacksManagerPagePresenter.allListingsToManageVm);
	const hasListings = $derived(listings.length > 0);

	onMount(async () => {
		await userListingStacksManagerPagePresenter.loadAllListings('stack');
	});

	const getEditHref = (listing: ListingTableItem) =>
		url(`${route(rootPathAccount)}/${getAccountStackEditorPath(listing.id)}`);

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

	async function handleListingDeleted(listing: ListingTableItem) {
		userListingStacksManagerPagePresenter.removeListing(listing.id);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">My stacks</h1>
			<p class="text-sm text-base-content/70">
				Drafts and stacks you submit for catalog review. Platform admins approve public listings.
			</p>
		</div>
		<Button variant="primary" size="sm" href={newStackHref}>New stack</Button>
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
				<h3 class="text-2xl font-bold tracking-tight text-base-content">No stacks yet</h3>
				<p class="max-w-md text-sm text-base-content/70">
					Use Agent Builder to compose a skill, then save it here as a stack draft.
				</p>
				<Button variant="primary" size="sm" href={newStackHref} class="mt-2">Create stack</Button>
			</div>
		</div>
	{:else}
		<div class="mt-6">
			<ListingStacksTable
				listings={tableListings}
				{getEditHref}
				onListingDeleted={handleListingDeleted}
				deleteVerificationPresenter={deleteMyListingVerificationPresenter}
			/>
		</div>
	{/if}
</div>
