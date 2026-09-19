<script lang="ts">
	import type { RepeatIntervalKey } from '$lib/posts';
	import type { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPost.presenter.svelte';
	import type { PublicPayloadWizardComposerPresenter } from '$lib/posts/PublicPayloadWizardComposer.presenter.svelte';

	import { toast } from '$lib/ui/sonner';

	import AddEditModal from '$lib/ui/components/posts/AddEditModal.svelte';
	import ManageModal from '$lib/ui/components/posts/ManageModal.svelte';

	type Props = {
		mode?: 'guest' | 'workspace';
		guestComposer?: PublicPayloadWizardComposerPresenter;
		workspaceComposer?: CreateSocialPostPresenter;
		workspaceId?: string | null;
		isLoggedIn?: boolean;
		guestMode?: boolean;
	};

	let {
		mode = 'guest',
		guestComposer,
		workspaceComposer,
		workspaceId = null,
		isLoggedIn = false,
		guestMode = true
	}: Props = $props();

	const composer = $derived(
		mode === 'workspace' ? workspaceComposer : guestComposer
	);

	const uploadUid = $derived(mode === 'workspace' ? (workspaceId ?? '') : '');
	const organizationId = $derived(mode === 'workspace' ? workspaceId : null);
	const resolvedGuestMode = $derived(mode === 'workspace' ? false : guestMode);

	const wizardPayloadResult = $derived(
		composer?.getProgrammaticCreatePostPayloadPreview('scheduled') ?? { ok: false, error: '' }
	);

	async function copyProgrammaticPayload(status: 'draft' | 'scheduled'): Promise<void> {
		if (mode === 'workspace' && workspaceComposer) {
			const res = workspaceComposer.getProgrammaticCreatePostPayloadPreview(status);
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
			return;
		}
		if (guestComposer) {
			await guestComposer.copyProgrammaticPayload(status);
		}
	}

	const threadFollowUpEditorEnabled = $derived(
		(composer?.listThreadFollowUpSupportedIntegrationIds().length ?? 0) > 0
	);

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
</script>

{#if composer}
<div
	class="flex min-h-[min(72vh,820px)] min-w-0 flex-col overflow-hidden border border-base-300 shadow-sm {mode === 'workspace'
		? 'rounded-lg bg-base-100/50'
		: 'rounded-2xl bg-base-100'}"
>
	<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
		<div class="min-h-0 min-w-0 flex-1 overflow-auto">
			<AddEditModal
				stockPhotosVm={composer.stockPhotosVm}
				designTemplatesVm={composer.designTemplatesVm}
				fetchPolotnoTemplateListPage={composer.fetchPolotnoTemplateListPage}
				backgroundPanelVm={composer.backgroundPanelVm}
				exportCanvasToMedia={composer.exportCanvasToMedia}
				writerPresenter={mode === 'workspace'
					? workspaceComposer!.composerWriterPresenter
					: guestComposer!.writerPresenter}
				summarizerPresenter={mode === 'workspace'
					? workspaceComposer!.composerSummarizerPresenter
					: guestComposer!.summarizerPresenter}
				humanizePresenter={mode === 'workspace'
					? workspaceComposer!.composerHumanizePresenter
					: guestComposer!.humanizePresenter}
				loadSignaturesVmForComposer={composer.loadSignaturesVmForComposer}
				socialChannels={composer.baseSocialChannelsVm}
				bind:body={composer.editorBody}
				bind:postMediaItems={composer.postMediaItemsVm}
				{uploadUid}
				{organizationId}
				busy={composer.busy}
				selectedIds={composer.selectedIds}
				mode={composer.mode}
				focusedIntegrationId={composer.focusedIntegrationId}
				previewText={composer.previewText}
				charCount={composer.charCount}
				softCharLimit={composer.softCharLimit}
				weightedCharCount={composer.usesWeightedCharCount ? composer.charCount : undefined}
				constraintProviderIdentifiers={composer.writerConstraintProviderIdentifiers}
				maxMediaItems={composer.launchMaxMediaItems}
				scheduleValidationMessage={composer.scheduleValidationError}
				contentSetAuthoringNetworkLock={false}
				scheduledPostDatetimeLocal={composer.scheduledLocal}
				selectedGroupId={composer.selectedGroupId}
				onToggleChannel={(id) => composer.toggleChannel(id)}
				onToggleGlobal={() => {
					if (composer.mode === 'custom') composer.backToGlobalMode();
				}}
				onRemoveSelected={(id) => composer.removeSelected(id)}
				onFocusIntegration={(id) => composer.focusIntegration(id)}
				onRequestCustomize={(id) => composer.requestCustomize(id)}
				onSelectGroup={(groupId) => composer.selectGroup(groupId)}
				editorLocked={composer.mode === 'custom' ? composer.editorLocked : false}
				editorLockMessage="Click this button to exit global editing and customize the post for this channel"
				onEditorUnlock={() => {
					composer.customEditingUnlocked = true;
					composer.editorLocked = false;
				}}
				editorBannerLeftLabel={composer.mode === 'custom' ? 'Editing a Specific Network' : null}
				editorBannerRightActionLabel={composer.mode === 'custom' ? 'Back to global' : null}
				onEditorBannerRightAction={composer.mode === 'custom'
					? () => composer.backToGlobalMode()
					: null}
				postComment={composer.postComment}
				onAddPost={() => composer.handleAddThreadItemClick()}
				bind:settingsOpen={composer.settingsOpen}
				providerSettings={composer.providerSettingsByIntegrationId[composer.focusedIntegrationId ?? ''] ?? {}}
				providerSettingsByIntegrationId={composer.providerSettingsByIntegrationId}
				onProviderSettingsChange={(value) => composer.updateFocusedProviderSettings(value)}
				onUpdateProviderSettingsForIntegration={(integrationId, patch) =>
					composer.updateProviderSettingsForIntegration(integrationId, patch)}
				settingsDisabled={composer.busy}
				threadReplies={composer.getThreadFollowUpRepliesForEditor()}
				onChangeThreadReplies={threadFollowUpEditorEnabled
					? (next) => {
							composer.applyThreadFollowUpReplies(next);
						}
					: undefined}
				threadProviderIdentifier={composer.getPrimaryThreadFollowUpIntegrationId()
					? (composer.baseSocialChannelsVm.find(
							(c) => c.id === composer.getPrimaryThreadFollowUpIntegrationId()
						)?.identifier ?? null)
					: null}
				mediaUrls={composer.previewMediaUrls}
				guestMode={resolvedGuestMode}
				{isLoggedIn}
			/>
		</div>
		<div class="sticky bottom-0 z-10 shrink-0 pb-[env(safe-area-inset-bottom)]">
			<ManageModal
				tagsVm={composer.tagsVm}
				selectedTagNames={composer.selectedTagNames}
				repeatInterval={composer.repeatInterval}
				{repeatOptions}
				bind:scheduledLocal={composer.scheduledLocal}
				busy={composer.busy}
				showDelete={false}
				saveDraftLabel="Copy draft payload"
				primaryLabel="Copy scheduled payload"
				scheduleDisabled={!wizardPayloadResult.ok}
				footerVariant="schedulePost"
				onToggleTag={(name) => composer.toggleTag(name)}
				onAddTag={(name) => composer.addNewTag(name)}
				onDeleteTag={mode === 'workspace'
					? (tag) => void workspaceComposer?.deleteWorkspaceTag(tag)
					: () => guestComposer?.deleteWorkspaceTag()}
				onRepeatChange={(value) => {
					composer.repeatInterval = value;
				}}
				onSaveDraft={() => void copyProgrammaticPayload('draft')}
				onSchedule={() => void copyProgrammaticPayload('scheduled')}
				showPublishNow={false}
				guestMode={resolvedGuestMode}
				{isLoggedIn}
			/>
		</div>
	</div>
</div>
{/if}
