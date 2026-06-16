import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type OpenClawMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Built-in OpenClaw messaging channel adapters. */
export const OPENCLAW_CORE_MESSAGING_CHANNELS: OpenClawMessagingChannel[] = [
	{
		id: 'whatsapp',
		title: 'WhatsApp',
		description: 'Web-based via Baileys library',
		icon: icons.WhatsApp.name,
		containerClass: 'bg-[#25D366] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'telegram',
		title: 'Telegram',
		description: 'Bot API via grammY',
		icon: icons.Telegram.name,
		containerClass: 'bg-[#229ED9] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'discord',
		title: 'Discord',
		description: 'Bot via discord.js',
		icon: icons.Discord.name,
		containerClass: 'bg-[#5865F2] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'slack',
		title: 'Slack',
		description: 'App via Bolt SDK',
		icon: icons.Slack.name,
		containerClass: 'bg-white',
		iconClass: 'size-7'
	},
	{
		id: 'signal',
		title: 'Signal',
		description: 'CLI-based via signal-cli',
		icon: icons.Signal.name,
		containerClass: 'bg-[#3A76F0] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'imessage',
		title: 'iMessage',
		description: 'macOS only, AppleScript bridge',
		icon: icons.IMessage.name,
		containerClass: 'bg-gradient-to-br from-[#34C759] to-[#30B350] text-white',
		iconClass: 'size-7'
	}
];

/** Extension channel adapters shipped separately from core. */
export const OPENCLAW_EXTENSION_MESSAGING_CHANNELS: OpenClawMessagingChannel[] = [
	{
		id: 'microsoft-teams',
		title: 'Microsoft Teams',
		description: 'Enterprise chat and meeting rooms',
		icon: icons.MicrosoftTeams.name,
		containerClass: 'bg-[#5059C9] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'google-chat',
		title: 'Google Chat',
		description: 'Workspace messaging for Google accounts',
		icon: icons.GoogleChat.name,
		containerClass: 'bg-white',
		iconClass: 'size-6'
	},
	{
		id: 'matrix',
		title: 'Matrix',
		description: 'Federated open messaging protocol',
		icon: icons.Matrix.name,
		containerClass: 'bg-black text-white',
		iconClass: 'h-auto w-10 max-w-full',
		iconWidth: '40',
		iconHeight: '17'
	},
	{
		id: 'zalo',
		title: 'Zalo',
		description: 'Popular chat platform in Vietnam',
		icon: icons.Zalo.name,
		containerClass: 'bg-[#0068FF] text-white',
		iconClass: 'size-6'
	},
];
