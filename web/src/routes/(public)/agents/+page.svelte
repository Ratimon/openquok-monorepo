<script lang="ts">
	import type { PageData } from './$types';
	import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/publicAgentConfig';
	import type { PublicMcpIntegrationViewModel } from '$lib/content/constants/publicMcpConfig';

	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		ACCENT_SPLIT_CTA_BANNER_TITLE,
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		accentSplitCtaBannerDescription
	} from '$lib/config/constants/config';
	import { PUBLIC_AGENTS_HUB } from '$lib/content/constants/publicAgentConfig';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import Compare from '$lib/ui/templates/Compare.svelte';
	import PublicAgentsHubGrid from '$lib/ui/templates/landing-page/PublicAgentsHubGrid.svelte';
	import PublicMcpHubGrid from '$lib/ui/templates/landing-page/PublicMcpHubGrid.svelte';
	import PublicMcpToolsPanel from '$lib/ui/templates/landing-page/PublicMcpToolsPanel.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let agentsVm: PublicAgentHostLandingPageViewModel[] = $derived(data.agentsVm ?? []);
	let mcpIntegrationsVm: PublicMcpIntegrationViewModel[] = $derived(data.mcpIntegrationsVm ?? []);
	let schemaData = $derived(data.schemaData);

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	let accentBannerDescription = $derived(accentSplitCtaBannerDescription('your agent'));
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-16">
	<PublicAgentsHubGrid
		agentsVm={agentsVm}
	/>

	<PublicMcpHubGrid
		integrationsVm={mcpIntegrationsVm}
	/>

	<div class="container mx-auto px-4 py-12 sm:py-16">
		<PublicMcpToolsPanel />
	</div>
	
	<Compare
		heroTheme={landingHeroTheme}
		landingSubtitle={PUBLIC_AGENTS_HUB.compareSection.subtitle}
		landingTitle={PUBLIC_AGENTS_HUB.compareSection.title}
		landingDescription={PUBLIC_AGENTS_HUB.compareSection.description}
		leftTitle={PUBLIC_AGENTS_HUB.compareSection.leftTitle}
		rightTitle={PUBLIC_AGENTS_HUB.compareSection.rightTitle}
		points={PUBLIC_AGENTS_HUB.compareSection.points}
	/>

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
