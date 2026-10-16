import type { ZodIssue } from 'zod';

export type BusinessProfileComposerTab = 'general' | 'media' | 'socials' | 'sell';

const FIELD_LABELS: Record<string, string> = {
	name: 'Product name',
	tagline: 'Tagline',
	description: 'Rich description',
	websiteUrl: 'Website URL',
	logoUrl: 'Logo',
	'profileData.slug': 'Directory slug',
	'profileData.category': 'Category',
	'profileData.pricing_type': 'Pricing',
	'profileData.tags': 'Tags',
	'profileData.repository_url': 'Repository URL',
	'profileData.launch_video_url': 'Launch video URL',
	'profileData.social_x': 'X (Twitter)',
	'profileData.social_github': 'GitHub',
	'profileData.social_instagram': 'Instagram',
	'profileData.social_linkedin': 'LinkedIn',
	'profileData.social_tiktok': 'TikTok',
	'profileData.social_facebook': 'Facebook',
	'profileData.social_youtube': 'YouTube',
	'profileData.social_bluesky': 'Bluesky',
	'profileData.selling_reason': 'Selling reason',
	'profileData.asking_price_usd': 'Asking price',
	'profileData.ttm_revenue_usd': 'TTM revenue',
	'profileData.monthly_revenue_usd': 'Monthly revenue',
	'profileData.ttm_profit_usd': 'TTM profit',
	'profileData.monthly_profit_usd': 'Monthly profit',
	'profileData.included_assets': 'Included assets'
};

export function businessProfileFieldKeyFromIssue(path: (string | number)[]): string {
	if (path[0] === 'profileData' && path.length >= 2) {
		return `profileData.${String(path[1])}`;
	}
	return String(path[0] ?? 'form');
}

export function businessProfileTabForFieldKey(key: string): BusinessProfileComposerTab {
	if (key.startsWith('profileData.social_')) return 'socials';
	if (key === 'logoUrl' || key === 'profileData.launch_video_url' || key === 'profileData.gallery_urls') {
		return 'media';
	}
	if (
		key === 'profileData.acquisition_listed' ||
		key === 'profileData.selling_reason' ||
		key === 'profileData.asking_price_usd' ||
		key === 'profileData.ttm_revenue_usd' ||
		key === 'profileData.monthly_revenue_usd' ||
		key === 'profileData.ttm_profit_usd' ||
		key === 'profileData.monthly_profit_usd' ||
		key === 'profileData.included_assets'
	) {
		return 'sell';
	}
	return 'general';
}

export function businessProfileFieldLabel(key: string): string {
	return FIELD_LABELS[key] ?? key.replace(/^profileData\./, '').replace(/_/g, ' ');
}

export type BusinessProfileFormValidationResult = {
	fieldErrors: Record<string, string>;
	toastMessage: string;
	firstTabWithError: BusinessProfileComposerTab | null;
};

export function parseBusinessProfileFormIssues(issues: ZodIssue[]): BusinessProfileFormValidationResult {
	const fieldErrors: Record<string, string> = {};
	let firstTabWithError: BusinessProfileComposerTab | null = null;

	for (const issue of issues) {
		const key = businessProfileFieldKeyFromIssue(issue.path);
		const message = issue.message?.trim() || 'Invalid value';
		if (!fieldErrors[key]) {
			fieldErrors[key] = message;
			if (!firstTabWithError) {
				firstTabWithError = businessProfileTabForFieldKey(key);
			}
		}
	}

	const toastLines = Object.entries(fieldErrors).map(
		([key, message]) => `${businessProfileFieldLabel(key)}: ${message}`
	);

	return {
		fieldErrors,
		toastMessage:
			toastLines.length > 0 ? toastLines.join(' · ') : 'Fix the highlighted fields and try again.',
		firstTabWithError
	};
}
