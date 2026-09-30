import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type ManusMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary Manus clients — Studio, web, and mobile. */
export const MANUS_CORE_MESSAGING_CHANNELS: ManusMessagingChannel[] = [
	{
		id: 'studio',
		title: 'Manus Studio',
		description: 'Desktop workspace for documents, code, and long-running projects',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'web',
		title: 'Web app',
		description: 'Run tasks from manus.im in the browser',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'mobile',
		title: 'Mobile',
		description: 'Continue projects from iOS or Android apps',
		icon: icons.Phone.name,
		containerClass: 'bg-gradient-to-br from-neutral-700 to-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'skills',
		title: 'Skills',
		description: 'Import or upload openquok-core, then invoke it with / in chat',
		icon: icons.Sparkles.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-7'
	},
	{
		id: 'cloud-computer',
		title: 'Cloud Computer',
		description: 'Dedicated environment with browser, filesystem, and terminal',
		icon: icons.Terminal.name,
		containerClass: 'bg-violet-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'automations',
		title: 'Automations',
		description: 'Event-triggered workflows beside scheduled tasks',
		icon: icons.CalendarClock.name,
		containerClass: 'bg-violet-600 text-white',
		iconClass: 'size-7'
	}
];

/** Optional connectors — secondary to CLI + openquok-core skill. */
export const MANUS_EXTENSION_MESSAGING_CHANNELS: ManusMessagingChannel[] = [
	{
		id: 'connectors',
		title: 'Connectors',
		description: 'Optional integrations when your project needs external services',
		icon: icons.Link.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-6'
	}
];
