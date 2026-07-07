import type { PublicAgentHostLandingPageViewModel } from '$lib/content/constants/publicAgentConfig';
import {
	getAvailablePublicAgentHostBySlug,
	getPublicAgentHostBySlug
} from '$lib/content/constants/publicAgentConfig';
import { getAvailablePublicChannelBySlug } from '$lib/content/constants/publicChannelConfig';
import {
	getPublicAgentChannelBySlug
} from '$lib/content/constants/publicAgentChannelConfig';
import { buildAgentChannelLandingVm } from '$lib/content/utils/buildAgentChannelLandingVm';
import { buildMcpChannelLandingVm } from '$lib/content/utils/buildMcpChannelLandingVm';
import type { PublicMcpLandingPageViewModel } from '$lib/content/constants/publicMcpConfig';
import {
	getAvailablePublicMcpLandingBySlug,
	getPublicMcpLandingBySlug,
	listPublicMcpLandingPages
} from '$lib/content/constants/publicMcpConfig';

export type PublicAgentsLandingPage =
	PublicAgentHostLandingPageViewModel | PublicMcpLandingPageViewModel;

export type PublicAgentViewModel = PublicAgentsLandingPage;

export function isPublicMcpLandingPage(
	page: PublicAgentsLandingPage
): page is PublicMcpLandingPageViewModel {
	return page.pageType === 'mcp-client';
}

export function isPublicAgentHostLandingPage(
	page: PublicAgentsLandingPage
): page is PublicAgentHostLandingPageViewModel {
	return page.pageType === 'agent-host';
}

export function getPublicAgentsLandingBySlug(slug: string): PublicAgentsLandingPage | undefined {
	return getPublicAgentHostBySlug(slug) ?? getPublicMcpLandingBySlug(slug);
}

export function getAvailablePublicAgentsLandingBySlug(
	slug: string
): PublicAgentsLandingPage | undefined {
	return getAvailablePublicAgentHostBySlug(slug) ?? getAvailablePublicMcpLandingBySlug(slug);
}

export function listAllPublicAgentsLandingPages(): PublicAgentsLandingPage[] {
	return [...listPublicMcpLandingPages()];
}

export type PublicAgentsChannelPageViewModel = {
	landingVm: PublicAgentsLandingPage;
	channelSlug: string;
	channelLabel: string;
	cliExamplesPath: string;
};

export class PublicAgentByPagePresenter {
	public agentVm: PublicAgentViewModel | null = $state(null);

	readonly secondaryCtaText = 'Get Started For Free';
	readonly secondaryCtaHref = '/pricing';

	/**
	 * Stateless — safe for `+page.server.ts` (SSR): resolve slug → VM without mutating `$state`.
	 * Returns `null` when the slug is missing or the agent is not available.
	 */
	loadAgentBySlugStateless(slug: string): PublicAgentViewModel | null {
		const agent = getAvailablePublicAgentsLandingBySlug(slug);
		return agent ?? null;
	}

	/** Stateful wrapper — calls {@link loadAgentBySlugStateless} and assigns {@link agentVm}. */
	loadAgentBySlug(slug: string): PublicAgentViewModel | null {
		const agentVm = this.loadAgentBySlugStateless(slug);
		this.agentVm = agentVm;
		return agentVm;
	}

	/**
	 * Stateless — resolve agent host or MCP client + social channel slug into a channel-specific landing VM.
	 * Returns `null` when the agent slug, channel, or availability check fails.
	 */
	loadAgentChannelStateless(
		agentSlug: string,
		channelSlug: string
	): PublicAgentsChannelPageViewModel | null {
		const normalizedAgentSlug = agentSlug.trim().toLowerCase();
		const normalizedChannelSlug = channelSlug.trim().toLowerCase();

		const channel = getAvailablePublicChannelBySlug(normalizedChannelSlug);
		const channelConfig = getPublicAgentChannelBySlug(normalizedChannelSlug);
		if (!channel || !channelConfig) return null;

		const baseAgent = getAvailablePublicAgentHostBySlug(normalizedAgentSlug);
		if (baseAgent) {
			return {
				landingVm: buildAgentChannelLandingVm({ baseAgent, channel, channelConfig }),
				channelSlug: channelConfig.channelSlug,
				channelLabel: channelConfig.platformLabel,
				cliExamplesPath: channelConfig.cliExamplesPath
			};
		}

		const baseMcp = getAvailablePublicMcpLandingBySlug(normalizedAgentSlug);
		if (baseMcp) {
			return {
				landingVm: buildMcpChannelLandingVm({ baseMcp, channel, channelConfig }),
				channelSlug: channelConfig.channelSlug,
				channelLabel: channelConfig.platformLabel,
				cliExamplesPath: channelConfig.cliExamplesPath
			};
		}

		return null;
	}
}
