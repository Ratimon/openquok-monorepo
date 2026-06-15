<script lang="ts">
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Install openquok-core skill (project scope)
npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-core -y

# Install global CLI
npm install -g @openquok/auto-cli@latest
openquok --version

# Authenticate — pick one option:

# Option 1: OAuth2 device flow (opens browser — pick workspace)
openquok auth:login

# Option 2: Programmatic token - Generate from Dashboard (headless hosts, CI)
export OPENQUOK_API_KEY="opo_..."
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core skill and authenticate with OAuth2 or a programmatic token"
/>
