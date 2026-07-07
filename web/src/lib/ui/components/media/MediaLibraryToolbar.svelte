<script lang="ts">
	import { icons } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';
	import Button from '$lib/ui/buttons/Button.svelte';
	import DeviceMediaAttachModal from '$lib/ui/components/media/DeviceMediaAttachModal.svelte';
	import GlyphDesignEditor from '$lib/ui/components/posts/GlyphDesignEditor.svelte';
	import ThirdPartyMediaLibrary from '$lib/ui/components/third-parties/ThirdPartyMediaLibrary.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		organizationId: string;
		uploadBusy: boolean;
		storageLimitFull?: boolean;
		onStorageLimitBlocked?: () => void;
		onFilesSelected: (files: FileList | null) => void;
		onDesignClick: () => void;
		onImported: () => void;
	};

	let {
		organizationId,
		uploadBusy,
		storageLimitFull = false,
		onStorageLimitBlocked,
		onFilesSelected,
		onDesignClick,
		onImported
	}: Props = $props();

	let attachOpen = $state(false);

	function handleAttachFiles(files: FileList) {
		onFilesSelected(files);
		attachOpen = false;
	}

	function tryOpenUpload() {
		if (storageLimitFull) {
			onStorageLimitBlocked?.();
			return;
		}
		attachOpen = true;
	}

	function tryOpenDesign() {
		if (storageLimitFull) {
			onStorageLimitBlocked?.();
			return;
		}
		onDesignClick();
	}
</script>

<div class="flex flex-wrap items-center gap-2 sm:gap-3">
	<Button
		type="button"
		variant={storageLimitFull ? 'outline' : 'primary'}
		class={cn(
			'gap-2',
			storageLimitFull &&
				'border-warning/35 bg-warning/5 text-warning hover:border-warning/50 hover:bg-warning/10'
		)}
		disabled={uploadBusy}
		onclick={tryOpenUpload}
	>
		{#if uploadBusy}
			<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
		{:else}
			<AbstractIcon
				name={storageLimitFull ? icons.Lock.name : icons.Plus.name}
				class="size-4"
				width="16"
				height="16"
			/>
		{/if}
		{storageLimitFull ? 'Storage full' : 'Upload'}
	</Button>

	<DeviceMediaAttachModal
		bind:open={attachOpen}
		disabled={uploadBusy}
		{uploadBusy}
		accept="image/*,video/*"
		title="Upload media"
		description="Drag and drop images or videos here, or click the area to browse. Files upload as soon as they are added."
		dropTitle="Drop images or videos here"
		onFilesSelected={handleAttachFiles}
	/>

	<Button
		type="button"
		variant="secondary"
		class={cn('gap-2', storageLimitFull && 'opacity-60')}
		disabled={uploadBusy || !organizationId}
		onclick={tryOpenDesign}
	>
		<span class="inline-flex shrink-0 text-secondary-content">
			<GlyphDesignEditor badgeSurfaceClass="rounded-sm bg-secondary shadow-none ring-0" />
		</span>
		Design
	</Button>
	
	<ThirdPartyMediaLibrary
		{organizationId}
		storageLimitFull={storageLimitFull}
		onStorageLimitBlocked={onStorageLimitBlocked}
		onImported={onImported}
	/>
</div>
