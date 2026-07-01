<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import {
		getRootPathAccount,
		getRootPathMyExtensions,
		userListingNewExtensionPagePresenter
	} from '$lib/area-protected';
	import { createSortedCategoryChoices } from '$lib/listings';
	import { route, url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import EditorListing from '$lib/ui/components/listing-manager/EditorListing.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const extensionsListHref = url(`${route(getRootPathAccount())}/${getRootPathMyExtensions()}`);

	let initialized = $state(false);

	const categoryChoices = $derived(
		createSortedCategoryChoices(userListingNewExtensionPagePresenter.categoryChoices)
	);
	const tagChoices = $derived(
		userListingNewExtensionPagePresenter.tagChoices.map((tag) => ({
			value: tag.id,
			label: tag.name,
			slug: tag.slug
		}))
	);
	const formDefaults = $derived(userListingNewExtensionPagePresenter.getFormDefaults());

	onMount(async () => {
		await userListingNewExtensionPagePresenter.init(undefined, 'extension');
		initialized = true;
	});

	$effect(() => {
		if (userListingNewExtensionPagePresenter.showToastMessage) {
			const msg = userListingNewExtensionPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			userListingNewExtensionPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (userListingNewExtensionPagePresenter.redirectToList) {
			userListingNewExtensionPagePresenter.redirectToList = false;
			goto(extensionsListHref, { replaceState: true });
		}
	});

	async function handleSave(
		formData: Parameters<typeof userListingNewExtensionPagePresenter.submit>[0]
	) {
		await userListingNewExtensionPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(extensionsListHref, { replaceState: true });
	}
</script>

<div class="p-4 md:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">New extension</h1>
		<p class="text-sm text-base-content/70">
			Create a skills or MCP extension listing. Admin approval is required for the public catalog.
		</p>
	</div>

	{#if !initialized}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		{#key 'new-user-extension'}
			<EditorListing
				initialValues={formDefaults}
				{categoryChoices}
				{tagChoices}
				listingKind="extension"
				isPlatformAdmin={false}
				isSubmitting={userListingNewExtensionPagePresenter.submitting}
				noListingFound={false}
				onSave={handleSave}
				onDiscard={handleDiscard}
			/>
		{/key}
	{/if}
</div>
