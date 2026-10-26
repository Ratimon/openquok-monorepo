<script lang="ts">
	import {
		ACCOUNT_ADD_CHANNEL_QUERY,
		isAccountAddChannelDeepLink,
		type BrowserExtensionSessionCookie
	} from 'openquok-common';

	import type { IntegrationCatalogItemProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';
	import type { IntegrationCatalogCustomField } from '$lib/integrations/utils/credentialsConnect';
	import type { ButtonSize, ButtonVariant } from '$lib/ui/buttons/Button.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import {
		catalogItemHasCustomFields,
		encodeCredentialsConnectCode,
		normalizeCatalogCustomFields,
		timezoneOffsetMinutes
	} from '$lib/integrations/utils/credentialsConnect';
	import { absoluteUrl, route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';

	import { integrationsRepository } from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ChannelLimitUpgradeModal from '$lib/ui/components/channels/ChannelLimitUpgradeModal.svelte';
	import BrowserExtensionConnectDialog from '$lib/ui/components/posts/BrowserExtensionConnectDialog.svelte';
	import CredentialsConnectDialog from '$lib/ui/components/posts/CredentialsConnectDialog.svelte';
	import { afterExtensionChannelConnect } from '$lib/integrations/browser-extension/afterExtensionChannelConnect';
	import { encodeExtensionConnectCode } from '$lib/integrations/browser-extension/extensionConnectCode';
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tooltip from '$lib/ui/tooltip';
	import ChannelConnectLegalFooter from '$lib/ui/components/legal/ChannelConnectLegalFooter.svelte';
	import AddDirectoryLaunch from '$lib/ui/components/auto-launch/AddDirectoryLaunch.svelte';
	import DirectoryAddChannelTileIcon from '$lib/ui/components/auto-launch/DirectoryAddChannelTileIcon.svelte';
	import { autoLaunchRepository } from '$lib/auto-launch';
	import {
		buildDirectoryAddChannelTiles,
		type DirectoryAddChannelTileVm
	} from '$lib/auto-launch/buildDirectoryAddChannelTiles';
	import { linkDirectoryRepository } from '$lib/link-directory';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	import { cn } from '$lib/ui/helpers/common';
	import { socialProviderIcon } from '$data/social-providers';

	type AddChannelCategoryFilter = 'all' | 'directory' | 'social';

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
		/** Tooltip for the invite icon-only trigger; also used for `aria-label` when set. */
		iconOnlyTooltip?: string;
		/** After at least one channel exists, Add Channel / invite use secondary instead of primary. */
		hasConnectedChannels?: boolean;
		/** When set, overrides the variant derived from {@link hasConnectedChannels}. */
		buttonVariant?: ButtonVariant;
		buttonSize?: ButtonSize;
		buttonClass?: string;
		iconClass?: string;
		/** When true, opening the provider picker shows an upgrade prompt instead. */
		channelLimitFull?: boolean;
		upgradeHref?: string;
	};

	let {
		returnToPath,
		buttonLabel = 'Add Channel',
		onboarding = false,
		invite = false,
		iconOnly = false,
		iconOnlyTooltip,
		hasConnectedChannels = false,
		buttonVariant,
		buttonSize,
		buttonClass,
		iconClass,
		channelLimitFull = false,
		upgradeHref
	}: Props = $props();

	const channelButtonVariant = $derived(
		channelLimitFull
			? 'outline'
			: (buttonVariant ?? (hasConnectedChannels ? 'secondary' : 'primary'))
	);
	const triggerIconClass = $derived(iconClass ?? 'h-4 w-4');
	const lockedTriggerClass = $derived(
		channelLimitFull
			? 'border-warning/35 bg-warning/5 text-warning hover:border-warning/50 hover:bg-warning/10'
			: ''
	);
	const addChannelTriggerLabel = $derived(
		channelLimitFull ? 'Channel limit reached' : buttonLabel
	);
	const inviteLockedLabel = $derived(
		channelLimitFull ? 'Channel limit reached — cannot send invite link' : (iconOnlyTooltip ?? buttonLabel)
	);

	let open = $state(false);
	let upgradeDialogOpen = $state(false);
	let loading = $state(false);
	let providers = $state<IntegrationCatalogItemProgrammerModel[]>([]);
	let credentialsOpen = $state(false);
	let credentialsSubmitting = $state(false);
	let credentialsProviderName = $state('channel');
	let credentialsProviderIdentifier = $state('');
	let credentialsFields = $state<IntegrationCatalogCustomField[]>([]);
	let credentialsFinished = $state(false);
	let extensionOpen = $state(false);
	let extensionSubmitting = $state(false);
	let extensionProviderName = $state('channel');
	let extensionProviderIdentifier = $state('');
	let extensionFinished = $state(false);
	let directoryTiles = $state<DirectoryAddChannelTileVm[]>([]);
	let directoryLaunchOpen = $state(false);
	let activeDirectoryTile = $state<DirectoryAddChannelTileVm | null>(null);
	let directoryLogoFailedBySiteKey = $state<Record<string, boolean>>({});
	let channelCategoryFilter = $state<AddChannelCategoryFilter>('all');

	function categoryFilterButtonClass(active: boolean): string {
		return `inline-flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${
			active
				? 'bg-base-100 font-semibold text-base-content shadow-sm'
				: 'text-base-content/65 hover:bg-base-content/10 hover:text-base-content'
		}`;
	}

	function openAddChannelFlow() {
		if (channelLimitFull) {
			upgradeDialogOpen = true;
			return;
		}
		open = true;
	}

	let addChannelDeepLinkHandled = $state(false);

	$effect(() => {
		if (invite || addChannelDeepLinkHandled) return;
		if (!isAccountAddChannelDeepLink(page.url.searchParams)) return;
		addChannelDeepLinkHandled = true;
		void (async () => {
			await ensureWorkspaceLoaded();
			openAddChannelFlow();
			const next = new URL(page.url);
			next.searchParams.delete(ACCOUNT_ADD_CHANNEL_QUERY);
			const query = next.searchParams.toString();
			await goto(`${next.pathname}${query ? `?${query}` : ''}${next.hash}`, {
				replaceState: true,
				keepFocus: true
			});
		})();
	});

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
	async function loadDirectoryAddChannelTiles() {
		try {
			const [destinations, publishedSites] = await Promise.all([
				autoLaunchRepository.listDestinations(),
				linkDirectoryRepository.getPublishedSites({ limit: 500, skip: 0 })
			]);
			const sitesBySlug = new Map(
				publishedSites.sites.map((site) => [
					site.slug,
					{ title: site.title, logoUrl: site.logoUrl }
				])
			);
			directoryTiles = buildDirectoryAddChannelTiles(destinations, sitesBySlug);
		} catch {
			directoryTiles = [];
		}
		directoryLogoFailedBySiteKey = {};
	}

		if (!open) {
			channelCategoryFilter = 'all';
			return;
		}
		void ensureWorkspaceLoaded().then(() => {
			if (!workspaceSettingsPresenter.currentWorkspaceId) {
				toast.error('Create or select a workspace in Account settings before adding channels.');
				open = false;
				return;
			}
			void loadProviders();
		});
			void loadDirectoryAddChannelTiles();
	});

	function onPickProvider(identifier: string) {
		const workspaceId = workspaceSettingsPresenter.currentWorkspaceId;
		if (!workspaceId) {
			toast.error('Create or select a workspace before connecting a channel.');
			return;
		}
		if (invite) {
			void (async () => {
				const resultVm = await integrationsRepository.getAuthorizeUrl({
					organizationId: workspaceId,
					provider: identifier,
					...(onboarding ? { onboarding: 'true' } : {})
				});
				if (!('url' in resultVm)) {
					toast.error(resultVm.error);
					return;
				}
				try {
					await navigator.clipboard.writeText(resultVm.url);
					toast.success('Invite link copied to clipboard (valid for 1 hour).');
					open = false;
				} catch {
					toast.error('Could not copy invite link.');
				}
			})();
			return;
		}

		const catalogItem = providers.find((p) => p.identifier === identifier);
		if (catalogItem?.isChromeExtension) {
			open = false;
			extensionProviderIdentifier = identifier;
			extensionProviderName = catalogItem?.name ?? identifier;
			extensionFinished = false;
			extensionOpen = true;
			return;
		}
		const fields = normalizeCatalogCustomFields(catalogItem?.customFields);
		if (catalogItemHasCustomFields(catalogItem)) {
			open = false;
			credentialsProviderIdentifier = identifier;
			credentialsProviderName = catalogItem?.name ?? identifier;
			credentialsFields = fields;
			credentialsFinished = false;
			credentialsOpen = true;
			return;
		}

		open = false;
		const afterConnect = returnToPath ?? accountPath;
		const connectPath = integrationOAuthCallbackPath(identifier);
		const qs = new URLSearchParams({
			organizationId: workspaceId,
			returnTo: afterConnect,
			...(onboarding ? { onboarding: 'true' } : {})
		});
		goto(absoluteUrl(`${connectPath}?${qs}`));
	}

	async function submitCredentials(values: Record<string, string>) {
		const workspaceId = workspaceSettingsPresenter.currentWorkspaceId;
		const identifier = credentialsProviderIdentifier;
		if (!workspaceId || !identifier) {
			toast.error('Create or select a workspace before connecting a channel.');
			return;
		}
		credentialsSubmitting = true;
		try {
			const authorizeVm = await integrationsRepository.getAuthorizeUrl({
				organizationId: workspaceId,
				provider: identifier,
				...(onboarding ? { onboarding: 'true' } : {})
			});
			if (!('url' in authorizeVm)) {
				toast.error(authorizeVm.error);
				return;
			}
			const connectResult = await integrationsRepository.connectSocial(identifier, {
				state: authorizeVm.url,
				code: encodeCredentialsConnectCode(values),
				timezone: timezoneOffsetMinutes()
			});
			if (!connectResult.ok) {
				toast.error(connectResult.error);
				return;
			}
			toast.success(`${credentialsProviderName} connected.`);
			credentialsFinished = true;
			credentialsOpen = false;
			const afterConnect = returnToPath ?? accountPath;
			const successQs = new URLSearchParams({ added: identifier });
			if (onboarding) successQs.set('onboarding', 'true');
			await goto(absoluteUrl(`${afterConnect}?${successQs}`));
		} finally {
			credentialsSubmitting = false;
		}
	}

	function cancelCredentials() {
		if (credentialsFinished) return;
		credentialsOpen = false;
		credentialsProviderIdentifier = '';
		credentialsFields = [];
		if (!open) open = true;
	}

	async function submitExtensionConnect(cookies: BrowserExtensionSessionCookie[]) {
		const workspaceId = workspaceSettingsPresenter.currentWorkspaceId;
		const identifier = extensionProviderIdentifier;
		if (!workspaceId || !identifier) {
			toast.error('Create or select a workspace before connecting a channel.');
			return;
		}
		extensionSubmitting = true;
		try {
			const authorizeVm = await integrationsRepository.getAuthorizeUrl({
				organizationId: workspaceId,
				provider: identifier,
				...(onboarding ? { onboarding: 'true' } : {})
			});
			if (!('url' in authorizeVm)) {
				toast.error(authorizeVm.error);
				return;
			}
			const connectResult = await integrationsRepository.connectSocial(identifier, {
				state: authorizeVm.url,
				code: encodeExtensionConnectCode(cookies),
				timezone: timezoneOffsetMinutes()
			});
			if (!connectResult.ok) {
				toast.error(connectResult.error);
				return;
			}
			await afterExtensionChannelConnect({
				providerId: identifier,
				integrationId: connectResult.data.id,
				extensionToken: connectResult.data.extensionToken
			});
			toast.success(`${extensionProviderName} connected.`);
			extensionFinished = true;
			extensionOpen = false;
			const afterConnect = returnToPath ?? accountPath;
			const successQs = new URLSearchParams({ added: identifier });
			if (onboarding) successQs.set('onboarding', 'true');
			await goto(absoluteUrl(`${afterConnect}?${successQs}`));
		} finally {
			extensionSubmitting = false;
		}
	}

	function cancelExtensionConnect() {
		if (extensionFinished) return;
		extensionOpen = false;
		extensionProviderIdentifier = '';
		if (!open) open = true;
	}

	function openDirectoryLaunchPicker(tile: DirectoryAddChannelTileVm) {
		open = false;
		activeDirectoryTile = tile;
		directoryLaunchOpen = true;
	}

	function directoryTileShowsLogo(tile: DirectoryAddChannelTileVm): boolean {
		return Boolean(tile.logoUrl) && !directoryLogoFailedBySiteKey[tile.siteKey];
	}
