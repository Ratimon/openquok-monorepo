<script lang="ts">
	import { onMount } from 'svelte';

	import ModuleConfigRenderer from '$lib/ui/components/config/ModuleConfigRenderer.svelte';
	import { CONFIG_SCHEMA_PUBLIC_FAQ } from '$lib/config/constants/config';

	import type { ModuleConfigViewModel } from '$lib/config/ModuleConfigRenderer.presenter.svelte';
	import { publicFaqFormPresenter } from '$lib/area-admin';

	const handleUpdateConfigByModuleName = async (
		moduleConfigVm: { [key: string]: string | boolean }
	): Promise<{ success: boolean; message: string; isSaved?: boolean }> => {
		return publicFaqFormPresenter.updateConfig(moduleConfigVm);
	};

	let currentPublicFaqConfigVm: ModuleConfigViewModel = $derived(
		publicFaqFormPresenter.currentConfigVm
	);

	onMount(async () => {
		await publicFaqFormPresenter.getModuleConfig();
	});
</script>

<ModuleConfigRenderer
	currentConfigVm={currentPublicFaqConfigVm}
	moduleSchema={CONFIG_SCHEMA_PUBLIC_FAQ}
	{handleUpdateConfigByModuleName}
/>
