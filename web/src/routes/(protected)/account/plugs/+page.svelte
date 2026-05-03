<script lang="ts">
	import type { GlobalPlugCatalogEntryProgrammerModel } from '$lib/plugs/Plug.repository.svelte';
	import type { PlugRuleTableRowViewModel } from '$lib/plugs/GetPlug.presenter.svelte';

	import { setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { route } from '$lib/utils/path';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { getRootPathAccount, protectedPlugsPagePresenter } from '$lib/area-protected';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ImageWithFallback from '$lib/ui/media-files/ImageWithFallback.svelte';
	import PlugsGridAccountCell from '$lib/ui/components/plugs/PlugsGridAccountCell.svelte';
	import PlugsGridActiveCell from '$lib/ui/components/plugs/PlugsGridActiveCell.svelte';
	import PlugsGridActionsCell from '$lib/ui/components/plugs/PlugsGridActionsCell.svelte';
	import { plugsGridActionsKey } from '$lib/ui/components/plugs/plugsGridContext';
	import { Willow, Grid } from '@svar-ui/svelte-grid';

	const presenter = protectedPlugsPagePresenter;

	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	const plugRulesRowsVm = $derived(presenter.plugRulesRowsVm);
	const loading = $derived(presenter.loading);
	const supportedChannelsVm = $derived(presenter.supportedChannelsVm);
	const channelIndexForModal = $derived(presenter.channelIndexForModal);
	const catalogForModalChannelVm = $derived(presenter.catalogForModalChannelVm);
	const pendingNewForMethod = $derived(presenter.pendingNewForMethod);
	const singleRuleEditorVm = $derived(presenter.singleRuleEditorVm);

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
		remove: async (vm: PlugRuleTableRowViewModel) => {
			if (!confirm('Remove this plug rule?')) return;
			const resultVm = await presenter.deletePlugRow(vm);
			if (resultVm.ok) toast.success('Rule removed');
			else toast.error(resultVm.error);
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

	async function savePlugFromCatalog(
		def: GlobalPlugCatalogEntryProgrammerModel,
		values: Record<string, string>,
		plugId?: string
	) {
		const resultVm = await presenter.savePlugFromCatalog({ def, values, ...(plugId ? { plugId } : {}) });
		if (resultVm.ok) toast.success(plugId ? 'Rule updated' : 'Rule saved');
		else toast.error(resultVm.error);
	}

	async function savePlugFromSingleEditor(
		def: GlobalPlugCatalogEntryProgrammerModel,
		values: Record<string, string>,
		plugId: string,
		integrationId: string
	) {
		const resultVm = await presenter.savePlugFromSingleEditor({ def, values, plugId, integrationId });
		if (resultVm.ok) toast.success('Rule updated');
		else toast.error(resultVm.error);
	}

	const currentChannelForModalVm = $derived(supportedChannelsVm[channelIndexForModal] ?? null);
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

<Dialog.Root bind:open={presenter.addPlugRuleModalOpen}>
	<Dialog.Content class="max-h-[min(90vh,720px)] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
		{#if currentChannelForModalVm && catalogForModalChannelVm}
			<Dialog.Header>
				<Dialog.Title class="text-lg">
					Add plug rule — {currentChannelForModalVm.name}
				</Dialog.Title>
				<Dialog.Description class="text-base-content/65">
					Choose a plug type below. To change an existing rule, use <span class="font-medium text-base-content">Edit</span> in
					the table.
				</Dialog.Description>
			</Dialog.Header>

			<div class="mt-4 flex flex-wrap gap-2 border-b border-base-300 pb-4">
				{#each supportedChannelsVm as ch, i (ch.id)}
					<button
						type="button"
						class="border-base-300 hover:bg-base-200/60 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors {channelIndexForModal ===
						i
							? 'bg-base-200 text-base-content ring-2 ring-base-content/15'
							: 'text-base-content/70'}"
						onclick={() => {
							presenter.channelIndexForModal = i;
						}}
					>
						{ch.name}
					</button>
				{/each}
			</div>

			<div class="mt-4 flex items-center gap-3 border-b border-base-300 pb-4">
				<div class="relative h-12 w-12 shrink-0">
					<ImageWithFallback
						src={currentChannelForModalVm.picture ?? ''}
						alt=""
						fallbackIcon={icons.User1.name}
						class="border-base-300 h-12 w-12 rounded-full border object-cover"
					/>
					<span
						class="border-base-300 bg-base-100 absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm ring-2 ring-base-100"
						aria-hidden="true"
					>
						<AbstractIcon
							name={socialProviderIcon(currentChannelForModalVm.identifier)}
							class="text-base-content size-3.5"
							width="14"
							height="14"
						/>
					</span>
				</div>
				<div class="min-w-0">
					<div class="truncate font-medium text-base-content">
						{currentChannelForModalVm.name}</div>
					<div class="text-xs capitalize text-base-content/55">
						{currentChannelForModalVm.identifier}</div>
				</div>
			</div>

			<div class="mt-6 space-y-6">
				{#each catalogForModalChannelVm.plugs as def (def.methodName)}
					<div class="rounded-xl border border-base-300 bg-base-200/20 p-5 shadow-sm">
						<div class="mb-4">
							<h2 class="text-lg font-semibold">
								{def.title}</h2>
							<p class="mt-1 text-sm text-base-content/65">
								{def.description}</p>
							<p class="mt-2 text-xs text-base-content/45">
								Checks every {Math.round(def.runEveryMilliseconds / 3600000)}h · up to {def.totalRuns} run{def.totalRuns === 1 ? '' : 's'}
							</p>
						</div>

						{#if pendingNewForMethod === def.methodName}
							{@const draftValues = fieldDefaults(def)}
							<div class="border-base-300 bg-base-100/30 mt-4 rounded-lg border border-dashed p-4">
								<div class="mb-3 text-xs font-medium text-base-content/55">
									New rule</div>
								<form
									class="space-y-4"
									onsubmit={(e) => {
										e.preventDefault();
										const fd = new FormData(e.currentTarget);
										const next: Record<string, string> = {};
										for (const f of def.fields) {
											next[f.name] = String(fd.get(f.name) ?? '');
										}
										void savePlugFromCatalog(def, next);
									}}
								>
									{#each def.fields as f (f.name)}
										<label class="block">
											<span class="mb-1 block text-xs font-medium text-base-content/70">{f.description}</span>
											{#if f.type === 'richtext'}
												<textarea
													name={f.name}
													rows={4}
													class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
													placeholder={f.placeholder}
													value={draftValues[f.name] ?? ''}
												></textarea>
											{:else}
												<input
													name={f.name}
													type={f.type === 'number' ? 'number' : 'text'}
													class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
													placeholder={f.placeholder}
													value={draftValues[f.name] ?? ''}
												/>
											{/if}
										</label>
									{/each}
									<div class="flex flex-wrap justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											onclick={() => {
												presenter.pendingNewForMethod = null;
											}}
										>
											Cancel
										</Button>
										<Button type="submit" variant="primary">Save rule</Button>
									</div>
								</form>
							</div>
						{/if}

						<Button
							type="button"
							variant="outline"
							class="mt-4 w-full sm:w-auto"
							disabled={pendingNewForMethod === def.methodName}
							onclick={() => {
								presenter.pendingNewForMethod = def.methodName;
							}}
						>
							Add rule
						</Button>
					</div>
				{/each}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	open={singleRuleEditorVm !== null}
	onOpenChange={(open) => {
		if (!open) presenter.closeSingleRuleEditor();
	}}
>
	<Dialog.Content class="max-h-[min(90vh,640px)] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
		{#if singleRuleEditorVm?.catalogEntry}
			{@const def = singleRuleEditorVm.catalogEntry}
			{@const values = presenter.globalPlugSettingsPresenter.fieldDefaults(def, singleRuleEditorVm.plugRowPm)}
			<Dialog.Header>
				<Dialog.Title class="text-lg">
					Edit rule — {singleRuleEditorVm.ruleTitle}
				</Dialog.Title>
				<Dialog.Description class="text-base-content/65">
					{singleRuleEditorVm.channelName} · {singleRuleEditorVm.platformLabel}
				</Dialog.Description>
			</Dialog.Header>
			<form
				class="mt-4 space-y-4"
				onsubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					const next: Record<string, string> = {};
					for (const f of def.fields) {
						next[f.name] = String(fd.get(f.name) ?? '');
					}
					void savePlugFromSingleEditor(def, next, singleRuleEditorVm.id, singleRuleEditorVm.integrationId);
				}}
			>
				{#each def.fields as f (f.name)}
					<label class="block">
						<span class="mb-1 block text-xs font-medium text-base-content/70">{f.description}</span>
						{#if f.type === 'richtext'}
							<textarea
								name={f.name}
								rows={4}
								class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
								placeholder={f.placeholder}
								value={values[f.name] ?? ''}
							></textarea>
						{:else}
							<input
								name={f.name}
								type={f.type === 'number' ? 'number' : 'text'}
								class="border-base-300 bg-base-100 text-base-content w-full rounded-md border px-3 py-2 text-sm"
								placeholder={f.placeholder}
								value={values[f.name] ?? ''}
							/>
						{/if}
					</label>
				{/each}
				<div class="flex justify-end gap-2 pt-2">
					<Button type="button" variant="outline" onclick={() => presenter.closeSingleRuleEditor()}>Cancel</Button>
					<Button type="submit" variant="primary">
						Save
					</Button>
				</div>
			</form>
		{:else if singleRuleEditorVm}
			<Dialog.Header>
				<Dialog.Title class="text-lg">
					Unknown plug type
				</Dialog.Title>
				<Dialog.Description class="text-base-content/65">
					This rule uses <code class="text-xs">{singleRuleEditorVm.plugRowPm.plug_function}</code> which is not in
					the current catalog.
				</Dialog.Description>
			</Dialog.Header>
			<div class="mt-4 flex justify-end">
				<Button type="button" variant="outline" onclick={() => presenter.closeSingleRuleEditor()}>
                    Close
                </Button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
