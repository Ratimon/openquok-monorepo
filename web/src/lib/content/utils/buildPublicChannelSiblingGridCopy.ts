import type { IconName } from '$data/icons';

export type PublicChannelSiblingGridItem = {
	slug: string;
	platformLabel: string;
	icon: IconName;
	href: string;
	available: boolean;
};

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
		return `Beyond ${platform}: Every Supported Platform for ${agent}`;
	}
	if (platform.length > 0) {
		return buildPublicChannelSiblingGridTitle(platform);
	}
	return buildPublicAgentChannelSiblingGridHubTitle(agent);
}

export function buildPublicAgentChannelSiblingGridHubTitle(agentLabel: string): string {
	const agent = agentLabel.trim();
	return agent.length > 0 ? `Every Supported Platform for ${agent}` : 'Every Supported Platform';
}

export function buildPublicAgentChannelSiblingGridHubDescription(): string {
	return 'Choose a channel for platform-specific workflows, examples, and FAQs.';
}

export function buildPublicChannelSiblingGridDescription(platformLabel: string): string {
	const label = platformLabel.trim();
	return label.length > 0
		? `Start with ${label}, then add Instagram, Threads, and every other supported network from one workspace.`
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
	agentLabel: string
): string {
	const platform = platformLabel.trim();
	const agent = agentLabel.trim();
	if (platform.length > 0 && agent.length > 0) {
		return `Start with ${platform}, then schedule every other network from ${agent}.`;
	}
	if (platform.length > 0) {
		return `Start with ${platform}, then schedule every other network from the same agent.`;
	}
	return buildPublicChannelSiblingGridDescription('');
}

export function buildPublicAgentChannelSiblingGridCardDescription(
	platformLabel: string,
	agentLabel: string,
	available: boolean
): string {
	const platform = platformLabel.trim();
	const agent = agentLabel.trim();
	if (platform.length === 0) {
		return available ? 'Schedule posts from your agent.' : 'Agent workflows — coming soon.';
	}

	return available
		? `Schedule ${platform} from ${agent || 'your agent'}.`
		: `Preview ${platform} workflows for ${agent || 'your agent'} — coming soon.`;
}
