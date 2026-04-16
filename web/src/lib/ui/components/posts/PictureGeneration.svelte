<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/canvas-editor/konvaCanvasApi';
	import type { SocialPostMediaItem } from '$lib/posts/composerMedia.types';

	import { DesignMediaWorkspace } from '$lib/canvas-editor/side-panel';
	import { icons } from '$data/icon';
	import * as Dialog from '$lib/ui/dialog';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { mediaRepository } from '$lib/core/index';
	import { toast } from '$lib/ui/sonner';

	type Tab = 'canvas' | 'upload';

	type Props = {
		open?: boolean;
		disabled?: boolean;
		/** Shown in upload flows; storage path uses JWT on the server. */
		uploadUid: string;
		onAdd: (items: SocialPostMediaItem[]) => void;
	};

	let { open = $bindable(false), disabled = false, uploadUid, onAdd }: Props = $props();

	let fileInput = $state.raw<HTMLInputElement | undefined>(undefined);
	let busy = $state(false);
	let tab = $state<Tab>('canvas');
	let canvasApi = $state<KonvaCanvasApi | null>(null);

	function close() {
		open = false;
		canvasApi = null;
		tab = 'canvas';
	}

	async function uploadFiles(files: FileList | null) {
		if (!files?.length || disabled || busy) return;
		const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
		if (!list.length) {
			toast.error('Choose an image file.');
			return;
		}
		busy = true;
		const added: SocialPostMediaItem[] = [];
		try {
			for (const file of list) {
				const result = await mediaRepository.uploadMedia(file, uploadUid);
				if (result.success && result.data.filePath) {
					added.push({ id: crypto.randomUUID(), path: result.data.filePath, bucket: 'social_media' });
				} else {
					toast.error(result.message || 'Upload failed.');
					busy = false;
					return;
				}
			}
			if (added.length) {
				onAdd(added);
				toast.success(added.length === 1 ? 'Design added.' : 'Designs added.');
				close();
			}
		} finally {
			busy = false;
		}
	}

	function onFileChange(e: Event) {
		const t = e.currentTarget as HTMLInputElement;
		void uploadFiles(t.files);
		t.value = '';
	}

	$effect(() => {
		if (!open) {
			canvasApi = null;
			tab = 'canvas';
		}
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
				Tools and stock picks on the left; compose on the canvas on the right — or upload a finished file.
			</Dialog.Description>
		</Dialog.Header>

		<div class="border-base-300 flex shrink-0 gap-1 border-b px-4 py-2 sm:px-6">
			<button
				type="button"
				class="rounded-md px-3 py-1.5 text-sm font-medium {tab === 'canvas'
					? 'bg-primary text-primary-content'
					: 'text-base-content/70 hover:bg-base-200'}"
				onclick={() => (tab = 'canvas')}
			>
				Canvas
			</button>
			<button
				type="button"
				class="rounded-md px-3 py-1.5 text-sm font-medium {tab === 'upload'
					? 'bg-primary text-primary-content'
					: 'text-base-content/70 hover:bg-base-200'}"
				onclick={() => (tab = 'upload')}
			>
				Upload file
			</button>
		</div>

		<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-2 pb-2 sm:px-4 sm:pb-4">
			{#if tab === 'canvas'}
				<DesignMediaWorkspace
					disabled={disabled || busy}
					onCanvasReady={(api) => (canvasApi = api)}
					onUseMedia={() => void exportCanvasToPost()}
				/>
			{:else}
				<div class="flex flex-col gap-4 p-4">
					<input
						bind:this={fileInput}
						type="file"
						accept="image/*"
						multiple
						class="hidden"
						onchange={onFileChange}
					/>
					<Button
						type="button"
						variant="primary"
						disabled={disabled || busy}
						class="w-full max-w-md"
						onclick={() => fileInput?.click()}
					>
						{#if busy}
							<span class="loading loading-spinner loading-sm"></span>
							Uploading…
						{:else}
							<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
							Choose image file
						{/if}
					</Button>
				</div>
			{/if}
		</div>

		<div class="border-base-300 flex shrink-0 flex-wrap justify-end gap-2 border-t px-4 py-3 sm:px-6">
			<Button type="button" variant="ghost" disabled={busy} onclick={close}>Close</Button>
			{#if tab === 'upload'}
				<!-- primary upload happens from the button above -->
			{:else}
				<Button
					type="button"
					variant="secondary"
					disabled={disabled || busy || !canvasApi}
					onclick={() => void exportCanvasToPost()}
				>
					{#if busy}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						<AbstractIcon name={icons.Save.name} class="size-4" width="16" height="16" />
					{/if}
					Use this media
				</Button>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
