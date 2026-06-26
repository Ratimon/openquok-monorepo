<script lang="ts">
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import { getRootPathAccount } from '$lib/area-protected';
	import {
		getMcpClientConfig,
		MCP_TOKEN_PLACEHOLDER,
		resolveMcpBaseUrl
	} from '$lib/developers/utils/getMcpClientConfig';
	import { buildAccountSettingsSearchParams } from '$lib/settings/utils/buildAccountSettingsSearch';
	import { route, url } from '$lib/utils/path';

	import { icons } from '$data/icons';

	import {
		getOnboardingMcpClientById,
		ONBOARDING_MCP_CLIENTS,
		type OnboardingMcpClientId
	} from '$lib/ui/components/onboarding/mcp/onboardingMcpClients';
	import { ONBOARDING_INLINE_TERMINAL_CODE_CLASS } from '$lib/ui/components/onboarding/onboardingConstants';
	import DevelopersAccessBadges from '$lib/ui/components/onboarding/DevelopersAccessBadges.svelte';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CopyBlock from '$lib/ui/components/CopyBlock.svelte';
	import * as Tabs from '$lib/ui/tabs';

	type Props = {
		selectedClient?: OnboardingMcpClientId;
	};

	let { selectedClient = $bindable<OnboardingMcpClientId>('cursor') }: Props = $props();

	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);
	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);
	const apiKeySettingsHref = url(
		`${accountPath}/settings?${buildAccountSettingsSearchParams('developers')}`
	);
	const mcpIntroDocsHref = $derived(url(`${publicDocsPath}/getting-started-for-mcp`));
	const mcpSetupGuidesHref = $derived(url(`${publicDocsPath}/mcp-setup-guides`));

	const tabTriggerClass =
		'h-auto min-h-0 flex-1 rounded-lg border-0 !border-b-0 bg-transparent px-4 py-2.5 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content sm:flex-none [&.tab-active]:bg-primary [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';

	const activeClient = $derived(getOnboardingMcpClientById(selectedClient));
	const activeClientDocsHref = $derived(
		url(`${publicDocsPath}/mcp-setup-guides/${activeClient.docsSlug}`)
	);
	const mcpConfigSnippet = $derived(
		getMcpClientConfig(
			activeClient.mcpClient,
			'header',
			resolveMcpBaseUrl(),
			MCP_TOKEN_PLACEHOLDER
		)
	);
</script>

