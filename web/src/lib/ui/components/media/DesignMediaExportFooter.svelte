<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type ModalExportProps = {
		variant: 'modal';
		busy: boolean;
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
		useMediaLabel: string;
		onClose: () => void;
		onUpload: () => void | Promise<void>;
	};

	type PublicExportProps = {
		variant: 'public';
		busy: boolean;
		canvasApi: KonvaCanvasApi | null;
		isLoggedIn: boolean;
		mediaLibraryHref: string;
		onDownload: () => void | Promise<void>;
		onCloudSave: () => void;
	};

	type Props = ModalExportProps | PublicExportProps;

	let props: Props = $props();
</script>

{#if props.variant === 'modal'}
	<div class="border-base-300 flex shrink-0 flex-wrap justify-end gap-2 border-t px-4 py-3 sm:px-6">
		<Button type="button" variant="ghost" disabled={props.busy} onclick={props.onClose}>Close</Button>
		<Button
			type="button"
			variant="primary"
			class="gap-1.5"
			disabled={props.disabled || props.busy || !props.canvasApi}
			onclick={() => void props.onUpload()}
		>
			{#if props.busy}
				<span class="loading loading-spinner loading-sm"></span>
			{:else}
				<AbstractIcon name={icons.Save.name} class="size-4" width="16" height="16" />
			{/if}
			{props.useMediaLabel}
		</Button>
	</div>
{:else}
	<div
		class="border-base-300 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-6"
	>
		<p class="text-base-content/60 text-xs sm:text-sm">
			Download is free — no account required. Cloud save uses your workspace media library.
		</p>
		<div class="flex flex-wrap justify-end gap-2">
			{#if props.isLoggedIn}
				<Button type="button" variant="ghost" class="gap-1.5" href={props.mediaLibraryHref}>
					<AbstractIcon name={icons.FolderInput.name} class="size-4" width="16" height="16" />
					Save to cloud
				</Button>
			{:else}
				<Button
					type="button"
					variant="ghost"
					class="gap-1.5"
					disabled={props.busy || !props.canvasApi}
					onclick={props.onCloudSave}
				>
					<AbstractIcon name={icons.FolderInput.name} class="size-4" width="16" height="16" />
					Save to cloud
				</Button>
			{/if}
			<Button
				type="button"
				variant="primary"
				class="gap-1.5"
				disabled={props.busy || !props.canvasApi}
				onclick={() => void props.onDownload()}
			>
				{#if props.busy}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<AbstractIcon name={icons.Share2.name} class="size-4" width="16" height="16" />
				{/if}
				Download
			</Button>
		</div>
	</div>
{/if}
