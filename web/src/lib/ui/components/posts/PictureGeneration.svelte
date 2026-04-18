<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import type { PostMediaProgrammerModel } from '$lib/posts';

	import { mediaRepository } from '$lib/media';
	import { toast } from '$lib/ui/sonner';

	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { DesignMediaWorkspace } from '$lib/ui/canvas-editor/side-panel';

	type Props = {
		open?: boolean;
		disabled?: boolean;
		/** Shown in upload flows; storage path uses JWT on the server. */
		uploadUid: string;
		onAdd: (items: PostMediaProgrammerModel[]) => void;
		/** Primary action: composer uses "Use this media"; media library may use e.g. "Save this for later". */
		useMediaLabel?: string;
		/** When set from the create-post composer, aligns default canvas format with channel(s). */
		composerMode?: 'global' | 'custom';
		/** Focused integration provider id (e.g. `tiktok`) in custom mode; used with `composerMode`. */
		focusedProviderIdentifier?: string | null;
	};

	let {
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
			const blob = await canvasApi.toPngBlob();
			if (!blob) {
				toast.error('Could not export the canvas. Try again.');
				return;
			}
			const file = new File([blob], 'canvas.png', { type: 'image/png' });
			const result = await mediaRepository.uploadMedia(file, uploadUid);
			if (result.success && result.data.filePath) {
				onAdd([{ id: crypto.randomUUID(), path: result.data.filePath, bucket: 'social_media' }]);
				toast.success('Canvas exported and attached.');
				close();
			} else {
				toast.error(result.message || 'Upload failed.');
			}
		} catch {
			toast.error('Could not export the canvas. Try again.');
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
				<DesignMediaWorkspace
					disabled={disabled || busy}
					{useMediaLabel}
					designSeed={designSeed}
					{composerMode}
					{focusedProviderIdentifier}
					onCanvasReady={(api) => (canvasApi = api)}
					onUseMedia={() => void exportCanvasToPost()}
				/>
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
