<script lang="ts">
	import { icons } from '$data/icon';

	import Button from '$lib/ui/buttons/Button.svelte';
	import DesignEditorGlyph from '$lib/ui/components/posts/DesignEditorGlyph.svelte';
	import ThirdPartyMediaLibrary from '$lib/ui/components/third-parties/ThirdPartyMediaLibrary.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		organizationId: string;
		uploadBusy: boolean;
		onFilesSelected: (files: FileList | null) => void;
		onDesignClick: () => void;
		onImported: () => void;
	};

	let { organizationId, uploadBusy, onFilesSelected, onDesignClick, onImported }: Props = $props();

	let fileInput = $state.raw<HTMLInputElement | null>(null);

	function onInputChange(e: Event): void {
		const el = e.currentTarget as HTMLInputElement;
		onFilesSelected(el.files);
		el.value = '';
	}
</script>

<div class="flex flex-wrap items-center gap-2 sm:gap-3">
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*,video/*"
		multiple
		class="hidden"
		onchange={onInputChange}
	/>
	<Button type="button" class="gap-2" onclick={() => fileInput?.click()} disabled={uploadBusy}>
		{#if uploadBusy}
			<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
		{:else}
			<AbstractIcon name={icons.Plus.name} class="size-4" width="16" height="16" />
		{/if}
		Upload
	</Button>
	<Button
		type="button"
		variant="secondary"
		class="gap-2"
		disabled={uploadBusy || !organizationId}
		onclick={onDesignClick}
	>
		<span class="inline-flex shrink-0 text-secondary-content">
			<DesignEditorGlyph badgeSurfaceClass="rounded-sm bg-secondary shadow-none ring-0" />
		</span>
		Design
	</Button>
	<ThirdPartyMediaLibrary {organizationId} onImported={onImported} />
</div>
