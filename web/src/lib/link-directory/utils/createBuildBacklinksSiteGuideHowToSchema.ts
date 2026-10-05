import type { HowTo } from 'schema-dts';

import { buildPublicFeaturesOrderedHowToSchemas } from '$lib/content/utils/createPublicSetupStepsSEOSchema';
import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';
import {
	buildBuildBacklinksGuideSections,
	listBuildBacklinksGuideOpportunityHowToSections,
	sortPublishedOpportunities
} from '$lib/link-directory/utils/buildBuildBacklinksGuideSections';

export { sortPublishedOpportunities };

function buildGuideSectionsForSite(params: {
	canonicalUrl: string;
	siteTitle: string;
	siteDescription?: string | null;
	opportunities: LinkDirectoryOpportunityDto[];
}) {
	const { canonicalUrl, siteTitle, siteDescription, opportunities } = params;

	return buildBuildBacklinksGuideSections({
		canonical: canonicalUrl,
		site: {
			title: siteTitle,
			shortDescription: siteDescription ?? null,
			opportunities
		}
	});
}

/** Site-level HowTo: each published opportunity is one ordered playbook step. */
export function createBuildBacklinksSiteGuideHowToSchema(params: {
	canonicalUrl: string;
	siteTitle: string;
	siteDescription?: string | null;
	opportunities: LinkDirectoryOpportunityDto[];
}): HowTo | Record<string, never> {
	const sections = buildGuideSectionsForSite(params);
	const [siteHowTo] = buildPublicFeaturesOrderedHowToSchemas({
		pageUrl: params.canonicalUrl,
		sections: sections.filter((section) => section.sectionId === 'howto-site')
	});
	return siteHowTo ?? {};
}

/** Per-opportunity HowTo from JSON sub-steps (when present). */
export function createBuildBacklinksOpportunityHowToSchemas(params: {
	canonicalUrl: string;
	opportunities: LinkDirectoryOpportunityDto[];
}): Array<HowTo | Record<string, never>> {
	const sections = buildBuildBacklinksGuideSections({
		canonical: params.canonicalUrl,
		site: {
			title: 'Site',
			shortDescription: null,
			opportunities: params.opportunities
		}
	});

	return buildPublicFeaturesOrderedHowToSchemas({
		pageUrl: params.canonicalUrl,
		sections: listBuildBacklinksGuideOpportunityHowToSections(sections)
	}).filter((node) => Object.keys(node).length > 0);
}
