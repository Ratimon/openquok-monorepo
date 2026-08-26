<script lang="ts">
	import type { HumanizePresenter } from '$lib/ai-humanize/Humanize.presenter.svelte';
	import type { SummarizerPresenter } from '$lib/ai-summarizer/Summarizer.presenter.svelte';
	import type { WriterPresenter } from '$lib/ai-writer/Writer.presenter.svelte';
	import type {
		BackgroundPanelViewModel,
		DesignTemplateProgrammerModel,
		ExportCanvasToMediaFn,
		PolotnoTemplateListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';
	import type { PostMediaProgrammerModel } from '$lib/posts';
	import type { IntegrationEditorMode } from '$lib/integrations/integrationEditorMode';
	import type { ComposerTextHistory } from '$lib/posts/utils/composerTextHistory';
	import type { FetchSignaturesForComposerFn } from '$lib/signatures';

	import { icons } from '$data/icons';
	import {
		SocialComposerEditor,
		usesRichComposerEditor
	} from '$lib/ui/components/posts/composer-editor';
	import { snapshotFromTextarea } from '$lib/posts/utils/composerTextareaSnapshot';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';
	import ComposerMediaToolbar from '$lib/ui/components/posts/ComposerMediaToolbar.svelte';
	import ComposerMentionAutocomplete from '$lib/ui/components/posts/ComposerMentionAutocomplete.svelte';
	import MultiMedia from '$lib/ui/components/media/MultiMedia.svelte';
	import { providerSupportsComposerMentions } from '$lib/posts/utils/composerMention';
	import { filesFromDataTransfer } from '$lib/posts/utils/composerMediaDrop';
	import { toast } from '$lib/ui/sonner';

	interface EditorPostProps {
		stockPhotosVm?: readonly StockPhotoViewModel[];
		designTemplatesVm?: readonly DesignTemplateProgrammerModel[];
		fetchPolotnoTemplateListPage?: (
			params: { query: string; page: number },
			signal?: AbortSignal
		) => Promise<PolotnoTemplateListPageProgrammerModel>;
		backgroundPanelVm?: BackgroundPanelViewModel;
		exportCanvasToMedia?: ExportCanvasToMediaFn;
		/** Injected from CreateSocialPostPresenter when the media toolbar (AI Writer) is shown. */
		writerPresenter?: WriterPresenter;
		/** Injected from CreateSocialPostPresenter when the media toolbar (AI Summarizer) is shown. */
		summarizerPresenter?: SummarizerPresenter;
		/** Injected from CreateSocialPostPresenter when the media toolbar (Sound more human) is shown. */
		humanizePresenter?: HumanizePresenter;
		body?: string;
		busy?: boolean;
		charCount: number;
		softCharLimit: number;
		locked?: boolean;
		lockMessage?: string;
		onUnlock?: () => void;
		bannerLeftLabel?: string | null;
		bannerRightActionLabel?: string | null;
		onBannerRightAction?: () => void;
		confirmBannerRightAction?: boolean;
		postMediaItems?: PostMediaProgrammerModel[];
		/** Auth uid for multipart upload field; storage path uses JWT on the server. */
		uploadUid?: string;
		/** Scheduled publish time (ISO) — selects the media library folder for composer uploads. */
		publishDateIso?: string | null;
		/** Current workspace for org-scoped signatures in the toolbar. */
		organizationId?: string | null;
		loadSignaturesVmForComposer?: FetchSignaturesForComposerFn;
		composerMode?: 'global' | 'custom';
		focusedProviderIdentifier?: string | null;
		focusedIntegrationId?: string | null;
		/** Unique provider identifiers for AI Writer / Summarizer / Humanize constraint awareness. */
		constraintProviderIdentifiers?: readonly string[];
		/** When set, blocks adding more main-post attachments once reached (`null` = no cap). */
		maxMediaItems?: number | null;
		/** When true, render in "comment" mode (no media; smaller UX). */
		comments?: boolean;
		/** Shorter textarea for landing previews and tight layouts. */
		compact?: boolean;
		scheduleValidationMessage?: string | null;
		/** Blocks per-network customization UX while defining a reusable workspace set (global authoring only). */
		setsAuthoringNetworkLock?: boolean;
		/**
		 * Public tool composer: local blob attach; library / design / signatures stay behind Sign in + Sign up.
		 */
		guestMode?: boolean;
		isLoggedIn?: boolean;
		/** Per-channel undo stack from CreateSocialPostPresenter; omit for guest / thread reply editors. */
		composerTextHistory?: ComposerTextHistory;
		composerHistoryKey?: string;
		/** Global → `normal`; per-channel unlock uses the channel catalog `editor` field. */
		composerEditorMode?: IntegrationEditorMode;
	}

	let {
		stockPhotosVm = [],
		designTemplatesVm = [],
		fetchPolotnoTemplateListPage = async () => ({ items: [], page: 1, totalPages: 1 }),
		backgroundPanelVm = {
			fetchPolotnoUnsplashPagePm: async () => ({ items: [], page: 1, totalPages: 1 }),
			triggerPolotnoUnsplashDownloadPm: () => {}
		},
		exportCanvasToMedia = async () => ({ ok: false, error: 'Export is not configured.' }),
		writerPresenter = undefined,
		summarizerPresenter = undefined,
		humanizePresenter = undefined,
		body = $bindable(''),
		busy = false,
		charCount,
		softCharLimit,
		locked = false,
		lockMessage = 'Click this button to exit global editing and customize the post for this channel',
		onUnlock,
		bannerLeftLabel = null,
		bannerRightActionLabel = null,
		onBannerRightAction,
		confirmBannerRightAction = false,
		postMediaItems = $bindable<PostMediaProgrammerModel[]>([]),
		uploadUid = '',
		publishDateIso = null,
		organizationId = null,
		loadSignaturesVmForComposer = undefined,
		composerMode = 'global',
		focusedProviderIdentifier = null,
		focusedIntegrationId = null,
		constraintProviderIdentifiers = [],
		maxMediaItems = null,
		comments = false,
		compact = false,
		scheduleValidationMessage = null,
		setsAuthoringNetworkLock = false,
		guestMode = false,
		isLoggedIn = false,
		composerTextHistory = undefined,
		composerHistoryKey = 'global',
		composerEditorMode = 'normal'
	}: EditorPostProps = $props();

	let applyingComposerHistory = $state(false);
	let suppressTypingHistory = $state(false);
	let lastComposerHistoryKey = $state<string | null>(null);
	let historyCanUndo = $state(false);
	let historyCanRedo = $state(false);

	let confirmOpen = $state(false);
	let mediaToolbarRef = $state<import('./ComposerMediaToolbar.svelte').default | undefined>();
	let mentionAutocompleteRef =
		$state<import('./ComposerMentionAutocomplete.svelte').default | undefined>();
	let composerTextarea = $state.raw<HTMLTextAreaElement | null>(null);
	let richComposerEditorRef =
		$state<import('$lib/ui/components/posts/composer-editor/SocialComposerEditor.svelte').default | undefined>();
	let mountedEditorMode = $state<IntegrationEditorMode>('normal');
	let composerMedia = $state<MultiMedia | undefined>(undefined);
	let composerDragOver = $state(false);

	const usesRichEditor = $derived(usesRichComposerEditor(mountedEditorMode));
	const richTiptapEditor = $derived(richComposerEditorRef?.getEditor() ?? null);
	const richEditorInstanceKey = $derived(
		`${mountedEditorMode}-${focusedIntegrationId ?? 'none'}`
	);
	const richMentionConfig = $derived.by(() => {
		if (
			composerMode !== 'custom' ||
			guestMode ||
			!organizationId?.trim() ||
			!focusedIntegrationId?.trim() ||
			!providerSupportsComposerMentions(focusedProviderIdentifier)
		) {
			return null;
		}
		return {
			organizationId: organizationId.trim(),
			integrationId: focusedIntegrationId.trim(),
			providerIdentifier: focusedProviderIdentifier ?? ''
		};
	});

	$effect(() => {
		const mode = composerEditorMode;
		const timer = setTimeout(() => {
			mountedEditorMode = mode;
		}, 20);
		return () => clearTimeout(timer);
	});

	function requestBannerRightAction() {
		if (!onBannerRightAction) return;
		if (confirmBannerRightAction) {
			confirmOpen = true;
			return;
		}
		onBannerRightAction();
	}

	function confirm() {
		confirmOpen = false;
		onBannerRightAction?.();
	}

	/** Same flow as the "Back to global" banner control (confirmation when enabled). */
	export function requestBackToGlobalWithConfirmation() {
		requestBannerRightAction();
	}

	/** Public Humanizer header — opens Sound more human on the composer toolbar. */
	export function openHumanize() {
		mediaToolbarRef?.openHumanize();
	}

	const numMedia = $derived(postMediaItems.length);
	const mediaAtCap = $derived(maxMediaItems != null && numMedia >= maxMediaItems);

	const defineSetScopeOverlay = $derived(setsAuthoringNetworkLock && composerMode === 'custom');

	function onComposerPaste(e: ClipboardEvent) {
		if (!mediaAtCap) return;
		const files = e.clipboardData?.files;
		if (files && files.length > 0) {
			e.preventDefault();
			toast.error(
				maxMediaItems === 1
					? 'This network only supports a single attachment.'
					: `You can attach at most ${maxMediaItems} items for the selected network(s).`
			);
		}
	}

	function canAcceptComposerMediaDrop(): boolean {
		return !locked && !defineSetScopeOverlay && !comments && !busy && !mediaAtCap;
	}

	function onComposerDragOver(e: DragEvent) {
		if (!canAcceptComposerMediaDrop()) return;
		e.preventDefault();
		e.stopPropagation();
		composerDragOver = true;
	}

	function onComposerDragLeave(e: DragEvent) {
		const related = e.relatedTarget;
		if (related instanceof Node && e.currentTarget instanceof Node && e.currentTarget.contains(related)) {
			return;
		}
		composerDragOver = false;
	}

	function onComposerDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		composerDragOver = false;
		if (!canAcceptComposerMediaDrop()) return;
		const files = filesFromDataTransfer(e.dataTransfer);
		if (!files.length) return;
		void composerMedia?.ingestFiles(files);
	}
	const textareaRows = $derived(
		compact ? (comments ? 2 : 4) : comments ? 5 : 8
	);
	const textareaMinHeightClass = $derived(
		compact ? 'min-h-[4.5rem] sm:min-h-[4.5rem]' : 'min-h-[140px] sm:min-h-[180px]'
	);
	const mediaToolbarVisible = $derived(!locked && !defineSetScopeOverlay && !comments);
	const mentionToolbarDisabled = $derived(composerMode === 'global');
	const mentionToolbarTooltip = $derived(
		composerMode === 'global'
			? 'Focus and unlock a channel first'
			: 'Insert a mention'
	);
	const mentionToolbarUsesAutocomplete = $derived(
		composerMode === 'custom' &&
			!guestMode &&
			Boolean(organizationId?.trim()) &&
			Boolean(focusedIntegrationId?.trim()) &&
			providerSupportsComposerMentions(focusedProviderIdentifier)
	);

	function currentTextareaSnapshot() {
		return snapshotFromTextarea(composerTextarea, body ?? '');
	}

	function applyComposerHistorySnapshot(snap: ReturnType<typeof snapshotFromTextarea>) {
		applyingComposerHistory = true;
		body = snap.text;
		queueMicrotask(() => {
			const el = composerTextarea;
			if (el) {
				el.value = snap.text;
				el.setSelectionRange(snap.selectionStart, snap.selectionEnd);
			}
			applyingComposerHistory = false;
		});
	}

	function syncComposerHistoryUi() {
		if (usesRichEditor) {
			historyCanUndo = richComposerEditorRef?.canUndo() ?? false;
			historyCanRedo = richComposerEditorRef?.canRedo() ?? false;
			return;
		}
		historyCanUndo = composerTextHistory?.canUndo() ?? false;
		historyCanRedo = composerTextHistory?.canRedo() ?? false;
	}

	function onRichHistoryChange(state: { canUndo: boolean; canRedo: boolean }) {
		historyCanUndo = state.canUndo;
		historyCanRedo = state.canRedo;
	}

	function recordBeforeComposerEdit() {
		if (!composerTextHistory || comments || applyingComposerHistory) return;
		suppressTypingHistory = true;
		composerTextHistory.recordBeforeMutation(currentTextareaSnapshot());
	}

	function recordAfterComposerEdit() {
		if (!composerTextHistory || comments || applyingComposerHistory) return;
		composerTextHistory.recordAfterMutation(currentTextareaSnapshot());
		suppressTypingHistory = false;
		syncComposerHistoryUi();
	}

	function onComposerInput() {
		mentionAutocompleteRef?.handleTextareaInput();
		if (
			!composerTextHistory ||
			comments ||
			applyingComposerHistory ||
			suppressTypingHistory
		) {
			return;
		}
		composerTextHistory.recordTyping(currentTextareaSnapshot());
		syncComposerHistoryUi();
	}

	function performComposerUndo() {
		if (usesRichEditor) {
			if (!richComposerEditorRef?.canUndo()) return;
			richComposerEditorRef.undo();
			syncComposerHistoryUi();
			return;
		}
		if (!composerTextHistory?.canUndo()) return;
		const snap = composerTextHistory.undo();
		if (snap) applyComposerHistorySnapshot(snap);
		syncComposerHistoryUi();
	}

	function performComposerRedo() {
		if (usesRichEditor) {
			if (!richComposerEditorRef?.canRedo()) return;
			richComposerEditorRef.redo();
			syncComposerHistoryUi();
			return;
		}
		if (!composerTextHistory?.canRedo()) return;
		const snap = composerTextHistory.redo();
		if (snap) applyComposerHistorySnapshot(snap);
		syncComposerHistoryUi();
	}

	function onComposerKeyDown(e: KeyboardEvent) {
		if (composerTextHistory && !comments && !mentionAutocompleteRef?.isPickerOpen()) {
			const mod = e.metaKey || e.ctrlKey;
			if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
				if (composerTextHistory.canUndo()) {
					e.preventDefault();
					performComposerUndo();
					return;
				}
			}
			if (mod && (e.key.toLowerCase() === 'z' && e.shiftKey)) {
				if (composerTextHistory.canRedo()) {
					e.preventDefault();
					performComposerRedo();
					return;
				}
			}
			if (mod && e.key.toLowerCase() === 'y') {
				if (composerTextHistory.canRedo()) {
					e.preventDefault();
					performComposerRedo();
					return;
				}
			}
		}
		mentionAutocompleteRef?.handleTextareaKeyDown(e);
	}

	function appendComposerBody(suffix: string) {
		if (usesRichEditor) {
			richComposerEditorRef?.appendContent(suffix);
			return;
		}
		const base = body ?? '';
		const next = `${base}${suffix}`;
		if (!composerTextHistory || comments || applyingComposerHistory) {
			body = next;
			return;
		}
		suppressTypingHistory = true;
		composerTextHistory.recordMutation(
			{ text: base, selectionStart: base.length, selectionEnd: base.length },
			{ text: next, selectionStart: next.length, selectionEnd: next.length }
		);
		body = next;
		suppressTypingHistory = false;
		syncComposerHistoryUi();
	}

	function replaceComposerBody(text: string) {
		if (usesRichEditor) {
			richComposerEditorRef?.replaceContent(text);
			return;
		}
		const previous = body ?? '';
		if (!composerTextHistory || comments || applyingComposerHistory) {
			body = text;
			return;
		}
		suppressTypingHistory = true;
		composerTextHistory.recordMutation(
			{
				text: previous,
				selectionStart: previous.length,
				selectionEnd: previous.length
			},
			{ text, selectionStart: text.length, selectionEnd: text.length }
		);
		body = text;
		suppressTypingHistory = false;
		syncComposerHistoryUi();
	}

	$effect(() => {
		if (usesRichEditor || !composerTextHistory || comments) return;
		const key = composerHistoryKey;
		if (lastComposerHistoryKey === key) return;
		lastComposerHistoryKey = key;
		composerTextHistory.flushDebounced();
		const snap = currentTextareaSnapshot();
		const head = composerTextHistory.peek();
		if (!head || head.text !== snap.text) {
			composerTextHistory.clear(snap);
		}
		syncComposerHistoryUi();
	});
