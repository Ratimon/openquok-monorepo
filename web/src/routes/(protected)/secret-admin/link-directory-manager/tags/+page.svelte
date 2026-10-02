<script lang="ts">
	import { onMount } from 'svelte';

	import { adminLinkDirectoryTagsManagerPagePresenter } from '$lib/area-admin';
	import LinkDirectoryTagsTable from '$lib/ui/components/link-directory-manager/LinkDirectoryTagsTable.svelte';
	import LinkDirectoryTagGroupsTable from '$lib/ui/components/link-directory-manager/LinkDirectoryTagGroupsTable.svelte';
	import * as Tabs from '$lib/ui/tabs';

	const tabTriggerClass =
		'data-[state=active]:bg-base-100 data-[state=active]:text-base-content data-[state=active]:shadow-sm';

	let activeTab = $state('tags');

	const isLoading = $derived(adminLinkDirectoryTagsManagerPagePresenter.loading);
	const tagsVm = $derived(adminLinkDirectoryTagsManagerPagePresenter.allTagsToManageVm);
	const tagGroupsVm = $derived(adminLinkDirectoryTagsManagerPagePresenter.allTagGroupsToManageVm);

	onMount(async () => {
		await adminLinkDirectoryTagsManagerPagePresenter.loadAllTags();
	});
</script>

<div class="p-4 md:p-6">
	<h1 class="text-xl font-semibold text-base-content">Tags</h1>
	<p class="text-sm text-base-content/70 mt-1">Filter tags for build-backlinks (separate from Extensions Hub tags).</p>

	{#if isLoading}
		<div class="mt-6"><span class="loading loading-spinner loading-md"></span></div>
	{:else}
		<Tabs.Root bind:value={activeTab} class="mt-6">
			<Tabs.List class="grid w-full max-w-md grid-cols-2">
				<Tabs.Trigger value="tags" class={tabTriggerClass}>Tags</Tabs.Trigger>
				<Tabs.Trigger value="groups" class={tabTriggerClass}>Tag groups</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="tags" class="mt-4">
				<LinkDirectoryTagsTable
					{tagsVm}
					{tagGroupsVm}
					onTagCreated={(vm) => adminLinkDirectoryTagsManagerPagePresenter.addTag(vm)}
					onTagUpdated={(vm) => adminLinkDirectoryTagsManagerPagePresenter.updateTag(vm)}
					onTagDeleted={(t) => adminLinkDirectoryTagsManagerPagePresenter.removeTag(t.id)}
				/>
			</Tabs.Content>
			<Tabs.Content value="groups" class="mt-4">
				<LinkDirectoryTagGroupsTable
					{tagGroupsVm}
					onTagGroupCreated={(vm) => adminLinkDirectoryTagsManagerPagePresenter.addTagGroup(vm)}
					onTagGroupUpdated={(vm) => adminLinkDirectoryTagsManagerPagePresenter.updateTagGroup(vm)}
					onTagGroupDeleted={(g) => adminLinkDirectoryTagsManagerPagePresenter.removeTagGroup(g.id)}
				/>
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>
