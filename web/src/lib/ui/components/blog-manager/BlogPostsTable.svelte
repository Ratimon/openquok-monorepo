<script lang="ts">
	import { icons } from '$data/icons';
	import { deleteBlogPostVerificationPresenter } from '$lib/blogs';
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
	import FormattedISODate from '$lib/ui/components/FormattedISODate.svelte';
	import SupabaseImage from '$lib/ui/supabase/SupabaseImage.svelte';

	export type BlogPostTableItem = {
		id: string;
		title: string;
		description?: string | null;
		topicId?: string | null;
		topicName?: string | null;
		createdAt: string;
		isUserPublished: boolean;
		isAdminApproved: boolean;
		heroImageFilename?: string | null;
		/** Post body HTML; used after delete to clean up inline images in storage. */
		content?: string | null;
	};

	type TopicFilterChoice = { value: string; label: string };

	type Props = {
		posts: BlogPostTableItem[];
		topicFilterChoices?: TopicFilterChoice[];
		getEditHref: (post: BlogPostTableItem) => string;
		onPostDeleted: (post: BlogPostTableItem) => void | Promise<void>;
	};

	let { posts, topicFilterChoices = [], getEditHref, onPostDeleted }: Props = $props();

	const ALL_TOPICS_VALUE = 'all';

	let selectedTopicId = $state(ALL_TOPICS_VALUE);

	const postsMatchingTopic = $derived(
		selectedTopicId === ALL_TOPICS_VALUE
			? posts
			: posts.filter((post) => (post.topicId ?? '') === selectedTopicId)
	);

	let pagination = $derived(
		createPagination({
			initialItemsPerPage: 5,
			initialData: postsMatchingTopic,
			searchField: 'title'
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

	let deleteModalOpen = $state(false);
	let selectedToDelete = $state<BlogPostTableItem | null>(null);

	function openDeleteModal(post: BlogPostTableItem) {
		selectedToDelete = post;
		deleteModalOpen = true;
	}

	async function handleDeleteSuccess() {
		if (selectedToDelete) {
			await onPostDeleted(selectedToDelete);
		}
		deleteModalOpen = false;
		selectedToDelete = null;
	}

	function statusLabel(post: BlogPostTableItem): { label: string; className: string } {
		if (!post.isUserPublished) return { label: 'Draft', className: 'badge badge-info' };
		if (!post.isAdminApproved) return { label: 'Awaiting approval', className: 'badge badge-warning' };
		return { label: 'Published', className: 'badge badge-success' };
	}
</script>

<div class="mt-6 w-full">
	<div class="flex w-full flex-wrap items-center justify-end gap-2">
		{#if topicFilterChoices.length > 0}
			<label class="flex items-center gap-2 text-sm text-base-content/70">
				<span class="sr-only">Filter by topic</span>
				<span class="hidden sm:inline">Topic</span>
				<select
					class="border-input bg-transparent focus-visible:ring-ring h-9 min-w-[12rem] max-w-full rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
					bind:value={selectedTopicId}
				>
					<option value={ALL_TOPICS_VALUE}>All topics</option>
					{#each topicFilterChoices as choice (choice.value)}
						<option value={choice.value}>{choice.label}</option>
					{/each}
				</select>
			</label>
		{/if}
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 max-w-full rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by title..."
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent class="w-full px-0">
		<Table containerClass="mt-6 w-full border border-base-300 rounded-xl bg-base-100">
			<TableHeader>
				<TableRow class="text-sm">
					<TableHead class="hidden w-24 sm:table-cell"></TableHead>
					<TableHead>Title</TableHead>
					<TableHead class="hidden md:table-cell">Topic</TableHead>
					<TableHead class="hidden sm:table-cell">Description</TableHead>
					<TableHead class="hidden sm:table-cell">Status</TableHead>
					<TableHead class="hidden sm:table-cell">Created</TableHead>
					<TableHead class="min-w-[11rem]">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if currentData.length === 0}
					<TableRow>
						<TableCell colspan={7} class="py-6 text-center text-base-content/60">
							No posts found.
						</TableCell>
					</TableRow>
				{:else}
					{#each currentData as post (post.id)}
						<TableRow class="h-auto">
							<TableCell class="hidden w-24 sm:table-cell">
								{#if post.heroImageFilename}
									<SupabaseImage
										dbImageUrl={post.heroImageFilename}
										database="blog_images"
										width={900}
										height={600}
										class="relative inline h-12 w-24 overflow-hidden rounded-lg bg-base-200"
									/>
								{:else}
									<div class="h-12 w-24 rounded-lg bg-base-200"></div>
								{/if}
							</TableCell>
							<TableCell class="font-medium">
								{post.title}
							</TableCell>
							<TableCell class="hidden text-sm text-base-content/70 md:table-cell">
								{#if post.topicName}
									{post.topicName}
								{:else}
									<span class="text-base-content/50">—</span>
								{/if}
							</TableCell>
							<TableCell class="hidden overflow-hidden text-xs text-base-content/70 sm:table-cell">
								{#if post.description}
									{post.description.slice(0, 80)}{post.description.length > 80 ? '…' : ''}
								{:else}
									<span class="text-base-content/50">—</span>
								{/if}
							</TableCell>
							<TableCell class="hidden sm:table-cell">
								<span class={statusLabel(post).className}>{statusLabel(post).label}</span>
							</TableCell>
							<TableCell class="hidden text-sm text-base-content/70 sm:table-cell">
								<FormattedISODate date={post.createdAt} />
							</TableCell>
							<TableCell>
								<div class="flex flex-row flex-nowrap items-center gap-2">
									<Button variant="outline" size="sm" href={getEditHref(post)}>Edit</Button>
									<Button
										variant="outline"
										size="sm"
										type="button"
										onclick={() => openDeleteModal(post)}
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
			nameOfItems="posts"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>

{#if selectedToDelete}
	<ActionVerificationModal
		data={{ postId: selectedToDelete.id, postTitle: selectedToDelete.title }}
		bind:open={deleteModalOpen}
		executionFunction={deleteBlogPostVerificationPresenter.execute}
		status={deleteBlogPostVerificationPresenter.status}
		showToastMessage={deleteBlogPostVerificationPresenter.showToastMessage}
		toastMessage={deleteBlogPostVerificationPresenter.toastMessage}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete blog post"
		modalDescription={`Are you sure you want to delete "${selectedToDelete.title}"? This cannot be undone.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteSuccess}
	/>
{/if}
