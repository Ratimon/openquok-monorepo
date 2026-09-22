<script lang="ts">
	import { untrack } from 'svelte';

	import { getRootPathAccount, protectedPayloadWizardPagePresenter } from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import PayloadWizardHeroPanel from '$lib/ui/templates/api-marketing/PayloadWizardHeroPanel.svelte';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	const pagePresenter = protectedPayloadWizardPagePresenter;

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(pagePresenter.connectedChannelsVm);
	const listStatus = $derived(pagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	/** Stable ref for composer `bind:` chain (`pagePresenter.createSocialPostPresenter`). */
	const composerPresenter = pagePresenter.createSocialPostPresenter;

	/** Writable ref for `bind:` (Svelte cannot bind to `const`). */
	let createSocialPostModalPresenter = $state.raw(composerPresenter);

	let initializedForWorkspaceId = $state<string | null>(null);
	let createSocialPostOpen = $state(false);

	const wizardPayloadResult = $derived(
		composerPresenter.getProgrammaticCreatePostPayloadPreview('scheduled')
	);
	const wizardPayload = $derived(wizardPayloadResult.ok ? wizardPayloadResult.payload : null);

	function scheduleViaUi(): void {
		const oid = workspaceId;
		if (!oid) {
			toast.error('Select a workspace first.');
			return;
		}
		const snapshot = composerPresenter.buildSetSnapshot();
		composerPresenter.prepareOpen({
			preselectIntegrationId: null,
			preselectIntegrationIds: snapshot.selectedIntegrationIds,
			preselectScheduledAtIso: null,
			setSnapshot: snapshot
		});
		createSocialPostOpen = true;
	}

	$effect(() => {
		pagePresenter.syncWorkspaceConnectedChannels();
	});

	$effect(() => {
		const oid = workspaceId;
		if (!oid) {
			initializedForWorkspaceId = null;
			return;
		}
		if (initializedForWorkspaceId === oid) return;
		if (channelsLoadPending) return;
		if (listStatus !== 'ready') return;

		const channels = untrack(() => connectedChannelsVm);
		const selected = channels
			.filter((c) => (c.type ?? '').toLowerCase() === 'social')
			.map((c) => c.id)
			.filter(Boolean);

		// Wizard: open composer with all social channels preselected.
		composerPresenter.prepareOpen({
			preselectIntegrationId: null,
			preselectIntegrationIds: selected,
			preselectScheduledAtIso: null,
			setSnapshot: null
		});
		void composerPresenter.onModalOpen(oid, channels);
		initializedForWorkspaceId = oid;
	});
</script>

<div class="mx-auto flex w-full max-w-[min(100vw-2rem,1400px)] flex-col gap-5">
	<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
		<div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
			<div class="min-w-0 space-y-1">
				<div class="flex items-center gap-3">
					<AbstractIcon name={icons.Sparkles.name} class="text-primary size-8 shrink-0" width="32" height="32" />
					<h1 class="text-2xl font-bold text-base-content">
						Payload Wizard
					</h1>
				</div>
				<p class="text-sm text-base-content/70">
					Compose a post with the normal UI, then copy a JSON payload for <span class="font-mono text-base-content">POST /api/v1/public/posts</span>.
				</p>
			</div>
			<div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
				<Button
					variant="ghost"
					href={accountPath}
					class="w-full justify-center gap-2 sm:w-auto"
				>
					<AbstractIcon name={icons.ArrowLeft.name} class="size-4" width="16" height="16" />
					Back
				</Button>
				<Button
					variant="outline"
					href={accountPath}
					class="w-full justify-center gap-2 sm:w-auto"
				>
					<AbstractIcon name={icons.Gauge.name} class="size-4" width="16" height="16" />
					Go to Home
				</Button>
				<Button
					variant="secondary"
					type="button"
					class="w-full justify-center gap-2 sm:w-auto"
					disabled={!wizardPayload}
					onclick={scheduleViaUi}
				>
					<AbstractIcon name={icons.CalendarClock.name} class="size-4" width="16" height="16" />
					Schedule Via UI
				</Button>
			</div>
		</div>

		{#if !workspaceId}
			<div class="rounded-lg border border-base-300 bg-base-200 p-4">
				<p class="text-sm text-base-content/70">
					Select a workspace first (top-left switcher), then reopen this wizard.
				</p>
			</div>
		{:else if channelsLoadPending}
			<p class="flex items-center gap-2 text-sm text-base-content/70">
				<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
				Loading channels…
			</p>
		{:else if listStatus === 'error'}
			<p class="text-sm text-error">
				Could not load channels. Try again in a moment.
			</p>
		{:else if connectedChannelsVm.length === 0}
			<div class="rounded-lg border border-base-300 bg-base-200 p-4">
				<p class="text-sm text-base-content/70">
					No connected channels found for this workspace. Connect a channel first.
				</p>
			</div>
		{:else}
			<PayloadWizardHeroPanel
				mode="workspace"
				workspaceComposer={composerPresenter}
				workspaceId={workspaceId}
				isLoggedIn={true}
			/>
		{/if}
	</div>
</div>

<CreateSocialPostModal
	bind:open={createSocialPostOpen}
	bind:presenter={createSocialPostModalPresenter}
	workspaceId={workspaceId}
	connectedChannels={connectedChannelsVm}
	uploadUid={workspaceId ?? ''}
/>
