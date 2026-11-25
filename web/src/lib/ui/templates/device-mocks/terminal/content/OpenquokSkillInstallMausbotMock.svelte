<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_MAUSBOT_ASK,
		OPENQUOK_CORE_SKILL_INSTALL_MAUSBOT_CURL
	} from '$lib/content/constants/agents/cli-command-reference';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Option A — install the global CLI where the bot runs commands
${OPENQUOK_CORE_SKILL_INSTALL_MAUSBOT_ASK}

# Option B — curl SKILL.md into the bot working folder
${OPENQUOK_CORE_SKILL_INSTALL_MAUSBOT_CURL}

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access (headless / CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core for a MausBot working folder and authenticate with OAuth2 or a programmatic token"
/>