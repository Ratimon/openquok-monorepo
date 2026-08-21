import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';

export const devtoChannel = {
	slug: 'devto',
	platformId: 'devto',
	platformLabel: 'Dev.to',
	icon: icons.DevtoGlyph.name,
	heroTitle: 'Schedule Dev.to articles you approve on a real writing cadence',
	heroDescription:
		'Paste your DEV Community API key, queue markdown articles on the calendar, and set title, tags, cover, organization, and canonical URL before anything goes live — so technical posts ship on a cadence instead of stalling in unpublished notes.',
	metaTitle: 'Dev.to Scheduler — Schedule DEV Community Articles',
	metaDescription:
		'Schedule Dev.to posts with OpenQuok. Connect with an API key, queue markdown articles with title, tags, cover, and canonical URL, and publish from the dashboard, public API, or CLI.',
	hubDescription:
		'Schedule Dev.to markdown articles — title, tags, cover, organization, and canonical URL on a calendar.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'Dev.to scheduler',
		'schedule Dev.to posts',
		'schedule Dev.to articles',
		'Dev.to content calendar',
		'DEV Community scheduler',
		'DEV Community API key',
		'technical blog scheduler',
		'markdown article scheduler',
		'canonical URL syndication'
	],
	featureSections: [
		{
			subtitle: 'Bulk scheduling',
			title: 'Queue Dev.to articles, batch drafts on the calendar, weeks ahead',
			description:
				'Technical writing stalls when drafts sit unpublished. Put articles on the OpenQuok calendar, review agent and human drafts on the kanban board, then move them to Scheduled when the title and tags are ready.',
			bentoId: 'devto-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Article settings',
			title: 'Craft title and tags, attach a cover, approve before publish',
			description:
				'Write the body as markdown in the usual editor. Tune Dev.to settings per article — title, up to four tags, optional cover (1000×420), and organization — then approve on the kanban board before anything goes live.',
			bentoId: 'devto-article-settings',
			mediaOnRight: false
		},
		{
			subtitle: 'Canonical syndication',
			title: 'Keep your original URL, syndicate to Dev.to, schedule in one place',
			description:
				'When the long-form post already lives on your site, set a canonical URL so Dev.to points readers at the original. Schedule the syndication the same way you schedule a first-party article — no separate analytics dashboard.',
			bentoId: 'devto-canonical',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for technical writers',
	audienceTitle: 'Who schedules Dev.to with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-lime-400',
			title: 'Engineers & indie hackers',
			description:
				'Ship changelogs and tutorials on a cadence instead of waiting until you remember to paste into the Dev.to editor.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Developer relations',
			description:
				'Batch docs, release notes, and how-tos with consistent tags and covers. Review drafts on the kanban board before publish.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Agencies & technical blogs',
			description:
				'Connect client Dev.to accounts with an API key in the dashboard. Pipe markdown drafts from agents via the API while approvers sign off in the workspace.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Dev.to scheduling, answered',
	faqDescription:
		'API-key connect, markdown bodies, tags, cover images, and canonical URLs — what OpenQuok supports for Dev.to today.',
	faqItems: [
		{
			title: 'How do I connect Dev.to to OpenQuok?',
			description:
				'Open a workspace, choose Add Channel → Dev.to, and paste an API key from DEV Settings → Extensions. OpenQuok keeps the key on the server so it can publish for you; list and connect APIs never return it. Treat the key like a password — if it leaks, rotate it in DEV Settings and reconnect. There is no operator OAuth app and no public OAuth connect URL.'
		},
		{
			title: 'Do I write the article body as markdown?',
			description:
				'Yes. Use the normal composer — the body is sent as markdown. Title, tags, cover, organization, and canonical URL live in Dev.to settings, not in a separate markdown editor.'
		},
		{
			title: 'How many tags can I set on a scheduled article?',
			description:
				'Dev.to allows at most four tags. OpenQuok loads tag suggestions from the connected account when available, or you can type names freely. Title must be at least two characters before you can schedule.'
		},
		{
			title: 'Can I set a cover image and organization?',
			description:
				'Yes. Attach an optional cover (recommended 1000×420) from the media library, and pick an organization if your account publishes for one. Personal profile is the default when no organization is selected.'
		},
		{
			title: 'Can I syndicate a post that already lives on my site?',
			description:
				'Yes. Set Canonical URL in Dev.to settings (or pass canonical in providerSettings). OpenQuok sends that URL with the article so Dev.to can point at the original.'
		},
		{
			title: 'Can I schedule Dev.to articles from an AI agent or script?',
			description:
				'Yes. After connecting in the dashboard, use the public API or CLI with your workspace token. Agents can draft markdown and settings; you keep approval control on the kanban board.'
		},
		{
			title: 'Does OpenQuok show Dev.to analytics or series?',
			description:
				'Not today. OpenQuok schedules articles with title, tags, cover, organization, and canonical URL. Series, date-range analytics, and follow-up comments are out of scope.'
		},
		{
			title: 'Is there a free trial for Dev.to scheduling?',
			description:
				'Yes. New workspaces can start on OpenQuok’s free trial, connect Dev.to with an API key, and schedule articles during the trial period before choosing a paid plan.'
		}
	],
	docsPath: '/docs/social-integration/devto',
	available: true
} satisfies PublicChannelLandingPageViewModel;
