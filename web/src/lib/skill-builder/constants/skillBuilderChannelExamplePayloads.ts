/** Copy-paste payloads aligned with agent openquok-core JSON examples (POST /public/posts shape). */

export const FACEBOOK_TEXT_ONLY_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Hello from our Page',
	integrationIds: ['<integration-id>']
} as const;

export const FACEBOOK_LINK_PREVIEW_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Read more on our site',
	integrationIds: ['<integration-id>'],
	providerSettingsByIntegrationId: {
		'<integration-id>': {
			url: 'https://example.com/article'
		}
	}
} as const;

export const FACEBOOK_MULTI_PHOTO_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Two photos, one post',
	integrationIds: ['<integration-id>'],
	media: [
		{ id: '<media-id-1>', path: 'https://cdn.example.com/a.jpg' },
		{ id: '<media-id-2>', path: 'https://cdn.example.com/b.jpg' }
	]
} as const;

export const FACEBOOK_REEL_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'New Reel on our Page',
	integrationIds: ['<integration-id>'],
	media: [{ id: '<media-id>', path: 'https://cdn.example.com/reel.mp4' }]
} as const;

export const FACEBOOK_FOLLOW_UP_COMMENT_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Main post',
	integrationIds: ['<integration-id>'],
	replies: [{ id: 'reply-1', message: 'First comment on the post', delaySeconds: 60 }]
} as const;

export const THREADS_TEXT_ONLY_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Launch post',
	integrationIds: ['<integration-id>']
} as const;

export const THREADS_FOLLOW_UP_REPLIES_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Thread 1/3: Why we built this',
	integrationIds: ['<integration-id>'],
	providerSettingsByIntegrationId: {
		'<integration-id>': {
			threads: {
				replies: [
					{ id: 'reply-1', message: 'Thread 2/3: The architecture', delaySeconds: 60 },
					{ id: 'reply-2', message: 'Thread 3/3: What is next', delaySeconds: 120 }
				]
			}
		}
	}
} as const;

export const THREADS_CROSS_ACCOUNT_PLUG_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Main thread from channel A',
	integrationIds: ['<integration-id-1>'],
	providerSettingsByIntegrationId: {
		'<integration-id-1>': {
			threads: {
				crossAccountPlugs: [
					{
						plugName: 'threads-cross-account-comment',
						enabled: true,
						delayMs: 3600000,
						integrationIds: ['<integration-id-2>'],
						fields: {
							comment: 'Great thread — sharing from our other account.'
						}
					}
				]
			}
		}
	}
} as const;

export const INSTAGRAM_FEED_POST_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Caption #hashtag',
	integrationIds: ['<integration-id>'],
	media: [{ id: '<media-id>', path: 'https://cdn.example.com/image.jpg' }],
	providerSettingsByIntegrationId: {
		'<integration-id>': {
			post_type: 'post'
		}
	}
} as const;

export const LINKEDIN_TEXT_POST_PAYLOAD = {
	scheduledAt: '2026-06-20T14:00:00.000Z',
	status: 'scheduled',
	body: 'Post body',
	integrationIds: ['<integration-id>']
} as const;

export const TIKTOK_VIDEO_DIRECT_POST_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Vertical clip — scheduled from the CLI.',
	integrationIds: ['<integration-id>'],
	media: [{ id: '<media-id>', path: 'https://cdn.example.com/clip.mp4' }],
	providerSettingsByIntegrationId: {
		'<integration-id>': {
			privacy_level: 'PUBLIC_TO_EVERYONE',
			content_posting_method: 'DIRECT_POST',
			comment: true,
			duet: false,
			stitch: false
		}
	}
} as const;

export const YOUTUBE_VIDEO_TITLE_PRIVACY_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Full product walkthrough — links in description.',
	integrationIds: ['<integration-id>'],
	media: [{ id: '<media-id>', path: 'https://cdn.example.com/walkthrough.mp4' }],
	providerSettingsByIntegrationId: {
		'<integration-id>': {
			title: 'OpenQuok walkthrough',
			type: 'public',
			selfDeclaredMadeForKids: 'no'
		}
	}
} as const;

export const X_TEXT_ONLY_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Excited to announce our new feature!',
	integrationIds: ['<integration-id>']
} as const;

export const X_REPLY_CHAIN_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Launch day.',
	integrationIds: ['<integration-id>'],
	providerSettingsByIntegrationId: {
		'<integration-id>': {
			x: {
				replies: [{ id: 'reply-1', message: 'Details in the thread below.', delaySeconds: 60 }]
			}
		}
	}
} as const;

export const X_CROSS_ACCOUNT_REPOST_PAYLOAD = {
	scheduledAt: '2026-01-01T12:00:00.000Z',
	status: 'scheduled',
	body: 'Main tweet from channel A',
	integrationIds: ['<integration-id-1>'],
	providerSettingsByIntegrationId: {
		'<integration-id-1>': {
			x: {
				crossAccountPlugs: [
					{
						plugName: 'x-repost-post-users',
						enabled: true,
						delayMs: 0,
						integrationIds: ['<integration-id-2>'],
						fields: {}
					}
				]
			}
		}
	}
} as const;
