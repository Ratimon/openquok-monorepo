import type { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import type {
	GlobalPlugCatalogEntryProgrammerModel,
	IntegrationPlugRowProgrammerModel,
	PlugRepository
} from '$lib/plugs/Plug.repository.svelte';
import type {
	ConnectedIntegrationChannelViewModel,
	PlugCatalogProviderViewModel,
	PlugRuleTableRowViewModel
} from '$lib/plugs/GetPlug.presenter.svelte';
import type {
	UpsertGlobalPlugPresenter,
	PlugMutationResultViewModel
} from '$lib/plugs/UpsertGlobalPlug.presenter.svelte';
import type { PlugGridTablePresenter } from '$lib/plugs/PlugGridTable.presenter.svelte';

export class ProtectedPlugsPagePresenter {
	plugCatalogVm = $state<PlugCatalogProviderViewModel[]>([]);
	channelsVm = $state<ConnectedIntegrationChannelViewModel[]>([]);
	loading = $state(true);

	/** Modal: browse plug types and add new rules only (edit existing rows via grid + single-rule dialog). */
	addPlugRuleModalOpen = $state(false);
	channelIndexForModal = $state(0);

	/** Single-rule editor (from grid row). */
	singleRuleEditorVm = $state<PlugRuleTableRowViewModel | null>(null);

	/** Draft “new rule” keyed by plug method name inside the catalog modal. */
	pendingNewForMethod = $state<string | null>(null);

	constructor(
		private readonly integrationsRepository: IntegrationsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		private readonly plugRepository: PlugRepository,
		readonly upsertGlobalPlugPresenter: UpsertGlobalPlugPresenter,
		readonly plugGridTable: PlugGridTablePresenter
	) {}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	readonly supportedChannelsVm = $derived.by(() => {
		const catalog = this.plugCatalogVm;
		return this.channelsVm.filter((c) =>
			catalog.some((p) => p.identifier === (c.identifier ?? '').toLowerCase())
		);
	});

	readonly catalogForModalChannelVm = $derived.by(() => {
		const ch = this.supportedChannelsVm[this.channelIndexForModal] ?? null;
		if (!ch) return null;
		return (
			this.plugCatalogVm.find((p) => p.identifier === (ch.identifier ?? '').toLowerCase()) ?? null
		);
	});

	async syncWorkspaceAndCatalog(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			this.channelsVm = [];
			this.plugCatalogVm = [];
			this.plugGridTable.clearRules();
			this.loading = false;
			return;
		}
		this.loading = true;
		try {
			const [cat, list] = await Promise.all([
				this.plugRepository.getPlugCatalog(),
				this.integrationsRepository.listConnectedIntegrations(organizationId)
			]);
			this.plugCatalogVm = cat;
			this.channelsVm = list;
			this.channelIndexForModal = 0;
			this.addPlugRuleModalOpen = false;
			await this.refreshPlugRulesTable();
		} finally {
			this.loading = false;
		}
	}

	/** Full refetch from API (initial load / workspace sync). Prefer local grid patches after mutations. */
	async refreshPlugRulesTable(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			this.plugGridTable.clearRules();
			return;
		}
		await this.plugGridTable.refreshRulesTable(organizationId, this.plugCatalogVm, this.channelsVm);
	}

	private _valuesToPlugDataJson(
		def: GlobalPlugCatalogEntryProgrammerModel,
		values: Record<string, string>
	): string {
		const payload = def.fields.map((f) => ({
			name: f.name,
			value: (values[f.name] ?? '').trim()
		}));
		return JSON.stringify(payload);
	}

	private _channelByIntegrationId(
		integrationId: string
	): ConnectedIntegrationChannelViewModel | null {
		return this.channelsVm.find((c) => c.id === integrationId) ?? null;
	}

	openAddPlugRuleModal(channelIndex: number = 0): void {
		this.channelIndexForModal = Math.min(
			Math.max(0, channelIndex),
			Math.max(0, this.supportedChannelsVm.length - 1)
		);
		this.pendingNewForMethod = null;
		this.addPlugRuleModalOpen = true;
	}

	openSingleRuleEditor(vm: PlugRuleTableRowViewModel): void {
		this.singleRuleEditorVm = vm;
	}

	closeSingleRuleEditor(): void {
		this.singleRuleEditorVm = null;
	}

	async savePlugFromCatalog(params: {
		def: GlobalPlugCatalogEntryProgrammerModel;
		values: Record<string, string>;
		plugId?: string;
	}): Promise<PlugMutationResultViewModel> {
		const organizationId = this.organizationId;
		const ch = this.supportedChannelsVm[this.channelIndexForModal] ?? null;
		if (!organizationId || !ch) {
			return { ok: false, error: 'No channel selected.' };
		}
		const resultVm = await this.upsertGlobalPlugPresenter.upsertPlug({
			organizationId,
			integrationId: ch.id,
			def: params.def,
			values: params.values,
			...(params.plugId ? { plugId: params.plugId } : {})
		});
		if (resultVm.ok) {
			const data = this._valuesToPlugDataJson(params.def, params.values);
			const rowPm: IntegrationPlugRowProgrammerModel = {
				id: resultVm.id,
				organization_id: organizationId,
				integration_id: ch.id,
				plug_function: params.def.methodName,
				data,
				activated: resultVm.activated
			};
			const rowVm = this.plugGridTable.toRuleRowVm(this.plugCatalogVm, ch, rowPm);
			this.plugGridTable.upsertRuleAfterCatalogSave(rowVm, params.plugId);
			if (!params.plugId && this.pendingNewForMethod === params.def.methodName) {
				this.pendingNewForMethod = null;
			}
		}
		return resultVm;
	}

	async savePlugFromSingleEditor(params: {
		def: GlobalPlugCatalogEntryProgrammerModel;
		values: Record<string, string>;
		plugId: string;
		integrationId: string;
	}): Promise<PlugMutationResultViewModel> {
		const organizationId = this.organizationId;
		if (!organizationId) return { ok: false, error: 'No workspace.' };
		const resultVm = await this.upsertGlobalPlugPresenter.upsertPlug({
			organizationId,
			integrationId: params.integrationId,
			def: params.def,
			values: params.values,
			plugId: params.plugId
		});
		if (resultVm.ok) {
			const ch = this._channelByIntegrationId(params.integrationId);
			if (ch) {
				const data = this._valuesToPlugDataJson(params.def, params.values);
				const rowPm: IntegrationPlugRowProgrammerModel = {
					id: resultVm.id,
					organization_id: organizationId,
					integration_id: params.integrationId,
					plug_function: params.def.methodName,
					data,
					activated: resultVm.activated
				};
				const rowVm = this.plugGridTable.toRuleRowVm(this.plugCatalogVm, ch, rowPm);
				this.plugGridTable.replaceRuleAfterSingleEditorSave(params.plugId, rowVm);
			} else {
				await this.refreshPlugRulesTable();
			}
			this.closeSingleRuleEditor();
		}
		return resultVm;
	}

	async deletePlugRow(vm: PlugRuleTableRowViewModel): Promise<PlugMutationResultViewModel> {
		const organizationId = this.organizationId;
		if (!organizationId) return { ok: false, error: 'No workspace.' };
		const resultVm = await this.upsertGlobalPlugPresenter.deletePlug({
			organizationId,
			plugId: vm.plugRowPm.id
		});
		if (resultVm.ok) {
			const removedId = vm.plugRowPm.id;
			this.plugGridTable.removeRuleRowByPlugId(removedId);
			if (this.singleRuleEditorVm?.plugRowPm.id === removedId) this.closeSingleRuleEditor();
		}
		return resultVm;
	}

	async togglePlugActive(
		vm: PlugRuleTableRowViewModel,
		on: boolean
	): Promise<PlugMutationResultViewModel> {
		const organizationId = this.organizationId;
		if (!organizationId) return { ok: false, error: 'No workspace.' };
		const plugId = vm.plugRowPm.id;
		if (!plugId) {
			return { ok: false, error: 'Save plug fields first — then you can enable or pause it.' };
		}
		const resultVm = await this.upsertGlobalPlugPresenter.setPlugActivated({
			organizationId,
			plugId,
			activated: on
		});
		if (resultVm.ok) {
			this.plugGridTable.patchRuleActivated(plugId, resultVm.activated);
			const editor = this.singleRuleEditorVm;
			if (editor?.plugRowPm.id === plugId) {
				this.singleRuleEditorVm = {
					...editor,
					activated: resultVm.activated,
					plugRowPm: { ...editor.plugRowPm, activated: resultVm.activated }
				};
			}
		}
		return resultVm;
	}
}
