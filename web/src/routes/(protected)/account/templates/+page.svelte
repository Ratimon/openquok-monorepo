<script lang="ts">
	import type { IApi, IColumn } from '@svar-ui/svelte-grid';
	import type { SetGridTableRowViewModel } from '$lib/sets/SetGrid.presenter.svelte';

	import { browser } from '$app/environment';
	import { setContext, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';
	import {
		getRootPathAccount,
		protectedTemplatesPagePresenter
	} from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { setsGridActionsKey } from '$lib/ui/components/sets/setsGridContext';
	import {
		buildSetsGridChannelsTooltipPlainText,
		buildSetsGridThreadsRepliesTooltipPlainText
	} from '$lib/sets/SetGrid.presenter.svelte';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { Willow, Grid, Tooltip } from '@svar-ui/svelte-grid';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import SetsGridActionsCell from '$lib/ui/components/sets/SetsGridActionsCell.svelte';
	import SetsGridChannelsCell from '$lib/ui/components/sets/SetsGridChannelsCell.svelte';
	import SetsGridTagsCell from '$lib/ui/components/sets/SetsGridTagsCell.svelte';

	const presenter = protectedTemplatesPagePresenter;

	/** Stable ref for composer `bind:` chain (templates presenter exposes presenter via a getter). */
	let createSocialPostModalPresenter = $state.raw(presenter.createSocialPostPresenter);

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

	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);
	const settingsSetsPath = route(`${rootPathAccount}/settings?section=sets`);

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	const setsGridRowsVm = $derived(presenter.setsGridRowsVm);
	const loading = $derived(presenter.loading);

	/**
	 * Columns measured with SVAR `resize-column` / `auto: "data"` (see
	 * [resize-column](https://docs.svar.dev/svelte/grid/api/actions/resize-column/) and
	 * [columns](https://docs.svar.dev/svelte/grid/api/properties/columns/)).
	 * `bodyPreview` is excluded so it can use `flexgrow` only (no `width`) and absorb leftover row width.
	 */
	const SETS_GRID_AUTOSIZE_COLUMN_IDS = [
		'name',
		'channelsSummary',
		'tagsSummary',
		'threadsSummary',
		'mediaSummary',
		'repeatSummary',
		'updatedDisplay'
	] as const;

	/**
	 * Absolute floors (px) after max(data, header) — e.g. date cells, channel avatars.
	 * Header labels use `resize-column` / `auto: "header"` so "Repeat", "Tags", etc. are not clipped.
	 */
	const SETS_GRID_COLUMN_MIN_WIDTH_PX: Partial<
		Record<(typeof SETS_GRID_AUTOSIZE_COLUMN_IDS)[number], number>
	> = {
		name: 168,
		channelsSummary: 96,
		tagsSummary: 120,
		threadsSummary: 118,
		mediaSummary: 88,
		repeatSummary: 88,
		updatedDisplay: 108
	};

	/** After autosize, cap Channels so avatars column does not steal width from Body / Actions */
	const SETS_GRID_CHANNELS_MAX_WIDTH_PX = 168;

	type SetsGridApiWithColumn = IApi & {
		getColumn: (id: string) => { width?: number; hidden?: boolean } | undefined;
	};

	function readColumnWidthPx(api: IApi, id: string): number {
		const col = (api as SetsGridApiWithColumn).getColumn(id);
		return typeof col?.width === 'number' ? col.width : 0;
	}

	function isSetsGridColumnHidden(api: IApi, id: string): boolean {
		return Boolean((api as SetsGridApiWithColumn).getColumn(id)?.hidden);
	}

	async function autosizeSetsGridColumns(api: IApi): Promise<void> {
		await tick();
		if (layoutTierWidthPx > 0 && layoutTierWidthPx <= 640) {
			return;
		}

		const dataW: Record<string, number> = {};

		const narrowNameFlexLayout = isSetsGridColumnHidden(api, 'channelsSummary');

		for (const id of SETS_GRID_AUTOSIZE_COLUMN_IDS) {
			if (isSetsGridColumnHidden(api, id)) continue;
			/* Narrow breakpoint: name uses flexgrow; fixed widths from autosize fight the layout */
			if (id === 'name' && narrowNameFlexLayout) continue;
			api.exec('resize-column', { id, auto: 'data', maxRows: 200 });
		}
		await tick();
		for (const id of SETS_GRID_AUTOSIZE_COLUMN_IDS) {
			dataW[id] = readColumnWidthPx(api, id);
		}

		for (const id of SETS_GRID_AUTOSIZE_COLUMN_IDS) {
			if (isSetsGridColumnHidden(api, id)) continue;
			if (id === 'name' && narrowNameFlexLayout) continue;
			api.exec('resize-column', { id, auto: 'header' });
		}
		await tick();
		for (const id of SETS_GRID_AUTOSIZE_COLUMN_IDS) {
			if (isSetsGridColumnHidden(api, id)) continue;
			if (id === 'name' && narrowNameFlexLayout) continue;
			const w = Math.max(dataW[id] ?? 0, readColumnWidthPx(api, id));
			if (w > 0) api.exec('resize-column', { id, width: w });
		}

		await tick();
		for (const id of SETS_GRID_AUTOSIZE_COLUMN_IDS) {
			if (isSetsGridColumnHidden(api, id)) continue;
			if (id === 'name' && narrowNameFlexLayout) continue;
			const min = SETS_GRID_COLUMN_MIN_WIDTH_PX[id];
			if (min == null) continue;
			const w = readColumnWidthPx(api, id);
			if (w < min) api.exec('resize-column', { id, width: min });
		}

		await tick();
		if (!isSetsGridColumnHidden(api, 'channelsSummary')) {
			const wch = readColumnWidthPx(api, 'channelsSummary');
			if (wch > SETS_GRID_CHANNELS_MAX_WIDTH_PX) {
				api.exec('resize-column', { id: 'channelsSummary', width: SETS_GRID_CHANNELS_MAX_WIDTH_PX });
			}
		}
	}

	/** Body preview wraps when `autoRowHeight` is on — https://docs.svar.dev/svelte/grid/samples/#/multiline-row/willow */
	function setsGridCellStyle(_row: unknown, column: IColumn): string {
		if (column.id === 'bodyPreview') {
			return 'white-space:normal;word-break:break-word;overflow-wrap:anywhere;';
		}
		return '';
	}

	function setsGridRowVm(row: unknown): SetGridTableRowViewModel {
		return row as SetGridTableRowViewModel;
	}

	function setsGridTagsTooltip(row: unknown): string {
		const vm = setsGridRowVm(row);
		if (vm.tagsDisplay.length) return vm.tagsDisplay.map((t) => t.name).join(', ');
		return vm.tagsSummary;
	}

	/** Which optional columns are visible (used for default + SVAR `responsive`). */
	type TemplatesGridColVis = {
		channels: boolean;
		bodyPreview: boolean;
		tags: boolean;
		threads: boolean;
		media: boolean;
		repeat: boolean;
		updated: boolean;
		/** Name + actions only; actions column has a visible header */
		compact: boolean;
		/**
		 * When `compact`, fixed **Name** width in px (no `flexgrow`). Otherwise SVAR gives the row a large
		 * `contentWidth` and the flex name cell grows to match — pushing Actions off-screen.
		 */
		compactNameWidthPx?: number;
		/**
		 * With `flexgrow`, SVAR still needs a `width` so cells get a real min-width (header + text render).
		 * Full grid (~`max-w-6xl`): ~200px; mid-width tier (fewer cols): ~260px.
		 */
		bodyPreviewMinWidthPx?: number;
		/**
		 * When false, Body preview is a **fixed-width** column (uses `bodyPreviewMinWidthPx` as width) so
		 * text wraps vertically with `autoRowHeight` instead of stretching across the row.
		 */
		bodyPreviewFlexGrow?: boolean;
		/** Fixed Channels width in compact tier (avatars + tooltip for detail) */
		compactChannelsWidthPx?: number;
		/** Slightly narrower Actions column on very small layouts */
		compactActionsWidthPx?: number;
	};

	function templatesGridColumns(vis: TemplatesGridColVis) {
		return [
			{
				id: 'name',
				header: 'Name',
				tooltip: false,
				...(vis.compact && vis.compactNameWidthPx != null
					? { width: vis.compactNameWidthPx }
					: {})
			},
			{
				id: 'channelsSummary',
				header: 'Channels',
				hidden: !vis.channels,
				...(vis.channels
					? vis.compact && vis.compactChannelsWidthPx != null
						? { width: vis.compactChannelsWidthPx }
						: { flexgrow: 1, width: 96 }
					: {}),
				cell: SetsGridChannelsCell,
				tooltip: (row: unknown) => buildSetsGridChannelsTooltipPlainText(setsGridRowVm(row))
			},
			{
				id: 'bodyPreview',
				header: 'Body preview',
				hidden: !vis.bodyPreview,
				...(vis.bodyPreview
					? vis.bodyPreviewFlexGrow === false
						? {
								width: vis.bodyPreviewMinWidthPx ?? 200,
								tooltip: (row: unknown) => setsGridRowVm(row).bodyPreviewTooltip
							}
						: {
								flexgrow: 1,
								width: vis.bodyPreviewMinWidthPx ?? 200,
								tooltip: (row: unknown) => setsGridRowVm(row).bodyPreviewTooltip
							}
					: { tooltip: false })
			},
			{
				id: 'tagsSummary',
				header: 'Tags',
				tooltip: (row: unknown) => setsGridTagsTooltip(row),
				hidden: !vis.tags,
				cell: SetsGridTagsCell
			},
			{
				id: 'threadsSummary',
				header: 'Auto-replies',
				tooltip: (row: unknown) =>
					buildSetsGridThreadsRepliesTooltipPlainText(setsGridRowVm(row), presenter.connectedChannelsVm),
				hidden: !vis.threads
			},
			{ id: 'mediaSummary', header: 'Media', tooltip: false, hidden: !vis.media },
			{ id: 'repeatSummary', header: 'Repeat', tooltip: false, hidden: !vis.repeat },
			{ id: 'updatedDisplay', header: 'Updated', tooltip: false, hidden: !vis.updated },
			{
				id: 'actions',
				header: 'Actions',
				width: vis.compactActionsWidthPx ?? 168,
				cell: SetsGridActionsCell,
				tooltip: false
			}
		];
	}

	const setsGridColumnsAll: TemplatesGridColVis = {
		channels: true,
		bodyPreview: true,
		bodyPreviewMinWidthPx: 176,
		tags: true,
		threads: true,
		media: true,
		repeat: true,
		updated: true,
		compact: false
	};

	const setsGridColumns = templatesGridColumns(setsGridColumnsAll);

	/**
	 * Column sets from **viewport** width (`layoutTierWidthPx`) so layout does not chase the table’s
	 * intrinsic width during resize. Compact **Name** width uses `compactLayoutWidthPx` (viewport-only
	 * when ≤640px to avoid `autoRowHeight` ↔ host resize feedback; `min(host, vw)` above that).
	 * See Willow responsive ideas: https://docs.svar.dev/svelte/grid/samples/#/responsive-mode/willow
	 */
	const setsGridColumnsForHost = $derived.by(() => {
		const w = layoutTierWidthPx;
		if (!browser || w <= 0) return setsGridColumns;
		if (w <= 640) {
			const cw = compactLayoutWidthPx > 0 ? compactLayoutWidthPx : w;
			const compactActionPx = 140;
			const compactChannelsPx = 76;
			const compactGutterPx = 20;
			const reserved = compactActionPx + compactChannelsPx + compactGutterPx;
			const nameW = Math.max(64, Math.min(132, Math.floor((cw - reserved) * 0.36)));
			const bodyColW = Math.max(72, cw - reserved - nameW);
			return templatesGridColumns({
				channels: true,
				bodyPreview: true,
				bodyPreviewMinWidthPx: bodyColW,
				bodyPreviewFlexGrow: false,
				tags: false,
				threads: false,
				media: false,
				repeat: false,
				updated: false,
				compact: true,
				compactNameWidthPx: nameW,
				compactChannelsWidthPx: compactChannelsPx,
				compactActionsWidthPx: compactActionPx
			});
		}
		if (w <= 1024) {
			const bodyMidW = Math.max(140, Math.min(240, Math.floor(w - 420)));
			return templatesGridColumns({
				channels: true,
				bodyPreview: true,
				bodyPreviewMinWidthPx: bodyMidW,
				bodyPreviewFlexGrow: false,
				tags: false,
				threads: false,
				media: false,
				repeat: false,
				updated: false,
				compact: false
			});
		}
		if (w <= 1100) {
			const body1100W = Math.max(160, Math.min(220, Math.floor(w - 480)));
			return templatesGridColumns({
				channels: true,
				bodyPreview: true,
				bodyPreviewMinWidthPx: body1100W,
				bodyPreviewFlexGrow: false,
				tags: false,
				threads: true,
				media: false,
				repeat: false,
				updated: true,
				compact: false
			});
		}
		return setsGridColumns;
	});

	const setsGridSizesForHost = $derived.by(() => {
		if (!browser || layoutTierWidthPx <= 0) return { rowHeight: 40, headerHeight: 38 };
		if (layoutTierWidthPx <= 640) return { rowHeight: 48, headerHeight: 42 };
		if (layoutTierWidthPx <= 1100) return { rowHeight: 44, headerHeight: 40 };
		return { rowHeight: 40, headerHeight: 38 };
	});

	setContext(setsGridActionsKey, {
		openEdit: (vm: SetGridTableRowViewModel) => {
			const opened = presenter.openEditSet(vm);
			if (!opened.ok) {
				toast.error(opened.error);
				return;
			}
			composeOpen = true;
		},
		remove: async (vm: SetGridTableRowViewModel) => {
			const ok = confirm(`Delete set "${vm.name}"?`);
			if (!ok) return;
			const resultVm = await presenter.deleteSet(vm);
			if (resultVm.ok) toast.success('Set deleted');
			else toast.error(resultVm.error);
		}
	});

	$effect(() => {
		void workspaceId;
		composeOpen = false;
		void presenter.syncWorkspace();
	});

	/** Debounced autosize so resize / column changes do not spam SVAR `resize-column` (fights scroll). */
	$effect(() => {
		void setsGridRowsVm;
		void setsGridApi;
		void layoutTierWidthPx;
		const api = setsGridApi;
		if (!api) return;
		const id = setTimeout(() => {
			void autosizeSetsGridColumns(api);
		}, 120);
		return () => clearTimeout(id);
	});
