import type { ModuleConfigSchema } from '$lib/config/constants/types';
import type { ModuleConfigViewModel } from '$lib/config/ModuleConfigRenderer.presenter.svelte';

/** Build a config view model from schema defaults (e.g. git-managed `publicFaqConfig.ts` for Public FAQ). */
export function buildModuleConfigCodeDefaultsVm(
	moduleSchema: ModuleConfigSchema
): ModuleConfigViewModel {
	const vm: ModuleConfigViewModel = {};

	for (const [key, schemaItem] of Object.entries(moduleSchema)) {
		const isSwitch = schemaItem.inputType === 'switch' || schemaItem.type === 'boolean';
		const isFaq = schemaItem.inputType === 'faq';

		if (isFaq) {
			vm[key] = Array.isArray(schemaItem.default) ? structuredClone(schemaItem.default) : [];
			continue;
		}

		if (isSwitch) {
			vm[key] = schemaItem.default === true || schemaItem.default === 'true';
			continue;
		}

		if (schemaItem.default === undefined || schemaItem.default === null) {
			vm[key] = '';
			continue;
		}

		vm[key] = String(schemaItem.default);
	}

	return vm;
}
