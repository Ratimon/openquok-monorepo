<script lang="ts">
	import type { FeedbackViewModel } from '$lib/feedbacks';

	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { capitalize } from '$lib/ui/helpers/common';
	import { formatDate } from '$lib/ui/helpers/formatters';
	import { cn } from '$lib/ui/helpers/common';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { Pagination } from '$lib/ui/pagination';
	import {
		Root as Table,
		Body as TableBody,
		Cell as TableCell,
		Head as TableHead,
		Header as TableHeader,
		Row as TableRow
	} from '$lib/ui/table';

	type Props = {
		feedbacksVm: FeedbackViewModel[];
		onHandleToggle: (feedback: FeedbackViewModel, newState: boolean) => Promise<void>;
	};

	let { feedbacksVm, onHandleToggle }: Props = $props();

	let pagination = $derived(
		createPagination({
			initialData: feedbacksVm,
			searchField: 'feedbackType',
			initialItemsPerPage: 10
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

	async function handleToggle(feedback: FeedbackViewModel, newState: boolean) {
		await onHandleToggle(feedback, newState);
	}
</script>

<div>
	<div class="flex w-full justify-end">
		<input
			type="text"
			class="border-input bg-transparent focus-visible:ring-ring h-9 w-60 rounded-md border border-base-300 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
			placeholder="Search by type..."
			bind:value={pagination.searchTerm}
		/>
	</div>

	<CardContent>
		<Table class="table-zebra" containerClass="mt-4 border border-base-300 rounded-xl bg-base-100">
			<TableHeader>
				<TableRow>
					<TableHead>Created</TableHead>
					<TableHead>Type</TableHead>
					<TableHead class="whitespace-normal">Description</TableHead>
					<TableHead>URL</TableHead>
					<TableHead>Email</TableHead>
					<TableHead class="text-right">Handled</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if currentData.length === 0}
					<TableRow>
						<TableCell colspan={6} class="py-10 text-center text-base-content/60">
							No feedback found.
						</TableCell>
					</TableRow>
				{:else}
					{#each currentData as f (f.id)}
						<TableRow class={cn('h-auto', f.isHandled && 'opacity-70')}>
							<TableCell class="text-xs text-base-content/70">
								{formatDate(f.createdAt)}
							</TableCell>
							<TableCell>
								<span class="badge badge-ghost">{capitalize(f.feedbackType || 'unknown')}</span>
							</TableCell>
							<TableCell class="min-w-[22rem] max-w-[42rem]">
								<div class="whitespace-pre-wrap break-words text-sm">
									{f.description ?? '—'}
								</div>
							</TableCell>
							<TableCell class="max-w-[18rem]">
								{#if f.url}
									<a
										class="link link-primary text-sm break-all"
										href={f.url}
										target="_blank"
										rel="noreferrer"
									>
										{f.url}
									</a>
								{:else}
									<span class="text-base-content/50">—</span>
								{/if}
							</TableCell>
							<TableCell class="text-sm text-base-content/80">
								{f.email ?? '—'}
							</TableCell>
							<TableCell class="text-right">
								<input
									type="checkbox"
									class="toggle toggle-sm"
									checked={f.isHandled}
									onchange={(e) =>
										handleToggle(f, (e.currentTarget as HTMLInputElement).checked)}
								/>
							</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
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
			nameOfItems="items"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>
