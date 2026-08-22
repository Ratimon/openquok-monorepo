<script lang="ts">
	import type { ListingTagViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type { ListingTagGroupProgrammerModel } from '$lib/listings/Listing.repository.svelte';
	import { onMount } from 'svelte';

	import { adminListingTagsManagerPagePresenter } from '$lib/area-admin';
	import ListingTagsTable from '$lib/ui/components/listing-manager/ListingTagsTable.svelte';
	import ListingTagGroupsTable from '$lib/ui/components/listing-manager/ListingTagGroupsTable.svelte';
	import ListingTagUpsertModal from '$lib/ui/components/listing-manager/ListingTagUpsertModal.svelte';
	import ListingTagGroupUpsertModal from '$lib/ui/components/listing-manager/ListingTagGroupUpsertModal.svelte';
	import ListingMissingCatalogTags from '$lib/ui/components/listing-manager/ListingMissingCatalogTags.svelte';
	import * as Tabs from '$lib/ui/tabs';

	const tabTriggerClass =
		'data-[state=active]:bg-base-100 data-[state=active]:text-base-content data-[state=active]:shadow-sm';

	let activeTab = $state('tags');

	const isLoading = $derived(adminListingTagsManagerPagePresenter.loading);
	const tagsVm = $derived(adminListingTagsManagerPagePresenter.allTagsToManageVm);
	const tagGroupsVm = $derived(adminListingTagsManagerPagePresenter.allTagGroupsToManageVm);
	const hasTags = $derived(tagsVm.length > 0);
	const hasTagGroups = $derived(tagGroupsVm.length > 0);
	const missingCatalogTagsVm = $derived.by(() => {
		void tagsVm;
		return adminListingTagsManagerPagePresenter.listMissingCatalogTagsVm();
	});

	onMount(async () => {
		await adminListingTagsManagerPagePresenter.loadAllTags();
	});

	function handleTagCreated(vm: ListingTagViewModel) {
		adminListingTagsManagerPagePresenter.addListingTag(vm);
	}

	function handleTagUpdated(vm: ListingTagViewModel) {
		adminListingTagsManagerPagePresenter.updateListingTag(vm);
	}

	function handleTagDeleted(tag: ListingTagViewModel) {
		adminListingTagsManagerPagePresenter.removeListingTag(tag.id);
	}

	function handleTagGroupCreated(vm: ListingTagGroupProgrammerModel) {
		adminListingTagsManagerPagePresenter.addListingTagGroup(vm);
	}

	function handleTagGroupUpdated(vm: ListingTagGroupProgrammerModel) {
		adminListingTagsManagerPagePresenter.updateListingTagGroup(vm);
	}

	function handleTagGroupDeleted(group: ListingTagGroupProgrammerModel) {
		adminListingTagsManagerPagePresenter.removeListingTagGroup(group.id);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">Tags</h1>
			<p class="text-sm text-base-content/70">Manage listing tags and tag groups. Platform admin only.</p>
		</div>
	</div>

	{#if isLoading}
		<div class="mt-6">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else}
		<Tabs.Root bind:value={activeTab} defaultValue="tags" class="mt-6 w-full">
			<Tabs.List class="mb-4 inline-flex h-10 items-center justify-center rounded-lg bg-base-200 p-1">
				<Tabs.Trigger value="tags" class={tabTriggerClass}>Tags</Tabs.Trigger>
				<Tabs.Trigger value="tag-groups" class={tabTriggerClass}>Tag groups</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="tags">
				<ListingMissingCatalogTags
					missingTags={missingCatalogTagsVm}
					allTagGroups={tagGroupsVm}
					onTagCreated={handleTagCreated}
				/>
				{#if !hasTags}
					<div
						class="flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
					>
						<div class="flex flex-col items-center gap-1 text-center">
							<h3 class="text-2xl font-bold tracking-tight text-base-content">You have no tags</h3>
							<p class="text-sm text-base-content/70">Create your first listing tag to get started.</p>

							<div class="mt-4">
								<ListingTagUpsertModal
									tag={undefined}
									allTagGroups={tagGroupsVm}
									buttonVariant="primary"
									onTagCreated={handleTagCreated}
									onTagUpdated={handleTagUpdated}
								/>
							</div>
						</div>
					</div>
				{:else}
					<ListingTagsTable
						{tagsVm}
						allTagGroups={tagGroupsVm}
						onTagCreated={handleTagCreated}
						onTagUpdated={handleTagUpdated}
						onTagDeleted={handleTagDeleted}
					/>
				{/if}
			</Tabs.Content>

			<Tabs.Content value="tag-groups">
				{#if !hasTagGroups}
					<div
						class="flex min-h-96 flex-1 items-center justify-center rounded-lg border border-dashed border-base-300"
					>
						<div class="flex flex-col items-center gap-1 text-center">
							<h3 class="text-2xl font-bold tracking-tight text-base-content">You have no tag groups</h3>
							<p class="text-sm text-base-content/70">
								Create a group to organize tags on the Extensions Hub.
							</p>

							<div class="mt-4">
								<ListingTagGroupUpsertModal
									tagGroup={undefined}
									buttonVariant="primary"
									onTagGroupCreated={handleTagGroupCreated}
									onTagGroupUpdated={handleTagGroupUpdated}
								/>
							</div>
						</div>
					</div>
				{:else}
					<ListingTagGroupsTable
						{tagGroupsVm}
						onTagGroupCreated={handleTagGroupCreated}
						onTagGroupUpdated={handleTagGroupUpdated}
						onTagGroupDeleted={handleTagGroupDeleted}
					/>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>
