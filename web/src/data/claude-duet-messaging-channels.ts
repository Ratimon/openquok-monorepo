import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type ClaudeDuetMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary Claude Duet surfaces — proactive agent on web and mobile. */
export const CLAUDE_DUET_CORE_MESSAGING_CHANNELS: ClaudeDuetMessagingChannel[] = [
	{
		id: 'ios',
		title: 'iOS',
		description: 'Message Claude Duet from iPhone or iPad with voice or text',
		icon: icons.Phone.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'android',
		title: 'Android',
		description: 'Same ongoing thread on the Claude Duet Android app',
		icon: icons.Phone.name,
		containerClass: 'bg-[#34A853] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'web',
		title: 'claude.ai',
		description: 'Continue projects in the browser when desktop is home',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-gradient-to-br from-orange-900 to-stone-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'brief',
		title: 'Morning brief',
		description: 'Duet surfaces what needs you across connected apps',
		icon: icons.CalendarClock.name,
		containerClass: 'bg-amber-900/80 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'vm',
		title: 'Virtual machine',
		description: 'Background tasks keep running when you step away',
		icon: icons.Terminal.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'approval',
		title: 'Approval gates',
		description: 'Outbound posts wait for your review before they send',
		icon: icons.Lock.name,
		containerClass: 'bg-violet-900 text-white',
		iconClass: 'size-7'
	}
];

/** Skills and marketplace connectors that carry over from your Claude account. */
export const CLAUDE_DUET_EXTENSION_MESSAGING_CHANNELS: ClaudeDuetMessagingChannel[] = [
	{
		id: 'skills',
		title: 'Skills',
		description: 'Reuse openquok-core from your Claude skills library',
		icon: icons.Sparkles.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	},
	{
		id: 'connectors',
		title: 'Connectors',
		description: 'Optional marketplace apps beside the openquok-core skill',
		icon: icons.ClaudeGlyph.name,
		containerClass: 'bg-[#D77655]/20 text-white border border-[#D77655]/40',
		iconClass: 'size-6'
	},
	{
		id: 'claude-code-mcp',
		title: 'Claude Code MCP',
		description: 'Terminal MCP when you draft from the repo instead of Duet',
		icon: icons.ClaudeGlyph.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	}
];
