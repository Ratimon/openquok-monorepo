<script lang="ts">
	import type { PublicSocialAutopilotCta } from '$lib/content/constants/marketing/social-autopilot-landing';

	import HeroMain from '$lib/ui/templates/landing-page/HeroMain.svelte';
	import PublicSocialAutopilotLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicSocialAutopilotLandingBreadcrumb.svelte';

	type Props = {
		title: string;
		slogan: string;
		primaryCta: PublicSocialAutopilotCta;
		githubOwner?: string;
		githubRepo?: string;
	};

	let {
		title,
		slogan,
		primaryCta,
		githubOwner = '',
		githubRepo = ''
	}: Props = $props();
</script>

{#snippet socialAutopilotHeroBreadcrumb()}
	<PublicSocialAutopilotLandingBreadcrumb />
{/snippet}

<HeroMain
	heroTitle={title}
	heroSlogan={slogan}
	heroTitleParseMode="social-agent-rotate"
	ctaTextPrimary={primaryCta.label}
	ctaHrefPrimary={primaryCta.href}
	{githubOwner}
	{githubRepo}
	breadcrumb={socialAutopilotHeroBreadcrumb}
/>
