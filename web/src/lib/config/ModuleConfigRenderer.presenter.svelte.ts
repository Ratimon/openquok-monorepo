import type { ModuleConfigRepository } from '$lib/config/Config.repository.svelte';

export enum ModuleUpsertStatus {
	UNKNOWN = 'unknown',
	UPSERTING = 'upserting',
	UPSERTED = 'upserted'
}

export interface ModuleConfigViewModel {
	[key: string]: string;
}

export class ModuleConfigRendererPresenter {
	public moduleName: string = $state('');

	public currentConfigVm: ModuleConfigViewModel = $state({});

	public status: ModuleUpsertStatus = $state(ModuleUpsertStatus.UNKNOWN);

	constructor(
		private readonly moduleConfigRepository: ModuleConfigRepository,
		moduleName: string
	) {
		this.moduleName = moduleName;
	}

	public async getModuleConfig() {
		this.status = ModuleUpsertStatus.UPSERTING;
		const result = await this.moduleConfigRepository.getModuleConfig(this.moduleName);
		this.currentConfigVm = result;
		this.status = ModuleUpsertStatus.UPSERTED;
		return this.currentConfigVm;
	}

	public async updateConfig(
		newConfig: { [key: string]: string | boolean }
	): Promise<{ success: boolean; message: string; isSaved?: boolean }> {
		this.status = ModuleUpsertStatus.UPSERTING;

		const result = await this.moduleConfigRepository.updateConfig(this.moduleName, newConfig);

		if (result.success) {
			this.status = ModuleUpsertStatus.UPSERTED;
		} else {
			this.status = ModuleUpsertStatus.UNKNOWN;
		}

		// Refresh in the background so the UI reflects the persisted values.
		// (We don't await to keep the UX snappy.)
		void this.getModuleConfig().catch(() => {});

		return result;
	}
}

