import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type HermesMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Popular Hermes messaging gateway platforms (see Hermes docs → Messaging → Popular). */
export const HERMES_CORE_MESSAGING_CHANNELS: HermesMessagingChannel[] = [
	{
		id: 'telegram',
		title: 'Telegram',
		description: 'Voice, images, threads, typing, and streaming',
		icon: icons.Telegram.name,
		containerClass: 'bg-[#229ED9] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'discord',
		title: 'Discord',
		description: 'Voice, reactions, threads, typing, and streaming',
		icon: icons.Discord.name,
		containerClass: 'bg-[#5865F2] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'slack',
		title: 'Slack',
		description: 'Voice, reactions, threads, typing, and streaming',
		icon: icons.Slack.name,
		containerClass: 'bg-white',
		iconClass: 'size-7'
	},
	{
		id: 'google-chat',
		title: 'Google Chat',
		description: 'Images, files, threads, and typing',
		icon: icons.GoogleChat.name,
		containerClass: 'bg-white',
		iconClass: 'size-7'
	},
	{
		id: 'whatsapp',
		title: 'WhatsApp',
		description: 'Images, files, typing, and streaming',
		icon: icons.WhatsApp.name,
		containerClass: 'bg-[#25D366] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'signal',
		title: 'Signal',
		description: 'Images, files, typing, and streaming',
		icon: icons.Signal.name,
		containerClass: 'bg-[#3A76F0] text-white',
		iconClass: 'size-7'
	}
];

/**
 * Microsoft 365, Chinese platforms, and other gateway adapters
 * (see Hermes docs → Messaging Gateway platform comparison).
 */
export const HERMES_EXTENSION_MESSAGING_CHANNELS: HermesMessagingChannel[] = [
	{
		id: 'microsoft-teams',
		title: 'Microsoft Teams',
		description: 'Images, threads, and typing for enterprise chat',
		icon: icons.MicrosoftTeams.name,
		containerClass: 'bg-[#5059C9] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'dingtalk',
		title: 'DingTalk',
		description: 'Images, files, reactions, and streaming',
		icon: icons.DingTalk.name,
		containerClass: 'bg-[#0089FF] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'feishu',
		title: 'Feishu/Lark',
		description: 'Voice, images, threads, typing, and streaming',
		icon: icons.Feishu.name,
		containerClass: 'bg-[#3370FF] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'wecom',
		title: 'WeCom',
		description: 'Voice, images, and files for WeCom workspaces',
		icon: icons.WeCom.name,
		containerClass: 'bg-[#2EAB49] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'weixin',
		title: 'Weixin',
		description: 'Voice, images, typing, and streaming',
		icon: icons.WeChat.name,
		containerClass: 'bg-[#07C160] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'qq',
		title: 'QQ',
		description: 'Voice, images, files, and typing',
		icon: icons.QQ.name,
		containerClass: 'bg-[#12B7F5] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'yuanbao',
		title: 'Yuanbao',
		description: 'Voice, images, files, typing, and streaming',
		icon: icons.Yuanbao.name,
		containerClass: 'bg-[#6B4EFF] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'email',
		title: 'Email',
		description: 'Images, files, and threaded conversations',
		icon: icons.Mail.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	},
	{
		id: 'sms',
		title: 'SMS',
		description: 'Text messaging via Twilio',
		icon: icons.Phone.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-6'
	},
	{
		id: 'home-assistant',
		title: 'Home Assistant',
		description: 'Chat plus HA device control toolset',
		icon: icons.House.name,
		containerClass: 'bg-[#41BDF5] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'mattermost',
		title: 'Mattermost',
		description: 'Voice, images, threads, typing, and streaming',
		icon: icons.Mattermost.name,
		containerClass: 'bg-[#0058CC] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'matrix',
		title: 'Matrix',
		description: 'Voice, images, threads, and federated messaging',
		icon: icons.Matrix.name,
		containerClass: 'bg-black text-white',
		iconClass: 'h-auto w-10 max-w-full',
		iconWidth: '40',
		iconHeight: '17'
	},
	{
		id: 'bluebubbles',
		title: 'BlueBubbles',
		description: 'iMessage via BlueBubbles bridge',
		icon: icons.BlueBubbles.name,
		containerClass: 'bg-gradient-to-br from-[#34C759] to-[#30B350] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'line',
		title: 'LINE',
		description: 'Images, files, typing, and streaming',
		icon: icons.LINE.name,
		containerClass: 'bg-[#06C755] text-white',
		iconClass: 'size-6'
	},
	{
		id: 'ntfy',
		title: 'ntfy',
		description: 'Push notifications to your phone or desktop',
		icon: icons.Ntfy.name,
		containerClass: 'bg-[#317f6f] text-white',
		iconClass: 'size-6'
	}
];
