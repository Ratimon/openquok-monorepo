import type { SetSnapshotViewModel } from '$lib/sets/GetSet.presenter.svelte';
import type { SetsRepository } from '$lib/sets/Sets.repository.svelte';
import { stringifySetSnapshot } from '$lib/sets/Sets.repository.svelte';

export type SetUpsertProgrammerModel = {
	organizationId: string;
	id?: string;
	name: string;
	snapshot: SetSnapshotViewModel;
};

export type SetUpsertResultViewModel = { ok: true; id: string } | { ok: false; error: string };

export type SetDeleteResultViewModel = { ok: true } | { ok: false; error: string };

export class UpsertSetPresenter {
	constructor(private readonly setsRepository: SetsRepository) {}

	async upsertSet(pm: SetUpsertProgrammerModel): Promise<SetUpsertResultViewModel> {
		const content = stringifySetSnapshot(pm.snapshot);
		const resultPm = await this.setsRepository.upsert({
			organizationId: pm.organizationId,
			...(pm.id ? { id: pm.id } : {}),
			name: pm.name,
			content
		});
		if (!resultPm.ok) return { ok: false, error: resultPm.error };
		return { ok: true, id: resultPm.id };
	}

	async deleteSet(id: string): Promise<SetDeleteResultViewModel> {
		const resultPm = await this.setsRepository.deleteById(id);
		if (!resultPm.ok) return { ok: false, error: resultPm.error };
		return { ok: true };
	}
}
