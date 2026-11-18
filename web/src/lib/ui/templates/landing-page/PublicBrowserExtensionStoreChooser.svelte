<script lang="ts">
	import type { PublicBrowserExtensionStoreListing } from '$lib/content/constants/landing/browser-extension-store-listings';

	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';
	import {
		landingHeroTheme,
		type LandingHeroTheme
	} from '$lib/ui/templates/landing-page/landingHeroTheme';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ExternalLink from '$lib/ui/links/ExternalLink.svelte';
	import PublicLandingSectionHeading from '$lib/ui/templates/titles/PublicLandingSectionHeading.svelte';

	type Props = {
		subtitle: string;
		title: string;
		description: string;
		listings: readonly PublicBrowserExtensionStoreListing[];
		heroTheme?: LandingHeroTheme;
		sectionClass?: string;
	};

	let {
		subtitle,
		title,
		description,
		listings,
		heroTheme = landingHeroTheme,
		sectionClass = ''
	}: Props = $props();

	const sectionId = 'browser-extension-store-chooser';
</script>

<section
	id={sectionId}
	class={cn(
		'scroll-mt-24 border-t border-base-content/10 bg-base-200/40 py-14 sm:py-16',
		sectionClass
	)}
	aria-labelledby="{sectionId}-heading"
>
	<div class="container mx-auto max-w-6xl px-4">
		<header class="mx-auto max-w-2xl text-center">
			<p class={heroTheme.subtitleClass}>{subtitle}</p>
			<PublicLandingSectionHeading
				{title}
				headingId="{sectionId}-heading"
				{heroTheme}
				headingLevel="h2"
				commaSeparated={false}
				class="mt-2"
			/>
			<p class={cn(heroTheme.descriptionClass, 'mt-3 text-pretty')}>{description}</p>
		</header>

		<ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each listings as listing (listing.id)}
				<li class="flex">
					<article
						class="flex h-full w-full flex-col rounded-3xl border border-base-content/10 bg-base-100 p-6 shadow-sm transition duration-300 hover:border-primary/35 hover:shadow-md"
					>
						<div class="flex items-start justify-between gap-3">
							<div
								class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-base-200/80 ring-1 ring-base-content/10"
							>
								<AbstractIcon
									name={listing.iconName}
									width="28"
									height="28"
									class="size-7"
									aria-hidden="true"
								/>
							</div>
							<span
								class={cn(
									'badge badge-sm font-medium',
									listing.available
										? 'badge-success badge-outline'
										: 'badge-ghost text-base-content/55'
								)}
							>
								{listing.statusLabel}
							</span>
						</div>

						<h3 class="mt-4 text-xl font-semibold leading-snug text-base-content">
							{listing.title}
						</h3>
						<p class="mt-2 flex-1 text-sm font-medium leading-relaxed text-base-content/65">
							{listing.description}
						</p>

						{#if listing.available}
							<ExternalLink
								href={listing.storeUrl}
								class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-base-content/15 bg-base-200/50 px-4 py-3 text-sm font-semibold text-base-content transition hover:border-primary/40 hover:bg-base-200"
								aria-label="{listing.installLabel} (opens in a new tab)"
							>
								{listing.installLabel}
								<AbstractIcon
									name={icons.ArrowRight.name}
									width="16"
									height="16"
									class="size-4 shrink-0 opacity-70"
									aria-hidden="true"
								/>
							</ExternalLink>
						{:else}
							<p
								class="mt-6 rounded-xl border border-dashed border-base-content/15 bg-base-200/30 px-4 py-3 text-center text-sm font-medium text-base-content/50"
							>
								{listing.statusLabel}
							</p>
						{/if}
					</article>
				</li>
			{/each}
		</ul>
	</div>
</section>