<script lang="ts">
	import type { Editor as TiptapEditor } from '@tiptap/core';
	import type { ComponentProps } from 'svelte';
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
	import type { IntegrationEditorMode } from '$lib/integrations/integrationEditorMode';
	import type { GuestComposerLockAction } from '$lib/posts/constants/guestComposerLock';
	import type { PostMediaProgrammerModel } from '$lib/posts';
	import type { FetchSignaturesForComposerFn } from '$lib/signatures';

	import { COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS } from '$lib/ai-writer/constants/config';
	import { formatBytes } from '$lib/medias';
	import {
		attachComposerMediaFromFiles,
		attachComposerMediaFromLocalFiles
	} from '$lib/posts/utils/composer';
	import {
		getComposerToolbarVisibility,
		usesRichComposerEditor,
		validateComposerLinkHref
	} from '$lib/ui/components/posts/composer-editor';
	import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import GlyphBoldText from '$lib/ui/components/posts/GlyphBoldText.svelte';
	import GlyphDesignEditor from '$lib/ui/components/posts/GlyphDesignEditor.svelte';
	import GlyphEmojiPicker from '$lib/ui/components/posts/GlyphEmojiPicker.svelte';
	import GlyphItalicText from '$lib/ui/components/posts/GlyphItalicText.svelte';
	import GlyphUText from '$lib/ui/components/posts/GlyphUText.svelte';
	import MediaLibraryModal from '$lib/ui/components/media/MediaLibraryModal.svelte';
	import DeviceMediaAttachModal from '$lib/ui/components/media/DeviceMediaAttachModal.svelte';
	import MediaGenerationModal from '$lib/ui/components/media/MediaGenerationModal.svelte';
	import MediaLibraryUploadOverlay from '$lib/ui/components/media/MediaLibraryUploadOverlay.svelte';
	import ComposerMediaTooltip, {
		composeTooltipTriggerClick
	} from '$lib/ui/components/posts/ComposerMediaTooltip.svelte';
	import ComposerGuestLockBadge from '$lib/ui/components/posts/ComposerGuestLockBadge.svelte';
	import ComposerHistoryButtons from '$lib/ui/components/posts/ComposerHistoryButtons.svelte';
	import AiHumanizeModal from '$lib/ui/components/posts/AiHumanizeModal.svelte';
	import AiSummarizeModal from '$lib/ui/components/posts/AiSummarizeModal.svelte';
	import AiWriterModal from '$lib/ui/components/posts/AiWriterModal.svelte';
	import SignatureModal from '$lib/ui/components/signature/SignatureModal.svelte';
	import LinkedInCompanyModal from '$lib/ui/components/posts/providers/linkedin/LinkedInCompanyModal.svelte';
	import SignInToComposerActionModal from '$lib/ui/components/posts/SignInToComposerActionModal.svelte';
	import * as Tooltip from '$lib/ui/tooltip';

	interface ComposerMediaToolbarProps {
		stockPhotosVm: readonly StockPhotoViewModel[];
		designTemplatesVm: readonly DesignTemplateProgrammerModel[];
		fetchPolotnoTemplateListPage: (
			params: { query: string; page: number },
			signal?: AbortSignal
		) => Promise<PolotnoTemplateListPageProgrammerModel>;
		backgroundPanelVm: BackgroundPanelViewModel;
		exportCanvasToMedia: ExportCanvasToMediaFn;
		/** Injected from CreateSocialPostPresenter; required for AI Writer. */
		writerPresenter: WriterPresenter;
		/** Injected from CreateSocialPostPresenter; required for AI Summarizer. */
		summarizerPresenter: SummarizerPresenter;
		/** Injected from CreateSocialPostPresenter; required for Sound more human. */
		humanizePresenter: HumanizePresenter;
		items?: PostMediaProgrammerModel[];
		disabled?: boolean;
		uploadUid: string;
		publishDateIso?: string | null;
		/** Workspace whose shared signatures are listed. */
		organizationId?: string | null;
		/** Wired from create-post presenter; keeps the repository out of this component. */
		loadSignaturesVmForComposer?: FetchSignaturesForComposerFn;
		onInsertSignature?: (text: string) => void;
		/** Current composer body — passed to AI Writer / Summarizer / Humanize. */
		existingBody?: string;
		onInsertDraft?: (text: string) => void;
		/** Replace the active composer body with a summary or rewrite (applies, does not append). */
		onReplaceBody?: (text: string) => void;
		/** Soft character limit for AI Writer / Summarizer / Humanize sharedContext (matches editor counter). */
		softCharLimit?: number;
		textarea?: HTMLTextAreaElement | null;
		tiptapEditor?: TiptapEditor | null;
		composerEditorMode?: IntegrationEditorMode;
		hasTextInput?: boolean;
		class?: string;
		composerMode?: 'global' | 'custom';
		focusedProviderIdentifier?: string | null;
		/** Unique provider identifiers for AI Writer / Summarizer / Humanize constraint strip / sharedContext. */
		constraintProviderIdentifiers?: readonly string[];
		focusedIntegrationId?: string | null;
		/** When set, blocks adding more main-post attachments once reached (`null` = no cap). */
		maxMediaItems?: number | null;
		/**
		 * Public tool composer: local blob attach stays on-device; library / design / signatures
		 * open the Sign in + Sign up gate instead of workspace APIs.
		 */
		guestMode?: boolean;
		isLoggedIn?: boolean;
		mentionToolbarDisabled?: boolean;
		mentionToolbarTooltip?: string;
		onMentionToolbarClick?: () => void;
		onBeforeTextEdit?: () => void;
		onAfterTextEdit?: () => void;
		canUndoHistory?: boolean;
		canRedoHistory?: boolean;
		onUndoHistory?: () => void;
		onRedoHistory?: () => void;
	}

	let {
		stockPhotosVm,
		designTemplatesVm,
		fetchPolotnoTemplateListPage,
		backgroundPanelVm,
		exportCanvasToMedia,
		writerPresenter,
		summarizerPresenter,
		humanizePresenter,
		items = $bindable([]),
		disabled = false,
		uploadUid,
		publishDateIso = null,
		organizationId = null,
		loadSignaturesVmForComposer = undefined,
		onInsertSignature = undefined,
		existingBody = '',
		onInsertDraft = undefined,
		onReplaceBody = undefined,
		softCharLimit = COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS,
		textarea = null,
		tiptapEditor = null,
		composerEditorMode = 'normal',
		hasTextInput = true,
		class: className = '',
		composerMode = 'global',
		focusedProviderIdentifier = null,
		constraintProviderIdentifiers = [],
		focusedIntegrationId = null,
		maxMediaItems = null,
		guestMode = false,
		isLoggedIn = false,
		mentionToolbarDisabled = false,
		mentionToolbarTooltip = 'Insert a mention',
		onMentionToolbarClick = undefined,
		onBeforeTextEdit = undefined,
		onAfterTextEdit = undefined,
		canUndoHistory = false,
		canRedoHistory = false,
		onUndoHistory = undefined,
		onRedoHistory = undefined
	}: ComposerMediaToolbarProps = $props();

	type MediaGenerationProps = ComponentProps<typeof MediaGenerationModal>;
	type UploadPhase = 'idle' | 'encoding' | 'uploading';

	let uploadBusy = $state(false);
	let uploadPhase = $state<UploadPhase>('idle');
	let barPercent = $state(0);
	let uploadDetailLine = $state('');
	let designOpen = $state(false);
	let deviceAttachOpen = $state(false);
	let libraryOpen = $state(false);
	const mediaAtCap = $derived(maxMediaItems != null && items.length >= maxMediaItems);
	let signatureOpen = $state(false);
	let aiWriterOpen = $state(false);
	let aiSummarizeOpen = $state(false);
	let humanizeOpen = $state(false);
	/** Snapshot of composer draft (or selection) at the moment Summarize / Humanize opens. */
	let summarizeSourceBody = $state('');
	let humanizeSourceBody = $state('');
	let linkedInCompanyOpen = $state(false);
	let guestLockOpen = $state(false);
	let guestLockAction = $state<GuestComposerLockAction>('media-library');
	const isLinkedInFocus = $derived(
		focusedProviderIdentifier === 'linkedin' || focusedProviderIdentifier === 'linkedin-page'
	);
	const toolbarVisibility = $derived(getComposerToolbarVisibility(composerEditorMode));
	const isRichEditor = $derived(usesRichComposerEditor(composerEditorMode));
	const textInputReady = $derived(hasTextInput && (Boolean(textarea) || Boolean(tiptapEditor)));
	const showLinkedInCompany = $derived(
		toolbarVisibility.linkedInCompany &&
			isLinkedInFocus &&
			(guestMode || (Boolean(focusedIntegrationId?.trim()) && Boolean(organizationId?.trim())))
	);
	const libraryTooltipLabel = $derived(
		guestMode
			? 'Sign in to attach from your media library'
			: 'Attach images or videos from your media library'
	);
	const designTooltipLabel = $derived(
		guestMode ? 'Sign in to open the design editor' : 'Open the design editor to create or edit visuals'
	);
	const signatureTooltipLabel = $derived(
		guestMode ? 'Sign in to insert a workspace signature' : 'Insert a saved workspace signature'
	);
	const linkedInCompanyTooltipLabel = $derived(
		guestMode ? 'Sign in to mention a LinkedIn company' : 'Add a LinkedIn company mention'
	);
	const deviceAttachDescription = $derived(
		guestMode
			? 'Drag and drop images or videos here, or click the area to browse. Previews stay on this device.'
			: 'Drag and drop images or videos here, or click the area to browse. Files upload as soon as they are added.'
	);
	const bodyPlainLength = $derived(stripHtmlToPlainText(existingBody).length);
	const hasComposerBody = $derived(bodyPlainLength > 0);
	const summarizeOverLimit = $derived(bodyPlainLength > softCharLimit);
	const summarizeTooltipLabel = $derived(
		summarizeOverLimit ? 'Summarize to fit limit' : 'Summarize with AI'
	);
	const iconBtn =
		'border-base-300/90 bg-base-200/45 text-base-content/85 hover:bg-base-300/55 hover:text-base-content focus-visible:ring-primary/40 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35';
	const summarizeIconBtn = $derived(
		summarizeOverLimit
			? `${iconBtn} border-warning/70 bg-warning/15 text-warning hover:bg-warning/25`
			: iconBtn
	);

	async function uploadFiles(files: FileList | null): Promise<boolean> {
		if (mediaAtCap) return false;
		if (!files?.length || disabled || uploadBusy) return false;
		if (guestMode) {
			const batch = attachComposerMediaFromLocalFiles({ files });
			if (!batch.ok) {
				toast.error(batch.message);
				return false;
			}
			items = [...items, ...batch.items];
			if (batch.items.length) {
				toast.success(
					batch.items.length === 1 ? 'Media attached.' : `${batch.items.length} items attached.`
				);
			}
			return true;
		}
		uploadBusy = true;
		uploadPhase = 'uploading';
		barPercent = 0;
		uploadDetailLine = '';
		try {
			const batch = await attachComposerMediaFromFiles({
				files,
				uploadUid,
				publishDateIso,
				onProgress: ({ bytesUploaded, bytesTotal }) => {
					uploadPhase = 'uploading';
					barPercent =
						bytesTotal > 0
							? Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100))
							: 0;
					uploadDetailLine = `${formatBytes(bytesUploaded)} of ${formatBytes(bytesTotal)}`;
				}
			});
			if (!batch.ok) {
				toast.error(batch.message);
				return false;
			}
			items = [...items, ...batch.items];
			if (batch.items.length) {
				toast.success(
					batch.items.length === 1 ? 'Media attached.' : `${batch.items.length} items attached.`
				);
			}
			return true;
		} finally {
			uploadBusy = false;
			uploadPhase = 'idle';
			barPercent = 0;
			uploadDetailLine = '';
		}
	}

	async function ingestFilesFromAttachDialog(files: FileList | null) {
		const ok = await uploadFiles(files);
		if (ok) {
			deviceAttachOpen = false;
		}
	}

	function onAddFromDesign(added: PostMediaProgrammerModel[]) {
		if (added.length) {
			items = [...items, ...added];
		}
	}

	function onAttachFromLibrary(added: PostMediaProgrammerModel[]) {
		if (!added.length || mediaAtCap) return;
		items = [...items, ...added];
	}

	const attachedMediaPaths = $derived(items.map((m) => m.path));

	function openGuestLock(action: GuestComposerLockAction) {
		guestLockAction = action;
		guestLockOpen = true;
	}

	function insertSignatureFromModal(text: string) {
		const trimmed = (text ?? '').trim();
		if (!trimmed) return;
		onInsertSignature?.(trimmed);
	}

	function insertDraftFromModal(text: string) {
		const trimmed = (text ?? '').trim();
		if (!trimmed) return;
		onInsertDraft?.(trimmed);
	}

	function replaceBodyFromModal(text: string) {
		const trimmed = (text ?? '').trim();
		if (!trimmed) return;
		onReplaceBody?.(trimmed);
	}

	/** Prefer the composer selection when present; otherwise the full draft body. */
	function resolveToolbarSourceBody(): string {
		if (tiptapEditor) {
			const { from, to } = tiptapEditor.state.selection;
			if (from !== to) {
				return tiptapEditor.state.doc.textBetween(from, to, '\n');
			}
			return stripHtmlToPlainText(tiptapEditor.getHTML());
		}
		const el = textarea;
		if (
			el &&
			typeof el.selectionStart === 'number' &&
			typeof el.selectionEnd === 'number' &&
			el.selectionStart !== el.selectionEnd
		) {
			return el.value.slice(el.selectionStart, el.selectionEnd);
		}
		return existingBody;
	}

	function openAiSummarize() {
		summarizeSourceBody = resolveToolbarSourceBody();
		aiSummarizeOpen = true;
	}

	function openAiHumanize() {
		humanizeSourceBody = resolveToolbarSourceBody();
		humanizeOpen = true;
	}

	/** Public Humanizer header calls this so Sound more human is not toolbar-only. */
	export function openHumanize() {
		openAiHumanize();
	}

	function insertLinkedInCompanyMention(text: string) {
		const trimmed = (text ?? '').trim();
		if (!trimmed) return;
		onInsertSignature?.(trimmed);
	}

	/** Insert a token (e.g. `#` / `@`) at the composer caret, replacing any selection. */
	export function insertAtComposerCursor(text: string) {
		if (disabled || uploadBusy) return;
		if (tiptapEditor) {
			tiptapEditor.chain().focus().insertContent(text).run();
			return;
		}
		const el = textarea;
		if (!el) return;
		onBeforeTextEdit?.();
		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		const value = el.value ?? '';
		el.value = value.slice(0, start) + text + value.slice(end);
		el.dispatchEvent(new Event('input', { bubbles: true }));
		el.focus();
		const next = start + text.length;
		el.setSelectionRange(next, next);
		onAfterTextEdit?.();
	}

	function toggleRichMark(mark: 'bold' | 'italic' | 'underline') {
		if (!tiptapEditor) return;
		const chain = tiptapEditor.chain().focus();
		if (mark === 'bold') chain.toggleBold().run();
		else if (mark === 'italic') chain.toggleItalic().run();
		else chain.toggleUnderline().run();
	}

	function toggleRichHeading(level: 1 | 2 | 3) {
		tiptapEditor?.chain().focus().toggleHeading({ level }).run();
	}

	function toggleRichBulletList() {
		tiptapEditor?.chain().focus().toggleBulletList().run();
	}

	function toggleRichOrderedList() {
		tiptapEditor?.chain().focus().toggleOrderedList().run();
	}

	function insertRichLink() {
		if (!tiptapEditor) return;
		const { href } = tiptapEditor.getAttributes('link');
		const url = window.prompt(href ? 'Edit link URL:' : 'Enter link URL:', href || 'https://');
		if (url === null) return;
		if (url === '') {
			tiptapEditor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		const nextHref = validateComposerLinkHref(url);
		if (!nextHref) {
			toast.error('That link is not allowed. Use http(s) URLs or relative paths.');
			return;
		}
		if (href) {
			tiptapEditor.chain().focus().extendMarkRange('link').setLink({ href: nextHref }).run();
			return;
		}
		tiptapEditor.chain().focus().setLink({ href: nextHref }).run();
	}

	const mediaGenerationFields = $derived.by(
		(): Omit<MediaGenerationProps, 'open'> => ({
			stockPhotosVm,
			designTemplatesVm,
			fetchPolotnoTemplateListPage,
			backgroundPanelVm,
			exportCanvasToMedia,
			disabled: disabled || uploadBusy || mediaAtCap,
			uploadUid,
			composerMode,
			focusedProviderIdentifier,
			onAdd: onAddFromDesign
		})
	);
</script>

<MediaLibraryUploadOverlay
	uploadBusy={uploadPhase !== 'idle'}
	{uploadPhase}
	{barPercent}
	{uploadDetailLine}
/>

<div
	class="border-base-300/80 bg-base-100/90 inline-flex max-w-full min-w-0 flex-wrap items-center gap-1 rounded-xl border p-1 shadow-md backdrop-blur-md {className}"
	role="toolbar"
	aria-label="Post media"
>
	<Tooltip.Provider delayDuration={200}>
		<!-- 1: add media from disk -->
		<ComposerMediaTooltip
			label={guestMode
				? 'Attach images or videos from your device. Previews stay on this device.'
				: 'Attach images or videos from your device'}
		>
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class={iconBtn}
					disabled={disabled || uploadBusy || mediaAtCap}
					onclick={composeTooltipTriggerClick(props, () => {
						deviceAttachOpen = true;
					})}
					aria-label="Add images or videos from your device"
				>
					{#if uploadBusy}
						<span class="loading loading-spinner loading-sm text-primary"></span>
					{:else}
						<span class="relative inline-flex size-6 items-center justify-center">
							<AbstractIcon name={icons.Images.name} class="size-6" width="24" height="24" />
							<span
								class="bg-primary text-primary-content ring-base-100 absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full ring-2"
								aria-hidden="true"
							>
								<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
							</span>
						</span>
					{/if}
				</button>
			{/snippet}
		</ComposerMediaTooltip>
		<!-- 2: workspace media library -->
		<ComposerMediaTooltip label={libraryTooltipLabel}>
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class="{iconBtn} relative"
					disabled={disabled || uploadBusy || mediaAtCap || (!guestMode && !organizationId?.trim())}
					onclick={composeTooltipTriggerClick(props, () => {
						if (guestMode) {
							openGuestLock('media-library');
							return;
						}
						libraryOpen = true;
					})}
					aria-label={libraryTooltipLabel}
				>
					<AbstractIcon name={icons.Images.name} class="size-6" width="24" height="24" />
					{#if guestMode}
						<ComposerGuestLockBadge />
					{/if}
				</button>
			{/snippet}
		</ComposerMediaTooltip>
		<!-- 3: design / canvas modal -->
		<ComposerMediaTooltip label={designTooltipLabel}>
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class="{iconBtn} relative"
					disabled={disabled || uploadBusy || mediaAtCap}
					onclick={composeTooltipTriggerClick(props, () => {
						if (guestMode) {
							openGuestLock('design-editor');
							return;
						}
						designOpen = true;
					})}
					aria-label={designTooltipLabel}
				>
					<GlyphDesignEditor badgeSurfaceClass="rounded-sm bg-base-200/45 shadow-none ring-0" />
					{#if guestMode}
						<ComposerGuestLockBadge />
					{/if}
				</button>
			{/snippet}
		</ComposerMediaTooltip>

		<!-- 4: signatures modal -->
		<ComposerMediaTooltip label={signatureTooltipLabel}>
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class="{iconBtn} relative"
					disabled={disabled ||
						uploadBusy ||
						(!guestMode && (!organizationId?.trim() || !loadSignaturesVmForComposer))}
					onclick={composeTooltipTriggerClick(props, () => {
						if (guestMode) {
							openGuestLock('signature');
							return;
						}
						signatureOpen = true;
					})}
					aria-label={signatureTooltipLabel}
				>
					<span class="relative inline-flex size-6 items-center justify-center">
						<AbstractIcon name={icons.Signature.name} class="size-5" width="20" height="20" />
						{#if !guestMode}
							<span
								class="bg-primary text-primary-content ring-base-100 absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full ring-2"
								aria-hidden="true"
							>
								<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
							</span>
						{/if}
					</span>
					{#if guestMode}
						<ComposerGuestLockBadge />
					{/if}
				</button>
			{/snippet}
		</ComposerMediaTooltip>

		<!-- 5: AI Writer (Chrome on-device Writer API) -->
		<ComposerMediaTooltip label="Draft with AI Writer">
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class={iconBtn}
					disabled={disabled || uploadBusy}
					onclick={composeTooltipTriggerClick(props, () => {
						aiWriterOpen = true;
					})}
					aria-label="Open AI Writer"
				>
					<AbstractIcon name={icons.PencilSparkles.name} class="size-5" width="20" height="20" />
				</button>
			{/snippet}
		</ComposerMediaTooltip>

		<!-- 6: AI Summarizer (Chrome on-device Summarizer API) -->
		<ComposerMediaTooltip label={summarizeTooltipLabel}>
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class={summarizeIconBtn}
					disabled={disabled || uploadBusy || !hasComposerBody}
					onclick={composeTooltipTriggerClick(props, openAiSummarize)}
					aria-label={summarizeTooltipLabel}
				>
					<AbstractIcon name={icons.NotebookPen.name} class="size-5" width="20" height="20" />
				</button>
			{/snippet}
		</ComposerMediaTooltip>

		<!-- 7: Sound more human (Chrome on-device Rewriter + local tell audit) -->
		<ComposerMediaTooltip label="Sound more human">
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class={iconBtn}
					disabled={disabled || uploadBusy || !hasComposerBody}
					onclick={composeTooltipTriggerClick(props, openAiHumanize)}
					aria-label="Sound more human"
				>
					<AbstractIcon name={icons.UserRoundPen.name} class="size-5" width="20" height="20" />
				</button>
			{/snippet}
		</ComposerMediaTooltip>

		{#if onUndoHistory && onRedoHistory && toolbarVisibility.undoRedo}
			<ComposerHistoryButtons
				canUndo={canUndoHistory}
				canRedo={canRedoHistory}
				{disabled}
				{uploadBusy}
				hasTextInput={textInputReady}
				buttonClass={iconBtn}
				onUndo={onUndoHistory}
				onRedo={onRedoHistory}
			/>
		{/if}

		{#if toolbarVisibility.boldUnderline}
			{#if isRichEditor}
				<ComposerMediaTooltip label="Bold the selected text">
					{#snippet trigger({ props })}
						<button
							{...props}
							type="button"
							class={iconBtn}
							disabled={disabled || uploadBusy || !tiptapEditor}
							onclick={composeTooltipTriggerClick(props, () => toggleRichMark('bold'))}
							aria-label="Bold the selected text"
						>
							<AbstractIcon name={icons.Bold.name} class="size-5" width="20" height="20" />
						</button>
					{/snippet}
				</ComposerMediaTooltip>
				<ComposerMediaTooltip label="Italicize the selected text">
					{#snippet trigger({ props })}
						<button
							{...props}
							type="button"
							class={iconBtn}
							disabled={disabled || uploadBusy || !tiptapEditor}
							onclick={composeTooltipTriggerClick(props, () => toggleRichMark('italic'))}
							aria-label="Italicize the selected text"
						>
							<AbstractIcon name={icons.Italic.name} class="size-5" width="20" height="20" />
						</button>
					{/snippet}
				</ComposerMediaTooltip>
				<ComposerMediaTooltip label="Underline the selected text">
					{#snippet trigger({ props })}
						<button
							{...props}
							type="button"
							class={iconBtn}
							disabled={disabled || uploadBusy || !tiptapEditor}
							onclick={composeTooltipTriggerClick(props, () => toggleRichMark('underline'))}
							aria-label="Underline the selected text"
						>
							<AbstractIcon name={icons.Underline.name} class="size-5" width="20" height="20" />
						</button>
					{/snippet}
				</ComposerMediaTooltip>
			{:else}
				<ComposerMediaTooltip label="Underline the selected text">
					{#snippet trigger({ props })}
						<span {...props} class="inline-flex">
							<GlyphUText class={iconBtn} {textarea} disabled={disabled || uploadBusy} {onBeforeTextEdit} {onAfterTextEdit} />
						</span>
					{/snippet}
				</ComposerMediaTooltip>
				<ComposerMediaTooltip label="Italicize the selected text">
					{#snippet trigger({ props })}
						<span {...props} class="inline-flex">
							<GlyphItalicText class={iconBtn} {textarea} disabled={disabled || uploadBusy} {onBeforeTextEdit} {onAfterTextEdit} />
						</span>
					{/snippet}
				</ComposerMediaTooltip>
				<ComposerMediaTooltip label="Bold the selected text">
					{#snippet trigger({ props })}
						<span {...props} class="inline-flex">
							<GlyphBoldText class={iconBtn} {textarea} disabled={disabled || uploadBusy} {onBeforeTextEdit} {onAfterTextEdit} />
						</span>
					{/snippet}
				</ComposerMediaTooltip>
			{/if}
		{/if}

		{#if toolbarVisibility.linkHeadingsLists && isRichEditor}
			<ComposerMediaTooltip label="Insert or edit a link">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						disabled={disabled || uploadBusy || !tiptapEditor}
						onclick={composeTooltipTriggerClick(props, insertRichLink)}
						aria-label="Insert or edit a link"
					>
						<AbstractIcon name={icons.Link.name} class="size-5" width="20" height="20" />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
			<ComposerMediaTooltip label="Heading 1">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						disabled={disabled || uploadBusy || !tiptapEditor}
						onclick={composeTooltipTriggerClick(props, () => toggleRichHeading(1))}
						aria-label="Heading 1"
					>
						<AbstractIcon name={icons.Heading1.name} class="size-5" width="20" height="20" />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
			<ComposerMediaTooltip label="Heading 2">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						disabled={disabled || uploadBusy || !tiptapEditor}
						onclick={composeTooltipTriggerClick(props, () => toggleRichHeading(2))}
						aria-label="Heading 2"
					>
						<AbstractIcon name={icons.Heading2.name} class="size-5" width="20" height="20" />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
			<ComposerMediaTooltip label="Heading 3">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						disabled={disabled || uploadBusy || !tiptapEditor}
						onclick={composeTooltipTriggerClick(props, () => toggleRichHeading(3))}
						aria-label="Heading 3"
					>
						<AbstractIcon name={icons.Heading3.name} class="size-5" width="20" height="20" />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
			<ComposerMediaTooltip label="Bulleted list">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						disabled={disabled || uploadBusy || !tiptapEditor}
						onclick={composeTooltipTriggerClick(props, toggleRichBulletList)}
						aria-label="Bulleted list"
					>
						<AbstractIcon name={icons.List.name} class="size-5" width="20" height="20" />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
			<ComposerMediaTooltip label="Numbered list">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						disabled={disabled || uploadBusy || !tiptapEditor}
						onclick={composeTooltipTriggerClick(props, toggleRichOrderedList)}
						aria-label="Numbered list"
					>
						<AbstractIcon name={icons.ListOrdered.name} class="size-5" width="20" height="20" />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
		{/if}

		{#if toolbarVisibility.emoji}
			<ComposerMediaTooltip label="Insert an emoji at the cursor">
				{#snippet trigger({ props })}
					<span {...props} class="inline-flex">
						<GlyphEmojiPicker
							class={iconBtn}
							{textarea}
							disabled={disabled || uploadBusy || !textInputReady}
							{onBeforeTextEdit}
							{onAfterTextEdit}
							onInsertText={isRichEditor ? (text) => insertAtComposerCursor(text) : undefined}
						/>
					</span>
				{/snippet}
			</ComposerMediaTooltip>
		{/if}
		{#if toolbarVisibility.hashtag}
			<ComposerMediaTooltip label="Insert a hashtag at the cursor">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						disabled={disabled || uploadBusy || !textInputReady}
						onclick={composeTooltipTriggerClick(props, () => insertAtComposerCursor('#'))}
						aria-label="Insert hashtag"
					>
						<AbstractIcon name={icons.Hash.name} class="size-5" width="20" height="20" />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
		{/if}
		{#if toolbarVisibility.mention}
			<ComposerMediaTooltip label={mentionToolbarTooltip}>
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						disabled={disabled || uploadBusy || !textInputReady || mentionToolbarDisabled}
						onclick={composeTooltipTriggerClick(props, () => {
							if (onMentionToolbarClick) {
								onMentionToolbarClick();
								return;
							}
							insertAtComposerCursor('@');
						})}
						aria-label={mentionToolbarTooltip}
					>
						<AbstractIcon name={icons.AtSign.name} class="size-5" width="20" height="20" />
					</button>
				{/snippet}
			</ComposerMediaTooltip>
		{/if}
		{#if showLinkedInCompany}
			<ComposerMediaTooltip label={linkedInCompanyTooltipLabel}>
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class="{iconBtn} relative"
						disabled={disabled || uploadBusy}
						onclick={composeTooltipTriggerClick(props, () => {
							if (guestMode) {
								openGuestLock('linkedin-company');
								return;
							}
							linkedInCompanyOpen = true;
						})}
						aria-label={linkedInCompanyTooltipLabel}
					>
						<AbstractIcon name={icons.LinkedIn.name} class="size-5" width="20" height="20" />
						{#if guestMode}
							<ComposerGuestLockBadge />
						{/if}
					</button>
				{/snippet}
			</ComposerMediaTooltip>
		{/if}
	</Tooltip.Provider>

	<DeviceMediaAttachModal
		bind:open={deviceAttachOpen}
		disabled={disabled || uploadBusy || mediaAtCap}
		{uploadBusy}
		{uploadPhase}
		{barPercent}
		{uploadDetailLine}
		accept="image/*,video/*"
		title="Add media"
		description={deviceAttachDescription}
		dropTitle="Drop images or videos here"
		onFilesSelected={ingestFilesFromAttachDialog}
	/>

	{#if !guestMode}
		<MediaLibraryModal
			bind:open={libraryOpen}
			{organizationId}
			disabled={disabled || uploadBusy}
			mediaLocked={mediaAtCap}
			attachedPaths={attachedMediaPaths}
			onAttach={onAttachFromLibrary}
		/>
	{/if}

</div>

{#if !guestMode}
	<MediaGenerationModal
		{...mediaGenerationFields}
		bind:open={designOpen}
	/>

	<SignatureModal
		bind:open={signatureOpen}
		organizationId={organizationId}
		{loadSignaturesVmForComposer}
		onInsertSignature={insertSignatureFromModal}
	/>
{/if}

<AiWriterModal
	{writerPresenter}
	bind:open={aiWriterOpen}
	{existingBody}
	{softCharLimit}
	{composerMode}
	{focusedProviderIdentifier}
	constraintProviderIdentifiers={constraintProviderIdentifiers}
	onInsertDraft={insertDraftFromModal}
/>

<AiSummarizeModal
	{summarizerPresenter}
	bind:open={aiSummarizeOpen}
	existingBody={summarizeSourceBody}
	{softCharLimit}
	{composerMode}
	{focusedProviderIdentifier}
	constraintProviderIdentifiers={constraintProviderIdentifiers}
	onReplaceBody={replaceBodyFromModal}
/>

<AiHumanizeModal
	{humanizePresenter}
	bind:open={humanizeOpen}
	existingBody={humanizeSourceBody}
	{softCharLimit}
	{composerMode}
	{focusedProviderIdentifier}
	constraintProviderIdentifiers={constraintProviderIdentifiers}
	onReplaceBody={replaceBodyFromModal}
/>

{#if showLinkedInCompany && !guestMode && focusedIntegrationId && organizationId}
	<LinkedInCompanyModal
		bind:open={linkedInCompanyOpen}
		organizationId={organizationId}
		integrationId={focusedIntegrationId}
		onClose={() => (linkedInCompanyOpen = false)}
		onInsert={insertLinkedInCompanyMention}
	/>
{/if}

{#if guestMode}
	<SignInToComposerActionModal bind:open={guestLockOpen} action={guestLockAction} {isLoggedIn} />
{/if}
