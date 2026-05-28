<script lang="ts">
	import type { BlogTopicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
	import { deleteBlogTopicVerificationPresenter } from '$lib/blogs';
	import { icons } from '$data/icons';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { Pagination } from '$lib/ui/pagination';
	import {
		Root as Table,
		Body as TableBody,
		Cell as TableCell,
		Head as TableHead,
		Header as TableHeader,
		Row as TableRow
	} from '$lib/ui/table';
	import BlogTopicUpsertModal from '$lib/ui/components/blog-manager/BlogTopicUpsertModal.svelte';
	import { createSortedTopicChoices } from '$lib/blogs/utils/parentPathCreator';

	type Props = {
		topicsVm: BlogTopicViewModel[];
		onTopicCreated: (vm: BlogTopicViewModel) => void | Promise<void>;
		onTopicUpdated: (vm: BlogTopicViewModel) => void | Promise<void>;
		onTopicDeleted: (topic: BlogTopicViewModel) => void | Promise<void>;
	};

	let { topicsVm, onTopicCreated, onTopicUpdated, onTopicDeleted }: Props = $props();

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 5,
			initialData: topicsVm,
			searchField: 'name'
		})
	);

	let {
		currentData,
		currentPage,
		totalPages,
		totalFilteredItems,
		itemsPerPage,
		paginateFrontFF,
		paginateBackFF,
		setItemsPerPage,
		setCurrentPage
	} = $derived(pagination);

	let topicChoices = $derived(createSortedTopicChoices(topicsVm));

	let deleteModalOpen = $state(false);
	let selectedToDelete = $state<BlogTopicViewModel | null>(null);

	function getParentLabel(topic: BlogTopicViewModel): string {
		if (!topic.parentId) return '---';
		return topicChoices.find((c) => c.value === topic.parentId)?.label ?? '---';
	}

	function openDeleteModal(topic: BlogTopicViewModel) {
		selectedToDelete = topic;
		deleteModalOpen = true;
	}

	async function handleDeleteSuccess() {
		if (selectedToDelete) {
			await onTopicDeleted(selectedToDelete);
		}
		deleteModalOpen = false;
		selectedToDelete = null;
	}
</script>

<div class="mt-6 w-full">
	<div class="flex w-full justify-between flex-wrap gap-4 items-center">
		<BlogTopicUpsertModal
			topic={undefined}
			allTopics={topicsVm}
			buttonVariant="outline"
			onTopicCreated={onTopicCreated}
			onTopicUpdated={onTopicUpdated}
		/>

		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by name..."
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent class="w-full px-0">
		<Table containerClass="mt-6 w-full border border-base-300 rounded-xl bg-base-100">
			<TableHeader>
				<TableRow class="text-sm">
					<TableHead>Name</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Parent</TableHead>
					<TableHead class="w-28">Edit/Delete</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if currentData.length === 0}
					<TableRow>
						<TableCell colspan={4} class="py-6 text-center text-base-content/60">
							No topics found.
						</TableCell>
					</TableRow>
				{:else}
					{#each currentData as topic (topic.id)}
						<TableRow class="h-auto">
							<TableCell class="font-medium">
								{topic.name}
							</TableCell>
							<TableCell class="text-base-content/70">
								{topic.description ? String(topic.description) : '—'}
							</TableCell>
							<TableCell class="text-base-content/70">
								{getParentLabel(topic)}
							</TableCell>
							<TableCell>
								<div class="flex gap-2">
									<BlogTopicUpsertModal
										{topic}
										allTopics={topicsVm}
										buttonVariant="outline"
										{onTopicCreated}
										{onTopicUpdated}
									/>
									<Button
										variant="outline"
										size="sm"
										type="button"
										onclick={() => openDeleteModal(topic)}
									>
										Delete
									</Button>
								</div>
							</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</CardContent>

	<CardFooter class="w-full flex-col items-stretch px-0">
		<Pagination
			itemsPerPage={itemsPerPage}
			totalItems={totalFilteredItems}
			currentPage={currentPage}
			totalPages={totalPages}
			setItemsPerPage={setItemsPerPage}
			setCurrentPage={setCurrentPage}
			{paginateFrontFF}
			{paginateBackFF}
			nameOfItems="topics"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ topicId: selectedToDelete.id, topicName: selectedToDelete.name }}
		bind:open={deleteModalOpen}
		executionFunction={deleteBlogTopicVerificationPresenter.execute}
		status={deleteBlogTopicVerificationPresenter.status}
		showToastMessage={deleteBlogTopicVerificationPresenter.showToastMessage}
		toastMessage={deleteBlogTopicVerificationPresenter.toastMessage}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete blog topic"
		modalDescription={`Are you sure you want to delete "${selectedToDelete.name}"? This cannot be undone.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteSuccess}
	/>
{/if}
