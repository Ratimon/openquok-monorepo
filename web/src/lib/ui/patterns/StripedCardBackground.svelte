<script lang="ts">
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';

	import { cn } from '$lib/ui/helpers/common';

	export type StripedCardTone = 'emerald' | 'amber';

	type Props = {
		direction?: 'left' | 'right';
		width?: number;
		height?: number;
		tone?: StripedCardTone;
	};

	let { direction = 'left', width = 8, height = 8, tone = 'emerald' }: Props = $props();

	const toneClasses = $derived(
		tone === 'amber'
			? {
					gradient: 'from-amber-500/20 via-amber-400/10 to-transparent',
					stripe: 'text-amber-500/35'
				}
			: {
					gradient: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
					stripe: 'text-emerald-500/35'
				}
	);
</script>

<div
	class="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,white,transparent)]"
	aria-hidden="true"
>
	<div
		class={cn(
			'absolute inset-0 bg-gradient-to-br opacity-100',
			'[mask-image:radial-gradient(ellipse_at_top,white,transparent)]',
			toneClasses.gradient
		)}
	>
		<StripedPattern
			{direction}
			{width}
			{height}
			class={cn(
				'absolute inset-0 h-full w-full stroke-[1]',
				toneClasses.stripe,
				'[mask-image:radial-gradient(ellipse_at_center,white,transparent)]'
			)}
		/>
	</div>
</div>
