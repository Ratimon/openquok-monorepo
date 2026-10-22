<script lang="ts">
	import type { LandingSocialPlatform } from '$data/landing-social-platforms';

	import { cn } from '$lib/ui/helpers/common';
	import { socialProviderDisplayLabel } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		platform: LandingSocialPlatform;
		href?: string;
	};

	let { platform, href }: Props = $props();

	const label = $derived(platform.label ?? socialProviderDisplayLabel(platform.id));

	const tileClass = $derived(
		cn(
			'group/channel relative flex size-[4.25rem] shrink-0 items-center justify-center rounded-2xl',
			'border border-white/10 bg-violet-950/35 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]',
			'transition duration-300 hover:border-violet-400/35 hover:bg-violet-900/45 hover:shadow-[0_8px_32px_rgba(139,92,246,0.18)]',
			href &&
				'pointer-events-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
		)
	);

	const tileTag = $derived(href ? 'a' : 'div');
	const tileAriaLabel = $derived(href ? `${label} channel` : label);
</script>

<svelte:element
	this={tileTag}
	{href}
	class={tileClass}
	aria-label={tileAriaLabel}
>
	<div
		class="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-violet-500/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/channel:opacity-100"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute top-1/2 left-0 h-0 w-0.5 -translate-y-1/2 rounded-full bg-violet-400 opacity-0 transition-all duration-300 group-hover/channel:h-8 group-hover/channel:opacity-100"
		aria-hidden="true"
	></div>
	<span
		class={cn(
			'relative z-10 grid place-items-center rounded-xl',
			platform.containerClass ?? 'bg-transparent p-0'
		)}
	>
		<AbstractIcon
			name={platform.icon}
			width={platform.iconWidth ?? '28'}
			height={platform.iconHeight ?? '28'}
			class={platform.iconClass ?? 'size-7'}
			focusable="false"
		/>
	</span>
</svelte:element>
