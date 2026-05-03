<script lang="ts">
	import type {
		GlobalPlugCatalogEntryProgrammerModel,
		IntegrationPlugRowProgrammerModel
	} from '$lib/plugs/Plug.repository.svelte';
	import type { PlugRuleTableRowViewModel } from '$lib/plugs/GetPlug.presenter.svelte';

	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { getRootPathAccount, protectedPlugsPagePresenter } from '$lib/area-protected';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { Willow, Grid } from '@svar-ui/svelte-grid';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AddPlugRuleModal from '$lib/ui/components/plugs/AddPlugRuleModal.svelte';
	import EditPlugModal from '$lib/ui/components/plugs/EditPlugModal.svelte';
	import RemovePlugRuleModal from '$lib/ui/components/plugs/RemovePlugRuleModal.svelte';
	import PlugsGridAccountCell from '$lib/ui/components/plugs/PlugsGridAccountCell.svelte';
	import PlugsGridActiveCell from '$lib/ui/components/plugs/PlugsGridActiveCell.svelte';
	import PlugsGridActionsCell from '$lib/ui/components/plugs/PlugsGridActionsCell.svelte';
	import { plugsGridActionsKey } from '$lib/ui/components/plugs/plugsGridContext';

	const presenter = protectedPlugsPagePresenter;

	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

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

	const plugGridColumns = [
		{ id: 'channelAccount', header: 'Connected account', width: 240, cell: PlugsGridAccountCell },
		{ id: 'platformLabel', header: 'Platform', width: 120 },
		{ id: 'likesToTriggerDisplay', header: 'Number of likes to trigger', width: 200 },
		{ id: 'messageDisplay', header: 'Message', flexgrow: 2, minWidth: 200 },
		{ id: 'active', header: 'Active', width: 88, cell: PlugsGridActiveCell },
		{ id: 'actions', header: '', width: 152, cell: PlugsGridActionsCell }
	];

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

<div class="mx-auto max-w-6xl px-4 py-8">
	<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
		<div class="flex flex-wrap items-center gap-3">
			<AbstractIcon name={icons.Sparkles.name} class="size-8 text-primary" width="32" height="32" />
			<div>
				<h1 class="text-2xl font-semibold tracking-tight text-base-content">
					Plugs</h1>
				<p class="text-sm text-base-content/65">
					Automation rules per connected channel (e.g. auto-reply when a Threads post reaches N likes).
					Auto replies can also be set per post under Threads settings when scheduling.
				</p>
			</div>
		</div>
		{#if supportedChannelsVm.length}
			<Button type="button" variant="primary" onclick={() => presenter.openAddPlugRuleModal(0)}>
				Add rule
			</Button>
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
			<Button class="mt-4" variant="outline" onclick={() => void goto(accountPath)}>Go to Dashboard</Button>
		</div>
	{:else}
		<div class="rounded-xl border border-base-300 bg-base-100 shadow-sm">
			<div class="border-base-300 min-h-[200px] overflow-x-auto border-b">
				<Willow fonts={false}>
					<Grid
						data={plugRulesRowsVm}
						columns={plugGridColumns}
						select={false}
						header={true}
					/>
				</Willow>
			</div>
			{#if !plugRulesRowsVm.length}
				<p class="text-base-content/60 p-6 text-sm">
					No plug rules yet. Use <span class="font-medium text-base-content">Add rule</span> to choose a plug type and
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
