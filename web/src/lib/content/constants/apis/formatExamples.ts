import facebookLinkPreview from '$openquok-core-examples/facebook-link-preview.json?raw';
import facebookReel from '$openquok-core-examples/facebook-reel.json?raw';
import facebookTextOnly from '$openquok-core-examples/facebook-text-only.json?raw';
import facebookWithImage from '$openquok-core-examples/facebook-with-image.json?raw';
import instagramCarousel from '$openquok-core-examples/instagram-carousel.json?raw';
import instagramFeedPost from '$openquok-core-examples/instagram-feed-post.json?raw';
import instagramReel from '$openquok-core-examples/instagram-reel.json?raw';
import instagramStory from '$openquok-core-examples/instagram-story.json?raw';
import linkedinDocumentCarousel from '$openquok-core-examples/linkedin-document-carousel.json?raw';
import linkedinTextPost from '$openquok-core-examples/linkedin-text-post.json?raw';
import linkedinWithVideo from '$openquok-core-examples/linkedin-with-video.json?raw';
import threadsCrossAccountPlug from '$openquok-core-examples/threads-cross-account-plug.json?raw';
import threadsFollowUpReplies from '$openquok-core-examples/threads-follow-up-replies.json?raw';
import threadsTextOnly from '$openquok-core-examples/threads-text-only.json?raw';
import threadsWithImage from '$openquok-core-examples/threads-with-image.json?raw';
import tiktokPhotoCarousel from '$openquok-core-examples/tiktok-photo-carousel.json?raw';
import tiktokUploadInbox from '$openquok-core-examples/tiktok-upload-inbox.json?raw';
import tiktokVideoDirectPost from '$openquok-core-examples/tiktok-video-direct-post.json?raw';
import xCrossAccountRepost from '$openquok-core-examples/x-cross-account-repost.json?raw';
import xFollowUpReplies from '$openquok-core-examples/x-follow-up-replies.json?raw';
import xFollowUpReplyWithImage from '$openquok-core-examples/x-follow-up-reply-with-image.json?raw';
import youtubeVideoTitlePrivacy from '$openquok-core-examples/youtube-video-title-privacy.json?raw';
import youtubeWithTags from '$openquok-core-examples/youtube-with-tags.json?raw';
import youtubeWithThumbnail from '$openquok-core-examples/youtube-with-thumbnail.json?raw';

import type { PublicApiFormatExample, PublicApiPlatformSlug } from '$lib/content/constants/apis/types';
import { buildPublicApiFormatExample } from '$lib/content/constants/apis/shared';

const X_TEXT_TWEET_JSON = JSON.stringify({
	scheduledAt: '2026-05-14T10:00:00.000Z',
	status: 'scheduled',
	body: 'Launch tweet from the public API.',
	integrationIds: ['<integration-id>']
});

function postingDescription(platformLabel: string, formatLabel: string): string {
	return `Publish a ${formatLabel.toLowerCase()} to ${platformLabel} with POST /public/posts.`;
}

function schedulingDescription(platformLabel: string, formatLabel: string): string {
	return `Schedule a ${formatLabel.toLowerCase()} on ${platformLabel}. Set scheduledAt to an ISO-8601 UTC timestamp.`;
}

function buildExamplesForCapability(
	slug: PublicApiPlatformSlug,
	capability: 'posting' | 'scheduling',
	rows: Array<{
		id: string;
		label: string;
		requestJson: string;
		sourceFile?: string;
	}>
): PublicApiFormatExample[] {
	const channelLabels: Record<PublicApiPlatformSlug, string> = {
		tiktok: 'TikTok',
		x: 'X',
		instagram: 'Instagram',
		youtube: 'YouTube',
		facebook: 'Facebook',
		threads: 'Threads',
		linkedin: 'LinkedIn'
	};
	const platformLabel = channelLabels[slug];

	return rows.map((row) =>
		buildPublicApiFormatExample({
			id: row.id,
			label: row.label,
			description:
				capability === 'posting'
					? postingDescription(platformLabel, row.label)
					: schedulingDescription(platformLabel, row.label),
			requestJson: row.requestJson,
			sourceFile: row.sourceFile
		})
	);
}

const TIKTOK_ROWS = [
	{
		id: 'video',
		label: 'Video',
		requestJson: tiktokVideoDirectPost,
		sourceFile: 'tiktok-video-direct-post.json'
	},
	{
		id: 'photo-carousel',
		label: 'Photo carousel',
		requestJson: tiktokPhotoCarousel,
		sourceFile: 'tiktok-photo-carousel.json'
	},
	{
		id: 'inbox-upload',
		label: 'Inbox upload',
		requestJson: tiktokUploadInbox,
		sourceFile: 'tiktok-upload-inbox.json'
	}
] as const;

const X_ROWS = [
	{
		id: 'tweet',
		label: 'Tweet',
		requestJson: X_TEXT_TWEET_JSON
	},
	{
		id: 'thread',
		label: 'Thread',
		requestJson: xFollowUpReplies,
		sourceFile: 'x-follow-up-replies.json'
	},
	{
		id: 'media-reply',
		label: 'Media reply',
		requestJson: xFollowUpReplyWithImage,
		sourceFile: 'x-follow-up-reply-with-image.json'
	},
	{
		id: 'cross-account-repost',
		label: 'Cross-account repost',
		requestJson: xCrossAccountRepost,
		sourceFile: 'x-cross-account-repost.json'
	}
] as const;

