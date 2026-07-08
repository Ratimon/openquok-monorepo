<script lang="ts">
	import type { PageData } from './$types';
	import type { PublicChannelViewModel } from '$lib/area-public/PublicChannelsPage.presenter.svelte';

	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';

	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicChannelsHubGrid from '$lib/ui/templates/landing-page/PublicChannelsHubGrid.svelte';
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
		<AccentSplitCtaBanner
			title={channelsHubDocsBanner.title}
			description={channelsHubDocsBanner.description}
			ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
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
