import type { OpenquokCliCommandReferenceItem } from '$lib/content/constants/openquokCliCommandReference';
import { OPENQUOK_CORE_EXAMPLE_JSON_BY_FILE } from '$lib/content/constants/openquokCoreExampleJson';

function integrationListJqFilter(providerIdentifiers: readonly string[]): string {
	if (providerIdentifiers.length === 1) {
		return `.identifier=="${providerIdentifiers[0]}"`;
	}
	return providerIdentifiers.map((id) => `.identifier=="${id}"`).join(' or ');
}

function discoverIntegrationCommand(providerIdentifiers: readonly string[]): string {
	const jqFilter = integrationListJqFilter(providerIdentifiers);
	return `openquok integrations:list | jq -r '.[] | select(${jqFilter}) | .id'`;
}

type AgentChannelCliRecipe = {
	command: string;
	description: string;
	exampleJsonFile?: string;
};

function postsCreateJsonCommand(
	exampleFile: string,
	description: string
): AgentChannelCliRecipe {
	return {
		command: 'openquok posts:create --json',
		description,
		exampleJsonFile: exampleFile
	};
}

function globalPlugUpsertRecipe(
	func: string,
	fieldsJson: string,
	description: string
): AgentChannelCliRecipe {
	return {
		command: `openquok plugs:upsert "$ID" --func ${func} --fields '${fieldsJson}'`,
		description
	};
}

function globalPlugCommands(providerIdentifier: string): readonly AgentChannelCliRecipe[] {
	return [
		{
			command: `openquok plugs:catalog | jq '.plugs[] | select(.identifier=="${providerIdentifier}")'`,
			description: 'List global plug types and field names for this provider'
		},
		{
			command: 'openquok plugs:list "$ID"',
			description: 'List saved global plug rules on this channel'
		}
	];
}

function toCommandReferenceItem(recipe: AgentChannelCliRecipe): OpenquokCliCommandReferenceItem {
	const exampleJson = recipe.exampleJsonFile
		? OPENQUOK_CORE_EXAMPLE_JSON_BY_FILE[recipe.exampleJsonFile]
		: undefined;

	return {
		command: recipe.command,
		description: recipe.description,
		...(exampleJson ? { exampleJson } : {})
	};
}

