<script lang="ts">
    import type { IntegrationCatalogItemProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';

	import { goto } from '$app/navigation';
	import { getRootPathAccount } from '$lib/area-protected';
	import { integrationOAuthCallbackPath } from '$lib/integration/oauthCallbackPath';
	import { absoluteUrl, route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icon';

	import { integrationsRepository } from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';

    import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tooltip from '$lib/ui/tooltip';
	import { cn } from '$lib/ui/helpers/common';
	import { socialProviderIcon } from '$lib/posts/constants/socialProviderIcons';

	type Props = {
		/** Path to return to after OAuth (path only, e.g. `/account`). Passed to the integration backend as `externalUrl`. */
		returnToPath?: string;
		buttonLabel?: string;
		/** When true, propagate `?onboarding=true` through the OAuth flow. */
		onboarding?: boolean;
		/** When true, selecting a provider copies an invite URL instead of navigating. */
		invite?: boolean;
		/** When true, render as icon-only button (useful for the invite-link button). */
		iconOnly?: boolean;
		/** After at least one channel exists, Add Channel / invite use secondary instead of primary. */
		hasConnectedChannels?: boolean;
	};

	let {
		returnToPath,
		buttonLabel = 'Add Channel',
		onboarding = false,
		invite = false,
		iconOnly = false,
		hasConnectedChannels = false
	}: Props = $props();

	const channelButtonVariant = $derived(hasConnectedChannels ? 'secondary' : 'primary');

	let open = $state(false);
	let loading = $state(false);
	let providers = $state<IntegrationCatalogItemProgrammerModel[]>([]);

	const currentWorkspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

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
		void ensureWorkspaceLoaded().then(() => {
			if (!workspaceSettingsPresenter.currentWorkspaceId) {
				toast.error('Create or select a workspace in Account settings before adding channels.');
				open = false;
				return;
			}
			void loadProviders();
		});
	});

	function onPickProvider(identifier: string) {
		const workspaceId = workspaceSettingsPresenter.currentWorkspaceId;
		if (!workspaceId) {
			toast.error('Create or select a workspace before connecting a channel.');
			return;
		}
		if (invite) {
			void (async () => {
				const r = await integrationsRepository.getAuthorizeUrl({
					organizationId: workspaceId,
					provider: identifier,
					...(onboarding ? { onboarding: 'true' } : {})
				});
				if (!('url' in r)) {
					toast.error(r.error);
					return;
				}
				try {
					await navigator.clipboard.writeText(r.url);
					toast.success('Invite link copied to clipboard (valid for 1 hour).');
					open = false;
				} catch {
					toast.error('Could not copy invite link.');
				}
			})();
			return;
		}

		open = false;
		const accountRoot = route(getRootPathAccount());
		const afterConnect = returnToPath ?? accountRoot;
		const connectPath = integrationOAuthCallbackPath(identifier);
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo: afterConnect,
			...(onboarding ? { onboarding: 'true' } : {})
		});
		goto(absoluteUrl(`${connectPath}?${qs}`));
	}
</script>

<Dialog.Root bind:open>
	{#if invite && iconOnly}
		<Button
			type="button"
			variant={channelButtonVariant}
			class="gap-1.5 border-base-300"
			onclick={() => (open = true)}
			aria-label={buttonLabel}
			title={buttonLabel}
		>
			<AbstractIcon name={icons.Link.name} class="size-4" width="16" height="16" />
			{buttonLabel}
		</Button>
	{:else}
		<Button
			class="gap-2"
			type="button"
			variant={channelButtonVariant}
			onclick={() => (open = true)}
		>
			<AbstractIcon name={icons.Plus.name} class="h-4 w-4" width="16" height="16" />
			{buttonLabel}
		</Button>
	{/if}
	<Dialog.Content
		class={cn(
			'w-full max-w-[min(96vw,90rem)] gap-0 p-0 sm:max-w-6xl lg:max-w-7xl xl:max-w-[min(96vw,90rem)]'
		)}
	>
		<Tooltip.Provider delayDuration={200}>
		<div class="relative border-b border-base-300 px-6 pb-2 pt-3">
			<Dialog.Title class="text-xl font-semibold text-base-content">
				Add Channel
			</Dialog.Title>
			<Dialog.Description class="mt-0.5 text-sm text-base-content/70">
				Click a channel to connect it.
			</Dialog.Description>
		</div>

		{#if loading}
			<div class="flex items-center gap-2 px-6 py-8 text-base-content/70">
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class="h-4 w-4 animate-spin"
					width="16"
					height="16"
				/>
				Loading providers…
			</div>
		{:else if providers.length === 0}
			<div class="px-6 py-8 text-sm text-base-content/70">
				No providers available right now.
			</div>
		{:else}
			{@const visibleProviders = invite
				? providers.filter((p) => !p.isExternal && !p.isWeb3 && !p.isChromeExtension && !p.customFields)
				: providers}
			<div class="px-6 pb-4 pt-1">
				<div
					class={cn(
						'grid gap-2 justify-items-stretch justify-center sm:gap-[10px]',
						onboarding
							? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9'
							: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
					)}
				>
				{#each visibleProviders as p (p.identifier)}
					<button
						type="button"
						class="group relative flex min-h-[5.5rem] w-full min-w-0 max-w-none flex-col items-stretch justify-start gap-1.5 overflow-visible rounded-xl border border-base-300 bg-base-100 px-2 py-2 text-center whitespace-normal hover:bg-base-200"
						onclick={() => onPickProvider(p.identifier)}
					>
						<div class="mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-base-200">
							<AbstractIcon name={socialProviderIcon(p.identifier)} class="h-6 w-6" width="24" height="24" />
						</div>
						<div
							class="min-w-0 w-full shrink text-balance break-words text-sm font-medium leading-snug text-base-content"
						>
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
			</div>
		{/if}
		</Tooltip.Provider>
	</Dialog.Content>
</Dialog.Root>

