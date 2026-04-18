<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPostPresenter.svelte';
	import type { RepeatIntervalKey } from '$lib/posts';

	import { untrack } from 'svelte';

	import { icons } from '$data/icon';
	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { toast } from '$lib/ui/sonner';

	import AddEditModal from './AddEditModal.svelte';
	import DeleteDialog from './DeleteDialog.svelte';
	import ManageModal from './ManageModal.svelte';

	type Props = {
		open?: boolean;
		presenter: CreateSocialPostPresenter;
		workspaceId: string | null;
		connectedChannels: CreateSocialPostChannelViewModel[];
		/** For image upload form field; server uses JWT for storage path. */
		uploadUid?: string;
	};

	let {
		open = $bindable(false),
		presenter,
		workspaceId,
		connectedChannels,
		uploadUid = ''
	}: Props = $props();

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
				<span>Create Post</span>
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
			<AddEditModal
				socialChannels={presenter.baseSocialChannelsVm}
				bind:body={presenter.editorBody}
				bind:postMediaItems={presenter.postMediaItems}
				uploadUid={uploadUid}
				busy={presenter.busy}
				selectedIds={presenter.selectedIds}
				mode={presenter.mode}
				focusedIntegrationId={presenter.focusedIntegrationId}
				previewText={presenter.previewText}
				charCount={presenter.charCount}
				softCharLimit={presenter.softCharLimit}
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
				onAddPost={() => toast.message('Thread replies will be added next.')}
				bind:settingsOpen={presenter.settingsOpen}
				providerSettings={presenter.providerSettingsByIntegrationId[presenter.focusedIntegrationId ?? ''] ?? {}}
				onProviderSettingsChange={presenter.updateFocusedProviderSettings.bind(presenter)}
				mediaUrls={presenter.previewMediaUrls}
			/>

			<div class="shrink-0">
				<ManageModal
					tagList={presenter.tagList}
					selectedTagNames={presenter.selectedTagNames}
					repeatInterval={presenter.repeatInterval}
					{repeatOptions}
					bind:scheduledLocal={presenter.scheduledLocal}
					busy={presenter.busy}
					primaryLabel={presenter.primaryLabel}
					scheduleDisabled={presenter.selectedIds.length === 0}
					onToggleTag={presenter.toggleTag.bind(presenter)}
					onAddTag={presenter.addNewTag.bind(presenter)}
					onDeleteTag={presenter.deleteWorkspaceTag.bind(presenter)}
					onRepeatChange={(v) => (presenter.repeatInterval = v)}
					onSaveDraft={saveAsDraft}
					onSchedule={schedulePost}
				/>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<DeleteDialog
	bind:open={presenter.confirmCloseOpen}
	onConfirm={confirmClose}
	onCancel={() => (presenter.confirmCloseOpen = false)}
/>
