import type { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import type {
	GlobalPlugCatalogEntryProgrammerModel,
	IntegrationPlugRowProgrammerModel,
	PlugRepository
} from '$lib/plugs/Plug.repository.svelte';
import type {
	ConnectedIntegrationChannelViewModel,
	GetPlugPresenter,
	PlugCatalogProviderViewModel,
	PlugRuleTableRowViewModel
} from '$lib/plugs/GetPlug.presenter.svelte';
import type {
	UpsertGlobalPlugPresenter,
	PlugMutationResultViewModel
} from '$lib/plugs/UpsertGlobalPlug.presenter.svelte';

/**
 * Account → Plugs: catalog + connected channels + aggregated plug rules for the SVAR grid.
 */
export class ProtectedPlugsPagePresenter {
	plugCatalogVm = $state<PlugCatalogProviderViewModel[]>([]);
	channelsVm = $state<ConnectedIntegrationChannelViewModel[]>([]);
	plugRulesRowsVm = $state<PlugRuleTableRowViewModel[]>([]);
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
		private readonly getPlugPresenter: GetPlugPresenter,
		readonly upsertGlobalPlugPresenter: UpsertGlobalPlugPresenter
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
			this.plugRulesRowsVm = [];
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
			this.plugRulesRowsVm = [];
			return;
		}
		const catalog = this.plugCatalogVm;
		const supported = this.channelsVm.filter((c) =>
			catalog.some((p) => p.identifier === (c.identifier ?? '').toLowerCase())
		);
		const rows: PlugRuleTableRowViewModel[] = [];
		for (const ch of supported) {
			const catalogForProvider = catalog.find(
				(p) => p.identifier === (ch.identifier ?? '').toLowerCase()
			);
			const plugRows = await this.plugRepository.listIntegrationPlugs(organizationId, ch.id);
			for (const rowPm of plugRows) {
				rows.push(
					this.getPlugPresenter.toPlugRuleTableRowViewModel({
						channel: ch,
						catalogForProvider,
						rowPm
					})
				);
			}
		}
		this.plugRulesRowsVm = this._sortPlugRuleRows(rows);
	}

	private _sortPlugRuleRows(rows: PlugRuleTableRowViewModel[]): PlugRuleTableRowViewModel[] {
		return [...rows].sort((a, b) => {
			const byChannel = a.channelName.localeCompare(b.channelName);
			if (byChannel !== 0) return byChannel;
			return a.ruleTitle.localeCompare(b.ruleTitle);
		});
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

	private _rowVmFromPm(channel: ConnectedIntegrationChannelViewModel, rowPm: IntegrationPlugRowProgrammerModel): PlugRuleTableRowViewModel {
		const catalogForProvider = this.plugCatalogVm.find(
			(p) => p.identifier === (channel.identifier ?? '').toLowerCase()
		);
		return this.getPlugPresenter.toPlugRuleTableRowViewModel({
			channel,
			catalogForProvider,
			rowPm
		});
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
			const rowVm = this._rowVmFromPm(ch, rowPm);
			if (params.plugId) {
				this.plugRulesRowsVm = this._sortPlugRuleRows(
					this.plugRulesRowsVm.map((r) => (r.plugRowPm.id === params.plugId ? rowVm : r))
				);
			} else {
				this.plugRulesRowsVm = this._sortPlugRuleRows([...this.plugRulesRowsVm, rowVm]);
			}
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
				const rowVm = this._rowVmFromPm(ch, rowPm);
				this.plugRulesRowsVm = this._sortPlugRuleRows(
					this.plugRulesRowsVm.map((r) => (r.plugRowPm.id === params.plugId ? rowVm : r))
				);
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
			this.plugRulesRowsVm = this.plugRulesRowsVm.filter((r) => r.plugRowPm.id !== removedId);
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
			this.plugRulesRowsVm = this.plugRulesRowsVm.map((r) =>
				r.plugRowPm.id !== plugId
					? r
					: {
							...r,
							activated: resultVm.activated,
							plugRowPm: { ...r.plugRowPm, activated: resultVm.activated }
						}
			);
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
