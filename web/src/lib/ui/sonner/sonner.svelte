<script lang="ts">
	import { browser } from '$app/environment';
	import IconPlaceholder from '$lib/ui/icons/icon-placeholder.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';

	let {
		toastOptions: userToastOptions,
		position = 'top-center',
		class: className = '',
		...restProps
	}: SonnerProps = $props();

	const toastOptions = $derived({
		...userToastOptions,
		descriptionClass: cn('!text-inherit opacity-90', userToastOptions?.descriptionClass)
	});

	/** Match surface tokens — avoid painting every toast with primary (reads as a giant green slab if layout breaks). */
	const surfaceVarStyle =
		'--normal-bg: var(--color-base-200); --normal-text: var(--color-base-content); --normal-border: color-mix(in oklab, var(--color-base-content) 18%, transparent); --normal-bg-hover: color-mix(in oklch, var(--color-base-200) 92%, var(--color-base-content)); --normal-border-hover: color-mix(in oklab, var(--color-base-content) 28%, transparent);';

	/** DaisyUI themes: `forest` is dark; `light` is light. */
	let theme = $state<'light' | 'dark'>('dark');

	$effect(() => {
		if (!browser) return;
		const root = document.documentElement;
		const sync = () => {
			const dataTheme = root.getAttribute('data-theme') ?? 'forest';
			theme = dataTheme === 'light' ? 'light' : 'dark';
		};
		sync();
		const mo = new MutationObserver(sync);
		mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
		return () => mo.disconnect();
	});
</script>

<Sonner
	{...restProps}
	{theme}
	{position}
	{toastOptions}
	richColors
	closeButton
	duration={4000}
	class={cn('sonner-toaster group pointer-events-auto z-[100]', className)}
	style={surfaceVarStyle}
>
	{#snippet loadingIcon()}
		<IconPlaceholder name="LoaderCircle" class="size-4 animate-spin" />
	{/snippet}
	{#snippet successIcon()}
		<IconPlaceholder name="CircleCheck" class="size-4" />
	{/snippet}
	{#snippet errorIcon()}
		<IconPlaceholder name="CircleX" class="size-4" />
	{/snippet}
	{#snippet infoIcon()}
		<IconPlaceholder name="Info" class="size-4" />
	{/snippet}
	{#snippet warningIcon()}
		<IconPlaceholder name="CircleAlert" class="size-4" />
	{/snippet}
</Sonner>

<style>
	/*
	  Guard against toast-library CSS (e.g. DaisyUI `.toast`) stretching the Sonner viewport:
	  `top` + `bottom` + `display:flex` makes a full-height hit target that pauses auto-dismiss on hover.
	*/
	:global([data-sonner-toaster].sonner-toaster) {
		bottom: unset !important;
		height: unset !important;
		max-height: none !important;
		display: block !important;
		flex-direction: unset !important;
		gap: unset !important;
		translate: none !important;
		inset-inline: unset !important;
		background: transparent !important;
	}

	:global([data-sonner-toaster][data-y-position='top'].sonner-toaster) {
		bottom: unset !important;
	}

	:global([data-sonner-toaster][data-y-position='bottom'].sonner-toaster) {
		top: unset !important;
	}

	:global([data-sonner-toast][data-styled='true']) {
		flex: none !important;
		align-self: flex-start !important;
	}
</style>
