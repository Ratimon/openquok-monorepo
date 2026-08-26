<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ComposerMediaTooltip, {
		composeTooltipTriggerClick
	} from '$lib/ui/components/posts/ComposerMediaTooltip.svelte';

	type Props = {
		canUndo: boolean;
		canRedo: boolean;
		disabled?: boolean;
		uploadBusy?: boolean;
		hasTextarea?: boolean;
		buttonClass: string;
		onUndo: () => void;
		onRedo: () => void;
	};

	let {
		canUndo,
		canRedo,
		disabled = false,
		uploadBusy = false,
		hasTextarea = true,
		buttonClass,
		onUndo,
		onRedo
	}: Props = $props();

	const undoDisabled = $derived(disabled || uploadBusy || !hasTextarea || !canUndo);
	const redoDisabled = $derived(disabled || uploadBusy || !hasTextarea || !canRedo);
</script>

<div class="inline-flex items-center gap-1" role="group" aria-label="Undo and redo">
	<ComposerMediaTooltip label="Undo (Ctrl+Z)">
		{#snippet trigger({ props })}
			<button
				{...props}
				type="button"
				class={buttonClass}
				disabled={undoDisabled}
				onclick={composeTooltipTriggerClick(props, onUndo)}
				aria-label="Undo"
			>
				<AbstractIcon name={icons.Undo2.name} class="size-5" width="20" height="20" />
			</button>
		{/snippet}
	</ComposerMediaTooltip>
	<ComposerMediaTooltip label="Redo (Ctrl+Shift+Z)">
		{#snippet trigger({ props })}
			<button
				{...props}
				type="button"
				class={buttonClass}
				disabled={redoDisabled}
				onclick={composeTooltipTriggerClick(props, onRedo)}
				aria-label="Redo"
			>
				<AbstractIcon name={icons.Undo2.name} class="size-5 -scale-x-100" width="20" height="20" />
			</button>
		{/snippet}
	</ComposerMediaTooltip>
</div>
