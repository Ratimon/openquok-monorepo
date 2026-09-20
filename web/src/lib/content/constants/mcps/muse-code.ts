import { icons } from '$data/icons';

import type { McpLandingSeed } from '$lib/content/constants/mcps/types';

export const muse_codeMcpSeed = {
	slug: 'muse-code',
	label: 'Muse Code',
	mcpClient: 'Muse Code',
	icon: icons.MuseCode.name,
	hubDescription: 'Meta terminal agent — ~/.config/muse/settings.json streamable_http MCP',
	heroDescription:
		'Muse Code is Meta\'s terminal coding agent — plan, edit, and run commands from your shell with approvals and sandboxing. Connect OpenQuok over MCP so Muse Code drafts and schedules social posts while you review and approve on the calendar or kanban.',
	metaDescription:
		'Connect OpenQuok MCP to Muse Code — draft and schedule social posts from Meta\'s terminal coding agent. Approve every publish on the calendar or kanban.',
	workflowPhrase: 'your terminal',
	setupSteps: [
		'Install Muse Code from the official Meta developer docs and authenticate with muse in your project directory.',
		'Generate a programmatic token under Developers → Access.',
		'Add the openquok entry to ~/.config/muse/settings.json with schema_version 1 and streamable_http transport.',
		'Restart Muse Code or start a fresh session, then ask: List my connected social media accounts.'
	]
} satisfies McpLandingSeed;
