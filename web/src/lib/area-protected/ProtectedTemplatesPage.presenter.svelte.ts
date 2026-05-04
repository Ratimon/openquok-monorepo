import type { ProtectedDashboardPagePresenter } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type { GetSetPresenter } from '$lib/sets/GetSet.presenter.svelte';
import type { SetGridTableRowViewModel } from '$lib/sets/SetGrid.presenter.svelte';
import type { UpsertSetPresenter } from '$lib/sets/UpsertSetPresenter.svelte';
import type { SetDeleteResultViewModel } from '$lib/sets/UpsertSetPresenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

import { sortSetGridRows, toSetGridTableRowViewModel } from '$lib/sets/SetGrid.presenter.svelte';

/**
 * Account → Templates: workspace content sets in a SVAR grid (parsed from each row’s `content` JSON).
 */
export class ProtectedTemplatesPagePresenter {
	setsGridRowsVm = $state<SetGridTableRowViewModel[]>([]);
	loading = $state(true);

	constructor(
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		private readonly getSetPresenter: GetSetPresenter,
		private readonly upsertSetPresenter: UpsertSetPresenter,
		private readonly protectedDashboardPagePresenter: ProtectedDashboardPagePresenter
	) {}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	get createSocialPostPresenter() {
		return this.protectedDashboardPagePresenter.createSocialPostPresenter;
	}

	get connectedChannelsVm() {
		return this.protectedDashboardPagePresenter.connectedChannelsVm;
	}

	async syncWorkspace(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			this.setsGridRowsVm = [];
			this.loading = false;
			return;
		}
		this.loading = true;
		try {
			await this.refreshSetsTable();
		} finally {
			this.loading = false;
		}
	}

	async refreshSetsTable(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			this.setsGridRowsVm = [];
			return;
		}
		// Sets store integration UUIDs from the composer; resolve names/avatars from the same list API.
		await this.protectedDashboardPagePresenter.loadDashboardLists();
		const resultVm = await this.getSetPresenter.loadSetsListVm(organizationId);
		if (!resultVm.ok) {
			this.setsGridRowsVm = [];
			return;
		}
		const channelLookup = this.connectedChannelsVm.map((c) => ({
			id: c.id,
			internalId: c.internalId,
			name: c.name,
			identifier: c.identifier,
			picture: c.picture
		}));
		const rows = resultVm.rows.map((r) => toSetGridTableRowViewModel(r, channelLookup));
		this.setsGridRowsVm = sortSetGridRows(rows);
	}

	openNewSet(): void {
		const oid = this.organizationId;
		if (!oid) return;
		void this.protectedDashboardPagePresenter.loadDashboardLists();
		this.createSocialPostPresenter.prepareContentSetAuthoring({});
	}

	/** Opens the composer for an existing set; returns an error message when content cannot be parsed. */
	openEditSet(vm: SetGridTableRowViewModel): { ok: true } | { ok: false; error: string } {
		const oid = this.organizationId;
		if (!oid) return { ok: false, error: 'Select a workspace first.' };
		const snap = this.getSetPresenter.parseSnapshotFromContentStateless(vm.setRow.content);
		if (!snap) {
			return {
				ok: false,
				error: 'This set uses an unsupported format and cannot be edited.'
			};
		}
		void this.protectedDashboardPagePresenter.loadDashboardLists();
		this.createSocialPostPresenter.prepareContentSetAuthoring({
			editingSetId: vm.setRow.id,
			editingSetName: vm.name,
			snapshot: snap
		});
		return { ok: true };
	}

	async deleteSet(vm: SetGridTableRowViewModel): Promise<SetDeleteResultViewModel> {
		const resultVm = await this.upsertSetPresenter.deleteSet(vm.setRow.id);
		if (resultVm.ok) {
			this.setsGridRowsVm = this.setsGridRowsVm.filter((r) => r.id !== vm.id);
		}
		return resultVm;
	}
}
