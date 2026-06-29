<script lang="ts">
	import type { ExtensionCardViewModel } from '$lib/listings/index';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tabs from '$lib/ui/tabs';

	type Props = {
		extension: ExtensionCardViewModel;
		detailHref: string;
	};

	let { extension, detailHref }: Props = $props();

	let installTab = $state<'skills' | 'mcp'>('skills');

	const overview = $derived(extension.description ?? extension.excerpt ?? 'No overview available.');

	const skillsInstall = $derived(extension.installCommandSkills?.trim() || null);

	const mcpInstall = $derived.by(() => {
		const command = extension.installCommandMcp?.trim();
		if (command) return command;
		const config = extension.mcpServerConfig;
		if (!config || Object.keys(config).length === 0) return null;
		return JSON.stringify(config, null, 2);
	});

	const installCommand = $derived.by(() => {
		if (extension.extensionType === 'mcp') return mcpInstall;
		if (extension.extensionType === 'skills') return skillsInstall;
		return null;
	});

	const showBothInstallTabs = $derived(extension.extensionType === 'both' && (skillsInstall || mcpInstall));

	const skillsGuideUrl = $derived(extension.clickUrlSkills?.trim() || null);
	const mcpGuideUrl = $derived(extension.clickUrlMcp?.trim() || null);

	const tabTriggerClass =
		'h-auto min-h-0 rounded-md border-0 !border-b-0 bg-transparent px-3 py-1.5 text-xs font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content [&.tab-active]:bg-primary [&.tab-active]:text-primary-content';
</script>

<div class="space-y-4 pt-4">
	<div>
		<h4 class="mb-1 text-sm font-semibold text-base-content">Overview</h4>
		<p class="text-sm leading-relaxed text-base-content/80">{overview}</p>
	</div>

	{#if showBothInstallTabs}
		<div>
			<h4 class="mb-2 text-sm font-semibold text-base-content">Install</h4>
			<Tabs.Root bind:value={installTab} class="space-y-3">
				<Tabs.List class="inline-flex gap-1 rounded-lg border border-base-content/15 bg-base-200/60 p-1">
					<Tabs.Trigger value="skills" class={tabTriggerClass}>Skills</Tabs.Trigger>
					<Tabs.Trigger value="mcp" class={tabTriggerClass}>MCP</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="skills">
					{#if skillsInstall}
						<TerminalCommandMock
							code={skillsInstall}
							ariaLabel={`Skills install command for ${extension.title}`}
						/>
					{:else}
						<p class="text-sm text-base-content/70">Skills install command coming soon.</p>
					{/if}
				</Tabs.Content>
				<Tabs.Content value="mcp">
					{#if mcpInstall}
						<TerminalCommandMock
							code={mcpInstall}
							ariaLabel={`MCP install for ${extension.title}`}
						/>
					{:else}
						<p class="text-sm text-base-content/70">MCP install instructions coming soon.</p>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		</div>
	{:else if installCommand}
		<div>
			<h4 class="mb-2 text-sm font-semibold text-base-content">Install</h4>
			<TerminalCommandMock code={installCommand} ariaLabel={`Install command for ${extension.title}`} />
		</div>
	{/if}

	<div class="flex flex-wrap gap-2">
		<Button href={detailHref} variant="primary" size="sm">View details</Button>
		{#if extension.extensionType === 'both'}
			{#if installTab === 'skills' && skillsGuideUrl}
				<Button href={skillsGuideUrl} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">
					Skill Doc
				</Button>
			{:else if installTab === 'mcp' && mcpGuideUrl}
				<Button href={mcpGuideUrl} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">
					MCP Doc
				</Button>
			{/if}
		{/if}
	</div>
</div>
