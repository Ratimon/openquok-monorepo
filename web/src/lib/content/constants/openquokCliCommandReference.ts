export type OpenquokCliCommandReferenceItem = {
	command: string;
	description: string;
};

/** Essential openquok commands for public agent landing pages (full list in agent skill docs). */
export const OPENQUOK_CLI_COMMAND_REFERENCE: readonly OpenquokCliCommandReferenceItem[] = [
	{
		command: 'openquok auth:login --json',
		description: 'Start device OAuth for agents; user opens verification_uri_complete from stdout'
	},
	{
		command: 'openquok integrations:list',
		description: 'List connected social media accounts'
	},
	{
		command: 'openquok integrations:settings <integration-id>',
		description: 'Get platform-specific settings schema and posting rules'
	},
	{
		command: 'openquok upload <file>',
		description: 'Upload media and get a reusable id and path'
	},
	{
		command: 'openquok posts:create -c "…" -s "…" -i "<integration-id>"',
		description: 'Create and schedule a new post'
	},
	{
		command: 'openquok posts:list',
		description: 'List scheduled and draft posts'
	},
	{
		command: 'openquok posts:status <post-id> -s draft',
		description: 'Move a post between draft and scheduled before publish'
	},
	{
		command: 'openquok analytics:platform <integration-id> -d 30',
		description: 'Get analytics for an integration or channel'
	},
	{
		command: 'openquok analytics:post <post-id> -d 7',
		description: 'Get analytics for a specific published post'
	}
] as const;
