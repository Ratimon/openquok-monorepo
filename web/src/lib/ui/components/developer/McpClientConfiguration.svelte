<script lang="ts">
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import {
		getMcpClientConfig,
		maskApiKeyInConfig,
		MCP_CLIENTS,
		MCP_TOKEN_PLACEHOLDER,
		resolveMcpBaseUrl,
		type McpAuthMethod,
		type McpClient
	} from '$lib/developers/utils/getMcpClientConfig';
	import { route, url } from '$lib/utils/path';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		programmaticAccessToken: string | null;
		programmaticAccessConfigured: boolean;
		oauthAppReady: boolean;
		oauthAppLoading: boolean;
		canRotate: boolean;
		rotating: boolean;
		onCopy: (text: string) => void | Promise<void>;
		onRotateToken: () => void | Promise<void>;
		onGoToAppsTab: () => void;
	};

	let {
		programmaticAccessToken,
		programmaticAccessConfigured,
		oauthAppReady,
		oauthAppLoading,
		canRotate,
		rotating,
		onCopy,
		onRotateToken,
		onGoToAppsTab
	}: Props = $props();

	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);
	const mcpDocsHref = url(`${publicDocsPath}/getting-started-for-mcp`);

	const mcpBase = resolveMcpBaseUrl();
	const apiKey = $derived(programmaticAccessToken ?? MCP_TOKEN_PLACEHOLDER);
	const usingPlaceholder = $derived(!programmaticAccessToken);
	const controlsDisabled = $derived(!oauthAppReady || oauthAppLoading);
	const canGenerateToken = $derived(canRotate && oauthAppReady && !oauthAppLoading);
	const copyDisabled = $derived(controlsDisabled || usingPlaceholder);
	const generateButtonLabel = $derived(
		rotating ? 'Working…' : programmaticAccessConfigured ? 'Rotate token' : 'Generate token'
	);

	let authMethod = $state<McpAuthMethod>('header');
	let activeClient = $state<McpClient>('Claude Code');
	let configRevealed = $state(false);

	const { config, hint } = $derived(getMcpClientConfig(activeClient, authMethod, mcpBase, apiKey));
	const displayConfig = $derived(
		configRevealed ? config : maskApiKeyInConfig(config, apiKey)
	);
</script>

<div class="rounded-xl border border-base-300 bg-base-200 p-6">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h3 class="text-base font-semibold">MCP client configuration</h3>
			<p class="text-sm text-base-content/70">
				Connect Cursor, Claude Code, Codex, and other MCP clients to OpenQuok over HTTP streaming to
				schedule posts from your agent.
			</p>
		</div>
		<Button variant="ghost" href={mcpDocsHref} target="_blank">Docs</Button>
	</div>

	{#if !oauthAppLoading && !oauthAppReady}
		<div class="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-base-content">
			<p class="font-medium">Create an OAuth application first</p>
			<p class="mt-1 text-base-content/70">
				MCP clients authenticate with your programmatic access token. Register a workspace OAuth app on
				the Apps tab, then generate a token above to copy a ready-to-run command.
			</p>
			<Button class="mt-3" variant="primary" onclick={() => onGoToAppsTab()}>
				Go to Oauth Apps
			</Button>
		</div>
	{:else if usingPlaceholder}
		<p class="mt-4 text-sm text-base-content/70">
			Generate a programmatic access token to copy a ready-to-run MCP command.
		</p>
	{/if}

	<div class={`mt-4 space-y-4 ${controlsDisabled ? 'pointer-events-none opacity-60' : ''}`}>
		<div>
			<p class="text-sm font-medium text-base-content/80">Authentication</p>
			<div class="mt-2 inline-flex flex-wrap gap-2 rounded-full bg-base-100 p-1">
				<button
					type="button"
					class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
						authMethod === 'header'
							? 'bg-primary text-primary-content'
							: 'text-base-content/70 hover:bg-base-300/50'
					}`}
					disabled={controlsDisabled}
					onclick={() => (authMethod = 'header')}
				>
					Authorization header
				</button>
				<button
					type="button"
					class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
						authMethod === 'path'
							? 'bg-primary text-primary-content'
							: 'text-base-content/70 hover:bg-base-300/50'
					}`}
					disabled={controlsDisabled}
					onclick={() => (authMethod = 'path')}
				>
					API key in URL
				</button>
			</div>
		</div>

		<div>
			<p class="text-sm font-medium text-base-content/80">Client</p>
			<div class="mt-2 flex flex-wrap gap-2">
				{#each MCP_CLIENTS as client (client)}
					<button
						type="button"
						class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
							activeClient === client
								? 'bg-primary text-primary-content'
								: 'border border-base-300 bg-base-100 text-base-content/70 hover:bg-base-300/50'
						}`}
						disabled={controlsDisabled}
						onclick={() => (activeClient = client)}
					>
						{client}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<p class="text-xs font-medium text-base-content/60">{hint}</p>
			<pre
				class="mt-2 max-h-80 overflow-auto rounded-lg border border-base-300 bg-base-100 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all text-base-content"
			>{displayConfig}</pre>
		</div>

		<div class="flex flex-wrap gap-2">
			{#if usingPlaceholder && oauthAppReady}
				<Button
					class="gap-2"
					variant="warning"
					disabled={!canGenerateToken || rotating}
					onclick={() => onRotateToken()}
				>
					{#if rotating}
						<AbstractIcon
							name={icons.LoaderCircle.name}
							class="h-4 w-4 shrink-0 animate-spin"
							width="16"
							height="16"
						/>
					{:else}
						<AbstractIcon name={icons.RefreshCw.name} class="h-4 w-4 shrink-0" width="16" height="16" />
					{/if}
					{generateButtonLabel}
				</Button>
			{:else}
				<Button
					class="gap-2"
					variant="ghost"
					disabled={controlsDisabled}
					onclick={() => (configRevealed = !configRevealed)}
				>
					<AbstractIcon
						name={configRevealed ? icons.Lock.name : icons.Eye.name}
						class="h-4 w-4 shrink-0"
						width="16"
						height="16"
					/>
					{configRevealed ? 'Hide' : 'Reveal'}
				</Button>
				<Button
					class="gap-2"
					variant="primary"
					disabled={copyDisabled}
					onclick={() => onCopy(config)}
				>
					<AbstractIcon name={icons.Copy.name} class="h-4 w-4 shrink-0" width="16" height="16" />
					Copy
				</Button>
			{/if}
		</div>
	</div>
</div>
