<script lang="ts">
	import type { RepeatIntervalKey } from '$lib/posts/Post.repository.svelte';

	import { untrack } from 'svelte';

	import { PublicHumanizeComposerPresenter } from '$lib/ai-humanize';
	import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AddEditModal from '$lib/ui/components/posts/AddEditModal.svelte';
	import ManageModal from '$lib/ui/components/posts/ManageModal.svelte';

	type Props = {
		focusedProviderIdentifier?: string | null;
		composerMode?: 'global' | 'custom';
	};

	let { focusedProviderIdentifier = null, composerMode = 'global' }: Props = $props();

	const composer = new PublicHumanizeComposerPresenter({
		focusedProviderIdentifier: untrack(() => focusedProviderIdentifier),
		composerMode: untrack(() => composerMode)
	});

	let addEditModalRef = $state<import('$lib/ui/components/posts/AddEditModal.svelte').default | undefined>();
	const hasPostText = $derived(stripHtmlToPlainText(composer.editorBody).length > 0);

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
		return () => composer.teardown();
	});
</script>

<div
	class="border-base-300 flex min-h-[min(72vh,820px)] flex-col overflow-hidden rounded-2xl border bg-base-100 shadow-sm"
>
	<div
		class="border-base-300 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6"
	>
		<div class="flex min-w-0 items-center gap-2">
			<AbstractIcon name={icons.UserRoundPen.name} class="size-5" width="20" height="20" />
			<div>
				<p class="text-sm font-semibold text-base-content">Sound more human</p>
				<p class="text-base-content/65 text-xs">
					Rewrite so it reads less machine-written. Copy stays on this page; scheduling needs an
					account.
				</p>
			</div>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Button
				type="button"
				variant="primary"
				class="gap-1.5"
				disabled={!hasPostText || composer.busy}
				onclick={() => addEditModalRef?.openHumanize()}
			>
				<AbstractIcon name={icons.UserRoundPen.name} class="size-4" width="16" height="16" />
				Sound more human
			</Button>
			<Button
				type="button"
				variant="ghost"
				class="gap-1.5"
				onclick={() => void composer.copyPostText()}
			>
				<AbstractIcon name={icons.Copy.name} class="size-4" width="16" height="16" />
				Copy text
			</Button>
			<Button
				type="button"
				variant="outline"
				class="gap-1.5"
				onclick={() => composer.downloadPostText()}
			>
				<AbstractIcon name={icons.Save.name} class="size-4" width="16" height="16" />
				Download
			</Button>
		</div>
	</div>

	<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
		<div class="min-h-0 flex-1 overflow-auto">
			<AddEditModal
				bind:this={addEditModalRef}
				stockPhotosVm={composer.stockPhotosVm}
				designTemplatesVm={composer.designTemplatesVm}
				fetchPolotnoTemplateListPage={composer.fetchPolotnoTemplateListPage}
				backgroundPanelVm={composer.backgroundPanelVm}
				exportCanvasToMedia={composer.exportCanvasToMedia}
				writerPresenter={composer.writerPresenter}
				summarizerPresenter={composer.summarizerPresenter}
				humanizePresenter={composer.humanizePresenter}
				socialChannels={composer.baseSocialChannelsVm}
				bind:body={composer.editorBody}
				bind:postMediaItems={composer.postMediaItemsVm}
				uploadUid=""
				organizationId={null}
				busy={composer.busy}
				selectedIds={composer.selectedIds}
				mode={composer.mode}
				focusedIntegrationId={composer.focusedIntegrationId}
				previewText={composer.previewText}
				charCount={composer.charCount}
				softCharLimit={composer.softCharLimit}
				weightedCharCount={composer.weightedCharCount}
				constraintProviderIdentifiers={composer.writerConstraintProviderIdentifiers}
				maxMediaItems={composer.launchMaxMediaItems}
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
				onSelectGroup={() => composer.selectGroup()}
				editorLocked={composer.mode === 'custom' ? composer.editorLocked : false}
				editorLockMessage="Click this button to exit global editing and customize the post for this channel"
				onEditorUnlock={() => composer.unlockEditor()}
				editorBannerLeftLabel={composer.mode === 'custom' ? 'Editing a Specific Network' : null}
				editorBannerRightActionLabel={composer.mode === 'custom' ? 'Back to global' : null}
				onEditorBannerRightAction={composer.mode === 'custom'
					? () => composer.backToGlobalMode()
					: null}
				postComment={composer.postComment}
				onAddPost={() => composer.addThreadReply()}
				bind:settingsOpen={composer.settingsOpen}
				providerSettings={composer.focusedProviderSettings}
				providerSettingsByIntegrationId={composer.providerSettingsByIntegrationId}
				onProviderSettingsChange={(value) => composer.updateFocusedProviderSettings(value)}
				onUpdateProviderSettingsForIntegration={(integrationId, patch) =>
					composer.updateProviderSettingsForIntegration(integrationId, patch)}
				settingsDisabled={composer.busy}
				threadReplies={composer.threadRepliesVm}
				onChangeThreadReplies={(next) => composer.applyThreadReplies(next)}
				threadProviderIdentifier={composer.threadProviderIdentifier}
				mediaUrls={composer.previewMediaUrls}
				previewProviderSettings={composer.previewProviderSettings}
				guestMode={true}
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
				saveDraftLabel="Save as draft"
				primaryLabel="Schedule"
				scheduleDisabled={false}
				footerVariant="schedulePost"
				onToggleTag={(name) => composer.toggleTag(name)}
				onAddTag={(name) => composer.addTag(name)}
				onRepeatChange={(value) => composer.onRepeatChange(value)}
				onSaveDraft={() => {}}
				onSchedule={() => {}}
				guestMode={true}
			/>
		</div>
	</div>
</div>
