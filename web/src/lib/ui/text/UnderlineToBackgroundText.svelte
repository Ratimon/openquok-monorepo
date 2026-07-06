<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import { Motion } from 'svelte-motion';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		children?: Snippet;
		class?: string;
		targetTextColor?: string;
		underlineHeightRatio?: number;
		underlinePaddingRatio?: number;
	};

	const springTransition = { type: 'spring', damping: 30, stiffness: 300 };

	let {
		children,
		class: className,
		targetTextColor = '#fef',
		underlineHeightRatio = 0.1,
		underlinePaddingRatio = 0.01,
		...restProps
	}: Props = $props();

	let element = $state<HTMLElement | null>(null);
	let baseTextColor = $state('currentColor');
	let hovered = $state(false);

	function updateUnderlineStyles() {
		if (!element) {
			return;
		}

		const fontSize = parseFloat(getComputedStyle(element).fontSize);
		const computedColor = getComputedStyle(element).color;

		if (Number.isNaN(fontSize)) {
			return;
		}

		baseTextColor = computedColor;
		element.style.setProperty('--underline-height', `${fontSize * underlineHeightRatio}px`);
		element.style.setProperty('--underline-padding', `${fontSize * underlinePaddingRatio}px`);
	}

	$effect(() => {
		if (!element) {
			return;
		}

		underlineHeightRatio;
		underlinePaddingRatio;

		untrack(() => {
			updateUnderlineStyles();
		});
	});

	onMount(() => {
		if (!element) {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			updateUnderlineStyles();
		});

		resizeObserver.observe(element);
		updateUnderlineStyles();

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<span
	bind:this={element}
	class={cn('relative isolate inline-block cursor-default text-current', className)}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	{...restProps}
>
	<Motion
		animate={{
			height: hovered ? '100%' : 'var(--underline-height, 0px)'
		}}
		transition={springTransition}
		let:motion
	>
		<div
			use:motion
			class="pointer-events-none absolute inset-x-0 z-0"
			style="
				bottom: calc(-1 * var(--underline-padding, 0px));
				background-color: {baseTextColor};
				will-change: height;
			"
			aria-hidden="true"
		></div>
	</Motion>

	<Motion
		animate={{ color: hovered ? targetTextColor : baseTextColor }}
		transition={springTransition}
		let:motion
	>
		<span use:motion class="relative z-[1] inline-block [will-change:color]">
			{@render children?.()}
		</span>
	</Motion>
</span>
