<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type {
		DesignTemplateProgrammerModel,
		ExportCanvasToMediaFn,
		PolotnoTemplateListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';
	import type { PostMediaProgrammerModel } from '$lib/posts';

	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';

	type DesignWorkspaceModule = typeof import('$lib/ui/canvas-editor/side-panel/DesignMediaWorkspace.svelte');

	/** Set on first open so Konva + side panel stay in a separate chunk until the dialog is used. */
	let designWorkspaceCache: Promise<DesignWorkspaceModule> | null = null;

	function loadDesignWorkspaceChunk(): Promise<DesignWorkspaceModule> {
		designWorkspaceCache ??= import('$lib/ui/canvas-editor/side-panel/DesignMediaWorkspace.svelte');
		return designWorkspaceCache;
	}

	interface Props {
		stockPhotosVm: readonly StockPhotoViewModel[];
		designTemplatesVm: readonly DesignTemplateProgrammerModel[];
		fetchPolotnoTemplateListPage: (
			params: { query: string; page: number },
			signal?: AbortSignal
		) => Promise<PolotnoTemplateListPageProgrammerModel>;
		exportCanvasToMedia: ExportCanvasToMediaFn;
		open?: boolean;
		disabled?: boolean;
		/** Shown in upload flows; storage path uses JWT on the server. */
		uploadUid: string;
		onAdd: (items: PostMediaProgrammerModel[]) => void;
		/** Primary action label for the dialog footer / toolbar. */
		useMediaLabel?: string;
		composerMode?: 'global' | 'custom';
		focusedProviderIdentifier?: string | null;
	}

	let {
		stockPhotosVm,
		designTemplatesVm,
		fetchPolotnoTemplateListPage,
		exportCanvasToMedia,
		open = $bindable(false),
		disabled = false,
		uploadUid,
		onAdd,
		useMediaLabel = 'Use this media',
		composerMode = 'global',
		focusedProviderIdentifier = null
	}: Props = $props();

	let busy = $state(false);
	let canvasApi = $state<KonvaCanvasApi | null>(null);
	/** Increments when the dialog opens so the workspace reapplies aspect defaults from composer context. */
	let designSeed = $state(0);
	let prevOpen = $state(false);

	function close() {
		open = false;
		canvasApi = null;
	}

	$effect(() => {
		if (!open) {
			canvasApi = null;
		}
	});

	$effect.pre(() => {
		if (open && !prevOpen) {
			designSeed += 1;
		}
		prevOpen = open;
	});

	async function exportCanvasToPost() {
		if (!canvasApi || disabled || busy) {
			toast.error('Wait for the canvas to finish loading.');
			return;
		}
		busy = true;
		try {
			const result = await exportCanvasToMedia({
				canvasApi,
				uploadUid,
				disabled
			});
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			onAdd(result.items);
			toast.success('Canvas exported and attached.');
			close();
		} finally {
			busy = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex h-[min(92vh,900px)] max-h-[min(92vh,900px)] w-[min(100vw-0.5rem,1200px)] max-w-[min(100vw-0.5rem,1200px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(100vw-0.5rem,1200px)]"
		showCloseButton={true}
	>
		<Dialog.Header class="border-base-300 shrink-0 border-b px-4 py-3 sm:px-6">
			<Dialog.Title class="flex items-center gap-2 text-base font-semibold">
				<AbstractIcon name={icons.PaintRoller.name} class="size-5" width="20" height="20" />
				Design Media
			</Dialog.Title>
			<Dialog.Description class="text-base-content/70 text-sm">
				Pick tools, stock, or upload an image from the left; compose on the canvas on the right.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-2 pb-2 sm:px-4 sm:pb-4">
			{#key designSeed}
				{#if open}
					{#await loadDesignWorkspaceChunk()}
						<div
							class="flex min-h-[180px] flex-1 flex-col items-center justify-center gap-3 text-base-content/60"
						>
							<span class="loading loading-spinner loading-md"></span>
							<span class="text-sm">Loading editor…</span>
						</div>
					{:then { default: DesignMediaWorkspace }}
						<DesignMediaWorkspace
							disabled={disabled || busy}
							{useMediaLabel}
							designSeed={designSeed}
							{composerMode}
							{focusedProviderIdentifier}
							stockPhotosPm={stockPhotosVm}
							{designTemplatesVm}
							{fetchPolotnoTemplateListPage}
							onCanvasReady={(api) => (canvasApi = api)}
							onUseMedia={() => void exportCanvasToPost()}
						/>
					{:catch}
						<p class="text-error px-2 py-8 text-center text-sm">Could not load the design workspace.</p>
					{/await}
				{/if}
			{/key}
		</div>

		<div class="border-base-300 flex shrink-0 flex-wrap justify-end gap-2 border-t px-4 py-3 sm:px-6">
			<Button type="button" variant="ghost" disabled={busy} onclick={close}>Close</Button>
			<Button
				type="button"
				variant="primary"
				disabled={disabled || busy || !canvasApi}
				onclick={() => void exportCanvasToPost()}
			>
				{#if busy}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<AbstractIcon name={icons.Save.name} class="size-4" width="16" height="16" />
				{/if}
				{useMediaLabel}
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