</script>

<div class="min-h-0 min-w-0 flex-1">
	{#if bannerLeftLabel || bannerRightActionLabel}
		<div class="text-base-content/70 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
			<div class="flex items-center gap-2">
				{#if bannerLeftLabel}
					<span class="inline-flex items-center gap-2">
						<span class="bg-primary/70 inline-block h-2 w-2 rounded-full"></span>
						<span class="font-medium">
							{bannerLeftLabel}
						</span>
					</span>
				{/if}
			</div>
			{#if bannerRightActionLabel && onBannerRightAction}
				<button
					type="button"
					class="hover:text-base-content text-base-content/70 inline-flex items-center gap-2 rounded-md px-2 py-1 font-medium"
					onclick={() => requestBannerRightAction()}
				>
					<AbstractIcon name={icons.ArrowBack.name} class="size-4" width="16" height="16" />
					{bannerRightActionLabel}
				</button>
			{/if}
		</div>
	{/if}

	<label class="sr-only" for="composer-body">
		Post body</label>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="min-w-0 rounded-lg {composerDragOver ? 'ring-primary/60 ring-2 ring-inset' : ''}"
		ondragover={onComposerDragOver}
		ondragleave={onComposerDragLeave}
		ondrop={onComposerDrop}
	>
		<div class="relative min-w-0">
			<div
				class="border-base-300 bg-base-200 min-w-0 rounded-lg border has-[textarea:focus]:border-primary has-[textarea:focus]:ring-primary/30 has-[.ProseMirror-focused]:border-primary has-[.ProseMirror-focused]:ring-primary/30 has-[textarea:focus]:ring-2 has-[.ProseMirror-focused]:ring-2 has-[textarea:focus]:ring-inset has-[.ProseMirror-focused]:ring-inset"
			>
				<div class="relative min-w-0">
					{#if usesRichEditor}
						{#key richEditorInstanceKey}
							<SocialComposerEditor
								bind:this={richComposerEditorRef}
								mode={mountedEditorMode}
								bind:content={body}
								disabled={busy || locked || defineSetScopeOverlay}
								placeholder={comments ? 'Write a comment…' : 'Write something…'}
								{compact}
								{comments}
								mentionConfig={richMentionConfig}
								onHistoryChange={onRichHistoryChange}
							/>
						{/key}
					{:else}
						<textarea
							id="composer-body"
							bind:this={composerTextarea}
							bind:value={body}
							rows={textareaRows}
							placeholder={comments ? 'Write a comment…' : 'Write something…'}
							onpaste={onComposerPaste}
							oninput={onComposerInput}
							onkeydown={onComposerKeyDown}
							disabled={busy || locked || defineSetScopeOverlay}
							class="max-h-[320px] w-full resize-none border-0 bg-transparent px-3 pt-2 pb-2 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none sm:resize-y {textareaMinHeightClass}"
						></textarea>

						<ComposerMentionAutocomplete
							bind:this={mentionAutocompleteRef}
							textarea={composerTextarea}
							{composerMode}
							{focusedIntegrationId}
							{focusedProviderIdentifier}
							{organizationId}
							disabled={busy || locked || defineSetScopeOverlay}
							{guestMode}
							onBeforeTextEdit={recordBeforeComposerEdit}
							onAfterTextEdit={recordAfterComposerEdit}
						/>
					{/if}
				</div>

				{#if mediaToolbarVisible && writerPresenter && summarizerPresenter && humanizePresenter}
					<div class="min-w-0 max-w-full px-2 pb-2">
						<ComposerMediaToolbar
							bind:this={mediaToolbarRef}
							{stockPhotosVm}
							{designTemplatesVm}
							{fetchPolotnoTemplateListPage}
							{backgroundPanelVm}
							{exportCanvasToMedia}
							{writerPresenter}
							{summarizerPresenter}
							{humanizePresenter}
							bind:items={postMediaItems}
							disabled={busy}
							{uploadUid}
							{publishDateIso}
							{organizationId}
							{loadSignaturesVmForComposer}
							existingBody={body}
							{softCharLimit}
							textarea={composerTextarea}
							tiptapEditor={richTiptapEditor}
							{composerEditorMode}
							{composerMode}
							{focusedProviderIdentifier}
							{constraintProviderIdentifiers}
							{focusedIntegrationId}
							{maxMediaItems}
							{guestMode}
							{isLoggedIn}
							onBeforeTextEdit={recordBeforeComposerEdit}
							onAfterTextEdit={recordAfterComposerEdit}
							onInsertSignature={(sig) => {
								const base = body ?? '';
								const suffix = base.trim().length === 0 ? sig : `\n\n${sig}`;
								appendComposerBody(suffix);
							}}
							onInsertDraft={(draft) => {
								const base = body ?? '';
								const suffix = base.trim().length === 0 ? draft : `\n\n${draft}`;
								appendComposerBody(suffix);
							}}
							onReplaceBody={(text) => {
								replaceComposerBody(text);
							}}
							{mentionToolbarDisabled}
							{mentionToolbarTooltip}
							onMentionToolbarClick={() => {
								if (mentionToolbarUsesAutocomplete && usesRichEditor) {
									richComposerEditorRef?.insertAtCursor('@');
									return;
								}
								if (mentionToolbarUsesAutocomplete) {
									mentionAutocompleteRef?.insertAtSign();
									return;
								}
								mediaToolbarRef?.insertAtComposerCursor('@');
							}}
							canUndoHistory={historyCanUndo}
							canRedoHistory={historyCanRedo}
							onUndoHistory={usesRichEditor || composerTextHistory ? performComposerUndo : undefined}
							onRedoHistory={usesRichEditor || composerTextHistory ? performComposerRedo : undefined}
							hasTextInput={usesRichEditor || Boolean(composerTextarea)}
						/>
					</div>
				{/if}
			</div>

			{#if locked}
				<div class="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/45 p-6 text-center">
					<div class="bg-base-100/90 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
						<AbstractIcon name={icons.Lock.name} class="size-6" width="24" height="24" />
					</div>
					<p class="mb-4 max-w-[420px] text-sm font-medium text-white/90">
						{lockMessage}</p>
					<Button type="button" variant="primary" disabled={busy} onclick={() => onUnlock?.()}>
						Edit content
					</Button>
				</div>
			{:else if defineSetScopeOverlay}
				<div
					class="pointer-events-auto absolute inset-0 z-[5] flex flex-col items-center justify-center rounded-lg bg-black/50 p-6 text-center"
					aria-live="polite"
				>
					<div class="bg-base-100/90 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
						<AbstractIcon name={icons.Lock.name} class="size-6" width="24" height="24" />
					</div>
					<p class="max-w-[420px] text-sm font-medium text-white/95">
						You can't edit networks when creating a set
					</p>
				</div>
			{/if}
		</div>
	{#if !locked && !defineSetScopeOverlay && !comments}
		<div class="mt-2 border-t border-base-300/80 pt-2">
			<MultiMedia
				bind:this={composerMedia}
				bind:items={postMediaItems}
				disabled={busy}
				{uploadUid}
				{publishDateIso}
				{maxMediaItems}
				{guestMode}
			/>
		</div>
		{#if scheduleValidationMessage}
			<div class="text-error mt-2 text-xs font-medium" role="status">
				{scheduleValidationMessage}
			</div>
		{/if}
	{/if}
	</div>
	<div class="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-base-300/80 pt-2">
		<div
			class="rounded border px-2 py-0.5 text-xs font-medium {charCount > softCharLimit
				? 'border-error/60 bg-error/10 text-error'
				: 'border-base-300 text-base-content/70'}"
		>
			{charCount}/{softCharLimit}
		</div>
	</div>
</div>

<DeleteModal
	bind:open={confirmOpen}
	title="Are you sure?"
	description="This action is irreversible. Are you sure you want to go back to global mode?"
	confirmLabel="Yes, go back to global mode"
	cancelLabel="No, cancel!"
	onConfirm={confirm}
	onCancel={() => (confirmOpen = false)}
/>