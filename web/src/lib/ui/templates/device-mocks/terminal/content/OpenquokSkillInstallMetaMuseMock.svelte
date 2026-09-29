<script lang="ts">
	import {
		OPENQUOK_CORE_SKILL_INSTALL_META_MUSE_CLI,
		OPENQUOK_CORE_SKILL_INSTALL_META_MUSE_CURL,
		OPENQUOK_META_MUSE_CUSTOM_CONNECTOR_PROMPT
	} from '$lib/content/constants/agents/cli-command-reference';

	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Option A — custom connector (paste as a Muse chat prompt)
${OPENQUOK_META_MUSE_CUSTOM_CONNECTOR_PROMPT}

# Option B — CLI inside Meta Muse Secure VM
${OPENQUOK_CORE_SKILL_INSTALL_META_MUSE_CLI}

# Option C — fetch openquok-core SKILL.md in the VM
${OPENQUOK_CORE_SKILL_INSTALL_META_MUSE_CURL}

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token — generate from Developers → Access
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Connect OpenQuok to Meta Muse via custom connector, CLI, or SKILL.md in the Secure VM"
/>
