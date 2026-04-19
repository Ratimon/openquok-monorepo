<script lang="ts" module>
	import type {
		BackgroundPanelVm,
		DesignTemplateProgrammerModel,
		PolotnoTemplateListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';

	/** Exported so parents (e.g. `MediaGeneration`) get a stable component prop type in TS. */
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
		 * (global → General default aspect; custom → first format for the focused channel’s platform).
		 */
		designSeed?: number;
		/** Mirrors create-post composer mode (`global` = General formats only). */
		composerMode?: 'global' | 'custom';
		/** Focused integration’s `identifier` in custom mode (e.g. `tiktok`, `instagram-business`). */
		focusedProviderIdentifier?: string | null;
		/** Stock grid rows from {@link CanvasDesignRepository} (injected per design modal instance). */
		stockPhotosVm: readonly StockPhotoViewModel[];
		/** Built-in templates + Polotno list fetch from {@link GenerateMediaModalPresenter}. */
		designTemplatesVm: readonly DesignTemplateProgrammerModel[];
		fetchPolotnoTemplateListPage: (
			params: { query: string; page: number },
			signal?: AbortSignal
		) => Promise<PolotnoTemplateListPageProgrammerModel>;
		backgroundPanelVm: BackgroundPanelVm;
	};
</script>

<script lang="ts">
	import type { CanvasSelectionState, KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';

	import { onDestroy } from 'svelte';

	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import KonvaDesignCanvas from '$lib/ui/canvas-editor/canvas/KonvaDesignCanvas.svelte';
	import DrawPanel from '$lib/ui/canvas-editor/side-panel/panels/DrawPanel.svelte';
	import ElementsPanel from '$lib/ui/canvas-editor/side-panel/panels/ElementsPanel.svelte';
	import BackgroundPanel from '$lib/ui/canvas-editor/side-panel/panels/BackgroundPanel.svelte';
	import PhotosPanel from '$lib/ui/canvas-editor/side-panel/panels/PhotosPanel.svelte';
	import UploadPanel from '$lib/ui/canvas-editor/side-panel/panels/UploadPanel.svelte';
	import TextPanel from '$lib/ui/canvas-editor/side-panel/panels/TextPanel.svelte';
	import TemplatesPanel from '$lib/ui/canvas-editor/side-panel/panels/TemplatesPanel.svelte';
	import { AspectRatioShiftingPicker, CanvasToolbar } from '$lib/ui/canvas-editor/toolbar';
	import {
		DEFAULT_ASPECT_RATIO_ID,
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
		stockPhotosVm,
		designTemplatesVm,
		fetchPolotnoTemplateListPage,
		backgroundPanelVm
	}: DesignMediaWorkspaceProps = $props();

	let section = $state<SectionId>('photos');
	let resourcePanelOpen = $state(true);
	let photoQuery = $state('');
	let canvasApi = $state<KonvaCanvasApi | null>(null);
	let aspectRatioId = $state(DEFAULT_ASPECT_RATIO_ID);
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
					<PhotosPanel {disabled} canvasApi={canvasApi} photosPm={stockPhotosVm} />
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
					<ElementsPanel {disabled} canvasApi={canvasApi} />
				{:else if section === 'draw'}
					<DrawPanel {disabled} canvasApi={canvasApi} />
				{:else if section === 'upload'}
					<UploadPanel {disabled} canvasApi={canvasApi} />
				{:else if section === 'background'}
					<BackgroundPanel {disabled} canvasApi={canvasApi} {backgroundPanelVm} />
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
