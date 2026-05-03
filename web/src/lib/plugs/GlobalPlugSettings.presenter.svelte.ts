import type {
	GlobalPlugCatalogEntryProgrammerModel,
	IntegrationPlugRowProgrammerModel,
	PlugRepository,
	PlugUpsertProgrammerModel
} from '$lib/plugs/Plug.repository.svelte';
import type { GetPlugPresenter } from '$lib/plugs/GetPlug.presenter.svelte';

/** Presenter mutation result for plug upsert / delete / activate (maps from {@link PlugUpsertProgrammerModel}). */
export type PlugMutationResultViewModel =
	| { ok: true; id: string; activated: boolean }
	| { ok: false; error: string };

function plugUpsertPmToMutationVm(pm: PlugUpsertProgrammerModel): PlugMutationResultViewModel {
	if (!pm.ok) return { ok: false, error: pm.error };
	return { ok: true, id: pm.id, activated: pm.activated };
}

function validationToRegExp(s: string | undefined): RegExp | null {
	if (!s) return null;
	const m = s.trim().match(/^\/(.*)\/([a-z]*)$/);
	if (!m) return null;
	try {
		return new RegExp(m[1] ?? '', m[2] || '');
	} catch {
		return null;
	}
}

/**
 * Validation and mutations for workspace-wide plug rules (channels share the same HTTP surface via {@link PlugRepository}).
 */
export class GlobalPlugSettingsPresenter {
	constructor(
		private readonly plugRepository: PlugRepository,
		private readonly getPlugPresenter: GetPlugPresenter
	) {}

	fieldDefaults(
		def: GlobalPlugCatalogEntryProgrammerModel,
		row: IntegrationPlugRowProgrammerModel | undefined
	): Record<string, string> {
		const merged = { ...this.getPlugPresenter.parseRowData(row) };
		for (const f of def.fields) {
			if (merged[f.name] === undefined) merged[f.name] = '';
		}
		return merged;
	}

	validateFieldValues(
		def: GlobalPlugCatalogEntryProgrammerModel,
		values: Record<string, string>
	): { ok: true } | { ok: false; error: string } {
		for (const f of def.fields) {
			const v = (values[f.name] ?? '').trim();
			if (!v.length) {
				return { ok: false, error: `Please fill in “${f.description}”.` };
			}
			const re = validationToRegExp(f.validation);
			if (re && !re.test(v)) {
				return { ok: false, error: `Invalid value for “${f.description}”.` };
			}
		}
		return { ok: true };
	}

	async upsertPlug(params: {
		organizationId: string;
		integrationId: string;
		def: GlobalPlugCatalogEntryProgrammerModel;
		values: Record<string, string>;
		plugId?: string;
	}): Promise<PlugMutationResultViewModel> {
		const valid = this.validateFieldValues(params.def, params.values);
		if (!valid.ok) return valid;
		const fields = params.def.fields.map((f) => ({
			name: f.name,
			value: (params.values[f.name] ?? '').trim()
		}));
		const resultPm = await this.plugRepository.upsertIntegrationPlug({
			organizationId: params.organizationId,
			integrationId: params.integrationId,
			func: params.def.methodName,
			fields,
			...(params.plugId ? { plugId: params.plugId } : {})
		});
		return plugUpsertPmToMutationVm(resultPm);
	}

	async deletePlug(params: {
		organizationId: string;
		plugId: string;
	}): Promise<PlugMutationResultViewModel> {
		const resultPm = await this.plugRepository.deleteIntegrationPlug(params);
		return plugUpsertPmToMutationVm(resultPm);
	}

	async setPlugActivated(params: {
		organizationId: string;
		plugId: string;
		activated: boolean;
	}): Promise<PlugMutationResultViewModel> {
		const resultPm = await this.plugRepository.setIntegrationPlugActivated(params);
		return plugUpsertPmToMutationVm(resultPm);
	}
}
