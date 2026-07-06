<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Motion } from 'svelte-motion';

	import { cn } from '$lib/ui/helpers/common';

	type From = 'left' | 'right' | 'top' | 'bottom';

	interface HighlightedTextProps extends HTMLAttributes<HTMLSpanElement> {
		children?: Snippet;
		class?: string;
		backgroundClass?: string;
		textClass?: string;
		from?: From;
		delay?: number;
		triggerOnView?: boolean;
		once?: boolean;
	}

	const springTransition = { type: 'spring', damping: 30, stiffness: 300 };

	const hiddenTransforms: Record<From, { x: string; y: string }> = {
		left: { x: '-100%', y: '0%' },
		right: { x: '100%', y: '0%' },
		top: { x: '0%', y: '-100%' },
		bottom: { x: '0%', y: '100%' }
	};

	const visibleTransform = { x: '0%', y: '0%' };

	let {
		children,
		class: className,
		backgroundClass = 'bg-black dark:bg-white',
		textClass = 'text-white mix-blend-difference',
		from = 'bottom',
		delay = 0,
		triggerOnView = false,
		once = true,
		...props
	}: HighlightedTextProps = $props();

	let element = $state<HTMLSpanElement | null>(null);
	let isVisible = $state(false);

	const hiddenTransform = $derived(hiddenTransforms[from]);
	const backgroundTransform = $derived(isVisible ? visibleTransform : hiddenTransform);

	onMount(() => {
		if (!triggerOnView) {
			isVisible = true;
			return;
		}

		if (!element) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					isVisible = true;
					if (once) {
						observer.disconnect();
					}
				} else if (!once) {
					isVisible = false;
				}
			},
			{ threshold: 0.2 }
		);

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	});
</script>

<span
	bind:this={element}
	class={cn('relative inline-flex overflow-hidden align-baseline', className)}
	{...props}
>
	<Motion
		initial={hiddenTransform}
		animate={backgroundTransform}
		transition={{ ...springTransition, delay }}
		let:motion
	>
		<span
			use:motion
			class={cn('absolute inset-0 -right-[0.18em] -left-[0.15em] z-0', backgroundClass)}
			aria-hidden="true"
		></span>
	</Motion>
	<span class={cn('relative z-10 pr-[0.18em] pl-[0.15em]', textClass)}>
		{@render children?.()}
	</span>
</span>
