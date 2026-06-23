<script lang="ts">
	import type { SkillInstallOption } from '$lib/content/constants/openquokCliCommandReference';

	import * as Tabs from '$lib/ui/tabs';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	type Props = {
		options: readonly SkillInstallOption[];
		ariaLabel?: string;
		class?: string;
	};

	let {
		options,
		ariaLabel = 'Copy openquok-core skill install command to clipboard',
		class: className = ''
	}: Props = $props();

	let tabValue = $state('');

	$effect(() => {
		const first = options[0]?.id ?? '';
		if (!options.length) return;
		if (tabValue === '' || !options.some((option) => option.id === tabValue)) {
			tabValue = first;
		}
	});

	const activeCommand = $derived(
		options.find((option) => option.id === tabValue)?.command ?? options[0]?.command ?? ''
	);

	const showTabs = $derived(options.length > 1);

	const tabTriggerClass =
		'h-auto min-h-0 flex-1 rounded-lg border-0 !border-b-0 bg-transparent px-4 py-2.5 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content sm:flex-none [&.tab-active]:bg-primary [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';
</script>

<div class={className}>
	{#if showTabs}
		<Tabs.Root bind:value={tabValue} class="w-full">
			<Tabs.List
				class="inline-flex w-full max-w-full flex-wrap gap-1 rounded-xl border-2 border-base-content/15 bg-base-200/60 p-1 shadow-sm !border-solid"
			>
				{#each options as option (option.id)}
					<Tabs.Trigger value={option.id} class={tabTriggerClass}>
						{option.label}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</Tabs.Root>
	{/if}

	<TerminalCommandMock
		code={activeCommand}
		{ariaLabel}
		class="mt-3 [&>div]:text-sm sm:[&>div]:text-base"
	/>
</div>
