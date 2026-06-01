<script lang="ts">
	import { onMount } from 'svelte';

	import ModuleConfigRenderer from '$lib/ui/components/config/ModuleConfigRenderer.svelte';
	import { CONFIG_SCHEMA_MARKETING } from '$lib/config/constants/config';

	import type { ModuleConfigViewModel } from '$lib/config/ModuleConfigRenderer.presenter.svelte';
	import { marketingInformationFormPresenter } from '$lib/area-admin';

	const handleUpdateConfigByModuleName = async (
		moduleConfigVm: { [key: string]: string | boolean }
	): Promise<{ success: boolean; message: string; isSaved?: boolean }> => {
		return marketingInformationFormPresenter.updateConfig(moduleConfigVm);
	};

	let currentMarketingInformationConfigVm: ModuleConfigViewModel = $derived(
		marketingInformationFormPresenter.currentConfigVm
	);

	onMount(async () => {
		await marketingInformationFormPresenter.getModuleConfig();
	});
</script>

<ModuleConfigRenderer
	currentConfigVm={currentMarketingInformationConfigVm}
	moduleSchema={CONFIG_SCHEMA_MARKETING}
	{handleUpdateConfigByModuleName}
/>
