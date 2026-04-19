import type { IconName } from '$data/icon';
import type { Component } from 'svelte';

export interface DocMeta {
	title: string;
	description: string;
	order?: number;
	sidebar?: { label?: string };
	draft?: boolean;
	lastUpdated?: string;
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

export interface DocsConfig {
	site: SiteConfig;
	sidebar: SidebarSection[];
	toc?: { minDepth?: number; maxDepth?: number };
	versions?: VersionConfig;
	i18n?: LocaleConfig;
}

export interface TableOfContentsItem {
	id: string;
	text: string;
	depth: number;
}
