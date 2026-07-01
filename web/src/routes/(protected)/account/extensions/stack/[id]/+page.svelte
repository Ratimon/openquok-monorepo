<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import {
		getRootPathAccount,
		getAccountExtensionsHubPath,
		userListingStackEditorPagePresenter
	} from '$lib/area-protected';
	import { createSortedCategoryChoices } from '$lib/listings';
	import { route, url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import EditorListing from '$lib/ui/components/listing-manager/EditorListing.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let listingId = $derived(data.listingId);

	const extensionsHubHref = url(`${route(getRootPathAccount())}/${getAccountExtensionsHubPath()}`);

	let initialized = $state(false);
	let listingFound = $state(true);

	const categoryChoices = $derived(
		createSortedCategoryChoices(userListingStackEditorPagePresenter.categoryChoices)
	);
	const tagChoices = $derived(
		userListingStackEditorPagePresenter.tagChoices.map((tag) => ({
			value: tag.id,
			label: tag.name,
			slug: tag.slug
		}))
	);
	const formDefaults = $derived(userListingStackEditorPagePresenter.getFormDefaults());
	const stackExtensionChoices = $derived(userListingStackEditorPagePresenter.extensionChoices);

	onMount(async () => {
		const result = await userListingStackEditorPagePresenter.init(listingId, 'stack');
		listingFound = result.listingFound;
		initialized = true;
	});

	$effect(() => {
		if (userListingStackEditorPagePresenter.showToastMessage) {
			const msg = userListingStackEditorPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			userListingStackEditorPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (userListingStackEditorPagePresenter.redirectToList) {
			userListingStackEditorPagePresenter.redirectToList = false;
			goto(extensionsHubHref, { replaceState: true });
		}
	});

	async function handleSave(formData: Parameters<typeof userListingStackEditorPagePresenter.submit>[0]) {
		await userListingStackEditorPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(extensionsHubHref, { replaceState: true });
	}
</script>

<div class="p-4 md:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">Edit stack</h1>
		<p class="text-sm text-base-content/70">Update your stack draft or submission.</p>
	</div>

	{#if !initialized}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else if !listingFound}
		<p class="text-sm text-base-content/70">Stack not found or you do not have access.</p>
	{:else}
		{#key listingId}
			<EditorListing
				initialValues={formDefaults}
				{categoryChoices}
				{tagChoices}
				{stackExtensionChoices}
				listingKind="stack"
				isPlatformAdmin={false}
				isSubmitting={userListingStackEditorPagePresenter.submitting}
				listingId={listingId}
				noListingFound={!listingFound}
				onSave={handleSave}
				onDiscard={handleDiscard}
			/>
		{/key}
	{/if}
</div>
