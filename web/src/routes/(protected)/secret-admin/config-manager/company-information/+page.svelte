<script lang="ts">
	import { onMount } from 'svelte';

	import ModuleConfigRenderer from '$lib/ui/components/config/ModuleConfigRenderer.svelte';
	import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';

	import type { ModuleConfigViewModel } from '$lib/config/ModuleConfigRenderer.presenter.svelte';
	import { companyInformationFormPresenter } from '$lib/area-admin';

	const handleUpdateConfigByModuleName = async (
		moduleConfigVm: { [key: string]: string | boolean }
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

