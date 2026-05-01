<script lang="ts">
	import { goto } from '$app/navigation';
	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		class?: string;
		itemsPerPage: number;
		totalItems: number;
		currentPage: number;
		totalPages: number;
		buildListUrl: (overrides: Record<string, string | null | undefined>) => string;
		nameOfItems?: string;
		pageSizeOptions?: number[];
	};

	let {
		class: className = '',
		itemsPerPage,
		totalItems,
		currentPage,
		totalPages,
		buildListUrl,
		nameOfItems = 'posts',
		pageSizeOptions = [4, 13, 31]
	}: Props = $props();

	let lowerBound = $derived(
		totalItems > 0 ? currentPage * itemsPerPage - itemsPerPage + 1 : 0
	);
	let upperBound = $derived(Math.min(currentPage * itemsPerPage, totalItems));

	function pageNumbers(): number[] {
		const tp = Math.max(totalPages, 1);
		const maxShown = 7;
		if (tp <= maxShown) {
			return Array.from({ length: tp }, (_, i) => i + 1);
		}
		const pages = new Set<number>();
		pages.add(1);
		pages.add(tp);
		for (let d = -2; d <= 2; d++) {
			const p = currentPage + d;
			if (p >= 1 && p <= tp) pages.add(p);
		}
		return [...pages].sort((a, b) => a - b);
	}

	let pagesToShow = $derived(pageNumbers());
</script>

<div
	class={cn(
		'mt-6 flex w-full flex-wrap items-center justify-between gap-4 md:flex-nowrap md:gap-0',
		className
	)}
>
	<div class="flex flex-wrap justify-center gap-4 sm:space-x-2 md:justify-start">
		<div class="flex items-center space-x-2">
			<label class="text-base-content text-sm" for="pagination-ipp">
				{nameOfItems} per page</label>
			<select
				id="pagination-ipp"
				class="border-input bg-transparent focus-visible:ring-ring h-8 w-[72px] rounded-md border border-base-300 px-2 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
				value={itemsPerPage}
				onchange={(e) => {
					const v = Number((e.currentTarget as HTMLSelectElement).value);
					void goto(buildListUrl({ ipp: String(v), page: null }));
				}}
			>
				{#each pageSizeOptions as pageSize (pageSize)}
					<option value={pageSize}>
						{pageSize}</option>
				{/each}
			</select>
		</div>
		<div class="text-base-content flex items-center space-x-1 text-sm">
			<span>Showing</span>
			<span>
				<span class="font-bold">{lowerBound}</span>-<span class="font-bold">{upperBound}</span>
			</span>
			<span>of</span>
			<span class="font-bold">{totalItems}</span>
			<span>{nameOfItems}</span>
		</div>
	</div>

	<nav class="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
		<Button
			class="size-8 p-0"
			variant="outline"
			size="icon"
			disabled={currentPage <= 1}
			href={currentPage > 1 ? buildListUrl({ page: '1' }) : undefined}
		>
			<span class="sr-only">First page</span>
			<AbstractIcon name={icons.SkipBackIcon.name} width="16" height="16" focusable="false" />
		</Button>
		<Button
			class="size-8 p-0"
			variant="outline"
			size="icon"
			disabled={currentPage <= 1}
			href={currentPage > 1 ? buildListUrl({ page: String(currentPage - 1) }) : undefined}
			rel={currentPage > 1 ? 'prev' : undefined}
		>
			<span class="sr-only">Previous page</span>
			<span aria-hidden="true">‹</span>
		</Button>

		<ul class="flex flex-row items-center gap-1">
			{#each pagesToShow as p, i (p)}
				{#if i > 0 && p - pagesToShow[i - 1] > 1}
					<li class="text-base-content/50 px-1 text-sm" aria-hidden="true">
						…</li>
				{/if}
				<li>
					<a
						href={buildListUrl({ page: String(p) })}
						class={cn(
							'flex size-8 items-center justify-center rounded-md border text-sm transition-colors',
							p === currentPage
								? 'border-primary bg-primary text-primary-content'
								: 'border-base-300 hover:bg-base-200'
						)}
						aria-current={p === currentPage ? 'page' : undefined}
					>
						{p}
					</a>
				</li>
			{/each}
		</ul>

		<Button
			class="size-8 p-0"
			variant="outline"
			size="icon"
			disabled={currentPage >= totalPages}
			href={currentPage < totalPages ? buildListUrl({ page: String(currentPage + 1) }) : undefined}
			rel={currentPage < totalPages ? 'next' : undefined}
		>
			<span class="sr-only">Next page</span>
			<span aria-hidden="true">›</span>
		</Button>
		<Button
			class="size-8 p-0"
			variant="outline"
			size="icon"
			disabled={currentPage >= totalPages}
			href={currentPage < totalPages ? buildListUrl({ page: String(totalPages) }) : undefined}
		>
			<span class="sr-only">Last page</span>
			<AbstractIcon name={icons.SkipForwardIcon.name} width="16" height="16" focusable="false" />
		</Button>
	</nav>
</div>
