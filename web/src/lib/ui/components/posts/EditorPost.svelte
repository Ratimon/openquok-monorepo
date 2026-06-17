<script lang="ts">
	import type {
		BackgroundPanelViewModel,
		DesignTemplateProgrammerModel,
		ExportCanvasToMediaFn,
		PolotnoTemplateListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';
	import type { PostMediaProgrammerModel } from '$lib/posts';
	import type { FetchSignaturesForComposerFn } from '$lib/signatures';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DeleteModal from '$lib/ui/modals/DeleteModal.svelte';
	import ComposerMediaToolbar from '$lib/ui/components/posts/ComposerMediaToolbar.svelte';
	import MultiMedia from '$lib/ui/components/media/MultiMedia.svelte';
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
		/** When set, blocks adding more main-post attachments once reached (`null` = no cap). */
		maxMediaItems?: number | null;
		/** When true, render in "comment" mode (no media; smaller UX). */
		comments?: boolean;
		/** Shorter textarea for landing previews and tight layouts. */
		compact?: boolean;
		scheduleValidationMessage?: string | null;
		/** Blocks per-network customization UX while defining a reusable workspace set (global authoring only). */
		setsAuthoringNetworkLock?: boolean;
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
		maxMediaItems = null,
		comments = false,
		compact = false,
		scheduleValidationMessage = null,
		setsAuthoringNetworkLock = false
	}: EditorPostProps = $props();

	let confirmOpen = $state(false);
	let composerTextarea = $state.raw<HTMLTextAreaElement | null>(null);
	let composerMedia = $state<MultiMedia | undefined>(undefined);
	let composerDragOver = $state(false);

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
</script>

<div class="min-h-0 flex-1">
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
		class="rounded-lg {composerDragOver ? 'ring-primary/60 ring-2 ring-inset' : ''}"
		ondragover={onComposerDragOver}
		ondragleave={onComposerDragLeave}
		ondrop={onComposerDrop}
	>
		<div class="relative">
			<textarea
				id="composer-body"
				bind:this={composerTextarea}
				bind:value={body}
				rows={textareaRows}
				placeholder={comments ? 'Write a comment…' : 'Write something…'}
				onpaste={onComposerPaste}
				disabled={busy || locked || defineSetScopeOverlay}
				class="border-base-300 bg-base-200 focus:border-primary focus:ring-primary/30 focus:ring-inset {textareaMinHeightClass} max-h-[320px] w-full resize-none sm:resize-y rounded-lg border px-3 pt-2 text-sm text-base-content placeholder:text-base-content/40 focus:ring-2 focus:outline-none {locked
					? 'pb-2'
					: comments
						? 'pb-2'
						: 'pb-12'}"
			></textarea>

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
			{:else if !comments}
				<div class="pointer-events-none absolute inset-x-2 bottom-2 z-10 flex justify-start">
					<ComposerMediaToolbar
						class="pointer-events-auto"
						{stockPhotosVm}
						{designTemplatesVm}
						{fetchPolotnoTemplateListPage}
						{backgroundPanelVm}
						{exportCanvasToMedia}
						bind:items={postMediaItems}
						disabled={busy}
						{uploadUid}
						{publishDateIso}
						{organizationId}
						{loadSignaturesVmForComposer}
						textarea={composerTextarea}
						{composerMode}
						{focusedProviderIdentifier}
						{maxMediaItems}
						onInsertSignature={(sig) => {
							const base = body ?? '';
							const suffix = base.trim().length === 0 ? sig : `\n\n${sig}`;
							body = `${base}${suffix}`;
						}}
					/>
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