<script lang="ts">
	import type { TerminalMockContentId } from '$lib/ui/templates/device-mocks/terminal/terminalMock.types';

	import OpenquokSkillInstallHermesMock from '$lib/ui/templates/device-mocks/terminal/content/OpenquokSkillInstallHermesMock.svelte';
	import OpenquokSkillInstallMock from '$lib/ui/templates/device-mocks/terminal/content/OpenquokSkillInstallMock.svelte';

	type Props = {
		content?: TerminalMockContentId;
	};

	let { content }: Props = $props();
</script>

{#if content === 'openquok-skill-install'}
	<OpenquokSkillInstallMock />
{:else if content === 'openquok-skill-install-hermes'}
	<OpenquokSkillInstallHermesMock />
{/if}
