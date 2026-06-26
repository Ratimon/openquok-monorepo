<script lang="ts">
	import type { IntegrationCatalogItemProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';
	import type { OnboardingMode } from '$lib/ui/components/onboarding/onboarding.types';
	import type { OnboardingMcpClientId } from '$lib/ui/components/onboarding/mcp/onboardingMcpClients';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import { absoluteUrl, route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import { integrationsRepository } from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';

	import { cn } from '$lib/ui/helpers/common';

	import OnboardingAgentCliStep from '$lib/ui/components/onboarding/agent/OnboardingAgentCliStep.svelte';
	import OnboardingAgentConnectStep from '$lib/ui/components/onboarding/agent/OnboardingAgentConnectStep.svelte';
	import OnboardingMcpConnectStep from '$lib/ui/components/onboarding/mcp/OnboardingMcpConnectStep.svelte';
	import OnboardingChannelStep from '$lib/ui/components/onboarding/OnboardingChannelStep.svelte';
	import OnboardingTutorialStep from '$lib/ui/components/onboarding/OnboardingTutorialStep.svelte';
	import {
		ONBOARDING_DIALOG_CONTENT_CLASS,
		ONBOARDING_FOOTER_CLASS,
		ONBOARDING_MODAL_BODY_CLASS,
		ONBOARDING_MODE_TAB_TRIGGER_CLASS,
		ONBOARDING_SCROLL_BODY_CLASS
	} from '$lib/ui/components/onboarding/onboardingConstants';
	import {
		getOnboardingStepKind,
		getOnboardingStepLabels,
		getOnboardingTotalSteps
	} from '$lib/ui/components/onboarding/onboardingSteps';

	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import * as Tabs from '$lib/ui/tabs';
	import * as Tooltip from '$lib/ui/tooltip';

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

	const totalSteps = $derived(getOnboardingTotalSteps(onboardingMode));
	const stepLabels = $derived(getOnboardingStepLabels(onboardingMode));
	const stepKind = $derived(getOnboardingStepKind(onboardingMode, step));

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
	<Dialog.Content class={cn(ONBOARDING_DIALOG_CONTENT_CLASS)}>
		<Tooltip.Provider delayDuration={200}>
			<div class={ONBOARDING_MODAL_BODY_CLASS}>
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
								<Tabs.Trigger value="agent" class={ONBOARDING_MODE_TAB_TRIGGER_CLASS}>Agent</Tabs.Trigger>
								<Tabs.Trigger value="mcp" class={ONBOARDING_MODE_TAB_TRIGGER_CLASS}>MCP</Tabs.Trigger>
								<Tabs.Trigger value="dashboard" class={ONBOARDING_MODE_TAB_TRIGGER_CLASS}>Dashboard</Tabs.Trigger>
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

				<div class={ONBOARDING_SCROLL_BODY_CLASS}>
					{#if stepKind === 'channel'}
						<OnboardingChannelStep {providers} {loading} {onPickProvider} />
					{:else if stepKind === 'connect-agent'}
						<OnboardingAgentConnectStep />
					{:else if stepKind === 'connect-mcp'}
						<OnboardingMcpConnectStep bind:selectedClient={mcpClientId} />
					{:else if stepKind === 'cli'}
						<OnboardingAgentCliStep />
					{:else}
						<OnboardingTutorialStep mode={onboardingMode} />
					{/if}
				</div>

				<div class={cn(ONBOARDING_FOOTER_CLASS, stepKind === 'channel' ? 'justify-end' : 'justify-between')}>
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
