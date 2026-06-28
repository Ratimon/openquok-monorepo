<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getRootPathSecretAdminListingManagerStacks } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import { adminListingStackEditorPagePresenter } from '$lib/area-admin';
	import { createSortedCategoryChoices } from '$lib/listings';
	import EditorListing from '$lib/ui/components/listing-manager/EditorListing.svelte';

	const stacksListHref = url(getRootPathSecretAdminListingManagerStacks());

	type Props = { data: PageData };

	let { data }: Props = $props();
	let isPlatformAdmin = $derived(data.isPlatformAdmin ?? false);

	let initialized = $state(false);
	let listingFound = $state(true);

	const categoryChoices = $derived(
		createSortedCategoryChoices(adminListingStackEditorPagePresenter.categoryChoices)
	);
	const tagChoices = $derived(
		adminListingStackEditorPagePresenter.tagChoices.map((t) => ({
			value: t.id,
			label: t.name,
			slug: t.slug
		}))
	);
	const formDefaults = $derived(adminListingStackEditorPagePresenter.getFormDefaults());
	const slugDisplay = $derived(adminListingStackEditorPagePresenter.listing?.slug ?? '');

	onMount(async () => {
		const id = data.listingId;
		if (!id) {
			listingFound = false;
			initialized = true;
			return;
		}
		const { listingFound: found } = await adminListingStackEditorPagePresenter.init(id, 'stack');
		listingFound = found !== false;
		initialized = true;
	});

	$effect(() => {
		if (adminListingStackEditorPagePresenter.showToastMessage) {
			const msg = adminListingStackEditorPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			adminListingStackEditorPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (adminListingStackEditorPagePresenter.redirectToList) {
			adminListingStackEditorPagePresenter.redirectToList = false;
			goto(stacksListHref, { replaceState: true });
		}
	});

	async function handleSave(formData: Parameters<typeof adminListingStackEditorPagePresenter.submit>[0]) {
		await adminListingStackEditorPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(stacksListHref, { replaceState: true });
	}
</script>

<div class="p-4 md:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">Edit stack</h1>
		<p class="text-sm text-base-content/70">Update the stack listing below.</p>
	</div>

	{#if !initialized}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		{#key formDefaults.id ?? data.listingId ?? 'loading'}
			<EditorListing
				initialValues={formDefaults}
				{categoryChoices}
				{tagChoices}
				listingKind="stack"
				{isPlatformAdmin}
				isSubmitting={adminListingStackEditorPagePresenter.submitting}
				{slugDisplay}
				noListingFound={!listingFound}
				onSave={handleSave}
				onDiscard={handleDiscard}
			/>
		{/key}
	{/if}
</div>
