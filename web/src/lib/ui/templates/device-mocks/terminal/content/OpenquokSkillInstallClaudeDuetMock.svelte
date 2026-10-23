<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_CLAUDE_DUET_ASK,
		OPENQUOK_CORE_SKILL_INSTALL_CLAUDE_DUET_CURL
	} from '$lib/content/constants/agents/cli-command-reference';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Option A — ask Claude Duet to install the global CLI on its virtual machine
${OPENQUOK_CORE_SKILL_INSTALL_CLAUDE_DUET_ASK}

# Option B — curl SKILL.md, then add openquok-core to your Claude skills
${OPENQUOK_CORE_SKILL_INSTALL_CLAUDE_DUET_CURL}

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access (headless / CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core on Claude Duet virtual machine and authenticate with OAuth2 or a programmatic token"
/>
