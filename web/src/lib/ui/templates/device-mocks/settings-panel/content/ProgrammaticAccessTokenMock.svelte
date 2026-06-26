<script lang="ts">
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import { MCP_TOKEN_PLACEHOLDER } from '$lib/developers/utils/getMcpClientConfig';
	import { route, url } from '$lib/utils/path';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	const inlineTerminalCodeClass =
		'rounded bg-primary/15 px-1.5 py-0.5 font-mono text-xs text-primary';

	const rootPathPublicDocs = getRootPathPublicDocs();
	const publicDocsPath = route(rootPathPublicDocs);
	const publicApiDocsHref = url(`${publicDocsPath}/getting-started-for-public-api`);
</script>

<div class="pointer-events-none select-none rounded-xl border border-base-300 bg-base-200 p-6 text-base-content">
	<div class="flex items-start justify-between gap-4">
		<div>
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="text-base font-semibold">Programmatic access token</h3>
			</div>
			<p class="text-sm text-base-content/70">
				Use this token to call the Public API from CI pipelines and other automated scripts. Tokens start with
				<code class={inlineTerminalCodeClass}>opo_…</code>.
			</p>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="ghost" href={publicApiDocsHref} tabindex={-1}>Public API Docs</Button>
		</div>
	</div>

	<div class="mt-4 rounded-lg border border-base-300 bg-base-100 p-4 font-mono text-sm text-base-content/60">
		No token on screen — generate one below. Existing tokens stay hidden for security.
	</div>

	<div class="mt-4 flex flex-wrap items-center gap-2">
		<Button class="gap-2" variant="ghost" disabled tabindex={-1}>
			<AbstractIcon name={icons.Eye.name} class="h-4 w-4 shrink-0" width="16" height="16" />
			Reveal
		</Button>
		
		<Button class="gap-2" variant="primary" disabled tabindex={-1}>
			<AbstractIcon name={icons.Copy.name} class="h-4 w-4 shrink-0" width="16" height="16" />
			Copy token
		</Button>
		<Button class="gap-2" variant="warning" tabindex={-1}>
			<AbstractIcon name={icons.RefreshCw.name} class="h-4 w-4 shrink-0" width="16" height="16" />
			Generate token
		</Button>
	</div>

	<p class="sr-only">Example token placeholder: {MCP_TOKEN_PLACEHOLDER}</p>
</div>
