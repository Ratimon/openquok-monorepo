/** Paste-ready MCP catalog fields for the openquok-core building block (secret-admin listing manager). */
export const OPENQUOK_CORE_LISTING_SLUG = 'openquok-core';

export type McpListingToolRow = {
	name: string;
	description: string;
};

export const OPENQUOK_CORE_MCP_LISTING_DESCRIPTION =
	'Connect OpenQuok over HTTP MCP to list channels, schedule and manage posts, configure plugs, read analytics, and manage directory launch profiles and directory SEO from Cursor, Claude Code, Codex, and other MCP clients — authenticate with an opo_ programmatic token.';

export const OPENQUOK_CORE_MCP_LISTING_CONTENT = `## Overview

OpenQuok exposes a hosted MCP server at \`https://api.openquok.com/mcp\` so native clients can list channels, schedule and manage posts, configure plugs, and read analytics without the CLI skill.

Authenticate with a programmatic token (\`opo_\`) from **Settings → Developers → Access**.

## Connect in three steps

1. **Generate a token** — create an \`opo_…\` token in the dashboard (shown once).
2. **Add the server** — \`https://api.openquok.com/mcp\` with \`Authorization: Bearer opo_…\`, or put the token in the URL path when your client cannot set headers.
3. **Verify** — ask your agent to list connected social accounts; it should call \`integrationList\`.

## Typical chat flows

- **Schedule** — \`integrationList\` then \`schedulePostTool\` (\`draft\` / \`schedule\` / \`now\`). Extra \`postsAndComments\` strings are same-account reply chains. Cross-account comment/repost belongs in \`settings\` (\`threads.crossAccountPlugs\`, \`x.crossAccountPlugs\`, LinkedIn plugs) on the publishing channel.
- **Media** — \`uploadFromUrl\` (public HTTPS URL) then pass \`{id, path}\` into schedule settings, or pass URLs on \`schedulePostTool.attachments\`.
- **Manage** — \`postsList\`, \`postsStatus\`, \`postsReschedule\`, \`postsDelete\`, \`postsReviewTodo\`; missing \`release_id\`: \`postsMissing\` then \`postsConnect\`.
- **Analytics** — \`analyticsPlatform\` / \`analyticsPost\` with \`days\` 7, 30, or 90.
- **Directory launch** — My Products profiles, not social channels: \`directoryProfilesList\` (\`mainOnly\`) → \`directoryVariantsEnsure\` (\`directorySiteKey\` \`peerpush\` / \`uneed\`) → \`directoryProfilesUpdate\` to fill copy → \`directoryListingSummary\` before extension autofill (plan: directory launch enabled).
- **Directory SEO** — \`directorySeoOverview\`, \`directorySeoHistory\`, \`directorySeoRefresh\` (cached metrics: \`checkedAt\`, \`manualRefreshAvailableAt\`).
- **Global plugs** — \`plugsCatalog\`, \`plugsList\`, \`plugsUpsert\`, \`plugsActivate\`, \`plugsDelete\` (like-threshold rules). Local file upload and CLI device login stay on the openquok-core skill.

Client-specific wiring: [MCP setup guides](https://www.openquok.com/docs/mcp-setup-guides).`;

