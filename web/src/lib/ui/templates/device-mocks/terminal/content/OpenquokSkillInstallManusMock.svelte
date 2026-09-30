<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_MANUS_CLI,
		OPENQUOK_CORE_SKILL_INSTALL_MANUS_CURL,
		OPENQUOK_CORE_SKILL_INSTALL_MANUS_GITHUB
	} from '$lib/content/constants/agents/cli-command-reference';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Option A — Skills → + Add → Import from GitHub
${OPENQUOK_CORE_SKILL_INSTALL_MANUS_GITHUB}

# Option B — download SKILL.md, then Skills → Upload a skill
${OPENQUOK_CORE_SKILL_INSTALL_MANUS_CURL}

# Option C — Cloud Computer or Studio terminal
${OPENQUOK_CORE_SKILL_INSTALL_MANUS_CLI}

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access (headless / CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core skill in Manus and authenticate with OAuth2 or a programmatic token"
/>
