import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
import {
	getRootPathSocialMediaPostingApiPlatform,
	getRootPathSocialMediaSchedulingApiPlatform
} from '$lib/area-public/constants/getRootPathPublicApiMarketing';
import { getRootPathPublicPayloadWizardChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
import { listHumanizeChannelsForHub } from '$lib/ai-humanize/constants/publicHumanizeChannelConfig';
import { listBestTimeChannelsForHub } from '$lib/best-time-to-post/constants/publicBestTimeToPostChannelConfig';
import { listCanvasChannelsForHub } from '$lib/canvas/constants/publicCanvasChannelConfig';
import { listPublicAgentHostSeedsForFooter } from '$lib/content/constants/agents/seeds';
import { listPublicChannelLandingSeedsForFooter } from '$lib/content/constants/channels/seeds';
import { listPublicMcpLandingSeedsForFooter } from '$lib/content/constants/mcps/seeds';
import {
	getPublicApiPostingPlatformBySlug,
	getPublicApiSchedulingPlatformBySlug,
	PUBLIC_API_POSTING_PLATFORM_SLUGS,
	listPublicApiPostingPlatformsForHub,
	listPublicApiSchedulingPlatformsForHub
} from '$lib/content/constants/apis/index';
import { getDocsByDirectory } from '$lib/docs/content';
import { docsSidebarPublicApi } from '$lib/docs/constants/config';
import { listSkillBuilderChannelsForHub } from '$lib/skill-builder/constants/publicSkillBuilderChannelConfig';
import { route } from '$lib/utils/path';

export type PublicFooterLink = { label: string; href: string };

export type PublicFooterLinksMap = Record<string, PublicFooterLink[]>;

type PublicFooterHubEntry = { platformLabel: string; href: string };

const SOCIAL_INTEGRATION_DOCS_DIRECTORY = 'social-integration';

/** Requires `preloadDocsRegistry()` — reads doc metadata from the shared docs registry. */
function listDocDirectoryFooterEntries(directory: string): PublicFooterHubEntry[] {
	const entries = getDocsByDirectory(directory)
		.filter((doc) => doc.slug !== directory)
		.map((doc) => ({
			order: doc.meta.order ?? 999,
			platformLabel: doc.meta.sidebar?.label ?? doc.meta.title,
			href: route(doc.href.replace(/^\//, ''))
		}));

	return entries
		.sort((a, b) => a.order - b.order || a.platformLabel.localeCompare(b.platformLabel))
		.map(({ platformLabel, href }) => ({ platformLabel, href }));
}

function listPublicApiDocFooterEntries(directory: string): PublicFooterHubEntry[] {
	return listDocDirectoryFooterEntries(directory);
}

function listPublicApiDocsSidebarSections() {
	return docsSidebarPublicApi.filter((section) =>
		section.autogenerate?.directory.startsWith('apis-')
	);
}

export function buildPublicFooterHubLinks(
	hubLabel: string,
	hubHref: string,
	entries: readonly PublicFooterHubEntry[]
): PublicFooterLink[] {
	return [
		{ label: hubLabel, href: hubHref },
		...entries.map((entry) => ({
			label: entry.platformLabel,
			href: entry.href
		}))
	];
}

export function buildPublicFooterSkillBuilderLinks(hubHref: string): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All Skill Builder Tools',
		hubHref,
		listSkillBuilderChannelsForHub()
	);
}

export function buildPublicFooterPhotoEditorLinks(hubHref: string): PublicFooterLink[] {
	return buildPublicFooterHubLinks('All Photo Editor Tools', hubHref, listCanvasChannelsForHub());
}

export function buildPublicFooterHumanizerLinks(hubHref: string): PublicFooterLink[] {
	return buildPublicFooterHubLinks('All Humanizer Tools', hubHref, listHumanizeChannelsForHub());
}

export function buildPublicFooterBestTimeToPostLinks(hubHref: string): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All Best Time to Post Tools',
		hubHref,
		listBestTimeChannelsForHub()
	);
}

export function buildPublicFooterAutonomousAgentIntegrationLinks(
	agentsHubHref: string
): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All Autonomous Agent Integrations',
		agentsHubHref,
		listPublicAgentHostSeedsForFooter().map((agent) => ({
			platformLabel: agent.label,
			href: route(getRootPathPublicAgent(agent.slug))
		}))
	);
}

