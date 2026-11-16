import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';
import {
	buildChannelFaqLinks,
	buildToolChannelFaqLinks,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const THREADS_DOCS_PATH = '/docs/social-integration/threads';
const threadsChannelLinks = buildChannelFaqLinks('threads', THREADS_DOCS_PATH);
const threadsPhotoEditorLinks = buildToolChannelFaqLinks('photo-editor', 'threads');
const threadsHumanizerLinks = buildToolChannelFaqLinks('humanizer', 'threads');

export const threadsToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'threads',
	platformLabel: 'Threads',
	docsPath: '/docs/social-integration/threads',
	bestTime: {
		metaDescription:
			'Industry starting points for Threads: late morning through evening slots in your audience timezone. Free timing test plan — not your personal Threads analytics.',
		hubDescription: 'Morning, lunch, and ~7 PM text-post windows for timing tests.',
		seoIntroHeading: 'Starter windows to test on Threads',
		seoIntroParagraph:
			'Conversation-style windows from aggregate studies — test and refine using your own engagement patterns.',
		highlights: [
			{ title: 'Mornings', subline: '9–11 AM' },
			{ title: 'Midday', subline: '12–2 PM' },
			{ title: 'Evenings', subline: '~7 PM' }
		],
		officialInsightsHref: 'https://www.facebook.com/business/help',
		officialInsightsLabel: 'Meta Business Help (Threads uses Meta accounts)'
	},
	photoEditor: {
		metaDescription:
			'Free Threads photo editor. Export square and portrait post images plus 9:16 vertical assets from Threads presets — PNG download free in the browser.',
		hubDescription: 'Square, portrait, and vertical post image presets.',
		heroLead:
			'Threads post images commonly use square or portrait ratios; vertical 1080×1920 matches full-screen mobile posts.',
		seoIntroHeading: 'Free Threads photo edit for feed posts and carousels',
		seoIntroParagraph:
			'Resize stills for thread images and carousels in the browser. OpenQuok pre-selects square, portrait, and 9:16 presets — download PNG free with no sign up required.',
		seoIntroHighlights: [
			{ title: 'Square', subline: '1080×1080' },
			{ title: 'Portrait', subline: '4:5 feed' },
			{ title: 'Vertical', subline: '9:16 mobile' }
		],
		seoIntroClosingHtml: `When captions need a tighter voice, run drafts through the ${faqLink(threadsHumanizerLinks.toolChannel, 'Threads Humanizer')}. ${faqLink(publicFaqHref.signUp, 'Sign up')} to attach exports when you schedule on ${faqLink(threadsChannelLinks.channelLanding, 'Threads in OpenQuok')}.`,
		extraFaqItems: [
			{
				title: 'Is there a free Threads photo editor?',
				description: `Yes. This ${faqLink(threadsPhotoEditorLinks.toolChannel, 'Threads photo editor')} sizes square, portrait, and vertical PNGs for thread images and carousels — no account required to export. Tighten copy in the ${faqLink(threadsHumanizerLinks.toolChannel, 'Threads Humanizer')}, then connect Threads in OpenQuok to schedule.`
			}
		],
		faqTitle: 'What image sizes work on Threads?',
		faqBodyLead:
			'Threads accepts images in feed posts and replies. Use the Threads preset group for export sizes that match typical mobile feed display.'
	},
	skillBuilder: {
		metaDescription:
			'Free Threads skill builder. Recipes for text posts, reply chains, reply-with-image, cross-account comments, and global auto-plugs — export SKILL.md for agents.',
		hubDescription: 'threads.replies, cross-account plugs, and plugs:upsert recipes.',
		heroLead:
			'Pre-loaded Threads posts:create and threads.replies examples plus plugs:upsert for global auto-replies.',
		faqTitle: 'How do I build a Threads agent skill?',
		faqBodyLead:
			'Review pre-loaded CLI payloads on this page, align with Threads publish docs, then export SKILL.md for your agent.'
	}
};
