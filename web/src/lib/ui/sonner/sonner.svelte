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
	  Soft guards only. Do not reset `inset-inline` or `translate` on the toaster —
	  those map onto `left` / individual transform and wipe Sonner's `top-center`
	  (`left: 50%; transform: translateX(-50%)`), pinning toasts to the top-left.
	*/
	:global([data-sonner-toaster].sonner-toaster) {
		bottom: auto !important;
		height: auto !important;
		max-height: none !important;
		background: transparent !important;
	}

	/* Desktop center only — Sonner drops translateX under 600px and uses left/right offsets. */
	@media (min-width: 601px) {
		:global([data-sonner-toaster][data-x-position='center'].sonner-toaster) {
			left: 50% !important;
			right: auto !important;
			transform: translateX(-50%) !important;
		}
	}

	:global([data-sonner-toaster][data-y-position='top'].sonner-toaster) {
		bottom: auto !important;
	}

	:global([data-sonner-toaster][data-y-position='bottom'].sonner-toaster) {
		top: auto !important;
	}

	:global([data-sonner-toast][data-styled='true']) {
		flex: none !important;
		width: var(--width, 356px) !important;
		min-width: min(356px, calc(100vw - 2rem));
	}

	/* Keep title/icon readable even if a parent utility fights Sonner colors. */
	:global([data-sonner-toast][data-styled='true'] [data-content]),
	:global([data-sonner-toast][data-styled='true'] [data-title]),
	:global([data-sonner-toast][data-styled='true'] [data-description]),
	:global([data-sonner-toast][data-styled='true'] [data-icon]) {
		color: inherit !important;
		opacity: 1 !important;
		visibility: visible !important;
	}

	:global([data-sonner-toast][data-styled='true'] [data-title]) {
		font-size: 13px !important;
		line-height: 1.5 !important;
		font-weight: 500 !important;
	}
</style>
