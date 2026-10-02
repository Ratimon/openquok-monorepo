import { getRootPathPublicBuildBacklinksTag } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
import { resolveBuildBacklinksTagSlug } from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';
import { linkDirectoryRepository } from '$lib/link-directory/index';
import { loadBuildBacklinksHubPage } from '$lib/link-directory/server/loadBuildBacklinksHubPage.server';
import { formatBuildBacklinksFilterHeroTitle } from '$lib/link-directory/utils/formatBuildBacklinksFilterHeroTitle';

export const ssr = true;

export async function load(event) {
	const tagSlug = typeof event.params.slug === 'string' ? event.params.slug : '';
	const resolved = resolveBuildBacklinksTagSlug(tagSlug);
	const tags = await linkDirectoryRepository.getActiveTags(event.fetch);
	const detail = tags.find((tag) => tag.slug === tagSlug);

	const tagName =
		detail?.name ??
		(resolved.kind === 'virtual' ? resolved.tag.name : tagSlug);
	const heroTitle = formatBuildBacklinksFilterHeroTitle(tagName);
	const heroDescription =
		detail?.description?.trim() ||
		(resolved.kind === 'virtual' ? resolved.tag.description : undefined) ||
		`Sites tagged ${tagName} in the backlink directory.`;

	return loadBuildBacklinksHubPage(event, {
		fixedTagSlug: tagSlug,
		heroTitle,
		heroDescription,
		customSlug: getRootPathPublicBuildBacklinksTag(tagSlug),
		tagTermName: tagName,
		tagTermDescription:
			detail?.description?.trim() ||
			(resolved.kind === 'virtual' ? resolved.tag.description : undefined)
	});
}
