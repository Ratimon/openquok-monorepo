export type OpenquokCliCommandReferenceItem = {
	command: string;
	description: string;
};

/** Curated for public agent landing pages — mirrors `agent/skills/openquok-core/resources/command-reference.md`. */
export const OPENQUOK_CLI_COMMAND_REFERENCE: readonly OpenquokCliCommandReferenceItem[] = [
	{
		command: 'openquok auth:login --json',
		description: 'Start device OAuth for agents; user opens verification_uri_complete from stdout'
	},
	{
		command: 'openquok auth:status',
		description: 'Check whether CLI credentials are connected'
	},
	{
		command: 'openquok integrations:list',
		description: 'List connected social media accounts (integration UUIDs for other commands)'
	},
	{
		command: 'openquok integrations:settings <integration-id>',
		description: 'Get channel rules, max length, settings schema, and allow-listed tools'
	},
	{
		command: "openquok integrations:trigger <integration-id> <method> -d '<json>'",
		description: 'Invoke an allow-listed provider tool from integrations:settings'
	},
	{
		command: 'openquok upload <file>',
		description: 'Upload local media; returns id and path for posts:create -m'
	},
	{
		command: 'openquok posts:create -c "…" -s "…" -i "<integration-id>"',
		description: 'Create a draft or scheduled post (add -t draft and --note for human review)'
	},
	{
		command: 'openquok posts:list',
		description: 'List drafts and scheduled posts in the default ±30-day window'
	},
	{
		command: 'openquok posts:status <post-id> -s draft',
		description: 'Flip a post between draft and scheduled without changing publish time'
	},
	{
		command: 'openquok posts:review-todo <post-id> --note "…"',
		description: 'Update the human review checklist on an agent draft'
	},
	{
		command: 'openquok posts:delete <post-id>',
		description: 'Delete a post row (and its post group)'
	},
	{
		command: 'openquok posts:missing <post-id>',
		description: 'List provider candidates when release_id is missing'
	},
	{
		command: 'openquok posts:connect <post-id> -r "<release-id>"',
		description: 'Link a missing post to its provider release id for analytics'
	},
	{
		command: 'openquok analytics:platform <integration-id> -d 30',
		description: 'Channel metrics for the last 7, 30, or 90 days (-d)'
	},
	{
		command: 'openquok analytics:post <post-id> -d 7',
		description: 'Per-post metrics for a published post (empty for drafts)'
	}
] as const;
