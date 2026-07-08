<script lang="ts">
	import type { PageData } from './$types';

	import { publicComparePagePresenter } from '$lib/area-public';
	import { COMPARE_HUB_BASE_SLUG, type CompareProductSlug } from '$lib/content/constants/publicCompareConfig';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT
	} from '$lib/config/constants/config';

	import { icons } from '$data/icons';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let defaultHubVm = $derived(data.hubVm);

	let selectedBaseSlug = $state<CompareProductSlug>(COMPARE_HUB_BASE_SLUG);
	let hubVm = $derived(publicComparePagePresenter.buildHubVm(selectedBaseSlug));
	let productOptions = $derived(defaultHubVm.products);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	function selectBaseProduct(slug: CompareProductSlug) {
		selectedBaseSlug = slug;
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-4xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">
			{hubVm.eyebrow}
		</p>
		<h1
			class="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-3xl font-black tracking-tight text-base-content sm:text-4xl"
		>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					type="button"
					class="btn btn-primary inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-3xl font-black tracking-tight sm:px-5 sm:text-4xl"
					aria-label="Choose the main product to compare"
				>
					<span class="truncate">{hubVm.baseProductName}</span>
					<AbstractIcon
						name={icons.ChevronDown.name}
						width="20"
						height="20"
						class="size-5 shrink-0 opacity-90"
						focusable="false"
					/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="center" class="min-w-[12rem]">
					{#each productOptions as product (product.slug)}
						<DropdownMenu.Item
							class={product.slug === selectedBaseSlug ? 'font-semibold text-primary' : undefined}
							onclick={() => selectBaseProduct(product.slug)}
						>
							{product.name}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<span>vs. the rest</span>
		</h1>
		<p class="mx-auto max-w-2xl text-base text-base-content/70">
			{hubVm.description}
		</p>
	</header>

	<SimpleCardGrid
		heroTheme={{
			subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase',
			parseLandingHeroTitlePartSegments: (text: string) => [{ text, highlight: false }]
		}}
		headingId="public-compare-grid-heading"
		title=""
		items={hubVm.pairs.map((pair) => ({
			id: pair.slug,
			title: `vs. ${pair.name}`,
			href: pair.href,
			description: `Compare ${hubVm.baseProductName} and ${pair.name} across pricing, features, and supported channels.`,
			ctaLabel: 'Open'
		}))}
		getItemKey={(item) => item.id}
		sectionClass="pt-10 pb-0"
		patternComponent={StripedPattern}
		patternClass="text-primary/12 stroke-[0.75]"
	>
		{#snippet card(item, context)}
			<SimpleLinkCard
				{item}
				pattern={context.pattern}
				patternComponent={context.patternComponent}
				patternClass={context.patternClass}
			/>
		{/snippet}
	</SimpleCardGrid>

	<div class="container mx-auto px-4">
		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