export const OPENQUOK_CORE_MCP_LISTING_TOOLS: readonly McpListingToolRow[] = [
	{
		name: 'groupList',
		description:
			'List business profiles (customers) for the authenticated workspace. Use a profile id with integrationList to filter channels.'
	},
	{
		name: 'integrationList',
		description:
			'List connected social media channels for the authenticated workspace. Optionally filter by business profile id from groupList.'
	},
	{
		name: 'integrationSchema',
		description:
			'Return posting rules, character limits, compose settings schema, and allow-listed tools for a platform (provider identifier, e.g. threads, facebook).'
	},
	{
		name: 'triggerTool',
		description:
			'Invoke an allow-listed provider method on a connected channel (same as POST /public/integration-trigger/:id).'
	},
	{
		name: 'schedulePostTool',
		description:
			'Create or schedule social posts across connected channels (draft, schedule, publish-now). Per-channel settings support follow-ups, internalEngagementPlug, and crossAccountPlugs (comment/repost from another connected account).'
	},
	{
		name: 'uploadFromUrl',
		description:
			'Fetch a public HTTPS image or video URL into workspace media and return id and path for schedulePostTool.'
	},
	{
		name: 'postsList',
		description:
			'List posts in a date window for the workspace (optional integration ids or business profile). Default window matches the public list API.'
	},
	{
		name: 'postsFindSlot',
		description: 'Suggest a free schedule slot for the workspace or a specific connected channel.'
	},
	{
		name: 'postsStatus',
		description: 'Flip a post row between draft and scheduled at the stored publish time.'
	},
	{
		name: 'postsReschedule',
		description:
			'Move a post group to a new publish time. action update preserves state; schedule re-queues and clears publish results.'
	},
	{
		name: 'postsReviewTodo',
		description: 'Set or update the review-todo note on a post row.'
	},
	{
		name: 'postsDelete',
		description: 'Delete a post row by id.'
	},
	{
		name: 'postsMissing',
		description:
			'List provider candidates when a published post is missing release_id (needed before per-post analytics).'
	},
	{
		name: 'postsConnect',
		description: 'Link a post row to a provider release_id for per-post analytics.'
	},
	{
		name: 'analyticsPlatform',
		description: 'Platform-level metrics for a connected channel. days must be 7, 30, or 90.'
	},
	{
		name: 'analyticsPost',
		description:
			'Per-post metrics for a published post row. days must be 7, 30, or 90. Empty for drafts.'
	},
	{
		name: 'plugsCatalog',
		description:
			'List global plug types and field names per provider (like-threshold auto-reply/repost rules).'
	},
	{
		name: 'plugsList',
		description: 'List saved global plug rules on a connected channel.'
	},
	{
		name: 'plugsUpsert',
		description: 'Create or update a global plug rule on a connected channel (func + fields).'
	},
	{
		name: 'plugsActivate',
		description: 'Enable or disable a saved global plug rule.'
	},
	{
		name: 'plugsDelete',
		description: 'Delete a saved global plug rule.'
	},
	{
		name: 'directoryDestinationsList',
		description:
			'Published directory destinations (site keys e.g. peerpush, uneed); read-only, does not submit.'
	},
	{
		name: 'directoryProfilesList',
		description:
			'List business profiles for directory launch; use mainOnly before directoryVariantsEnsure.'
	},
	{
		name: 'directoryProfilesGet',
		description:
			'Load one profile: profileData, variant site key, similarityToMainPercent.'
	},
	{
		name: 'directoryProfilesCreate',
		description: 'Create a main business profile; use directoryVariantsEnsure for per-site copies.'
	},
	{
		name: 'directoryProfilesUpdate',
		description:
			'Patch main or variant copy (tagline, description, profileData); not social posting.'
	},
	{
		name: 'directoryVariantsEnsure',
		description:
			'Idempotent PeerPush/Uneed-style variant from a main profile (directorySiteKey).'
	},
	{
		name: 'directoryListingSummary',
		description:
			'Read-only readiness and missing fields per destination before extension launch.'
	},
	{
		name: 'directorySubmissionsList',
		description: 'Read-only submission history (listing URLs, filters optional).'
	},
	{
		name: 'directorySeoOverview',
		description:
			'Cached DR overview for a main profile; read checkedAt before directorySeoRefresh.'
	},
	{
		name: 'directorySeoHistory',
		description: 'Historical DR points for product domain and competitors (days 1–366).'
	},
	{
		name: 'directorySeoRefresh',
		description: 'Manual DR refresh when manualRefreshAvailableAt allows (optional force).'
	},
	{
		name: 'directorySeoCompetitorsAdd',
		description: 'Track a competitor domain for directory SEO (workspace quota).'
	},
	{
		name: 'directorySeoCompetitorsRemove',
		description: 'Remove a tracked competitor domain.'
	},
	{
		name: 'directorySeoCompetitorsUpdate',
		description: 'Update the display label for a tracked competitor domain.'
	}
];
