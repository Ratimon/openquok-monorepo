<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconName } from '$data/icons';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type NoticeTone = 'neutral' | 'accent' | 'upgrade';

	type Props = {
		iconName: IconName;
		tone?: NoticeTone;
		dismissible?: boolean;
		onDismiss?: () => void;
		children: Snippet;
		actions?: Snippet;
	};

	let {
		iconName,
		tone = 'neutral',
		dismissible = true,
		onDismiss,
		children,
		actions
	}: Props = $props();

	const toneClass = $derived.by(() => {
		switch (tone) {
			case 'accent':
				return 'border-primary/25 bg-primary/5';
			case 'upgrade':
				return 'border-secondary/30 bg-secondary/10';
			default:
				return 'border-base-300 bg-base-200/60';
		}
	});
</script>

<div
	role="status"
	class={cn(
		'flex flex-col gap-3 rounded-lg border px-4 py-3 text-sm text-base-content sm:flex-row sm:items-center sm:justify-between',
		toneClass
	)}
>
	<div class="flex min-w-0 flex-1 items-start gap-3">
		<AbstractIcon
			name={iconName}
			class="mt-0.5 size-5 shrink-0 text-base-content/70"
			width="20"
			height="20"
			focusable="false"
		/>
		<div class="min-w-0 leading-relaxed">
			{@render children()}
		</div>
	</div>

	<div class="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
		{#if actions}
			{@render actions()}
		{/if}
		{#if dismissible}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				class="btn-square min-h-8 h-8 w-8 text-base-content/60 hover:text-base-content"
				aria-label="Dismiss notice"
				onclick={() => onDismiss?.()}
			>
				<AbstractIcon name={icons.X2.name} class="size-4" width="16" height="16" />
			</Button>
		{/if}
	</div>
</div>
