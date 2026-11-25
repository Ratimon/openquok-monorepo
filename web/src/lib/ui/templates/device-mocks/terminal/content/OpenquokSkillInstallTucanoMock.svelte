<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_TUCANO_ASK,
		OPENQUOK_CORE_SKILL_INSTALL_TUCANO_CURL
	} from '$lib/content/constants/agents/cli-command-reference';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Option A — install the global CLI where the agent runs commands
${OPENQUOK_CORE_SKILL_INSTALL_TUCANO_ASK}

# Option B — curl SKILL.md into a folder the agent can read
${OPENQUOK_CORE_SKILL_INSTALL_TUCANO_CURL}

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access (headless / CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core for Tucano and authenticate with OAuth2 or a programmatic token"
/>