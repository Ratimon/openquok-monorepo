import type { PublicFaqItem } from '$lib/content/constants/agents/types';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

/** FAQ for hosts with a persistent cloud computer (Grok Bot, Dots, Manus, …). */
export function buildAgentCloudBrowserVsOpenQuokFaqAnswer(agentLabel: string): string {
	return `A cloud browser can click through sites, but it is a poor fit for a social calendar. Do not put social passwords or payment details in ${agentLabel} chat. Scripted logins often hit captchas and can break platform rules.

OpenQuok connects each channel once with OAuth or app credentials and publishes through official APIs. Tokens stay encrypted on our servers. You still message ${agentLabel} to draft and queue; you approve on the calendar or kanban before anything goes live. See the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}.`;
}

export function buildAgentCloudBrowserVsOpenQuokFaqItem(agentLabel: string): PublicFaqItem {
	return {
		title: `Why use OpenQuok if ${agentLabel} has a cloud computer?`,
		description: buildAgentCloudBrowserVsOpenQuokFaqAnswer(agentLabel)
	};
}

export const AGENTS_HUB_CLOUD_BROWSER_VS_OPENQUOK_FAQ: PublicFaqItem = {
	title: 'Why use OpenQuok if my agent can browse and sign in to social sites?',
	description:
		'Hosts like <a href="/agents/grok-bot">Grok Bot</a>, <a href="/agents/dots">Dots</a>, and <a href="/agents/manus">Manus</a> can use a cloud browser, but that is not a scheduler. Pasting social passwords into chat exposes secrets, while scripted logins risk restrictions or bans. OpenQuok uses official APIs, keeps tokens off the agent VM, and lets you approve every post before publish. See the <a href="/docs/channels/connect">connect channels guide</a>.'
};
