import type { LinkDirectoryCtaKind } from '$lib/link-directory/link-directory.types';

const CONNECT_CHANNELS_DOC = '/docs/channels/connect';
const CREATING_POSTS_DOC = '/docs/creating-posts';
const PLUGS_DOC = '/docs/getting-started-for-public-api';

export type ResolvedOpportunityCta = {
	href: string;
	label: string;
	external: boolean;
};

export function resolveOpportunityCta(params: {
	kind: LinkDirectoryCtaKind;
	channelSlug: string | null;
	ctaHref: string | null;
	ctaLabel: string | null;
}): ResolvedOpportunityCta | null {
	const { kind, channelSlug, ctaHref, ctaLabel } = params;

	switch (kind) {
		case 'connect_channel':
			return {
				href: CONNECT_CHANNELS_DOC,
				label: ctaLabel?.trim() || (channelSlug ? `Connect ${channelSlug}` : 'Connect channel'),
				external: false
			};
		case 'schedule_post':
			return {
				href: CREATING_POSTS_DOC,
				label: ctaLabel?.trim() || 'Creating posts guide',
				external: false
			};
		case 'use_plug':
			return {
				href: PLUGS_DOC,
				label: ctaLabel?.trim() || 'Plugs and automation',
				external: false
			};
		case 'external_doc':
			if (ctaHref?.trim()) {
				return {
					href: ctaHref.trim(),
					label: ctaLabel?.trim() || 'Open setup guide',
					external: true
				};
			}
			return null;
		case 'none':
		default:
			if (ctaHref?.trim()) {
				return {
					href: ctaHref.trim(),
					label: ctaLabel?.trim() || 'Submit',
					external: true
				};
			}
			return null;
	}
}
