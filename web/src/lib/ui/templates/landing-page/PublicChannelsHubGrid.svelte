<script lang="ts">
	import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels';

	import { PUBLIC_CHANNELS_HUB } from '$lib/content/constants/hubs/channels';
	import { PUBLIC_CHANNELS_HUB_SECTION_IDS } from '$lib/content/constants/landing/breadcrumbs';
	import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
	import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
	import { getRootPathPublicSocialAutopilotLanding } from '$lib/area-public/constants/getRootPathPublicSocialAutopilotLanding';
	import { route } from '$lib/utils/path';

	import {
		landingHeroTheme,
		PUBLIC_LANDING_MAIN_HERO_TITLE_CLASS
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import InternalLink from '$lib/ui/links/InternalLink.svelte';
	import PublicSoonBadge from '$lib/ui/components/PublicSoonBadge.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import PublicChannelsLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicChannelsLandingBreadcrumb.svelte';

	type Props = {
		channelsVm: PublicChannelLandingPageViewModel[];
		directoryChannelsVm: PublicChannelLandingPageViewModel[];
	};

	let { channelsVm, directoryChannelsVm }: Props = $props();

	const headingId = 'public-channels-hub-heading';
	const socialHubHeadingId = PUBLIC_CHANNELS_HUB_SECTION_IDS.socialMediaPlatforms;
	const directoryHubHeadingId = PUBLIC_CHANNELS_HUB_SECTION_IDS.directoryLaunchPlatforms;

	// /social-media-management
	const socialAutopilotLandingPath = route(getRootPathPublicSocialAutopilotLanding());
	// /directory-submission-tool
	const directorySubmissionToolPath = route(getRootPathPublicDirectorySubmissionTool());

	function channelCtaLabel(channelVm: PublicChannelLandingPageViewModel): string {
		if (!channelVm.available) {
			return 'Preview coming soon →';
		}
		return channelVm.channelKind === 'directory' ? 'View directory launch →' : 'View scheduler →';
	}
</script>

{#snippet channelCard(channelVm: PublicChannelLandingPageViewModel)}
	{@const href = route(getRootPathPublicChannel(channelVm.slug))}
	<li>
		<a
			href={href}
			class="group flex h-full flex-col gap-4 rounded-2xl border p-6 transition {channelVm.available
				? 'border-base-content/10 bg-base-200/40 hover:border-primary/40 hover:bg-base-200/70'
				: 'border-dashed border-base-content/15 bg-base-200/20 opacity-90 hover:border-base-content/25 hover:bg-base-200/30'}"
		>
			<div class="flex items-start justify-between gap-3">
				<span
					class="grid size-12 place-items-center rounded-xl border border-white/10 bg-base-100/80"
					aria-hidden="true"
				>
					<AbstractIcon
						name={channelVm.icon}
						width="28"
						height="28"
						class="size-7 {channelVm.available ? '' : 'opacity-70'}"
						focusable="false"
					/>
				</span>
				{#if !channelVm.available}
					<PublicSoonBadge label="Coming soon" />
				{/if}
			</div>
			<div class="space-y-2 text-left">
				<h3
					class="text-lg font-bold {channelVm.available
						? 'text-base-content group-hover:text-primary'
						: 'text-base-content/80'}"
				>
					{channelVm.platformLabel}
				</h3>
				<p
					class="text-sm leading-relaxed {channelVm.available
						? 'text-base-content/70'
						: 'text-base-content/60'}"
				>
					{channelVm.hubDescription ?? channelVm.metaDescription}
				</p>
			</div>
			<span
				class="mt-auto text-sm font-semibold {channelVm.available
					? 'text-primary'
					: 'text-base-content/50'}"
			>
				{channelCtaLabel(channelVm)}
			</span>
		</a>
	</li>
{/snippet}

<section class="py-10 md:py-14" aria-labelledby={headingId}>
	<FeaturesSectionHeader
		heroTheme={landingHeroTheme}
		headingId={headingId}
		headingLevel="h1"
		titleClass={PUBLIC_LANDING_MAIN_HERO_TITLE_CLASS}
		title={PUBLIC_CHANNELS_HUB.title}
		description={PUBLIC_CHANNELS_HUB.description}
	>
		{#snippet breadcrumb()}
			<PublicChannelsLandingBreadcrumb />
		{/snippet}
	</FeaturesSectionHeader>

	<div class="mt-12">
		<FeaturesSectionHeader
			heroTheme={landingHeroTheme}
			headingId={socialHubHeadingId}
			headingLevel="h2"
			titleClass="text-2xl font-black tracking-tight text-balance sm:text-3xl"
			title={PUBLIC_CHANNELS_HUB.socialHubTitle}
			description={PUBLIC_CHANNELS_HUB.socialHubDescription}
			subtitle={PUBLIC_CHANNELS_HUB.socialHubSubtitle}
		/>

		<ul
			class="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
			aria-label="Social media platforms you can connect"
		>
			{#each channelsVm as channelVm (channelVm.slug)}
				{@render channelCard(channelVm)}
			{/each}
		</ul>

		<p class="mx-auto mt-8 max-w-5xl text-center">
			<InternalLink
				href={socialAutopilotLandingPath}
				class="text-sm font-semibold text-primary hover:underline"
			>
				{PUBLIC_CHANNELS_HUB.socialHubLearnMoreLinkLabel}
			</InternalLink>
		</p>
	</div>

	<div class="mt-12 border-t border-base-content/10 pt-10 md:mt-14 md:pt-14">
		<FeaturesSectionHeader
			heroTheme={landingHeroTheme}
			headingId={directoryHubHeadingId}
			headingLevel="h2"
			titleClass="text-2xl font-black tracking-tight text-balance sm:text-3xl"
			title={PUBLIC_CHANNELS_HUB.directoryHubTitle}
			description={PUBLIC_CHANNELS_HUB.directoryHubDescription}
			subtitle={PUBLIC_CHANNELS_HUB.directoryHubSubtitle}
		/>

		<ul
			class="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
			aria-label="Directory launch platforms"
		>
			{#each directoryChannelsVm as channelVm (channelVm.slug)}
				{@render channelCard(channelVm)}
			{/each}
		</ul>

		<p class="mx-auto mt-8 max-w-5xl text-center">
			<InternalLink
				href={directorySubmissionToolPath}
				class="text-sm font-semibold text-primary hover:underline"
			>
				{PUBLIC_CHANNELS_HUB.directoryHubLearnMoreLinkLabel}
			</InternalLink>
		</p>
	</div>
</section>
