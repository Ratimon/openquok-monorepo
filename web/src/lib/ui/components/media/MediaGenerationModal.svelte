<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type {
		BackgroundPanelViewModel,
		DesignTemplateProgrammerModel,
		ExportCanvasToMediaFn,
		PolotnoTemplateListPageProgrammerModel,
		StockPhotoViewModel
	} from '$lib/canvas';
	import type { PostMediaProgrammerModel } from '$lib/posts';

	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import DesignMediaCanvasShell from '$lib/ui/components/media/DesignMediaCanvasShell.svelte';
	import DesignMediaExportFooter from '$lib/ui/components/media/DesignMediaExportFooter.svelte';
	import * as Dialog from '$lib/ui/dialog';

	interface Props {
		stockPhotosVm: readonly StockPhotoViewModel[];
		designTemplatesVm: readonly DesignTemplateProgrammerModel[];
		fetchPolotnoTemplateListPage: (
			params: { query: string; page: number },
			signal?: AbortSignal
		) => Promise<PolotnoTemplateListPageProgrammerModel>;
		backgroundPanelVm: BackgroundPanelViewModel;
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
		backgroundPanelVm,
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
			<DesignMediaCanvasShell
				active={open}
				bind:canvasApi
				{designSeed}
				disabled={disabled || busy}
				{composerMode}
				{focusedProviderIdentifier}
				{stockPhotosVm}
				{designTemplatesVm}
				{fetchPolotnoTemplateListPage}
				{backgroundPanelVm}
			/>
		</div>

		<DesignMediaExportFooter
			variant="modal"
			{busy}
			{disabled}
			{canvasApi}
			{useMediaLabel}
			onClose={close}
			onUpload={exportCanvasToPost}
		/>
	</Dialog.Content>
</Dialog.Root>
