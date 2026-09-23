import { getPublicChannelBySlug } from '$lib/content/constants/channels/index';

import type {
	PublicApiCapability,
	PublicApiFormatExample,
	PublicApiPlatformHubCard,
	PublicApiPlatformPageViewModel,
	PublicApiPlatformSlug
} from '$lib/content/constants/apis/types';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import { buildPublicApiPlatformHeroTitle } from '$lib/content/utils/buildProgrammaticSeoTitles';
import {
	buildChannelFaqLinks,
	faqHrefDocs,
	faqLink,
	faqLinkSelfHostChannelSetup,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

/** Shared SEO terms appended to every API marketing landing page. */
export const SHARED_PUBLIC_API_SEO_KEYWORDS = [
	'social media API',
	'social media posting API',
	'social media scheduling API',
	'OpenQuok public API'
] as const;

export const PUBLIC_API_CREATE_POST_ENDPOINT = 'POST /api/v1/public/posts';

export const PUBLIC_API_CLOUD_PUBLIC_BASE_URL = 'https://api.openquok.com/api/v1/public';

/** Matches getting-started-for-public-api — Bearer + opo_ programmatic token. */
export const PUBLIC_API_PROGRAMMATIC_AUTH_CURL_HEADER =
	'Authorization: Bearer opo_your_programmatic_token';

export function buildPublicApiIntegrationsListTerminalCode(options?: {
	providerIdentifier?: string;
}): string {
	const lines = [
		`curl -H "${PUBLIC_API_PROGRAMMATIC_AUTH_CURL_HEADER}" \\`,
		`  ${PUBLIC_API_CLOUD_PUBLIC_BASE_URL}/integrations`
	];
	if (options?.providerIdentifier) {
		lines.push(
			`# Match identifier: ${options.providerIdentifier} — copy id into integrationIds`
		);
	}
	return lines.join('\n');
}

export function buildPublicApiCreatePostTerminalCode(requestJson: string): string {
	const body = requestJson.trim();
	return `curl -X POST '${PUBLIC_API_CLOUD_PUBLIC_BASE_URL}/posts' \\
  -H "${PUBLIC_API_PROGRAMMATIC_AUTH_CURL_HEADER}" \\
  -H "Content-Type: application/json" \\
  -d '${body}'`;
}

export const PUBLIC_API_MOCK_INTEGRATION_ID = '1f9a4f3a-3b2c-4f4a-9d8e-7a3f6b1c8e22';

export const PUBLIC_API_MOCK_POST_GROUP_ID = '9a0a1b2c-3d4e-4f5a-9b8c-aa11bb22cc33';

export const PUBLIC_API_MOCK_POST_ID = '5b3c1d2e-9a3f-4e6b-bb12-2c0a5f1a90a1';

/** Pretty-print JSON loaded from agent skill examples or inline objects. */
export function prettyPublicApiJson(value: string | Record<string, unknown>): string {
	const parsed = typeof value === 'string' ? JSON.parse(value) : value;
	return `${JSON.stringify(parsed, null, 2)}\n`;
}

/** Standard `POST /public/posts` success body aligned with OpenAPI examples. */
export function buildPublicApiCreatePostResponseExample(params: {
	content: string;
	publishDate: string;
	integrationId?: string;
}): string {
	const integrationId = params.integrationId ?? PUBLIC_API_MOCK_INTEGRATION_ID;
	return prettyPublicApiJson({
		success: true,
		data: {
			postGroup: PUBLIC_API_MOCK_POST_GROUP_ID,
			posts: [
				{
					id: PUBLIC_API_MOCK_POST_ID,
					state: 'QUEUE',
					publishDate: params.publishDate,
					organizationId: 'c1d8a3f4-1234-4abc-bf12-1234567890ab',
					integrationId,
					content: params.content,
					delay: 0,
					postGroup: PUBLIC_API_MOCK_POST_GROUP_ID,
					title: null,
					description: null,
					parentPostId: null,
					releaseId: null,
					releaseUrl: null,
					settings: null,
					image: null,
					intervalInDays: null,
					error: null,
					deletedAt: null,
					createdByUserId: null,
					createdAt: '2026-05-10T09:00:00.000Z',
					updatedAt: '2026-05-10T09:00:00.000Z'
				}
			]
		}
	});
}

export function buildPublicApiFormatExample(params: {
	id: string;
	label: string;
	description: string;
	requestJson: string;
	sourceFile?: string;
}): PublicApiFormatExample {
	const parsed = JSON.parse(params.requestJson) as {
		body?: string;
		scheduledAt?: string;
	};
	const content = typeof parsed.body === 'string' ? parsed.body : 'Scheduled via the public API';
	const publishDate =
		typeof parsed.scheduledAt === 'string' ? parsed.scheduledAt : '2026-05-14T10:00:00.000Z';

	return {
		id: params.id,
		label: params.label,
		description: params.description,
		requestJson: prettyPublicApiJson(params.requestJson),
		responseJson: buildPublicApiCreatePostResponseExample({ content, publishDate }),
		sourceFile: params.sourceFile
	};
}

const PROVIDER_IDENTIFIER_BY_SLUG: Record<PublicApiPlatformSlug, string> = {
	tiktok: 'tiktok',
	x: 'x',
	instagram: 'instagram-business',
	youtube: 'youtube',
	facebook: 'facebook',
	threads: 'threads',
	linkedin: 'linkedin'
};

const PUBLIC_API_PROVIDERS_DOCS_BY_SLUG: Record<PublicApiPlatformSlug, string> = {
	tiktok: 'public-api-providers/tiktok',
	x: 'public-api-providers/x',
	instagram: 'public-api-providers/instagram-business',
	youtube: 'public-api-providers/youtube',
	facebook: 'public-api-providers/facebook',
	threads: 'public-api-providers/threads',
	linkedin: 'public-api-providers/linkedin'
};

const CLI_EXAMPLES_HREF_BY_SLUG: Record<PublicApiPlatformSlug, string> = {
	tiktok: publicFaqHref.cliTiktok,
	x: publicFaqHref.cliX,
	instagram: publicFaqHref.cliInstagram,
	youtube: publicFaqHref.cliYoutube,
	facebook: publicFaqHref.cliFacebook,
	threads: publicFaqHref.cliThreads,
	linkedin: publicFaqHref.cliLinkedin
};

export function getPublicApiProviderIdentifier(slug: PublicApiPlatformSlug): string {
	return PROVIDER_IDENTIFIER_BY_SLUG[slug];
}

export function buildPublicApiPlatformHubCard(slug: PublicApiPlatformSlug): PublicApiPlatformHubCard {
	const channel = getPublicChannelBySlug(slug);
	if (!channel) {
		throw new Error(`Missing public channel catalog entry for API platform slug: ${slug}`);
	}

	return {
		slug,
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		hubDescription: channel.hubDescription ?? channel.metaDescription
	};
}

export function buildPublicApiPlatformFaqItems(
	slug: PublicApiPlatformSlug,
	capability: PublicApiCapability
): PublicFaqItem[] {
	const channel = getPublicChannelBySlug(slug);
	if (!channel) {
		throw new Error(`Missing public channel catalog entry for API platform slug: ${slug}`);
	}

	const platformLabel = channel.platformLabel;
	const links = buildChannelFaqLinks(slug, channel.docsPath);
	const providerDocsHref = faqHrefDocs(PUBLIC_API_PROVIDERS_DOCS_BY_SLUG[slug]);
	const capabilityLabel = capability === 'posting' ? 'post' : 'schedule';
	const schedulingLead =
		capability === 'scheduling'
			? 'Set `scheduledAt` to an ISO-8601 UTC timestamp for the publish time. OpenQuok stores the instant in UTC and publishes when the worker dequeues the row.'
			: 'Set `status` to `scheduled` and `scheduledAt` to publish immediately or at a future time. Use `draft` when you want to persist without enqueuing.';

	return [
		{
			title: `How do I connect ${platformLabel} before I call the API?`,
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and choose Connect channel → ${platformLabel}. Complete OAuth in the dashboard. OpenQuok Cloud registers the developer app for you. For self-hosted deployments, see the ${faqLinkSelfHostChannelSetup(channel.docsPath, platformLabel)}.`
		},
		{
			title: `Where do I find the ${platformLabel} integration UUID?`,
			description:
				`Call ${faqLink(faqHrefDocs('apis-integrations/list'), 'GET /public/integrations')} with your workspace programmatic token. Match the \`identifier\` field to \`${getPublicApiProviderIdentifier(slug)}\` and copy the channel UUID into \`integrationIds\`. Field tables for ${platformLabel} live on ${faqLink(providerDocsHref, `${platformLabel} provider settings`)}.`
		},
		{
			title: `Can I ${capabilityLabel} to ${platformLabel} with one API request?`,
			description:
				`Yes. Send one ${faqLink(publicFaqHref.publicApi, 'POST /public/posts')} payload with the channel UUID in \`integrationIds\`. ${schedulingLead} See ${faqLink(CLI_EXAMPLES_HREF_BY_SLUG[slug], `${platformLabel} CLI examples`)} for copy-paste recipes.`
		},
		{
			title: `Does OpenQuok bill per ${platformLabel} API call?`,
			description:
				`No. OpenQuok bills workspaces on ${faqLink(publicFaqHref.pricing, 'paid plans')}, not per-post credits. Public API access requires a paid tier. Each opo_ token gets 30 requests per hour on OpenQuok Cloud. Scheduled posts still count toward your monthly post quota. See ${faqLink(faqHrefDocs('billing/limits'), 'cloud limits')}.`
		},
		{
			title: `Where can I test the ${platformLabel} payload before I ship code?`,
			description:
				`Use the interactive Payload Wizard on this page with sample channels, or open the full wizard in your workspace after you sign in. Copy JSON stays free on public pages. Provider field reference: ${faqLink(providerDocsHref, `${platformLabel} settings`)}. Channel landing: ${faqLink(links.channelLanding, platformLabel)}.`
		}
	];
}

type BuildPlatformPageParams = {
	slug: PublicApiPlatformSlug;
	capability: PublicApiCapability;
	formatExamples: readonly PublicApiFormatExample[];
	/** Overrides channel `platformLabel` in the on-page H1 only (e.g. `Twitter / X`). */
	heroPlatformLabel?: string;
	heroTitle?: string;
	heroDescription: string;
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	faqDescription?: string;
};

export function buildPublicApiPlatformPage(
	params: BuildPlatformPageParams
): PublicApiPlatformPageViewModel {
	const channel = getPublicChannelBySlug(params.slug);
	if (!channel) {
		throw new Error(`Missing public channel catalog entry for API platform slug: ${params.slug}`);
	}

	const capabilityVerb = params.capability === 'posting' ? 'Posting' : 'Scheduling';
	const heroPlatformLabel = params.heroPlatformLabel ?? channel.platformLabel;
	const heroTitle =
		params.heroTitle ?? buildPublicApiPlatformHeroTitle(heroPlatformLabel, params.capability);

	return {
		capability: params.capability,
		slug: params.slug,
		providerIdentifier: getPublicApiProviderIdentifier(params.slug),
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		docsPath: channel.docsPath,
		publicApiProvidersDocsPath: faqHrefDocs(PUBLIC_API_PROVIDERS_DOCS_BY_SLUG[params.slug]),
		heroTitle,
		heroDescription: params.heroDescription,
		metaTitle: params.metaTitle,
		metaDescription: params.metaDescription,
		keywords: params.keywords,
		formatExamples: params.formatExamples,
		faqSubtitle: 'API examples FAQ',
		faqTitle: `${channel.platformLabel} ${capabilityVerb} API, answered`,
		faqDescription:
			params.faqDescription ??
			`Connect ${channel.platformLabel}, build a valid POST /public/posts payload, and publish from your app or agent.`,
		faqItems: buildPublicApiPlatformFaqItems(params.slug, params.capability)
	};
}
