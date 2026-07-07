import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

export type PhotoEditorFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
};

const PLATFORM_FORMATS_FAQ_TITLE =
	'What if I need sizes for a specific platform (e.g. Instagram)?';

const GENERIC_PHOTO_EDITOR_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: 'What is the OpenQuok Photo Editor?',
		description:
			'A free browser-based design canvas. Resize images for social channels, add text and elements from templates or stock photos, and download a PNG — or save to your cloud library when you are signed in.'
	},
	{
		title: 'Do I need an OpenQuok account?',
		description:
			'No for editing and downloading PNGs. Sign in when you want to save designs to your media library and reuse them in the composer.'
	},
	{
		title: 'Which aspect ratios are supported?',
		description:
			'General presets (square, landscape, portrait) plus platform tabs for Facebook, Instagram, Threads, TikTok, YouTube, LinkedIn, and X. Channel pages open with that network’s first recommended preset selected.'
	},
	{
		title: 'Can I use stock photos and templates?',
		description:
			'Yes. Search stock images, browse design templates, upload your own files, and compose on the canvas. Exports are PNG files sized to your chosen preset.'
	},
	{
		title: PLATFORM_FORMATS_FAQ_TITLE,
		description:
			'Stay on this page for General presets, or scroll to the By channel section and pick a network — Facebook, Instagram, X, and others. Each channel page opens with platform-specific aspect ratios already selected.'
	}
];

function tailorPhotoEditorFaqItem(
	item: PublicFaqItem,
	channelSlug: string,
	platformLabel: string
): PublicFaqItem {
	switch (item.title) {
		case 'What is the OpenQuok Photo Editor?':
			return {
				title: item.title,
				description: `A free browser-based design canvas for ${platformLabel}. Resize images for ${platformLabel} feeds, stories, and covers, add text and elements, and download a PNG — or save to your cloud library when you are signed in. This ${channelSlug} page opens with ${platformLabel} aspect presets pre-selected.`
			};
		case 'Do I need an OpenQuok account?':
			return item;
		case 'Which aspect ratios are supported?':
			return {
				title: item.title,
				description: `This page focuses on ${platformLabel} presets — feed, story, reel, and cover sizes where applicable. Switch presets in the canvas toolbar or pick another channel in the By channel section for a different network.`
			};
		case 'Can I use stock photos and templates?':
			return item;
		case PLATFORM_FORMATS_FAQ_TITLE:
			return {
				title: `What's included for ${platformLabel}?`,
				description: `This page opens with ${platformLabel} canvas sizes already selected so you are not guessing dimensions. Pick feed, story, or cover presets from the toolbar, design on the canvas, then download or save to your library. For another platform, choose a different channel in the By channel section or use the generic Photo Editor for General presets.`
			};
		default:
			return item;
	}
}

function buildChannelPhotoEditorFaqItems(
	channelSlug: string,
	platformLabel: string
): PublicFaqItem[] {
	const slug = channelSlug.trim().toLowerCase();
	const label = platformLabel.trim();

	return GENERIC_PHOTO_EDITOR_FAQ_ITEMS.map((item) =>
		tailorPhotoEditorFaqItem(item, slug, label)
	);
}

export function buildPhotoEditorFaqSection(
	channelSlug?: string | null,
	channelLabel?: string | null
): PhotoEditorFaqSection {
	const slug = channelSlug?.trim().toLowerCase();
	const label = channelLabel?.trim();

	if (slug && label) {
		return {
			faqSubtitle: 'Photo Editor FAQs',
			faqTitle: `${label} Photo Editor, answered`,
			faqDescription: `How the canvas works, which ${label} sizes are available, and when to sign in to save designs to your library.`,
			faqItems: buildChannelPhotoEditorFaqItems(slug, label)
		};
	}

	return {
		faqSubtitle: 'Photo Editor FAQs',
		faqTitle: 'Photo Editor, answered',
		faqDescription:
			'How the canvas works, which aspect ratios are available, and when to sign in to save designs to your library.',
		faqItems: [...GENERIC_PHOTO_EDITOR_FAQ_ITEMS]
	};
}
