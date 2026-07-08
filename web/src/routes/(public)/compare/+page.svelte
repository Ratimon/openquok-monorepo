<script lang="ts">
	import type { PageData } from './$types';

	import { publicComparePagePresenter } from '$lib/area-public';
	import { COMPARE_HUB_BASE_SLUG, type CompareProductSlug } from '$lib/content/constants/publicCompareConfig';
	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';

	import { icons } from '$data/icons';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let defaultHubVm = $derived(data.hubVm);

	let selectedBaseSlug = $state<CompareProductSlug>(COMPARE_HUB_BASE_SLUG);
	let hubVm = $derived(publicComparePagePresenter.buildHubVm(selectedBaseSlug));
	let productOptions = $derived(defaultHubVm.products);
	let selectedBaseProduct = $derived(
		productOptions.find((product) => product.slug === selectedBaseSlug) ?? productOptions[0]!
	);

	const PRODUCT_ICON_STYLES: Record<
		CompareProductSlug,
		{ containerClass: string; iconClass?: string }
	> = {
		openquok: {
			containerClass:
				'bg-linear-to-br from-emerald-400/30 via-lime-300/20 to-amber-300/25 text-white ring-emerald-300/35'
		},
		hootsuite: {
			containerClass:
				'bg-linear-to-br from-orange-400/30 via-amber-300/20 to-yellow-300/20 text-orange-100 ring-orange-300/35'
		},
		buffer: {
			containerClass:
				'bg-linear-to-br from-sky-400/30 via-cyan-300/20 to-blue-300/20 text-sky-100 ring-sky-300/35'
		}
	};

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const compareHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.compare;

	function selectBaseProduct(slug: CompareProductSlug) {
		selectedBaseSlug = slug;
	}

	function iconStyleForProduct(slug: CompareProductSlug) {
		return PRODUCT_ICON_STYLES[slug];
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
					class="btn btn-primary inline-flex max-w-full items-center gap-3 rounded-full px-4 py-2 text-3xl font-black tracking-tight sm:px-5 sm:text-4xl"
					aria-label="Choose the main product to compare"
				>
					<div
						class={`flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ${iconStyleForProduct(selectedBaseProduct.slug).containerClass}`}
					>
						<AbstractIcon
							name={selectedBaseProduct.icon}
							width="22"
							height="22"
							class={iconStyleForProduct(selectedBaseProduct.slug).iconClass ?? 'size-5.5'}
							focusable="false"
						/>
					</div>
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
							class={product.slug === selectedBaseSlug
								? 'font-semibold text-primary'
								: undefined}
							onclick={() => selectBaseProduct(product.slug)}
						>
							<div class="flex items-center gap-2">
								<div
									class={`flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ${iconStyleForProduct(product.slug).containerClass}`}
								>
									<AbstractIcon
										name={product.icon}
										width="14"
										height="14"
										class={iconStyleForProduct(product.slug).iconClass ?? 'size-3.5'}
										focusable="false"
									/>
								</div>
								<span>{product.name}</span>
							</div>
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
			iconName: pair.icon,
			iconContainerClass: iconStyleForProduct(pair.slug as CompareProductSlug).containerClass,
			iconClass: iconStyleForProduct(pair.slug as CompareProductSlug).iconClass,
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
		<AccentSplitCtaBanner
			title={compareHubDocsBanner.title}
			description={compareHubDocsBanner.description}
			ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
			ctaHref={compareHubDocsBanner.docsPath}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>
