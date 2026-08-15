import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type GrokBotMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary Grok Bot clients — desktop and mobile apps (not Telegram-first gateways). */
export const GROK_BOT_CORE_MESSAGING_CHANNELS: GrokBotMessagingChannel[] = [
	{
		id: 'macos',
		title: 'macOS',
		description: 'Native desktop app for Apple Silicon and Intel Macs',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'windows',
		title: 'Windows',
		description: 'Desktop app for Windows 10 and 11',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-[#0078D4] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'ios',
		title: 'iOS',
		description: 'Message your Bot from iPhone or iPad on the go',
		icon: icons.Phone.name,
		containerClass: 'bg-gradient-to-br from-neutral-700 to-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'plugins',
		title: 'Plugins',
		description: 'Install skills via Settings → Plugins or / in chat',
		icon: icons.Sparkles.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-7'
	},
	{
		id: 'routines',
		title: 'Routines',
		description: 'Scheduled work on the Bot shared cloud computer',
		icon: icons.CalendarClock.name,
		containerClass: 'bg-violet-600 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'cloud-computer',
		title: 'Cloud computer',
		description: 'Persistent browser, filesystem, and terminal for each Bot',
		icon: icons.Terminal.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-7'
	}
];

/** Optional connectors path — secondary to CLI + openquok-core. */
export const GROK_BOT_EXTENSION_MESSAGING_CHANNELS: GrokBotMessagingChannel[] = [
	{
		id: 'connectors',
		title: 'Connectors',
		description: 'Optional MCP connectors for third-party tools',
		icon: icons.Link.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	}
];
