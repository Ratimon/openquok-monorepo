<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getRootPathSecretAdminListingManagerBuildingBlocks } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import { adminListingNewExtensionPagePresenter } from '$lib/area-admin';
	import { createSortedCategoryChoices } from '$lib/listings';
	import EditorListing from '$lib/ui/components/listing-manager/EditorListing.svelte';

	const extensionsListHref = url(getRootPathSecretAdminListingManagerBuildingBlocks());

	type Props = { data: PageData };

	let { data }: Props = $props();
	let isPlatformAdmin = $derived(data.isPlatformAdmin ?? false);

	let initialized = $state(false);

	const categoryChoices = $derived(
		createSortedCategoryChoices(adminListingNewExtensionPagePresenter.categoryChoices)
	);
	const tagChoices = $derived(
		adminListingNewExtensionPagePresenter.tagChoices.map((t) => ({
			value: t.id,
			label: t.name,
			slug: t.slug
		}))
	);
	const formDefaults = $derived(adminListingNewExtensionPagePresenter.getFormDefaults());

	onMount(async () => {
		await adminListingNewExtensionPagePresenter.init(undefined, 'extension');
		initialized = true;
	});

	$effect(() => {
		if (adminListingNewExtensionPagePresenter.showToastMessage) {
			const msg = adminListingNewExtensionPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			adminListingNewExtensionPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (adminListingNewExtensionPagePresenter.redirectToList) {
			adminListingNewExtensionPagePresenter.redirectToList = false;
			goto(extensionsListHref, { replaceState: true });
		}
	});

	async function handleSave(formData: Parameters<typeof adminListingNewExtensionPagePresenter.submit>[0]) {
		await adminListingNewExtensionPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(extensionsListHref, { replaceState: true });
	}
</script>

<div class="p-4 md:p-6">
	<div class="alert alert-info mb-6 text-sm">
		<p>
			This listing will publish under
			<span class="font-mono">/creators/openquok/…</span>. To publish under your own username, use
			<a href={url('/account/playbooks')} class="link link-primary">Account → Playbooks</a>.
		</p>
	</div>

	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">New building block</h1>
		<p class="text-sm text-base-content/70">Create a new extension listing.</p>
	</div>

	{#if !initialized}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		{#key 'new-extension'}
			<EditorListing
				initialValues={formDefaults}
				{categoryChoices}
				{tagChoices}
				listingKind="extension"
				{isPlatformAdmin}
				isSubmitting={adminListingNewExtensionPagePresenter.submitting}
				importingGithub={adminListingNewExtensionPagePresenter.importingGithub}
				noListingFound={false}
				onSave={handleSave}
				onDiscard={handleDiscard}
				onImportGithub={(url, extensionType) =>
					adminListingNewExtensionPagePresenter.importFromGithub(url, extensionType)}
			/>
		{/key}
	{/if}
</div>
