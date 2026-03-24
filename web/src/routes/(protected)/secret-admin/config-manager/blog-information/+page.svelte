<script lang="ts">
	import { onMount } from 'svelte';

	import ModuleConfigRenderer from '$lib/ui/components/config/ModuleConfigRenderer.svelte';
	import { CONFIG_SCHEMA_BLOG } from '$lib/blog/constants/config';

	import type { ModuleConfigViewModel } from '$lib/config/ModuleConfigRenderer.presenter.svelte';
	import { blogInformationFormPresenter } from '$lib/area-admin';

	const handleUpdateConfigByModuleName = async (
		moduleConfigVm: { [key: string]: string | boolean }
	): Promise<{ success: boolean; message: string; isSaved?: boolean }> => {
		return blogInformationFormPresenter.updateConfig(moduleConfigVm);
	};

	let currentBlogInformationConfigVm: ModuleConfigViewModel = $derived(
		blogInformationFormPresenter.currentConfigVm
	);

	onMount(async () => {
		await blogInformationFormPresenter.getModuleConfig();
	});
</script>

<ModuleConfigRenderer
	currentConfigVm={currentBlogInformationConfigVm}
	moduleSchema={CONFIG_SCHEMA_BLOG}
	{handleUpdateConfigByModuleName}
/>

