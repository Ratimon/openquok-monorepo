import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type GeminiMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Where you run Gemini tasks — web, mobile, and desktop Gemini apps. */
export const GEMINI_CORE_MESSAGING_CHANNELS: GeminiMessagingChannel[] = [
	{
		id: 'web',
		title: 'gemini.google.com',
		description: 'Open Task mode in the Gemini web app',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-gradient-to-br from-blue-600 to-indigo-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'ios',
		title: 'iOS',
		description: 'Assign and monitor tasks from iPhone or iPad',
		icon: icons.Phone.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'android',
		title: 'Android',
		description: 'Connected Apps follow you on Gemini mobile',
		icon: icons.Phone.name,
		containerClass: 'bg-[#34A853] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'mac',
		title: 'Gemini on Mac',
		description: 'Task threads and Chrome auto browse on desktop',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-sky-700 text-white',
		iconClass: 'size-7'
	}
];

export const GEMINI_EXTENSION_MESSAGING_CHANNELS: GeminiMessagingChannel[] = [
	{
		id: 'workspace',
		title: 'Google Workspace',
		description: 'Gmail, Calendar, Drive, Docs, Sheets, and more when connected',
		icon: icons.Google.name,
		containerClass: 'bg-white text-neutral-900 border border-neutral-200',
		iconClass: 'size-6'
	},
	{
		id: 'youtube',
		title: 'YouTube',
		description: 'First-class channel for Shorts and video launch posts',
		icon: icons.YouTube.name,
		containerClass: 'bg-[#FF0000] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'mcp',
		title: 'Connected Apps (MCP)',
		description: 'OpenQuok MCP server in Gemini settings',
		icon: icons.OpenQuok.name,
		containerClass: 'bg-gradient-to-br from-violet-600 to-fuchsia-700 text-white',
		iconClass: 'size-7'
	}
];
