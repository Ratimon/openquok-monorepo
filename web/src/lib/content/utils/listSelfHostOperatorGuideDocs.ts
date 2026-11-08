import { getDocsByDirectory } from '$lib/docs/content';
import { route } from '$lib/utils/path';

export const SELF_HOST_SOCIAL_INTEGRATION_DOCS_DIRECTORY = 'social-integration';
export const SELF_HOST_DIRECTORY_INTEGRATION_DOCS_DIRECTORY = 'directory-integration';

export type SelfHostOperatorGuideDocEntry = {
	/** Leaf slug (`threads`, `peerpush`, …). */
	slug: string;
	/** Full docs slug (`social-integration/threads`). */
	docSlug: string;
	title: string;
	description: string;
	href: string;
	order: number;
};

function leafSlugFromDocSlug(docSlug: string, directory: string): string {
	if (docSlug === directory) return directory;
	const prefix = `${directory}/`;
	return docSlug.startsWith(prefix) ? docSlug.slice(prefix.length) : docSlug;
}

/** Requires `preloadDocsRegistry()` — reads setup guides from the docs registry. */
export function listSelfHostOperatorGuideDocEntries(directory: string): SelfHostOperatorGuideDocEntry[] {
	const entries = getDocsByDirectory(directory)
		.filter((doc) => doc.slug !== directory)
		.map((doc) => ({
			order: doc.meta.order ?? 999,
			slug: leafSlugFromDocSlug(doc.slug, directory),
			docSlug: doc.slug,
			title: doc.meta.sidebar?.label ?? doc.meta.title,
			description: doc.meta.description ?? '',
			href: route(doc.href.replace(/^\//, ''))
		}));

	return entries
		.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
		.map(({ order, slug, docSlug, title, description, href }) => ({
			order,
			slug,
			docSlug,
			title,
			description,
			href
		}));
}

/** Footer hub rows (`platformLabel` + `href`) for one self-host operator docs section. */
export function listSelfHostOperatorGuideFooterEntries(
	directory: string
): { platformLabel: string; href: string }[] {
	return listSelfHostOperatorGuideDocEntries(directory).map(({ title, href }) => ({
		platformLabel: title,
		href
	}));
}
