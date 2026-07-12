<script lang="ts">
	import type { PageData } from './$types';
	import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/publicAgentConfig';
	import type { PublicMcpIntegrationViewModel } from '$lib/content/constants/publicMcpConfig';

	import { getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route } from '$lib/utils/path';

	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_HUB_DOCS_BANNERS
	} from '$lib/config/constants/config';
	import { PUBLIC_AGENTS_HUB } from '$lib/content/constants/publicAgentConfig';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import Compare from '$lib/ui/templates/Compare.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
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

	const agentsHubDocsBanner = PUBLIC_HUB_DOCS_BANNERS.agents;
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

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={PUBLIC_AGENTS_HUB.faqSection.faqSubtitle}
			faqTitle={PUBLIC_AGENTS_HUB.faqSection.faqTitle}
			faqDescription={PUBLIC_AGENTS_HUB.faqSection.faqDescription}
			faqItems={[...PUBLIC_AGENTS_HUB.faqSection.faqItems]}
			sectionClass="py-16 sm:py-20"
		/>
	</div>

	<AccentSplitCtaBanner
		title={agentsHubDocsBanner.title}
		description={agentsHubDocsBanner.description}
		ctaText={agentsHubDocsBanner.ctaText}
		ctaHref={agentsHubDocsBanner.docsPath}
	/>

	<CenteredDarkCtaBanner
		title={CENTERED_DARK_CTA_BANNER_TITLE}
		description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
		ctaText={PUBLIC_BANNER_CTA_TEXT}
		ctaHref={signUpPath}
	/>
</SectionOuterContainer>
