<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconName } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

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

	const toneStyles = $derived.by(() => {
		switch (tone) {
			case 'accent':
				return {
					container: 'border-primary/40 bg-primary/5',
					icon: 'text-primary'
				};
			case 'upgrade':
				return {
					container: 'border-secondary/40 bg-secondary/5',
					icon: 'text-secondary'
				};
			default:
				return {
					container: 'border-info/40 bg-info/5',
					icon: 'text-info'
				};
		}
	});
</script>

<div
	role="status"
	class={cn(
		'flex flex-col gap-3 rounded-lg border px-4 py-3 text-sm text-base-content sm:flex-row sm:items-center sm:justify-between',
		toneStyles.container
	)}
>
	<div class="flex min-w-0 flex-1 items-start gap-3">
		<AbstractIcon
			name={iconName}
			class={cn('mt-0.5 size-5 shrink-0', toneStyles.icon)}
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
				class="btn-square size-8 items-center justify-center text-base-content/60 hover:text-base-content"
				aria-label="Dismiss notice"
				onclick={() => onDismiss?.()}
			>
				<AbstractIcon
					name={icons.X2.name}
					class="size-6 shrink-0"
					width="16"
					height="16"
				/>
			</Button>
		{/if}
	</div>
</div>
