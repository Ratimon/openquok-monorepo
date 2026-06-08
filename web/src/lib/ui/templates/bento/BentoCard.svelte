<script lang="ts">
	import type { Component } from 'svelte';

	import { cn } from '$lib/ui/helpers/common';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		/** Optional heading when the card includes overlay copy. */
		name?: string;
		background?: Component;
		backgroundProps?: Record<string, unknown>;
		Icon?: Component;
		iconName?: string;
		description?: string;
		class?: string;
	};

	let {
		name,
		background: Background,
		backgroundProps = {},
		Icon,
		iconName,
		description,
		class: className = ''
	}: Props = $props();

	const showOverlay = $derived(Boolean(name || description || iconName || Icon));
</script>

<div
	class={cn(
		'group relative flex flex-col justify-between overflow-hidden rounded-xl',
		'border border-base-300 bg-base-100',
		'[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
		'transform-gpu',
		className
	)}
>
	{#if Background}
		<div class={showOverlay ? 'relative min-h-0 flex-1' : 'relative'}>
			<Background {...backgroundProps} />
		</div>
	{/if}

	{#if showOverlay}
		<div
			class="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2"
		>
			{#if iconName}
				<AbstractIcon
					name={iconName}
					width="48"
					height="48"
					focusable="false"
					class="h-12 w-12 origin-left transform-gpu text-base-content/60 transition-all duration-300 ease-in-out group-hover:scale-90"
				/>
			{:else if Icon}
				<Icon
					class="h-12 w-12 origin-left transform-gpu text-base-content/60 transition-all duration-300 ease-in-out group-hover:scale-90"
				/>
			{/if}

			{#if name}
				<h3 class="text-xl font-semibold text-base-content">
					{name}
				</h3>
			{/if}
			{#if description}
				<p class="max-w-lg text-base-content/60">{description}</p>
			{/if}
		</div>

		<div
			class="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-base-content/5"
		></div>
	{/if}
</div>
