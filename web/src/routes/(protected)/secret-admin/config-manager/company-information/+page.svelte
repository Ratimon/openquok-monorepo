<script lang="ts">
	import { onMount } from 'svelte';

	import type { ModuleConfigViewModel } from '$lib/config/ModuleConfigRenderer.presenter.svelte';
	import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
	import { companyInformationFormPresenter } from '$lib/area-admin';

	import ModuleConfigRenderer from '$lib/ui/components/config/ModuleConfigRenderer.svelte';

	const handleUpdateConfigByModuleName = async (
		moduleConfigVm: Record<string, unknown>
	): Promise<{ success: boolean; message: string; isSaved?: boolean }> => {
		return companyInformationFormPresenter.updateConfig(moduleConfigVm);
	};

	let currentCompanyInformationConfigVm: ModuleConfigViewModel = $derived(
		companyInformationFormPresenter.currentConfigVm
	);

	onMount(async () => {
		await companyInformationFormPresenter.getModuleConfig();
	});
</script>

<ModuleConfigRenderer
	currentConfigVm={currentCompanyInformationConfigVm}
	moduleSchema={CONFIG_SCHEMA_COMPANY}
	{handleUpdateConfigByModuleName}
/>
