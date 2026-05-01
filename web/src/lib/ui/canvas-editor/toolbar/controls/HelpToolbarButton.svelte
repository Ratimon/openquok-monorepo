<script lang="ts">
	import type { KonvaCanvasApi } from '$lib/ui/canvas-editor/canvas/konvaCanvasApi';
	import { icons } from '$data/icons';
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
	title="Help (coming soon)"
	aria-label="Help"
>
	<AbstractIcon name={icons.Info.name} class="size-4 opacity-40" width="16" height="16" />
</button>
