import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
import { listHumanizeChannelsForHub } from '$lib/ai-humanize/constants/publicHumanizeChannelConfig';
import { listBestTimeChannelsForHub } from '$lib/best-time-to-post/constants/publicBestTimeToPostChannelConfig';
import { listCanvasChannelsForHub } from '$lib/canvas/constants/publicCanvasChannelConfig';
import { listPublicAgentsForHub } from '$lib/content/constants/agents/index';
import { listPublicChannelsForHub } from '$lib/content/constants/channels/index';
import { docsSidebarPublicApi } from '$lib/docs/constants/config';
import { docMetaFromRawSource } from '$lib/docs/utils/content/parseDocFrontmatter';
import { listSkillBuilderChannelsForHub } from '$lib/skill-builder/constants/publicSkillBuilderChannelConfig';
import { route } from '$lib/utils/path';

export type PublicFooterLink = { label: string; href: string };

type PublicFooterHubEntry = { platformLabel: string; href: string };

/** Slug + label only — keep order aligned with `MCP_LANDING_SEEDS` in `mcps/index.ts`. */
const MCP_HUB_FOOTER_ENTRIES = [
	{ slug: 'antigravity-cli', label: 'Antigravity CLI' },
	{ slug: 'chatgpt', label: 'ChatGPT' },
	{ slug: 'codex', label: 'Codex' },
	{ slug: 'cursor', label: 'Cursor' },
	{ slug: 'claude-code', label: 'Claude Code' },
	{ slug: 'claude-cowork', label: 'Claude Cowork' },
	{ slug: 'vscode-copilot', label: 'VS Code / Copilot' },
	{ slug: 'devin-desktop', label: 'Devin Desktop' },
	{ slug: 'amp', label: 'Amp' },
	{ slug: 'warp', label: 'Warp' }
] as const;

const publicApiDocsRawModules: Record<string, string> = import.meta.glob(
	'/src/content/docs/apis-*/**/*.{md,svx}',
	{ query: '?raw', import: 'default', eager: true }
);

const socialIntegrationDocsRawModules: Record<string, string> = import.meta.glob(
	'/src/content/docs/social-integration/**/*.{md,svx}',
	{ query: '?raw', import: 'default', eager: true }
);

const SOCIAL_INTEGRATION_DOCS_DIRECTORY = 'social-integration';

function docSlugFromContentPath(path: string): string {
	return path
		.replace('/src/content/docs/', '')
		.replace(/\.(md|svx)$/, '')
		.replace(/\/index$/, '');
}

function listDocDirectoryFooterEntries(
	directory: string,
	rawModules: Record<string, string>
): PublicFooterHubEntry[] {
	const docsRoot = getRootPathPublicDocs();
	const entries: { order: number; platformLabel: string; href: string }[] = [];

	for (const [path, raw] of Object.entries(rawModules)) {
		const slug = docSlugFromContentPath(path);
		if (slug !== directory && !slug.startsWith(`${directory}/`)) continue;

		const meta = docMetaFromRawSource(raw);
		if (meta.draft) continue;
		if (slug === directory) continue;

		entries.push({
			order: meta.order ?? 999,
			platformLabel: meta.sidebar?.label ?? meta.title,
			href: route(`${docsRoot}/${slug}`)
		});
	}

	return entries
		.sort((a, b) => a.order - b.order || a.platformLabel.localeCompare(b.platformLabel))
		.map(({ platformLabel, href }) => ({ platformLabel, href }));
}

function listPublicApiDocFooterEntries(directory: string): PublicFooterHubEntry[] {
	return listDocDirectoryFooterEntries(directory, publicApiDocsRawModules);
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
		listPublicAgentsForHub().map((agent) => ({
			platformLabel: agent.agentLabel,
			href: route(getRootPathPublicAgent(agent.slug))
		}))
	);
}

export function buildPublicFooterMcpIntegrationLinks(agentsHubHref: string): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All MCP Integrations',
		agentsHubHref,
		MCP_HUB_FOOTER_ENTRIES.map((mcp) => ({
			platformLabel: mcp.label,
			href: route(getRootPathPublicAgent(mcp.slug))
		}))
	);
}

export function buildPublicFooterSupportedChannelLinks(channelsHubHref: string): PublicFooterLink[] {
	return buildPublicFooterHubLinks(
		'All Supported Channels',
		channelsHubHref,
		listPublicChannelsForHub().map((channel) => ({
			platformLabel: channel.platformLabel,
			href: route(getRootPathPublicChannel(channel.slug))
		}))
	);
}

/** Self-host operator setup guides under `/docs/social-integration/*`. */
export function buildPublicFooterSelfHostSocialIntegrationLinks(): PublicFooterLink[] {
	const docsRoot = getRootPathPublicDocs();

	return buildPublicFooterHubLinks(
		'All self-host social integrations',
		route(`${docsRoot}/${SOCIAL_INTEGRATION_DOCS_DIRECTORY}`),
		listDocDirectoryFooterEntries(
			SOCIAL_INTEGRATION_DOCS_DIRECTORY,
			socialIntegrationDocsRawModules
		)
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
