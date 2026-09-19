export const PAYLOAD_WIZARD_DOCS_BANNER = {
	docsPath: '/docs/getting-started-for-public-api',
	title: 'Read the Public API guide',
	description:
		'Auth, integration UUIDs, and POST /public/posts request shape — then copy a payload from this wizard into your integration.',
	ctaText: 'Public API docs'
} as const;

export function accentSplitPayloadWizardChannelCtaBannerTitle(label: string): string {
	return `Explore the ${label} posting API`;
}

export function accentSplitPayloadWizardChannelCtaBannerDescription(label: string): string {
	return `See ${label} limits, format examples, and provider settings on the posting API landing page before you ship your integration.`;
}

export function accentSplitPayloadWizardChannelCtaBannerText(label: string): string {
	return `View ${label} posting API`;
}
