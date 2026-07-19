import { resolveOpenquokCommandTemplate } from '$lib/skill-builder/constants/openquokCliCommandSnippets';
import { defaultPostsCreatePayload } from '$lib/skill-builder/utils/postsCreatePayload';

export type OpenquokCommandWorkflowMeta = {
	title: string;
	prompt: string;
	docsPath?: string;
	examplePayload?: Record<string, unknown>;
};

export const OPENQUOK_COMMAND_WORKFLOW_META: Record<string, OpenquokCommandWorkflowMeta> = {
	'integrations:list': {
		title: 'Discover connected channels',
		prompt:
			'List connected social channels and return the integration UUID for the platform you are publishing to.',
		docsPath: '/docs/apis-integrations/list?playground=open'
	},
	'integrations:settings': {
		title: 'Inspect channel settings',
		prompt:
			'Fetch posting rules, character limits, and the settings schema for the target integration before composing a post.',
		docsPath: '/docs/apis-integrations/integration-settings?playground=open'
	},
	upload: {
		title: 'Upload media',
		prompt:
			'Upload each local image or video with openquok upload before posts:create. Media paths from upload stdout are required for -m and JSON media arrays.'
	},
	'posts:create': {
		title: 'Schedule a post',
		prompt:
			'Create or schedule a post using the example JSON payload below. Upload media first when attachments are local files.',
		docsPath: '/docs/apis-posts/create?playground=open',
		examplePayload: defaultPostsCreatePayload()
	},
	'posts:list': {
		title: 'List scheduled posts',
		prompt: 'List draft and scheduled posts in the workspace date window to find post row ids.',
		docsPath: '/docs/apis-posts/list?playground=open'
	},
	'analytics:platform': {
		title: 'Measure channel performance',
		prompt:
			'Pull seven-day platform analytics for the integration UUID used when scheduling content. Use 30 or 90 days when comparing longer trends.',
		docsPath: '/docs/apis-analytics/platform?playground=open'
	},
	'analytics:post': {
		title: 'Measure post performance',
		prompt:
			'Fetch per-post analytics for a published post row. If release_id is missing, run posts:missing and posts:connect first.',
		docsPath: '/docs/apis-analytics/post?playground=open'
	},
	'posts:missing': {
		title: 'Resolve missing release id',
		prompt:
			'When per-post analytics are unavailable, list provider release candidates and connect the correct one before re-checking analytics.'
	},
	'posts:connect': {
		title: 'Connect post to provider content',
		prompt: 'Link a post row to its provider release id so per-post analytics can run.'
	},
	'plugs:catalog': {
		title: 'Browse global plug types',
		prompt:
			'List global plug definitions per provider. Use methodName values (e.g. autoPlugPost, autoRepostPost) with plugs:upsert.'
	},
	'plugs:list': {
		title: 'List channel plug rules',
		prompt: 'List saved global plug rules for an integration UUID before editing or pausing them.'
	},
	'plugs:upsert': {
		title: 'Create or update a global plug rule',
		prompt:
			'Set a channel-level likes-threshold rule. Use func from plugs:catalog and fields as a JSON array of { name, value } objects.',
		examplePayload: {
			func: 'autoPlugPost',
			fields: [
				{ name: 'likesAmount', value: '100' },
				{ name: 'post', value: 'Thanks for reading — link in bio!' }
			]
		}
	},
	'plugs:activate': {
		title: 'Enable or pause a plug rule',
		prompt: 'Toggle a saved global plug rule on or off without deleting its configuration.'
	},
	'plugs:delete': {
		title: 'Delete a plug rule',
		prompt: 'Remove a global plug rule from the channel.'
	}
};

export function resolveCommandWorkflowTitle(commandName: string, title?: string): string {
	const trimmed = title?.trim();
	if (trimmed) return trimmed;
	return OPENQUOK_COMMAND_WORKFLOW_META[commandName]?.title ?? commandName;
}

export function buildCommandWorkflowStepFromLibraryItem(item: {
	name: string;
	kind: 'cli' | 'mcp';
	listingSlug: string;
	description: string;
	commandTemplate?: string;
	examplePrompt?: string;
	examplePayload?: Record<string, unknown>;
}): {
	title: string;
	prompt: string;
	commandTemplate?: string;
	examplePayload?: Record<string, unknown>;
} {
	if (item.kind === 'mcp') {
		return {
			title: item.name.replace(/_/g, ' '),
			prompt: item.examplePrompt ?? item.description,
			examplePayload: item.examplePayload
		};
	}

	const meta = OPENQUOK_COMMAND_WORKFLOW_META[item.name];
	return {
		title: meta?.title ?? item.name,
		prompt: item.examplePrompt ?? meta?.prompt ?? item.description,
		commandTemplate: resolveOpenquokCommandTemplate(item.name, item.commandTemplate),
		examplePayload: item.examplePayload ?? meta?.examplePayload
	};
}
