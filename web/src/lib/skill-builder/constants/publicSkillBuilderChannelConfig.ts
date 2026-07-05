import type { IconName } from '$data/icons';

import {
	listAvailablePublicChannels,
	type PublicChannelLandingPageViewModel
} from '$lib/content/constants/publicChannelConfig';
import { getRootPathPublicSkillBuilderChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import type { SkillBuilderChannelHubLinkViewModel } from '$lib/skill-builder/skillBuilder.types';
import { route } from '$lib/utils/path';
import {
	FACEBOOK_FOLLOW_UP_COMMENT_PAYLOAD,
	FACEBOOK_LINK_PREVIEW_PAYLOAD,
	FACEBOOK_MULTI_PHOTO_PAYLOAD,
	FACEBOOK_REEL_PAYLOAD,
	FACEBOOK_TEXT_ONLY_PAYLOAD,
	INSTAGRAM_FEED_POST_PAYLOAD,
	LINKEDIN_TEXT_POST_PAYLOAD,
	THREADS_FOLLOW_UP_REPLIES_PAYLOAD,
	THREADS_TEXT_ONLY_PAYLOAD,
	TIKTOK_VIDEO_DIRECT_POST_PAYLOAD,
	X_REPLY_CHAIN_PAYLOAD,
	X_TEXT_ONLY_PAYLOAD,
	YOUTUBE_VIDEO_TITLE_PRIVACY_PAYLOAD
} from '$lib/skill-builder/constants/skillBuilderChannelExamplePayloads';

type SkillBuilderChannelRecipe = {
	id: string;
	label: string;
	prompt: string;
	examplePayload: Record<string, unknown>;
};

export type SkillBuilderChannelPageConfig = {
	/** URL segment under `/tools/skill-builder/` — matches `publicChannelConfig.slug`. */
	channelSlug: string;
	/** Integration catalog identifiers used in CLI jq filters. */
	providerIdentifiers: readonly string[];
	platformLabel: string;
	icon: IconName;
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	cliExamplesPath: string;
	recipes: readonly SkillBuilderChannelRecipe[];
};

const CHANNEL_PROVIDER_IDENTIFIERS: Record<string, readonly string[]> = {
	facebook: ['facebook'],
	threads: ['threads'],
	instagram: ['instagram-business', 'instagram-standalone', 'instagram'],
	youtube: ['youtube'],
	tiktok: ['tiktok'],
	linkedin: ['linkedin', 'linkedin-page'],
	x: ['x']
};

const CHANNEL_RECIPES: Record<string, readonly SkillBuilderChannelRecipe[]> = {
	facebook: [
		{
			id: 'facebook-text',
			label: 'Text feed post',
			prompt: 'Schedule a text-only Facebook Page post with posts:create.',
			examplePayload: { ...FACEBOOK_TEXT_ONLY_PAYLOAD }
		},
		{
			id: 'facebook-link-preview',
			label: 'Link preview card',
			prompt: 'Share a link with a preview card using providerSettings url on a text-only post.',
			examplePayload: { ...FACEBOOK_LINK_PREVIEW_PAYLOAD }
		},
		{
			id: 'facebook-multi-photo',
			label: 'Multi-photo carousel',
			prompt: 'Publish multiple photos in one Page post. Upload each asset first, then pass media[] in JSON.',
			examplePayload: { ...FACEBOOK_MULTI_PHOTO_PAYLOAD }
		},
		{
			id: 'facebook-reel',
			label: 'Reel from MP4',
			prompt: 'Publish an MP4 video to the Page. Facebook surfaces eligible uploads as Reels.',
			examplePayload: { ...FACEBOOK_REEL_PAYLOAD }
		},
		{
			id: 'facebook-follow-up-comment',
			label: 'Follow-up comment',
			prompt: 'Schedule the Page post and a follow-up comment using the replies array.',
			examplePayload: { ...FACEBOOK_FOLLOW_UP_COMMENT_PAYLOAD }
		}
	],
	threads: [
		{
			id: 'threads-text',
			label: 'Text-only post',
			prompt: 'Schedule a text-only Threads post.',
			examplePayload: { ...THREADS_TEXT_ONLY_PAYLOAD }
		},
		{
			id: 'threads-follow-up-replies',
			label: 'Reply chain',
			prompt: 'Schedule a root post and follow-up replies under threads.replies.',
			examplePayload: { ...THREADS_FOLLOW_UP_REPLIES_PAYLOAD }
		}
	],
	instagram: [
		{
			id: 'instagram-feed-post',
			label: 'Feed post',
			prompt: 'Schedule an Instagram feed image post with post_type in provider settings.',
			examplePayload: { ...INSTAGRAM_FEED_POST_PAYLOAD }
		}
	],
	youtube: [
		{
			id: 'youtube-video',
			label: 'Video upload',
			prompt: 'Schedule a YouTube upload with title, privacy, and video media.',
			examplePayload: { ...YOUTUBE_VIDEO_TITLE_PRIVACY_PAYLOAD }
		}
	],
	tiktok: [
		{
			id: 'tiktok-video-direct',
			label: 'Direct video post',
			prompt: 'Publish a TikTok video with direct-post settings and privacy_level.',
			examplePayload: { ...TIKTOK_VIDEO_DIRECT_POST_PAYLOAD }
		}
	],
	linkedin: [
		{
			id: 'linkedin-text',
			label: 'Text post',
			prompt: 'Schedule a LinkedIn profile or Page text post.',
			examplePayload: { ...LINKEDIN_TEXT_POST_PAYLOAD }
		}
	],
	x: [
		{
			id: 'x-text',
			label: 'Text post',
			prompt: 'Schedule a text-only post on X.',
			examplePayload: { ...X_TEXT_ONLY_PAYLOAD }
		},
		{
			id: 'x-reply-chain',
			label: 'Reply chain',
			prompt: 'Schedule a root post and follow-up replies under x.replies.',
			examplePayload: { ...X_REPLY_CHAIN_PAYLOAD }
		}
	]
};

function buildChannelPageConfig(channel: PublicChannelLandingPageViewModel): SkillBuilderChannelPageConfig {
	const providerIdentifiers =
		CHANNEL_PROVIDER_IDENTIFIERS[channel.slug] ?? [channel.platformId || channel.slug];
	const recipes = CHANNEL_RECIPES[channel.slug] ?? [];

	return {
		channelSlug: channel.slug,
		providerIdentifiers,
		platformLabel: channel.platformLabel,
		icon: channel.icon,
		metaTitle: `${channel.platformLabel} Skill Builder`,
		metaDescription: `Build a ${channel.platformLabel} scheduling skill with pre-loaded openquok CLI examples. Compose posts:create recipes, preview SKILL.md, and export for your agent workspace.`,
		keywords: [
			`${channel.platformLabel} skill builder`,
			`${channel.platformLabel} CLI examples`,
			'openquok posts:create',
			'agent skill',
			'SKILL.md',
			...channel.keywords.slice(0, 4)
		],
		cliExamplesPath: `/docs/cli-examples/${channel.slug}`,
		recipes
	};
}

const channelConfigs = listAvailablePublicChannels().map(buildChannelPageConfig);
const channelConfigBySlug = new Map(channelConfigs.map((config) => [config.channelSlug, config]));

export function getSkillBuilderChannelBySlug(slug: string): SkillBuilderChannelPageConfig | undefined {
	const key = slug.trim().toLowerCase();
	return channelConfigBySlug.get(key);
}

export function listSkillBuilderChannelsForHub(): SkillBuilderChannelHubLinkViewModel[] {
	return channelConfigs.map((config) => ({
		slug: config.channelSlug,
		platformLabel: config.platformLabel,
		icon: config.icon,
		href: route(getRootPathPublicSkillBuilderChannel(config.channelSlug)),
		description: config.metaDescription
	}));
}
