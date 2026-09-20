import {
	getRootPathPublicAgent,
	getRootPathPublicAgents
} from '$lib/area-public/constants/getRootPathPublicAgents';
import {
	getRootPathSocialMediaPostingApi,
	getRootPathSocialMediaSchedulingApi
} from '$lib/area-public/constants/getRootPathPublicApiMarketing';
import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
import { getRootPathPublicTools } from '$lib/area-public/constants/getRootPathPublicTools';
import type { PublicApiCapability } from '$lib/content/constants/apis/types';
import {
	PUBLIC_AGENTS_HUB_SECTION_IDS,
	PUBLIC_LANDING_BREADCRUMB
} from '$lib/content/constants/publicLandingBreadcrumbConfig';
import type { PublicLandingBreadcrumbCrumb } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { route } from '$lib/utils/path';

export type AgentsLandingBreadcrumbVariant = 'hub' | 'agent-host' | 'mcp-client';

export function buildAgentsLandingBreadcrumbItems(params: {
	variant: AgentsLandingBreadcrumbVariant;
	agentSlug?: string;
	agentLabel?: string;
	channelLabel?: string | null;
}): PublicLandingBreadcrumbCrumb[] {
	const { variant, agentSlug = '', agentLabel = '', channelLabel = null } = params;

	if (variant === 'hub') {
		return [
			{ label: 'Home', href: '/' },
			{ label: PUBLIC_LANDING_BREADCRUMB.agentsHub }
		];
	}

	const integrationHubSectionId =
		variant === 'mcp-client'
			? PUBLIC_AGENTS_HUB_SECTION_IDS.mcpIntegrations
			: PUBLIC_AGENTS_HUB_SECTION_IDS.autonomousAgentIntegrations;

	const integrationHubLabel =
		variant === 'mcp-client'
			? PUBLIC_LANDING_BREADCRUMB.mcpIntegrations
			: PUBLIC_LANDING_BREADCRUMB.autonomousAgentIntegrations;

	const integrationHubHref = `${route(getRootPathPublicAgents())}#${integrationHubSectionId}`;
	const trimmedAgentSlug = agentSlug.trim();
	const agentHref = trimmedAgentSlug
		? route(getRootPathPublicAgent(trimmedAgentSlug))
		: null;

	const trail: PublicLandingBreadcrumbCrumb[] = [
		{ label: 'Home', href: '/' },
		{ label: integrationHubLabel, href: integrationHubHref }
	];

	const trimmedAgentLabel = agentLabel.trim();
	const trimmedChannelLabel = channelLabel?.trim() ?? '';

	if (trimmedChannelLabel) {
		if (trimmedAgentLabel) {
			trail.push({ label: trimmedAgentLabel, href: agentHref });
		}
		trail.push({ label: trimmedChannelLabel });
		return trail;
	}

	if (trimmedAgentLabel) {
		trail.push({ label: trimmedAgentLabel });
	}

	return trail;
}

export function buildChannelsLandingBreadcrumbItems(params: {
	platformLabel?: string | null;
}): PublicLandingBreadcrumbCrumb[] {
	const channelsHubHref = route(getRootPathPublicChannels());
	const trimmedPlatformLabel = params.platformLabel?.trim() ?? '';

	if (trimmedPlatformLabel) {
		return [
			{ label: PUBLIC_LANDING_BREADCRUMB.supportedChannels, href: channelsHubHref },
			{ label: trimmedPlatformLabel }
		];
	}

	return [{ label: PUBLIC_LANDING_BREADCRUMB.supportedChannels }];
}

export function buildApiMarketingLandingBreadcrumbItems(params: {
	capability: PublicApiCapability;
	hubMetaTitle: string;
	platformLabel?: string | null;
}): PublicLandingBreadcrumbCrumb[] {
	const hubHref = route(
		params.capability === 'posting'
			? getRootPathSocialMediaPostingApi()
			: getRootPathSocialMediaSchedulingApi()
	);
	const trimmedPlatformLabel = params.platformLabel?.trim() ?? '';

	if (trimmedPlatformLabel) {
		return [
			{ label: 'Home', href: '/' },
			{ label: params.hubMetaTitle, href: hubHref },
			{ label: trimmedPlatformLabel }
		];
	}

	return [
		{ label: 'Home', href: '/' },
		{ label: params.hubMetaTitle }
	];
}

export function buildToolsLandingBreadcrumbItems(params: {
	toolLabel: string;
	toolRootPath: string;
	channelLabel?: string | null;
	channelRootPath?: string;
}): PublicLandingBreadcrumbCrumb[] {
	const toolsHubHref = route(getRootPathPublicTools());
	const toolHref = route(params.toolRootPath);
	const trimmedChannelLabel = params.channelLabel?.trim() ?? '';

	if (trimmedChannelLabel && params.channelRootPath?.trim()) {
		return [
			{ label: 'Free Tools', href: toolsHubHref },
			{ label: params.toolLabel, href: toolHref },
			{ label: trimmedChannelLabel }
		];
	}

	return [
		{ label: 'Free Tools', href: toolsHubHref },
		{ label: params.toolLabel }
	];
}
