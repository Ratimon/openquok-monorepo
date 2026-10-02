import { getRootPathPublicAlternatives } from '$lib/area-public/constants/getRootPathPublicAlternatives';
import { getRootPathPublicCompare } from '$lib/area-public/constants/getRootPathPublicCompare';
import {
	getRootPathPublicAgent,
	getRootPathPublicAgents
} from '$lib/area-public/constants/getRootPathPublicAgents';
import {
	getRootPathSocialMediaPostingApi,
	getRootPathSocialMediaSchedulingApi
} from '$lib/area-public/constants/getRootPathPublicApiMarketing';
import {
	getRootPathPublicBuildBacklinks,
	getRootPathPublicBuildBacklinksCategories,
	getRootPathPublicBuildBacklinksCategory,
	getRootPathPublicBuildBacklinksTags
} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import {
	getRootPathPublicBuildingBlocks,
	getRootPathPublicBuildingBlocksCategories,
	getRootPathPublicBuildingBlocksCategory,
	getRootPathPublicBuildingBlocksTags
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';
import {
	getRootPathPublicPlaybooks,
	getRootPathPublicPlaybooksCategories,
	getRootPathPublicPlaybooksCategory,
	getRootPathPublicPlaybooksTags
} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { getRootPathPublicTools } from '$lib/area-public/constants/getRootPathPublicTools';
import type { PublicApiCapability } from '$lib/content/constants/channels/api/_shared/types';
import {
	PUBLIC_AGENTS_HUB_SECTION_IDS,
	PUBLIC_LANDING_BREADCRUMB
} from '$lib/content/constants/landing/breadcrumbs';
import type { BreadcrumbCrumb } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { route } from '$lib/utils/path';

export type AgentsLandingBreadcrumbVariant = 'hub' | 'agent-host' | 'mcp-client';

export type CompareLandingBreadcrumbVariant = 'hub' | 'detail';

export type AlternativesLandingBreadcrumbVariant = 'hub' | 'detail';

export function buildAgentsLandingBreadcrumbItems(params: {
	variant: AgentsLandingBreadcrumbVariant;
	agentSlug?: string;
	agentLabel?: string;
	channelLabel?: string | null;
}): BreadcrumbCrumb[] {
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

	const trail: BreadcrumbCrumb[] = [
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

export function buildCompareLandingBreadcrumbItems(params: {
	variant: CompareLandingBreadcrumbVariant;
	leftProductName?: string;
	rightProductName?: string;
}): BreadcrumbCrumb[] {
	const compareHubHref = route(getRootPathPublicCompare());

	if (params.variant === 'hub') {
		return [
			{ label: 'Home', href: '/' },
			{ label: PUBLIC_LANDING_BREADCRUMB.compareHub }
		];
	}

	const leftName = params.leftProductName?.trim() ?? '';
	const rightName = params.rightProductName?.trim() ?? '';
	const comparisonLabel =
		leftName && rightName ? `${leftName} vs ${rightName}` : leftName || rightName || 'Comparison';

	return [
		{ label: 'Home', href: '/' },
		{ label: PUBLIC_LANDING_BREADCRUMB.compareHub, href: compareHubHref },
		{ label: comparisonLabel }
	];
}

export function buildAlternativesLandingBreadcrumbItems(params: {
	variant: AlternativesLandingBreadcrumbVariant;
	pageLabel?: string | null;
}): BreadcrumbCrumb[] {
	const alternativesHubHref = route(getRootPathPublicAlternatives());

	if (params.variant === 'hub') {
		return [
			{ label: 'Home', href: '/' },
			{ label: PUBLIC_LANDING_BREADCRUMB.alternativesHub }
		];
	}

	const trimmedPageLabel = params.pageLabel?.trim() ?? '';

	return [
		{ label: 'Home', href: '/' },
		{ label: PUBLIC_LANDING_BREADCRUMB.alternativesHub, href: alternativesHubHref },
		{ label: trimmedPageLabel || PUBLIC_LANDING_BREADCRUMB.alternativesHub }
	];
}

export function buildChannelsLandingBreadcrumbItems(params: {
	platformLabel?: string | null;
}): BreadcrumbCrumb[] {
	const channelsHubHref = route(getRootPathPublicChannels());
	const trimmedPlatformLabel = params.platformLabel?.trim() ?? '';

	if (trimmedPlatformLabel) {
		return [
			{ label: 'Home', href: '/' },
			{ label: PUBLIC_LANDING_BREADCRUMB.supportedChannels, href: channelsHubHref },
			{ label: trimmedPlatformLabel }
		];
	}

	return [
		{ label: 'Home', href: '/' },
		{ label: PUBLIC_LANDING_BREADCRUMB.supportedChannels }
	];
}

export type ListingsHubBreadcrumbKind = 'playbooks' | 'building-blocks' | 'build-backlinks';

export type ListingsHubBreadcrumbVariant =
	| 'hub'
	| 'categories-index'
	| 'tags-index'
	| 'category'
	| 'tag'
	| 'category-tag'
	| 'site';

function listingsHubRootPath(kind: ListingsHubBreadcrumbKind): string {
	if (kind === 'playbooks') return getRootPathPublicPlaybooks();
	if (kind === 'build-backlinks') return getRootPathPublicBuildBacklinks();
	return getRootPathPublicBuildingBlocks();
}

function listingsHubCategoriesIndexPath(kind: ListingsHubBreadcrumbKind): string {
	if (kind === 'playbooks') return getRootPathPublicPlaybooksCategories();
	if (kind === 'build-backlinks') return getRootPathPublicBuildBacklinksCategories();
	return getRootPathPublicBuildingBlocksCategories();
}

function listingsHubTagsIndexPath(kind: ListingsHubBreadcrumbKind): string {
	if (kind === 'playbooks') return getRootPathPublicPlaybooksTags();
	if (kind === 'build-backlinks') return getRootPathPublicBuildBacklinksTags();
	return getRootPathPublicBuildingBlocksTags();
}

function listingsHubLabel(kind: ListingsHubBreadcrumbKind): string {
	if (kind === 'playbooks') return PUBLIC_LANDING_BREADCRUMB.playbooksHub;
	if (kind === 'build-backlinks') return PUBLIC_LANDING_BREADCRUMB.buildBacklinksHub;
	return PUBLIC_LANDING_BREADCRUMB.buildingBlocksHub;
}

function listingsHubCategoryPath(kind: ListingsHubBreadcrumbKind, categorySlug: string): string {
	if (kind === 'playbooks') return getRootPathPublicPlaybooksCategory(categorySlug);
	if (kind === 'build-backlinks') return getRootPathPublicBuildBacklinksCategory(categorySlug);
	return getRootPathPublicBuildingBlocksCategory(categorySlug);
}

export function buildListingsHubBreadcrumbItems(params: {
	kind: ListingsHubBreadcrumbKind;
	variant: ListingsHubBreadcrumbVariant;
	categoryLabel?: string | null;
	categorySlug?: string | null;
	tagLabel?: string | null;
	siteLabel?: string | null;
}): BreadcrumbCrumb[] {
	const {
		kind,
		variant,
		categoryLabel = null,
		categorySlug = null,
		tagLabel = null,
		siteLabel = null
	} = params;
	const hubHref = route(listingsHubRootPath(kind));
	const hubLabel = listingsHubLabel(kind);
	const trimmedCategoryLabel = categoryLabel?.trim() ?? '';
	const trimmedCategorySlug = categorySlug?.trim() ?? '';
	const trimmedTagLabel = tagLabel?.trim() ?? '';

	const trail: BreadcrumbCrumb[] = [{ label: 'Home', href: '/' }];

	switch (variant) {
		case 'hub':
			trail.push({ label: hubLabel });
			return trail;
		case 'categories-index':
			trail.push({ label: hubLabel, href: hubHref });
			trail.push({ label: PUBLIC_LANDING_BREADCRUMB.categories });
			return trail;
		case 'tags-index':
			trail.push({ label: hubLabel, href: hubHref });
			trail.push({ label: PUBLIC_LANDING_BREADCRUMB.tags });
			return trail;
		case 'category':
			trail.push({ label: hubLabel, href: hubHref });
			trail.push({ label: trimmedCategoryLabel || PUBLIC_LANDING_BREADCRUMB.categories });
			return trail;
		case 'tag':
			trail.push({ label: hubLabel, href: hubHref });
			trail.push({ label: trimmedTagLabel || PUBLIC_LANDING_BREADCRUMB.tags });
			return trail;
		case 'category-tag': {
			trail.push({ label: hubLabel, href: hubHref });
			const categoryHref = trimmedCategorySlug
				? route(listingsHubCategoryPath(kind, trimmedCategorySlug))
				: route(listingsHubCategoriesIndexPath(kind));
			trail.push({
				label: trimmedCategoryLabel || PUBLIC_LANDING_BREADCRUMB.categories,
				href: categoryHref
			});
			trail.push({ label: trimmedTagLabel || PUBLIC_LANDING_BREADCRUMB.tags });
			return trail;
		}
		case 'site':
			trail.push({ label: hubLabel, href: hubHref });
			trail.push({ label: siteLabel?.trim() || 'Site' });
			return trail;
		default:
			trail.push({ label: hubLabel });
			return trail;
	}
}

export function deriveListingsHubBreadcrumbVariant(params: {
	fixedCategorySlug?: string;
	fixedTagSlug?: string;
	fixedTagGroupSlug?: string;
}): ListingsHubBreadcrumbVariant {
	const { fixedCategorySlug, fixedTagSlug, fixedTagGroupSlug } = params;
	const hasTag = Boolean(fixedTagSlug?.trim() || fixedTagGroupSlug?.trim());
	const hasCategory = Boolean(fixedCategorySlug?.trim());

	if (hasCategory && hasTag) {
		return 'category-tag';
	}
	if (hasCategory) {
		return 'category';
	}
	if (hasTag) {
		return 'tag';
	}
	return 'hub';
}

export function buildApiMarketingLandingBreadcrumbItems(params: {
	capability: PublicApiCapability;
	hubMetaTitle: string;
	platformLabel?: string | null;
}): BreadcrumbCrumb[] {
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

export function buildPricingLandingBreadcrumbItems(): BreadcrumbCrumb[] {
	return [
		{ label: 'Home', href: '/' },
		{ label: PUBLIC_LANDING_BREADCRUMB.pricing }
	];
}

export function buildRoadmapLandingBreadcrumbItems(): BreadcrumbCrumb[] {
	return [
		{ label: 'Home', href: '/' },
		{ label: PUBLIC_LANDING_BREADCRUMB.roadmap }
	];
}

export function buildSelfHostingLandingBreadcrumbItems(): BreadcrumbCrumb[] {
	return [
		{ label: 'Home', href: '/' },
		{ label: PUBLIC_LANDING_BREADCRUMB.selfHosting }
	];
}

export function buildToolsLandingBreadcrumbItems(params: {
	toolLabel: string;
	toolRootPath: string;
	channelLabel?: string | null;
	channelRootPath?: string;
}): BreadcrumbCrumb[] {
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
