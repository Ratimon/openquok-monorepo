import {
	OPENQUOK_CLI_GETTING_STARTED_URL,
	OPENQUOK_CLI_NPM_URL,
	OPENQUOK_CORE_EXTENSION_SLUG,
	OPENQUOK_CORE_SKILL_SETUP_URL
} from '$lib/skill-builder/constants/defaults';

export const REVENUECAT_MCP_EXTENSION_SLUG = 'revenuecat-mcp' as const;

export const REVENUECAT_MCP_SETUP_URL = 'https://www.revenuecat.com/docs/tools/mcp/setup';

const PREREQUISITES_INTRO =
	'This skill does NOT bundle any dependencies. Your AI agent will need to research and install the following based on your setup. Tell your agent what you\'re working with and it will figure out the rest.';

export function buildSkillPrerequisitesMarkdown(extensionSlugs: string[]): string {
	const lines: string[] = [PREREQUISITES_INTRO, '', '### Required'];

	if (extensionSlugs.includes(OPENQUOK_CORE_EXTENSION_SLUG)) {
		lines.push(
			'',
			`- **OpenQuok CLI** (\`npm install -g @openquok/auto-cli\`) — the global \`openquok\` binary must be on PATH. Installing this skill does not add the CLI. Your agent should verify \`openquok --version\` and install or upgrade from the [official package page](${OPENQUOK_CLI_NPM_URL}) if missing or stale.`,
			`- **openquok-core skill** — OpenQuok is the backbone for publishing and analytics in this workflow. It handles scheduling across your connected channels, workspace media uploads, draft review, and per-post and platform analytics. Without OpenQuok installed and authenticated, the agent cannot queue posts or track what is working in your workspace. Install the **openquok-core** skill in your agent workspace, then follow its authentication and workflow instructions (see [agent setup guides](${OPENQUOK_CORE_SKILL_SETUP_URL}) and [CLI getting started](${OPENQUOK_CLI_GETTING_STARTED_URL})).`
		);
	}

	if (extensionSlugs.includes(REVENUECAT_MCP_EXTENSION_SLUG)) {
		const heading =
			extensionSlugs.includes(OPENQUOK_CORE_EXTENSION_SLUG)
				? '### Conversion tracking (optional but recommended for mobile apps)'
				: '### Required';

		if (!extensionSlugs.includes(OPENQUOK_CORE_EXTENSION_SLUG)) {
			lines.length = 0;
			lines.push(PREREQUISITES_INTRO, '', heading);
		} else {
			lines.push('', heading);
		}

		lines.push(
			'',
			`- **RevenueCat MCP** — completes the intelligence loop when you pair social publishing with subscription data. OpenQuok analytics show which posts get reach; RevenueCat shows which posts drive **paying users**. Combined, the agent can distinguish a viral post that makes no money from a modest post that converts — and optimize accordingly. Connect the **revenuecat-mcp** extension in your agent client (OAuth on supported hosts, or a RevenueCat API v2 secret key). See [RevenueCat MCP setup](${REVENUECAT_MCP_SETUP_URL}).`
		);
	}

	if (lines.length <= 3) {
		return '';
	}

	return lines.join('\n');
}
