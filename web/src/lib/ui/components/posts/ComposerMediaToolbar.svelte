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
	import type { LaunchProviderCommentsMode } from '$lib/ui/components/posts/providers/provider.types';
	import type { FetchSignaturesForComposerFn } from '$lib/signatures';

	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import GlyphBoldText from '$lib/ui/components/posts/GlyphBoldText.svelte';
	import GlyphDesignEditor from '$lib/ui/components/posts/GlyphDesignEditor.svelte';
	import GlyphEmojiPicker from '$lib/ui/components/posts/GlyphEmojiPicker.svelte';
	import GlyphItalicText from '$lib/ui/components/posts/GlyphItalicText.svelte';
	import GlyphUText from '$lib/ui/components/posts/GlyphUText.svelte';
	import MediaGenerationModal from '$lib/ui/components/media/MediaGenerationModal.svelte';
	import ComposerMediaTooltip, {
		composeTooltipTriggerClick
	} from '$lib/ui/components/posts/ComposerMediaTooltip.svelte';
	import SignatureModal from '$lib/ui/components/signature/SignatureModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { Dropzone } from '$lib/ui/dropzone';
	import * as Tooltip from '$lib/ui/tooltip';
	import { uploadSocialPostComposerMediaFiles } from '$lib/posts';
	import { toast } from '$lib/ui/sonner';

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
		/** Workspace whose shared signatures are listed. */
		organizationId?: string | null;
		/** Wired from create-post presenter; keeps the repository out of this component. */
		loadSignaturesVmForComposer?: FetchSignaturesForComposerFn;
		onInsertSignature?: (text: string) => void;
		textarea?: HTMLTextAreaElement | null;
		class?: string;
		composerMode?: 'global' | 'custom';
		focusedProviderIdentifier?: string | null;
		/** When `'no-media'` and there is at least one item, block adding more media. */
		commentsMode?: LaunchProviderCommentsMode;
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
		organizationId = null,
		loadSignaturesVmForComposer = undefined,
		onInsertSignature = undefined,
		textarea = null,
		class: className = '',
		composerMode = 'global',
		focusedProviderIdentifier = null,
		commentsMode = true
	}: ComposerMediaToolbarProps = $props();

	type MediaGenerationProps = ComponentProps<typeof MediaGenerationModal>;

	let uploadBusy = $state(false);
	let designOpen = $state(false);
	let deviceAttachOpen = $state(false);
	const mediaLocked = $derived(commentsMode === 'no-media' && items.length > 0);
	let signatureOpen = $state(false);
	const iconBtn =
		'border-base-300/90 bg-base-200/45 text-base-content/85 hover:bg-base-300/55 hover:text-base-content focus-visible:ring-primary/40 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35';

	async function uploadFiles(files: FileList | null): Promise<boolean> {
		if (mediaLocked) return false;
		if (!files?.length || disabled || uploadBusy || !uploadUid) return false;
		uploadBusy = true;
		try {
			const batch = await uploadSocialPostComposerMediaFiles(files, uploadUid);
			if (!batch.ok) {
				toast.error(batch.message);
				return false;
			}
			items = [...items, ...batch.items];
			if (batch.items.length) {
				toast.success(batch.items.length === 1 ? 'Image attached.' : 'Images attached.');
			}
			return true;
		} finally {
			uploadBusy = false;
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

	function insertSignatureFromModal(text: string) {
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
			disabled: disabled || uploadBusy || mediaLocked,
			uploadUid,
			composerMode,
			focusedProviderIdentifier,
			onAdd: onAddFromDesign
		})
	);
</script>

<div
	class="border-base-300/80 bg-base-100/90 flex items-center gap-1 rounded-xl border p-1 shadow-md backdrop-blur-md {className}"
	role="toolbar"
	aria-label="Post media"
>
	<Tooltip.Provider delayDuration={200}>
		<!-- 1: add images from disk -->
		<ComposerMediaTooltip label="Attach images from your device">
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class={iconBtn}
					disabled={disabled || uploadBusy || mediaLocked}
					onclick={composeTooltipTriggerClick(props, () => {
						deviceAttachOpen = true;
					})}
					aria-label="Add images from your device"
				>
					{#if uploadBusy}
						<span class="loading loading-spinner loading-sm text-primary"></span>
					{:else}
						<span class="relative inline-flex size-6 items-center justify-center">
							<AbstractIcon name={icons.Image.name} class="size-6" width="24" height="24" />
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
		<!-- 2: design / canvas modal -->
		<ComposerMediaTooltip label="Open the design editor to create or edit visuals">
			{#snippet trigger({ props })}
				<button
					{...props}
					type="button"
					class={iconBtn}
					disabled={disabled || uploadBusy || mediaLocked}
					onclick={composeTooltipTriggerClick(props, () => {
						designOpen = true;
					})}
					aria-label="Open design editor"
				>
					<GlyphDesignEditor badgeSurfaceClass="rounded-sm bg-base-200/45 shadow-none ring-0" />
				</button>
			{/snippet}
		</ComposerMediaTooltip>

		<!-- 3: signatures modal -->
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

		<!-- 4–7: inline text styling (selection-based) -->
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
	</Tooltip.Provider>

	<Dialog.Root bind:open={deviceAttachOpen}>
		<Dialog.Content
			class="max-w-md gap-5"
			showCloseButton={!uploadBusy}
			onOpenAutoFocus={(e) => e.preventDefault()}
		>
			<Dialog.Header>
				<Dialog.Title>Add images</Dialog.Title>
				<Dialog.Description class="text-base-content/75 text-sm">
					Drag and drop images here, or click the area to browse. Files upload as soon as they are added;
					you do not need to save the set first.
				</Dialog.Description>
			</Dialog.Header>

			<Dropzone
				accept="image/*"
				multiple
				disabled={disabled || uploadBusy || mediaLocked}
				class="border-primary/25 hover:border-primary/40 bg-base-200/50 h-52 min-h-48 cursor-pointer border-dashed disabled:cursor-not-allowed disabled:opacity-50"
				onChange={(e) => {
					const t = e.currentTarget as HTMLInputElement;
					void ingestFilesFromAttachDialog(t.files);
					t.value = '';
				}}
				onDrop={(e) => {
					const list = e.dataTransfer?.files ?? null;
					if (list?.length) void ingestFilesFromAttachDialog(list);
				}}
			>
				<div class="text-base-content/80 pointer-events-none flex flex-col items-center gap-3 px-4 text-center">
					{#if uploadBusy}
						<span class="loading loading-spinner loading-lg text-primary"></span>
						<span class="text-sm font-medium">Uploading…</span>
					{:else}
						<span class="relative inline-flex size-12 items-center justify-center text-primary">
							<AbstractIcon name={icons.Image.name} class="size-12" width="48" height="48" />
						</span>
						<div class="space-y-1">
							<p class="text-sm font-medium">Drop images here</p>
							<p class="text-base-content/60 text-xs">or click to choose from your device</p>
						</div>
					{/if}
				</div>
			</Dropzone>

			<Dialog.Footer>
				<Button type="button" variant="ghost" disabled={uploadBusy} onclick={() => (deviceAttachOpen = false)}>
					Cancel
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

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
