<script lang="ts">
	import type { ExtensionCardViewModel } from '$lib/listings/index';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		extension: ExtensionCardViewModel;
		detailHref: string;
	};

	let { extension, detailHref }: Props = $props();

	const overview = $derived(extension.description ?? extension.excerpt ?? 'No overview available.');

	const installCommand = $derived.by(() => {
		if (extension.extensionType === 'mcp') return extension.installCommandMcp;
		if (extension.extensionType === 'skills') return extension.installCommandSkills;
		return extension.installCommandSkills ?? extension.installCommandMcp;
	});
</script>

<div class="space-y-4 pt-4">
	<div>
		<h4 class="mb-1 text-sm font-semibold text-base-content">Overview</h4>
		<p class="text-sm leading-relaxed text-base-content/80">{overview}</p>
	</div>

	{#if installCommand}
		<div>
			<h4 class="mb-2 text-sm font-semibold text-base-content">Install</h4>
			<TerminalCommandMock code={installCommand} ariaLabel={`Install command for ${extension.title}`} />
		</div>
	{/if}

	<div class="flex flex-wrap gap-2">
		<Button href={detailHref} variant="primary" size="sm">View details</Button>
	</div>
</div>
