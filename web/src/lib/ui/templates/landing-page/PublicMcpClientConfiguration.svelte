<script lang="ts">
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import {
		getMcpClientConfig,
		MCP_CLIENT_DOCS_SLUG,
		MCP_TOKEN_PLACEHOLDER,
		resolveMcpBaseUrl,
		type McpAuthMethod,
		type McpClient
	} from '$lib/developers/utils/getMcpClientConfig';
	import { route, url } from '$lib/utils/path';
	
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	type Props = {
		sectionTitle: string;
		sectionDescription: string;
		headingId: string;
		activeClient: McpClient;
	};

	let { sectionTitle, sectionDescription, headingId, activeClient }: Props = $props();

	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);

	const authPillClass = (active: boolean) =>
		`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
			active
				? 'bg-primary text-primary-content'
				: 'text-base-content/70 hover:bg-base-300/50'
		}`;

	let authMethod = $state<McpAuthMethod>('header');

	const mcpBase = resolveMcpBaseUrl();
	const { config, hint } = $derived(
		getMcpClientConfig(activeClient, authMethod, mcpBase, MCP_TOKEN_PLACEHOLDER)
	);
	const activeClientDocsHref = $derived(
		url(`${publicDocsPath}/mcp-setup-guides/${MCP_CLIENT_DOCS_SLUG[activeClient]}`)
	);
</script>

<section class="space-y-4" aria-labelledby={headingId}>
	<div class="space-y-2 text-center">
		<h3
			id={headingId}
			class="text-sm font-semibold tracking-tight text-base-content/75 sm:text-base"
		>
			{sectionTitle}
		</h3>
		<p class="text-sm leading-relaxed text-pretty text-base-content/65 sm:text-base">
			{sectionDescription}
		</p>
	</div>

	<div class="space-y-4 rounded-2xl border border-base-content/10 bg-base-200/40 p-5 sm:p-6">
		<div>
			<p class="text-sm font-medium text-base-content/80">Authentication</p>
			<div class="mt-2 inline-flex flex-wrap gap-2 rounded-full bg-base-100/80 p-1">
				<button
					type="button"
					class={authPillClass(authMethod === 'header')}
					onclick={() => (authMethod = 'header')}
				>
					Authorization header
				</button>
				<button
					type="button"
					class={authPillClass(authMethod === 'path')}
					onclick={() => (authMethod = 'path')}
				>
					API key in URL
				</button>
			</div>
		</div>

		<div class="space-y-2">
			<p class="text-xs font-medium text-base-content/60">
				{activeClient} — {hint}
			</p>
			<TerminalCommandMock
				code={config}
				ariaLabel="Copy OpenQuok MCP configuration to clipboard"
				class="[&>div]:text-sm sm:[&>div]:text-base"
			/>
		</div>

	</div>
</section>
