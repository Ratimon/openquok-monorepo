<script lang="ts">
	import { onMount } from 'svelte';

	import type { ModuleConfigViewModel } from '$lib/config/ModuleConfigRenderer.presenter.svelte';
	import { CONFIG_SCHEMA_LANDING_PAGE } from '$lib/config/constants/config';
	import { landingPageFormPresenter } from '$lib/area-admin';

	import ModuleConfigRenderer from '$lib/ui/components/config/ModuleConfigRenderer.svelte';

	const handleUpdateConfigByModuleName = async (
		moduleConfigVm: Record<string, unknown>
	): Promise<{ success: boolean; message: string; isSaved?: boolean }> => {
		return landingPageFormPresenter.updateConfig(moduleConfigVm);
	};

	let currentLandingPageConfigVm: ModuleConfigViewModel = $derived(
		landingPageFormPresenter.currentConfigVm
	);

	onMount(async () => {
		await landingPageFormPresenter.getModuleConfig();
	});
</script>

<ModuleConfigRenderer
	currentConfigVm={currentLandingPageConfigVm}
	moduleSchema={CONFIG_SCHEMA_LANDING_PAGE}
	{handleUpdateConfigByModuleName}
/>
