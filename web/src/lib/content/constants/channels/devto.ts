import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/types';
import { SHARED_CHANNEL_SEO_KEYWORDS } from '$lib/content/constants/channels/shared';

export const devtoChannel = {
	slug: 'devto',
	platformId: 'devto',
	platformLabel: 'Dev.to',
	icon: icons.DevtoGlyph.name,
	heroTitle: 'Schedule Dev.to posts, tags, and series you approve',
	heroDescription:
		'Paste your DEV Community API key, queue markdown articles on the calendar, and set title, tags, series, cover, organization, and canonical URL before anything goes live — then approve on the kanban board before OpenQuok publishes.',
	metaTitle: 'Dev.to Scheduler — Schedule Posts, Tags, and Series',
	metaDescription:
		'Schedule Dev.to posts, tags, and series with OpenQuok. Connect with an API key, queue markdown articles with cover, organization, and canonical URL, track Dev.to analytics, and publish from the dashboard, public API, or CLI.',
	hubDescription:
		'Schedule Dev.to posts with tags and series — plus cover, organization, canonical URL, and analytics for page views, reactions, and comments.',
	keywords: [
		...SHARED_CHANNEL_SEO_KEYWORDS,
		'schedule Dev.to posts',
		'schedule Dev.to series',
		'Dev.to analytics',
		'DEV Community series',
		'Dev.to scheduler',
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
			title: 'Queue Dev.to posts with tags and series, batch drafts weeks ahead',
			description:
				'Technical writing stalls when drafts sit unpublished. Put articles on the OpenQuok calendar with tags and series set, review agent and human drafts on the kanban board, then move them to Scheduled when ready.',
			bentoId: 'devto-bulk-scheduling',
			mediaOnRight: true
		},
		{
			subtitle: 'Article settings',
			title: 'Craft tags and series, tune cover and org, approve before publish',
			description:
				'Write the body as markdown in the usual editor. Tune Dev.to settings per article — title, up to four tags, series name, optional cover (1000×420), organization, and canonical URL — then approve on the kanban board before anything goes live.',
			bentoId: 'devto-article-settings',
			mediaOnRight: false
		},
		{
			subtitle: 'Dev.to insights',
			title: 'See what resonates on Dev.to, track views and reactions, and iterate',
			description:
				'Track page views, reactions, and comments from your connected DEV Community account over 7, 30, or 90 days inside OpenQuok analytics — plus per-article insights once a post is published — so you can schedule more of what already works.',
			bentoId: 'devto-insights',
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
				'Ship changelogs and tutorials from the calendar instead of waiting until you remember to paste into the Dev.to editor.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Developer relations',
			description:
				'Batch docs, release notes, and how-tos with consistent tags, series, and covers. Review drafts on the kanban board before publish.',
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
	faqTitle: 'Dev.to posts, tags, series, and analytics',
	faqDescription:
		'API-key connect, markdown bodies, tags, series, cover images, canonical URLs, and analytics — what OpenQuok supports for Dev.to today.',
	faqItems: [
		{
			title: 'How do I connect Dev.to to OpenQuok?',
			description:
				'Open a workspace, choose Add Channel → Dev.to, and paste an API key from DEV Settings → Extensions. OpenQuok keeps the key on the server so it can publish for you; list and connect APIs never return it. Treat the key like a password — if it leaks, rotate it in DEV Settings and reconnect. There is no operator OAuth app and no public OAuth connect URL.'
		},
		{
			title: 'Do I write the article body as markdown?',
			description:
				'Yes. Use the normal composer — the body is sent as markdown. Title, tags, cover, organization, series, and canonical URL live in Dev.to settings, not in a separate markdown editor.'
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
			title: 'Can I add an article to a Dev.to series?',
			description:
				'Yes. Enter a free-text series name in Dev.to settings (or pass series in providerSettings). Dev.to creates the series if it does not already exist.'
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
			title: 'Does OpenQuok show Dev.to analytics?',
			description:
				'Yes. Workspace analytics show account-level page views, reactions, and comments over 7, 30, or 90 days, plus per-article insights for published posts. Follow-up comments on Dev.to articles are not supported today.'
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
