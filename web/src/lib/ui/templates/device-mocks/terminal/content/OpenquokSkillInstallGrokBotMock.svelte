<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_GROK_BOT_ASK,
		OPENQUOK_CORE_SKILL_INSTALL_GROK_BOT_CURL
	} from '$lib/content/constants/openquokCliCommandReference';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Option A — ask the Bot to install the global CLI on its cloud computer
${OPENQUOK_CORE_SKILL_INSTALL_GROK_BOT_ASK}

# Option B — curl SKILL.md, then save as skill "openquok-core" in Settings → Plugins
${OPENQUOK_CORE_SKILL_INSTALL_GROK_BOT_CURL}

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access (headless / CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core skill on Grok Bot cloud computer and authenticate with OAuth2 or a programmatic token"
/>