const CHANNEL_CLI_RECIPES: Record<string, readonly AgentChannelCliRecipe[]> = {
	facebook: [
		{
			command: discoverIntegrationCommand(['facebook']),
			description: 'Discover your Facebook Page integration UUID'
		},
		{
			command: 'openquok integrations:settings "$FB_ID"',
			description: 'Get Page posting rules, max length, and allowed tools'
		},
		postsCreateJsonCommand('facebook-text-only.json', 'Schedule a text-only Page post'),
		postsCreateJsonCommand(
			'facebook-link-preview.json',
			'Share a link with preview card (text-only, no media)'
		),
		postsCreateJsonCommand('facebook-with-image.json', 'Schedule a single-photo Page post'),
		postsCreateJsonCommand('facebook-multi-photo.json', 'Publish multiple photos in one Page post'),
		postsCreateJsonCommand('facebook-reel.json', 'Publish an MP4 video as a Page Reel'),
		postsCreateJsonCommand(
			'facebook-follow-up-comment.json',
			'Schedule a Page post and a follow-up comment'
		),
		{
			command: 'openquok analytics:platform "$FB_ID" -d 30',
			description: 'Pull 30-day Page analytics'
		},
		{
			command: 'openquok analytics:post "$POST_ID" -d 7',
			description: 'Per-post insights for a published Page post'
		}
	],
	threads: [
		{
			command: discoverIntegrationCommand(['threads']),
			description: 'Discover your Threads integration UUID'
		},
		{
			command: 'openquok integrations:settings "$THREADS_ID"',
			description: 'Get Threads posting rules and character limits'
		},
		{
			command: 'openquok posts:create --json ./examples/threads-text-only.json',
			description: 'Schedule a text-only Threads post'
		},
		{
			command: 'openquok posts:create --json ./examples/threads-follow-up-replies.json',
			description: 'Schedule a root post and follow-up replies'
		},
		postsCreateJsonCommand(
			'threads-cross-account-plug.json',
			'Comment from another Threads channel after publish (crossAccountPlugs)'
		),
		postsCreateJsonCommand(
			'threads-engagement-plug.json',
			'Same-account delayed engagement reply (internalEngagementPlug)'
		),
		...globalPlugCommands('threads'),
		globalPlugUpsertRecipe(
			'autoPlugPost',
			'[{"name":"likesAmount","value":"100"},{"name":"post","value":"Thanks for reading!"}]',
			'Auto-reply when a thread reaches a likes threshold (global plug)'
		),
		{
			command: 'openquok analytics:platform "$THREADS_ID" -d 30',
			description: 'Pull 30-day Threads analytics'
		}
	],
	instagram: [
		{
			command: discoverIntegrationCommand(['instagram-business', 'instagram-standalone', 'instagram']),
			description: 'Discover your Instagram integration UUID'
		},
		{
			command: 'openquok integrations:settings "$IG_ID"',
			description: 'Get Instagram posting rules and post_type options'
		},
		{
			command: 'openquok posts:create --json ./examples/instagram-feed-post.json',
			description: 'Schedule an Instagram feed image post'
		},
		{
			command: 'openquok posts:create --json ./examples/instagram-carousel.json',
			description: 'Publish a multi-image carousel'
		},
		{
			command: 'openquok posts:create --json ./examples/instagram-reel.json',
			description: 'Schedule an Instagram Reel from MP4'
		},
		{
			command: 'openquok analytics:platform "$IG_ID" -d 30',
			description: 'Pull 30-day Instagram analytics'
		}
	],
	youtube: [
		{
			command: discoverIntegrationCommand(['youtube']),
			description: 'Discover your YouTube channel integration UUID'
		},
		{
			command: 'openquok integrations:settings "$YT_ID"',
			description: 'Get YouTube upload rules and privacy options'
		},
		{
			command: 'openquok posts:create --json ./examples/youtube-video-title-privacy.json',
			description: 'Schedule a video upload with title and privacy'
		},
		{
			command: 'openquok posts:create --json ./examples/youtube-with-thumbnail.json',
			description: 'Upload with a custom thumbnail image'
		},
		{
			command: 'openquok analytics:platform "$YT_ID" -d 30',
			description: 'Pull 30-day channel analytics'
		}
	],
	tiktok: [
		{
			command: discoverIntegrationCommand(['tiktok']),
			description: 'Discover your TikTok integration UUID'
		},
		{
			command: 'openquok integrations:settings "$TIKTOK_ID"',
			description: 'Get TikTok direct-post rules and privacy levels'
		},
		{
			command: 'openquok posts:create --json ./examples/tiktok-video-direct-post.json',
			description: 'Publish a TikTok video with direct-post settings'
		},
		{
			command: 'openquok posts:create --json ./examples/tiktok-photo-carousel.json',
			description: 'Schedule a photo carousel on TikTok'
		},
		{
			command: 'openquok analytics:platform "$TIKTOK_ID" -d 30',
			description: 'Pull 30-day TikTok analytics'
		}
	],
	linkedin: [
		{
			command: discoverIntegrationCommand(['linkedin', 'linkedin-page']),
			description: 'Discover your LinkedIn profile or Page integration UUID'
		},
		{
			command: 'openquok integrations:settings "$LI_ID"',
			description: 'Get LinkedIn posting rules and media limits'
		},
		{
			command: 'openquok posts:create --json ./examples/linkedin-text-post.json',
			description: 'Schedule a LinkedIn text post'
		},
		{
			command: 'openquok posts:create --json ./examples/linkedin-document-carousel.json',
			description: 'Publish a document carousel on LinkedIn'
		},
		...globalPlugCommands('linkedin-page'),
		globalPlugUpsertRecipe(
			'autoPlugPost',
			'[{"name":"likesAmount","value":"100"},{"name":"post","value":"Great discussion — link in comments."}]',
			'LinkedIn Page: auto-comment when a post reaches a likes threshold (global plug)'
		),
		globalPlugUpsertRecipe(
			'autoRepostPost',
			'[{"name":"likesAmount","value":"100"}]',
			'LinkedIn Page: auto-reshare when a post reaches a likes threshold (global plug)'
		),
		{
			command: 'openquok analytics:platform "$LI_ID" -d 30',
			description: 'Pull 30-day LinkedIn analytics'
		}
	],
	x: [
		{
			command: discoverIntegrationCommand(['x']),
			description: 'Discover your X integration UUID'
		},
		{
			command: 'openquok integrations:settings "$X_ID"',
			description: 'Get X posting rules and character limits'
		},
		postsCreateJsonCommand('x-text-only.json', 'Schedule a text-only post on X'),
		postsCreateJsonCommand(
			'x-cross-account-repost.json',
			'Repost from another X channel after publish (crossAccountPlugs)'
		),
		...globalPlugCommands('x'),
		globalPlugUpsertRecipe(
			'autoRepostPost',
			'[{"name":"likesAmount","value":"100"}]',
			'Auto-repost when a post reaches a likes threshold (global plug)'
		),
		globalPlugUpsertRecipe(
			'autoPlugPost',
			'[{"name":"likesAmount","value":"100"},{"name":"post","value":"Thanks for the support!"}]',
			'Auto-reply when a post reaches a likes threshold (global plug)'
		),
		{
			command: 'openquok analytics:platform "$X_ID" -d 30',
			description: 'Pull 30-day X analytics'
		}
	]
};

/** Platform-specific CLI commands for agent channel SEO landing pages. */
export function buildAgentChannelCliCommandReference(
	channelSlug: string
): readonly OpenquokCliCommandReferenceItem[] {
	return (CHANNEL_CLI_RECIPES[channelSlug] ?? []).map(toCommandReferenceItem);
}

const KANBAN_EXAMPLE_BY_CHANNEL: Record<string, string> = {
	facebook: 'facebook-text-only.json',
	threads: 'threads-text-only.json',
	instagram: 'instagram-feed-post.json',
	youtube: 'youtube-video-title-privacy.json',
	tiktok: 'tiktok-video-direct-post.json',
	linkedin: 'linkedin-text-post.json',
	x: 'x-text-only.json'
};

/** Kanban feature section CLI snippet for a platform. */
export function buildAgentChannelKanbanCliCommands(channelSlug: string, platformLabel: string): string {
	const exampleFile = KANBAN_EXAMPLE_BY_CHANNEL[channelSlug] ?? `${channelSlug}-text-only.json`;
	return `# Draft + human checklist (${platformLabel})
openquok posts:create --json ./examples/${exampleFile}

openquok posts:review-todo <post-id> --note "…"
openquok posts:status <post-id> --status draft
openquok posts:status <post-id> -s schedule`;
}

/** Analytics feature section CLI snippet for a platform. */
export function buildAgentChannelAnalyticsCliCommands(
	platformLabel: string,
	providerIdentifiers: readonly string[]
): string {
	const jqFilter = integrationListJqFilter(providerIdentifiers);
	return `# ${platformLabel} platform metrics
INTEGRATION_ID=$(openquok integrations:list | jq -r '.[] | select(${jqFilter}) | .id')
openquok analytics:platform "$INTEGRATION_ID" -d 30

# Per-post insights
openquok analytics:post <post-id> -d 7`;
}
