<!-- https://flo-bit.dev/ui-kit/components/base/ -->
<script lang="ts" module>
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
    import { cn } from "$lib/ui/helpers/common";

	export const buttonVariants = tv({
		base: "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants: {
            variant: {
                primary: "bg-gradient-to-r from-primary via-primary/90 to-primary/70 hover:from-primary/90 hover:via-primary/70 hover:to-primary/70 !rounded-full text-primary-content transition-all duration-300",
				secondary: "bg-secondary text-secondary-content hover:bg-secondary/50",
                warning: "bg-warning text-warning-content hover:bg-warning/90",
                outline:
                    "border-input bg-accent/70 text-neutral hover:bg-accent-content hover:text-accent border",
                ghost: "border border-base-300 bg-base-100 text-sm font-medium text-base-content shadow-sm hover:bg-base-content/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                link: "text-primary underline-offset-4 hover:underline",
				red: 'focus-visible:outline-red-500 border border-red-500/20 hover:bg-red-500/20 bg-red-500/10 text-red-600',
				yellow: 'focus-visible:outline-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20 bg-yellow-500/10 text-yellow-600',
				green:
					'focus-visible:outline-green-500 border border-green-500/20 hover:bg-green-500/20 bg-green-500/10 text-green-600',
				blue: 'focus-visible:outline-blue-500 border border-blue-500/20 hover:bg-blue-500/20 bg-blue-500/10 text-blue-600',
				indigo:
					'focus-visible:outline-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20 bg-indigo-500/10 text-indigo-600',
				violet:
					'focus-visible:outline-violet-500 border border-violet-500/20 hover:bg-violet-500/20 bg-violet-500/10 text-violet-600',
				purple:
					'focus-visible:outline-purple-500 border border-purple-500/20 hover:bg-purple-500/20 bg-purple-500/10 text-purple-600',
				fuchsia: 'focus-visible:outline-fuchsia-500 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-600',
				pink: 'focus-visible:outline-pink-500 border border-pink-500/20 hover:bg-pink-500/20 bg-pink-500/10 text-pink-600',
				rose: 'focus-visible:outline-rose-500 border border-rose-500/20 hover:bg-rose-500/20 bg-rose-500/10 text-rose-600',
				orange:
					'focus-visible:outline-orange-500 border border-orange-500/20 hover:bg-orange-500/20 bg-orange-500/10 text-orange-600',
				amber:
					'focus-visible:outline-amber-500 border border-amber-500/20 hover:bg-amber-500/20 bg-amber-500/10 text-amber-600',
				lime: 'focus-visible:outline-lime-500 border border-lime-500/20 hover:bg-lime-500/20 bg-lime-500/10 text-lime-600',
				emerald:
					'focus-visible:outline-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 bg-emerald-500/10 text-emerald-600',
				teal: 'focus-visible:outline-teal-500 border border-teal-500/20 hover:bg-teal-500/20 bg-teal-500/10 text-teal-600',
				cyan: 'focus-visible:outline-cyan-500 border border-cyan-500/20 hover:bg-cyan-500/20 bg-cyan-500/10 text-cyan-600',
				sky: 'focus-visible:outline-sky-500 border border-sky-500/20 hover:bg-sky-500/20 bg-sky-500/10 text-sky-600'
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 rounded-md px-8",
				xl: "h-16 rounded-md px-6",
				block: "!h-24 min-h-24 rounded-md px-8 w-full",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
			checkCurrent?: boolean;
			preload?: 'hover' | 'tap' | 'off' | 'intent';
		};
</script>

<script lang="ts">
	import { page } from '$app/state';

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
	}: ButtonProps = $props();

	const anchorRest = $derived.by(() => {
		const copy = { ...rest };
		delete (copy as Record<string, unknown>)['data-sveltekit-preload-data'];
		return copy;
	});
</script>

{#if href}
	<a
		bind:this={ref}
		data-current={checkCurrent && page.url.pathname === href}
		class={cn(buttonVariants({ variant, size }), className)}
		{href}
		data-sveltekit-preload-data={preload}
		{...anchorRest}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{...rest}
	>
		{@render children?.()}
	</button>
{/if}