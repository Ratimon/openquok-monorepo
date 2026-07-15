<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import { icons } from '$data/icons';
	import {
		buttonVariants,
		type ButtonSize,
		type ButtonVariant
	} from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	import type { ChatStatus } from '../context/types.js';

	type SubmitClickEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	interface Props extends Omit<HTMLButtonAttributes, 'type' | 'onclick' | 'aria-label'> {
		class?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		status?: ChatStatus;
		onStop?: () => void;
		ref?: HTMLButtonElement | null;
		onclick?: (event: SubmitClickEvent) => void;
		children?: import('svelte').Snippet;
	}

	let {
		class: className,
		ref = $bindable(null),
		variant = 'primary',
		size = 'icon',
		status = 'ready',
		onStop,
		onclick,
		children,
		...props
	}: Props = $props();

	let isGenerating = $derived(status === 'submitted' || status === 'streaming');

	let iconName = $derived.by(() => {
		if (status === 'submitted') return icons.Loader.name;
		if (status === 'streaming') return icons.Square.name;
		if (status === 'error') return icons.X2.name;
		return icons.Send.name;
	});

	let buttonType = $derived.by((): 'button' | 'submit' => {
		return isGenerating ? 'button' : 'submit';
	});

	let ariaLabel = $derived.by(() => {
		return isGenerating ? 'Stop' : 'Submit';
	});

	let iconClass = $derived.by(() => {
		if (status === 'submitted') {
			return 'size-4 animate-spin';
		}
		return 'size-4';
	});

	let handleClick = (event: SubmitClickEvent) => {
		if (isGenerating) {
			event.preventDefault();
			onStop?.();
			return;
		}

		onclick?.(event);
	};
</script>

<button
	bind:this={ref}
	aria-label={ariaLabel}
	class={cn(buttonVariants({ variant, size }), 'gap-1.5 rounded-lg', className)}
	data-slot="button"
	type={buttonType}
	onclick={handleClick}
	{...props}
>
	{#if children}
		{@render children()}
	{:else}
		<AbstractIcon name={iconName} class={iconClass} width="16" height="16" aria-hidden="true" />
	{/if}
</button>
