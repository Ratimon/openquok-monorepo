import type { PublicOpportunitiesNavTab } from '$lib/config/constants/config';
import {
	getRootPathPublicBuildBacklinks,
	getRootPathPublicBuildBacklinksCategories,
	getRootPathPublicBuildBacklinksTags
} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import {
	getRootPathPublicBuildingBlocks,
	getRootPathPublicBuildingBlocksCategories,
	getRootPathPublicBuildingBlocksTags
} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
import {
	getRootPathPublicPlaybooks,
	getRootPathPublicPlaybooksCategories,
	getRootPathPublicPlaybooksTags
} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
import { route } from '$lib/utils/path';

export type PublicOpportunitiesNavLinkKey =
	| 'see-all'
	| 'categories'
	| 'tags'
	| 'skill-builder'
	| 'openquok-core'
	| 'skills'
	| 'mcp'
	| 'both';

export type PublicOpportunitiesNavLinkCatalogItem = {
	key: PublicOpportunitiesNavLinkKey;
	label: string;
	/** App path (leading slash), may include query string. */
	pathname: string;
	description: string;
};

export type PublicOpportunitiesNavSectionCatalog = {
	id: PublicOpportunitiesNavTab;
	label: string;
	blurb: string;
	links: readonly PublicOpportunitiesNavLinkCatalogItem[];
};

const buildingBlocksHub = route(getRootPathPublicBuildingBlocks());

/** Source of truth for Opportunities mega-menu links (UI + JSON-LD). */
export const PUBLIC_OPPORTUNITIES_NAV_SECTIONS: readonly PublicOpportunitiesNavSectionCatalog[] = [
	{
		id: 'backlinks',
		label: 'Backlinks',
		blurb: 'Discover sites and link-building tactics for your stack.',
		links: [
			{
				key: 'see-all',
				label: 'See All',
				pathname: route(getRootPathPublicBuildBacklinks()),
				description: 'Browse sites and tactics for earning backlinks.'
			},
			{
				key: 'categories',
				label: 'Categories',
				pathname: route(getRootPathPublicBuildBacklinksCategories()),
				description: 'Explore backlink opportunities by category.'
			},
			{
				key: 'tags',
				label: 'Tags',
				pathname: route(getRootPathPublicBuildBacklinksTags()),
				description: 'Filter sites by tag.'
			}
		]
	},
	{
		id: 'playbook',
		label: 'Playbooks',
		blurb: 'Browse playbooks, categories, or jump into the Skill Builder.',
		links: [
			{
				key: 'see-all',
				label: 'See All',
				pathname: route(getRootPathPublicPlaybooks()),
				description: 'Browse every published playbook.'
			},
			{
				key: 'categories',
				label: 'Categories',
				pathname: route(getRootPathPublicPlaybooksCategories()),
				description: 'Explore playbooks by category.'
			},
			{
				key: 'tags',
				label: 'Tags',
				pathname: route(getRootPathPublicPlaybooksTags()),
				description: 'Filter playbooks by tag.'
			},
			{
				key: 'skill-builder',
				label: 'Skill Builder',
				pathname: route(getRootPathPublicSkillBuilder()),
				description: 'Build and export a SKILL.md from building blocks.'
			}
		]
	},
	{
		id: 'building-blocks',
		label: 'Building Blocks',
		blurb: 'Explore skills, MCP servers, and combo listings for your agents.',
		links: [
			{
				key: 'see-all',
				label: 'See All',
				pathname: buildingBlocksHub,
				description: 'Browse every published building block.'
			},
			{
				key: 'categories',
				label: 'Categories',
				pathname: route(getRootPathPublicBuildingBlocksCategories()),
				description: 'Explore building blocks by category.'
			},
			{
				key: 'tags',
				label: 'Tags',
				pathname: route(getRootPathPublicBuildingBlocksTags()),
				description: 'Filter building blocks by tag.'
			},
			{
				key: 'openquok-core',
				label: 'OpenQuok Core',
				pathname: `${buildingBlocksHub}?type=official`,
				description: 'First-party building blocks from OpenQuok.'
			},
			{
				key: 'skills',
				label: 'Skills',
				pathname: `${buildingBlocksHub}?type=skills`,
				description: 'Browse skills-only building blocks.'
			},
			{
				key: 'mcp',
				label: 'MCP',
				pathname: `${buildingBlocksHub}?type=mcp`,
				description: 'Browse MCP-only building blocks.'
			},
			{
				key: 'both',
				label: 'Both',
				pathname: `${buildingBlocksHub}?type=both`,
				description: 'Listings that ship skills and MCP together.'
			}
		]
	}
];
