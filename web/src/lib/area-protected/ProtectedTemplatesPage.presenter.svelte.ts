import type { ProtectedDashboardPagePresenter } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type { GetSetPresenter } from '$lib/sets/GetSet.presenter.svelte';
import type { SetGridTablePresenter, SetGridTableRowViewModel } from '$lib/sets/SetGridTable.presenter.svelte';
import type { UpsertSetPresenter } from '$lib/sets/UpsertSet.presenter.svelte';
import type { SetDeleteResultViewModel } from '$lib/sets/UpsertSet.presenter.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

/**
 * Account → Templates: workspace content sets in a SVAR grid (parsed from each row’s `content` JSON).
 *
 * Grid rows and layout orchestration live on {@link SetGridTablePresenter}; this screen delegates loads/edits/deletes.
 */
export class ProtectedTemplatesPagePresenter {
	constructor(
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		private readonly getSetPresenter: GetSetPresenter,
		private readonly upsertSetPresenter: UpsertSetPresenter,
		private readonly protectedDashboardPagePresenter: ProtectedDashboardPagePresenter,
		readonly setGridTable: SetGridTablePresenter
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
			this.setGridTable.resetForNoWorkspace();
			return;
		}
		this.setGridTable.loading = true;
		try {
			await this.refreshSetsTable();
		} finally {
			this.setGridTable.loading = false;
		}
	}

	async refreshSetsTable(): Promise<void> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			this.setGridTable.resetForNoWorkspace();
			return;
		}
		await this.setGridTable.refreshRowsForOrganization(organizationId);
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
		const snap = this.getSetPresenter.parseSnapshotFromContentStateless(vm.setRowVm.content);
		if (!snap) {
			return {
				ok: false,
				error: 'This set uses an unsupported format and cannot be edited.'
			};
		}
		void this.protectedDashboardPagePresenter.loadDashboardLists();
		this.createSocialPostPresenter.prepareContentSetAuthoring({
			editingSetId: vm.setRowVm.id,
			editingSetName: vm.name,
			snapshot: snap
		});
		return { ok: true };
	}

	async deleteSet(vm: SetGridTableRowViewModel): Promise<SetDeleteResultViewModel> {
		const resultVm = await this.upsertSetPresenter.deleteSet(vm.setRowVm.id);
		if (resultVm.ok) {
			this.setGridTable.removeRowById(vm.id);
		}
		return resultVm;
	}
}
