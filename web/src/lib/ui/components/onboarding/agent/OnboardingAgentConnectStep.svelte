<script lang="ts">
	import * as Tabs from '$lib/ui/tabs';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import SafariMock from '$lib/ui/templates/device-mocks/safari/SafariMock.svelte';
	import SafariMockContent from '$lib/ui/templates/device-mocks/safari/SafariMockContent.svelte';

	import { ONBOARDING_INLINE_TERMINAL_CODE_CLASS } from '$lib/ui/components/onboarding/onboardingConstants';

	type AgentTab = 'openclaw' | 'hermes';

	const OPENCLAW_OFFICIAL_DOCS_HREF = 'https://docs.openclaw.ai';
	const HERMES_OFFICIAL_DOCS_HREF =
		'https://hermes-agent.nousresearch.com/docs/getting-started/quickstart';

	let agentTab = $state<AgentTab>('openclaw');

	const tabTriggerClass =
		'h-auto min-h-0 flex-1 rounded-lg border-0 !border-b-0 bg-transparent px-4 py-2.5 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content sm:flex-none [&.tab-active]:bg-primary [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';
</script>

<div class="px-6 py-6">
	<h3 class="text-lg font-semibold text-base-content">Connect your AI agent</h3>
	<p class="mt-2 max-w-3xl text-sm text-base-content/70">
		Install OpenClaw or Hermes Agent on a host you control, connect Telegram or another chat app, then
		continue to install the OpenQuok CLI and skill.
	</p>

	<div class="mt-6">
		<Tabs.Root bind:value={agentTab} defaultValue="openclaw" class="w-full">
			<Tabs.List
				class="inline-flex w-full max-w-md flex-wrap gap-1 rounded-xl border-2 border-base-content/15 bg-base-200/60 p-1 shadow-sm !border-solid"
			>
				<Tabs.Trigger value="openclaw" class={tabTriggerClass}>OpenClaw</Tabs.Trigger>
				<Tabs.Trigger value="hermes" class={tabTriggerClass}>Hermes Agent</Tabs.Trigger>
			</Tabs.List>

			<div class="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start">
				{#if agentTab === 'openclaw'}
					<div class="space-y-4">
						<p class="text-sm text-base-content/80">
							OpenClaw is a personal AI assistant on your own devices. Install it, pick a model, connect
							Telegram or WhatsApp, then add the OpenQuok skill in the next step.
						</p>
						<ol class="space-y-3 text-sm text-base-content/80">
							<li class="flex gap-3">
								<span
									class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
									aria-hidden="true"
								>1</span>
								<span>Install OpenClaw locally, in a container, or on a host with a persistent workspace.</span>
							</li>
							<li class="flex gap-3">
								<span
									class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
									aria-hidden="true"
								>2</span>
								<span>Choose your LLM provider and model.</span>
							</li>
							<li class="flex gap-3">
								<span
									class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
									aria-hidden="true"
								>3</span>
								<span>Connect WhatsApp, Telegram, Slack, or another chat app you already use.</span>
							</li>
						</ol>
						<Button
							variant="outline"
							size="sm"
							class="gap-1.5"
							href={OPENCLAW_OFFICIAL_DOCS_HREF}
							target="_blank"
							rel="noopener noreferrer"
						>
							<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
							OpenClaw documentation
						</Button>
					</div>
					<div
						class="mx-auto w-full max-w-xl overflow-hidden"
						role="img"
						aria-label="OpenClaw documentation overview at docs.openclaw.ai"
					>
						<SafariMock class="size-full" url="docs.openclaw.ai">
							<SafariMockContent content="openclaw-docs-overview" />
						</SafariMock>
					</div>
				{:else}
					<div class="space-y-4">
						<p class="text-sm text-base-content/80">
							Hermes Agent runs on your laptop or a cloud VM. Install it, pick a model, connect a messaging
							gateway, then add the OpenQuok skill in the next step.
						</p>
						<ol class="space-y-3 text-sm text-base-content/80">
							<li class="flex gap-3">
								<span
									class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
									aria-hidden="true"
								>1</span>
								<span>Run the one-line installer on Linux, macOS, WSL2, or Windows.</span>
							</li>
							<li class="flex gap-3">
								<span
									class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
									aria-hidden="true"
								>2
								</span>
								<span>
									Run <code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>hermes setup --portal</code> or
									<code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>hermes model</code> to pick your chat model.
								</span>
							</li>
							<li class="flex gap-3">
								<span
									class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
									aria-hidden="true"
								>3</span>
								<span>
									Run <code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>hermes gateway setup</code> for
									Telegram, Discord, Slack, or WhatsApp.
								</span>
							</li>
						</ol>
						<Button
							variant="outline"
							size="sm"
							class="gap-1.5"
							href={HERMES_OFFICIAL_DOCS_HREF}
							target="_blank"
							rel="noopener noreferrer"
						>
							<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
							Hermes documentation
						</Button>
					</div>
					<div
						class="mx-auto w-full max-w-xl overflow-hidden"
						role="img"
						aria-label="Hermes Agent documentation at hermes-agent.nousresearch.com"
					>
						<SafariMock class="size-full" url="hermes-agent.nousresearch.com">
							<SafariMockContent content="hermes-docs-overview" />
						</SafariMock>
					</div>
				{/if}
			</div>
		</Tabs.Root>
	</div>
</div>
