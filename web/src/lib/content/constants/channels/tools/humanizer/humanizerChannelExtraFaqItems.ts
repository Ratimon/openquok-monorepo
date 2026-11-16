import type { PublicFaqItem } from '$lib/content/constants/faq';

import { buildChannelFaqLinks, buildToolChannelFaqLinks, faqLink } from '$lib/content/utils/publicFaqLinks';

const THREADS_DOCS = '/docs/social-integration/threads';
const TIKTOK_DOCS = '/docs/social-integration/tiktok';
const LINKEDIN_DOCS = '/docs/social-integration/linkedin';

function threadsHumanizerExtraFaq(): PublicFaqItem {
	const channelLinks = buildChannelFaqLinks('threads', THREADS_DOCS);
	const humanizerLinks = buildToolChannelFaqLinks('humanizer', 'threads');
	const photoEditorLinks = buildToolChannelFaqLinks('photo-editor', 'threads');
	return {
		title: 'Is there a free Threads post humanizer?',
		description: `Yes. This ${faqLink(humanizerLinks.toolChannel, 'Threads Humanizer')} rewrites AI drafts for the 500-character cap with no sign up. Human mode cleans stock phrasing; Roughen sounds more spoken. Size thread images in the ${faqLink(photoEditorLinks.toolChannel, 'Threads photo editor')}, then schedule from ${faqLink(channelLinks.channelLanding, 'Threads in OpenQuok')} when you connect a profile.`
	};
}

function tiktokHumanizerExtraFaq(): PublicFaqItem {
	const channelLinks = buildChannelFaqLinks('tiktok', TIKTOK_DOCS);
	const humanizerLinks = buildToolChannelFaqLinks('humanizer', 'tiktok');
	const photoEditorLinks = buildToolChannelFaqLinks('photo-editor', 'tiktok');
	return {
		title: 'Is there a free TikTok video caption humanizer?',
		description: `Yes. Use this ${faqLink(humanizerLinks.toolChannel, 'TikTok Humanizer')} to tighten captions before you publish short video or carousel posts. Work stays in the browser until you copy or sign in. Pair carousel stills from the ${faqLink(photoEditorLinks.toolChannel, 'TikTok photo editor')} with scheduled posts on ${faqLink(channelLinks.channelLanding, 'TikTok in OpenQuok')}.`
	};
}

function linkedinHumanizerExtraFaq(): PublicFaqItem {
	const channelLinks = buildChannelFaqLinks('linkedin', LINKEDIN_DOCS);
	const humanizerLinks = buildToolChannelFaqLinks('humanizer', 'linkedin');
	const photoEditorLinks = buildToolChannelFaqLinks('photo-editor', 'linkedin');
	return {
		title: 'Is there a LinkedIn post humanizer?',
		description: `Yes. This ${faqLink(humanizerLinks.toolChannel, 'LinkedIn Humanizer')} rewrites B2B drafts up to LinkedIn’s 3,000-character preview — free, with no sign up required. Drop stock phrasing before you queue thought leadership or document carousels. Add link-preview art from the ${faqLink(photoEditorLinks.toolChannel, 'LinkedIn photo editor')}, then publish through ${faqLink(channelLinks.channelLanding, 'LinkedIn in OpenQuok')}.`
	};
}

const HUMANIZER_CHANNEL_EXTRA_FAQ_BY_SLUG: Readonly<Record<string, readonly PublicFaqItem[]>> = {
	threads: [threadsHumanizerExtraFaq()],
	tiktok: [tiktokHumanizerExtraFaq()],
	linkedin: [linkedinHumanizerExtraFaq()]
};

export function getHumanizerChannelExtraFaqItems(channelSlug: string): readonly PublicFaqItem[] {
	const slug = channelSlug.trim().toLowerCase();
	return HUMANIZER_CHANNEL_EXTRA_FAQ_BY_SLUG[slug] ?? [];
}