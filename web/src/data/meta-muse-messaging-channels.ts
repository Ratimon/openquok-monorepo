import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

export type MetaMuseMessagingChannel = {
	id: string;
	title: string;
	description: string;
	icon: IconName;
	iconClass?: string;
	iconWidth?: string;
	iconHeight?: string;
	containerClass?: string;
};

/** Where you chat with Meta Muse — mobile, web, and messaging surfaces. */
export const META_MUSE_CORE_MESSAGING_CHANNELS: MetaMuseMessagingChannel[] = [
	{
		id: 'ios',
		title: 'iOS',
		description: 'Message Muse from iPhone or iPad',
		icon: icons.Phone.name,
		containerClass: 'bg-gradient-to-br from-neutral-700 to-neutral-900 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'android',
		title: 'Android',
		description: 'Use Muse on Android phones and tablets',
		icon: icons.Phone.name,
		containerClass: 'bg-[#3DDC84] text-neutral-900',
		iconClass: 'size-7'
	},
	{
		id: 'web',
		title: 'muse.ai',
		description: 'Chat in the browser at meta.ai',
		icon: icons.CustomizedDrawnLaptop.name,
		containerClass: 'bg-violet-700 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'whatsapp',
		title: 'WhatsApp',
		description: 'Reach Muse from WhatsApp when Meta enables it for your account',
		icon: icons.WhatsApp.name,
		containerClass: 'bg-[#25D366] text-white',
		iconClass: 'size-7'
	},
	{
		id: 'secure-vm',
		title: 'Secure VM',
		description: 'Muse runs tasks in an isolated environment with a terminal and filesystem',
		icon: icons.Terminal.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'credentials',
		title: 'Secure credentials',
		description: 'Store API keys in Muse credential prompts — not in ordinary chat',
		icon: icons.Lock.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-7'
	}
];

/** OpenQuok surfaces beside Muse chat — API, CLI, and optional MCP. */
export const META_MUSE_EXTENSION_MESSAGING_CHANNELS: MetaMuseMessagingChannel[] = [
	{
		id: 'custom-connector',
		title: 'Custom connector',
		description: 'Muse can wire OpenQuok from your public OpenAPI document',
		icon: icons.Sparkles.name,
		containerClass: 'bg-primary/15 text-primary',
		iconClass: 'size-7'
	},
	{
		id: 'public-api',
		title: 'Public API',
		description: 'REST endpoints for accounts, drafts, schedules, and publishing',
		icon: icons.OpenQuok.name,
		containerClass: 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300',
		iconClass: 'size-7'
	},
	{
		id: 'openquok-cli',
		title: 'openquok CLI',
		description: 'Shell commands inside the Secure VM when you install the skill',
		icon: icons.Terminal.name,
		containerClass: 'bg-neutral-800 text-white',
		iconClass: 'size-7'
	},
	{
		id: 'hosted-mcp',
		title: 'Hosted MCP',
		description: 'Use OpenQuok MCP when your Muse environment exposes MCP configuration',
		icon: icons.Bot.name,
		containerClass: 'bg-base-200',
		iconClass: 'size-7'
	}
];
