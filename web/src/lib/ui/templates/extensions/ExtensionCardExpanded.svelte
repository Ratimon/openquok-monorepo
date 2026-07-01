<script lang="ts">
	import type { ExtensionCardViewModel } from '$lib/listings/index';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';
	import ExtensionSkillCommandsTable from '$lib/ui/components/extensions/ExtensionSkillCommandsTable.svelte';
	import ExtensionMcpToolsTable from '$lib/ui/components/extensions/ExtensionMcpToolsTable.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tabs from '$lib/ui/tabs';

	type Props = {
		extensionVm: ExtensionCardViewModel;
		detailHref: string;
	};

	let { extensionVm, detailHref }: Props = $props();

	let installTab = $state<'skills' | 'mcp'>('skills');

	const overview = $derived(extensionVm.description ?? extensionVm.excerpt ?? 'No overview available.');

	const skillsInstall = $derived(extensionVm.installCommandSkills?.trim() || null);
	const mcpTools = $derived(extensionVm.mcpTools ?? []);
	const skillCommands = $derived(extensionVm.skillCommands ?? []);

	const showMcpTools = $derived(
		mcpTools.length > 0 &&
			(extensionVm.extensionType === 'mcp' ||
				(extensionVm.extensionType === 'both' && installTab === 'mcp'))
	);

	const showSkillCommands = $derived(
		skillCommands.length > 0 &&
			(extensionVm.extensionType === 'skills' ||
				(extensionVm.extensionType === 'both' && installTab === 'skills'))
	);

	const showSkillsInstall = $derived(
		Boolean(skillsInstall) &&
			(extensionVm.extensionType === 'skills' ||
				(extensionVm.extensionType === 'both' && installTab === 'skills'))
	);

	const showBothInstallTabs = $derived(
		extensionVm.extensionType === 'both' &&
			(skillsInstall || skillCommands.length > 0 || mcpTools.length > 0)
	);

	const showMcpOnlySection = $derived(extensionVm.extensionType === 'mcp' && mcpTools.length > 0);

	const showSkillsOnlySection = $derived(
		extensionVm.extensionType === 'skills' && (skillCommands.length > 0 || Boolean(skillsInstall))
	);

	const skillsGuideUrl = $derived(extensionVm.clickUrlSkills?.trim() || null);
	const mcpGuideUrl = $derived(extensionVm.clickUrlMcp?.trim() || null);

	const installSectionTitle = $derived.by(() => {
		if (showMcpTools) return 'MCP tools';
		if (showSkillCommands) return 'CLI commands';
		return 'Install';
	});

	const docButton = $derived.by(() => {
		if (extensionVm.extensionType === 'skills' && skillsGuideUrl) {
			return { label: 'Skill Setup Doc', href: skillsGuideUrl };
		}
		if (extensionVm.extensionType === 'mcp' && mcpGuideUrl) {
			return { label: 'MCP Setup Doc', href: mcpGuideUrl };
		}
		if (extensionVm.extensionType === 'both') {
			if (installTab === 'skills' && skillsGuideUrl) {
				return { label: 'Skill Setup Doc', href: skillsGuideUrl };
			}
			if (installTab === 'mcp' && mcpGuideUrl) {
				return { label: 'MCP Setup Doc', href: mcpGuideUrl };
			}
		}
		return null;
	});

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
			<h4 class="mb-2 text-sm font-semibold text-base-content">{installSectionTitle}</h4>
			<Tabs.Root bind:value={installTab} class="space-y-3">
				<Tabs.List class="inline-flex gap-1 rounded-lg border border-base-content/15 bg-base-200/60 p-1">
					<Tabs.Trigger value="skills" class={tabTriggerClass}>Skills</Tabs.Trigger>
					<Tabs.Trigger value="mcp" class={tabTriggerClass}>MCP</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="skills">
					{#if skillsInstall}
						<TerminalCommandMock
							code={skillsInstall}
							ariaLabel={`Skills install command for ${extensionVm.title}`}
						/>
					{/if}
					{#if skillCommands.length > 0}
						<div class={skillsInstall ? 'mt-3' : ''}>
							<ExtensionSkillCommandsTable commandsVm={skillCommands} compact />
						</div>
					{:else if !skillsInstall}
						<p class="text-sm text-base-content/70">Skills commands coming soon.</p>
					{/if}
				</Tabs.Content>
				<Tabs.Content value="mcp">
					{#if mcpTools.length > 0}
						<ExtensionMcpToolsTable toolsVm={mcpTools} compact />
					{:else}
						<p class="text-sm text-base-content/70">MCP tools coming soon.</p>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		</div>
	{:else if showMcpOnlySection}
		<div>
			<h4 class="mb-2 text-sm font-semibold text-base-content">MCP tools</h4>
			<ExtensionMcpToolsTable toolsVm={mcpTools} compact />
		</div>
	{:else if showSkillsOnlySection}
		<div>
			<h4 class="mb-2 text-sm font-semibold text-base-content">
				{skillCommands.length > 0 ? 'CLI commands' : 'Install'}
			</h4>
			{#if skillsInstall}
				<TerminalCommandMock code={skillsInstall} ariaLabel={`Install command for ${extensionVm.title}`} />
			{/if}
			{#if skillCommands.length > 0}
				<div class={skillsInstall ? 'mt-3' : ''}>
					<ExtensionSkillCommandsTable commandsVm={skillCommands} compact />
				</div>
			{/if}
		</div>
	{/if}

	<div class="flex flex-wrap gap-2">
		<Button href={detailHref} variant="primary" size="sm">View details</Button>
		{#if docButton}
			<Button href={docButton.href} variant="outline" size="sm" target="_blank" rel="noopener noreferrer">
				{docButton.label}
			</Button>
		{/if}
	</div>
</div>
