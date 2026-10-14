<script lang="ts">
	import type { AutoLaunchDestinationDto, AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';

	import { getRootPathAccount } from '$lib/area-protected';
	import { autoLaunchRepository } from '$lib/auto-launch';
	import {
		buildDirectoryAddChannelTiles,
		directoryAddChannelLogoFallbackLabel,
		type DirectoryAddChannelTileVm
	} from '$lib/auto-launch/buildDirectoryAddChannelTiles';
	import { buildDirectoryLaunchPickerItems } from '$lib/auto-launch/groupDirectoryLaunchDestinations';
	import { linkDirectoryRepository } from '$lib/link-directory';
	import { protectedHomePagePresenter } from '$lib/area-protected';
	import { sendDirectoryLaunchHandoff } from '$lib/auto-launch/browser-extension/directoryLaunchHandoff';
	import { route, absoluteUrl } from '$lib/utils/path';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';

	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import BrowserExtensionConnectDialog from '$lib/ui/components/posts/BrowserExtensionConnectDialog.svelte';
	import ProductProfileComposer from '$lib/ui/components/auto-launch/ProductProfileComposer.svelte';
	import DirectoryLaunchDestinationActions from '$lib/ui/components/auto-launch/DirectoryLaunchDestinationActions.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		buttonLabel?: string;
		productProfileId?: string;
		destinationProviderSlug?: string;
		returnToPath?: string;
		buttonVariant?: 'primary' | 'secondary' | 'outline';
		buttonClass?: string;
		/** When false, trigger sends guests to sign-up instead of opening the flow. */
		isLoggedIn?: boolean;
		signUpHref?: string;
		/** When set, only destinations whose provider slug starts with this prefix are listed. */
		providerSlugPrefix?: string;
		/** Override destinations dialog title (e.g. Uneed-only picker from Add Channel). */
		destinationsDialogTitle?: string;
		showTrigger?: boolean;
		/** Parent-controlled open (e.g. Uneed tile in Add Channel). */
		launcherOpen?: boolean;
		/** Open directory site tiles first (same pattern as Add Channel), then paths for that site. */
		sitePickerFirst?: boolean;
	};

	let {
		buttonLabel = 'Launch to directory',
		productProfileId,
		destinationProviderSlug,
		returnToPath,
		buttonVariant = 'primary',
		buttonClass,
		isLoggedIn = true,
		signUpHref,
		providerSlugPrefix,
		destinationsDialogTitle = 'Launch to directory',
		showTrigger = true,
		launcherOpen = $bindable(false),
		sitePickerFirst = false
	}: Props = $props();

	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);
	let sitePickerOpen = $state(false);
	let loadingDirectoryTiles = $state(false);
	let directoryTiles = $state<DirectoryAddChannelTileVm[]>([]);
	let directoryLogoFailedBySiteKey = $state<Record<string, boolean>>({});
	let pickedSitePrefix = $state<string | null>(null);
	let pickedSiteDialogTitle = $state<string | null>(null);

	let destinationsOpen = $state(false);
	let profilePickerOpen = $state(false);
	let extensionOpen = $state(false);
	let composerOpen = $state(false);

	let loadingDestinations = $state(false);
	let destinations = $state<AutoLaunchDestinationDto[]>([]);

	let profiles = $state<AutoLaunchProductProfileDto[]>([]);
	let loadingProfiles = $state(false);

	let selectedDestination = $state<AutoLaunchDestinationDto | null>(null);
	let userSelectedProfileId = $state<string | null>(null);
	const selectedProfileId = $derived(userSelectedProfileId ?? productProfileId ?? null);

	let extensionSubmitting = $state(false);
	let pendingIntentProfileId = $state<string | null>(null);
	let pendingFlow = $state<'extension' | 'manual'>('extension');
	let busyDestinationId = $state<string | null>(null);
	let completedDestinationIds = $state<Set<string>>(new Set());

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	const effectiveProviderSlugPrefix = $derived(
		(pickedSitePrefix ?? providerSlugPrefix)?.trim() || ''
	);

	const effectiveDestinationsDialogTitle = $derived(
		pickedSiteDialogTitle ?? destinationsDialogTitle
	);

	const scopedDestinations = $derived.by(() => {
		const prefix = effectiveProviderSlugPrefix;
		if (!prefix) return destinations;
		return destinations.filter((d) => d.providerSlug.startsWith(prefix));
	});

	const pickerItems = $derived(buildDirectoryLaunchPickerItems(scopedDestinations));

	const showDestinationsBackToSites = $derived(
		sitePickerFirst && Boolean(pickedSitePrefix) && directoryTiles.length > 1
	);

	async function refreshCompletedDestinations() {
		const orgId = workspaceId;
		const profileId = selectedProfileId;
		if (!orgId || !profileId) {
			completedDestinationIds = new Set();
			return;
		}
		const rows = await autoLaunchRepository.listSubmissions(orgId, { productProfileId: profileId });
		const done = new Set(
			rows.filter((r) => r.status === 'completed').map((r) => r.destinationId)
		);
		completedDestinationIds = done;
	}

	async function ensureWorkspaceLoaded() {
		if (workspaceId) return;
		await workspaceSettingsPresenter.load({ includeTeam: false });
	}

	async function loadDestinations() {
		loadingDestinations = true;
		try {
			destinations = await autoLaunchRepository.listDestinations();
		} catch {
			destinations = [];
		} finally {
			loadingDestinations = false;
		}
	}

	async function loadProfiles() {
		if (!workspaceId) return;
		loadingProfiles = true;
		try {
			profiles = await autoLaunchRepository.listProfiles(workspaceId);
		} catch {
			profiles = [];
		} finally {
			loadingProfiles = false;
		}
	}

	async function loadDirectorySiteTiles() {
		loadingDirectoryTiles = true;
		try {
			const [destinationList, publishedSites] = await Promise.all([
				autoLaunchRepository.listDestinations(),
				linkDirectoryRepository.getPublishedSites({ limit: 500, skip: 0 })
			]);
			const sitesBySlug = new Map(
				publishedSites.sites.map((site) => [
					site.slug,
					{ title: site.title, logoUrl: site.logoUrl }
				])
			);
			directoryTiles = buildDirectoryAddChannelTiles(destinationList, sitesBySlug);
		} catch {
			directoryTiles = [];
		} finally {
			loadingDirectoryTiles = false;
		}
	}

	function openDestinationsForSite(tile: DirectoryAddChannelTileVm) {
		pickedSitePrefix = tile.providerSlugPrefix;
		pickedSiteDialogTitle = tile.dialogTitle;
		sitePickerOpen = false;
		destinationsOpen = true;
	}

	function backToDirectorySitePicker() {
		destinationsOpen = false;
		pickedSitePrefix = null;
		pickedSiteDialogTitle = null;
		sitePickerOpen = true;
	}

	function directoryTileShowsLogo(tile: DirectoryAddChannelTileVm): boolean {
		return Boolean(tile.logoUrl) && !directoryLogoFailedBySiteKey[tile.siteKey];
	}

	async function openLaunchFlow() {
		if (!isLoggedIn) {
			const href = signUpHref ?? absoluteUrl('sign-up');
			window.location.assign(href);
			return;
		}
		pickedSitePrefix = null;
		pickedSiteDialogTitle = null;
		if (sitePickerFirst && !providerSlugPrefix?.trim()) {
			sitePickerOpen = true;
			await loadDirectorySiteTiles();
			if (directoryTiles.length === 1) {
				openDestinationsForSite(directoryTiles[0]);
			}
			return;
		}
		destinationsOpen = true;
	}

	$effect(() => {
		if (!sitePickerOpen) return;
		void ensureWorkspaceLoaded().then(() => {
			if (!workspaceSettingsPresenter.currentWorkspaceId) {
				toast.error('Create or select a workspace before launching to a directory.');
				sitePickerOpen = false;
			}
		});
	});

	$effect(() => {
		if (!launcherOpen) return;
		openLaunchFlow();
		launcherOpen = false;
	});

	$effect(() => {
		if (!destinationsOpen) return;
		void ensureWorkspaceLoaded().then(() => {
			if (!workspaceSettingsPresenter.currentWorkspaceId) {
				toast.error('Create or select a workspace before launching to a directory.');
				destinationsOpen = false;
				return;
			}
			void loadDestinations().then(() => refreshCompletedDestinations());
		});
	});

	$effect(() => {
		if (!destinationsOpen) return;
		void refreshCompletedDestinations();
	});

	$effect(() => {
		if (!destinationsOpen || !destinationProviderSlug || loadingDestinations) return;
		const match = destinations.find((d) => d.providerSlug === destinationProviderSlug);
		if (match && !selectedDestination) {
			selectedDestination = match;
		}
	});

	function beginDestinationFlow(destination: AutoLaunchDestinationDto, flow: 'extension' | 'manual') {
		if (flow === 'extension' && destination.submissionPath !== 'extension') {
			toast.message('Auto submit for this directory is coming soon.');
			return;
		}
		selectedDestination = destination;
		pendingFlow = flow;
		if (selectedProfileId) {
			if (flow === 'extension') {
				destinationsOpen = false;
				extensionOpen = true;
				pendingIntentProfileId = selectedProfileId;
			} else {
				void markDestinationComplete(destination, selectedProfileId);
			}
			return;
		}
		profilePickerOpen = true;
		void loadProfiles();
	}

	function onPickDestination(destination: AutoLaunchDestinationDto) {
		beginDestinationFlow(destination, 'extension');
	}

	async function markDestinationComplete(
		destination: AutoLaunchDestinationDto,
		profileId: string
	) {
		const orgId = workspaceId;
		if (!orgId) return;
		busyDestinationId = destination.id;
		try {
			const result = await autoLaunchRepository.recordManualSubmissionComplete({
				organizationId: orgId,
				productProfileId: profileId,
				destinationId: destination.id
			});
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			toast.success('Marked as complete for this product.');
			await refreshCompletedDestinations();
		} finally {
			busyDestinationId = null;
		}
	}

	function onPickProfile(id: string) {
		userSelectedProfileId = id;
		profilePickerOpen = false;
		const destination = selectedDestination;
		if (!destination) {
			destinationsOpen = true;
			return;
		}
		if (pendingFlow === 'manual') {
			void markDestinationComplete(destination, id);
			return;
		}
		destinationsOpen = false;
		extensionOpen = true;
		pendingIntentProfileId = id;
	}

	function openCreateProfile() {
		profilePickerOpen = false;
		composerOpen = true;
	}

	async function saveNewProfile(values: {
		name: string;
		tagline: string | null;
		description: string | null;
		websiteUrl: string | null;
		logoUrl: string | null;
	}) {
		if (!workspaceId) return;
		const created = await autoLaunchRepository.createProfile({
			organizationId: workspaceId,
			...values,
			profileData: {}
		});
		if (!created.ok) {
			toast.error(created.error);
			return;
		}
		await protectedHomePagePresenter.loadChannelGroups();
		toast.success('Business profile created.');
		composerOpen = false;
		userSelectedProfileId = created.profile.id;
		const destination = selectedDestination;
		if (pendingFlow === 'manual' && destination) {
			void markDestinationComplete(destination, created.profile.id);
			return;
		}
		extensionOpen = true;
		pendingIntentProfileId = created.profile.id;
		destinationsOpen = false;
	}

	async function submitExtensionHandoff(
		_cookies: unknown,
		context?: { openedDirectoryTabInNewTab?: boolean }
	) {
		const orgId = workspaceId;
		const profileId = pendingIntentProfileId;
		const destination = selectedDestination;
		if (!orgId || !profileId || !destination) {
			toast.error('Select a workspace, product, and directory first.');
			return;
		}
		extensionSubmitting = true;
		try {
			const intentResult = await autoLaunchRepository.createSubmissionIntent({
				organizationId: orgId,
				productProfileId: profileId,
				destinationId: destination.id,
				providerSlug: destination.providerSlug
			});
			if (!intentResult.ok) {
				toast.error(intentResult.error);
				return;
			}
			const handoff = await sendDirectoryLaunchHandoff(intentResult.intent, {
				skipStartUrlTabOpen: context?.openedDirectoryTabInNewTab === true
			});
			if (!handoff.ok) {
				toast.error(handoff.error);
				return;
			}
			toast.success('Launch handed off to the extension. Open the extension popup to continue.');
			extensionOpen = false;
			selectedDestination = null;
			pendingIntentProfileId = null;
			const after = returnToPath ?? accountPath;
			if (typeof window !== 'undefined' && after) {
				// stay on page; optional future: open start URL in new tab
			}
		} finally {
			extensionSubmitting = false;
		}
	}

	function cancelExtension() {
		if (extensionSubmitting) return;
		extensionOpen = false;
		if (!destinationsOpen) destinationsOpen = true;
	}

	function cancelProfilePicker() {
		profilePickerOpen = false;
		destinationsOpen = true;
	}