</script>

<Dialog.Root bind:open>
	{#if invite && iconOnly}
		{#if iconOnlyTooltip && !channelLimitFull}
			<Tooltip.Provider delayDuration={200}>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props: triggerProps })}
							<span {...triggerProps} class="inline-flex max-xl:hidden">
								<Button
									type="button"
									variant={channelButtonVariant}
									size="icon"
									class={cn('shrink-0', lockedTriggerClass || 'border-base-300')}
									onclick={openAddChannelFlow}
									aria-label={inviteLockedLabel}
								>
									<AbstractIcon
										name={icons.Link.name}
										class="size-4"
										width="16"
										height="16"
									/>
								</Button>
							</span>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content side="top" sideOffset={8}>{iconOnlyTooltip}</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		{:else if channelLimitFull}
			<Button
				type="button"
				variant={channelButtonVariant}
				size="icon"
				class={cn('max-xl:hidden shrink-0', lockedTriggerClass || 'border-base-300')}
				onclick={openAddChannelFlow}
				aria-label={inviteLockedLabel}
				title={inviteLockedLabel}
			>
				<AbstractIcon name={icons.Lock.name} class="size-4" width="16" height="16" />
			</Button>
		{/if}
		<Button
			type="button"
			variant={channelButtonVariant}
			size="sm"
			class={cn('gap-1.5 xl:hidden', lockedTriggerClass, buttonClass)}
			onclick={openAddChannelFlow}
			aria-label={inviteLockedLabel}
		>
			<AbstractIcon
				name={channelLimitFull ? icons.Lock.name : icons.Link.name}
				class={triggerIconClass}
				width="16"
				height="16"
			/>
			{inviteLockedLabel}
		</Button>
	{:else if invite}
		<span class="inline-flex shrink-0">
			<Button
				class={cn('gap-2', lockedTriggerClass, buttonClass)}
				type="button"
				variant={channelButtonVariant}
				size={buttonSize}
				onclick={openAddChannelFlow}
				aria-label={inviteLockedLabel}
			>
				<AbstractIcon
					name={channelLimitFull ? icons.Lock.name : icons.Link.name}
					class={triggerIconClass}
					width="16"
					height="16"
				/>
				{inviteLockedLabel}
			</Button>
		</span>
	{:else}
		<span class="inline-flex shrink-0">
			<Button
				class={cn('gap-2', lockedTriggerClass, buttonClass)}
				type="button"
				variant={channelButtonVariant}
				size={buttonSize}
				onclick={openAddChannelFlow}
			>
				<AbstractIcon
					name={channelLimitFull ? icons.Lock.name : icons.Plus.name}
					class={triggerIconClass}
					width="14"
					height="14"
				/>
				{addChannelTriggerLabel}
			</Button>
		</span>
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
		{:else}
			{@const visibleProviders = invite
				? providers.filter(
						(p) =>
							!p.isExternal &&
							!p.isWeb3 &&
							!p.isChromeExtension &&
							!catalogItemHasCustomFields(p)
					)
				: providers}
			{@const showDirectoryTiles =
				!invite &&
				directoryTiles.length > 0 &&
				(channelCategoryFilter === 'all' || channelCategoryFilter === 'directory')}
			{@const showSocialProviders =
				visibleProviders.length > 0 &&
				(invite || channelCategoryFilter === 'all' || channelCategoryFilter === 'social')}
			{@const hasAnyChannelOption =
				(!invite && directoryTiles.length > 0) || visibleProviders.length > 0}
			{#if !hasAnyChannelOption}
				<div class="px-6 py-8 text-sm text-base-content/70">
					No providers available right now.
				</div>
			{:else}
			{#if !invite && directoryTiles.length > 0 && visibleProviders.length > 0}
				<div class="px-6 pb-3 pt-1">
					<div
						class="grid w-full max-w-2xl grid-cols-3 gap-1 rounded-lg bg-base-200 p-1 sm:inline-flex sm:w-auto sm:max-w-none sm:grid-cols-none"
						role="group"
						aria-label="Channel category"
					>
						<button
							type="button"
							class={categoryFilterButtonClass(channelCategoryFilter === 'all')}
							aria-pressed={channelCategoryFilter === 'all'}
							onclick={() => (channelCategoryFilter = 'all')}
						>
							All
						</button>
						<button
							type="button"
							class={categoryFilterButtonClass(channelCategoryFilter === 'social')}
							aria-pressed={channelCategoryFilter === 'social'}
							onclick={() => (channelCategoryFilter = 'social')}
						>
							Social platforms
						</button>
						<button
							type="button"
							class={categoryFilterButtonClass(channelCategoryFilter === 'directory')}
							aria-pressed={channelCategoryFilter === 'directory'}
							onclick={() => (channelCategoryFilter = 'directory')}
						>
							Directory launches
						</button>
					</div>
				</div>
			{/if}
			<div class="px-6 pb-4 pt-1">
				{#if !showDirectoryTiles && !showSocialProviders}
					<p class="py-6 text-center text-sm text-base-content/70">
						{channelCategoryFilter === 'directory'
							? 'No directory launches to show.'
							: 'No social platforms to show.'}
					</p>
				{:else}
				<div
					class={cn(
						'grid gap-2 justify-items-stretch justify-center sm:gap-[10px]',
						onboarding
							? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9'
							: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
					)}
				>
					{#if showSocialProviders}
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
					{/if}
					{#if showDirectoryTiles}
						{#each directoryTiles as tile (tile.siteKey)}
							<button
								type="button"
								class="group relative flex min-h-[5.5rem] w-full min-w-0 max-w-none flex-col items-stretch justify-start gap-1.5 overflow-visible rounded-xl border border-base-300 bg-base-100 px-2 py-2 text-center whitespace-normal hover:bg-base-200"
								onclick={() => openDirectoryLaunchPicker(tile)}
							>
								<div class="mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-base-200">
									<DirectoryAddChannelTileIcon
										{tile}
										showLogo={directoryTileShowsLogo(tile)}
										onLogoError={() => {
											directoryLogoFailedBySiteKey = {
												...directoryLogoFailedBySiteKey,
												[tile.siteKey]: true
											};
										}}
									/>
								</div>
								<div
									class="min-w-0 w-full shrink text-balance break-words text-sm font-medium leading-snug text-base-content"
								>
									{tile.label}
								</div>
							</button>
						{/each}
					{/if}
				</div>
				{/if}
			</div>
			{/if}
		{/if}
		{#if !loading && ((directoryTiles.length > 0 && !invite) || providers.length > 0)}
			<div class="border-t border-base-300 px-6 py-4">
				<ChannelConnectLegalFooter />
			</div>
		{/if}
		</Tooltip.Provider>
	</Dialog.Content>
</Dialog.Root>

<CredentialsConnectDialog
	bind:open={credentialsOpen}
	providerName={credentialsProviderName}
	providerIdentifier={credentialsProviderIdentifier}
	fields={credentialsFields}
	submitting={credentialsSubmitting}
	onSubmit={submitCredentials}
	onCancel={cancelCredentials}
/>

<BrowserExtensionConnectDialog
	bind:open={extensionOpen}
	providerName={extensionProviderName}
	providerIdentifier={extensionProviderIdentifier}
	submitting={extensionSubmitting}
	onSubmit={submitExtensionConnect}
	onCancel={cancelExtensionConnect}
/>

<ChannelLimitUpgradeModal bind:open={upgradeDialogOpen} {upgradeHref} />

<AddDirectoryLaunch
	showTrigger={false}
	bind:launcherOpen={directoryLaunchOpen}
	{returnToPath}
	providerSlugPrefix={activeDirectoryTile?.providerSlugPrefix}
	destinationsDialogTitle={activeDirectoryTile?.dialogTitle ?? 'Launch to directory'}
/>

