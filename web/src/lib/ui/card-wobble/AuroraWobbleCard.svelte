<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/ui/helpers/common';

	type Props = {
		containerClass?: string;
		class?: string;
		children?: Snippet;
	};

	let { containerClass = '', class: className = '', children }: Props = $props();

	let mousePosition = $state({ x: 0, y: 0 });
	let isHovering = $state(false);

	const transformStyle = $derived(
		isHovering
			? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
			: 'translate3d(0px, 0px, 0) scale3d(1, 1, 1)'
	);

	const innerTransformStyle = $derived(
		isHovering
			? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
			: 'translate3d(0px, 0px, 0) scale3d(1, 1, 1)'
	);

	function handleMouseMove(event: MouseEvent) {
		const { clientX, clientY } = event;
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = (clientX - (rect.left + rect.width / 2)) / 20;
		const y = (clientY - (rect.top + rect.height / 2)) / 20;
		mousePosition = { x, y };
	}

	function handleMouseLeave() {
		isHovering = false;
		mousePosition = { x: 0, y: 0 };
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
	onmousemove={handleMouseMove}
	onmouseenter={() => (isHovering = true)}
	onmouseleave={handleMouseLeave}
	style="transform: {transformStyle}; transition: transform 0.1s ease-out;"
	class={cn('relative mx-auto w-full overflow-hidden rounded-2xl bg-base-100', containerClass)}
>
	<div
		class="relative h-full overflow-hidden rounded-2xl"
		style="box-shadow: 0 10px 32px rgba(34, 42, 53, 0.12), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 4px 6px rgba(34, 42, 53, 0.08), 0 24px 108px rgba(47, 48, 55, 0.10);"
	>
		<div class="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
			<div
				class={cn(
					`[--stripe:repeating-linear-gradient(100deg,var(--color-base-300)_0%,var(--color-base-300)_7%,transparent_10%,transparent_12%,var(--color-base-300)_16%)]
					[--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
					[background-image:var(--stripe),var(--aurora)]
					[background-size:300%,_200%]
					[background-position:50%_50%,50%_50%]
					absolute -inset-[10px] opacity-50 blur-[10px] will-change-transform
					after:pointer-events-none after:absolute after:inset-0 after:[background-image:var(--stripe),var(--aurora)]
					after:[background-size:200%,_100%] after:animate-aurora after:[background-attachment:fixed]
					after:mix-blend-difference after:content-['']`,
					`[mask-image:radial-gradient(ellipse_at_50%_0%,black_15%,var(--transparent)_75%)]`
				)}
			></div>
			<div
				class="absolute inset-x-0 -top-16 z-[1] mx-auto h-40 w-full rounded-full bg-gradient-to-b from-primary/25 via-secondary/15 to-transparent blur-3xl"
			></div>
		</div>

		<div
			class="pointer-events-none absolute inset-0 rounded-2xl bg-neutral-950/70"
			aria-hidden="true"
		></div>

		<div
			class="pointer-events-none absolute inset-0 rounded-2xl [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.12),rgba(255,255,255,0))]"
			aria-hidden="true"
		></div>

		<div
			style="transform: {innerTransformStyle}; transition: transform 0.1s ease-out;"
			class={cn('relative z-10 h-full', className)}
		>
			{@render children?.()}
		</div>
	</div>
</section>
