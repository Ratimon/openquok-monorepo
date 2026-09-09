<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import Root from '$lib/ui/pagination/pagination.svelte';
	import Content from '$lib/ui/pagination/pagination-content.svelte';
	import Item from '$lib/ui/pagination/pagination-item.svelte';
	import Link from '$lib/ui/pagination/pagination-link.svelte';
	import Previous from '$lib/ui/pagination/pagination-previous.svelte';
	import Next from '$lib/ui/pagination/pagination-next.svelte';
	import Ellipsis from '$lib/ui/pagination/pagination-ellipsis.svelte';

	type Props = {
		class?: string;
		itemsPerPage: number;
		totalItems: number;
		currentPage: number;
		totalPages: number;
		setItemsPerPage: (size: number) => void;
		setCurrentPage: (page: number) => void;
		paginateToFirstPage: () => void;
		paginateToLastPage: () => void;
		pageSizeOptions?: number[];
	};

	let {
		class: className = '',
		itemsPerPage,
		totalItems,
		currentPage,
		totalPages,
		setItemsPerPage,
		setCurrentPage,
		paginateToFirstPage,
		paginateToLastPage,
		pageSizeOptions = [10, 20, 30]
	}: Props = $props();

	let lowerBound = $derived(
		totalItems > 0 ? currentPage * itemsPerPage - itemsPerPage + 1 : 0
	);
	let upperBound = $derived(Math.min(currentPage * itemsPerPage, totalItems));
	let showPaginationControls = $derived(totalPages > 1);
</script>

<div class={cn('flex shrink-0 flex-col gap-2 border-t border-base-300 bg-base-200/80 px-3 py-2.5', className)}>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<label class="text-xs text-base-content/70" for="notification-page-size">Per page</label>
			<select
				id="notification-page-size"
				class="border-input bg-base-100 focus-visible:ring-ring h-8 min-h-8 w-[70px] rounded-md border px-2 py-1 text-sm leading-normal shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
				value={itemsPerPage}
				onchange={(e) => {
					const newValue = Number((e.currentTarget as HTMLSelectElement).value);
					setItemsPerPage(newValue);
				}}
			>
				{#each pageSizeOptions as pageSize (pageSize)}
					<option value={pageSize}>{pageSize}</option>
				{/each}
			</select>
		</div>
		<p class="text-xs text-base-content/70">
			{#if totalItems > 0}
				<span class="font-medium text-base-content">{lowerBound}-{upperBound}</span>
				of
				<span class="font-medium text-base-content">{totalItems}</span>
			{:else}
				0 notifications
			{/if}
		</p>
	</div>

	{#if showPaginationControls}
		<Root
			count={totalItems}
			perPage={itemsPerPage}
			page={currentPage}
			onPageChange={setCurrentPage}
			siblingCount={1}
		>
			{#snippet children({ pages, currentPage: page })}
				<Content class="flex w-full items-center justify-center gap-1">
					<Button
						class="size-7 p-0"
						variant="outline"
						size="icon"
						disabled={currentPage === 1}
						onclick={paginateToFirstPage}
						type="button"
					>
						<span class="sr-only">Go to first page</span>
						<AbstractIcon name={icons.SkipBackIcon.name} width="14" height="14" focusable="false" />
					</Button>
					<Previous class="size-7" />
					<ul class="flex flex-row items-center gap-1">
						{#each pages as item (item.key)}
							{#if item.type === 'ellipsis'}
								<Item>
									<Ellipsis />
								</Item>
							{:else}
								<Item>
									<Link page={item} isActive={item.value === page} class="size-7 text-xs">
										{item.value}
									</Link>
								</Item>
							{/if}
						{/each}
					</ul>
					<Next class="size-7" />
					<Button
						class="size-7 p-0"
						variant="outline"
						size="icon"
						disabled={currentPage >= Math.max(totalPages, 1)}
						onclick={paginateToLastPage}
						type="button"
					>
						<span class="sr-only">Go to last page</span>
						<AbstractIcon
							name={icons.SkipForwardIcon.name}
							width="14"
							height="14"
							focusable="false"
						/>
					</Button>
				</Content>
			{/snippet}
		</Root>
	{/if}
</div>
