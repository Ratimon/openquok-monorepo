<script lang="ts">
	import { onMount } from 'svelte';

	import type { ModuleConfigViewModel } from '$lib/config/ModuleConfigRenderer.presenter.svelte';
	import {
		CONFIG_SCHEMA_LANDING_PAGE,
		LANDING_PAGE_CONFIG_REVISION
	} from '$lib/config/constants/config';
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
	enableLoadCodeDefaults={true}
	codeRevision={LANDING_PAGE_CONFIG_REVISION}
	revisionConfigKey="LANDING_PAGE_CONFIG_REVISION"
	moduleLabel="Landing page"
	loadCodeDefaultsConfirmMessage="Load landing page defaults from config.ts? This replaces every field in the form (including FEATURE_1–FEATURE_8). Review, then Save Settings to persist."
/>
