import { icons } from '$data/icons';
import type { IconName } from '$data/icons';

import { getRootPathPublicSelfHosting } from '$lib/area-public/constants/getRootPathPublicSelfHosting';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import {
	faqHrefDocs,
	faqLink,
	OPENQUOK_GITHUB_REPO_HREF,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

const OPENQUOK_LICENSE_HREF = `${OPENQUOK_GITHUB_REPO_HREF}/blob/main/LICENSE`;
const publicSelfHostingPath = route(getRootPathPublicSelfHosting());
const systemRequirementsHref = faqHrefDocs('installation/system-requirements');
const configurationAgentHref = faqHrefDocs('configuration-agent');
const oauthServerHref = faqHrefDocs('admin/oauth-server');
const gettingStartedForDevHref = faqHrefDocs('getting-started-for-dev');
const configurationWorkerHref = faqHrefDocs('configuration-worker');

export type PublicSelfHostingCta = {
	label: string;
	href: string;
};

export type PublicSelfHostingTrustBadge = {
	id: string;
	label: string;
	description: string;
	iconName: IconName;
	href?: string;
};

export type PublicSelfHostingComparisonCard = {
	id: 'hosted-cloud' | 'self-hosted-docker' | 'cloud-self-host';
	title: string;
	description: string;
	bullets: readonly string[];
	iconName: IconName;
	cta?: PublicSelfHostingCta;
};

export type PublicSelfHostingLinkCardItem = {
	id: string;
	title: string;
	description: string;
	href: string;
	ctaLabel: string;
	iconName: IconName;
};

export type PublicSelfHostingResponsibilityCard = {
	id: string;
	title: string;
	description: string;
	iconName: IconName;
};

export type PublicSelfHostingStartHereItem = PublicSelfHostingLinkCardItem;

export type PublicSelfHostingSectionHeader = {
	subtitle: string;
	title: string;
	description: string;
};

export type PublicSelfHostingFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export type PublicSelfHostingLandingConfig = {
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	hero: PublicSelfHostingSectionHeader & {
		primaryCta: PublicSelfHostingCta;
		secondaryCta: PublicSelfHostingCta;
	};
	trustBadges: readonly PublicSelfHostingTrustBadge[];
	comparisonSection: PublicSelfHostingSectionHeader & {
		cards: readonly PublicSelfHostingComparisonCard[];
	};
	stackSection: PublicSelfHostingSectionHeader & {
		items: readonly PublicSelfHostingLinkCardItem[];
	};
	socialIntegrationSection: PublicSelfHostingSectionHeader & {
		items: readonly PublicSelfHostingLinkCardItem[];
	};
	responsibilitiesSection: PublicSelfHostingSectionHeader & {
		cards: readonly PublicSelfHostingResponsibilityCard[];
	};
	paritySection: PublicSelfHostingSectionHeader & {
		bullets: readonly string[];
	};
	startHereSection: PublicSelfHostingSectionHeader & {
		items: readonly PublicSelfHostingStartHereItem[];
	};
	faqSection: PublicSelfHostingFaqSection;
	hostedFallbackBanner: {
		title: string;
		description: string;
		cta: PublicSelfHostingCta;
	};
};

export const PUBLIC_SELF_HOSTING_LANDING_CONFIG = {
	metaTitle: 'Free Alternative Social Media Scheduler',
	metaDescription:
		'Self-host OpenQuok as a free alternative to paid social media schedulers. No software fee under AGPL — run Docker Compose on your server, split a production stack on your cloud, or choose the hosted plan on openquok.com.',
	keywords: [
		'free alternative social media scheduler',
		'free social media scheduler',
		'free self-hosted social media scheduler',
		'free buffer alternative',
		'free hootsuite alternative',
		'open source social media scheduler',
		'Docker Compose OpenQuok',
		'AGPL social scheduler',
		'self-host social media management'
	],
	hero: {
		subtitle: 'Free self-hosting',
		title: 'Alternative scheduler, on your server, same OpenQuok but free',
		description:
			'A free alternative to paid schedulers like Buffer and Hootsuite when you deploy OpenQuok on your own server — no software fee under AGPL.',
		primaryCta: {
			label: 'Choose your path',
			href: `${publicSelfHostingPath}#choose-your-path`
		},
		secondaryCta: {
			label: 'View source on GitHub',
			href: OPENQUOK_GITHUB_REPO_HREF
		}
	},
	trustBadges: [
		{
			id: 'no-software-fee',
			label: 'No software fee',
			description:
				'Self-hosting is not a hosted plan tier. You pay for your own servers, database, infrastructure, and any social network developer apps you use.',
			iconName: icons.DollarSign.name
		},
		{
			id: 'agpl-license',
			label: 'AGPL-3.0-or-later',
			description:
				'Inspect and modify the source under the licence terms. You can even run your own Scheduler as SaaS as long as you stay opensource.',
			iconName: icons.BookOpen.name,
			href: OPENQUOK_LICENSE_HREF
		}
	],
	comparisonSection: {
		subtitle: 'Choose your path',
		title: 'Hosted cloud, self-host dockerized scheduler, or your own cloud stack',
		description:
			'Start on openquok.com with a free trial, or run OpenQuok yourself. Operator paths have no software fee under AGPL.',
		cards: [
			{
				id: 'hosted-cloud',
				title: 'Hosted cloud plan',
				description: 'You want us to run OpenQuok for you.',
				bullets: [
					'We run updates and security for your workspace',
					'Start a 7-day free trial — no credit card required',
					'Meta, Google, and TikTok apps are ready for cloud workspaces'
				],
				iconName: icons.Globe.name,
				cta: {
					label: 'See pricing',
					href: publicFaqHref.pricing
				}
			},
			{
				id: 'self-hosted-docker',
				title: 'Docker Compose self-host',
				description: 'You run OpenQuok on your own server or homelab.',
				bullets: [
					'Run web, API, Redis, and workers on one machine',
					'Store uploads on the server; optional CLI profile for agent login without API keys',
					'You manage the server, secrets, upgrades, and backups'
				],
				iconName: icons.Lock.name,
				cta: {
					label: 'Read Docker Compose guide',
					href: publicFaqHref.dockerCompose
				}
			},
			{
				id: 'cloud-self-host',
				title: 'Cloud production stack',
				description: 'You deploy on Vercel, Railway, or other cloud hosts.',
				bullets: [
					'Run web, API, and workers on services you control',
					'Same scheduler with your env vars and scaling rules',
					'You pay for Redis, Supabase, storage, and workers in your accounts'
				],
				iconName: icons.Columns3Cog.name,
				cta: {
					label: 'Read production deployment',
					href: publicFaqHref.productionDeployment
				}
			}
		]
	},
	stackSection: {
		subtitle: 'Configure your stack',
		title: 'Backend, web, workers, and CLI auth',
		description:
			'Set env vars and deploy each service on your instance. Open a guide when you wire that layer on self-host.',
		items: [
			{
				id: 'configuration-backend',
				title: 'Backend configuration',
				description: 'Env files, Supabase, Redis, and service keys for the API.',
				href: faqHrefDocs('configuration-backend'),
				ctaLabel: 'Open overview',
				iconName: icons.Code.name
			},
			{
				id: 'configuration-backend-supabase',
				title: 'Supabase',
				description: 'Create a project, copy API keys, and match dashboard settings.',
				href: faqHrefDocs('configuration-backend/supabase'),
				ctaLabel: 'Open guide',
				iconName: icons.ShieldCheck.name
			},
			{
				id: 'configuration-backend-database',
				title: 'Database and migrations',
				description: 'Run OpenQuok migrations before the first user signs up.',
				href: faqHrefDocs('configuration-backend/database'),
				ctaLabel: 'Open guide',
				iconName: icons.FileText.name
			},
			{
				id: 'configuration-backend-redis',
				title: 'Redis cache',
				description: 'Point the API at Redis for cache and job queues.',
				href: faqHrefDocs('configuration-backend/redis'),
				ctaLabel: 'Open guide',
				iconName: icons.Gauge.name
			},
			{
				id: 'configuration-backend-docker',
				title: 'Docker (local services)',
				description: 'Run Redis locally or follow the self-host Compose stack.',
				href: faqHrefDocs('configuration-backend/docker'),
				ctaLabel: 'Open guide',
				iconName: icons.Columns3Cog.name
			},
			{
				id: 'configuration-backend-r2',
				title: 'Upload storage (R2 or local)',
				description: 'Store media on disk or in Cloudflare R2 for publishing.',
				href: faqHrefDocs('configuration-backend/cloudflare-r2'),
				ctaLabel: 'Open guide',
				iconName: icons.FolderCode.name
			},
			{
				id: 'configuration-backend-google-oauth',
				title: 'Google sign-in',
				description: 'Wire Google OAuth for dashboard login on your domain.',
				href: faqHrefDocs('configuration-backend/google-oauth'),
				ctaLabel: 'Open guide',
				iconName: icons.Lock.name
			},
			{
				id: 'configuration-backend-resend',
				title: 'Email (Resend or local)',
				description: 'Send sign-up and notification email from your instance.',
				href: faqHrefDocs('configuration-backend/resend'),
				ctaLabel: 'Open guide',
				iconName: icons.Mail.name
			},
			{
				id: 'configuration-backend-rate-limiting',
				title: 'Rate limiting',
				description: 'Tune auth, API, and upload limits for your deployment.',
				href: faqHrefDocs('configuration-backend/rate-limiting'),
				ctaLabel: 'Open guide',
				iconName: icons.ShieldCheck.name
			},
			{
				id: 'configuration-backend-sentry',
				title: 'Sentry',
				description: 'Send API errors to Sentry when you enable monitoring.',
				href: faqHrefDocs('configuration-backend/sentry'),
				ctaLabel: 'Open guide',
				iconName: icons.CircleAlert.name
			},
			{
				id: 'configuration-backend-stripe',
				title: 'Stripe billing',
				description: 'Optional — enable subscriptions when you bill workspaces.',
				href: faqHrefDocs('configuration-backend/stripe'),
				ctaLabel: 'Open guide',
				iconName: icons.CreditCard.name
			},
			{
				id: 'configuration-web',
				title: 'Web configuration',
				description: 'Vite env files and defaults for the dashboard origin.',
				href: faqHrefDocs('configuration-web'),
				ctaLabel: 'Open overview',
				iconName: icons.LayoutTemplate.name
			},
			{
				id: 'configuration-web-vite',
				title: 'Vite (SvelteKit)',
				description: 'Set VITE_* vars, HTTPS dev, and API proxy rules.',
				href: faqHrefDocs('configuration-web/vite'),
				ctaLabel: 'Open guide',
				iconName: icons.Code.name
			},
			{
				id: 'configuration-web-seo',
				title: 'SEO and marketing defaults',
				description: 'Meta tags and social links for your public domain.',
				href: faqHrefDocs('configuration-web/seo'),
				ctaLabel: 'Open guide',
				iconName: icons.Globe.name
			},
			{
				id: 'configuration-web-config-defaults',
				title: 'Config defaults',
				description: 'Company name, navigation, and fallback site copy.',
				href: faqHrefDocs('configuration-web/config-defaults'),
				ctaLabel: 'Open guide',
				iconName: icons.Settings.name
			},
			{
				id: 'configuration-web-pwa',
				title: 'PWA metadata',
				description: 'App name and icons in web-config.json.',
				href: faqHrefDocs('configuration-web/pwa'),
				ctaLabel: 'Open guide',
				iconName: icons.CustomizedDrawnLaptop.name
			},
			{
				id: 'configuration-web-ai-crawlers',
				title: 'AI crawlers and robots.txt',
				description: 'Let search and AI crawlers read your public pages.',
				href: faqHrefDocs('configuration-web/ai-crawlers-and-robots'),
				ctaLabel: 'Open guide',
				iconName: icons.Bot.name
			},
			{
				id: 'configuration-worker',
				title: 'Worker configuration',
				description: 'BullMQ workers, Redis, and the admin queue dashboard.',
				href: faqHrefDocs('configuration-worker'),
				ctaLabel: 'Open overview',
				iconName: icons.Cog.name
			},
			{
				id: 'configuration-worker-docker',
				title: 'Workers with Docker',
				description: 'Start Redis and worker scripts on your machine.',
				href: faqHrefDocs('configuration-worker/docker'),
				ctaLabel: 'Open guide',
				iconName: icons.Columns3Cog.name
			},
			{
				id: 'configuration-worker-redis',
				title: 'Redis and queues',
				description: 'Share REDIS_* settings between API and workers.',
				href: faqHrefDocs('configuration-worker/redis'),
				ctaLabel: 'Open guide',
				iconName: icons.Gauge.name
			},
			{
				id: 'configuration-worker-railway',
				title: 'Railway (workers)',
				description: 'Deploy always-on workers on Railway.',
				href: faqHrefDocs('configuration-worker/railway'),
				ctaLabel: 'Open guide',
				iconName: icons.Gauge.name
			},
			{
				id: 'configuration-agent',
				title: 'CLI auth server',
				description: 'Env vars for openquok auth:login on your network.',
				href: faqHrefDocs('configuration-agent'),
				ctaLabel: 'Open overview',
				iconName: icons.Terminal.name
			},
			{
				id: 'configuration-agent-architecture',
				title: 'Auth server architecture',
				description: 'How device login flows between CLI, browser, and API.',
				href: faqHrefDocs('configuration-agent/architecture'),
				ctaLabel: 'Open guide',
				iconName: icons.Braces.name
			},
			{
				id: 'configuration-agent-neon',
				title: 'Neon Postgres',
				description: 'Host auth-server state in Neon when you split services.',
				href: faqHrefDocs('configuration-agent/neon'),
				ctaLabel: 'Open guide',
				iconName: icons.FileText.name
			},
			{
				id: 'configuration-agent-scaling',
				title: 'Scaling and Postgres',
				description: 'Run more than one auth server against pooled Postgres.',
				href: faqHrefDocs('configuration-agent/scaling'),
				ctaLabel: 'Open guide',
				iconName: icons.Columns2.name
			}
		]
	},
	socialIntegrationSection: {
		subtitle: 'Operator channel access',
		title: 'Register developer apps for different channels',
		description:
			'On self-host, you create developer apps and your own environment variables. Users connect channels in the dashboard after setup.',
		items: [
			{
				id: 'social-integration-overview',
				title: 'Connections overview',
				description: 'OAuth apps vs user API keys — what you register as the operator.',
				href: faqHrefDocs('social-integration'),
				ctaLabel: 'Open overview',
				iconName: icons.Link.name
			},
			{
				id: 'social-integration-threads',
				title: 'Meta Threads',
				description: 'Create a Meta app, set Threads env vars, and add your OAuth callback URL.',
				href: faqHrefDocs('social-integration/threads'),
				ctaLabel: 'Open guide',
				iconName: icons.Threads.name
			},
			{
				id: 'social-integration-instagram',
				title: 'Instagram',
				description: 'Request Instagram API access, set Meta env vars, and whitelist redirect URIs.',
				href: faqHrefDocs('social-integration/instagram'),
				ctaLabel: 'Open guide',
				iconName: icons.Instagram.name
			},
			{
				id: 'social-integration-facebook',
				title: 'Facebook Page',
				description: 'Create a Meta app, set Facebook env vars, and add Page OAuth callbacks.',
				href: faqHrefDocs('social-integration/facebook'),
				ctaLabel: 'Open guide',
				iconName: icons.Facebook.name
			},
			{
				id: 'social-integration-youtube',
				title: 'YouTube',
				description: 'Enable YouTube API in Google Cloud and set OAuth env vars.',
				href: faqHrefDocs('social-integration/youtube'),
				ctaLabel: 'Open guide',
				iconName: icons.YouTube.name
			},
			{
				id: 'social-integration-tiktok',
				title: 'TikTok',
				description: 'Register a TikTok developer app, set env vars, and add your redirect URI.',
				href: faqHrefDocs('social-integration/tiktok'),
				ctaLabel: 'Open guide',
				iconName: icons.TikTok.name
			},
			{
				id: 'social-integration-linkedin',
				title: 'LinkedIn',
				description: 'Create a LinkedIn developer app, set env vars, and add OAuth redirect URLs.',
				href: faqHrefDocs('social-integration/linkedin'),
				ctaLabel: 'Open guide',
				iconName: icons.LinkedIn.name
			},
			{
				id: 'social-integration-linkedin-page',
				title: 'LinkedIn Page',
				description: 'Authorize a Company Page app, set env vars, and add redirect URLs.',
				href: faqHrefDocs('social-integration/linkedin-page'),
				ctaLabel: 'Open guide',
				iconName: icons.LinkedIn.name
			},
			{
				id: 'social-integration-x',
				title: 'X (Twitter)',
				description: 'Create an X developer app, set OAuth 1.0a env vars, and add callback URLs.',
				href: faqHrefDocs('social-integration/x'),
				ctaLabel: 'Open guide',
				iconName: icons.X.name
			},
			{
				id: 'social-integration-devto',
				title: 'Dev.to',
				description: 'No operator app — users paste a personal API key in Add Channel.',
				href: faqHrefDocs('social-integration/devto'),
				ctaLabel: 'Open guide',
				iconName: icons.Devto.name
			}
		]
	},
	responsibilitiesSection: {
		subtitle: 'Operator responsibilities',
		title: 'What you own on self-host',
		description:
			'OpenQuok publishes docs, source, and community channels. You operate the deployment day to day and support its users.',
		cards: [
			{
				id: 'infrastructure',
				title: 'Infrastructure and data',
				description:
					'You provide the server, public HTTPS origin, Supabase project, Redis volume, uploads storage, monitoring, secrets, and access controls. You decide where OpenQuok data is stored.',
				iconName: icons.Cog.name
			},
			{
				id: 'upgrades',
				title: 'Upgrades and backups',
				description:
					'You track releases and security notices, schedule image rebuilds, and back up the database, uploads, and required secrets together. Test restores before you rely on them.',
				iconName: icons.RefreshCw.name
			},
			{
				id: 'provider-apps',
				title: 'Social provider apps',
				description:
					'You create and maintain Meta, Google, TikTok, and other developer apps, callback URLs, and env vars for the networks you connect. Dev.to uses a user API key — no operator app.',
				iconName: icons.Settings.name
			},
			{
				id: 'support-boundary',
				title: 'Support boundary',
				description:
					'OpenQuok documents the product and ships fixes in the repository. You respond to incidents on your instance, maintain privacy practices, and support your own users.',
				iconName: icons.ShieldCheck.name
			}
		]
	},
	paritySection: {
		subtitle: 'Same product model',
		title: 'The deployment changes, the publishing workflow does not',
		description:
			'Hosted plan limits and operated services do not become part of your installation. You get the same scheduling surface teams expect from OpenQuok Cloud.',
		bullets: [
			'Calendar and kanban scheduling with human approval before publish',
			'Multi-workspace channels, composer settings, and follow-up replies per network',
			'Agent CLI, MCP tools, and Public API access from your own domain',
			'Self-host defaults skip outbound email and Stripe billing so you can sign up locally',
			'External Supabase for auth and Postgres; local uploads storage unless you configure otherwise',
			'Optional CLI auth profile for device-login without API keys on agent hosts'
		]
	},
	startHereSection: {
		subtitle: 'Start here',
		title: 'Production checklist before you expose an instance',
		description:
			'Review system requirements, configure Compose, and enable CLI auth only when agents need device login on your network.',
		items: [
			{
				id: 'docker-compose',
				title: 'Docker Compose self-host guide',
				description:
					'Copy infra/self-host/.env, fill Supabase keys, build images, and bring up API, web, Redis, and workers from the repository root.',
				href: publicFaqHref.dockerCompose,
				ctaLabel: 'Open guide',
				iconName: icons.BookOpenCheck.name
			},
			{
				id: 'production-deployment',
				title: 'Production deployment (custom cloud)',
				description:
					'Split web, API, and workers across Vercel, Railway, or other managed hosts — env vars, scaling, and worker processes on infrastructure you control.',
				href: publicFaqHref.productionDeployment,
				ctaLabel: 'Read guide',
				iconName: icons.Columns3Cog.name
			},
			{
				id: 'blog-walkthrough',
				title: 'CLI device-login walkthrough',
				description:
					'Blog post that walks through self-hosting with the cli profile so agents authenticate without storing API keys on the host.',
				href: publicFaqHref.blogSelfHost,
				ctaLabel: 'Read walkthrough',
				iconName: icons.Terminal.name
			},
			{
				id: 'system-requirements',
				title: 'System requirements',
				description:
					'Confirm Docker, disk, ports, and a Supabase project before your first docker compose up --build.',
				href: systemRequirementsHref,
				ctaLabel: 'Check requirements',
				iconName: icons.Gauge.name
			},
			{
				id: 'self-hosting-docs',
				title: 'Self-hosting docs overview',
				description:
					'Getting started for contributors and operators — architecture, quick start, and default env patterns on the Self-hosting docs tab.',
				href: gettingStartedForDevHref,
				ctaLabel: 'Open overview',
				iconName: icons.BookOpen.name
			},
			{
				id: 'cli-auth',
				title: 'CLI auth and OAuth server',
				description:
					'Enable --profile cli, register a device callback URL, and align OPENQUOK_OAUTH_* env vars with the agent configuration docs.',
				href: configurationAgentHref,
				ctaLabel: 'Configure agents',
				iconName: icons.Braces.name
			},
			{
				id: 'social-integrations',
				title: 'Social integrations (operator)',
				description:
					'Register Meta, Google, TikTok, and other developer apps, callback URLs, and env vars for the networks you connect on operator-run instances.',
				href: publicFaqHref.socialIntegration,
				ctaLabel: 'Open guides',
				iconName: icons.Settings.name
			}
		]
	},
	faqSection: {
		faqSubtitle: 'Self-hosting FAQ',
		faqTitle: 'Self-host OpenQuok, answered',
		faqDescription:
			'Common questions about cost, stack size, parity with hosted OpenQuok, social apps, CLI auth, and exposing Compose on a VPS.',
		faqItems: [
			{
				title: 'What is the difference between Docker Compose and production deployment?',
				description:
					`Docker Compose is a single-host operator bundle under infra/self-host/ — API, web, Redis, and workers on one machine you control. Production deployment splits the same services across cloud hosts you choose (for example Vercel for web, Railway for API and workers). Both paths need an external Supabase project; neither is a hosted plan tier. Start with ${faqLink(publicFaqHref.dockerCompose, 'Docker Compose')} or ${faqLink(publicFaqHref.productionDeployment, 'production deployment')}.`
			},
			{
				title: 'Does self-hosting cost money?',
				description:
					`OpenQuok charges no software fee on operator-run paths under AGPL-3.0-or-later. You still pay for servers, Supabase, bandwidth, TLS, and any social developer apps you register. The hosted cloud plan on openquok.com follows ${faqLink(publicFaqHref.pricing, 'pricing')} tiers. Compare all three paths on ${faqLink(publicSelfHostingPath, 'Self-host OpenQuok')}.`
			},
			{
				title: 'What services do I need to run?',
				description:
					`Docker Compose runs web, API, Redis, and three BullMQ workers from infra/self-host/docker-compose.yml. Production deployment wires the same roles across separate cloud services — see ${faqLink(publicFaqHref.productionDeployment, 'production deployment')} and ${faqLink(configurationWorkerHref, 'worker configuration')}. You supply an external Supabase project in both paths. Optional --profile cli adds Postgres and the device-login auth server. Start with ${faqLink(systemRequirementsHref, 'system requirements')}.`
			},
			{
				title: 'Is self-hosted OpenQuok the same product as hosted?',
				description:
					`Yes. You get the same calendar, kanban, composer, agents, Public API, and MCP tools. Hosted plan limits and operated OAuth apps apply only to the cloud plan on openquok.com. Operator-run Compose and production stacks skip hosted billing and use your own developer apps. Compare paths on ${faqLink(publicSelfHostingPath, 'Self-host OpenQuok')}.`
			},
			{
				title: 'Do I need my own Meta or Google developer apps?',
				description:
					`On self-host, yes — for OAuth networks you connect. Fill only the environment for channels you use, then recreate API and workers. Dev.to uses a user API key in the dashboard with no operator app. See ${faqLink(publicFaqHref.socialIntegration, 'social integration docs')} and the optional provider table in ${faqLink(publicFaqHref.dockerCompose, 'Docker Compose')}.`
			},
			{
				title: 'Can agents authenticate without API keys on the host?',
				description:
					`Yes. Start Compose with --profile cli, register an OAuth app with the device callback URL, and use openquok auth:login from the agent host. Read ${faqLink(configurationAgentHref, 'agent configuration')} and ${faqLink(oauthServerHref, 'OAuth server admin')} — or follow the ${faqLink(publicFaqHref.blogSelfHost, 'device-login walkthrough')}.`
			},
			{
				title: 'Is it safe to expose Docker Compose on a public VPS?',
				description:
					`The stack targets trusted local or private-network operators — not a multi-tenant public edge by default. Put TLS in front, set NOT_SECURED=false, restrict published ports, rotate secrets, and read ${faqLink(publicSelfHostingPath, 'operator responsibilities')} before you open registration on the internet.`
			}
		]
	},
	hostedFallbackBanner: {
		title: 'Lazy and don\'t want to operate a server?',
		description:
			'Start a hosted workspace on openquok.com. We run updates, edge TLS, and cloud OAuth apps so your team can connect channels and schedule in minutes.',
		cta: {
			label: 'Start for $0',
			href: publicFaqHref.signUp
		}
	}
} satisfies PublicSelfHostingLandingConfig;
