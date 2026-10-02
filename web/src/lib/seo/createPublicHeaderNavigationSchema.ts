import type { ItemList, SiteNavigationElement } from 'schema-dts';

import { getRootPathPublicAgent } from '$lib/area-public/constants/getRootPathPublicAgents';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
import { listPublicAgentsForHub } from '$lib/content/constants/agents';
import { listPublicChannelsForHub } from '$lib/content/constants/channels';
import { listPublicMcpLandingPages } from '$lib/content/constants/mcps';
import { PUBLIC_OPPORTUNITIES_NAV_SECTIONS } from '$lib/content/constants/publicOpportunitiesNavCatalog';
import { PUBLIC_NAVBAR_LINKS } from '$lib/config/constants/config';
import { createJsonLdGraph, type JsonLdGraphSchema } from '$lib/seo/jsonLdSchema';
import { route } from '$lib/utils/path';

export const PUBLIC_HEADER_NAVIGATION_SCHEMA_ID_SUFFIX = '#primary-navigation';

function absoluteUrl(origin: string, pathname: string): string {
	const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return new URL(normalized, origin).href;
}

function navigationElement(params: {
	name: string;
	url: string;
	description?: string;
	hasPart?: SiteNavigationElement[];
}): SiteNavigationElement {
	const { name, url, description, hasPart } = params;
	return {
		'@type': 'SiteNavigationElement',
		name,
		url,
		description: description?.trim() || undefined,
		hasPart: hasPart && hasPart.length > 0 ? hasPart : undefined
	};
}

function opportunitiesNavigation(origin: string, hubPathname: string): SiteNavigationElement {
	const hubUrl = absoluteUrl(origin, hubPathname);
	const sectionNodes = PUBLIC_OPPORTUNITIES_NAV_SECTIONS.map((section) =>
		navigationElement({
			name: section.label,
			url: hubUrl,
			description: section.blurb,
			hasPart: section.links.map((link) =>
				navigationElement({
					name: `${section.label} — ${link.label}`,
					url: absoluteUrl(origin, link.pathname),
					description: link.description
				})
			)
		})
	);

	return navigationElement({
		name: 'Opportunities',
		url: hubUrl,
		description: 'Backlinks, playbooks, and building blocks for your stack.',
		hasPart: sectionNodes
	});
}

function agentsNavigation(origin: string, agentsPathname: string): SiteNavigationElement {
	const hubUrl = absoluteUrl(origin, agentsPathname);
	const agentLinks = listPublicAgentsForHub()
		.filter((agent) => agent.available)
		.map((agent) =>
			navigationElement({
				name: agent.agentLabel,
				url: absoluteUrl(origin, route(getRootPathPublicAgent(agent.slug)))
			})
		);
	const mcpLinks = listPublicMcpLandingPages()
		.filter((client) => client.available)
		.map((client) =>
			navigationElement({
				name: client.agentLabel,
				url: absoluteUrl(origin, route(getRootPathPublicAgent(client.slug)))
			})
		);

	return navigationElement({
		name: 'Agents',
		url: hubUrl,
		description: 'Autonomous agents and MCP client integrations.',
		hasPart: [
			navigationElement({
				name: 'Autonomous agent integrations',
				url: hubUrl,
				hasPart: agentLinks
			}),
			navigationElement({
				name: 'MCP integrations',
				url: hubUrl,
				hasPart: mcpLinks
			})
		]
	});
}

function channelsNavigation(origin: string, channelsPathname: string): SiteNavigationElement {
	const hubUrl = absoluteUrl(origin, channelsPathname);
	const channelLinks = listPublicChannelsForHub()
		.filter((channel) => channel.available)
		.map((channel) =>
			navigationElement({
				name: channel.heroTitle.split('\n')[0]?.trim() || channel.slug,
				url: absoluteUrl(origin, route(getRootPathPublicChannel(channel.slug)))
			})
		);

	return navigationElement({
		name: 'Channels',
		url: hubUrl,
		description: 'Supported social and publishing channels.',
		hasPart: channelLinks
	});
}

function topLevelNavigationElement(
	origin: string,
	link: (typeof PUBLIC_NAVBAR_LINKS)[number]
): SiteNavigationElement {
	const pathname = route(link.pathname);
	const url = absoluteUrl(origin, pathname);

	if (link.navType === 'agents') {
		return agentsNavigation(origin, pathname);
	}
	if (link.navType === 'channels') {
		return channelsNavigation(origin, pathname);
	}
	if (link.navType === 'opportunities') {
		return opportunitiesNavigation(origin, pathname);
	}

	return navigationElement({
		name: link.title,
		url
	});
}

/**
 * Sitewide primary header navigation as Schema.org `SiteNavigationElement` items inside an `ItemList`.
 * Uses stable `@id` `{origin}/#primary-navigation` — does not duplicate homepage `WebSite` `#website`.
 */
export function createPublicHeaderNavigationSchema(params: {
	origin: string;
	companyUrl: string;
}): JsonLdGraphSchema {
	const { origin, companyUrl } = params;
	const navigationId = `${origin.replace(/\/$/, '')}${PUBLIC_HEADER_NAVIGATION_SCHEMA_ID_SUFFIX}`;

	const websiteId = `${origin.replace(/\/$/, '')}/#website`;
	const topLevel = PUBLIC_NAVBAR_LINKS.map((link) => topLevelNavigationElement(origin, link));

	const itemList: ItemList = {
		'@type': 'ItemList',
		'@id': navigationId,
		name: 'Primary site navigation',
		description: 'Header links for OpenQuok marketing pages, including mega-menu destinations.',
		url: companyUrl,
		itemListElement: topLevel.map((element, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: {
				...element,
				isPartOf: { '@id': websiteId }
			}
		}))
	};

	return createJsonLdGraph([itemList]);
}
