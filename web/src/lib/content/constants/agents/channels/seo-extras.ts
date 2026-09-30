/**
 * Optional per-host, per-platform keyword phrases for `/agents/{host}/{channel}`.
 * Merged into page `keywords` in `channels/general.ts` — keep phrases accurate (no false product claims).
 */
const HOST_PLATFORM_SEO_EXTRAS: Readonly<
	Record<string, Readonly<Partial<Record<string, readonly string[]>>>>
> = {
	'meta-muse': {
		Facebook: [
			'Meta Muse Facebook',
			'schedule Facebook posts Meta Muse',
			'Meta AI agent Facebook Page',
			'Facebook creator Meta personal agent'
		],
		Instagram: [
			'Meta Muse Instagram',
			'schedule Instagram Meta Muse',
			'Meta AI agent Instagram creator',
			'Instagram Reels Muse scheduling'
		],
		Threads: [
			'Meta Muse Threads',
			'schedule Threads from Meta Muse',
			'Meta Threads agent scheduling'
		]
	},
	manus: {
		Instagram: [
			'Manus Video Editor Instagram launch',
			'Manus schedule Instagram posts',
			'Manus Studio social launch'
		],
		YouTube: [
			'Manus video export YouTube schedule',
			'Manus Video Editor YouTube launch'
		],
		TikTok: ['Manus short video TikTok schedule', 'Manus launch TikTok posts'],
		LinkedIn: ['Manus B2B LinkedIn schedule', 'Manus Studio LinkedIn launch']
	},
	openclaw: {
		X: ['OpenClaw X scheduler', 'schedule X posts from Telegram OpenClaw'],
		LinkedIn: ['OpenClaw LinkedIn automation', 'self-hosted agent LinkedIn posts']
	},
	hermes: {
		X: ['Hermes Agent X scheduling', 'Hermes gateway social posts'],
		Discord: ['Hermes Discord agent schedule posts']
	},
	'grok-bot': {
		X: ['Grok Bot X scheduling', 'xAI agent schedule X posts'],
		LinkedIn: ['Grok Bot LinkedIn drafts', 'cloud computer social scheduling']
	},
	thinkrail: {
		'Dev.to': ['ThinkRail Dev.to scheduling', 'pi agent Dev.to posts', 'worktree IDE developer blog']
	}
};

/** Host-wide extras on every channel page (search intents that are not platform-specific). */
const HOST_GLOBAL_SEO_EXTRAS: Readonly<Record<string, readonly string[]>> = {
	'meta-muse': [
		'Meta Muse WhatsApp',
		'muse.ai social scheduling',
		'Muse Secure VM OpenQuok',
		'Meta personal agent schedule posts'
	],
	manus: [
		'Manus vs Cue social media',
		'Cue app Manus scheduling',
		'Manus 2.0 openquok-core',
		'Manus Skills social posts',
		'Manus Cloud Computer CLI'
	],
	openclaw: [
		'OpenClaw Telegram scheduler',
		'OpenClaw WhatsApp social posts',
		'self-hosted AI agent scheduling'
	],
	hermes: ['Hermes Telegram social scheduler', 'Nous Hermes Skills Hub posts'],
	'grok-bot': [
		'Grok Bot cloud computer social',
		'xAI Grok teammate scheduling',
		'xAI Grok Bot OpenQuok',
		'Cursor Grok Bot scheduling',
		'Cursor Ultra Grok Bot social posts',
		'Cursor Teams Grok Bot OpenQuok',
		'SpaceX Grok Bot social media',
		'SuperGrok Heavy Grok Bot posts'
	],
	thinkrail: ['ThinkRail pi agent scheduler', 'git worktree social media posts']
};

export function buildAgentChannelSeoExtras(
	hostSlug: string,
	platformLabel: string
): readonly string[] {
	const global = HOST_GLOBAL_SEO_EXTRAS[hostSlug] ?? [];
	const platform = HOST_PLATFORM_SEO_EXTRAS[hostSlug]?.[platformLabel] ?? [];
	return [...global, ...platform];
}
