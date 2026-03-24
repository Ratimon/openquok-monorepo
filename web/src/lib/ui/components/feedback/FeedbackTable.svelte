<script lang="ts">
	import type { FeedbackViewModel } from '$lib/feedback';

	import { createPagination } from '$lib/ui/helpers/createPagination.svelte';
	import { capitalize } from '$lib/ui/helpers/common';
	import { formatDate } from '$lib/ui/helpers/formatters';
	import { cn } from '$lib/ui/helpers/common';
	import { CardContent, CardFooter } from '$lib/ui/card';
	import { Pagination } from '$lib/ui/pagination';

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
		<div class="mt-4 overflow-x-auto border border-base-300 rounded-xl bg-base-100">
			<table class="table table-zebra">
				<thead>
					<tr>
						<th class="whitespace-nowrap">
							Created</th>
						<th class="whitespace-nowrap">
							Type</th>
						<th>
							Description</th>
						<th class="whitespace-nowrap">
							URL</th>
						<th class="whitespace-nowrap">
							Email</th>
						<th class="whitespace-nowrap text-right">
							Handled</th>
					</tr>
				</thead>
				<tbody>
					{#if currentData.length === 0}
						<tr>
							<td colspan={6} class="text-center text-base-content/60 py-10">
								No feedback found.
							</td>
						</tr>
					{:else}
						{#each currentData as f (f.id)}
							<tr
								class={cn(
									'h-auto',
									f.isHandled && 'opacity-70'
								)}
							>
								<td class="whitespace-nowrap text-xs text-base-content/70">
									{formatDate(f.createdAt)}
								</td>
								<td class="whitespace-nowrap">
									<span class="badge badge-ghost">{capitalize(f.feedbackType || 'unknown')}</span>
								</td>
								<td class="min-w-[22rem] max-w-[42rem]">
									<div class="whitespace-pre-wrap break-words text-sm">
										{f.description ?? '—'}</div>
								</td>
								<td class="max-w-[18rem]">
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
								</td>
								<td class="whitespace-nowrap text-sm text-base-content/80">
									{f.email ?? '—'}
								</td>
								<td class="whitespace-nowrap text-right">
									<input
										type="checkbox"
										class="toggle toggle-sm"
										checked={f.isHandled}
										onchange={(e) =>
											handleToggle(f, (e.currentTarget as HTMLInputElement).checked)}
									/>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
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
			nameOfItems="items"
			pageSizeOptions={[5, 10, 25, 50]}
		/>
	</CardFooter>
</div>
