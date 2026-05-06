<script lang="ts">
	import type { IApi } from '@svar-ui/svelte-grid';
	import {
		type SetGridTableRowViewModel
	} from '$lib/sets/SetGridTable.presenter.svelte';

	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';
	import {
		getRootPathAccount,
		getRootPathCalendar,
		protectedTemplatesPagePresenter
	} from '$lib/area-protected';
	import { createSetGridTableFilter } from '$lib/sets';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { setsGridActionsKey } from '$lib/ui/components/sets/setsGridContext';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { FilterBuilder, Willow as FilterWillow } from '@svar-ui/svelte-filter';
	import { Willow, Grid, Tooltip } from '@svar-ui/svelte-grid';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	// /account/calendar
	const rootPathCalendar = getRootPathCalendar();
	const calendarPath = route(`${rootPathAccount}/${rootPathCalendar}`);


	const pagePresenter = protectedTemplatesPagePresenter;
	const gridPresenter = pagePresenter.setGridTable;
	const filterPresenter = pagePresenter.setGridFilterBuilder;

	/** Stable ref for composer `bind:` chain (`pagePresenter.createSocialPostPresenter`). */
	let createSocialPostModalPresenter = $state.raw(pagePresenter.createSocialPostPresenter);

	function readViewportWidthPx(): number {
		if (!browser || typeof window === 'undefined') return 0;
		const inner = window.innerWidth;
		const vv = window.visualViewport?.width;
		return Math.floor(Math.min(inner, vv != null && vv > 0 ? vv : inner));
	}

	let composeOpen = $state(false);
	/** Grid API for SVAR `Tooltip` (wired via `init`, not `bind:this`). */
	let setsGridApi = $state<IApi | undefined>(undefined);
	/** Layout host width from ResizeObserver (can inflate to column min-content without `min-w-0` on ancestors). */
	let setsGridHostEl = $state<HTMLDivElement | null>(null);
	let gridHostWidthPx = $state(0);
	/** Live viewport width — caps host width so breakpoints match what the user actually sees. */
	let windowWidthPx = $state(0);

	$effect.pre(() => {
		if (!browser) return;
		windowWidthPx = readViewportWidthPx();
	});

	$effect(() => {
		if (!browser) return;
		const update = () => {
			windowWidthPx = readViewportWidthPx();
		};
		window.addEventListener('resize', update);
		window.visualViewport?.addEventListener('resize', update);
		return () => {
			window.removeEventListener('resize', update);
			window.visualViewport?.removeEventListener('resize', update);
		};
	});

	$effect(() => {
		if (!browser) return;
		const el = setsGridHostEl;
		if (!el) {
			gridHostWidthPx = 0;
			return;
		}
		let raf = 0;
		const commit = () => {
			raf = 0;
			const next = Math.round(el.getBoundingClientRect().width);
			if (gridHostWidthPx === 0 || Math.abs(next - gridHostWidthPx) >= 6) {
				gridHostWidthPx = next;
			}
		};
		const schedule = () => {
			if (raf) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(commit);
		};
		schedule();
		const ro = new ResizeObserver(schedule);
		ro.observe(el);
		return () => {
			ro.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	});

	/**
	 * Viewport width for **which column set** to show. Using the viewport avoids a feedback loop during
	 * resize: the host `getBoundingClientRect` can track the table’s intrinsic width, so `min(host, vw)`
	 * flickers and `{#key …}` remounts reset horizontal scroll (snap-back / “repeating” columns).
	 */
	const layoutTierWidthPx = $derived.by(() => {
		if (!browser) return 0;
		return windowWidthPx > 0 ? windowWidthPx : readViewportWidthPx();
	});

	/**
	 * Width basis for compact column math. For `<=640px` use **viewport only**: pairing `min(host, vw)`
	 * with `autoRowHeight` made the host height ↔ ResizeObserver ↔ column widths feedback and visible shake.
	 */
	const compactLayoutWidthPx = $derived.by(() => {
		if (!browser) return 0;
		const vw = layoutTierWidthPx;
		if (vw <= 0) return 0;
		if (vw <= 640) return vw;
		const host = gridHostWidthPx;
		if (host > 0) return Math.floor(Math.min(host, vw));
		return vw;
	});

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	const setsGridRowsVm = $derived(gridPresenter.setsGridRowsVm);
	const loading = $derived(gridPresenter.loading);

	/**
	 * Subscribes to dashboard channel rows so Auto-replies column tooltips stay in sync after loads.
	 */
	const setsGridColumnsForHost = $derived.by(() => {
		void pagePresenter.connectedChannelsVm;
		return gridPresenter.getSetsGridColumnsForViewport(
			layoutTierWidthPx,
			compactLayoutWidthPx,
			browser
		);
	});

	const setsGridSizesForHost = $derived.by(() => {
		return gridPresenter.getSetsGridSizesForViewport(layoutTierWidthPx, browser);
	});

	const setsGridCellStyle = $derived.by(() => {
		return gridPresenter.setsGridCellStyle;
	});

	const setsGridFilterBuilderOptions = $derived.by(() => filterPresenter.buildOptions(setsGridRowsVm));

	const handleRefreshSetsTable = async (): Promise<void> => {
		return pagePresenter.refreshSetsTable();
	};

	setContext(setsGridActionsKey, {
		openEdit: (vm: SetGridTableRowViewModel) => {
			const opened = pagePresenter.openEditSet(vm);
			if (!opened.ok) {
				toast.error(opened.error);
				return;
			}
			composeOpen = true;
		},
		remove: async (vm: SetGridTableRowViewModel) => {
			const ok = confirm(`Delete set "${vm.name}"?`);
			if (!ok) return;
			const resultVm = await pagePresenter.deleteSet(vm);
			if (resultVm.ok) toast.success('Set deleted');
			else toast.error(resultVm.error);
		}
	});

	$effect(() => {
		void workspaceId;
		composeOpen = false;
		filterPresenter.reset();
		void pagePresenter.syncWorkspace();
	});

	/** Debounced autosize so resize / column changes do not spam SVAR `resize-column` (fights scroll). */
	$effect(() => {
		void setsGridRowsVm;
		void setsGridApi;
		void layoutTierWidthPx;
		const api = setsGridApi;
		if (!api) return;
		const id = setTimeout(() => {
			void gridPresenter.autosizeSetsGridColumns(api, layoutTierWidthPx);
		}, 120);
		return () => clearTimeout(id);
	});

	/** Re-apply FilterBuilder predicate after grid API wiring or row reload (mirrors SVAR FilterBuilder demos). */
	$effect(() => {
		void setsGridRowsVm;
		void filterPresenter.value;
		const api = setsGridApi;
		if (!api) return;
		api.exec('filter-rows', { filter: createSetGridTableFilter(filterPresenter.value) });
	});
</script>

<svelte:head>
	<title>
		Reusable Templates Content Sets — OpenQuok
	</title>
</svelte:head>

<div class="mx-auto max-w-6xl min-w-0 px-4 py-8">
	<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
		<div class="flex flex-wrap items-center gap-3">
			<div>
				<div class="flex items-center gap-3">
					<AbstractIcon
						name={icons.LayoutTemplate.name}
						class="text-primary size-8 shrink-0"
						width="32"
						height="32"
					/>
					<h1 class="text-2xl font-semibold tracking-tight text-base-content">
						Reusable Templates Content Sets
					</h1>
				</div>
				<p class="mt-2 text-base-content/80">
					Manage reusable combinations of social channels and draft content/reply set for faster scheduling.
				</p>
			</div>
		</div>
		{#if workspaceId}
			<div class="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant="primary"
					onclick={() => {
						pagePresenter.openNewSet();
						composeOpen = true;
					}}
				>
					<AbstractIcon name={icons.Plus.name} class="mr-2 size-4 shrink-0" width="16" height="16" />
					Add a Template
				</Button>
				<div class="relative">
					<Button
						type="button"
						variant="secondary"
						class="h-9 gap-2 whitespace-nowrap"
						onclick={() => {
							filterPresenter.toggleAddFilterMenu();
						}}
						disabled={!filterPresenter.addableFieldOptions.length || !filterPresenter.isReady}
					>
						<AbstractIcon name={icons.ListFilterPlus.name} class="size-4 shrink-0" width="16" height="16" />
						Add filters
						<AbstractIcon name={icons.ChevronDown.name} class="size-4 shrink-0 opacity-80" width="16" height="16" />
					</Button>
					{#if filterPresenter.addFilterMenuOpen}
						<div
							class="border-base-300 bg-base-100 absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border shadow-lg"
						>
							{#each filterPresenter.addableFieldOptions as opt (opt.id)}
								<button
									type="button"
									class="hover:bg-base-200 flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-base-content"
									onclick={() => filterPresenter.addFilterForField(opt.id)}
								>
									<span class="truncate">{opt.label}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
				<Button
					variant="outline"
					href={calendarPath}
					class="gap-2"
				>
					<AbstractIcon name={icons.CalendarClock.name} class="size-4 shrink-0" width="16" height="16" />
					Open calendar to schedule posts
				</Button>
			</div>
		{/if}
	</div>

	{#if loading}
		<p class="text-base-content/60 text-sm">
			Loading…</p>
	{:else if !workspaceId}
		<p class="text-base-content/60 text-sm">
			Select a workspace to manage templates.
		</p>
	{:else}
		<div class="border-base-300 bg-base-100 min-w-0 rounded-xl border shadow-sm">
			{#if filterPresenter.hasAnyRule}
				<div class="border-base-300 border-b px-3 py-3">
					<p class="text-base-content/70 mb-2 text-xs font-medium tracking-wide uppercase">
						Filters
					</p>
					<div class="sets-filter-builder min-w-0 overflow-x-auto">
						<FilterWillow fonts={false}>
							<FilterBuilder
								value={filterPresenter.value}
								fields={filterPresenter.fields}
								options={setsGridFilterBuilderOptions}
								type="line"
								init={(api: unknown) => {
									filterPresenter.initFilterBuilderApi(api);
								}}
								onchange={(ev: { value: { glue: 'and' | 'or'; rules: unknown[] } }) =>
									filterPresenter.applyChange(ev)}
							/>
						</FilterWillow>
					</div>
				</div>
			{:else}
				<!-- Keep FilterBuilder mounted (for API + filtering) but hide the empty white “Filters” trap. -->
				<div class="sr-only">
					<FilterWillow fonts={false}>
						<FilterBuilder
							value={filterPresenter.value}
							fields={filterPresenter.fields}
							options={setsGridFilterBuilderOptions}
							type="line"
							init={(api: unknown) => {
								filterPresenter.initFilterBuilderApi(api);
							}}
							onchange={(ev: { value: { glue: 'and' | 'or'; rules: unknown[] } }) =>
								filterPresenter.applyChange(ev)}
						/>
					</FilterWillow>
				</div>
			{/if}
			<div
				class="svar-grid-host--fit-content svar-grid-host--body-auto-height border-base-300 min-h-[200px] min-w-0 w-full max-w-full border-b"
				bind:this={setsGridHostEl}
			>
				<Willow fonts={false}>
					<Tooltip api={setsGridApi}>
						<Grid
							data={setsGridRowsVm}
							columns={setsGridColumnsForHost}
							sizes={setsGridSizesForHost}
							autoRowHeight={true}
							cellStyle={setsGridCellStyle}
							select={false}
							header={true}
							init={(api: IApi) => {
								setsGridApi = api;
							}}
						/>
					</Tooltip>
				</Willow>
			</div>
			{#if !setsGridRowsVm.length}
				<p class="text-base-content/60 p-6 text-sm">
					No templates yet. Use <span class="text-base-content font-medium">Add a set</span> to create one.
				</p>
			{/if}
		</div>
	{/if}

	{#if !workspaceId}
		<Button class="mt-4" variant="outline" onclick={() => void goto(accountPath)}>
			Go to Dashboard
		</Button>
	{/if}
</div>

<CreateSocialPostModal
	bind:open={composeOpen}
	bind:presenter={createSocialPostModalPresenter}
	workspaceId={workspaceId}
	connectedChannels={pagePresenter.connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
	closeComposerAfterSaveSet={true}
	onContentSetSaved={handleRefreshSetsTable}
/>

<style>
	/*
	 * SVAR defaults (`wx-grid` / `wx-area` height 100%, `wx-scroll` flex:1) assume a fixed-height container
	 * (see SizeToContainer). Inside `overflow-auto` main without that height, `clientHeight` + `fullHeight`
	 * diverge and the last row can clip. Match SizeToContent by letting the grid measure from intrinsic height.
	 */
	:global(.svar-grid-host--fit-content .wx-area),
	:global(.svar-grid-host--fit-content .wx-grid) {
		height: auto;
	}

	:global(.svar-grid-host--fit-content .wx-table-box) {
		height: auto;
		/* Package default `overflow:hidden` clips when inline `fullHeight` lags `autoRowHeight` measurement */
		overflow: visible;
	}

	:global(.svar-grid-host--fit-content .wx-scroll) {
		flex: none;
		overflow-x: auto !important;
		overflow-y: visible !important;
	}

	/*
	 * Optional `wx-body { height:auto }` breaks SVAR virtual scroll for huge datasets — only combine with
	 * `svar-grid-host--body-auto-height` when row counts stay modest (templates grid below).
	 */
	:global(.svar-grid-host--body-auto-height .wx-body) {
		height: auto !important;
		overflow: visible;
	}

	/* Multiline rows (`autoRowHeight`): keep body text readable (Willow sample pattern) */
	:global(.wx-grid .wx-row.wx-autoheight .wx-cell) {
		align-items: flex-start;
		padding-block: 0.35rem;
	}

	/* Default SVAR tooltip: allow multiline channel / body text */
	:global(.wx-area .tooltip) {
		max-width: min(36rem, 92vw);
		white-space: pre-wrap;
		text-align: start;
	}

	/* Grid theme: bridge SVAR CSS vars to DaisyUI semantic tokens. */
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

	/* FilterBuilder: improve contrast + always-visible menu button (no hover hunting). */
	.sets-filter-builder :global(.wx-willow-theme),
	.sets-filter-builder :global(.wx-willow-dark-theme) {
		--wx-filter-or-background: var(--color-primary);
		--wx-filter-or-font-color: var(--color-primary-content);
		--wx-filter-and-background: var(--color-accent);
		--wx-filter-and-font-color: var(--color-accent-content);
	}

	/* “Simple” toolbar layout while keeping AND/OR glue controls (type="line" renders glue). */
	.sets-filter-builder :global(.wx-toolbar.wx-line) {
		justify-content: flex-start;
		gap: 12px;
		height: auto;
		padding: 0;
	}

	.sets-filter-builder :global(.wx-toolbar.wx-line .wx-button) {
		display: none;
	}

	.sets-filter-builder :global(.wx-toolbar.wx-line .wx-filters) {
		order: 1;
		flex: 1 1 auto;
		min-width: 0;
		padding-block: 2px;
	}

	/* Make rule chips + glue pill closer to demo’s compact look */
	.sets-filter-builder :global(.wx-rule.wx-line) {
		border-radius: 0.75rem;
		padding: 0.5rem 0.65rem;
	}

	.sets-filter-builder :global(.wx-glue) {
		border-radius: 9999px;
		padding-inline: 0.65rem;
	}

	.sets-filter-builder :global(.wx-rule) {
		background: var(--color-base-200);
		color: var(--color-base-content);
	}

	.sets-filter-builder :global(.wx-rule .wx-menu-icon) {
		opacity: 1;
		background: var(--color-base-100);
		color: var(--color-base-content);
		border: 1px solid color-mix(in oklab, var(--color-base-content) 14%, transparent);
		box-shadow: 0 1px 0 color-mix(in oklab, var(--color-base-content) 10%, transparent);
		font-style: normal;
	}

	/* Replace missing SVAR icon-font circle with a visible ellipsis glyph. */
	.sets-filter-builder :global(.wx-rule .wx-menu-icon::before) {
		content: '⋮';
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 16px;
		line-height: 1;
	}

	.sets-filter-builder :global(.wx-rule .wx-menu-icon:hover) {
		background: color-mix(in oklab, var(--color-base-content) 7%, var(--color-base-100));
	}
</style>
