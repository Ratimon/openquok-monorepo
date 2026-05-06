<script lang="ts">
	import type { RepeatIntervalKey } from '$lib/posts';

	import { untrack } from 'svelte';

	import { getRootPathAccount, protectedDashboardPagePresenter } from '$lib/area-protected';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { route } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AddEditModal from '$lib/ui/components/posts/AddEditModal.svelte';
	import CreateSocialPostModal from '$lib/ui/components/posts/CreateSocialPostModal.svelte';
	import ManageModal from '$lib/ui/components/posts/ManageModal.svelte';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);
	const connectedChannelsVm = $derived(protectedDashboardPagePresenter.connectedChannelsVm);
	const listStatus = $derived(protectedDashboardPagePresenter.listStatus);
	const channelsLoadPending = $derived(listStatus === 'idle' || listStatus === 'loading');

	/** Stable ref for composer `bind:` chain (`protectedDashboardPagePresenter.createSocialPostPresenter`). */
	const presenter = protectedDashboardPagePresenter.createSocialPostPresenter;
	/** Writable ref for `bind:` (Svelte cannot bind to `const`). */
	let createSocialPostModalPresenter = $state.raw(presenter);

	let initializedForWorkspaceId = $state<string | null>(null);
	let createSocialPostOpen = $state(false);

	const repeatOptions: { value: RepeatIntervalKey; label: string }[] = [
		{ value: 'day', label: 'Day' },
		{ value: 'two_days', label: 'Two Days' },
		{ value: 'three_days', label: 'Three Days' },
		{ value: 'four_days', label: 'Four Days' },
		{ value: 'five_days', label: 'Five Days' },
		{ value: 'six_days', label: 'Six Days' },
		{ value: 'week', label: 'Week' },
		{ value: 'two_weeks', label: 'Two Weeks' },
		{ value: 'month', label: 'Month' }
	];

	const wizardPayloadResult = $derived(presenter.getProgrammaticCreatePostPayloadPreview('scheduled'));
	const wizardPayload = $derived(wizardPayloadResult.ok ? wizardPayloadResult.payload : null);

	async function copyProgrammaticPayload(status: 'draft' | 'scheduled'): Promise<void> {
		const res = presenter.getProgrammaticCreatePostPayloadPreview(status);
		if (!res.ok) {
			toast.error(res.error);
			return;
		}
		try {
			await navigator.clipboard.writeText(JSON.stringify(res.payload, null, 2));
			toast.success(status === 'draft' ? 'Draft payload copied.' : 'Scheduled payload copied.');
		} catch {
			toast.error('Could not copy to clipboard.');
		}
	}

	function scheduleViaUi(): void {
		const oid = workspaceId;
		if (!oid) {
			toast.error('Select a workspace first.');
			return;
		}
		const snapshot = presenter.buildSetSnapshot();
		presenter.prepareOpen({
			preselectIntegrationId: null,
			preselectIntegrationIds: snapshot.selectedIntegrationIds,
			preselectScheduledAtIso: null,
			setSnapshot: snapshot
		});
		createSocialPostOpen = true;
	}

	$effect(() => {
		const oid = workspaceId;
		if (!oid) return;
		void protectedDashboardPagePresenter.loadDashboardLists();
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
		presenter.prepareOpen({
			preselectIntegrationId: null,
			preselectIntegrationIds: selected,
			preselectScheduledAtIso: null,
			setSnapshot: null
		});
		void presenter.onModalOpen(oid, channels);
		initializedForWorkspaceId = oid;
	});
</script>

