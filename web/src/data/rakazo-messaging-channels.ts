import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type RakazoMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary Rakazo clients and workplace messaging. */
export const RAKAZO_CORE_MESSAGING_CHANNELS: RakazoMessagingChannel[] = [
	{
		id: 'web',
		title: 'Web app',
		description: 'Browser UI for bots, routines, and approvals',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'desktop',
		title: 'Desktop',
		description: 'Electron app for macOS, Windows, and Linux',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-[#0078D4] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'mobile',
		title: 'Mobile',
		description: 'iOS and Android clients for your Rakazo server',
		icon: icons.Phone.name,
		containerClass: 'bg-gradient-to-br from-neutral-700 to-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'slack',
		title: 'Slack',
		description: 'Mention a bot in your workspace channel',
		icon: icons.Slack.name,
		containerClass: 'bg-[#4A154B] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'telegram',
		title: 'Telegram',
		description: 'Self-hosted bot bridge when you configure it',
		icon: icons.Telegram.name,
		containerClass: 'bg-[#229ED9] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'sandbox',
		title: 'Bot computer',
		description: 'Isolated browser, shell, and files per bot',
		icon: icons.Terminal.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-7'
	}
];

/** Optional paths beside CLI + openquok-core. */
export const RAKAZO_EXTENSION_MESSAGING_CHANNELS: RakazoMessagingChannel[] = [
	{
		id: 'mcp',
		title: 'MCP',
		description: 'User-installed HTTPS MCP servers from Integrations',
		icon: icons.Link.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	},
	{
		id: 'whatsapp',
		title: 'WhatsApp',
		description: 'Self-hosted messaging when your operator enables it',
		icon: icons.WhatsApp.name,
		containerClass: 'bg-[#25D366] text-white',
		iconClass: 'size-6'
	}
];
