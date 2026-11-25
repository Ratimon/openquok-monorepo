import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type MausbotMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary MausBot surfaces. */
export const MAUSBOT_CORE_MESSAGING_CHANNELS: MausbotMessagingChannel[] = [
	{
		id: 'desktop',
		title: 'macOS, Windows & Linux',
		description: 'Free open-source desktop app — bots run on your computer',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'mobile',
		title: 'iOS & Android',
		description: 'Companion apps that connect to the desktop or cloud host',
		icon: icons.Phone.name,
		containerClass: 'bg-gradient-to-br from-neutral-700 to-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'bots',
		title: 'Bot list',
		description: 'Pin, duplicate, and message many bots like a chat app',
		icon: icons.Bot.name,
		containerClass: 'bg-stone-700 text-white',
		iconClass: 'size-7'
	}
];

export const MAUSBOT_EXTENSION_MESSAGING_CHANNELS: MausbotMessagingChannel[] = [
	{
		id: 'engines',
		title: 'Agent engines',
		description: 'Claude Code, Codex, Grok, Cursor, and more via native CLIs',
		icon: icons.Sparkles.name,
		containerClass: 'bg-violet-900/80 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'automations',
		title: 'Automations',
		description: 'Schedules, webhooks, and connected-app triggers per bot',
		icon: icons.CalendarClock.name,
		containerClass: 'bg-emerald-900/70 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'skills',
		title: 'Skills & recorder',
		description: 'Working-folder skills plus one-click skill recorder',
		icon: icons.Terminal.name,
		containerClass: 'bg-zinc-800 text-white',
		iconClass: 'size-7'
	}
];