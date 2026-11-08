import { icons } from '$data/icons';
import type { IconName } from '$data/icons';

import { getRootPathPublicBrowserExtensionLanding } from '$lib/area-public/constants/getRootPathPublicBrowserExtensionLanding';
import type { PublicSelfHostingLinkCardItem } from '$lib/content/constants/marketing/self-hosting-landing';
import {
	listSelfHostOperatorGuideDocEntries,
	SELF_HOST_DIRECTORY_INTEGRATION_DOCS_DIRECTORY,
	SELF_HOST_SOCIAL_INTEGRATION_DOCS_DIRECTORY,
	type SelfHostOperatorGuideDocEntry
} from '$lib/content/utils/listSelfHostOperatorGuideDocs';
import { faqHrefDocs } from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

const DEFAULT_DOC_CARD_VISUAL = {
	iconName: icons.Link.name,
	iconContainerClass: 'bg-primary/10 text-primary ring-primary/20',
	iconClass: 'size-5'
} as const;

type SelfHostIntegrationDocCardVisual = {
	iconName: IconName;
	iconContainerClass: string;
	iconClass?: string;
	/** Optional card blurb when the docs `description` is too long or off-tone for the grid. */
	description?: string;
};

const SELF_HOST_INTEGRATION_DOC_CARD_VISUALS: Record<string, SelfHostIntegrationDocCardVisual> = {
	threads: {
		iconName: icons.Threads.name,
		iconContainerClass: 'bg-neutral-900 text-white ring-neutral-700/40',
		iconClass: 'size-5',
		description: 'Register your Meta app and connect Threads to your instance.'
	},
	instagram: {
		iconName: icons.Instagram.name,
		iconContainerClass:
			'bg-gradient-to-br from-[#f09433]/25 via-[#e6683c]/25 to-[#bc1888]/25 text-pink-600 ring-pink-500/25',
		iconClass: 'size-5',
		description: 'Get Instagram API access and link it to OpenQuok.'
	},
	facebook: {
		iconName: icons.Facebook.name,
		iconContainerClass: 'bg-[#1877F2] text-white ring-[#1877F2]/30',
		iconClass: 'size-5',
		description: 'Set up a Meta app for Facebook Page posting.'
	},
	youtube: {
		iconName: icons.YouTube.name,
		iconContainerClass: 'bg-[#FF0000] text-white ring-red-500/30',
		iconClass: 'size-5',
		description: 'Turn on YouTube in Google Cloud and connect it.'
	},
	tiktok: {
		iconName: icons.TikTok.name,
		iconContainerClass: 'bg-neutral-950 text-white ring-neutral-800/40',
		iconClass: 'size-5',
		description: 'Register a TikTok developer app and add your callback URL.'
	},
	linkedin: {
		iconName: icons.LinkedIn.name,
		iconContainerClass: 'bg-[#0A66C2] text-white ring-[#0A66C2]/30',
		iconClass: 'size-5',
		description: 'Create a LinkedIn app and connect personal profiles.'
	},
	'linkedin-page': {
		iconName: icons.LinkedIn.name,
		iconContainerClass: 'bg-[#0A66C2] text-white ring-[#0A66C2]/30',
		iconClass: 'size-5',
		description: 'Set up posting to a LinkedIn Company Page.'
	},
	x: {
		iconName: icons.X.name,
		iconContainerClass: 'bg-neutral-800 text-white ring-neutral-700/40',
		iconClass: 'size-5',
		description: 'Register an X developer app and add your callback URLs.'
	},
	devto: {
		iconName: icons.Devto.name,
		iconContainerClass: 'bg-[#0a0a0a] text-white ring-neutral-800/40',
		iconClass: 'size-5',
		description: 'No app needed — users add their own API key in the dashboard.'
	},
	bluesky: {
		iconName: icons.Bluesky.name,
		iconContainerClass: 'bg-[#0085FF]/15 text-[#0085FF] ring-[#0085FF]/25',
		iconClass: 'size-5',
		description: 'No operator app — users connect with an app password in the dashboard.'
	},
	skool: {
		iconName: icons.SkoolGlyph.name,
		iconContainerClass: 'bg-violet-500/15 text-violet-600 ring-violet-500/25',
		iconClass: 'size-5'
	},
	reddit: {
		iconName: icons.Reddit.name,
		iconContainerClass: 'bg-orange-500/15 text-orange-600 ring-orange-500/30',
		iconClass: 'size-5'
	},
	peerpush: {
		iconName: icons.PeerPush.name,
		iconContainerClass: 'bg-sky-500/15 text-sky-700 ring-sky-500/25',
		iconClass: 'size-5'
	},
	uneed: {
		iconName: icons.Uneed.name,
		iconContainerClass: 'bg-amber-500/15 text-amber-800 ring-amber-500/25',
		iconClass: 'size-5'
	}
};

