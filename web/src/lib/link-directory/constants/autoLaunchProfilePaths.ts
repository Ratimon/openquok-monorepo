/** Common `profilePath` values for `extension_config.steps[].fields` (matches product profile snapshot). */
export const linkDirectoryAutoLaunchProfilePathOptions = [
	{ value: 'name', label: 'Product name' },
	{ value: 'tagline', label: 'Tagline' },
	{ value: 'description', label: 'Description' },
	{ value: 'website_url', label: 'Website URL' },
	{ value: 'logo_url', label: 'Logo URL' },
	{ value: 'profile_data.pricing_type', label: 'Pricing type (profile_data)' },
	{ value: 'profile_data.categories', label: 'Categories (profile_data)' },
	{ value: 'profile_data.twitter_url', label: 'Twitter URL (profile_data)' },
	{ value: 'profile_data.github_url', label: 'GitHub URL (profile_data)' }
] as const;
