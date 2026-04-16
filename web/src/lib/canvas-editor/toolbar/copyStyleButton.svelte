<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/canvas-editor/konvaCanvasApi';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		disabled?: boolean;
		canvasApi: KonvaCanvasApi | null;
	};

	let { disabled = false, canvasApi }: Props = $props();
</script>

<button
	type="button"
	class="btn btn-ghost btn-xs btn-square"
	disabled={disabled || !canvasApi}
	title="Copy style (coming soon)"
	aria-label="Copy style"
>
	<AbstractIcon name={icons.ListPlus.name} class="size-4 opacity-40" width="16" height="16" />
</button>
