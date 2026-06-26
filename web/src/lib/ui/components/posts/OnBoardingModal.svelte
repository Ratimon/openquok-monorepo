<script lang="ts">
	import type { IntegrationCatalogItemProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import { buildAccountSettingsSearchParams } from '$lib/settings/utils/buildAccountSettingsSearch';
	import { absoluteUrl, route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import { integrationsRepository } from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';

	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CopyBlock from '$lib/ui/components/CopyBlock.svelte';
	import HeroVideoModal from '$lib/ui/modals/HeroVideoModal.svelte';
	import OnboardingAgentConnectPanel from '$lib/ui/components/posts/OnboardingAgentConnectPanel.svelte';
	import OnboardingMcpConnectPanel from '$lib/ui/components/posts/OnboardingMcpConnectPanel.svelte';
	import DevelopersAccessBadges from '$lib/ui/components/posts/DevelopersAccessBadges.svelte';
	import type { OnboardingMcpClientId } from '$lib/ui/components/posts/onboardingMcpClients';
	import * as Dialog from '$lib/ui/dialog';
	import * as Tabs from '$lib/ui/tabs';
	import * as Tooltip from '$lib/ui/tooltip';

	type OnboardingMode = 'agent' | 'mcp' | 'dashboard';
	type StepKind = 'channel' | 'connect-agent' | 'cli' | 'connect-mcp' | 'tutorial';

	type Props = {
		open: boolean;
		onOpenChange?: (next: boolean) => void;
	};

	let { open, onOpenChange }: Props = $props();

	let onboardingMode = $state<OnboardingMode>('agent');
	let modeTabValue = $state<OnboardingMode>('agent');
	let mcpClientId = $state<OnboardingMcpClientId>('cursor');
	let step = $state(1);
	let loading = $state(false);
	let providers = $state<IntegrationCatalogItemProgrammerModel[]>([]);

	const currentWorkspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);
	const accountRoot = $derived(accountPath);
	const returnTo = $derived(page.url.pathname || accountRoot);
	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);
	const cliDocsHref = $derived(url(`${publicDocsPath}/getting-started-for-cli`));
	const cliAuthDocsHref = $derived(url(`${publicDocsPath}/getting-started-for-cli/authentication`));
	const openclawDocsHref = $derived(url(`${publicDocsPath}/agent-setup-guides/openclaw`));
	const hermesDocsHref = $derived(url(`${publicDocsPath}/agent-setup-guides/hermes`));
	const apiKeySettingsHref = $derived(
		url(`${accountRoot}/settings?${buildAccountSettingsSearchParams('developers')}`)
	);

	const installCliCommand = 'npm install -g @openquok/auto-cli';
	const installAgentSkillCommand =
		'npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-core';

	const onboardingYoutubeVideoId = 'iKNimZ9FBu8';
	const onboardingVideoThumbnailAlt = 'OpenQuok getting started tutorial';
	const onboardingVideoSrc = $derived(
		`https://www.youtube.com/embed/${onboardingYoutubeVideoId}?autoplay=1&rel=0`
	);
	const onboardingVideoThumbnailSrc = $derived(
		`https://img.youtube.com/vi/${onboardingYoutubeVideoId}/maxresdefault.jpg`
	);

	const totalSteps = $derived(onboardingMode === 'dashboard' ? 2 : onboardingMode === 'mcp' ? 3 : 4);
	const stepLabels = $derived.by(() => {
		if (onboardingMode === 'dashboard') {
			return ['Add channel', 'Watch tutorial'] as const;
		}
		if (onboardingMode === 'mcp') {
			return ['Add channel', 'Connect MCP client', 'Watch tutorial'] as const;
		}
		return ['Add channel', 'Connect agent', 'CLI & agents', 'Watch tutorial'] as const;
	});
	const stepKind = $derived.by((): StepKind => {
		if (onboardingMode === 'dashboard') {
			return step === 1 ? 'channel' : 'tutorial';
		}
		if (onboardingMode === 'mcp') {
			if (step === 1) return 'channel';
			if (step === 2) return 'connect-mcp';
			return 'tutorial';
		}
		if (step === 1) return 'channel';
		if (step === 2) return 'connect-agent';
		if (step === 3) return 'cli';
		return 'tutorial';
	});

	const modeTabTriggerClass =
		'h-auto min-h-0 rounded-full border-0 !border-b-0 bg-transparent px-5 py-2 text-sm font-medium text-base-content/55 hover:text-base-content [&.tab-active]:bg-base-100 [&.tab-active]:text-base-content [&.tab-active]:shadow-none';

	const inlineTerminalCodeClass =
		'rounded bg-primary/15 px-1.5 py-0.5 font-mono text-xs text-primary';

	const dialogContentClass =
		'flex w-full max-w-[min(96vw,90rem)] max-h-[min(92vh,900px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl lg:max-w-7xl xl:max-w-[min(96vw,90rem)]';
	const modalBodyClass = 'flex min-h-0 flex-1 flex-col overflow-hidden';
	const scrollBodyClass = 'min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]';
	const footerClass = 'flex shrink-0 items-center gap-2 border-t border-base-300 bg-base-100 px-6 py-4';

	async function ensureWorkspaceLoaded() {
		if (currentWorkspaceId) return;
		await workspaceSettingsPresenter.load({ includeTeam: false });
	}

	async function loadProviders() {
		loading = true;
		try {
			providers = await integrationsRepository.getCatalog();
		} catch {
			providers = [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (!open) return;
		onboardingMode = 'agent';
		modeTabValue = 'agent';
		mcpClientId = 'cursor';
		step = 1;
		void ensureWorkspaceLoaded().then(() => {
			if (!workspaceSettingsPresenter.currentWorkspaceId) {
				toast.error('Create or select a workspace in Account settings before adding channels.');
				onOpenChange?.(false);
				return;
			}
			void loadProviders();
		});
	});

	function onModeChange(next: OnboardingMode) {
		if (next === onboardingMode) return;
		onboardingMode = next;
		step = 1;
	}

	$effect(() => {
		modeTabValue = onboardingMode;
	});

	$effect(() => {
		if (modeTabValue !== onboardingMode) {
			onModeChange(modeTabValue);
		}
	});

	function close() {
		onOpenChange?.(false);
	}

	function onPickProvider(identifier: string) {
		const workspaceId = workspaceSettingsPresenter.currentWorkspaceId;
		if (!workspaceId) {
			toast.error('Create or select a workspace before connecting a channel.');
			return;
		}
		close();
		const connectPath = integrationOAuthCallbackPath(identifier);
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo,
			onboarding: 'true'
		});
		goto(absoluteUrl(`${connectPath}?${qs}`));
	}

	function finish() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('onboarding:completed', 'true');
		}
		close();
	}

	function goBack() {
		step = Math.max(1, step - 1);
	}

	function goNext() {
		step = Math.min(totalSteps, step + 1);
	}

	function goToStep(target: number) {
		step = Math.min(Math.max(1, target), totalSteps);
	}

	function onStepKeydown(target: number, event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			goToStep(target);
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => onOpenChange?.(v)}>
	<Dialog.Content class={cn(dialogContentClass)}>
		<Tooltip.Provider delayDuration={200}>
			<div class={modalBodyClass}>
			<div class="relative shrink-0 border-b border-base-300 px-6 py-5">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<Dialog.Title class="text-xl font-semibold text-base-content">Connect your channels</Dialog.Title>
						<Dialog.Description class="mt-1 text-sm text-base-content/70">
							Step {step} of {totalSteps}
						</Dialog.Description>
					</div>

					<Tabs.Root bind:value={modeTabValue} class="shrink-0">
						<Tabs.List
							class="inline-flex gap-0 rounded-full border border-base-content/15 bg-base-300 p-1 !border-solid"
						>
							<Tabs.Trigger value="agent" class={modeTabTriggerClass}>Agent</Tabs.Trigger>
							<Tabs.Trigger value="mcp" class={modeTabTriggerClass}>MCP</Tabs.Trigger>
							<Tabs.Trigger value="dashboard" class={modeTabTriggerClass}>Dashboard</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>
				</div>

				<ul
					class="steps steps-vertical mt-4 w-full sm:steps-horizontal"
					aria-label="Onboarding progress"
				>
					{#each stepLabels as label, index (label)}
						{@const stepNumber = index + 1}
						<li
							class={cn(
								'step group relative cursor-pointer',
								step >= stepNumber && 'step-primary',
								step === stepNumber && 'font-semibold'
							)}
							style:z-index={totalSteps - index}
							aria-current={step === stepNumber ? 'step' : undefined}
						>
							<button
								type="button"
								class="absolute inset-0 z-10 cursor-pointer border-0 bg-transparent p-0 focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								aria-label={`Go to step ${stepNumber}: ${label}`}
								onclick={() => goToStep(stepNumber)}
								onkeydown={(event) => onStepKeydown(stepNumber, event)}
							></button>
							<span class="pointer-events-none transition-opacity group-hover:opacity-80">{label}</span>
						</li>
					{/each}
				</ul>
			</div>

			<div class={scrollBodyClass}>
			{#if stepKind === 'channel'}
				<div class="px-6 py-6">
					<p class="mb-4 text-sm text-base-content/70">Click a channel to add it.</p>
					{#if loading}
						<div class="flex items-center gap-2 py-10 text-base-content/70">
							<AbstractIcon
								name={icons.LoaderCircle.name}
								class="h-4 w-4 animate-spin"
								width="16"
								height="16"
							/>
							Loading providers…
						</div>
					{:else if providers.length === 0}
						<div class="py-10 text-sm text-base-content/70">No providers available right now.</div>
					{:else}
						<div
							class={cn(
								'grid gap-[10px] justify-items-center justify-center',
								'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9'
							)}
						>
							{#each providers as p (p.identifier)}
								<button
									type="button"
									class="group relative flex h-[94px] w-full max-w-[150px] flex-col items-center justify-center gap-2 rounded-xl border border-base-300 bg-base-100 px-3 py-3 text-center hover:bg-base-200"
									onclick={() => onPickProvider(p.identifier)}
								>
									<div class="grid h-10 w-10 place-items-center rounded-lg bg-base-200">
										<AbstractIcon
											name={socialProviderIcon(p.identifier)}
											class="h-6 w-6"
											width="24"
											height="24"
										/>
									</div>
									<div class="line-clamp-1 text-sm font-medium text-base-content">
										{p.name ?? p.identifier}
									</div>
									{#if p.toolTip}
										<Tooltip.Root>
											<Tooltip.Trigger>
												{#snippet child({ props: tipProps })}
													{@const { class: tipClass, ...tipRest } = tipProps}
													<span
														{...tipRest}
														class={`absolute right-2 top-2 ${String(tipClass ?? '')} text-base-content/70 group-hover:text-base-content`}
														aria-label="More info"
													>
														<AbstractIcon
															name={icons.FileQuestionMark.name}
															class="h-4 w-4"
															width="16"
															height="16"
														/>
													</span>
												{/snippet}
											</Tooltip.Trigger>
											<Tooltip.Content side="top">{p.toolTip}</Tooltip.Content>
										</Tooltip.Root>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{:else if stepKind === 'connect-agent'}
				<div class="px-6 py-6">
					<h3 class="text-lg font-semibold text-base-content">Connect your AI agent</h3>
					<p class="mt-2 max-w-3xl text-sm text-base-content/70">
						Install OpenClaw or Hermes Agent on a host you control, connect Telegram or another chat
						app, then continue to install the OpenQuok CLI and skill.
					</p>

					<div class="mt-6">
						<OnboardingAgentConnectPanel />
					</div>
				</div>
			{:else if stepKind === 'connect-mcp'}
				<div class="px-6 py-6">
					<h3 class="text-lg font-semibold text-base-content">Connect your MCP client</h3>
					<p class="mt-2 max-w-3xl text-sm text-base-content/70">
						Pick Cursor, Claude Code, Codex, or VS Code, generate an
						<code class={inlineTerminalCodeClass}>opo_…</code> token, and paste the config — no CLI
						skill required.
					</p>

					<div class="mt-6">
						<OnboardingMcpConnectPanel
							bind:selectedClient={mcpClientId}
							apiKeySettingsHref={apiKeySettingsHref}
						/>
					</div>
				</div>
			{:else if stepKind === 'cli'}
				<div class="px-6 py-6">
					<h3 class="text-lg font-semibold text-base-content">Automate with the CLI and your agent</h3>

					<ol class="mt-5 space-y-4 text-sm text-base-content/80">
						<li class="flex gap-3">
							<span
								class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
								aria-hidden="true"
							>1</span>
							<div class="min-w-0 flex-1 space-y-2">
								<p class="font-medium text-base-content">Install the CLI</p>
								<CopyBlock
									text={installCliCommand}
									boxClass="w-full cursor-pointer overflow-x-auto rounded-lg border p-3 pr-14 font-mono text-xs text-left"
									background="border-base-300 bg-base-200/80"
									copiedBackground="border-success/50 bg-success/10"
									class="text-base-content whitespace-nowrap"
									copiedColor="text-success"
								/>
							</div>
						</li>
						<li class="flex gap-3">
							<span
								class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
								aria-hidden="true"
							>2</span>
							<div class="min-w-0 flex-1 space-y-2">
								<p class="font-medium text-base-content">Authenticate (2 options)</p>
								<p>
									<strong class="font-medium text-base-content">OAuth2 (suggested)</strong> — run
									<code class={inlineTerminalCodeClass}>openquok auth:login</code>
									for device-flow login. Credentials are stored at
									<code class={inlineTerminalCodeClass}>~/.openquok/credentials.json</code>.
								</p>
								<p class="inline-flex flex-wrap items-center gap-1">
									<strong class="font-medium text-base-content">Programmatic token</strong> — for CI and
									scripts, rotate an
									<code class={inlineTerminalCodeClass}>opo_…</code>
									token from <DevelopersAccessBadges />, then run
									<code class={inlineTerminalCodeClass}>openquok auth:login --apiKey "opo_…"</code>.
								</p>
							</div>
						</li>
						<li class="flex gap-3">
							<span
								class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
								aria-hidden="true"
							>3</span>
							<div class="min-w-0 flex-1 space-y-2">
								<p class="font-medium text-base-content">Set up your AI agent</p>
								<p>
									Install the
									<code class={inlineTerminalCodeClass}>openquok-core</code>
									skill for your agent that supports project skills (e.g. OpenClaw, Hermes, and others).
									The skill teaches Openquok CLI usage; run the install command below:
								</p>
								<CopyBlock
									text={installAgentSkillCommand}
									boxClass="w-full cursor-pointer overflow-x-auto rounded-lg border p-3 pr-14 font-mono text-xs text-left"
									background="border-base-300 bg-base-200/80"
									copiedBackground="border-success/50 bg-success/10"
									class="text-base-content whitespace-nowrap"
									copiedColor="text-success"
								/>
							</div>
						</li>
					</ol>

					<div class="mt-6 flex flex-wrap gap-2">
						<Button
							variant="outline"
							size="sm"
							class="gap-1.5"
							href={cliDocsHref}
							target="_blank"
							rel="noopener noreferrer"
						>
							<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
							CLI documentation
						</Button>
						<Button
							variant="outline"
							size="sm"
							class="gap-1.5"
							href={cliAuthDocsHref}
							target="_blank"
							rel="noopener noreferrer"
						>
							<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
							Authentication guide
						</Button>
						<Button
							variant="outline"
							size="sm"
							class="gap-1.5"
							href={openclawDocsHref}
							target="_blank"
							rel="noopener noreferrer"
						>
							<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
							OpenClaw guide
						</Button>
						<Button
							variant="outline"
							size="sm"
							class="gap-1.5"
							href={hermesDocsHref}
							target="_blank"
							rel="noopener noreferrer"
						>
							<AbstractIcon name={icons.BookOpen.name} class="size-4" width="16" height="16" />
							Hermes guide
						</Button>
						<Button variant="primary" size="sm" href={apiKeySettingsHref}>Get programmatic token</Button>
					</div>
				</div>
			{:else}
				<div class="px-6 py-6">
					<h3 class="text-lg font-semibold text-base-content">Watch a quick tutorial</h3>
					<p class="mt-2 max-w-2xl text-sm text-base-content/70">
						{#if onboardingMode === 'agent'}
							See how to connect channels, use the CLI, and automate posting with your agent.
						{:else if onboardingMode === 'mcp'}
							See how to connect channels and schedule posts from Cursor, Claude Code, or another MCP
							client.
						{:else}
							See how to connect channels and manage posts from the OpenQuok dashboard.
						{/if}
					</p>

					<div class="mx-auto mt-6 max-w-4xl">
						<HeroVideoModal
							animationStyle="from-center"
							videoSrc={onboardingVideoSrc}
							thumbnailSrc={onboardingVideoThumbnailSrc}
							thumbnailAlt={onboardingVideoThumbnailAlt}
						/>
					</div>
				</div>
			{/if}
			</div>

			<div class={cn(footerClass, stepKind === 'channel' ? 'justify-end' : 'justify-between')}>
				{#if stepKind === 'channel'}
					<Button variant="ghost" type="button" onclick={close}>Close</Button>
					<Button type="button" onclick={goNext}>Next</Button>
				{:else if stepKind === 'tutorial'}
					<Button variant="ghost" type="button" onclick={goBack}>Back</Button>
					<div class="flex items-center gap-2">
						<Button variant="ghost" type="button" onclick={close}>Close</Button>
						<Button type="button" onclick={finish}>Finish</Button>
					</div>
				{:else}
					<Button variant="ghost" type="button" onclick={goBack}>Back</Button>
					<Button type="button" onclick={goNext}>Next</Button>
				{/if}
			</div>
			</div>
		</Tooltip.Provider>
	</Dialog.Content>
</Dialog.Root>
