<script lang="ts">
	import type { IApi } from '@svar-ui/svelte-grid';
	import type { SetGridTableRowViewModel } from '$lib/sets/SetGrid.presenter.svelte';

	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';
	import {
		getRootPathAccount,
		protectedTemplatesPagePresenter
	} from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { setsGridActionsKey } from '$lib/ui/components/sets/setsGridContext';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { Willow, Grid, Tooltip } from '@svar-ui/svelte-grid';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';

	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);
	const settingsSetsPath = route(`${rootPathAccount}/settings?section=sets`);

	const pagePresenter = protectedTemplatesPagePresenter;
	const gridPresenter = pagePresenter.setGridPresenter;

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
						pagePresenter.openNewSet();
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
							cellStyle={gridPresenter.setsGridCellStyle}
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
	connectedChannels={pagePresenter.connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
	closeComposerAfterSaveSet={true}
	onContentSetSaved={() => void pagePresenter.refreshSetsTable()}
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
