<script lang="ts">
	import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';
	import type { PublicMcpIntegrationTab } from '$lib/content/constants/publicMcpConfig';

	import { ONBOARDING_INLINE_TERMINAL_CODE_CLASS } from '$lib/ui/components/onboarding/onboardingConstants';

	import * as Tabs from '$lib/ui/tabs';
	import PublicMcpClientConfiguration from '$lib/ui/templates/landing-page/PublicMcpClientConfiguration.svelte';
	import PublicMcpSkillConfiguration from '$lib/ui/templates/landing-page/PublicMcpSkillConfiguration.svelte';

	type Props = {
		agentLabel: string;
		activeClient: McpClient;
		headingId: string;
		integrationTab?: PublicMcpIntegrationTab;
	};

	let {
		agentLabel,
		activeClient,
		headingId,
		integrationTab = $bindable<PublicMcpIntegrationTab>('mcp')
	}: Props = $props();

	const tabTriggerClass =
		'h-auto min-h-0 flex-1 rounded-lg border-0 !border-b-0 bg-transparent px-4 py-2.5 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content sm:flex-none [&.tab-active]:bg-primary [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';
</script>

<section class="space-y-4" aria-labelledby={headingId}>
	<div class="space-y-2 text-center">
		<h3
			id={headingId}
			class="text-sm font-semibold tracking-tight text-base-content/75 sm:text-base"
		>
			Connect OpenQuok
		</h3>
		<p class="text-sm leading-relaxed text-pretty text-base-content/65 sm:text-base">
			Use native MCP tools or install the <code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}
				>openquok-core</code
			> skill — {agentLabel} discovers commands through MCP or SKILL.md.
		</p>
	</div>

	<Tabs.Root bind:value={integrationTab} class="w-full">
		<Tabs.List
			class="inline-flex w-full max-w-md flex-wrap gap-1 rounded-xl border-2 border-base-content/15 bg-base-200/60 p-1 shadow-sm !border-solid"
		>
			<Tabs.Trigger value="mcp" class={tabTriggerClass}>MCP</Tabs.Trigger>
			<Tabs.Trigger value="skill" class={tabTriggerClass}>Skill</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="mcp">
			<PublicMcpClientConfiguration {activeClient} hideSectionHeader />
		</Tabs.Content>

		<Tabs.Content value="skill">
			<PublicMcpSkillConfiguration {agentLabel} />
		</Tabs.Content>
	</Tabs.Root>
</section>
