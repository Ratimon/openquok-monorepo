<script lang="ts">
	import type { IconName } from '$data/icons';

	import AuroraWobbleCard from '$lib/ui/card-wobble/AuroraWobbleCard.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import LandingHeroHighlightedText from '$lib/ui/texts/LandingHeroHighlightedText.svelte';

	export type AudienceCard = {
		iconName: IconName;
		iconClass: string;
		title: string;
		description: string;
		containerClass: string;
	};

	type LandingHeroTitleSegment = { text: string; highlight: boolean };

	type LandingHeroTheme = {
		subtitleClass: string;
		descriptionClass: string;
		ctaButtonClass: string;
		imageClass: string;
		titlePartClass: (index: number, total: number) => string;
		parseLandingHeroTitlePartSegments: (text: string) => LandingHeroTitleSegment[];
		landingHeroTitlePartHasHighlight: (segments: LandingHeroTitleSegment[]) => boolean;
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		landingSubtitle: string;
		landingTitle: string;
		cards: AudienceCard[];
	};

	let { heroTheme, landingSubtitle, landingTitle, cards }: Props = $props();

	const headingId = 'landing-audience-heading';

	const cardGridClass = $derived(
		cards.length === 4
			? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'
			: 'grid grid-cols-1 gap-4 md:grid-cols-3'
	);

	const titleParts = $derived(
		landingTitle
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0)
	);
</script>

<section class="container mx-auto px-4 pb-16 sm:pb-20" aria-labelledby={headingId}>
	<div class="mx-auto max-w-7xl space-y-8 sm:space-y-10">
		<div class="space-y-6 text-center">
			{#if landingSubtitle}
				<p class={heroTheme.subtitleClass}>
					{landingSubtitle}
				</p>
			{/if}

			{#if landingTitle}
				<h2
					id={headingId}
					class="text-2xl font-black tracking-tight text-balance sm:text-3xl lg:text-4xl"
				>
					{#each titleParts as part, index (index)}
						{@const partClass = heroTheme.titlePartClass(index, titleParts.length)}
						{@const segments = heroTheme.parseLandingHeroTitlePartSegments(part)}
						{@const layoutClass =
							titleParts.length >= 3 ? 'block' : index > 0 ? 'block sm:inline' : ''}
						{#if heroTheme.landingHeroTitlePartHasHighlight(segments)}
							<span class={layoutClass}>
								{#each segments as seg, segmentIndex (segmentIndex)}
									{#if seg.highlight}
										<LandingHeroHighlightedText>{seg.text}</LandingHeroHighlightedText>
									{:else}
										<span class={partClass}>{seg.text}</span>
									{/if}
								{/each}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
							</span>
						{:else}
							<span class="{partClass} {layoutClass}">
								{part}{#if titleParts.length < 3 && index < titleParts.length - 1},{/if}
							</span>
						{/if}
					{/each}
				</h2>
			{/if}
		</div>

		<div class={cardGridClass}>
			{#each cards as card (card.title)}
				<AuroraWobbleCard
					containerClass={card.containerClass}
					class="flex h-full flex-col gap-4 px-6 py-10 sm:px-8 sm:py-12"
				>
					<AbstractIcon
						name={card.iconName}
						class="h-14 w-14 shrink-0 {card.iconClass}"
						width="56"
						height="56"
					/>
					<h3 class="text-left text-2xl font-semibold tracking-tight text-white md:text-3xl">
						{card.title}
					</h3>
					<p class="max-w-[26rem] text-left text-base/6 text-neutral-200">
						{card.description}
					</p>
				</AuroraWobbleCard>
			{/each}
		</div>
	</div>
</section>
