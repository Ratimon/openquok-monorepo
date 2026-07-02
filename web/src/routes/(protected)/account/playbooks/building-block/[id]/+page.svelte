<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import {
		getRootPathAccount,
		getAccountPlaybooksHubPath,
		userListingExtensionEditorPagePresenter
	} from '$lib/area-protected';
	import { createSortedCategoryChoices } from '$lib/listings';
	import { route, url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import EditorListing from '$lib/ui/components/listing-manager/EditorListing.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let listingId = $derived(data.listingId);

	const extensionsListHref = url(`${route(getRootPathAccount())}/${getAccountPlaybooksHubPath()}`);

	let initialized = $state(false);
	let listingFound = $state(true);

	const categoryChoices = $derived(
		createSortedCategoryChoices(userListingExtensionEditorPagePresenter.categoryChoices)
	);
	const tagChoices = $derived(
		userListingExtensionEditorPagePresenter.tagChoices.map((tag) => ({
			value: tag.id,
			label: tag.name,
			slug: tag.slug
		}))
	);
	const formDefaults = $derived(userListingExtensionEditorPagePresenter.getFormDefaults());

	onMount(async () => {
		const result = await userListingExtensionEditorPagePresenter.init(listingId, 'extension');
		listingFound = result.listingFound;
		initialized = true;
	});

	$effect(() => {
		if (userListingExtensionEditorPagePresenter.showToastMessage) {
			const msg = userListingExtensionEditorPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			userListingExtensionEditorPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (userListingExtensionEditorPagePresenter.redirectToList) {
			userListingExtensionEditorPagePresenter.redirectToList = false;
			goto(extensionsListHref, { replaceState: true });
		}
	});

	async function handleSave(
		formData: Parameters<typeof userListingExtensionEditorPagePresenter.submit>[0]
	) {
		await userListingExtensionEditorPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(extensionsListHref, { replaceState: true });
	}
</script>

<div class="p-4 md:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">Edit building block</h1>
		<p class="text-sm text-base-content/70">Update your extension draft or submission.</p>
	</div>

	{#if !initialized}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if !listingFound}
		<p class="text-sm text-base-content/70">Building block not found or you do not have access.</p>
	{:else}
		{#key listingId}
			<EditorListing
				initialValues={formDefaults}
				{categoryChoices}
				{tagChoices}
				listingKind="extension"
				isPlatformAdmin={false}
				isSubmitting={userListingExtensionEditorPagePresenter.submitting}
				listingId={listingId}
				noListingFound={!listingFound}
				onSave={handleSave}
				onDiscard={handleDiscard}
			/>
		{/key}
	{/if}
</div>
