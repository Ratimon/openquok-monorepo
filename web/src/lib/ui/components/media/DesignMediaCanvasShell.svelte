<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type { DesignMediaWorkspaceProps } from '$lib/ui/canvas-editor/side-panel/DesignMediaWorkspace.svelte';

	type DesignWorkspaceModule = typeof import('$lib/ui/canvas-editor/side-panel/DesignMediaWorkspace.svelte');

	let designWorkspaceCache: Promise<DesignWorkspaceModule> | null = null;

	function loadDesignWorkspaceChunk(): Promise<DesignWorkspaceModule> {
		designWorkspaceCache ??= import('$lib/ui/canvas-editor/side-panel/DesignMediaWorkspace.svelte');
		return designWorkspaceCache;
	}

	type Props = Omit<DesignMediaWorkspaceProps, 'onCanvasReady'> & {
		/** When false, the workspace is not mounted (e.g. closed dialog). */
		active?: boolean;
		canvasApi?: KonvaCanvasApi | null;
		loadingMinHeightClass?: string;
	};

	let {
		active = true,
		canvasApi = $bindable(null),
		loadingMinHeightClass = 'min-h-[180px]',
		disabled = false,
		designSeed = 0,
		composerMode = 'global',
		focusedProviderIdentifier = null,
		stockPhotosVm,
		designTemplatesVm,
		fetchPolotnoTemplateListPage,
		backgroundPanelVm
	}: Props = $props();

	$effect(() => {
		if (!active) {
			canvasApi = null;
		}
	});
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
	{#key designSeed}
		{#if active}
			{#await loadDesignWorkspaceChunk()}
				<div
					class="flex {loadingMinHeightClass} flex-1 flex-col items-center justify-center gap-3 text-base-content/60"
				>
					<span class="loading loading-spinner loading-md"></span>
					<span class="text-sm">Loading editor…</span>
				</div>
			{:then { default: DesignMediaWorkspace }}
				<DesignMediaWorkspace
					{disabled}
					{designSeed}
					{composerMode}
					{focusedProviderIdentifier}
					{stockPhotosVm}
					{designTemplatesVm}
					{fetchPolotnoTemplateListPage}
					{backgroundPanelVm}
					onCanvasReady={(api) => (canvasApi = api)}
				/>
			{:catch}
				<p class="text-error px-2 py-8 text-center text-sm">Could not load the design workspace.</p>
			{/await}
		{/if}
	{/key}
</div>
