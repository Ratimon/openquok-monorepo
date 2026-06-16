<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';

	type BannerCtaVariant = 'accent' | 'inverted';

	type Props = {
		ctaText: string;
		ctaHref: string;
		variant?: BannerCtaVariant;
		class?: string;
	};

	let { ctaText, ctaHref, variant = 'accent', class: className }: Props = $props();

	const variantClass = $derived(
		variant === 'inverted'
			? 'bg-white text-neutral-950 hover:bg-white/90'
			: 'bg-accent text-accent-content hover:bg-accent/90'
	);
</script>

<a
	href={ctaHref}
	data-sveltekit-preload-data="off"
	class={cn(
		'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold transition-colors sm:px-8 sm:text-base',
		variantClass,
		className
	)}
>
	{ctaText}
	<AbstractIcon name={icons.ChevronRight.name} class="size-4 shrink-0" width="16" height="16" />
	<AbstractIcon
		name={icons.ChevronRight.name}
		class="-ms-2 size-4 shrink-0"
		width="16"
		height="16"
		aria-hidden="true"
	/>
</a>
