<script lang="ts">
	import type { SettingsPanelMockContentId } from '$lib/ui/templates/device-mocks/settings-panel/settingsPanelMock.types';

	import ProgrammaticAccessTokenMock from '$lib/ui/templates/device-mocks/settings-panel/content/ProgrammaticAccessTokenMock.svelte';

	type Props = {
		content?: SettingsPanelMockContentId;
	};

	let { content }: Props = $props();
</script>

{#if content === 'programmatic-access-token'}
	<ProgrammaticAccessTokenMock />
{/if}
