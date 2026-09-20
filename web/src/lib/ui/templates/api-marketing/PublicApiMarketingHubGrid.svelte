<script lang="ts">
	import type { PublicApiCapability, PublicApiPlatformHubCard } from '$lib/content/constants/apis/types';

	import {
		getRootPathSocialMediaPostingApiPlatform,
		getRootPathSocialMediaSchedulingApiPlatform
	} from '$lib/area-public/constants/getRootPathPublicApiMarketing';
	import { route } from '$lib/utils/path';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicLandingSectionTitle from '$lib/ui/templates/landing-page/PublicLandingSectionTitle.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		capability: PublicApiCapability;
		platformsVm: PublicApiPlatformHubCard[];
	};

	let { capability, platformsVm }: Props = $props();

	const headingId = 'public-api-marketing-hub-grid-heading';
	const sectionTitle = $derived(
		capability === 'posting'
			? 'Explore social media posting API by platform'
			: 'Explore social media scheduling API by platform'
	);

	function platformHref(slug: string): string {
		const rootPath =
			capability === 'posting'
				? getRootPathSocialMediaPostingApiPlatform(slug)
				: getRootPathSocialMediaSchedulingApiPlatform(slug);
		return route(rootPath);
	}
</script>

<section class="py-10 md:py-14" aria-labelledby={headingId}>
	<div class="container mx-auto max-w-3xl space-y-4 px-4 text-center">
		<PublicLandingSectionTitle
			headingId={headingId}
			title={sectionTitle}
			heroTheme={landingHeroTheme}
		/>
		<p class="text-base font-medium leading-relaxed text-pretty text-base-content/70">
			Open platform pages for request and response examples, provider settings, and Payload Wizard
			samples.
		</p>
	</div>

	<ul
		class="mx-auto mt-10 grid max-w-5xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3"
		aria-label="Supported API platforms"
	>
		{#each platformsVm as platform (platform.slug)}
			<li>
				<a
					href={platformHref(platform.slug)}
					class="group flex h-full flex-col gap-4 rounded-2xl border border-base-content/10 bg-base-200/40 p-6 transition hover:border-primary/40 hover:bg-base-200/70"
				>
					<span
						class="grid size-12 place-items-center rounded-xl border border-white/10 bg-base-100/80"
						aria-hidden="true"
					>
						<AbstractIcon
							name={platform.icon}
							width="28"
							height="28"
							class="size-7"
							focusable="false"
						/>
					</span>
					<div class="space-y-2 text-left">
						<h3 class="text-lg font-bold text-base-content">{platform.platformLabel}</h3>
						<p class="text-sm leading-relaxed text-base-content/70">{platform.hubDescription}</p>
					</div>
				</a>
			</li>
		{/each}
	</ul>
</section>
