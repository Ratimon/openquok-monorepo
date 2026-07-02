<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getRootPathSecretAdminListingManagerListings } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import { adminListingExtensionEditorPagePresenter } from '$lib/area-admin';
	import { createSortedCategoryChoices } from '$lib/listings';
	import EditorListing from '$lib/ui/components/listing-manager/EditorListing.svelte';

	const extensionsListHref = url(getRootPathSecretAdminListingManagerListings());

	type Props = { data: PageData };

	let { data }: Props = $props();
	let isPlatformAdmin = $derived(data.isPlatformAdmin ?? false);

	let initialized = $state(false);
	let listingFound = $state(true);

	const categoryChoices = $derived(
		createSortedCategoryChoices(adminListingExtensionEditorPagePresenter.categoryChoices)
	);
	const tagChoices = $derived(
		adminListingExtensionEditorPagePresenter.tagChoices.map((t) => ({
			value: t.id,
			label: t.name,
			slug: t.slug
		}))
	);
	const formDefaults = $derived(adminListingExtensionEditorPagePresenter.getFormDefaults());
	const slugDisplay = $derived(adminListingExtensionEditorPagePresenter.listing?.slug ?? '');

	onMount(async () => {
		const id = data.listingId;
		if (!id) {
			listingFound = false;
			initialized = true;
			return;
		}
		const { listingFound: found } = await adminListingExtensionEditorPagePresenter.init(id, 'extension');
		listingFound = found !== false;
		initialized = true;
	});

	$effect(() => {
		if (adminListingExtensionEditorPagePresenter.showToastMessage) {
			const msg = adminListingExtensionEditorPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			adminListingExtensionEditorPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (adminListingExtensionEditorPagePresenter.redirectToList) {
			adminListingExtensionEditorPagePresenter.redirectToList = false;
			goto(extensionsListHref, { replaceState: true });
		}
	});

	async function handleSave(
		formData: Parameters<typeof adminListingExtensionEditorPagePresenter.submit>[0]
	) {
		await adminListingExtensionEditorPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(extensionsListHref, { replaceState: true });
	}
</script>

<div class="p-4 md:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">
			Edit extension
		</h1>
		<p class="text-sm text-base-content/70">
			Update the extension listing below.
		</p>
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
				listingKind="extension"
				{isPlatformAdmin}
				isSubmitting={adminListingExtensionEditorPagePresenter.submitting}
				importingGithub={adminListingExtensionEditorPagePresenter.importingGithub}
				syncingGithub={adminListingExtensionEditorPagePresenter.syncingGithub}
				listingId={data.listingId}
				{slugDisplay}
				noListingFound={!listingFound}
				onSave={handleSave}
				onDiscard={handleDiscard}
				onImportGithub={(url, extensionType) =>
					adminListingExtensionEditorPagePresenter.importFromGithub(url, extensionType)}
				onSyncGithub={(id) => adminListingExtensionEditorPagePresenter.syncFromGithub(id)}
			/>
		{/key}
	{/if}
</div>