</script>

{#if showTrigger}
	<span class="inline-flex shrink-0">
		<Button
			type="button"
			variant={buttonVariant}
			class={cn('gap-2', buttonClass)}
			onclick={openLaunchFlow}
		>
			<AbstractIcon
				name={(sitePickerFirst ? icons.Plus : icons.Rocket).name}
				class="h-4 w-4"
				width="16"
				height="16"
			/>
			{buttonLabel}
		</Button>
	</span>
{/if}

<Dialog.Root bind:open={sitePickerOpen}>
	<Dialog.Content
		class={cn(
			'w-full max-w-[min(96vw,90rem)] gap-0 p-0 sm:max-w-6xl lg:max-w-7xl xl:max-w-[min(96vw,90rem)]'
		)}
	>
		<div class="border-b border-base-300 px-6 pb-2 pt-3">
			<Dialog.Title class="text-xl font-semibold text-base-content">Add Channel</Dialog.Title>
			<Dialog.Description class="mt-0.5 text-sm text-base-content/70">
				Pick a directory site to launch this product on (extension fill or mark complete).
			</Dialog.Description>
		</div>
		{#if loadingDirectoryTiles}
			<div class="flex items-center gap-2 px-6 py-8 text-base-content/70">
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class="h-4 w-4 animate-spin"
					width="16"
					height="16"
				/>
				Loading directories…
			</div>
		{:else if directoryTiles.length === 0}
			<div class="px-6 py-8 text-sm text-base-content/70">No directory launches are available right now.</div>
		{:else}
			<div class="grid grid-cols-2 gap-2 px-6 py-4 sm:grid-cols-3 md:grid-cols-5">
				{#each directoryTiles as tile (tile.siteKey)}
					<button
						type="button"
						class="group flex min-h-[5.5rem] w-full flex-col items-center justify-start gap-1.5 rounded-xl border border-base-300 bg-base-100 px-2 py-2 text-center hover:bg-base-200"
						onclick={() => openDestinationsForSite(tile)}
					>
						<div class="grid h-10 w-10 place-items-center rounded-lg bg-base-200">
							{#if directoryTileShowsLogo(tile) && tile.logoUrl}
								<img
									src={tile.logoUrl}
									alt=""
									class="h-6 w-6 rounded object-contain"
									width="24"
									height="24"
									onerror={() => {
										directoryLogoFailedBySiteKey = {
											...directoryLogoFailedBySiteKey,
											[tile.siteKey]: true
										};
									}}
								/>
							{:else}
								<span class="text-xs font-semibold text-base-content/80">
									{directoryAddChannelLogoFallbackLabel(tile.label)}
								</span>
							{/if}
						</div>
						<span class="line-clamp-2 text-xs font-medium text-base-content">{tile.label}</span>
					</button>
				{/each}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={destinationsOpen}>
	<Dialog.Content
		class={cn(
			'w-full max-w-[min(96vw,90rem)] gap-0 p-0 sm:max-w-6xl lg:max-w-7xl xl:max-w-[min(96vw,90rem)]'
		)}
	>
		<div class="border-b border-base-300 px-6 pb-2 pt-3">
			<Dialog.Title class="text-xl font-semibold text-base-content">
				{effectiveDestinationsDialogTitle}
			</Dialog.Title>
			<Dialog.Description class="mt-0.5 text-sm text-base-content/70">
				Pick a path (free vs paid where applicable). Use the extension to auto-fill or mark done for this
				product — tracked on Account → Products, not Saved Backlinks.
			</Dialog.Description>
		</div>

		{#if loadingDestinations}
			<div class="flex items-center gap-2 px-6 py-8 text-base-content/70">
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class="h-4 w-4 animate-spin"
					width="16"
					height="16"
				/>
				Loading directories…
			</div>
		{:else if scopedDestinations.length === 0}
			<div class="px-6 py-8 text-sm text-base-content/70">No directories available right now.</div>
		{:else}
			<div class="grid max-h-[min(70vh,32rem)] gap-4 overflow-y-auto px-6 py-4 sm:grid-cols-2">
				{#each pickerItems as item (item.kind === 'group' ? item.group.id : item.destination.id)}
					{#if item.kind === 'group'}
						<div class="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
							<div class="flex flex-wrap items-start justify-between gap-2">
								<span class="font-semibold text-base-content">{item.group.title}</span>
								{#if item.group.siteDomainRating != null}
									<span class="badge badge-sm badge-ghost">DR {item.group.siteDomainRating}</span>
								{/if}
							</div>
							{#if item.group.description}
								<p class="text-sm text-base-content/70">{item.group.description}</p>
							{/if}
							<div class="space-y-2">
								{#each item.group.variants as variant (variant.id)}
									<DirectoryLaunchDestinationActions
										destination={variant}
										completed={completedDestinationIds.has(variant.id)}
										busy={busyDestinationId === variant.id}
										onFillExtension={() => onPickDestination(variant)}
										onMarkComplete={() => beginDestinationFlow(variant, 'manual')}
									/>
								{/each}
							</div>
						</div>
					{:else}
						<div class="rounded-xl border border-base-300 bg-base-100 p-4">
							<DirectoryLaunchDestinationActions
								destination={item.destination}
								completed={completedDestinationIds.has(item.destination.id)}
								busy={busyDestinationId === item.destination.id}
								onFillExtension={() => onPickDestination(item.destination)}
								onMarkComplete={() => beginDestinationFlow(item.destination, 'manual')}
							/>
						</div>
					{/if}
				{/each}
			</div>
		{/if}

		<div
			class="flex flex-wrap items-center justify-between gap-2 border-t border-base-300 px-6 py-3 text-xs text-base-content/60"
		>
			<span>You are responsible for complying with each directory&apos;s terms. OpenQuok does not auto-publish listings.</span>
			{#if showDestinationsBackToSites}
				<Button type="button" variant="ghost" size="sm" onclick={backToDirectorySitePicker}>
					Back to directories
				</Button>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={profilePickerOpen}>
	<Dialog.Content class="max-w-lg gap-4">
		<Dialog.Header>
			<Dialog.Title>Choose a product</Dialog.Title>
			<Dialog.Description class="text-sm text-base-content/70">
				Pick the profile to launch, or create one on
				the Products tab.
			</Dialog.Description>
		</Dialog.Header>

		{#if loadingProfiles}
			<p class="flex items-center gap-2 text-sm text-base-content/70">
				<AbstractIcon
					name={icons.LoaderCircle.name}
					class="h-4 w-4 animate-spin"
					width="16"
					height="16"
				/>
				Loading profiles…
			</p>
		{:else if profiles.length === 0}
			<p class="text-sm text-base-content/70">No product profiles yet.</p>
		{:else}
			<ul class="max-h-64 space-y-2 overflow-y-auto">
				{#each profiles as profile (profile.id)}
					<li>
						<button
							type="button"
							class="w-full rounded-lg border border-base-300 px-3 py-2 text-left hover:bg-base-200"
							onclick={() => onPickProfile(profile.id)}
						>
							<span class="font-medium text-base-content">{profile.name}</span>
							{#if profile.tagline}
								<span class="mt-0.5 block text-sm text-base-content/70">{profile.tagline}</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		<Dialog.Footer class="gap-2">
			<Button type="button" variant="outline" onclick={cancelProfilePicker}>Back</Button>
			<Button type="button" onclick={openCreateProfile}>New product profile</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<ProductProfileComposer bind:open={composerOpen} onSubmit={saveNewProfile} />

<BrowserExtensionConnectDialog
	bind:open={extensionOpen}
	providerName="Directory launch"
	providerIdentifier="directory-launch"
	connectPurpose="directory-launch"
	directoryLaunchStartUrl={selectedDestination?.startUrl ?? null}
	submitting={extensionSubmitting}
	onSubmit={submitExtensionHandoff}
	onCancel={cancelExtension}
/>