const browserExtensionLandingPath = route(getRootPathPublicBrowserExtensionLanding());

const SELF_HOSTING_SOCIAL_INTEGRATION_LINK_CARD_PREFIX: readonly PublicSelfHostingLinkCardItem[] = [
	{
		id: 'social-integration-browser-extension',
		title: 'Browser extension',
		description:
			'Side-panel scheduling, Skool connect, and Reddit handoff on your self-host URL.',
		href: browserExtensionLandingPath,
		ctaLabel: 'View product page',
		iconName: icons.CustomizedDrawnLaptop.name,
		iconContainerClass: 'bg-primary/10 text-primary ring-primary/20',
		iconClass: 'size-5'
	},
	{
		id: 'social-integration-overview',
		title: 'Connections overview',
		description: 'What you set up vs what your team connects in the app.',
		href: faqHrefDocs(SELF_HOST_SOCIAL_INTEGRATION_DOCS_DIRECTORY),
		ctaLabel: 'Open overview',
		iconName: icons.Link.name,
		iconContainerClass: 'bg-primary/10 text-primary ring-primary/20',
		iconClass: 'size-5'
	}
];

const SELF_HOSTING_DIRECTORY_INTEGRATION_LINK_CARD_PREFIX: readonly PublicSelfHostingLinkCardItem[] =
	[
		{
			id: 'directory-integration-overview',
			title: 'Directory launch overview',
			description:
				'Extension handoff, profile fields, and operator-maintained destination catalogs.',
			href: faqHrefDocs(SELF_HOST_DIRECTORY_INTEGRATION_DOCS_DIRECTORY),
			ctaLabel: 'Open overview',
			iconName: icons.Globe.name,
			iconContainerClass: 'bg-primary/10 text-primary ring-primary/20',
			iconClass: 'size-5'
		},
		{
			id: 'directory-integration-browser-extension',
			title: 'Browser extension',
			description: 'Autofill directory submit forms and launch handoff from your self-host origin.',
			href: browserExtensionLandingPath,
			ctaLabel: 'View product page',
			iconName: icons.CustomizedDrawnLaptop.name,
			iconContainerClass: 'bg-primary/10 text-primary ring-primary/20',
			iconClass: 'size-5'
		}
	];

function docEntryToLinkCard(
	directory: string,
	entry: SelfHostOperatorGuideDocEntry
): PublicSelfHostingLinkCardItem {
	const visual = SELF_HOST_INTEGRATION_DOC_CARD_VISUALS[entry.slug] ?? DEFAULT_DOC_CARD_VISUAL;

	return {
		id: `${directory}-${entry.slug}`,
		title: entry.title,
		description: visual.description ?? entry.description,
		href: entry.href,
		ctaLabel: 'Open guide',
		iconName: visual.iconName,
		iconContainerClass: visual.iconContainerClass,
		iconClass: visual.iconClass
	};
}

/** Requires `preloadDocsRegistry()` — social posting operator guides for `/self-hosting`. */
export function buildPublicSelfHostingSocialIntegrationLinkCards(): PublicSelfHostingLinkCardItem[] {
	const socialDocCards = listSelfHostOperatorGuideDocEntries(
		SELF_HOST_SOCIAL_INTEGRATION_DOCS_DIRECTORY
	).map((entry) => docEntryToLinkCard(SELF_HOST_SOCIAL_INTEGRATION_DOCS_DIRECTORY, entry));

	return [...SELF_HOSTING_SOCIAL_INTEGRATION_LINK_CARD_PREFIX, ...socialDocCards];
}

/** Requires `preloadDocsRegistry()` — directory launch operator guides for `/self-hosting`. */
export function buildPublicSelfHostingDirectoryIntegrationLinkCards(): PublicSelfHostingLinkCardItem[] {
	const directoryDocCards = listSelfHostOperatorGuideDocEntries(
		SELF_HOST_DIRECTORY_INTEGRATION_DOCS_DIRECTORY
	).map((entry) => docEntryToLinkCard(SELF_HOST_DIRECTORY_INTEGRATION_DOCS_DIRECTORY, entry));

	return [...SELF_HOSTING_DIRECTORY_INTEGRATION_LINK_CARD_PREFIX, ...directoryDocCards];
}
