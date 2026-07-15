<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
	import type { WriterPresenter } from '$lib/ai-writer/Writer.presenter.svelte';
	import type {
		BackgroundPanelViewModel,
		DesignTemplateProgrammerModel,
		ExportCanvasToMediaFn,
		PolotnoTemplateListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';
	import type { PostCommentMode } from '$lib/ui/components/posts/AddPostButton.svelte';
	import type { PostMediaProgrammerModel } from '$lib/posts';
	import type { CrossAccountPlugState } from '$lib/posts/utils/createSocialPostProviderSettings';
	import type { FetchSignaturesForComposerFn } from '$lib/signatures';

	import { integrationsRepository } from '$lib/integrations';
	import { datetimeLocalToIso } from '$lib/utils/postingSchedulePreferences';
	import * as Dialog from '$lib/ui/dialog';

	import AddPostButton from '$lib/ui/components/posts/AddPostButton.svelte';
	import CrossAccountPlugs from '$lib/ui/components/posts/plugs/CrossAccountPlugs.svelte';
	import EditorPost from '$lib/ui/components/posts/EditorPost.svelte';
	import PicksSocialsComponent from '$lib/ui/components/posts/PicksSocialsComponent.svelte';
	import SelectGroupTargeting from '$lib/ui/components/posts/SelectGroupTargeting.svelte';
	import SelectTargets from '$lib/ui/components/posts/SelectTargets.svelte';
	import SettingsAccordion from '$lib/ui/components/posts/SettingsAccordion.svelte';
	import ShowAllProviders from '$lib/ui/components/posts/providers/ShowAllProviders.svelte';
	import ThreadRepliesEditor from '$lib/ui/components/posts/thread/ThreadRepliesEditor.svelte';

	type Mode = 'global' | 'custom';

	type Props = {
		stockPhotosVm: readonly StockPhotoViewModel[];
		designTemplatesVm: readonly DesignTemplateProgrammerModel[];
		fetchPolotnoTemplateListPage: (
			params: { query: string; page: number },
			signal?: AbortSignal
		) => Promise<PolotnoTemplateListPageProgrammerModel>;
		backgroundPanelVm: BackgroundPanelViewModel;
		exportCanvasToMedia: ExportCanvasToMediaFn;
		writerPresenter: WriterPresenter;
		socialChannels: CreateSocialPostChannelViewModel[];
		selectedIds: string[];
		mode: Mode;
		focusedIntegrationId: string | null;
		body?: string;
		busy?: boolean;
		previewText: string;
		charCount: number;
		softCharLimit: number;
		/** When set, pass weighted count to X preview. */
		weightedCharCount?: number;
		/** Unique provider identifiers for AI Writer constraint strip. */
		constraintProviderIdentifiers?: readonly string[];
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
		providerSettingsByIntegrationId?: Record<string, Record<string, unknown>>;
		onProviderSettingsChange: (value: Record<string, unknown>) => void;
		onUpdateProviderSettingsForIntegration?: (
			integrationId: string,
			patch: Record<string, unknown>
		) => void;
		threadReplies?: { id: string; message: string; delaySeconds: number }[];
		onChangeThreadReplies?: (next: { id: string; message: string; delaySeconds: number }[]) => void;
		/** Main post `datetime-local` (ManageModal); used for thread reply delay hints. */
		scheduledPostDatetimeLocal?: string | null;
		threadProviderIdentifier?: string | null;
		settingsDisabled?: boolean;
		postMediaItems?: PostMediaProgrammerModel[];
		uploadUid?: string;
		organizationId?: string | null;
		loadSignaturesVmForComposer?: FetchSignaturesForComposerFn;
		mediaUrls?: string[];
		maxMediaItems?: number | null;
		scheduleValidationMessage?: string | null;
		/** Provider settings row for the channel used in the preview (same scope as thread replies). */
		previewProviderSettings?: Record<string, unknown>;
		/** Locks per-network customization while authoring a reusable workspace set. */
		contentSetAuthoringNetworkLock?: boolean;
	};

	let {
		stockPhotosVm,
		designTemplatesVm,
		fetchPolotnoTemplateListPage,
		backgroundPanelVm,
		exportCanvasToMedia,
		writerPresenter,
		socialChannels,
		selectedIds,
		mode,
		focusedIntegrationId,
		body = $bindable(''),
		busy = false,
		previewText,
		charCount,
		softCharLimit,
		weightedCharCount,
		constraintProviderIdentifiers = [],
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
		providerSettingsByIntegrationId = {},
		onProviderSettingsChange,
		onUpdateProviderSettingsForIntegration = undefined,
		threadReplies = [],
		onChangeThreadReplies = undefined,
		scheduledPostDatetimeLocal = null,
		threadProviderIdentifier = null,
		settingsDisabled = false,
		postMediaItems = $bindable([]),
		uploadUid = '',
		organizationId = null,
		loadSignaturesVmForComposer = undefined,
		mediaUrls = [],
		maxMediaItems = null,
		scheduleValidationMessage = null,
		previewProviderSettings = {},
		contentSetAuthoringNetworkLock = false
	}: Props = $props();

	const publishDateIso = $derived(
		scheduledPostDatetimeLocal?.trim() ? datetimeLocalToIso(scheduledPostDatetimeLocal) : null
	);

	/** Channel shown in the preview: custom focus, or exactly one selected target in global mode. */
	const previewChannel = $derived.by(() => {
		const integrationId =
			mode === 'custom'
				? focusedIntegrationId
				: selectedIds.length === 1
					? selectedIds[0]
					: null;
		return integrationId ? socialChannels.find((c) => c.id === integrationId) ?? null : null;
	});

	const previewThreadRepliesVm = $derived(
		threadReplies.filter((r) => typeof r.message === 'string' && r.message.trim().length > 0)
	);

	const previewThreadFinisher = $derived.by(() => {
		const threads = previewProviderSettings?.threads;
		if (!threads || typeof threads !== 'object') return null;
		const t = threads as Record<string, unknown>;
		const enabled = typeof t.enabled === 'boolean' ? t.enabled : false;
		if (!enabled) return null;
		const message = typeof t.message === 'string' ? t.message.trim() : '';
		return { enabled: true as const, message: message || "That's a wrap!" };
	});

	/** Threads internal plug (`threads.internalEngagementPlug`) — runs after replies & thread finisher in the worker. */
	let editorPostRef = $state<import('./EditorPost.svelte').default | undefined>();
	let plugSettingsOpen = $state(false);

	function handleToggleGlobalFromTargets() {
		const needsConfirm =
			mode === 'custom' &&
			editorBannerRightActionLabel === 'Back to global' &&
			onEditorBannerRightAction != null;
		if (needsConfirm) {
			editorPostRef?.requestBackToGlobalWithConfirmation?.();
			return;
		}
		onToggleGlobal();
	}

	const previewDelayedEngagementReply = $derived.by(() => {
		const threads = previewProviderSettings?.threads;
		if (!threads || typeof threads !== 'object') return null;
		const ig = (threads as Record<string, unknown>).internalEngagementPlug;
		if (!ig || typeof ig !== 'object') return null;
		const p = ig as Record<string, unknown>;
		if (p.enabled !== true) return null;
		const message = typeof p.message === 'string' ? p.message : '';
		const delaySeconds =
			typeof p.delaySeconds === 'number' && Number.isFinite(p.delaySeconds) ? p.delaySeconds : 0;
		return { enabled: true as const, message, delaySeconds };
	});

	const previewScheduleMetaLabel = $derived.by(() => {
		const raw = scheduledPostDatetimeLocal?.trim();
		if (!raw) return null;
		const ms = Date.parse(raw);
		if (Number.isFinite(ms)) {
			return new Date(ms).toLocaleDateString(undefined, {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			});
		}
		const d = new Date(raw);
		if (!Number.isFinite(d.getTime())) return null;
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	});

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

	const focusedIntegrationIdForComposer = $derived.by(() => {
		if (mode === 'custom') {
			return focusedIntegrationId ?? (selectedIds.length === 1 ? selectedIds[0] : null);
		}
		return selectedIds.length === 1 ? selectedIds[0] : null;
	});

	const plugSettingsIntegrationId = $derived.by(() => {
		if (mode === 'custom') return focusedIntegrationId ?? null;
		return selectedIds.length === 1 ? selectedIds[0] : null;
	});

	const canShowPlugSettings = $derived.by(() => {
		if (!plugSettingsIntegrationId) return false;
		const ch = socialChannels.find((c) => c.id === plugSettingsIntegrationId);
		const id = (ch?.identifier ?? '').toLowerCase();
		return id === 'threads' || id === 'x' || id === 'linkedin' || id === 'linkedin-page';
	});

	type CrossAccountPlugDefinition = {
		identifier: string;
		title: string;
		description: string;
		pickIntegration?: string[];
		fields?: Array<{
			name: string;
			description: string;
			type: string;
			placeholder: string;
		}>;
	};

	function crossAccountSettingsBucket(identifier: string): 'threads' | 'x' | 'linkedin' | null {
		const id = (identifier ?? '').toLowerCase();
		if (id === 'threads') return 'threads';
		if (id === 'x') return 'x';
		if (id === 'linkedin' || id === 'linkedin-page') return 'linkedin';
		return null;
	}

	function crossAccountDefsProviderKey(identifier: string): string | null {
		const id = (identifier ?? '').toLowerCase();
		if (id === 'threads') return 'threads';
		if (id === 'x') return 'x';
		if (id === 'linkedin' || id === 'linkedin-page') return 'linkedin';
		return null;
	}

	const plugSettingsProviderSettings = $derived.by(() => {
		if (!plugSettingsIntegrationId) return {};
		return providerSettingsByIntegrationId[plugSettingsIntegrationId] ?? {};
	});

	let plugDialogCrossAccountPlugs = $state<CrossAccountPlugState[]>([]);
	let plugDialogDefs = $state<CrossAccountPlugDefinition[]>([]);
	let plugDialogLastLoadedSig = $state('');
	let plugDialogLastEmittedSig = $state('');

	$effect(() => {
		const integrationId = plugSettingsIntegrationId;
		const ch = integrationId ? socialChannels.find((c) => c.id === integrationId) : null;
		const bucket = ch ? crossAccountSettingsBucket(ch.identifier ?? '') : null;
		const settings = plugSettingsProviderSettings;
		if (!integrationId || !bucket) {
			plugDialogCrossAccountPlugs = [];
			plugDialogLastLoadedSig = '';
			return;
		}
		const bucketSettings = settings[bucket];
		const plugs = Array.isArray(
			(bucketSettings as { crossAccountPlugs?: unknown } | undefined)?.crossAccountPlugs
		)
			? ((bucketSettings as { crossAccountPlugs: CrossAccountPlugState[] }).crossAccountPlugs ?? [])
			: [];
		const sig = JSON.stringify(plugs);
		if (sig === plugDialogLastLoadedSig) return;
		plugDialogLastLoadedSig = sig;
		plugDialogLastEmittedSig = sig;
		plugDialogCrossAccountPlugs = plugs;
	});

	$effect(() => {
		const orgId = organizationId;
		const integrationId = plugSettingsIntegrationId;
		const open = plugSettingsOpen;
		if (!open || !orgId || !integrationId) {
			plugDialogDefs = [];
			return;
		}
		const ch = socialChannels.find((c) => c.id === integrationId);
		const providerKey = ch ? crossAccountDefsProviderKey(ch.identifier ?? '') : null;
		if (!providerKey) {
			plugDialogDefs = [];
			return;
		}
		void integrationsRepository.getInternalPlugDefinitions(orgId, providerKey).then((defs) => {
			plugDialogDefs = defs.filter((d) => (d.pickIntegration?.length ?? 0) > 0);
		});
	});

	$effect(() => {
		const integrationId = plugSettingsIntegrationId;
		const open = plugSettingsOpen;
		if (!open || !integrationId || !onUpdateProviderSettingsForIntegration) return;
		const ch = socialChannels.find((c) => c.id === integrationId);
		const bucket = ch ? crossAccountSettingsBucket(ch.identifier ?? '') : null;
		if (!bucket) return;
		const active = plugDialogCrossAccountPlugs.filter((p) => p.enabled && p.integrationIds.length > 0);
		const sig = JSON.stringify(active);
		if (sig === plugDialogLastEmittedSig) return;
		plugDialogLastEmittedSig = sig;
		onUpdateProviderSettingsForIntegration(integrationId, {
			[bucket]: active.length ? { crossAccountPlugs: active } : {}
		});
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
			onToggleGlobal={handleToggleGlobalFromTargets}
			onRemoveSelected={onRemoveSelected}
			onFocusIntegration={onFocusIntegration}
			onRequestCustomize={onRequestCustomize}
		/>

		<!-- Wrapper: editor + add-post button -->
		<div class="rounded-lg border border-base-300 bg-base-100/30 p-3">
			<EditorPost
				bind:this={editorPostRef}
				{stockPhotosVm}
				{designTemplatesVm}
				{fetchPolotnoTemplateListPage}
				{backgroundPanelVm}
				{exportCanvasToMedia}
				{writerPresenter}
				bind:body
				bind:postMediaItems
				{uploadUid}
				{publishDateIso}
				organizationId={organizationId}
				{loadSignaturesVmForComposer}
				{busy}
				{charCount}
				{softCharLimit}
				composerMode={mode}
				focusedProviderIdentifier={focusedProviderIdentifier}
				constraintProviderIdentifiers={constraintProviderIdentifiers}
				focusedIntegrationId={focusedIntegrationIdForComposer}
				{maxMediaItems}
				{scheduleValidationMessage}
				setsAuthoringNetworkLock={contentSetAuthoringNetworkLock}
				locked={editorLocked}
				lockMessage={editorLockMessage}
				onUnlock={onEditorUnlock}
				bannerLeftLabel={editorBannerLeftLabel}
				bannerRightActionLabel={editorBannerRightActionLabel}
				onBannerRightAction={onEditorBannerRightAction ?? undefined}
				confirmBannerRightAction={editorBannerRightActionLabel === 'Back to global'}
			/>

			{#if !onChangeThreadReplies}
				<div class="mt-3">
					<AddPostButton
						onclick={onAddPost}
						postComment={postComment}
						onOpenPlugSettings={canShowPlugSettings ? () => (plugSettingsOpen = true) : undefined}
						disabled={busy || editorLocked}
					/>
				</div>
			{/if}
		</div>

		{#if mode === 'custom' && focusedIntegrationId}
			{@const focused = socialChannels.find((c) => c.id === focusedIntegrationId)}
			{#if focused}
				<div class="mt-3">
					<SettingsAccordion
						bind:open={settingsOpen}
						channel={focused}
						allChannels={socialChannels}
						value={providerSettings}
						onChange={onProviderSettingsChange}
						organizationId={organizationId}
						uploadUid={uploadUid}
						disabled={settingsDisabled}
					/>
				</div>
			{/if}
		{/if}

		{#if onChangeThreadReplies}
			<ThreadRepliesEditor
				providerIdentifier={threadProviderIdentifier}
				{postComment}
				replySoftCharLimit={softCharLimit}
				scheduledPostDatetimeLocal={scheduledPostDatetimeLocal}
				disabled={busy}
				replies={threadReplies}
				onAddReply={onAddPost}
				onOpenPlugSettings={canShowPlugSettings ? () => (plugSettingsOpen = true) : undefined}
				onChangeReplies={onChangeThreadReplies}
			/>
		{/if}

	</div>
	<div class="min-h-0">
		<div class="bg-base-200/20 flex min-h-[200px] flex-col lg:min-h-0">
			<div class="border-base-300 flex items-center justify-between border-b px-4 py-3 sm:px-6">
				<div class="text-base-content/90 text-base font-medium">
					Post Preview
				</div>
			</div>
			<div class="p-4 sm:p-6">
				<ShowAllProviders
					channel={previewChannel}
					{previewText}
					{mediaUrls}
					maximumCharacters={softCharLimit}
					{weightedCharCount}
					threadReplies={previewThreadRepliesVm}
					threadFinisher={previewThreadFinisher}
					delayedEngagementReply={previewDelayedEngagementReply
						? {
								message: previewDelayedEngagementReply.message,
								delaySeconds: previewDelayedEngagementReply.delaySeconds
							}
						: null}
					previewMetaLabel={previewScheduleMetaLabel}
				/>
			</div>
		</div>
	</div>
</div>

<Dialog.Root bind:open={plugSettingsOpen}>
	<Dialog.Content class="max-h-[min(90vh,760px)] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title class="text-lg">Plug settings</Dialog.Title>
			<Dialog.Description class="text-base-content/65">
				Configure engagement plugs for the focused channel.
			</Dialog.Description>
		</Dialog.Header>

		{#if plugSettingsIntegrationId}
			{@const focused = socialChannels.find((c) => c.id === plugSettingsIntegrationId)}
			{#if focused && canShowPlugSettings}
				<div class="mt-4">
					<CrossAccountPlugs
						currentChannel={focused}
						allChannels={socialChannels}
						plugs={plugDialogDefs}
						bind:value={plugDialogCrossAccountPlugs}
						disabled={busy}
						compact
					/>
				</div>
			{:else}
				<p class="mt-4 text-sm text-base-content/60">
					No plug settings available for this provider yet.
				</p>
			{/if}
		{/if}

		<div class="mt-6 flex justify-end">
			<Dialog.Close class="border-base-300 bg-base-100 text-base-content rounded-md border px-3 py-2 text-sm hover:bg-base-200">
				Close
			</Dialog.Close>
		</div>
	</Dialog.Content>
</Dialog.Root>
