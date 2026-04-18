<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
	import type { ExportCanvasToMediaFn, StockPhotoViewModel } from '$lib/canvas';
	import type { PostCommentMode } from '$lib/ui/components/posts/AddPostButton.svelte';
	import type { PostMediaProgrammerModel } from '$lib/posts';

	import AddPostButton from '$lib/ui/components/posts/AddPostButton.svelte';
	import EditorPost from '$lib/ui/components/posts/EditorPost.svelte';
	import PicksSocialsComponent from '$lib/ui/components/posts/PicksSocialsComponent.svelte';
	import SelectGroupTargeting from '$lib/ui/components/posts/SelectGroupTargeting.svelte';
	import SelectTargets from '$lib/ui/components/posts/SelectTargets.svelte';
	import SettingsAccordion from '$lib/ui/components/posts/SettingsAccordion.svelte';
	import ShowAllProviders from '$lib/ui/components/posts/providers/ShowAllProviders.svelte';

	type Mode = 'global' | 'custom';

	interface AddEditModalProps {
		stockPhotosVm: readonly StockPhotoViewModel[];
		exportCanvasToMedia: ExportCanvasToMediaFn;
		socialChannels: CreateSocialPostChannelViewModel[];
		selectedIds: string[];
		mode: Mode;
		focusedIntegrationId: string | null;
		body?: string;
		busy?: boolean;
		previewText: string;
		charCount: number;
		softCharLimit: number;
		selectedGroupId: string | null;
		onToggleChannel: (id: string) => void;
		onToggleGlobal: () => void;
		onRemoveSelected: (id: string) => void;
		onFocusIntegration: (id: string) => void;
		onRequestCustomize: (id: string) => void;
		onSelectGroup: (groupId: string | null) => void;
		editorLocked: boolean;
		editorLockMessage: string;
		onEditorUnlock: () => void;
		editorBannerLeftLabel: string | null;
		editorBannerRightActionLabel: string | null;
		onEditorBannerRightAction: (() => void) | null;
		postComment: PostCommentMode;
		onAddPost: () => void;
		settingsOpen?: boolean;
		providerSettings?: Record<string, unknown>;
		onProviderSettingsChange: (value: Record<string, unknown>) => void;
		postMediaItems?: PostMediaProgrammerModel[];
		uploadUid?: string;
		mediaUrls?: string[];
	}

	let {
		stockPhotosVm,
		exportCanvasToMedia,
		socialChannels,
		selectedIds,
		mode,
		focusedIntegrationId,
		body = $bindable(''),
		busy = false,
		previewText,
		charCount,
		softCharLimit,
		selectedGroupId,
		onToggleChannel,
		onToggleGlobal,
		onRemoveSelected,
		onFocusIntegration,
		onRequestCustomize,
		onSelectGroup,
		editorLocked,
		editorLockMessage,
		onEditorUnlock,
		editorBannerLeftLabel,
		editorBannerRightActionLabel,
		onEditorBannerRightAction,
		postComment,
		onAddPost,
		settingsOpen = $bindable(false),
		providerSettings = {},
		onProviderSettingsChange,
		postMediaItems = $bindable([]),
		uploadUid = '',
		mediaUrls = []
	}: AddEditModalProps = $props();

	/**
	 * Integration `identifier` used to default the design canvas format.
	 * - Custom: focused channel, or the only selected channel if focus is unset.
	 * - Global: the only selected channel (e.g. “Create post” from IntegrationMenu preselects one id without switching to custom mode).
	 */
	const focusedProviderIdentifier = $derived.by(() => {
		const integrationId =
			mode === 'custom'
				? (focusedIntegrationId ?? (selectedIds.length === 1 ? selectedIds[0] : null))
				: selectedIds.length === 1
					? selectedIds[0]
					: null;
		if (!integrationId) return null;
		return socialChannels.find((c) => c.id === integrationId)?.identifier ?? null;
	});
</script>

<div class="grid min-h-0 flex-1 grid-cols-1 divide-y divide-base-300 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
	<div class="flex min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
		<div class="flex items-start justify-between gap-3">
			<PicksSocialsComponent channels={socialChannels} {selectedIds} onToggleChannel={onToggleChannel} />
			<SelectGroupTargeting
				channels={socialChannels}
				selectedGroupId={selectedGroupId}
				onSelect={onSelectGroup}
			/>
		</div>

		<SelectTargets
			{mode}
			{focusedIntegrationId}
			{selectedIds}
			channels={socialChannels}
			onToggleGlobal={onToggleGlobal}
			onRemoveSelected={onRemoveSelected}
			onFocusIntegration={onFocusIntegration}
			onRequestCustomize={onRequestCustomize}
		/>

		<!-- Wrapper: editor + add-post button (matches original structure) -->
		<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
			<EditorPost
				{stockPhotosVm}
				{exportCanvasToMedia}
				bind:body
				bind:postMediaItems
				{uploadUid}
				{busy}
				{charCount}
				{softCharLimit}
				composerMode={mode}
				focusedProviderIdentifier={focusedProviderIdentifier}
				locked={editorLocked}
				lockMessage={editorLockMessage}
				onUnlock={onEditorUnlock}
				bannerLeftLabel={editorBannerLeftLabel}
				bannerRightActionLabel={editorBannerRightActionLabel}
				onBannerRightAction={onEditorBannerRightAction ?? undefined}
				confirmBannerRightAction={editorBannerRightActionLabel === 'Back to global'}
			/>

			<div class="mt-3">
				<AddPostButton onclick={onAddPost} postComment={postComment} disabled={busy || editorLocked} />
			</div>
		</div>

		{#if mode === 'custom' && focusedIntegrationId}
			{@const focused = socialChannels.find((c) => c.id === focusedIntegrationId)}
			{#if focused}
				<div class="mt-3">
					<SettingsAccordion
						bind:open={settingsOpen}
						channel={focused}
						value={providerSettings}
						onChange={onProviderSettingsChange}
					/>
				</div>
			{/if}
		{/if}

	</div>
	<div class="min-h-0">
		{#if focusedIntegrationId}
			{@const focused = socialChannels.find((c) => c.id === focusedIntegrationId) ?? null}
			<div class="bg-base-200/20 flex min-h-[200px] flex-col lg:min-h-0">
				<div class="border-base-300 flex items-center justify-between border-b px-4 py-3 sm:px-6">
					<div class="text-base-content/90 text-base font-medium">Post Preview</div>
				</div>
				<div class="p-4 sm:p-6">
					<ShowAllProviders channel={focused} {previewText} {mediaUrls} maximumCharacters={softCharLimit} />
				</div>
			</div>
		{:else}
			<div class="bg-base-200/20 flex min-h-[200px] flex-col lg:min-h-0">
				<div class="border-base-300 flex items-center justify-between border-b px-4 py-3 sm:px-6">
					<div class="text-base-content/90 text-base font-medium">Post Preview</div>
				</div>
				<div class="p-4 sm:p-6">
					<ShowAllProviders channel={null} {previewText} {mediaUrls} maximumCharacters={softCharLimit} />
				</div>
			</div>
		{/if}
	</div>
</div>
