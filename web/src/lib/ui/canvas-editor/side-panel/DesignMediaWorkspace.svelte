<script lang="ts" module>
	import type {
		DesignTemplateProgrammerModel,
		PolotnoTemplateListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';

	/** Exported so parents (e.g. `PictureGeneration`) get a stable component prop type in TS. */
	export type DesignMediaWorkspaceProps = {
		disabled?: boolean;
		onCanvasReady?: (
			api: import('$lib/ui/canvas-editor/canvas/konvaCanvasApi').KonvaCanvasApi | null
		) => void;
		onUseMedia?: () => void;
		/** Primary action label on the canvas toolbar (mirrored in the host dialog footer when used there). */
		useMediaLabel?: string;
		/**
		 * Bumps each time the host design dialog opens so aspect ratio resets from composer context
		 * (global → General 16:9; custom → first format for the focused channel’s platform).
		 */
		designSeed?: number;
		/** Mirrors create-post composer mode (`global` = General formats only). */
		composerMode?: 'global' | 'custom';
		/** Focused integration’s `identifier` in custom mode (e.g. `tiktok`, `instagram-business`). */
		focusedProviderIdentifier?: string | null;
		/** Stock grid rows from {@link CanvasDesignRepository} (injected per design modal instance). */
		stockPhotosPm: readonly StockPhotoViewModel[];
		/** Built-in templates + Polotno list fetch from {@link GeneratePictureModalPresenter}. */
		designTemplatesVm: readonly DesignTemplateProgrammerModel[];
		fetchPolotnoTemplateListPage: (
			params: { query: string; page: number },
			signal?: AbortSignal
		) => Promise<PolotnoTemplateListPageProgrammerModel>;
	};
</script>

<script lang="ts">
	import type { CanvasSelectionState, KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';

	import { onDestroy } from 'svelte';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import KonvaDesignCanvas from '$lib/ui/canvas-editor/canvas/KonvaDesignCanvas.svelte';
	import PhotosPanel from '$lib/ui/canvas-editor/side-panel/panels/PhotosPanel.svelte';
	import TextPanel from '$lib/ui/canvas-editor/side-panel/panels/TextPanel.svelte';
	import TemplatesPanel from '$lib/ui/canvas-editor/side-panel/panels/TemplatesPanel.svelte';
	import { AspectRatioShiftingPicker, CanvasToolbar } from '$lib/ui/canvas-editor/toolbar';
	import {
		defaultAspectRatioIdForComposer,
		getAspectPresetById
	} from '$lib/ui/canvas-editor/utils/aspectRatioPresets';

	type SectionId =
		| 'templates'
		| 'text'
		| 'photos'
		| 'elements'
		| 'draw'
		| 'upload'
		| 'background'
		| 'layers';

	let {
		disabled = false,
		onCanvasReady,
		onUseMedia,
		useMediaLabel = 'Use this media',
		designSeed = 0,
		composerMode = 'global',
		focusedProviderIdentifier = null,
		stockPhotosPm,
		designTemplatesVm,
		fetchPolotnoTemplateListPage
	}: DesignMediaWorkspaceProps = $props();

	let section = $state<SectionId>('photos');
	let resourcePanelOpen = $state(true);
	let photoQuery = $state('');
	let uploadInput = $state.raw<HTMLInputElement | undefined>(undefined);
	let canvasApi = $state<KonvaCanvasApi | null>(null);
	let aspectRatioId = $state('16:9');
	let historyUi = $state({ canUndo: false, canRedo: false });
	let selectionState = $state<CanvasSelectionState>({
		hasSelection: false,
		opacity: 100,
		locked: false
	});

	const selectedAspect = $derived(getAspectPresetById(aspectRatioId));

	const navItems: { id: SectionId; label: string; icon: (typeof icons)[keyof typeof icons] }[] = [
		{ id: 'templates', label: 'Templates', icon: icons.LayoutTemplate },
		{ id: 'text', label: 'Text', icon: icons.TypeOutline },
		{ id: 'photos', label: 'Photos', icon: icons.Image },
		{ id: 'elements', label: 'Elements', icon: icons.Hexagon },
		{ id: 'draw', label: 'Draw', icon: icons.BrushCleaning },
		{ id: 'upload', label: 'Upload Image', icon: icons.SquarePlus },
		{ id: 'background', label: 'Background', icon: icons.Columns3Cog },
		{ id: 'layers', label: 'Layers', icon: icons.BetweenVerticalEnd }
	];

	const bgSwatches = ['#ffffff', '#f1f5f9', '#fef3c7', '#dbeafe', '#fce7f3', '#ecfdf5', '#1e293b', '#0f172a'];

	function handleKonvaReady(api: KonvaCanvasApi) {
		canvasApi = api;
		onCanvasReady?.(api);
	}

	function onHistoryChange(state: { canUndo: boolean; canRedo: boolean }) {
		historyUi = state;
	}

	function onSelectionChange(state: CanvasSelectionState) {
		selectionState = state;
	}

	onDestroy(() => {
		canvasApi = null;
		onCanvasReady?.(null);
	});

	/** Re-apply when composer platform context or dialog open cycle changes (not when only `aspectRatioId` changes from the picker). */
	$effect(() => {
		designSeed;
		composerMode;
		focusedProviderIdentifier;
		aspectRatioId = defaultAspectRatioIdForComposer(composerMode, focusedProviderIdentifier);
	});

	function onUploadPick(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const f = input.files?.[0];
		if (f?.type.startsWith('image/')) {
			canvasApi?.addImageFromFile(f);
		}
		input.value = '';
	}

	function onDropUpload(e: DragEvent) {
		e.preventDefault();
		const f = e.dataTransfer?.files?.[0];
		if (f?.type.startsWith('image/')) {
			canvasApi?.addImageFromFile(f);
		}
	}
</script>

<div
	class="border-base-300 bg-base-200/20 grid h-full min-h-0 min-w-0 flex-1 overflow-visible rounded-lg border"
	style:grid-template-columns={resourcePanelOpen
		? 'minmax(5.25rem, 6rem) minmax(0, 2fr) minmax(0, 3fr)'
		: 'minmax(5.25rem, 6rem) minmax(0, 1fr)'}
	style:grid-template-rows="minmax(0, 1fr)"
>
	<nav
		class="border-base-300 flex min-h-0 min-w-0 flex-col gap-1 overflow-y-auto border-r py-2 pr-1 pl-1 sm:py-2.5"
		aria-label="Design tools"
	>
		{#if !resourcePanelOpen}
			<div class="border-base-300 mb-2 shrink-0 border-b pb-2">
				<p class="text-base-content/60 mb-1.5 text-[9px] font-medium tracking-wide uppercase">
					Canvas size
				</p>
				<AspectRatioShiftingPicker
					{disabled}
					{aspectRatioId}
					{selectedAspect}
					layout="toolbar"
					onAspectChange={(id) => (aspectRatioId = id)}
				/>
			</div>
		{/if}
		{#each navItems as item (item.id)}
			<button
				type="button"
				title={item.label}
				class="hover:bg-base-300/50 flex w-full flex-col items-center gap-1 rounded-lg px-0.5 py-2 transition-colors {section === item.id
					? 'bg-primary/25 text-primary ring-primary/40 ring-1'
					: 'text-base-content/70'}"
				onclick={() => (section = item.id)}
			>
				<AbstractIcon name={item.icon.name} class="size-5 shrink-0" width="20" height="20" />
				<span class="text-center text-[10px] leading-tight font-medium tracking-tight sm:text-[11px]"
					>{item.label}</span
				>
			</button>
		{/each}
	</nav>

	{#if resourcePanelOpen}
		<div
			class="border-base-300 bg-base-100/40 relative z-20 flex h-full min-h-0 min-w-0 flex-col overflow-visible border-r"
		>
			<div class="border-base-300 bg-base-200/30 relative z-30 shrink-0 border-b px-3 py-2">
				<p class="text-base-content/60 mb-1 text-[10px] font-medium tracking-wide uppercase sm:text-xs">
					Canvas size
				</p>
				<AspectRatioShiftingPicker
					{disabled}
					{aspectRatioId}
					{selectedAspect}
					layout="canvasHeader"
					onAspectChange={(id) => (aspectRatioId = id)}
				/>
			</div>
			<!--
				`overflow-hidden` (not `overflow-y-auto`) so each panel owns vertical scrolling (e.g. ScrollArea
				in Text/Templates/Photos). Otherwise this column scrolls as one block and inner scroll regions
				get no stable height.
			-->
			<div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden p-3">
				{#if section === 'photos'}
					<PhotosPanel {disabled} canvasApi={canvasApi} photosPm={stockPhotosPm} />
				{:else if section === 'templates'}
					<TemplatesPanel
						{disabled}
						canvasApi={canvasApi}
						aspectRatioId={aspectRatioId}
						{designTemplatesVm}
						{fetchPolotnoTemplateListPage}
						onAspectChange={(id) => (aspectRatioId = id)}
					/>
				{:else if section === 'text'}
					<TextPanel {disabled} canvasApi={canvasApi} />
				{:else if section === 'elements'}
					<p class="text-base-content/70 text-sm font-medium">Elements</p>
					<p class="text-base-content/55 text-xs">Shapes and stickers will appear in this column.</p>
				{:else if section === 'draw'}
					<p class="text-base-content/70 text-sm font-medium">Draw</p>
					<p class="text-base-content/55 text-xs">Freehand drawing is not enabled in this build.</p>
				{:else if section === 'upload'}
					<p class="text-base-content/70 text-sm font-medium">Upload</p>
					<input
						bind:this={uploadInput}
						type="file"
						accept="image/*"
						class="hidden"
						onchange={onUploadPick}
					/>
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="border-base-300 hover:border-primary/40 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center text-sm"
						ondragover={(e) => e.preventDefault()}
						ondrop={onDropUpload}
						onclick={() => uploadInput?.click()}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && uploadInput?.click()}
					>
						<AbstractIcon name={icons.SquarePlus.name} class="size-10 opacity-60" width="40" height="40" />
						<span class="text-base-content/70">Drop an image or click to browse</span>
					</div>
				{:else if section === 'background'}
					<p class="text-base-content/70 text-sm font-medium">Background</p>
					<p class="text-base-content/55 text-xs">Page fill inside the frame.</p>
					<div class="flex flex-wrap gap-2">
						{#each bgSwatches as color (color)}
							<button
								type="button"
								title={color}
								class="ring-base-300 size-9 rounded-full ring-2 ring-offset-2 ring-offset-base-100 disabled:opacity-40"
								style:background-color={color}
								disabled={disabled || !canvasApi}
								onclick={() => canvasApi?.setPageBackground(color)}
							></button>
						{/each}
					</div>
				{:else if section === 'layers'}
					<p class="text-base-content/70 text-sm font-medium">Layers</p>
					<p class="text-base-content/55 text-xs">
						A flat list of placed images will be listed here in a future update.
					</p>
				{/if}
			</div>
			<button
				type="button"
				class="border-base-300 bg-base-200/90 text-base-content/70 hover:bg-base-300 absolute top-1/2 right-0 z-20 flex size-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border shadow-md"
				title="Hide asset panel"
				aria-label="Hide asset panel"
				onclick={() => (resourcePanelOpen = false)}
			>
				<AbstractIcon name={icons.ChevronLeft.name} class="size-4" width="16" height="16" />
			</button>
		</div>
	{/if}

	<div class="relative z-0 flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
		{#if !resourcePanelOpen}
			<button
				type="button"
				class="border-base-300 bg-base-200/90 text-base-content/70 hover:bg-base-300 absolute top-1/2 left-0 z-20 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-md"
				title="Show asset panel"
				aria-label="Show asset panel"
				onclick={() => (resourcePanelOpen = true)}
			>
				<AbstractIcon name={icons.ChevronRight.name} class="size-4" width="16" height="16" />
			</button>
		{/if}
		<CanvasToolbar
			{disabled}
			canvasApi={canvasApi}
			canUndo={historyUi.canUndo}
			canRedo={historyUi.canRedo}
			selection={selectionState}
			{useMediaLabel}
			onUseMedia={() => onUseMedia?.()}
		/>
		<div class="border-base-300 text-base-content/65 border-b px-2 py-2 sm:px-3">
			<p class="text-[11px] leading-snug sm:text-xs">
				<span class="text-base-content/80 font-medium">Export size:</span>
				{selectedAspect.exportWidth}×{selectedAspect.exportHeight}px
				{#if selectedAspect.hint}
					<span class="text-base-content/60 block pt-0.5">{selectedAspect.hint}</span>
				{/if}
			</p>
		</div>
		<div class="flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-3">
			<KonvaDesignCanvas
				embedded
				aspectPreset={selectedAspect}
				onReady={handleKonvaReady}
				onHistoryChange={onHistoryChange}
				onSelectionChange={onSelectionChange}
			/>
		</div>
	</div>
</div>