const INSTAGRAM_ROWS = [
	{
		id: 'feed',
		label: 'Feed post',
		requestJson: instagramFeedPost,
		sourceFile: 'instagram-feed-post.json'
	},
	{
		id: 'reel',
		label: 'Reel',
		requestJson: instagramReel,
		sourceFile: 'instagram-reel.json'
	},
	{
		id: 'carousel',
		label: 'Carousel',
		requestJson: instagramCarousel,
		sourceFile: 'instagram-carousel.json'
	},
	{
		id: 'story',
		label: 'Story',
		requestJson: instagramStory,
		sourceFile: 'instagram-story.json'
	}
] as const;

const YOUTUBE_ROWS = [
	{
		id: 'video',
		label: 'Video',
		requestJson: youtubeVideoTitlePrivacy,
		sourceFile: 'youtube-video-title-privacy.json'
	},
	{
		id: 'thumbnail',
		label: 'Custom thumbnail',
		requestJson: youtubeWithThumbnail,
		sourceFile: 'youtube-with-thumbnail.json'
	},
	{
		id: 'tags',
		label: 'Tags',
		requestJson: youtubeWithTags,
		sourceFile: 'youtube-with-tags.json'
	}
] as const;

const FACEBOOK_ROWS = [
	{
		id: 'text',
		label: 'Text',
		requestJson: facebookTextOnly,
		sourceFile: 'facebook-text-only.json'
	},
	{
		id: 'image',
		label: 'Image',
		requestJson: facebookWithImage,
		sourceFile: 'facebook-with-image.json'
	},
	{
		id: 'reel',
		label: 'Reel',
		requestJson: facebookReel,
		sourceFile: 'facebook-reel.json'
	},
	{
		id: 'link-preview',
		label: 'Link preview',
		requestJson: facebookLinkPreview,
		sourceFile: 'facebook-link-preview.json'
	}
] as const;

const THREADS_ROWS = [
	{
		id: 'text',
		label: 'Text',
		requestJson: threadsTextOnly,
		sourceFile: 'threads-text-only.json'
	},
	{
		id: 'thread',
		label: 'Thread',
		requestJson: threadsFollowUpReplies,
		sourceFile: 'threads-follow-up-replies.json'
	},
	{
		id: 'media',
		label: 'Media',
		requestJson: threadsWithImage,
		sourceFile: 'threads-with-image.json'
	},
	{
		id: 'cross-account',
		label: 'Cross-account comment',
		requestJson: threadsCrossAccountPlug,
		sourceFile: 'threads-cross-account-plug.json'
	}
] as const;

const LINKEDIN_ROWS = [
	{
		id: 'text',
		label: 'Text post',
		requestJson: linkedinTextPost,
		sourceFile: 'linkedin-text-post.json'
	},
	{
		id: 'document-carousel',
		label: 'Document carousel',
		requestJson: linkedinDocumentCarousel,
		sourceFile: 'linkedin-document-carousel.json'
	},
	{
		id: 'video',
		label: 'Video',
		requestJson: linkedinWithVideo,
		sourceFile: 'linkedin-with-video.json'
	}
] as const;

export const PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM: Record<
	PublicApiPlatformSlug,
	{ posting: PublicApiFormatExample[]; scheduling: PublicApiFormatExample[] }
> = {
	tiktok: {
		posting: buildExamplesForCapability('tiktok', 'posting', [...TIKTOK_ROWS]),
		scheduling: buildExamplesForCapability('tiktok', 'scheduling', [...TIKTOK_ROWS])
	},
	x: {
		posting: buildExamplesForCapability('x', 'posting', [...X_ROWS]),
		scheduling: buildExamplesForCapability('x', 'scheduling', [...X_ROWS])
	},
	instagram: {
		posting: buildExamplesForCapability('instagram', 'posting', [...INSTAGRAM_ROWS]),
		scheduling: buildExamplesForCapability('instagram', 'scheduling', [...INSTAGRAM_ROWS])
	},
	youtube: {
		posting: buildExamplesForCapability('youtube', 'posting', [...YOUTUBE_ROWS]),
		scheduling: buildExamplesForCapability('youtube', 'scheduling', [...YOUTUBE_ROWS])
	},
	facebook: {
		posting: buildExamplesForCapability('facebook', 'posting', [...FACEBOOK_ROWS]),
		scheduling: buildExamplesForCapability('facebook', 'scheduling', [...FACEBOOK_ROWS])
	},
	threads: {
		posting: buildExamplesForCapability('threads', 'posting', [...THREADS_ROWS]),
		scheduling: buildExamplesForCapability('threads', 'scheduling', [...THREADS_ROWS])
	},
	linkedin: {
		posting: buildExamplesForCapability('linkedin', 'posting', [...LINKEDIN_ROWS]),
		scheduling: buildExamplesForCapability('linkedin', 'scheduling', [...LINKEDIN_ROWS])
	}
};
