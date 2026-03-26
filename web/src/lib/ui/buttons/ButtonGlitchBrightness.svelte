<script lang="ts" module>
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
	import { cn } from "$lib/ui/helpers/common";
	import { buttonVariants } from './Button.svelte';

	export type ButtonGlitchBrightnessProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: VariantProps<typeof buttonVariants>['variant'];
			size?: VariantProps<typeof buttonVariants>['size'];
			checkCurrent?: boolean;
			preload?: 'hover' | 'tap' | 'off' | 'intent';
		};
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';

	let {
		class: className,
		variant = 'primary',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		children,
		checkCurrent = true,
		preload = 'tap',
		...rest
	}: ButtonGlitchBrightnessProps = $props();

	// Strip data-sveltekit-preload-data so `preload` controls the attribute; recompute when `rest` updates
	const anchorRest = $derived.by(() => {
		const { 'data-sveltekit-preload-data': _, ...r } = rest as Record<string, unknown>;
		return r;
	});

	function handleAnchorClick(event: MouseEvent) {
		if (!href) return;
		
		// Check if href is a hash link (starts with #)
		if (href.startsWith('#')) {
			event.preventDefault();
			// Handle scrolling to hash link
			const elementId = href.slice(1); // Remove the '#'
			const anchor = document.getElementById(elementId);
			
			if (anchor) {
				anchor.scrollIntoView({ behavior: "smooth" });
				// Update the URL hash using SvelteKit's pushState
				const newUrl = new URL(window.location.href);
				newUrl.hash = href;
				pushState(newUrl, {});
				// Dispatch hashchange event so listeners can react
				window.dispatchEvent(new HashChangeEvent('hashchange'));
			}
		}
	}
</script>

{#if href}
	<a
		bind:this={ref}
		data-current={checkCurrent && page.url.pathname === href}
		class={cn("group relative inline-flex items-center gap-1 overflow-hidden", buttonVariants({ variant, size }), className)}
		{href}
		data-sveltekit-preload-data={preload}
		onclick={handleAnchorClick}
		{...anchorRest}
	>
		<!-- Text Glitch  -->
		<div class="relative overflow-hidden z-10">
			<span class="invisible">{@render children?.()}</span>
			<span
				class="absolute left-0 top-0 transition-transform duration-500 ease-in-out hover:duration-300 group-hover:-translate-y-full"
			>
				{@render children?.()}
			</span>
			<span
				class="absolute left-0 top-0 translate-y-full transition-transform duration-500 ease-in-out hover:duration-300 group-hover:translate-y-0"
			>
				{@render children?.()}
			</span>
		</div>
		<!-- Brightness  -->
		<div
			class="absolute inset-0 flex h-full w-full animate-brightness justify-center pointer-events-none"
		>
			<div class="relative h-full w-8 bg-white/40 blur"></div>
		</div>
	</a>
{:else}
	<button
		bind:this={ref}
		class={cn("group relative inline-flex items-center gap-1 overflow-hidden", buttonVariants({ variant, size }), className)}
		{type}
		{...rest}
	>
		<!-- Text Glitch  -->
		<div class="relative overflow-hidden z-10">
			<span class="invisible">{@render children?.()}</span>
			<span
				class="absolute left-0 top-0 transition-transform duration-500 ease-in-out hover:duration-300 group-hover:-translate-y-full"
			>
				{@render children?.()}
			</span>
			<span
				class="absolute left-0 top-0 translate-y-full transition-transform duration-500 ease-in-out hover:duration-300 group-hover:translate-y-0"
			>
				{@render children?.()}
			</span>
		</div>
		<!-- Brightness  -->
		<div
			class="absolute inset-0 flex h-full w-full animate-brightness justify-center pointer-events-none"
		>
			<div class="relative h-full w-8 bg-white/40 blur"></div>
		</div>
	</button>
{/if}
  