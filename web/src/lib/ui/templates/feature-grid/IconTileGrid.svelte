<script lang="ts">
	import type { LandingSocialPlatform } from '$data/landing-social-platforms';
	import {
		FEATURES_GRID_SOCIAL_ROWS,
		resolveLandingSocialPlatformChannelSlug
	} from '$data/landing-social-platforms';
	import {
		FEATURES_GRID_DIRECTORY_ROWS,
		isLandingDirectoryPlatformId,
		resolveLandingDirectoryPlatformChannelSlug
	} from '$data/landing-directory-platforms';
	import { resolveFeaturesGridPlatforms } from '$data/resolveFeaturesGridPlatforms';
	import { FEATURES_GRID_HOME_ROWS } from '$data/landing-home-features-grid';
	import type { FeaturesGridRowConfig } from '$data/landing-features-grid-types';

	import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
	import { route } from '$lib/utils/path';

	import ChannelHoverCard from '$lib/ui/components/channels/ChannelHoverCard.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';

	type LandingHeroTheme = {
		subtitleClass?: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type IconTileGridVariant = 'social' | 'directory' | 'home';

	type Props = {
		heroTheme: LandingHeroTheme;
		landingTitle?: string;
		landingDescription?: string;
		variant?: IconTileGridVariant;
		/** When true, each tile links to `/channels/{slug}` (social or directory variant). */
		linkTiles?: boolean;
		headingId?: string;
		gridAriaLabel?: string;
	};

	let {
		heroTheme,
		landingTitle = '',
		landingDescription = '',
		variant = 'social',
		linkTiles = false,
		headingId = 'landing-features-grid-heading',
		gridAriaLabel = variant === 'directory'
			? 'Supported directory launch platforms'
			: variant === 'home'
				? 'Supported social and directory channels'
				: 'Supported social channels'
	}: Props = $props();

	const rows: FeaturesGridRowConfig[] = $derived.by(() => {
		if (variant === 'directory') return FEATURES_GRID_DIRECTORY_ROWS;
		if (variant === 'home') return FEATURES_GRID_HOME_ROWS;
		return FEATURES_GRID_SOCIAL_ROWS;
	});

	function tileHref(platform: LandingSocialPlatform): string | undefined {
		if (!linkTiles) return undefined;
		const slug = isLandingDirectoryPlatformId(platform.id)
			? resolveLandingDirectoryPlatformChannelSlug(platform)
			: resolveLandingSocialPlatformChannelSlug(platform);
		return route(getRootPathPublicChannel(slug));
	}

	const platformsForRow = resolveFeaturesGridPlatforms;
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
			class="relative mx-auto mt-12 max-w-5xl space-y-5 sm:mt-14 sm:space-y-6"
			aria-label={gridAriaLabel}
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
				class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-base-100/90 to-transparent sm:h-8"
				aria-hidden="true"
			></div>

			{#each rows as row, rowIndex (`${rowIndex}-${row.platformIds.join(',')}`)}
				{@const platforms = platformsForRow(row.platformIds)}
				<div
					class="flex flex-wrap justify-center gap-3 transition-transform duration-500 sm:gap-3.5 md:flex-nowrap md:gap-4 {row.offsetClass}"
				>
					{#each platforms as platform (platform.id)}
						<ChannelHoverCard {platform} href={tileHref(platform)} />
					{/each}
				</div>
			{/each}
		</div>
	</div>
</section>
