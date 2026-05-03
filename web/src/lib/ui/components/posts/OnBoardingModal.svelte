<script lang="ts">
	import type { IntegrationCatalogItemProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import { absoluteUrl, route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';

	import { integrationsRepository } from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import * as Tooltip from '$lib/ui/tooltip';
	import { cn } from '$lib/ui/helpers/common';
	import { socialProviderIcon } from '$data/social-providers';

	type Props = {
		open: boolean;
		onOpenChange?: (next: boolean) => void;
	};

	let { open, onOpenChange }: Props = $props();

	let step = $state<1 | 2>(1);
	let loading = $state(false);
	let providers = $state<IntegrationCatalogItemProgrammerModel[]>([]);

	const currentWorkspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const accountRoot = $derived(route(getRootPathAccount()));
	const returnTo = $derived(page.url.pathname || accountRoot);

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
</script>

<Dialog.Root bind:open onOpenChange={(v) => onOpenChange?.(v)}>
	<!-- Same as AddProvider: override shared Dialog.Content `sm:max-w-lg` so the modal can be wide. -->
	<Dialog.Content
		class={cn('w-full max-w-[min(96vw,90rem)] p-0 sm:max-w-6xl lg:max-w-7xl xl:max-w-[min(96vw,90rem)]')}
	>
		<div class="relative border-b border-base-300 px-6 py-5">
			<div class="flex items-center justify-between gap-3">
				<div>
					<Dialog.Title class="text-xl font-semibold text-base-content">Connect your channels</Dialog.Title>
					<Dialog.Description class="mt-1 text-sm text-base-content/70">
						Step {step} of 2
					</Dialog.Description>
				</div>
			</div>

			<!-- DaisyUI Steps: https://daisyui.com/components/steps/ -->
			<ul
				class="steps steps-vertical mt-4 w-full sm:steps-horizontal"
				aria-label="Onboarding progress"
			>
				<li class={cn('step', step >= 1 && 'step-primary')}>
					Add channel</li>
				<li class={cn('step', step === 2 && 'step-primary')}>
					Watch tutorial</li>
			</ul>
		</div>

		{#if step === 1}
			<div class="px-6 py-6">
				<p class="mb-4 text-sm text-base-content/70">
					Click a channel to add it.</p>
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
					<div class="py-10 text-sm text-base-content/70">
						No providers available right now.</div>
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
									<AbstractIcon name={socialProviderIcon(p.identifier)} class="h-6 w-6" width="24" height="24" />
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
										<Tooltip.Content side="top">
											{p.toolTip}
										</Tooltip.Content>
									</Tooltip.Root>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="flex items-center justify-end gap-2 border-t border-base-300 px-6 py-4">
				<Button variant="ghost" type="button" onclick={close}>
					Close</Button>
				<Button type="button" onclick={() => (step = 2)}>
					Next</Button>
			</div>
		{:else}
			<div class="px-6 py-8">
				<h3 class="text-lg font-semibold text-base-content">
					Watch a quick tutorial</h3>
				<p class="mt-2 max-w-2xl text-sm text-base-content/70">
					This step is a placeholder for now. We’ll link a short walkthrough video here.
				</p>

				<div class="mt-6 rounded-xl border border-base-300 bg-base-100 p-5">
					<div class="flex items-center gap-3">
						<div class="grid h-10 w-10 place-items-center rounded-lg bg-base-200">
							<AbstractIcon name={icons.YouTube.name} class="h-6 w-6" width="24" height="24" />
						</div>
						<div class="min-w-0">
							<div class="font-medium text-base-content">
								Getting started (mock)</div>
							<div class="text-xs text-base-content/70">
								Coming soon</div>
						</div>
					</div>
				</div>
			</div>

			<div class="flex items-center justify-between gap-2 border-t border-base-300 px-6 py-4">
				<Button variant="ghost" type="button" onclick={() => (step = 1)}>
					Back</Button>
				<div class="flex items-center gap-2">
					<Button variant="ghost" type="button" onclick={close}>
						Close</Button>
					<Button type="button" onclick={finish}>
						Finish</Button>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

