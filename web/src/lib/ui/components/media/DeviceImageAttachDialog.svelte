<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { Dropzone } from '$lib/ui/dropzone';

	interface Props {
		open?: boolean;
		disabled?: boolean;
		uploadBusy?: boolean;
		onFilesSelected?: (files: FileList) => void | Promise<void>;
		/** Passed to the file input / dropzone (e.g. `image/*` or `image/*,video/*`). */
		accept?: string;
		title?: string;
		description?: string;
		dropTitle?: string;
		dropSubtitle?: string;
	}

	let {
		open = $bindable(false),
		disabled = false,
		uploadBusy = false,
		onFilesSelected,
		accept = 'image/*',
		title = 'Add images',
		description = 'Drag and drop images here, or click the area to browse. Files upload as soon as they are added; you do not need to save the set first.',
		dropTitle = 'Drop images here',
		dropSubtitle = 'or click to choose from your device'
	}: Props = $props();

	function handleFiles(files: FileList | null) {
		if (!files?.length) return;
		void onFilesSelected?.(files);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-w-md gap-5"
		showCloseButton={!uploadBusy}
		onOpenAutoFocus={(e) => e.preventDefault()}
	>
		<Dialog.Header>
			<Dialog.Title>
				{title}
			</Dialog.Title>
			<Dialog.Description class="text-base-content/75 text-sm">
				{description}
			</Dialog.Description>
		</Dialog.Header>

		<Dropzone
			{accept}
			multiple
			{disabled}
			class="border-primary/25 hover:border-primary/40 bg-base-200/50 h-52 min-h-48 cursor-pointer border-dashed disabled:cursor-not-allowed disabled:opacity-50"
			onChange={(e) => {
				const t = e.currentTarget as HTMLInputElement;
				handleFiles(t.files);
				t.value = '';
			}}
			onDrop={(e) => {
				const list = e.dataTransfer?.files ?? null;
				handleFiles(list);
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
						<p class="text-sm font-medium">{dropTitle}</p>
						<p class="text-base-content/60 text-xs">{dropSubtitle}</p>
					</div>
				{/if}
			</div>
		</Dropzone>

		<Dialog.Footer>
			<Button type="button" variant="ghost" disabled={uploadBusy} onclick={() => (open = false)}>
				Cancel
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
