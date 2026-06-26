import type { IconName } from '$data/icons';
import type { Component } from 'svelte';

/** Controls docs chrome for pages with `openapi` frontmatter. Default is `reference` (method badge in nav, no right search/TOC rail). */
export type DocsLayoutMode = 'reference' | 'standard';

export interface DocMeta {
	title: string;
	description: string;
	order?: number;
	sidebar?: { label?: string };
	draft?: boolean;
	lastUpdated?: string;
	/** When set (e.g. `POST /integrations/foo`), the doc page loads examples + playground from `GET /api/v1/openapi.json`. */
	openapi?: string;
	/**
	 * Only applies when `openapi` is set. `reference` (default): HTTP badge in the left nav, hide the right “Search / On this page” sidebar.
	 * `standard`: same chrome as non-OpenAPI pages (right sidebar + no HTTP badge).
	 */
	docsLayout?: DocsLayoutMode;
}

export interface DocFile {
	default: Component;
	metadata: DocMeta;
}

export interface DocPage {
	slug: string;
	href: string;
	meta: DocMeta;
	/** Lazy-loaded compiled MD/SVX body (route-level code split). */
	loadContent: () => Promise<Component>;
}

export interface NavItem {
	title: string;
	href?: string;
	items?: NavItem[];
	order?: number;
	isActive?: boolean;
	iconName?: IconName;
	/** Compact HTTP verb for OpenAPI reference pages (left sidebar), e.g. `GET`, `POST`, `DEL`. */
	httpMethod?: string;
}

export interface SiteConfig {
	title: string;
	description: string;
	url?: string;
	logo?: string;
	logoDark?: string;
	favicon?: string;
	social?: {
		github?: string;
		twitter?: string;
		discord?: string;
	};
}

export interface VersionConfig {
	current: string;
	versions: { label: string; href: string }[];
}

export interface LocaleConfig {
	defaultLocale: string;
	locales: { code: string; label: string; flag?: string }[];
}

export interface SidebarSection {
	label: string;
	autogenerate?: { directory: string };
	items?: { label: string; href: string }[];
	icon?: IconName;
}

export type DocsDocTabId = 'cli' | 'public-api' | 'mcp' | 'learn-more';

export interface DocsTabDefinition {
	id: DocsDocTabId;
	label: string;
	sidebar: SidebarSection[];
}

export interface DocsConfig {
	site: SiteConfig;
	sidebar: SidebarSection[];
	/** Primary docs areas (CLI, Public API, MCP, Learn more); sidebar chrome is scoped to the active tab. */
	tabs?: DocsTabDefinition[];
	toc?: { minDepth?: number; maxDepth?: number };
	versions?: VersionConfig;
	i18n?: LocaleConfig;
}

export interface TableOfContentsItem {
	id: string;
	text: string;
	depth: number;
}
