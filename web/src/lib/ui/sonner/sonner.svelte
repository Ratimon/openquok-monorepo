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

	const primaryVarStyle =
		'--normal-bg: var(--color-primary); --normal-text: var(--color-primary-content); --normal-border: var(--color-primary); --normal-bg-hover: color-mix(in oklch, var(--color-primary) 88%, black); --normal-border-hover: color-mix(in oklch, var(--color-primary) 75%, black);';

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
	class={cn('toaster group z-[100]', className)}
	style={primaryVarStyle}
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