</script>

<svelte:head>
	<title>
		Templates (sets) — OpenQuok
	</title>
</svelte:head>

<div class="mx-auto max-w-6xl min-w-0 px-4 py-8">
	<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
		<div class="flex flex-wrap items-center gap-3">
			<AbstractIcon name={icons.LayoutTemplate.name} class="text-primary size-8" width="32" height="32" />
			<div>
				<h1 class="text-base-content text-2xl font-semibold tracking-tight">
					Templates (sets)
				</h1>
				<p class="text-base-content/65 text-sm">
					Reusable channel selections and draft content, parsed from each set’s stored <span class="font-mono text-xs">content</span> JSON.
					Quick edits also live under
					<a href={settingsSetsPath} class="link link-primary font-medium">Settings → Sets</a>.
				</p>
			</div>
		</div>
		{#if workspaceId}
			<div class="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant="primary"
					onclick={() => {
						presenter.openNewSet();
						composeOpen = true;
					}}
				>
					Add a set
				</Button>
			</div>
		{/if}
	</div>

	{#if loading}
		<p class="text-base-content/60 text-sm">
			Loading…</p>
	{:else if !workspaceId}
		<p class="text-base-content/60 text-sm">
			Select a workspace to manage sets.</p>
	{:else}
		<div class="border-base-300 bg-base-100 min-w-0 rounded-xl border shadow-sm">
			<div
				class="border-base-300 min-h-[200px] min-w-0 w-full max-w-full border-b"
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
					No sets yet. Use <span class="text-base-content font-medium">Add a set</span> to create one, or open
					<a href={settingsSetsPath} class="link link-primary">Settings → Sets</a>.
				</p>
			{/if}
		</div>
	{/if}

	{#if !workspaceId}
		<Button class="mt-4" variant="outline" onclick={() => void goto(accountPath)}>
			Go to Dashboard</Button>
	{/if}
</div>

<CreateSocialPostModal
	bind:open={composeOpen}
	bind:presenter={createSocialPostModalPresenter}
	workspaceId={workspaceId}
	connectedChannels={presenter.connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
	closeComposerAfterSaveSet={true}
	onContentSetSaved={() => void presenter.refreshSetsTable()}
/>

<style>
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
</style>
