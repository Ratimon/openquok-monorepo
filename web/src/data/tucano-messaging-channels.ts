import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type TucanoMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary Tucano surfaces. */
export const TUCANO_CORE_MESSAGING_CHANNELS: TucanoMessagingChannel[] = [
	{
		id: 'desktop',
		title: 'macOS, Windows & Linux',
		description: 'Free desktop app — agents and data stay on your computer',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'channels',
		title: 'Team channels',
		description: 'Organize specialists in #social, #launch, or your own lanes',
		icon: icons.Slack.name,
		containerClass: 'bg-gradient-to-br from-neutral-700 to-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'telegram',
		title: 'Telegram',
		description: 'Approve sensitive agent actions from your phone',
		icon: icons.Telegram.name,
		containerClass: 'bg-sky-900/80 text-white',
		iconClass: 'size-7'
	}
];

export const TUCANO_EXTENSION_MESSAGING_CHANNELS: TucanoMessagingChannel[] = [
	{
		id: 'harnesses',
		title: 'BYO harnesses',
		description: 'Claude Code, Codex, Cursor, Gemini, Grok, OpenCode, or Pi',
		icon: icons.Sparkles.name,
		containerClass: 'bg-violet-900/80 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'routines',
		title: 'Routines',
		description: 'Calendar runs for weekday social drafts and reports',
		icon: icons.CalendarClock.name,
		containerClass: 'bg-emerald-900/70 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'linux',
		title: 'Isolated Linux',
		description: 'Optional sandbox computer per agent away from your files',
		icon: icons.Terminal.name,
		containerClass: 'bg-zinc-800 text-white',
		iconClass: 'size-7'
	}
];