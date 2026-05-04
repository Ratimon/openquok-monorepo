<script lang="ts">
	import type { IApi, IColumn } from '@svar-ui/svelte-grid';
	import type {
		GlobalPlugCatalogEntryProgrammerModel,
		IntegrationPlugRowProgrammerModel
	} from '$lib/plugs/Plug.repository.svelte';
	import type { PlugRuleTableRowViewModel } from '$lib/plugs/GetPlug.presenter.svelte';

	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';
	import {
		getRootPathAccount,
		getRootPathCalendar,
		protectedPlugsPagePresenter
	} from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { plugsGridActionsKey } from '$lib/ui/components/plugs/plugsGridContext';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { Willow, Grid, Tooltip } from '@svar-ui/svelte-grid';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AddPlugRuleModal from '$lib/ui/components/plugs/AddPlugRuleModal.svelte';
	import EditPlugModal from '$lib/ui/components/plugs/EditPlugModal.svelte';
	import RemovePlugRuleModal from '$lib/ui/components/plugs/RemovePlugRuleModal.svelte';
	import PlugsGridAccountCell from '$lib/ui/components/plugs/PlugsGridAccountCell.svelte';
	import PlugsGridActiveCell from '$lib/ui/components/plugs/PlugsGridActiveCell.svelte';
	import PlugsGridActionsCell from '$lib/ui/components/plugs/PlugsGridActionsCell.svelte';

	const presenter = protectedPlugsPagePresenter;

	function readViewportWidthPx(): number {
		if (!browser || typeof window === 'undefined') return 0;
		const inner = window.innerWidth;
		const vv = window.visualViewport?.width;
		return Math.floor(Math.min(inner, vv != null && vv > 0 ? vv : inner));
	}

	let windowWidthPx = $state(0);
	let plugsGridApi = $state<IApi | undefined>(undefined);

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

	const layoutTierWidthPx = $derived.by(() => {
		if (!browser) return 0;
		return windowWidthPx > 0 ? windowWidthPx : readViewportWidthPx();
	});

	let plugsGridHostEl = $state<HTMLDivElement | null>(null);
	let plugsGridHostWidthPx = $state(0);

	$effect(() => {
		if (!browser) return;
		const el = plugsGridHostEl;
		if (!el) {
			plugsGridHostWidthPx = 0;
			return;
		}
		let raf = 0;
		const commit = () => {
			raf = 0;
			const next = Math.round(el.getBoundingClientRect().width);
			if (plugsGridHostWidthPx === 0 || Math.abs(next - plugsGridHostWidthPx) >= 6) {
				plugsGridHostWidthPx = next;
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
	 * Width basis for splitting columns: `min(host, vw)` above 640px so Message does not use viewport
	 * while the table lives inside `max-w-6xl` / sidebars (flexgrow was clipping Active / Actions).
	 * At ≤640px use viewport only (same idea as templates compact).
	 */
	const plugGridLayoutWidthPx = $derived.by(() => {
		if (!browser) return 0;
		const vw = layoutTierWidthPx;
		if (vw <= 0) return 0;
		if (vw <= 640) return vw;
		const host = plugsGridHostWidthPx;
		if (host > 0) return Math.min(vw, Math.floor(host));
		return vw;
	});

	function plugAccountTooltipPlainText(row: unknown): string {
		const r = row as PlugRuleTableRowViewModel;
		const parts = [r.channelName?.trim(), r.platformLabel?.trim()].filter(Boolean);
		return parts.join('\n');
	}

	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);
	const calendarPath = route(`${rootPathAccount}/${getRootPathCalendar()}`);

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	const plugRulesRowsVm = $derived(presenter.plugRulesRowsVm);
	const loading = $derived(presenter.loading);
	const supportedChannelsVm = $derived(presenter.supportedChannelsVm);
	const channelIndexForModal = $derived(presenter.channelIndexForModal);
	const catalogForModalChannelVm = $derived(presenter.catalogForModalChannelVm);
	const singleRuleEditorVm = $derived(presenter.singleRuleEditorVm);

	let removePlugRuleModalOpen = $state(false);
	let plugRulePendingRemoval = $state<PlugRuleTableRowViewModel | null>(null);
	let removePlugRuleBusy = $state(false);

	type PlugGridVis = {
		likes: boolean;
		accountWidth: number;
		likesWidthPx: number;
		messageFlexGrow: boolean;
		/** With `flexgrow`, SVAR still uses `width` as a sensible minimum. */
		messageWidthPx: number;
		actionsWidthPx: number;
		activeWidthPx: number;
		compact: boolean;
		accountHeader: string;
	};

	function buildPlugGridColumns(vis: PlugGridVis) {
		return [
			{
				id: 'channelAccount',
				header: vis.accountHeader,
				width: vis.accountWidth,
				cell: PlugsGridAccountCell,
				tooltip: (row: unknown) => plugAccountTooltipPlainText(row)
			},
			{
				id: 'likesToTriggerDisplay',
				header: '# of likes',
				width: vis.likesWidthPx,
				hidden: !vis.likes,
				tooltip: false
			},
			{
				id: 'messageDisplay',
				header: 'Message',
				tooltip: false,
				...(vis.messageFlexGrow ? { flexgrow: 1, width: vis.messageWidthPx } : { width: vis.messageWidthPx })
			},
			{
				id: 'active',
				header: 'Active',
				width: vis.activeWidthPx,
				cell: PlugsGridActiveCell,
				tooltip: false
			},
			{
				id: 'actions',
				header: vis.compact ? 'Actions' : '',
				width: vis.actionsWidthPx,
				cell: PlugsGridActionsCell,
				tooltip: false
			}
		];
	}

	const plugGridDefaultVis: PlugGridVis = {
		likes: true,
		accountWidth: 220,
		likesWidthPx: 118,
		messageFlexGrow: false,
		messageWidthPx: 320,
		actionsWidthPx: 152,
		activeWidthPx: 88,
		compact: false,
		accountHeader: 'Connected account'
	};

	const plugGridColumns = buildPlugGridColumns(plugGridDefaultVis);

	/**
	 * Viewport-based column sets (same idea as templates): avoids SVAR `responsive` fighting intrinsic
	 * width. Platform is shown in the account cell (avatar + badge + label), not a separate column.
	 */
	const plugGridColumnsForHost = $derived.by(() => {
		const w = layoutTierWidthPx;
		if (!browser || w <= 0) return plugGridColumns;

		if (w <= 640) {
			const cw = w;
			const activePx = 56;
			const actionsPx = 132;
			const accountPx = Math.max(88, Math.min(116, Math.floor(cw * 0.32)));
			const gutter = 16;
			const messageW = Math.max(72, cw - accountPx - activePx - actionsPx - gutter);
			return buildPlugGridColumns({
				likes: false,
				accountWidth: accountPx,
				likesWidthPx: 96,
				messageFlexGrow: false,
				messageWidthPx: messageW,
				actionsWidthPx: actionsPx,
				activeWidthPx: activePx,
				compact: true,
				accountHeader: 'Account'
			});
		}

		const basis = plugGridLayoutWidthPx > 0 ? plugGridLayoutWidthPx : w;

		if (w <= 1024) {
			const accountPx = Math.max(168, Math.min(208, Math.floor(w * 0.22)));
			const likesPx = Math.max(88, Math.min(112, Math.floor(w * 0.11)));
			const activePx = 88;
			const actionsPx = 144;
			const gutter = 28;
			const reserved = accountPx + likesPx + activePx + actionsPx + gutter;
			const messageW = Math.max(100, Math.floor(basis - reserved));
			return buildPlugGridColumns({
				likes: true,
				accountWidth: accountPx,
				likesWidthPx: likesPx,
				messageFlexGrow: false,
				messageWidthPx: messageW,
				actionsWidthPx: actionsPx,
				activeWidthPx: activePx,
				compact: false,
				accountHeader: 'Connected account'
			});
		}

		const accountPx = 220;
		const likesPx = 118;
		const activePx = 88;
		const actionsPx = 152;
		const gutter = 36;
		const reserved = accountPx + likesPx + activePx + actionsPx + gutter;
		const messageW = Math.max(120, Math.floor(basis - reserved));
		return buildPlugGridColumns({
			likes: true,
			accountWidth: accountPx,
			likesWidthPx: likesPx,
			messageFlexGrow: false,
			messageWidthPx: messageW,
			actionsWidthPx: actionsPx,
			activeWidthPx: activePx,
			compact: false,
			accountHeader: 'Connected account'
		});
	});

	const plugGridSizesForHost = $derived.by(() => {
		if (!browser || layoutTierWidthPx <= 0) return { rowHeight: 44, headerHeight: 40 };
		if (layoutTierWidthPx <= 640) return { rowHeight: 48, headerHeight: 42 };
		if (layoutTierWidthPx <= 1024) return { rowHeight: 44, headerHeight: 40 };
		return { rowHeight: 44, headerHeight: 40 };
	});

	const plugsGridAutoRowHeight = $derived(
		Boolean(browser && layoutTierWidthPx > 0 && layoutTierWidthPx <= 1024)
	);

	function plugsGridCellStyle(_row: unknown, column: IColumn): string {
		if (column.id === 'messageDisplay') {
			return 'white-space:normal;word-break:break-word;overflow-wrap:anywhere;';
		}
		return '';
	}

	setContext(plugsGridActionsKey, {
		toggleActive: async (vm: PlugRuleTableRowViewModel, on: boolean) => {
			const resultVm = await presenter.togglePlugActive(vm, on);
			if (resultVm.ok) toast.success(on ? 'Plug enabled' : 'Plug paused');
			else toast.error(resultVm.error);
		},
		openEdit: (vm: PlugRuleTableRowViewModel) => presenter.openSingleRuleEditor(vm),
		remove: (vm: PlugRuleTableRowViewModel) => {
			plugRulePendingRemoval = vm;
			removePlugRuleModalOpen = true;
		}
	});

	$effect(() => {
		if (!removePlugRuleModalOpen) {
			plugRulePendingRemoval = null;
			removePlugRuleBusy = false;
		}
	});

	$effect(() => {
		void workspaceId;
		void presenter.syncWorkspaceAndCatalog();
	});

	$effect(() => {
		void presenter.channelIndexForModal;
		presenter.pendingNewForMethod = null;
	});

	$effect(() => {
		if (!presenter.addPlugRuleModalOpen) presenter.pendingNewForMethod = null;
	});

	function fieldDefaults(def: GlobalPlugCatalogEntryProgrammerModel, rowId?: string): Record<string, string> {
		const rowPm = rowId
			? presenter.plugRulesRowsVm.find((r) => r.id === rowId)?.plugRowPm
			: undefined;
		return presenter.globalPlugSettingsPresenter.fieldDefaults(def, rowPm);
	}

	const handleAddPlugRuleModalOpenChange = (nextOpen: boolean): void => {
		presenter.addPlugRuleModalOpen = nextOpen;
	};

	const handlePlugAddModalChannelIndexChange = (index: number): void => {
		presenter.channelIndexForModal = index;
	};

	const handlePlugAddModalPendingNewForMethodChange = (method: string | null): void => {
		presenter.pendingNewForMethod = method;
	};

	function getPlugEditFieldDefaults(
		def: GlobalPlugCatalogEntryProgrammerModel,
		rowPm: IntegrationPlugRowProgrammerModel
	): Record<string, string> {
		return presenter.globalPlugSettingsPresenter.fieldDefaults(def, rowPm);
	}

	const handleClosePlugSingleRuleEditor = (): void => {
		presenter.closeSingleRuleEditor();
	};

	const handleSavePlugFromCatalog = async (
		def: GlobalPlugCatalogEntryProgrammerModel,
		values: Record<string, string>,
		plugId?: string
	): Promise<void> => {
		const resultVm = await presenter.savePlugFromCatalog({ def, values, ...(plugId ? { plugId } : {}) });
		if (resultVm.ok) toast.success(plugId ? 'Rule updated' : 'Rule saved');
		else toast.error(resultVm.error);
	};

	const handleSavePlugFromSingleEditor = async (
		def: GlobalPlugCatalogEntryProgrammerModel,
		values: Record<string, string>,
		plugId: string,
		integrationId: string
	): Promise<void> => {
		const resultVm = await presenter.savePlugFromSingleEditor({ def, values, plugId, integrationId });
		if (resultVm.ok) toast.success('Rule updated');
		else toast.error(resultVm.error);
	};

	const currentChannelForModalVm = $derived(supportedChannelsVm[channelIndexForModal] ?? null);

	const handleRemovePlugRuleModalCancel = (): void => {
		removePlugRuleModalOpen = false;
	};

	const handleConfirmRemovePlugRule = async (): Promise<void> => {
		const vm = plugRulePendingRemoval;
		if (!vm) return;
		removePlugRuleBusy = true;
		try {
			const resultVm = await presenter.deletePlugRow(vm);
			if (resultVm.ok) {
				toast.success('Rule removed');
				removePlugRuleModalOpen = false;
			} else {
				toast.error(resultVm.error);
			}
		} finally {
			removePlugRuleBusy = false;
		}
	};
</script>

<svelte:head>
	<title>
		Plugs — OpenQuok
	</title>
</svelte:head>

<div class="mx-auto max-w-6xl min-w-0 px-4 py-8">
	<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
		<div class="flex flex-wrap items-center gap-3">
			<AbstractIcon name={icons.Sparkles.name} class="size-8 text-primary" width="32" height="32" />
			<div>
				<h1 class="text-2xl font-semibold tracking-tight text-base-content">
					Auto Plugs
				</h1>
				<p class="text-sm text-base-content/65">
					Global Automation rules per connected channel (e.g. auto-reply when a Threads post reaches a certain number of likes).
					Auto replies (internal rule for the same social account) can also be set per post under Threads settings when scheduling.
				</p>
			</div>
		</div>
		{#if supportedChannelsVm.length}
			<div class="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant="primary"
					onclick={() => presenter.openAddPlugRuleModal(0)}
				>
					Add Global Rule
				</Button>

				<Button variant="secondary" href={calendarPath} class="gap-2">
					<AbstractIcon name={icons.CalendarClock.name} class="size-4 shrink-0" width="16" height="16" />
					Open calendar to configure internal rule
				</Button>
			</div>
		{/if}
	</div>

	{#if loading}
		<p class="text-sm text-base-content/60">
			Loading…</p>
	{:else if !workspaceId}
		<p class="text-sm text-base-content/60">
			Select a workspace to manage plugs.</p>
	{:else if !supportedChannelsVm.length}
		<div class="rounded-xl border border-base-300 bg-base-200/20 p-8 text-center">
			<p class="text-base-content/75">
				No channels with plug support yet. Connect Threads to get started.</p>
			<Button class="mt-4" variant="outline" onclick={() => void goto(accountPath)}>
				Go to Dashboard</Button>
		</div>
	{:else}
		<div class="rounded-xl border border-base-300 bg-base-100 shadow-sm">
			<div
				class="border-base-300 min-h-[200px] min-w-0 w-full overflow-x-auto border-b"
				bind:this={plugsGridHostEl}
			>
				<Willow fonts={false}>
					<Tooltip api={plugsGridApi}>
						<Grid
							data={plugRulesRowsVm}
							columns={plugGridColumnsForHost}
							sizes={plugGridSizesForHost}
							autoRowHeight={plugsGridAutoRowHeight}
							cellStyle={plugsGridCellStyle}
							select={false}
							header={true}
							init={(api: IApi) => {
								plugsGridApi = api;
							}}
						/>
					</Tooltip>
				</Willow>
			</div>
			{#if !plugRulesRowsVm.length}
				<p class="text-base-content/60 p-6 text-sm">
					No plug rules yet. Use <span class="font-medium text-base-content">Add Global rule</span> to choose a plug type and
					create one. Edit existing rows in the table.
				</p>
			{/if}
		</div>
	{/if}
</div>

<AddPlugRuleModal
	open={presenter.addPlugRuleModalOpen}
	onOpenChange={handleAddPlugRuleModalOpenChange}
	channelIndexForModal={presenter.channelIndexForModal}
	onChannelIndexChange={handlePlugAddModalChannelIndexChange}
	pendingNewForMethod={presenter.pendingNewForMethod}
	onPendingNewForMethodChange={handlePlugAddModalPendingNewForMethodChange}
	{supportedChannelsVm}
	{catalogForModalChannelVm}
	{currentChannelForModalVm}
	{fieldDefaults}
	onSaveCatalog={handleSavePlugFromCatalog}
/>

<EditPlugModal
	editorVm={singleRuleEditorVm}
	getFieldDefaults={getPlugEditFieldDefaults}
	onClose={handleClosePlugSingleRuleEditor}
	onSave={handleSavePlugFromSingleEditor}
/>

<RemovePlugRuleModal
	bind:open={removePlugRuleModalOpen}
	ruleTitle={plugRulePendingRemoval?.ruleTitle ?? ''}
	channelSummary={plugRulePendingRemoval ? `${plugRulePendingRemoval.channelName} · ${plugRulePendingRemoval.platformLabel}` : ''}
	busy={removePlugRuleBusy}
	onConfirm={handleConfirmRemovePlugRule}
	onCancel={handleRemovePlugRuleModalCancel}
/>

<style>
	:global(.wx-grid .wx-row.wx-autoheight .wx-cell) {
		align-items: flex-start;
		padding-block: 0.35rem;
	}

	:global(.wx-area .tooltip) {
		max-width: min(36rem, 92vw);
		white-space: pre-wrap;
		text-align: start;
	}
</style>
