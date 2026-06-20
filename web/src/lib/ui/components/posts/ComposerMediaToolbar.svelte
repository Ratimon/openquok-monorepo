<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type {
		BackgroundPanelViewModel,
		DesignTemplateProgrammerModel,
		ExportCanvasToMediaFn,
		PolotnoTemplateListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';
	import type { PostMediaProgrammerModel } from '$lib/posts';
	import type { FetchSignaturesForComposerFn } from '$lib/signatures';

	import { formatBytes } from '$lib/medias';
	import { attachComposerMediaFromFiles } from '$lib/posts/utils/composerMediaDrop';
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
	import SignatureModal from '$lib/ui/components/signature/SignatureModal.svelte';
	import LinkedInCompanyModal from '$lib/ui/components/posts/providers/linkedin/LinkedInCompanyModal.svelte';
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
		items?: PostMediaProgrammerModel[];
		disabled?: boolean;
		uploadUid: string;
		publishDateIso?: string | null;
		/** Workspace whose shared signatures are listed. */
		organizationId?: string | null;
		/** Wired from create-post presenter; keeps the repository out of this component. */
		loadSignaturesVmForComposer?: FetchSignaturesForComposerFn;
		onInsertSignature?: (text: string) => void;
		textarea?: HTMLTextAreaElement | null;
		class?: string;
		composerMode?: 'global' | 'custom';
		focusedProviderIdentifier?: string | null;
		focusedIntegrationId?: string | null;
		/** When set, blocks adding more main-post attachments once reached (`null` = no cap). */
		maxMediaItems?: number | null;
	}

	let {
		stockPhotosVm,
		designTemplatesVm,
		fetchPolotnoTemplateListPage,
		backgroundPanelVm,
		exportCanvasToMedia,
		items = $bindable([]),
		disabled = false,
		uploadUid,
		publishDateIso = null,
		organizationId = null,
		loadSignaturesVmForComposer = undefined,
		onInsertSignature = undefined,
		textarea = null,
		class: className = '',
		composerMode = 'global',
		focusedProviderIdentifier = null,
		focusedIntegrationId = null,
		maxMediaItems = null
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
	let linkedInCompanyOpen = $state(false);
	const showLinkedInCompany = $derived(
		(focusedProviderIdentifier === 'linkedin' || focusedProviderIdentifier === 'linkedin-page') &&
			Boolean(focusedIntegrationId?.trim()) &&
			Boolean(organizationId?.trim())
	);
	const iconBtn =
		'border-base-300/90 bg-base-200/45 text-base-content/85 hover:bg-base-300/55 hover:text-base-content focus-visible:ring-primary/40 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35';

	async function uploadFiles(files: FileList | null): Promise<boolean> {
		if (mediaAtCap) return false;
		if (!files?.length || disabled || uploadBusy) return false;
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

	function insertSignatureFromModal(text: string) {
		const trimmed = (text ?? '').trim();
		if (!trimmed) return;
		onInsertSignature?.(trimmed);
	}

	function insertLinkedInCompanyMention(text: string) {
		const trimmed = (text ?? '').trim();
		if (!trimmed) return;
		onInsertSignature?.(trimmed);
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
	class="border-base-300/80 bg-base-100/90 flex items-center gap-1 rounded-xl border p-1 shadow-md backdrop-blur-md {className}"
	role="toolbar"
	aria-label="Post media"
>
	<Tooltip.Provider delayDuration={200}>
		<!-- 1: add media from disk -->
		<ComposerMediaTooltip label="Attach images or videos from your device">
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
		<ComposerMediaTooltip label="Attach images or videos from your media library">
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class={iconBtn}
					disabled={disabled || uploadBusy || mediaAtCap || !organizationId?.trim()}
					onclick={composeTooltipTriggerClick(props, () => {
						libraryOpen = true;
					})}
					aria-label="Attach images or videos from media library"
				>
					<AbstractIcon name={icons.Images.name} class="size-6" width="24" height="24" />
				</button>
			{/snippet}
		</ComposerMediaTooltip>
		<!-- 3: design / canvas modal -->
		<ComposerMediaTooltip label="Open the design editor to create or edit visuals">
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class={iconBtn}
					disabled={disabled || uploadBusy || mediaAtCap}
					onclick={composeTooltipTriggerClick(props, () => {
						designOpen = true;
					})}
					aria-label="Open design editor"
				>
					<GlyphDesignEditor badgeSurfaceClass="rounded-sm bg-base-200/45 shadow-none ring-0" />
				</button>
			{/snippet}
		</ComposerMediaTooltip>

		<!-- 4: signatures modal -->
		<ComposerMediaTooltip label="Insert a saved workspace signature">
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class={iconBtn}
					disabled={disabled || uploadBusy || !organizationId?.trim() || !loadSignaturesVmForComposer}
					onclick={composeTooltipTriggerClick(props, () => {
						signatureOpen = true;
					})}
					aria-label="Insert signature"
				>
					<span class="relative inline-flex size-6 items-center justify-center">
						<AbstractIcon name={icons.Hash.name} class="size-5" width="20" height="20" />
						<span
							class="bg-primary text-primary-content ring-base-100 absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full ring-2"
							aria-hidden="true"
						>
							<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
						</span>
					</span>
				</button>
			{/snippet}
		</ComposerMediaTooltip>

		<!-- 5–8: inline text styling (selection-based) -->
		<ComposerMediaTooltip label="Underline the selected text">
			{#snippet trigger({ props })}
				<span {...props} class="inline-flex">
					<GlyphUText class={iconBtn} {textarea} disabled={disabled || uploadBusy} />
				</span>
			{/snippet}
		</ComposerMediaTooltip>
		<ComposerMediaTooltip label="Italicize the selected text">
			{#snippet trigger({ props })}
				<span {...props} class="inline-flex">
					<GlyphItalicText class={iconBtn} {textarea} disabled={disabled || uploadBusy} />
				</span>
			{/snippet}
		</ComposerMediaTooltip>
		<ComposerMediaTooltip label="Bold the selected text">
			{#snippet trigger({ props })}
				<span {...props} class="inline-flex">
					<GlyphBoldText class={iconBtn} {textarea} disabled={disabled || uploadBusy} />
				</span>
			{/snippet}
		</ComposerMediaTooltip>
		<ComposerMediaTooltip label="Insert an emoji at the cursor">
			{#snippet trigger({ props })}
				<span {...props} class="inline-flex">
					<GlyphEmojiPicker class={iconBtn} {textarea} disabled={disabled || uploadBusy} />
				</span>
			{/snippet}
		</ComposerMediaTooltip>
		{#if showLinkedInCompany}
			<ComposerMediaTooltip label="Add a LinkedIn company mention">
				{#snippet trigger({ props })}
					<button
						{...props}
						type="button"
						class={iconBtn}
						disabled={disabled || uploadBusy}
						onclick={composeTooltipTriggerClick(props, () => {
							linkedInCompanyOpen = true;
						})}
						aria-label="Add LinkedIn company mention"
					>
						<AbstractIcon name={icons.LinkedIn.name} class="size-5" width="20" height="20" />
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
		description="Drag and drop images or videos here, or click the area to browse. Files upload as soon as they are added."
		dropTitle="Drop images or videos here"
		onFilesSelected={ingestFilesFromAttachDialog}
	/>

	<MediaLibraryModal
		bind:open={libraryOpen}
		{organizationId}
		disabled={disabled || uploadBusy}
		mediaLocked={mediaAtCap}
		attachedPaths={attachedMediaPaths}
		onAttach={onAttachFromLibrary}
	/>

	<!-- 8–9: parity placeholders (not wired yet) -->
	<!-- <button type="button" class={iconBtn} disabled aria-label="AI image (coming soon)" title="Coming soon">
		<AbstractIcon name={icons.Sparkles.name} class="size-5" width="20" height="20" />
	</button>
	<button type="button" class={iconBtn} disabled aria-label="Video (coming soon)" title="Coming soon">
		<span class="relative inline-flex size-6 items-center justify-center">
			<AbstractIcon name={icons.ClapperBoard.name} class="size-5" width="20" height="20" />
			<span
				class="bg-primary text-primary-content ring-base-100 absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full ring-2"
				aria-hidden="true"
			>
				<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
			</span>
		</span>
	</button> -->
</div>

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

{#if showLinkedInCompany && focusedIntegrationId && organizationId}
	<LinkedInCompanyModal
		bind:open={linkedInCompanyOpen}
		organizationId={organizationId}
		integrationId={focusedIntegrationId}
		onClose={() => (linkedInCompanyOpen = false)}
		onInsert={insertLinkedInCompanyMention}
	/>
{/if}
