export type OpenquokCliCommandReferenceItem = {
	command: string;
	description: string;
};

export type SkillInstallOption = {
	id: string;
	label: string;
	command: string;
};

const OPENQUOK_CORE_SKILL_GITHUB_TREE_URL =
	'https://github.com/Ratimon/openquok-monorepo/tree/main/agent';

const OPENQUOK_CORE_SKILL_RAW_URL =
	'https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md';

/** ClawHub slug after `clawhub skill publish` (matches SKILL.md frontmatter `name`). */
export const OPENQUOK_CORE_SKILL_CLAWHUB_SLUG = 'openquok-core';

/** OpenClaw: npx skills add on the agent package root (headless -y). */
export const OPENQUOK_CORE_SKILL_INSTALL_NPX = `npx skills add ${OPENQUOK_CORE_SKILL_GITHUB_TREE_URL} --skill openquok-core -y`;

/** OpenClaw: install from ClawHub registry (run from workspace directory). */
export const OPENQUOK_CORE_SKILL_INSTALL_CLAWHUB = `clawhub install ${OPENQUOK_CORE_SKILL_CLAWHUB_SLUG}`;

/** Hermes: install single-file SKILL.md via hermes skills install (name from frontmatter). */
export const OPENQUOK_CORE_SKILL_INSTALL_HERMES_CLI = `hermes skills install ${OPENQUOK_CORE_SKILL_RAW_URL}`;

/** Hermes: manual copy when hermes CLI is unavailable. */
export const OPENQUOK_CORE_SKILL_INSTALL_HERMES_CURL = `mkdir -p ~/.hermes/skills/openquok-core
curl -fsSL "${OPENQUOK_CORE_SKILL_RAW_URL}" \\
  -o ~/.hermes/skills/openquok-core/SKILL.md`;

export const OPENCLAW_SKILL_INSTALL_OPTIONS: readonly SkillInstallOption[] = [
	{ id: 'npx', label: 'npx', command: OPENQUOK_CORE_SKILL_INSTALL_NPX },
	{ id: 'clawhub', label: 'ClawHub', command: OPENQUOK_CORE_SKILL_INSTALL_CLAWHUB }
];

export const HERMES_SKILL_INSTALL_OPTIONS: readonly SkillInstallOption[] = [
	{ id: 'hermes-cli', label: 'hermes CLI', command: OPENQUOK_CORE_SKILL_INSTALL_HERMES_CLI },
	{ id: 'curl', label: 'curl', command: OPENQUOK_CORE_SKILL_INSTALL_HERMES_CURL }
];

/** MCP-capable clients (Codex, Cursor, etc.): install openquok-core via npx skills add. */
export const MCP_SKILL_INSTALL_OPTIONS: readonly SkillInstallOption[] = [
	{ id: 'npx', label: 'npx', command: OPENQUOK_CORE_SKILL_INSTALL_NPX }
];

export const OPENQUOK_CORE_SKILL_AUTH_SNIPPET = `# Install global CLI
npm install -g @openquok/auto-cli@latest
openquok --version

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access (headless / CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;

/** Essential openquok commands for public agent landing pages (full list in agent skill docs). */
export const OPENQUOK_CLI_COMMAND_REFERENCE: readonly OpenquokCliCommandReferenceItem[] = [
	{
		command: 'openquok auth:login --json',
		description: 'Start device OAuth for agents; user then opens verification url in browser'
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
