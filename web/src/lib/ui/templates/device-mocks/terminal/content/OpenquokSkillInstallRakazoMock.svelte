<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_RAKAZO_ASK,
		OPENQUOK_CORE_SKILL_INSTALL_RAKAZO_CURL
	} from '$lib/content/constants/agents/cli-command-reference';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Option A — install the global CLI on the bot sandbox
${OPENQUOK_CORE_SKILL_INSTALL_RAKAZO_ASK}

# Option B — curl SKILL.md, then register as a bot skill
${OPENQUOK_CORE_SKILL_INSTALL_RAKAZO_CURL}

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access (headless / CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core skill on a Rakazo bot sandbox and authenticate with OAuth2 or a programmatic token"
/>
