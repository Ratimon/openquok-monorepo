import type { ProtectedHomePagePresenter } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type { GetSetPresenter } from '$lib/sets/GetSet.presenter.svelte';
import type { SetGridTablePresenter, SetGridTableRowViewModel } from '$lib/sets/SetGridTable.presenter.svelte';
import type { SetGridFilterBuilderPresenter } from '$lib/sets/SetGridFilterBuilder.presenter.svelte';
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
		private readonly protectedHomePagePresenter: ProtectedHomePagePresenter,
		readonly setGridTable: SetGridTablePresenter,
		readonly setGridFilterBuilder: SetGridFilterBuilderPresenter
	) {}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	get createSocialPostPresenter() {
		return this.protectedHomePagePresenter.createSocialPostPresenter;
	}

	get connectedChannelsVm() {
		return this.protectedHomePagePresenter.connectedChannelsVm;
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
		void this.protectedHomePagePresenter.loadHomeLists();
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
		void this.protectedHomePagePresenter.loadHomeLists();
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