<div class="px-6 py-6">
	<h3 class="text-lg font-semibold text-base-content">Connect your MCP client</h3>
	<p class="mt-2 max-w-3xl text-sm text-base-content/70">
		Pick Cursor, Claude Code, Codex, or VS Code, generate an
		<code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>opo_…</code> token, and paste the config — no CLI
		skill required.
	</p>

	<div class="mt-6">
		<Tabs.Root bind:value={selectedClient} class="w-full">
			<Tabs.List
				class="inline-flex w-full max-w-2xl flex-wrap gap-1 rounded-xl border-2 border-base-content/15 bg-base-200/60 p-1 shadow-sm !border-solid"
			>
				{#each ONBOARDING_MCP_CLIENTS as client (client.id)}
					<Tabs.Trigger value={client.id} class={tabTriggerClass}>{client.label}</Tabs.Trigger>
				{/each}
			</Tabs.List>

			<div class="mt-6 space-y-8">
				<div class="grid gap-8 lg:grid-cols-2 lg:items-start">
					<div class="space-y-4">
						<p class="text-sm text-base-content/80">{activeClient.summary}</p>
						<ol class="space-y-3 text-sm text-base-content/80">
							{#each activeClient.steps as step, index (step)}
								<li class="flex gap-3">
									<span
										class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
										aria-hidden="true"
									>{index + 1}</span>
									<span>{step}</span>
								</li>
							{/each}
						</ol>
					</div>

					<div
						class="rounded-xl border border-base-300 bg-base-200/80 p-5"
						role="img"
						aria-label="OpenQuok MCP tools available in your AI client"
					>
						<p class="text-xs font-semibold uppercase tracking-wide text-base-content/55">What you unlock</p>
						<ul class="mt-4 space-y-3 text-sm text-base-content/85">
							<li class="flex gap-2">
								<AbstractIcon
									name={icons.Check.name}
									class="mt-0.5 size-4 shrink-0 text-success"
									width="16"
									height="16"
								/>
								<span><strong class="font-medium text-base-content">integrationList</strong> — list connected channels from chat</span>
							</li>
							<li class="flex gap-2">
								<AbstractIcon
									name={icons.Check.name}
									class="mt-0.5 size-4 shrink-0 text-success"
									width="16"
									height="16"
								/>
								<span><strong class="font-medium text-base-content">integrationSchema</strong> — platform limits and compose rules</span>
							</li>
							<li class="flex gap-2">
								<AbstractIcon
									name={icons.Check.name}
									class="mt-0.5 size-4 shrink-0 text-success"
									width="16"
									height="16"
								/>
								<span><strong class="font-medium text-base-content">schedulePostTool</strong> — draft and schedule posts in natural language</span>
							</li>
						</ul>
						<p class="mt-5 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content/75">
							Try: <em class="text-base-content">List my connected social media accounts</em>
						</p>
					</div>
				</div>

				<div class="rounded-xl border border-base-300 bg-base-100/50 p-5">
					<h4 class="text-sm font-semibold text-base-content">Token and configuration</h4>
					<ol class="mt-4 space-y-4 text-sm text-base-content/80">
						<li class="flex gap-3">
							<span
								class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
								aria-hidden="true"
							>1</span>
							<div class="min-w-0 flex-1 space-y-2">
								<p class="font-medium text-base-content">Generate your programmatic token</p>
								<p class="inline-flex flex-wrap items-center gap-1">
									Open <DevelopersAccessBadges />, create your OAuth app if needed, then generate an
									<code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>opo_…</code> token. Replace the placeholder in the
									snippet below.
								</p>
								<Button variant="primary" size="sm" href={apiKeySettingsHref}>Get programmatic token</Button>
							</div>
						</li>
						<li class="flex gap-3">
							<span
								class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
								aria-hidden="true"
							>2</span>
							<div class="min-w-0 flex-1 space-y-2">
								<p class="font-medium text-base-content">Copy config for {activeClient.label}</p>
								<p class="text-xs text-base-content/60">{mcpConfigSnippet.hint}</p>
								<CopyBlock
									text={mcpConfigSnippet.config}
									boxClass="w-full cursor-pointer overflow-x-auto rounded-lg border p-3 pr-14 font-mono text-xs text-left"
									background="border-base-300 bg-base-200/80"
									copiedBackground="border-success/50 bg-success/10"
									class="text-base-content whitespace-pre-wrap break-all"
									copiedColor="text-success"
								/>
							</div>
						</li>
						<li class="flex gap-3">
							<span
								class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
								aria-hidden="true"
							>3</span>
							<div class="min-w-0 flex-1">
								<p class="font-medium text-base-content">Verify in your client</p>
								<p class="mt-1">
									Ask your agent: <em>List my connected social media accounts</em>. It should call
									<code class={ONBOARDING_INLINE_TERMINAL_CODE_CLASS}>integrationList</code> and return your workspace
									channels.
								</p>
							</div>
						</li>
					</ol>
				</div>

				<div class="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						class="gap-1.5"
						href={activeClientDocsHref}
						target="_blank"
						rel="noopener noreferrer"
					>
						<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
						{activeClient.label} setup guide
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="gap-1.5"
						href={mcpIntroDocsHref}
						target="_blank"
						rel="noopener noreferrer"
					>
						<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
						MCP introduction
					</Button>
					<Button
						variant="ghost"
						size="sm"
						class="gap-1.5"
						href={mcpSetupGuidesHref}
						target="_blank"
						rel="noopener noreferrer"
					>
						All MCP clients
					</Button>
				</div>
			</div>
		</Tabs.Root>
	</div>
</div>
