<script lang="ts">
	import type { PublicApiCapability, PublicApiPlatformHubCard } from '$lib/content/constants/apis/types';

	import { page } from '$app/state';
	import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
	import {
		getRootPathSocialMediaPostingApiPlatform,
		getRootPathSocialMediaSchedulingApiPlatform
	} from '$lib/area-public/constants/getRootPathPublicApiMarketing';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicLandingSectionHeading from '$lib/ui/templates/landing-page/PublicLandingSectionHeading.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		capability: PublicApiCapability;
		platformsVm: PublicApiPlatformHubCard[];
		activeSlug: string;
		activePlatformLabel: string;
		publicApiProvidersDocsPath: string;
	};

	let { capability, platformsVm, activeSlug, activePlatformLabel, publicApiProvidersDocsPath }: Props =
		$props();

	const headingId = 'public-api-marketing-sibling-grid-heading';
	const sectionTitle = $derived(
		capability === 'posting'
			? 'More social media posting API platforms'
			: 'More social media scheduling API platforms'
	);

	const channelHref = $derived(
		hostedMarketingHref(route(getRootPathPublicChannel(activeSlug)), page.url.origin)
	);
	const providerSettingsHref = $derived(
		hostedMarketingHref(publicApiProvidersDocsPath, page.url.origin)
	);

	function platformHref(slug: string): string {
		const rootPath =
			capability === 'posting'
				? getRootPathSocialMediaPostingApiPlatform(slug)
				: getRootPathSocialMediaSchedulingApiPlatform(slug);
		return route(rootPath);
	}
</script>

<section class="py-12 md:py-16" aria-labelledby={headingId}>
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-3xl space-y-4 text-center">
			<PublicLandingSectionHeading
				headingId={headingId}
				title={sectionTitle}
				heroTheme={landingHeroTheme}
			/>
			<p class="text-base font-medium leading-relaxed text-base-content/70">
				Compare {activePlatformLabel} with other networks, or jump to channel setup and provider
				settings docs.
			</p>
			<div class="flex flex-wrap items-center justify-center gap-3 pt-1 text-sm font-semibold">
				<a class="link link-primary" href={channelHref}>Channel landing</a>
				<span class="text-base-content/30" aria-hidden="true">·</span>
				<a class="link link-primary" href={providerSettingsHref}>Provider settings</a>
			</div>
		</div>

		<ul
			class="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
			aria-label="Sibling API platform pages"
		>
			{#each platformsVm as platform (platform.slug)}
				{#if platform.slug !== activeSlug}
					<li>
						<a
							href={platformHref(platform.slug)}
							class="group flex h-full items-start gap-4 rounded-2xl border border-base-content/10 bg-base-200/40 p-5 transition hover:border-primary/40 hover:bg-base-200/70"
						>
							<span
								class="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-base-100/80"
								aria-hidden="true"
							>
								<AbstractIcon
									name={platform.icon}
									width="22"
									height="22"
									class="size-5"
									focusable="false"
								/>
							</span>
							<div class="space-y-1 text-left">
								<h3 class="font-bold text-base-content">{platform.platformLabel}</h3>
								<p class="text-sm leading-relaxed text-base-content/70">{platform.hubDescription}</p>
							</div>
						</a>
					</li>
				{/if}
			{/each}
			<li>
				<a
					href={route(getRootPathPublicChannel(activeSlug))}
					class="group flex h-full items-start gap-4 rounded-2xl border border-dashed border-base-content/15 bg-base-100 p-5 transition hover:border-primary/40"
				>
					<span class="text-sm font-bold text-base-content">Open {activePlatformLabel} channel page</span>
				</a>
			</li>
		</ul>
	</div>
</section>
