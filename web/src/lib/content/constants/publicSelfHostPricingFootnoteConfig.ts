import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type PublicSelfHostPricingFootnoteLink = {
	id: string;
	label: string;
	href: string;
};

export type PublicSelfHostPricingFootnoteConfig = {
	headline: string;
	body: string;
	links: readonly PublicSelfHostPricingFootnoteLink[];
};

/** Home pricing panel callout — three operator paths plus overview (not a plan tier). */
export const PUBLIC_SELF_HOST_PRICING_FOOTNOTE_CONFIG = {
	headline: 'Self-host for $0',
	body: 'OpenQuok charges no software fee when you run it on your own infrastructure. You still pay for servers, Supabase, and bandwidth.',
	links: [
		{
			id: 'hosted-cloud',
			label: 'Hosted cloud',
			href: publicFaqHref.pricing
		},
		{
			id: 'docker-compose',
			label: 'Docker Compose',
			href: publicFaqHref.dockerCompose
		},
		{
			id: 'cloud-production-stack',
			label: 'Cloud production stack',
			href: publicFaqHref.productionDeployment
		},
		{
			id: 'self-hosting-overview',
			label: 'Self-hosting overview',
			href: publicFaqHref.selfHostingLanding
		}
	]
} satisfies PublicSelfHostPricingFootnoteConfig;
