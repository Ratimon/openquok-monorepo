import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { BlogAudienceCardPresetId } from '$lib/blogs/blog.types';

export type BlogAudienceCardPreset = {
	id: BlogAudienceCardPresetId;
	label: string;
	defaultTitle: string;
	defaultDescription: string;
	iconName: IconName;
	iconClass: string;
	containerClass: string;
};

export const BLOG_AUDIENCE_CARD_PRESETS: readonly BlogAudienceCardPreset[] = [
	{
		id: 'developer',
		label: 'Developers',
		defaultTitle: 'Developers',
		defaultDescription:
			'You self-host apps, compare stacks, and wire agents to your own infra. This post speaks to that workflow.',
		iconName: icons.Code.name,
		iconClass: 'text-sky-400',
		containerClass: 'h-full min-h-0'
	},
	{
		id: 'team-social-managers',
		label: 'Team & social managers',
		defaultTitle: 'Team & social managers',
		defaultDescription:
			'You run calendars for a brand or client. You need repeatable scheduling without losing review control.',
		iconName: icons.Users.name,
		iconClass: 'text-violet-400',
		containerClass: 'h-full min-h-0'
	},
	{
		id: 'founders',
		label: 'Founders',
		defaultTitle: 'Founders',
		defaultDescription:
			'You ship product and still own distribution. You want lean tools you can adapt as the company grows.',
		iconName: icons.Rocket.name,
		iconClass: 'text-amber-400',
		containerClass: 'h-full min-h-0'
	},
	{
		id: 'marketers',
		label: 'Marketers',
		defaultTitle: 'Marketers',
		defaultDescription:
			'You plan campaigns across channels. You care about SEO, docs, and content that converts.',
		iconName: icons.ChartBar.name,
		iconClass: 'text-emerald-400',
		containerClass: 'h-full min-h-0'
	},
	{
		id: 'self-host-operators',
		label: 'Self-host operators',
		defaultTitle: 'Self-host operators',
		defaultDescription:
			'You run Docker or Railway for your stack. You want clear architecture and ops trade-offs.',
		iconName: icons.Cog.name,
		iconClass: 'text-cyan-400',
		containerClass: 'h-full min-h-0'
	},
	{
		id: 'custom',
		label: 'Custom (pick icon only)',
		defaultTitle: '',
		defaultDescription: '',
		iconName: icons.Users.name,
		iconClass: 'text-neutral-300',
		containerClass: 'h-full min-h-0'
	}
] as const;

export function getBlogAudienceCardPreset(
	preset: BlogAudienceCardPresetId | null | undefined
): BlogAudienceCardPreset {
	const id = preset ?? 'custom';
	return BLOG_AUDIENCE_CARD_PRESETS.find((row) => row.id === id) ?? BLOG_AUDIENCE_CARD_PRESETS.at(-1)!;
}