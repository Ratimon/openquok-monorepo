import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type DotsMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary Dots surfaces — ChatGPT plus workplace chat apps. */
export const DOTS_CORE_MESSAGING_CHANNELS: DotsMessagingChannel[] = [
	{
		id: 'chatgpt',
		title: 'ChatGPT',
		description: 'Desktop, web, and mobile — create your dot and inspect its cloud computer',
		icon: icons.ChatGPT.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'slack',
		title: 'Slack',
		description: 'Message your dot in Slack with shared context from ChatGPT',
		icon: icons.Slack.name,
		containerClass: 'bg-[#4A154B] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'teams',
		title: 'Microsoft Teams',
		description: 'Continue projects in Teams without re-explaining context',
		icon: icons.MicrosoftTeams.name,
		containerClass: 'bg-[#464EB8] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'plugins',
		title: 'Plugins',
		description: 'Connect apps and register openquok-core on the dot computer',
		icon: icons.Sparkles.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-7'
	},
	{
		id: 'cloud-computer',
		title: 'Cloud computer',
		description: 'Browser, filesystem, and shell your dot uses for finished work',
		icon: icons.Terminal.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'activity',
		title: 'Activity View',
		description: 'Follow background work and redirect your dot when plans change',
		icon: icons.CalendarClock.name,
		containerClass: 'bg-violet-700 text-white',
		iconClass: 'size-7'
	}
];

/** Optional editor MCP path — secondary to CLI on the dot computer. */
export const DOTS_EXTENSION_MESSAGING_CHANNELS: DotsMessagingChannel[] = [
	{
		id: 'cursor-mcp',
		title: 'Cursor MCP',
		description: 'Optional OpenQuok MCP when you schedule from the IDE instead of your dot',
		icon: icons.Cursor.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	}
];
