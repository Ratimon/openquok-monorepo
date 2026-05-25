<script lang="ts">
	import type { IApi, IColumn } from '@svar-ui/svelte-grid';
	import type { HomeChannelTableRowViewModel } from '$lib/channels/HomeChannelsGridTable.presenter.svelte';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { FilterBuilder, Willow as FilterWillow } from '@svar-ui/svelte-filter';
	import { Pager, Willow as CoreWillow } from '@svar-ui/svelte-core';
	import { Willow, Grid, Tooltip } from '@svar-ui/svelte-grid';

	type FilterField = { readonly id: string; readonly label: string; readonly type: string };

	type Props = {
		filteredRowCount: number;
		pagedRowsVm: HomeChannelTableRowViewModel[];
		filterValue: { glue: 'and' | 'or'; rules: unknown[] };
		filterFields: readonly FilterField[];
		filterHasAnyRule: boolean;
		filterIsReady: boolean;
		filterAddMenuOpen: boolean;
		filterAddableFieldOptions: { id: string; label: string }[];
		filterOptions: Record<string, string[]>;
		gridColumns: IColumn[];
		gridSizes: { rowHeight: number; headerHeight: number };
		gridAutoRowHeight: boolean;
		gridCellStyle: (row: unknown, column: IColumn) => string;
		gridHostEl?: HTMLDivElement | null;
		gridPage?: number;
		gridPageSize?: number;
		onFilterInit: (api: unknown) => void;
		onFilterChange: (ev: { value: { glue: 'and' | 'or'; rules: unknown[] } }) => void;
		onFilterToggleAddMenu: () => void;
		onFilterAddField: (fieldId: string) => void;
		onGridInit: (api: IApi) => void;
	};

	let {
		filteredRowCount,
		pagedRowsVm,
		filterValue,
		filterFields,
		filterHasAnyRule,
		filterIsReady,
		filterAddMenuOpen,
		filterAddableFieldOptions,
		filterOptions,
		gridColumns,
		gridSizes,
		gridAutoRowHeight,
		gridCellStyle,
		gridHostEl = $bindable(null),
		gridPage = $bindable(1),
		gridPageSize = $bindable(25),
		onFilterInit,
		onFilterChange,
		onFilterToggleAddMenu,
		onFilterAddField,
		onGridInit
	}: Props = $props();

	let gridApi = $state<IApi | undefined>(undefined);

	const bodyAutoHeight = $derived(filteredRowCount <= 80);
</script>

<p class="mt-4 text-sm text-base-content/70">
	To add a channel to a group, open its menu and select
	<span class="font-medium text-base-content">Move / add to group</span>.
</p>

