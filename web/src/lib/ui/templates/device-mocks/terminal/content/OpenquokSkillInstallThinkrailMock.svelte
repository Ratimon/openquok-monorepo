<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_THINKRAIL_GLOBAL,
		OPENQUOK_CORE_SKILL_INSTALL_THINKRAIL_WORKTREE
	} from '$lib/content/constants/openquokCliCommandReference';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Option A — global pi skill (all ThinkRail projects)
${OPENQUOK_CORE_SKILL_INSTALL_THINKRAIL_GLOBAL}

# Option B — skill scoped to the active git worktree
${OPENQUOK_CORE_SKILL_INSTALL_THINKRAIL_WORKTREE}

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access (headless / CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core skill for ThinkRail and authenticate with OAuth2 or a programmatic token"
/>
