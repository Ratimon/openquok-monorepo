<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		ACCENT_SPLIT_CTA_BANNER_TITLE,
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		accentSplitCtaBannerDescription
	} from '$lib/config/constants/config';

	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicAgentsHubGrid from '$lib/ui/templates/landing-page/PublicAgentsHubGrid.svelte';
	import PublicMcpHubSection from '$lib/ui/templates/landing-page/PublicMcpHubSection.svelte';
	import PublicMcpToolsPanel from '$lib/ui/templates/landing-page/PublicMcpToolsPanel.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let agentsVm = $derived(data.agentsVm ?? []);
	let schemaData = $derived(data.schemaData);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	let accentBannerDescription = $derived(accentSplitCtaBannerDescription('your agent'));
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-16">
	<PublicAgentsHubGrid agents={agentsVm} />

	<PublicMcpHubSection />

	<div class="container mx-auto px-4 py-12 sm:py-16">
		<PublicMcpToolsPanel />
	</div>

	<AccentSplitCtaBanner
		title={ACCENT_SPLIT_CTA_BANNER_TITLE}
		description={accentBannerDescription}
		ctaText={PUBLIC_BANNER_CTA_TEXT}
		ctaHref={signUpPath}
	/>

	<CenteredDarkCtaBanner
		title={CENTERED_DARK_CTA_BANNER_TITLE}
		description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
		ctaText={PUBLIC_BANNER_CTA_TEXT}
		ctaHref={signUpPath}
	/>
</SectionOuterContainer>
