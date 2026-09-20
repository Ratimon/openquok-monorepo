<script lang="ts">
	import type { IconName } from '$data/icons';
	import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import AuroraWobbleCard from '$lib/ui/card-wobble/AuroraWobbleCard.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicLandingSectionHeading from '$lib/ui/templates/landing-page/PublicLandingSectionHeading.svelte';

	export type AudienceCard = {
		iconName: IconName;
		iconClass: string;
		title: string;
		description: string;
		containerClass: string;
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
				<PublicLandingSectionHeading
					{headingId}
					title={landingTitle}
					{heroTheme}
					commaSeparated={true}
					gradientMode="part"
				/>
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