<div class="mx-auto flex w-full max-w-[min(100vw-2rem,1400px)] flex-col gap-5">
	<div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm space-y-4">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="space-y-1">
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
			<div class="flex items-center gap-2">
				<Button
					variant="ghost"
					href={accountPath}
					class="gap-2"
				>
					<AbstractIcon name={icons.ArrowLeft.name} class="size-4" width="16" height="16" />
					Back
				</Button>
				<Button
					variant="outline"
					href={accountPath}
					class="gap-2"
				>
					<AbstractIcon name={icons.Gauge.name} class="size-4" width="16" height="16" />
					Go to Dashboard
				</Button>
				<Button
					variant="secondary"
					type="button"
					class="gap-2"
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
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_440px]">
				<div class="rounded-lg border border-base-300 bg-base-100/50 overflow-hidden">
					<div class="min-h-0">
						<AddEditModal
							stockPhotosVm={presenter.stockPhotosVm}
							designTemplatesVm={presenter.designTemplatesVm}
							fetchPolotnoTemplateListPage={presenter.fetchPolotnoTemplateListPage.bind(presenter)}
							backgroundPanelVm={presenter.backgroundPanelVm}
							exportCanvasToMedia={presenter.exportCanvasToMedia}
							loadSignaturesVmForComposer={presenter.loadSignaturesVmForComposer}
							socialChannels={presenter.baseSocialChannelsVm}
							bind:body={presenter.editorBody}
							bind:postMediaItems={presenter.postMediaItems}
							uploadUid={workspaceId ?? ''}
							organizationId={workspaceId}
							busy={presenter.busy}
							selectedIds={presenter.selectedIds}
							mode={presenter.mode}
							focusedIntegrationId={presenter.focusedIntegrationId}
							previewText={presenter.previewText}
							charCount={presenter.charCount}
							softCharLimit={presenter.softCharLimit}
							commentsMode={presenter.launchCommentsMode}
							scheduleValidationMessage={presenter.scheduleValidationError}
							contentSetAuthoringNetworkLock={false}
							scheduledPostDatetimeLocal={presenter.scheduledLocal}
							selectedGroupId={presenter.selectedGroupId}
							onToggleChannel={presenter.toggleChannel.bind(presenter)}
							onToggleGlobal={() => {
								if (presenter.mode === 'custom') presenter.backToGlobalMode();
							}}
							onRemoveSelected={presenter.removeSelected.bind(presenter)}
							onFocusIntegration={presenter.focusIntegration.bind(presenter)}
							onRequestCustomize={presenter.requestCustomize.bind(presenter)}
							onSelectGroup={presenter.selectGroup.bind(presenter)}
							editorLocked={presenter.mode === 'custom' ? presenter.editorLocked : false}
							editorLockMessage="Click this button to exit global editing and customize the post for this channel"
							onEditorUnlock={() => {
								presenter.customEditingUnlocked = true;
								presenter.editorLocked = false;
							}}
							editorBannerLeftLabel={presenter.mode === 'custom' ? 'Editing a Specific Network' : null}
							editorBannerRightActionLabel={presenter.mode === 'custom' ? 'Back to global' : null}
							onEditorBannerRightAction={presenter.mode === 'custom' ? presenter.backToGlobalMode.bind(presenter) : null}
							postComment={presenter.postComment}
							onAddPost={() => presenter.handleAddThreadItemClick()}
							bind:settingsOpen={presenter.settingsOpen}
							providerSettings={presenter.providerSettingsByIntegrationId[presenter.focusedIntegrationId ?? ''] ?? {}}
							onProviderSettingsChange={presenter.updateFocusedProviderSettings.bind(presenter)}
							settingsDisabled={presenter.busy}
							threadReplies={presenter.getThreadFollowUpRepliesForEditor()}
							onChangeThreadReplies={(next) => {
								presenter.applyThreadFollowUpReplies(next);
							}}
							threadProviderIdentifier={presenter.getPrimaryThreadFollowUpIntegrationId()
								? (presenter.baseSocialChannelsVm.find((c) => c.id === presenter.getPrimaryThreadFollowUpIntegrationId())?.identifier ?? null)
								: null}
							mediaUrls={presenter.previewMediaUrls}
							previewProviderSettings={presenter.getPrimaryThreadFollowUpIntegrationId()
								? (presenter.providerSettingsByIntegrationId[presenter.getPrimaryThreadFollowUpIntegrationId() ?? ''] ?? {})
								: {}}
						/>
					</div>
					<div class="sticky bottom-0 z-10 shrink-0 pb-[env(safe-area-inset-bottom)]">
						<ManageModal
							tagList={presenter.tagList}
							selectedTagNames={presenter.selectedTagNames}
							repeatInterval={presenter.repeatInterval}
							{repeatOptions}
							bind:scheduledLocal={presenter.scheduledLocal}
							busy={presenter.busy}
							showDelete={false}
							saveDraftLabel="Copy draft payload"
							primaryLabel="Copy scheduled payload"
							scheduleDisabled={!wizardPayloadResult.ok}
							footerVariant="schedulePost"
							onToggleTag={presenter.toggleTag.bind(presenter)}
							onAddTag={presenter.addNewTag.bind(presenter)}
							onDeleteTag={presenter.deleteWorkspaceTag.bind(presenter)}
							onRepeatChange={(v) => {
								presenter.repeatInterval = v;
							}}
							onSaveDraft={() => void copyProgrammaticPayload('draft')}
							onSchedule={() => void copyProgrammaticPayload('scheduled')}
						/>
					</div>
				</div>

				<div class="space-y-4">
					<div class="rounded-lg border border-base-300 bg-base-100 p-4 space-y-3">
						<div class="flex items-center justify-between gap-3">
							<h2 class="text-base font-semibold text-base-content">Generated payload</h2>
							<Button
								variant="primary"
								type="button"
								class="gap-2"
								disabled={!wizardPayload}
								onclick={() => void copyProgrammaticPayload('scheduled')}
							>
								<AbstractIcon name={icons.Copy.name} class="size-4" width="16" height="16" />
								Copy JSON
							</Button>
						</div>

						{#if wizardPayload}
							<pre class="overflow-x-auto rounded-md border border-base-300 bg-base-200/40 p-4 text-xs text-base-content"><code>{JSON.stringify(wizardPayload, null, 2)}</code></pre>
						{:else}
							<div class="rounded-md border border-base-300 bg-base-200/40 p-4">
								<p class="text-sm text-base-content/70">
									{wizardPayloadResult.ok ? 'Fill out the composer to generate a payload.' : wizardPayloadResult.error}
								</p>
							</div>
						{/if}
					</div>

					<div class="rounded-lg border border-base-300 bg-base-100 p-4 space-y-2">
						<h2 class="text-base font-semibold text-base-content">Endpoint</h2>
						<p class="text-sm text-base-content/70">
							Send this payload to <span class="font-mono text-base-content">POST /api/v1/public/posts</span>.
						</p>
						<p class="text-sm text-base-content/70">
							<span class="font-medium text-base-content">Note:</span> programmatic auth derives the organization from your OAuth app
							token, so <span class="font-mono text-base-content">organizationId</span> is intentionally omitted.
						</p>
					</div>
				</div>
			</div>
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

