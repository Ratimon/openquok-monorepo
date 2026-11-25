import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type CueMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Primary Cue clients — web, mobile, and agent computer. */
export const CUE_CORE_MESSAGING_CHANNELS: CueMessagingChannel[] = [
	{
		id: 'web',
		title: 'Cue OS web',
		description: 'Chat with your Cue and manage agent settings in the browser',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'mobile',
		title: 'Mobile',
		description: 'Message your Cue from phone while credentials stay on the computer',
		icon: icons.Phone.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'cue-cli',
		title: 'Cue CLI',
		description: 'Pair your computer or use a cloud computer — install skills here',
		icon: icons.Terminal.name,
		containerClass: 'bg-violet-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'skills',
		title: 'Skills',
		description: 'cue skill install openquok-core so your Cue can call the CLI',
		icon: icons.Sparkles.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-7'
	},
	{
		id: 'cloud-computer',
		title: 'Cloud computer',
		description: 'Hosted environment with filesystem and tools for your Cue',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-gradient-to-br from-neutral-700 to-neutral-900 text-white',
		iconClass: 'size-7'
	}
];

/** Optional automations beside openquok-core. */
export const CUE_EXTENSION_MESSAGING_CHANNELS: CueMessagingChannel[] = [
	{
		id: 'routines',
		title: 'Routines',
		description: 'Scheduled tasks on Cue OS when you want recurring drafts',
		icon: icons.CalendarClock.name,
		containerClass: 'bg-violet-600 text-white',
		iconClass: 'size-7'
	}
];