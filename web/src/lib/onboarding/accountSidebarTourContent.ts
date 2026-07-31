import { icons } from '$data/icons';

import type { AccountSidebarTourDefinition } from '$lib/onboarding/accountSidebarTour.types';

export const ACCOUNT_SIDEBAR_TOUR_CONTENT: Record<
	AccountSidebarTourDefinition['id'],
	AccountSidebarTourDefinition
> = {
	home: {
		id: 'home',
		steps: [
			{
				title: 'Welcome to your workspace',
				subtitle:
					'Home is your center for channels, drafts, and everything scheduled to go live.',
				iconName: icons.House.name,
				paragraphs: [
					[
						'See ',
						{ highlight: 'connected social channels' },
						' at a glance, open the post editor, and track posts on the ',
						{ highlight: 'kanban board' },
						' from draft through published.'
					],
					[
						'Use the ',
						{ highlight: 'Getting started' },
						' checklist to connect a channel, set your timezone, and schedule your first post.'
					]
				]
			},
			{
				title: 'Stay on top of publishing',
				subtitle: 'Home surfaces what needs attention before it goes out.',
				iconName: icons.House.name,
				paragraphs: [
					[
						'Filter the board by channel group, drag cards between columns, and ',
						{ highlight: 'open any post' },
						' to edit or reschedule.'
					],
					[
						'When you are ready to scale, explore ',
						{ highlight: 'Playbooks' },
						', ',
						{ highlight: 'Templates' },
						', and ',
						{ highlight: 'Auto Plugs' },
						' from the sidebar.'
					]
				],
				remember: 'You can reopen these guides anytime with Reset product tours in the sidebar footer.'
			}
		]
	},
	calendar: {
		id: 'calendar',
		steps: [
			{
				title: 'Calendar',
				subtitle: 'Plan publishing around dates.',
				iconName: icons.CalendarClock.name,
				paragraphs: [
					[
						'The calendar shows ',
						{ highlight: 'scheduled and published posts' },
						' across your workspace so you can spot gaps and busy days.'
					],
					[
						'Connect your channels, click a day to see what is queued, jump into the post editor, and ',
						{ highlight: 'keep every channel on rhythm' },
						' without leaving the month view.'
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
				subtitle: 'Save reusable content sets so you do not rebuild the same post from scratch.',
				iconName: icons.LayoutTemplate.name,
				paragraphs: [
					[
						'Templates store ',
						{ highlight: 'captions, media, and channel-specific fields' },
						' you use often—product launches, weekly updates, or campaign shells.'
					],
					[
						'Start from a template in the composer to ',
						{ highlight: 'ship faster' },
						' while keeping tone and structure consistent across channels.'
					]
				]
			}
		]
	},
	playbooks: {
		id: 'playbooks',
		steps: [
			{
				title: 'What are Playbooks?',
				subtitle:
					'Reusable strategies and/or workflows you can run or share with the community.',
				iconName: icons.Bookmark.name,
				paragraphs: [
					[
						'Playbooks bundle ',
						{ highlight: 'building blocks' },
						'—hooks, outlines, CTAs, and formats—into flows you can follow for each campaign.'
					],
					[
						'Browse ',
						{ highlight: 'Explore' },
						' for inspiration, bookmark favorites, and fork ideas into ',
						{ highlight: 'your own playbooks' },
						' under Mine.'
					]
				]
			},
			{
				title: 'Building blocks & stacks',
				subtitle: 'Mix small pieces into larger workflows or agent skill stacks.',
				iconName: icons.Bookmark.name,
				paragraphs: [
					[
						'Building blocks are ',
						{ highlight: 'single-purpose prompts or patterns' },
						'; stacks combine several blocks for repeatable multi-step creation.'
					],
					[
						'Publish your own blocks to the catalog or keep them private while you ',
						{ highlight: 'iterate on what converts' },
						'.'
					]
				]
			}
		]
	},
	plugs: {
		id: 'plugs',
		steps: [
			{
				title: 'What are Auto Plugs?',
				subtitle:
					'Channel-level rules that boost posts after they go live—when engagement crosses a likes threshold.',
				iconName: icons.Sparkles.name,
				paragraphs: [
					[
						'Global plugs are saved on a ',
						{ highlight: 'connected channel' },
						' (Threads, X, or LinkedIn Page). Examples: ',
						{ highlight: 'auto-repost' },
						' when a post hits enough likes, or ',
						{ highlight: 'auto plug post' },
						'—a follow-up reply or comment you write in advance.'
					],
					[
						'After publish, OpenQuok ',
						{ highlight: 're-checks engagement' },
						' on a schedule (up to three passes, every six hours) and runs the rule when the threshold is met.'
					]
				]
			},
			{
				title: 'Global vs per-post plugs',
				subtitle: 'This page is for channel rules; the composer handles one-off follow-ups.',
				iconName: icons.Sparkles.name,
				paragraphs: [
					[
						'Use ',
						{ highlight: 'Add Global Rule' },
						' to set likes thresholds and message copy per channel. Filter the grid, edit rows, and pause rules without deleting them.'
					],
					[
						'For ',
						{ highlight: 'internal plugs' },
						'—delayed same-account replies, cross-account comments, or reposts from other channels—configure them when you schedule a post (or from Calendar for post-level settings).'
					]
				],
				remember:
					'Global plugs never change your original post—they add a repost or a new reply/comment only after likes reach your target.'
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
				paragraphs: [
					[
						'Connect channels on Home, then open Analytics to compare ',
						{ highlight: 'reach, engagement, and trends' },
						' across integrations.'
					],
					[
						'Filter by channel and date range to ',
						{ highlight: 'make data-driven decisions' },
						' about what to publish next.'
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
				subtitle: 'Central place for images and videos you reuse in posts and templates.',
				iconName: icons.Image.name,
				paragraphs: [
					[
						'Upload once, then ',
						{ highlight: 'attach assets from the post editor' },
						' or template editor without hunting through downloads.'
					],
					[
						'Organize files by workspace so ',
						{ highlight: 'your team shares the same source of truth' },
						' for campaign visuals.'
					]
				]
			}
		]
	}
};
