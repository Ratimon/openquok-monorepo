import type { BusinessProfileIncludedAssetSlug } from 'openquok-common';
import { BUSINESS_PROFILE_INCLUDED_ASSET_SLUGS } from 'openquok-common';

export const BUSINESS_PROFILE_INCLUDED_ASSET_LABELS: Record<BusinessProfileIncludedAssetSlug, string> =
	{
		domain: 'Domain name',
		source_code: 'Source code',
		social_accounts: 'Social accounts',
		customer_list: 'Customer list',
		brand_assets: 'Brand assets',
		intellectual_property: 'Intellectual property',
		contracts: 'Contracts',
		inventory: 'Inventory'
	};

export const BUSINESS_PROFILE_INCLUDED_ASSET_OPTIONS = BUSINESS_PROFILE_INCLUDED_ASSET_SLUGS.map(
	(slug) => ({
		slug,
		label: BUSINESS_PROFILE_INCLUDED_ASSET_LABELS[slug]
	})
);
