<script lang="ts">
	import type { BlogTopicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
	import { deleteBlogTopicVerificationPresenter } from '$lib/blogs';
	import { icons } from '$data/icons';
	import ActionVerificationModal from '$lib/ui/templates/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { Pagination } from '$lib/ui/pagination';
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

<div class="mt-6 grid">
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

	<CardContent>
		<div class="mt-6 table w-full table-auto">
			<div class="table-header-group">
				<div class="table-row text-sm">
					<div class="table-cell h-10 whitespace-nowrap border-b-2 border-neutral-200 px-2 text-left align-middle font-medium">
						Name
					</div>
					<div class="table-cell h-10 whitespace-nowrap border-b-2 border-neutral-200 px-2 text-left align-middle font-medium">
						Description
					</div>
					<div class="table-cell h-10 whitespace-nowrap border-b-2 border-neutral-200 px-2 text-left align-middle font-medium">
						Parent
					</div>
					<div class="table-cell h-10 w-28 border-b-2 border-neutral-200 px-2 text-left align-middle font-medium">
						Edit/Delete
					</div>
				</div>
			</div>

			<div class="table-row-group">
				{#if currentData.length === 0}
					<div class="table-row">
						<div
							class="table-cell p-6 text-center text-base-content/60"
							style="grid-column: 1 / -1;"
						>
							No topics found.
						</div>
					</div>
				{:else}
					{#each currentData as topic (topic.id)}
						<div class="table-row h-auto">
							<div class="table-cell content-center border-b-2 border-neutral-200 p-2 align-middle font-medium">
								{topic.name}
							</div>

							<div class="table-cell content-center border-b-2 border-neutral-200 p-2 align-middle text-muted-foreground">
								{topic.description ? String(topic.description) : '—'}
							</div>

							<div class="table-cell content-center border-b-2 border-neutral-200 p-2 align-middle text-muted-foreground">
								{getParentLabel(topic)}
							</div>

							<div class="table-cell content-center border-b-2 border-neutral-200 p-2">
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
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</CardContent>

	<CardFooter>
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
