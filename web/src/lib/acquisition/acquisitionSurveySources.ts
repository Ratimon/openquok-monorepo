import type { IconName } from '$data/icons';
import { icons } from '$data/icons';

import type { AcquisitionSurveySourceSlug } from '$lib/acquisition/acquisition.types';

export type AcquisitionSurveySourceOption = {
	slug: AcquisitionSurveySourceSlug;
	label: string;
	iconName: IconName;
	iconTileClass?: string;
};

export const ACQUISITION_SURVEY_SOURCE_OPTIONS: AcquisitionSurveySourceOption[] = [
	{
		slug: 'search_engine',
		label: 'Search engine',
		iconName: icons.Google.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'reddit',
		label: 'Reddit',
		iconName: icons.Reddit.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'x',
		label: 'X',
		iconName: icons.XGlyph.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'chatgpt',
		label: 'ChatGPT',
		iconName: icons.ChatGPT.name,
		iconTileClass: 'bg-neutral'
	},
	{
		slug: 'youtube',
		label: 'YouTube',
		iconName: icons.YouTubeGlyph.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'launch_platform',
		label: 'Launch platform',
		iconName: icons.Rocket.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'openquok_blog',
		label: 'Our Blog',
		iconName: icons.BookOpen.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'recommendation',
		label: 'Recommendation',
		iconName: icons.Handshake.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'tiktok',
		label: 'TikTok',
		iconName: icons.TikTok.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'email_outreach',
		label: 'Email',
		iconName: icons.Mail.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'ads',
		label: 'Ads',
		iconName: icons.Target.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'newsletter',
		label: 'Newsletter',
		iconName: icons.Mails.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'podcast',
		label: 'Podcast',
		iconName: icons.Mic.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'linkedin',
		label: 'LinkedIn',
		iconName: icons.LinkedInGlyph.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'github',
		label: 'GitHub',
		iconName: icons.Github.name,
		iconTileClass: 'bg-transparent'
	},
	{
		slug: 'other',
		label: 'Other',
		iconName: icons.CircleQuestionMark.name,
		iconTileClass: 'bg-transparent'
	}
];
