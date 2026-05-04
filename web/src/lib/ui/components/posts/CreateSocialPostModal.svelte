<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPostPresenter.svelte';
	import type { RepeatIntervalKey } from '$lib/posts';

	import { untrack } from 'svelte';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AddEditModal from './AddEditModal.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import DeleteDialog from './DeleteDialog.svelte';
	import ManageModal from './ManageModal.svelte';
	import SaveSetNameDialog from './SaveSetNameDialog.svelte';

	interface CreateSocialPostModalProps {
		open?: boolean;
		presenter: CreateSocialPostPresenter;
		workspaceId: string | null;
		connectedChannels: CreateSocialPostChannelViewModel[];
		/** For image upload form field; server uses JWT for storage path. */
		uploadUid?: string;
		/** Called after successfully scheduling a post. */
		onScheduled?: () => void;
		/** Close after saving a reusable set from workspace settings. */
		closeComposerAfterSaveSet?: boolean;
		/** Notify listeners after a reusable set was persisted. */
		onContentSetSaved?: () => void;
	}

	let {
		open = $bindable(false),
		presenter = $bindable(),
		workspaceId,
		connectedChannels,
		uploadUid = '',
		onScheduled,
		closeComposerAfterSaveSet = false,
		onContentSetSaved = undefined
	}: CreateSocialPostModalProps = $props();

	let saveSetNameOpen = $state(false);

	const followUpTargetIntegrationId = $derived(presenter.getPrimaryThreadFollowUpIntegrationId());

	const followUpTargetChannel = $derived(
		followUpTargetIntegrationId
			? (presenter.baseSocialChannelsVm.find((c) => c.id === followUpTargetIntegrationId) ?? null)
			: null
	);

	const modalTitle = $derived(presenter.contentSetAuthoringActive ? 'Define reusable set' : 'Create Post');

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

	$effect(() => {
		if (!open) {
			saveSetNameOpen = false;
			presenter.onModalClose();
			return;
		}
		if (!workspaceId) return;
		const channels = untrack(() => connectedChannels);
		void presenter.onModalOpen(workspaceId, channels);
	});

	function requestClose() {
		if (presenter.requestClose()) {
			open = false;
		}
	}

	function confirmClose() {
		presenter.confirmClose();
		open = false;
	}

	async function saveAsDraft() {
		if (await presenter.saveAsDraft()) {
			open = false;
		}
	}

	async function schedulePost() {
		if (await presenter.schedulePost()) {
			open = false;
			onScheduled?.();
		}
	}

	let confirmDeleteOpen = $state(false);

	async function confirmDelete() {
		confirmDeleteOpen = false;
		if (await presenter.deleteEditingPostGroup()) {
			open = false;
			onScheduled?.();
		}
	}

	async function confirmSaveSetName(name: string) {
		const oid = workspaceId;
		if (!oid) return;
		const ok = await presenter.saveContentSet(oid, name);
		if (!ok) return;
		saveSetNameOpen = false;
		onContentSetSaved?.();
		if (closeComposerAfterSaveSet) {
			open = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		showCloseButton={false}
		class="flex max-h-[min(92vh,900px)] w-[min(100vw-1rem,1400px)] max-w-[min(100vw-1rem,1400px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(100vw-1rem,1400px)]"
	>
		<div class="flex items-start justify-between border-b border-base-300 px-4 py-3 sm:px-6">
			<div class="flex flex-wrap items-center gap-3 text-lg font-semibold text-base-content">
				<span>{modalTitle}</span>
			</div>
			<button
				type="button"
				class="hover:bg-base-200 rounded-md p-2 text-base-content/70 outline-none focus-visible:ring-2 focus-visible:ring-primary"
				onclick={() => requestClose()}
				aria-label="Close"
			>
				<AbstractIcon name={icons.X2.name} class="size-5" width="20" height="20" />
			</button>
		</div>

		<div class="flex min-h-0 flex-1 flex-col">
			<div class="min-h-0 flex-1 overflow-y-auto">
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
					uploadUid={uploadUid}
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
					contentSetAuthoringNetworkLock={presenter.contentSetAuthoringActive}
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
					threadReplies={presenter.contentSetAuthoringActive
						? presenter.sharedFollowUpReplies
						: presenter.getThreadFollowUpRepliesForEditor()}
					onChangeThreadReplies={(next) => {
						if (presenter.contentSetAuthoringActive) {
							presenter.setSharedFollowUpRepliesForSetAuthoring(next);
							return;
						}
						presenter.applyThreadFollowUpReplies(next);
					}}
					threadProviderIdentifier={followUpTargetChannel?.identifier ?? null}
					mediaUrls={presenter.previewMediaUrls}
					previewProviderSettings={followUpTargetIntegrationId
						? (presenter.providerSettingsByIntegrationId[followUpTargetIntegrationId] ?? {})
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
					showDelete={Boolean(presenter.editingPostGroup) && !presenter.contentSetAuthoringActive}
					primaryLabel={presenter.primaryLabel}
					scheduleDisabled={!presenter.canSchedule}
					footerVariant={presenter.contentSetAuthoringActive ? 'contentSet' : 'schedulePost'}
					onSaveContentSet={() => {
						saveSetNameOpen = true;
					}}
					onToggleTag={presenter.toggleTag.bind(presenter)}
					onAddTag={presenter.addNewTag.bind(presenter)}
					onDeleteTag={presenter.deleteWorkspaceTag.bind(presenter)}
					onRepeatChange={(v) => {
						presenter.repeatInterval = v;
					}}
					onDeletePost={() => {
						confirmDeleteOpen = true;
					}}
					onSaveDraft={saveAsDraft}
					onSchedule={schedulePost}
				/>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<SaveSetNameDialog
	bind:open={saveSetNameOpen}
	busy={presenter.busy}
	initialName={presenter.editingSetName}
	onConfirm={(name) => void confirmSaveSetName(name)}
	onCancel={() => (saveSetNameOpen = false)}
/>

<DeleteDialog
	bind:open={presenter.confirmCloseOpen}
	onConfirm={confirmClose}
	onCancel={() => (presenter.confirmCloseOpen = false)}
/>

<DeleteDialog
	bind:open={confirmDeleteOpen}
	title="Are you sure?"
	description="Are you sure you want to delete this post?"
	confirmLabel="Yes, delete it!"
	cancelLabel="No, cancel!"
	onConfirm={confirmDelete}
	onCancel={() => (confirmDeleteOpen = false)}
/>
