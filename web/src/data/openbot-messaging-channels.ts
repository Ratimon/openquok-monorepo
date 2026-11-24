import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type OpenbotMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary OpenBot clients. */
export const OPENBOT_CORE_MESSAGING_CHANNELS: OpenbotMessagingChannel[] = [
	{
		id: 'macos',
		title: 'macOS',
		description: 'Native desktop app — the primary OpenBot experience',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'windows',
		title: 'Windows & Linux',
		description: 'Desktop builds with local workspaces and agent handoffs',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-[#0078D4] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'mobile',
		title: 'iOS & Android',
		description: 'Mobile apps that connect to your OpenBot computer',
		icon: icons.Phone.name,
		containerClass: 'bg-gradient-to-br from-neutral-700 to-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'multiplayer',
		title: 'Shared channels',
		description: 'Invite teammates; people and agents share project rooms',
		icon: icons.Users.name,
		containerClass: 'bg-indigo-700 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'local-data',
		title: 'On this computer',
		description: 'Workspaces, chats, and files stay on hardware you control',
		icon: icons.CustomizedDrawnHouse.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-7'
	}
];

/** Optional paths beside CLI + openquok-core. */
export const OPENBOT_EXTENSION_MESSAGING_CHANNELS: OpenbotMessagingChannel[] = [
	{
		id: 'marketplace',
		title: 'Marketplace skills',
		description: 'Install skills and plugins per agent from the sidebar',
		icon: icons.Sparkles.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	},
	{
		id: 'mcp',
		title: 'MCP via skills',
		description: 'Wire remote MCP servers when a native app connector is missing',
		icon: icons.Link.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	}
];