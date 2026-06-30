<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getRootPathSecretAdminListingManagerStacks } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import { adminListingNewStackPagePresenter } from '$lib/area-admin';
	import { createSortedCategoryChoices } from '$lib/listings';
	import EditorListing from '$lib/ui/components/listing-manager/EditorListing.svelte';

	const stacksListHref = url(getRootPathSecretAdminListingManagerStacks());

	type Props = { data: PageData };

	let { data }: Props = $props();
	let isPlatformAdmin = $derived(data.isPlatformAdmin ?? false);

	let initialized = $state(false);

	const categoryChoices = $derived(createSortedCategoryChoices(adminListingNewStackPagePresenter.categoryChoices));
	const tagChoices = $derived(
		adminListingNewStackPagePresenter.tagChoices.map((t) => ({
			value: t.id,
			label: t.name,
			slug: t.slug
		}))
	);
	const formDefaults = $derived(adminListingNewStackPagePresenter.getFormDefaults());
	const stackExtensionChoices = $derived(adminListingNewStackPagePresenter.extensionChoices);

	onMount(async () => {
		await adminListingNewStackPagePresenter.init(undefined, 'stack');
		initialized = true;
	});

	$effect(() => {
		if (adminListingNewStackPagePresenter.showToastMessage) {
			const msg = adminListingNewStackPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			adminListingNewStackPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (adminListingNewStackPagePresenter.redirectToList) {
			adminListingNewStackPagePresenter.redirectToList = false;
			goto(stacksListHref, { replaceState: true });
		}
	});

	async function handleSave(formData: Parameters<typeof adminListingNewStackPagePresenter.submit>[0]) {
		await adminListingNewStackPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(stacksListHref, { replaceState: true });
	}
</script>

<div class="p-4 md:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">New stack</h1>
		<p class="text-sm text-base-content/70">Create a new stack listing.</p>
	</div>

	{#if !initialized}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		{#key 'new-stack'}
			<EditorListing
				initialValues={formDefaults}
				{categoryChoices}
				{tagChoices}
				{stackExtensionChoices}
				listingKind="stack"
				{isPlatformAdmin}
				isSubmitting={adminListingNewStackPagePresenter.submitting}
				noListingFound={false}
				onSave={handleSave}
				onDiscard={handleDiscard}
			/>
		{/key}
	{/if}
</div>
