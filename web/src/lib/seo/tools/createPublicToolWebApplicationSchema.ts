import type { SoftwareApplication, Thing, WebApplication } from 'schema-dts';

/** Schema.org `applicationCategory` values used on public tool pages. */
export type PublicToolApplicationCategory =
	| 'BusinessApplication'
	| 'DesignApplication'
	| 'DeveloperApplication'
	| 'UtilitiesApplication';

export type CreatePublicToolWebApplicationSchemaParams = {
	canonicalUrl: string;
	name: string;
	description: string;
	applicationCategory: PublicToolApplicationCategory;
	siteOrigin: string;
	companyName: string;
	/** Visible product capabilities — maps to `featureList` on WebApplication. */
	featureList?: readonly string[];
	/** Channel pSEO pages: the social network the tool page targets (`about`). */
	aboutChannelLabel?: string | null;
};

/**
 * JSON-LD `WebApplication` for `/tools/*` hub and channel routes.
 * @see https://schema.org/WebApplication
 */
export function createPublicToolWebApplicationSchema(
	params: CreatePublicToolWebApplicationSchemaParams
): WebApplication {
	const {
		canonicalUrl,
		name,
		description,
		applicationCategory,
		siteOrigin,
		companyName,
		featureList,
		aboutChannelLabel
	} = params;

	const aboutLabel = aboutChannelLabel?.trim();
	const about: Thing | undefined = aboutLabel
		? {
				'@type': 'Thing',
				name: aboutLabel
			}
		: undefined;

	const features =
		featureList && featureList.length > 0
			? featureList.map((item) => item.trim()).filter(Boolean)
			: undefined;

	return {
		'@type': 'WebApplication',
		'@id': `${canonicalUrl}#webapp`,
		name,
		description,
		applicationCategory,
		url: canonicalUrl,
		...(features?.length ? { featureList: features } : {}),
		...(about ? { about } : {}),
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		isPartOf: {
			'@type': 'WebSite',
			name: companyName,
			url: siteOrigin
		}
	} satisfies SoftwareApplication;
}
