import type { IconName } from '$data/icons';

export type PublicChannelSiblingGridItem = {
	slug: string;
	platformLabel: string;
	icon: IconName;
	href: string;
	available: boolean;
	/** Shown beside the platform label when the host marks the channel first-class. */
	badgeLabel?: string;
};

import { getChannelPageEcosystemId } from '$lib/content/constants/agents/ecosystems';
import { isPublicDirectoryChannelSlug } from '$lib/content/constants/channels';

/** Section copy for the cross-link grid on `/channels/{slug}` and agent channel detail pages. */
export function buildPublicChannelSiblingGridTitle(platformLabel: string): string {
	const label = platformLabel.trim();
	return label.length > 0
		? `Beyond ${label}: Every Supported Platform`
		: 'Every Supported Platform';
}

export function buildPublicAgentChannelSiblingGridTitle(
	platformLabel: string,
	agentLabel: string
): string {
	const platform = platformLabel.trim();
	const agent = agentLabel.trim();
	if (platform.length > 0 && agent.length > 0) {
		return `Beyond ${platform}: Every Supported Channel for ${agent}`;
	}
	if (platform.length > 0) {
		return buildPublicChannelSiblingGridTitle(platform);
	}
	return buildPublicAgentChannelSiblingGridHubTitle(agent);
}

export function buildPublicAgentChannelSiblingGridHubTitle(agentLabel: string): string {
	const agent = agentLabel.trim();
	return agent.length > 0 ? `${agent}: Every Supported Channels` : 'Every Supported Channel';
}

export function buildPublicAgentChannelSiblingGridHubDescription(agentLabel: string): string {
	const agent = agentLabel.trim();
	if (agent.length > 0) {
		return `Pick a channel for ${agent} workflows, CLI or MCP examples, and platform FAQs.`;
	}
	return 'Pick a channel for agent workflows, examples, and FAQs.';
}

export function buildPublicChannelSiblingGridDescription(
	platformLabel: string,
	channelSlug?: string
): string {
	const label = platformLabel.trim();
	const slug = channelSlug?.trim().toLowerCase() ?? '';
	const ecosystemId = slug ? getChannelPageEcosystemId(slug) : undefined;

	if (label.length > 0 && ecosystemId === 'xai-grok') {
		return `X is home for Grok Bot on OpenQuok. Connect Instagram, Threads, and every other supported network from the same workspace — dashboard, public API, Cursor MCP, or cloud-desktop agents.`;
	}

	if (label.length > 0 && ecosystemId === 'meta-consumer') {
		return `Facebook, Instagram, and Threads are first-class for Meta Muse. Start with ${label}, then schedule X and every other network from one workspace.`;
	}

	return label.length > 0
		? `Start with ${label}, then add Instagram, Threads, and every other supported network from one workspace. Schedule each network from the dashboard, public API, or an agent host.`
		: 'Schedule every supported network from the same workspace.';
}

export function buildPublicChannelSiblingGridCardDescription(
	platformLabel: string,
	available: boolean
): string {
	const label = platformLabel.trim();
	if (label.length === 0) {
		return available ? 'Schedule posts from one workspace.' : 'Scheduler preview — coming soon.';
	}

	return available
		? `Schedule ${label} posts from one workspace.`
		: `Preview the ${label} scheduler — coming soon.`;
}

export function buildPublicAgentChannelSiblingGridDescription(
	platformLabel: string,
	agentLabel: string,
	activeChannelSlug?: string
): string {
	const platform = platformLabel.trim();
	const agent = agentLabel.trim();
	const activeSlug = activeChannelSlug?.trim().toLowerCase() ?? '';
	const activeIsDirectory = activeSlug.length > 0 && isPublicDirectoryChannelSlug(activeSlug);

	if (platform.length > 0 && agent.length > 0) {
		if (activeIsDirectory) {
			return `Start with ${platform}, then schedule social posts and launch on other directories from ${agent}.`;
		}
		return `Start with ${platform}, then schedule other networks and launch on directories from ${agent}.`;
	}
	if (platform.length > 0) {
		return `Start with ${platform}, then schedule and launch on other channels from the same agent.`;
	}
	return buildPublicChannelSiblingGridDescription('');
}

export function buildPublicAgentChannelSiblingGridCardDescription(
	platformLabel: string,
	agentLabel: string,
	available: boolean,
	channelSlug?: string
): string {
	const platform = platformLabel.trim();
	const agent = agentLabel.trim();
	const slug = channelSlug?.trim().toLowerCase() ?? '';
	const isDirectory = slug.length > 0 && isPublicDirectoryChannelSlug(slug);

	if (platform.length === 0) {
		return available
			? 'Schedule posts and directory launches from your agent.'
			: 'Agent workflows — coming soon.';
	}

	if (!available) {
		return `Preview ${platform} workflows for ${agent || 'your agent'} — coming soon.`;
	}

	return isDirectory
		? `Launch on ${platform} from ${agent || 'your agent'}.`
		: `Schedule ${platform} from ${agent || 'your agent'}.`;
}