<div class="mt-3 rounded-xl border border-base-300 bg-base-100 shadow-sm">
	<div class="border-b border-base-300 px-3 py-3">
		{#if filterHasAnyRule}
			<p class="mb-2 text-xs font-medium tracking-wide text-base-content/70 uppercase">
				Filters
			</p>
		{/if}
		<div class="flex min-w-0 items-end justify-end gap-2">
			<div
				class="channels-filter-builder min-h-0 min-w-0 flex-1 justify-end overflow-y-visible"
				class:channels-filter-builder--empty={!filterHasAnyRule}
				class:overflow-x-auto={filterHasAnyRule}
			>
				<FilterWillow fonts={false}>
					<FilterBuilder
						value={filterValue}
						fields={filterFields}
						options={filterOptions}
						type="line"
						init={onFilterInit}
						onchange={onFilterChange}
					/>
				</FilterWillow>
			</div>
			<div class="relative shrink-0">
				<Button
					type="button"
					variant="secondary"
					class="h-9 gap-2 whitespace-nowrap"
					onclick={onFilterToggleAddMenu}
					disabled={!filterAddableFieldOptions.length || !filterIsReady}
				>
					<AbstractIcon name={icons.ListFilterPlus.name} class="size-4 shrink-0" width="16" height="16" />
					Add filters
					<AbstractIcon name={icons.ChevronDown.name} class="size-4 shrink-0 opacity-80" width="16" height="16" />
				</Button>
				{#if filterAddMenuOpen}
					<div
						class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-lg"
					>
						{#each filterAddableFieldOptions as opt (opt.id)}
							<button
								type="button"
								class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-base-content hover:bg-base-200"
								onclick={() => onFilterAddField(opt.id)}
							>
								<span class="truncate">{opt.label}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div
		class="svar-grid-host--fit-content min-h-[200px] min-w-0 w-full overflow-x-auto {bodyAutoHeight
			? 'svar-grid-host--body-auto-height'
			: ''}"
		bind:this={gridHostEl}
	>
		<Willow fonts={false}>
			<Tooltip api={gridApi}>
				<Grid
					data={pagedRowsVm}
					columns={gridColumns}
					sizes={gridSizes}
					autoRowHeight={gridAutoRowHeight}
					cellStyle={gridCellStyle}
					select={false}
					header={true}
					init={(api: IApi) => {
						gridApi = api;
						onGridInit(api);
					}}
				/>
			</Tooltip>
		</Willow>
	</div>

	<div class="channels-grid-pager border-t border-base-300 px-3 py-2">
		<CoreWillow fonts={false}>
			<Pager total={filteredRowCount} bind:pageSize={gridPageSize} bind:value={gridPage} />
		</CoreWillow>
	</div>
</div>

<style>
	:global(.svar-grid-host--fit-content .wx-area),
	:global(.svar-grid-host--fit-content .wx-grid) {
		height: auto;
	}

	:global(.svar-grid-host--fit-content .wx-table-box) {
		height: auto;
		overflow: visible;
	}

	:global(.svar-grid-host--fit-content .wx-scroll) {
		flex: none;
		overflow-x: auto !important;
		overflow-y: visible !important;
	}

	:global(.svar-grid-host--body-auto-height .wx-body) {
		height: auto !important;
		overflow: visible;
	}

	:global(.wx-grid .wx-row.wx-autoheight .wx-cell) {
		align-items: flex-start;
		padding-block: 0.35rem;
	}

	.svar-grid-host--fit-content :global(.wx-willow-theme),
	.svar-grid-host--fit-content :global(.wx-willow-dark-theme) {
		--wx-color-font: var(--color-base-content);
		--wx-background: var(--color-base-100);
		--wx-background-alt: var(--color-base-200);
		--wx-border: 1px solid color-mix(in oklab, var(--color-base-content) 14%, transparent);
		--wx-table-border: var(--wx-border);
		--wx-table-header-border: var(--wx-border);
		--wx-table-header-cell-border: var(--wx-border);
		--wx-table-footer-cell-border: var(--wx-border);
		--wx-table-cell-border: var(--wx-border);
		--wx-table-header-background: color-mix(in oklab, var(--color-base-content) 12%, var(--color-base-100));
		--wx-table-select-background: color-mix(in oklab, var(--color-primary) 22%, var(--color-base-100));
		--wx-table-select-focus-background: color-mix(in oklab, var(--color-primary) 28%, var(--color-base-100));
		--wx-table-select-color: var(--color-base-content);
		--wx-table-select-border: inset 3px 0 var(--color-primary);
		--wx-table-fixed-column-right-border: 3px solid
			color-mix(in oklab, var(--color-base-content) 14%, transparent);
		--wx-table-editor-dropdown-border: var(--wx-border);
		--wx-table-editor-dropdown-shadow: 0 10px 30px
			color-mix(in oklab, var(--color-base-content) 18%, transparent);
	}

	.channels-filter-builder :global(.wx-willow-theme),
	.channels-filter-builder :global(.wx-willow-dark-theme) {
		--wx-filter-or-background: var(--color-primary);
		--wx-filter-or-font-color: var(--color-primary-content);
		--wx-filter-and-background: var(--color-accent);
		--wx-filter-and-font-color: var(--color-accent-content);
	}

	.channels-filter-builder {
		display: flex;
		justify-content: flex-end;
	}

	.channels-filter-builder :global(.wx-group.wx-line) {
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	.channels-filter-builder--empty {
		flex: 0 0 0;
		width: 0;
		max-width: 0;
		min-height: 0;
		max-height: 0;
		overflow: visible;
		opacity: 0;
		pointer-events: none;
	}

	.channels-filter-builder--empty :global(.wx-rule) {
		pointer-events: auto;
	}

	.channels-filter-builder--empty :global(.wx-group.wx-line),
	.channels-filter-builder--empty :global(.wx-willow-theme) {
		background: transparent;
		padding: 0;
	}

	.channels-filter-builder :global(.wx-toolbar.wx-line .wx-button) {
		display: none;
	}

	.channels-filter-builder :global(.wx-rule .wx-menu-icon) {
		opacity: 1;
		background: var(--color-base-100);
		color: var(--color-base-content);
		border: 1px solid color-mix(in oklab, var(--color-base-content) 14%, transparent);
		box-shadow: 0 1px 0 color-mix(in oklab, var(--color-base-content) 10%, transparent);
		font-style: normal;
	}

	.channels-filter-builder :global(.wx-rule .wx-menu-icon::before) {
		content: '⋮';
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 16px;
		line-height: 1;
	}

	.channels-grid-pager :global(.wx-willow-theme),
	.channels-grid-pager :global(.wx-willow-dark-theme) {
		--wx-color-font: var(--color-base-content);
		--wx-color-font-alt: color-mix(in oklab, var(--color-base-content) 62%, transparent);
		--wx-color-font-disabled: color-mix(in oklab, var(--color-base-content) 38%, transparent);
		--wx-color-link: var(--color-primary);
		--wx-background: transparent;
		--wx-background-alt: var(--color-base-200);
		--wx-background-hover: color-mix(in oklab, var(--color-base-content) 8%, var(--color-base-200));
		--wx-border: 1px solid color-mix(in oklab, var(--color-base-content) 14%, transparent);
		--wx-icon-color: color-mix(in oklab, var(--color-base-content) 72%, transparent);
		--wx-input-font-color: var(--color-base-content);
		--wx-input-background: var(--color-base-100);
		--wx-input-border: 1px solid color-mix(in oklab, var(--color-base-content) 18%, transparent);
		--wx-input-border-focus: 1px solid var(--color-primary);
		--wx-input-placeholder-color: color-mix(in oklab, var(--color-base-content) 50%, transparent);
		height: auto !important;
		background: transparent;
	}

	.channels-grid-pager :global(.wx-pager) {
		padding: 0;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: var(--color-base-content);
	}

	.channels-grid-pager :global(.wx-pager .wx-left),
	.channels-grid-pager :global(.wx-pager .wx-center),
	.channels-grid-pager :global(.wx-pager .wx-right) {
		color: var(--color-base-content);
	}

	.channels-grid-pager :global(.wx-pager .wx-right) {
		color: color-mix(in oklab, var(--color-base-content) 68%, transparent);
	}

	.channels-grid-pager :global(.wx-pager input) {
		background: var(--color-base-100);
		border-color: color-mix(in oklab, var(--color-base-content) 18%, transparent);
		color: var(--color-base-content);
	}

	.channels-grid-pager :global(.wx-pager input:focus) {
		border-color: var(--color-primary);
	}

	.channels-grid-pager :global(.wx-pager .wx-icon) {
		color: var(--color-base-content);
	}

	.channels-grid-pager :global(.wx-pager .wx-icon:hover) {
		background-color: color-mix(in oklab, var(--color-base-content) 8%, var(--color-base-200));
	}

	.channels-grid-pager :global(.wx-pager .wx-icon.wx-disabled) {
		color: color-mix(in oklab, var(--color-base-content) 35%, transparent);
	}
</style>
