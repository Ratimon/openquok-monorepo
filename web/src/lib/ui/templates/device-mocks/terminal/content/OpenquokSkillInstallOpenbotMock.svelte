<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_OPENBOT_ASK,
		OPENQUOK_CORE_SKILL_INSTALL_OPENBOT_CURL
	} from '$lib/content/constants/agents/cli-command-reference';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Option A — install the global CLI on your OpenBot computer
${OPENQUOK_CORE_SKILL_INSTALL_OPENBOT_ASK}

# Option B — curl SKILL.md, then register on the agent (Marketplace or create_skill)
${OPENQUOK_CORE_SKILL_INSTALL_OPENBOT_CURL}

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access (headless / CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core on an OpenBot agent computer and authenticate with OAuth2 or a programmatic token"
/>