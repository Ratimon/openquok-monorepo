<script lang="ts">
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	const installCommands = `# Install openquok-core skill (project scope)
npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-core -y

# Install global CLI
npm install -g @openquok/auto-cli@latest
openquok --version

# Authenticate once (programmatic token for headless hosts)
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status`;
</script>

<TerminalCommandMock
	code={installCommands}
	ariaLabel="Install openquok-core skill and authenticate the OpenQuok CLI"
/>
