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
				title: 'My workspaces',
				subtitle: 'My Dashboard lists your workspaces on the left.',
				iconName: icons.House.name,
				image: {
					src: '/docs/_assets/getting-started/1-workspace-dashboard.webp',
					alt: 'My Dashboard with workspace cards and Getting started in the left column'
				},
				paragraphs: [
					[
						'Each card is one workspace. Click a card to switch workspace. Create a workspace when you need a separate brand or client.'
					],
					[
						'The ',
						{ highlight: 'Getting started' },
						' card opens a checklist. For a full walkthrough, see ',
						{ link: { label: 'Quickstart', href: GUIDE.quickstart } },
						'.'
					]
				]
			},
			{
				title: 'Connect a channel',
				subtitle: 'A channel is one social account you publish to.',
				iconName: icons.Plus.name,
				image: {
					src: '/docs/_assets/getting-started/2-add-channel.webp',
					alt: 'Channels tab with Add Channel on My Dashboard'
				},
				paragraphs: [
					[
						'Open the ',
						{ highlight: 'Channels' },
						' tab. Click ',
						{ highlight: 'Add Channel' },
						' and finish the sign-in flow for that network.'
					],
					[
						'You can also use ',
						{ highlight: 'Add channel' },
						' on the active workspace card. See ',
						{ link: { label: 'Connect a channel', href: GUIDE.connectChannels } },
						' in the Guide.'
					]
				]
			},
			{
				title: 'Posts kanban',
				subtitle: 'Track drafts, scheduled posts, and published posts in one place.',
				iconName: icons.Columns2.name,
				image: {
					src: '/docs/_assets/getting-started/5-kanban-board.webp',
					alt: 'Posts tab kanban with drafted, scheduled, and published columns'
				},
				paragraphs: [
					[
						'Open the ',
						{ highlight: 'Posts' },
						' tab. Each card is a post or a group of posts. Drag a card to move it between columns.'
					],
					[
						'Double-click a card to edit. More detail is in ',
						{ link: { label: 'Kanban board', href: GUIDE.kanban } },
						'.'
					]
				]
			},
			{
				title: 'Notifications',
				subtitle: 'See publish results without opening every post.',
				iconName: icons.Bell.name,
				image: {
					src: '/docs/_assets/getting-started/5-notifications-panel.webp',
					alt: 'Notifications panel with publish and review messages'
				},
				paragraphs: [
					[
						'Click the ',
						{ highlight: 'Notifications' },
						' bell in the header. You can also open the ',
						{ highlight: 'Feed' },
						' tab on My Dashboard.'
					],
					[
						'The list shows live links, failed publishes, and review notes. Email alerts use the same events when they are enabled.'
					]
				],
				rememberParts: [
					'You can open these guides again with ',
					{ highlight: 'Reset product tours' },
					' in the sidebar. For every page in the app, see ',
					{ link: { label: 'Tour the app', href: GUIDE.tourTheApp } },
					'.'
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
						'Click a day to see that queue. Jump into the post editor from a slot. The calendar and My Dashboard kanban use the same posts.'
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
						'Connect channels on My Dashboard, then open Analytics. Compare ',
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
