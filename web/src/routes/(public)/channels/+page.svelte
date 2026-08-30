<script lang="ts">
	import type { PageData } from './$types';
	import type { PublicChannelViewModel } from '$lib/area-public/PublicChannelsPage.presenter.svelte';

	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';
	import { PUBLIC_CHANNELS_HUB_FAQ } from '$lib/content/constants/publicChannelsHubFaqConfig';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicChannelsHubGrid from '$lib/ui/templates/landing-page/PublicChannelsHubGrid.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let channelsVm: PublicChannelViewModel[] = $derived(data.channelsVm ?? []);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const channelsHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.channels;
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-16">
	<PublicChannelsHubGrid
		channelsVm={channelsVm}
	/>

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={PUBLIC_CHANNELS_HUB_FAQ.faqSubtitle}
			faqTitle={PUBLIC_CHANNELS_HUB_FAQ.faqTitle}
			faqDescription={PUBLIC_CHANNELS_HUB_FAQ.faqDescription}
			faqItems={[...PUBLIC_CHANNELS_HUB_FAQ.faqItems]}
			sectionClass="py-12 sm:py-16"
		/>

		<AccentSplitCtaBanner
			title={channelsHubDocsBanner.title}
			description={channelsHubDocsBanner.description}
			ctaText={channelsHubDocsBanner.ctaText}
			ctaHref={channelsHubDocsBanner.docsPath}
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
