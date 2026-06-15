<script lang="ts">
	import {
		FEATURES_GRID_SOCIAL_ROWS,
		featuresGridPlatformsForRow
	} from '$data/landing-social-platforms';

	import ChannelHoverCard from '$lib/ui/components/channels/ChannelHoverCard.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';

	type LandingHeroTheme = {
		subtitleClass?: string;
		titleHighlightPillClass: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type Props = {
		heroTheme: LandingHeroTheme;
		landingTitle?: string;
		landingDescription?: string;
	};

	let {
		heroTheme,
		landingTitle = '',
		landingDescription = ''
	}: Props = $props();

	const headingId = 'landing-features-grid-heading';
</script>

<section
	class="relative isolate overflow-hidden bg-base-100 py-16 sm:py-20"
	aria-labelledby={headingId}
>
	<div class="container mx-auto px-4">
		<FeaturesSectionHeader
			{heroTheme}
			{headingId}
			title={landingTitle}
			description={landingDescription}
		/>

		<div
			class="relative mx-auto mt-12 max-w-6xl space-y-4 sm:mt-14 sm:space-y-5"
			aria-label="Supported social channels"
		>
			<div
				class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-base-100 to-transparent sm:w-24"
				aria-hidden="true"
			></div>
			<div
				class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-base-100 to-transparent sm:w-24"
				aria-hidden="true"
			></div>
			<div
				class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-base-100 to-transparent sm:h-16"
				aria-hidden="true"
			></div>

			{#each FEATURES_GRID_SOCIAL_ROWS as row, rowIndex (rowIndex)}
				{@const platforms = featuresGridPlatformsForRow(row.platformIds)}
				<div
					class="flex justify-center gap-3 transition-transform duration-500 sm:gap-4 {row.offsetClass}"
				>
					{#each platforms as platform (platform.id)}
						<ChannelHoverCard {platform} />
					{/each}
				</div>
			{/each}
		</div>
	</div>
</section>
