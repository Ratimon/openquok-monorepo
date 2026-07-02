<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import {
		getRootPathAccount,
		getAccountPlaybooksHubPath,
		userListingNewStackPagePresenter
	} from '$lib/area-protected';
	import { createSortedCategoryChoices } from '$lib/listings';
	import {
		clearSkillBuilderStackDraft,
		readSkillBuilderStackDraft
	} from '$lib/stack-builder/constants/skillBuilderDraftStorage';
	import { route, url } from '$lib/utils/path';

	import { toast } from '$lib/ui/sonner';
	import EditorListing from '$lib/ui/components/listing-manager/EditorListing.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const extensionsHubHref = url(`${route(getRootPathAccount())}/${getAccountPlaybooksHubPath()}`);

	let initialized = $state(false);

	const categoryChoices = $derived(
		createSortedCategoryChoices(userListingNewStackPagePresenter.categoryChoices)
	);
	const tagChoices = $derived(
		userListingNewStackPagePresenter.tagChoices.map((tag) => ({
			value: tag.id,
			label: tag.name,
			slug: tag.slug
		}))
	);
	const formDefaults = $derived(userListingNewStackPagePresenter.getFormDefaults());
	const stackExtensionChoices = $derived(userListingNewStackPagePresenter.extensionChoices);

	onMount(async () => {
		const draft = readSkillBuilderStackDraft();
		await userListingNewStackPagePresenter.init(undefined, 'stack', { skillBuilderDraft: draft });
		if (draft) clearSkillBuilderStackDraft();
		initialized = true;
	});

	$effect(() => {
		if (userListingNewStackPagePresenter.showToastMessage) {
			const msg = userListingNewStackPagePresenter.toastMessage;
			if (msg && (msg.includes('error') || msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Saved.');
			}
			userListingNewStackPagePresenter.showToastMessage = false;
		}
	});

	$effect(() => {
		if (userListingNewStackPagePresenter.redirectToList) {
			userListingNewStackPagePresenter.redirectToList = false;
			goto(extensionsHubHref, { replaceState: true });
		}
	});

	async function handleSave(formData: Parameters<typeof userListingNewStackPagePresenter.submit>[0]) {
		await userListingNewStackPagePresenter.submit(formData);
	}

	function handleDiscard() {
		goto(extensionsHubHref, { replaceState: true });
	}
</script>

<div class="p-4 md:p-6">
	<div class="mb-6">
		<h1 class="text-xl font-semibold text-base-content">New playbook</h1>
		<p class="text-sm text-base-content/70">
			Finish metadata and members, then submit when ready. Admin approval is required before the stack
			appears on the public catalog.
		</p>
	</div>

	{#if !initialized}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
		</div>
	{:else}
		{#key `${formDefaults.title ?? 'new-user-stack'}|${formDefaults.content?.length ?? 0}`}
			<EditorListing
				initialValues={formDefaults}
				{categoryChoices}
				{tagChoices}
				{stackExtensionChoices}
				listingKind="stack"
				isPlatformAdmin={false}
				isSubmitting={userListingNewStackPagePresenter.submitting}
				noListingFound={false}
				onSave={handleSave}
				onDiscard={handleDiscard}
			/>
		{/key}
	{/if}
</div>
