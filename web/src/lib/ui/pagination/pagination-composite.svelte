<script lang="ts">
	import { cn, capitalize } from '$lib/ui/helpers/common';
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
		/** Stacked layout for narrow containers (e.g. kanban columns). */
		compact?: boolean;
		pageSizeSelectId?: string;
		itemsPerPage: number;
		totalItems: number;
		currentPage: number;
		totalPages: number;
		setItemsPerPage: (size: number) => void;
		setCurrentPage: (page: number) => void;
		paginateFrontFF: () => void;
		paginateBackFF: () => void;
		nameOfItems?: string;
		pageSizeOptions?: number[];
	};

	let {
		class: className = '',
		compact = false,
		pageSizeSelectId = 'pagination-page-size',
		itemsPerPage,
		totalItems,
		currentPage,
		totalPages,
		setItemsPerPage,
		setCurrentPage,
		paginateFrontFF,
		paginateBackFF,
		nameOfItems = 'items',
		pageSizeOptions = [5, 10, 25, 50, 100]
	}: Props = $props();

	let lowerBound = $derived(
		totalItems > 0 ? currentPage * itemsPerPage - itemsPerPage + 1 : 0
	);
	let upperBound = $derived(
		Math.min(currentPage * itemsPerPage, totalItems)
	);
	const showPageControls = $derived(totalPages > 1);
	const pageSizeLabel = $derived(compact ? 'Posts per page' : `${capitalize(nameOfItems)} per page`);
</script>

{#if compact}
	<div class={cn('flex shrink-0 flex-col gap-2', className)}>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<label class="text-[10px] text-base-content/70" for={pageSizeSelectId}>
					{pageSizeLabel}
				</label>
				<select
					id={pageSizeSelectId}
					class="border-input bg-base-100 focus-visible:ring-ring h-7 min-h-7 w-[52px] rounded-md border px-1.5 py-0.5 text-xs leading-normal shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
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
			<p class="text-[10px] text-base-content/70">
				{#if totalItems > 0}
					<span class="font-medium tabular-nums text-base-content">{lowerBound}-{upperBound}</span>
					of
					<span class="font-medium tabular-nums text-base-content">{totalItems}</span>
					{nameOfItems}
				{:else}
					0 {nameOfItems}
				{/if}
			</p>
		</div>

		{#if showPageControls}
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
							onclick={paginateBackFF}
							type="button"
						>
							<span class="sr-only">Go to first page</span>
							<AbstractIcon
								name={icons.SkipBackIcon.name}
								width="14"
								height="14"
								focusable="false"
							/>
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
							onclick={paginateFrontFF}
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
{:else}
<div
	class={cn(
		'grid md:flex flex-wrap items-center w-full mt-6 justify-between gap-4 md:gap-0',
		className
	)}
>
	<div class="flex flex-wrap justify-center sm:space-x-2 md:justify-start">
		<div class="flex items-center space-x-2">
			<p class="text-sm text-base-content">
				<span>{capitalize(nameOfItems)}</span> per page
			</p>
			<select
				class="border-input bg-transparent focus-visible:ring-ring h-8 w-[70px] rounded-md border px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
				value={itemsPerPage}
				onchange={(e) => {
					const newValue = Number((e.currentTarget as HTMLSelectElement).value);
					setItemsPerPage(newValue);
				}}
			>
				{#each pageSizeOptions as pageSize}
					<option value={pageSize}>
						{pageSize}</option>
				{/each}
			</select>
		</div>
		<div class="flex items-center space-x-1 text-sm text-base-content">
			<span>Showing</span>
			<span>
				<span class="font-bold">{lowerBound}</span>-<span class="font-bold">{upperBound}</span>
			</span>
			<span>of</span>
			<span class="font-bold">{totalItems}</span>
			<span>{nameOfItems}</span>
		</div>
	</div>

	<Root
		count={totalItems}
		perPage={itemsPerPage}
		page={currentPage}
		onPageChange={setCurrentPage}
		siblingCount={1}
	>
		{#snippet children({ pages, currentPage: page })}
			<Content class="flex items-center space-x-2">
				<Button
					class="size-8 p-0"
					variant="outline"
					size="icon"
					disabled={currentPage === 1}
					onclick={paginateBackFF}
					type="button"
				>
					<span class="sr-only">Go to first page</span>
					<AbstractIcon name={icons.SkipBackIcon.name} width="16" height="16" focusable="false" />
				</Button>
				<Previous />
				<ul class="flex flex-row items-center gap-2">
					{#each pages as item (item.key)}
						{#if item.type === 'ellipsis'}
							<Item>
								<Ellipsis />
							</Item>
						{:else}
							<Item>
								<Link page={item} isActive={item.value === page}>
									{item.value}
								</Link>
							</Item>
						{/if}
					{/each}
				</ul>
				<Next />
				<Button
					class="size-8 p-0"
					variant="outline"
					size="icon"
					disabled={currentPage >= Math.max(totalPages, 1)}
					onclick={paginateFrontFF}
					type="button"
				>
					<span class="sr-only">Go to last page</span>
					<AbstractIcon name={icons.SkipForwardIcon.name} width="16" height="16" focusable="false" />
				</Button>
			</Content>
		{/snippet}
	</Root>
</div>
{/if}
