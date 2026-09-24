import { icons } from '$data/icons';

import type { AccountSidebarTourDefinition } from '$lib/onboarding/accountSidebarTour.types';

/** In-app product tour links to the user Guide (`/docs/…`). */
const GUIDE = {
	tourTheApp: '/docs/getting-started/tour-the-app',
	quickstart: '/docs/getting-started/quickstart',
	connectChannels: '/docs/channels/connect',
	kanban: '/docs/posts-management/kanban',
	calendar: '/docs/posts-management/calendar',
	templates: '/docs/posts-management/templates',
	creatingPosts: '/docs/creating-posts',
	playbooks: '/docs/playbooks',
	explorePlaybooks: '/docs/playbooks/explore-and-bookmarks',
	composePlaybook: '/docs/playbooks/compose-a-playbook',
	plugsOverview: '/docs/automations/plugs',
	globalPlugs: '/docs/automations/global-plugs',
	internalPlugs: '/docs/automations/internal-plugs',
	insights: '/docs/insights/workspace-analytics',
	media: '/docs/media',
	addMedia: '/docs/media/add-media'
} as const;

export const ACCOUNT_SIDEBAR_TOUR_CONTENT: Record<
	AccountSidebarTourDefinition['id'],
	AccountSidebarTourDefinition
> = {
	home: {
		id: 'home',
		steps: [
			{
				title: 'Welcome to your workspace',
				subtitle: 'Home shows your channels, your checklist, and posts in every stage.',
				iconName: icons.House.name,
				image: {
					src: '/docs/_assets/getting-started/5-kanban-board.webp',
					alt: 'Kanban board on Home with draft, scheduled, and published columns'
				},
				paragraphs: [
					[
						'Connect ',
						{ link: { label: 'channels', href: GUIDE.connectChannels } },
						', then open the post editor to write and schedule.'
					],
					[
						'Track work on the ',
						{ link: { label: 'kanban board', href: GUIDE.kanban } },
						'. Use the Getting started checklist to add a channel, set your timezone, and schedule your first post. See ',
						{ link: { label: 'Quickstart', href: GUIDE.quickstart } },
						' for the full path.'
					]
				]
			},
			{
				title: 'Stay on top of publishing',
				subtitle: 'See what needs review before it goes live.',
				iconName: icons.House.name,
				paragraphs: [
					[
						'Filter the board by channel group. Drag cards between columns. Open any post to edit or reschedule. Details are in ',
						{ link: { label: 'Kanban board', href: GUIDE.kanban } },
						'.'
					],
					[
						'When you want to move faster, use ',
						{ link: { label: 'Playbooks', href: GUIDE.playbooks } },
						', ',
						{ link: { label: 'Templates', href: GUIDE.templates } },
						', and ',
						{ link: { label: 'Auto Plugs', href: GUIDE.globalPlugs } },
						' from the sidebar.'
					]
				],
				rememberParts: [
					'Remember: You can reopen these guides anytime with Reset product tours in the sidebar footer. For a map of every page, open ',
					{ link: { label: 'Tour the app', href: GUIDE.tourTheApp } },
					' in the Guide.'
				]
			}
		]
	},
	calendar: {
		id: 'calendar',
		steps: [
			{
				title: 'Calendar',
				subtitle: 'See scheduled and published posts by date.',
				iconName: icons.CalendarClock.name,
				image: {
					src: '/docs/_assets/posts-management/calendar-month-view.webp',
					alt: 'Calendar month view with scheduled posts'
				},
				paragraphs: [
					[
						'The calendar shows what will go live and what already published. You can spot quiet days and busy weeks at a glance. Read ',
						{ link: { label: 'Calendar', href: GUIDE.calendar } },
						' in the Guide for filters and views.'
					],
					[
						'Click a day to see that queue. Jump into the post editor from a slot. The calendar and Home kanban use the same posts.'
					]
				]
			}
		]
	},
	templates: {
		id: 'templates',
		steps: [
			{
				title: 'Templates',
				subtitle: 'Save post presets so you do not start from a blank editor every time.',
				iconName: icons.LayoutTemplate.name,
				image: {
					src: '/docs/_assets/glossary/select-a-template.webp',
					alt: 'Select a template dialog when you create a post'
				},
				paragraphs: [
					[
						'A template stores ',
						{ highlight: 'captions, media, and channel fields' },
						' you use often. Examples: product launches, weekly updates, and campaign shells.'
					],
					[
						'Pick a template when you ',
						{ link: { label: 'create a post', href: GUIDE.creatingPosts } },
						'. Edit what changed, then schedule. Full steps are in ',
						{ link: { label: 'Templates', href: GUIDE.templates } },
						'.'
					]
				]
			}
		]
	},
	playbooks: {
		id: 'playbooks',
		steps: [
			{
				title: 'Playbooks',
				subtitle: 'Save and reuse workflows for content and agents.',
				iconName: icons.Bookmark.name,
				image: {
					src: '/docs/_assets/playbooks/overview.webp',
					alt: 'Playbooks page with Explore and My Playbooks tabs'
				},
				paragraphs: [
					[
						'A playbook groups ',
						{ highlight: 'building blocks' },
						' into one flow. Use hooks, outlines, and formats you can run again for each campaign.'
					],
					[
						'On ',
						{ link: { label: 'Explore', href: GUIDE.explorePlaybooks } },
						', browse the catalog and bookmark favorites. Under Mine, edit ',
						{ link: { label: 'your playbooks', href: GUIDE.composePlaybook } },
						'. The ',
						{ link: { label: 'Playbooks overview', href: GUIDE.playbooks } },
						' explains both tabs.'
					]
				]
			},
			{
				title: 'Building blocks',
				subtitle: 'Mix small pieces into larger stacks.',
				iconName: icons.Bookmark.name,
				paragraphs: [
					[
						'A building block is one skill or MCP entry. A playbook stacks several blocks into a repeatable workflow.'
					],
					[
						'Publish blocks to the public catalog or keep them private while you test what works.'
					]
				]
			}
		]
	},
	plugs: {
		id: 'plugs',
		steps: [
			{
				title: 'Auto Plugs',
				subtitle: 'Rules that run after a post goes live when engagement hits your target.',
				iconName: icons.Sparkles.name,
				image: {
					src: '/docs/_assets/glossary/global-plug.webp',
					alt: 'Global plug rule settings on a connected channel'
				},
				paragraphs: [
					[
						'A plug can repost, reply, or comment after publish. ',
						{ link: { label: 'Global plugs', href: GUIDE.globalPlugs } },
						' apply to a ',
						{ highlight: 'connected channel' },
						' (Threads, X, or LinkedIn Page). Set a likes threshold and the message copy in advance.'
					],
					[
						'After publish, OpenQuok checks engagement on a schedule and runs the rule when the threshold is met. See ',
						{ link: { label: 'Plugs overview', href: GUIDE.plugsOverview } },
						' for supported networks.'
					]
				]
			},
			{
				title: 'Global vs per-post plugs',
				subtitle: 'This page is for channel rules. The post editor handles one-off follow-ups.',
				iconName: icons.Sparkles.name,
				paragraphs: [
					[
						'Use Add Global Rule to set likes thresholds and message copy per channel. Filter the grid, edit rows, and pause rules without deleting them.'
					],
					[
						'For a single post, set ',
						{ link: { label: 'internal plugs', href: GUIDE.internalPlugs } },
						' in the post editor or from Calendar. Those follow-ups are not the same as global channel rules.'
					]
				],
				remember:
					'Global plugs never change your original post. They add a repost or a new reply only after likes reach your target.'
			}
		]
	},
	analytics: {
		id: 'analytics',
		steps: [
			{
				title: 'Analytics',
				subtitle: 'See how posts perform after they leave the queue.',
				iconName: icons.ChartBar.name,
				image: {
					src: '/docs/_assets/insights/overview-metric-cards.webp',
					alt: 'Analytics overview with metric cards'
				},
				paragraphs: [
					[
						'Connect channels on Home, then open Analytics. Compare ',
						{ highlight: 'reach, engagement, and trends' },
						' across integrations. The ',
						{ link: { label: 'Workspace analytics', href: GUIDE.insights } },
						' page describes each chart.'
					],
					[
						'Filter by channel and date range. Use the numbers to decide what to publish next.'
					]
				]
			}
		]
	},
	media: {
		id: 'media',
		steps: [
			{
				title: 'Media library',
				subtitle: 'One place for images and videos you reuse in posts and templates.',
				iconName: icons.Image.name,
				image: {
					src: '/docs/_assets/media/file-manager.webp',
					alt: 'Media library file manager grid'
				},
				paragraphs: [
					[
						'Upload once. Attach files from the post editor or template editor without searching your downloads. See ',
						{ link: { label: 'Add media', href: GUIDE.addMedia } },
						'.'
					],
					[
						'Files belong to your workspace so ',
						{ highlight: 'your team shares the same library' },
						'. Browse and organize in the ',
						{ link: { label: 'Media library', href: GUIDE.media } },
						' guide.'
					]
				]
			}
		]
	}
};
