import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type ThinkrailMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary ThinkRail surfaces — worktree IDE, not Telegram-first gateways. */
export const THINKRAIL_CORE_MESSAGING_CHANNELS: ThinkrailMessagingChannel[] = [
	{
		id: 'macos',
		title: 'macOS',
		description: 'CLI or desktop build on Apple Silicon',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'linux',
		title: 'Linux',
		description: 'CLI or desktop on arm64 and x64',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-700 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'windows',
		title: 'Windows',
		description: 'CLI or desktop build for Windows x64',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-[#0078D4] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'worktrees',
		title: 'Git worktrees',
		description: 'Each workspace is its own branch and cwd',
		icon: icons.FolderCode.name,
		containerClass: 'bg-lime-700 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'monaco',
		title: 'Monaco editor',
		description: 'Tabs, files tree, and live diffs per worktree',
		icon: icons.Code.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-7'
	},
	{
		id: 'terminals',
		title: 'Worktree terminals',
		description: 'PTYs scoped to the active workspace cwd',
		icon: icons.Terminal.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-7'
	}
];

/** Optional pi MCP extensions — secondary to CLI + openquok-core. */
export const THINKRAIL_EXTENSION_MESSAGING_CHANNELS: ThinkrailMessagingChannel[] = [
	{
		id: 'pi-mcp',
		title: 'Pi MCP extensions',
		description: 'Optional MCP tools beside skills — OpenQuok stays CLI-first',
		icon: icons.Link.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	}
];