export function buildPublicFooterMcpIntegrationLinks(agentsHubHref: string): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All MCP Integrations',
		agentsHubHref,
		listPublicMcpLandingSeedsForFooter().map((mcp) => ({
			platformLabel: mcp.label,
			href: route(getRootPathPublicAgent(mcp.slug))
		}))
	);
}

export function buildPublicFooterSupportedChannelLinks(channelsHubHref: string): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All Supported Channels',
		channelsHubHref,
		listPublicChannelLandingSeedsForFooter().map((channel) => ({
			platformLabel: channel.label,
			href: route(getRootPathPublicChannel(channel.slug))
		}))
	);
}

export function buildPublicFooterPostingApiPlatformLinks(
	postingApiHubHref: string
): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All Posting APIs',
		postingApiHubHref,
		listPublicApiPostingPlatformsForHub().map((platform) => {
			const page = getPublicApiPostingPlatformBySlug(platform.slug);
			return {
				platformLabel: page?.metaTitle ?? `${platform.platformLabel} Posting API`,
				href: route(getRootPathSocialMediaPostingApiPlatform(platform.slug))
			};
		})
	);
}

export function buildPublicFooterSchedulingApiPlatformLinks(
	schedulingApiHubHref: string
): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All Scheduling APIs',
		schedulingApiHubHref,
		listPublicApiSchedulingPlatformsForHub().map((platform) => {
			const page = getPublicApiSchedulingPlatformBySlug(platform.slug);
			return {
				platformLabel: page?.metaTitle ?? `${platform.platformLabel} Scheduling API`,
				href: route(getRootPathSocialMediaSchedulingApiPlatform(platform.slug))
			};
		})
	);
}

/** Capability hubs only — platform pages live in dedicated footer columns. */
export function buildPublicFooterApisLinks(
	postingApiHubHref: string,
	schedulingApiHubHref: string
): PublicFooterLink[] {
	return [
		{ label: 'All Posting APIs', href: postingApiHubHref },
		{ label: 'All Scheduling APIs', href: schedulingApiHubHref }
	];
}

export function buildPublicFooterPayloadWizardLinks(payloadWizardHubHref: string): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All Payload Wizard Tools',
		payloadWizardHubHref,
		PUBLIC_API_POSTING_PLATFORM_SLUGS.map((slug) => {
			const platform = getPublicApiPostingPlatformBySlug(slug);
			const platformLabel = platform?.platformLabel ?? slug;
			return {
				platformLabel: `${platformLabel} Payload Wizard`,
				href: route(getRootPathPublicPayloadWizardChannel(slug))
			};
		})
	);
}

/** Self-host operator setup guides under `/docs/social-integration/*`. */
export function buildPublicFooterSelfHostSocialIntegrationLinks(): PublicFooterLink[] {
	const docsRoot = getRootPathPublicDocs();

	return buildPublicFooterHubLinks(
		'All self-host social integrations',
		route(`${docsRoot}/${SOCIAL_INTEGRATION_DOCS_DIRECTORY}`),
		listDocDirectoryFooterEntries(SOCIAL_INTEGRATION_DOCS_DIRECTORY)
	);
}

/** Index pages for each Public API reference section (`/docs/apis-*`). */
export function buildPublicFooterApiPayloadValidatorLinks(
	publicApiGettingStartedHref: string
): PublicFooterLink[] {
	const docsRoot = getRootPathPublicDocs();

	return buildPublicFooterHubLinks(
		'All API Payload Validators',
		publicApiGettingStartedHref,
		listPublicApiDocsSidebarSections().map((section) => ({
			platformLabel: section.label,
			href: route(`${docsRoot}/${section.autogenerate!.directory}`)
		}))
	);
}

/** Public API reference sections from `docsSidebarPublicApi` (`apis-*` directories only). */
export function buildPublicFooterPublicApiDocsLinkSections(): Record<string, PublicFooterLink[]> {
	const docsRoot = getRootPathPublicDocs();
	const sections: Record<string, PublicFooterLink[]> = {};

	for (const section of listPublicApiDocsSidebarSections()) {
		const directory = section.autogenerate!.directory;

		sections[section.label] = buildPublicFooterHubLinks(
			`All ${section.label}`,
			route(`${docsRoot}/${directory}`),
			listPublicApiDocFooterEntries(directory)
		);
	}

	return sections;
}
