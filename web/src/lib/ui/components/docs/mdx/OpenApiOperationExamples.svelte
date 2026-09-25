<script lang="ts">
	import type { HttpClientSample } from '$lib/docs/utils/openapi/httpClientSamples';

	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { getContext } from 'svelte';

	import { DOCS_PLAYGROUND, type DocsPlaygroundContext } from '$lib/docs/docs-playground-context';


	import {
		fetchOpenapiOperationForDocs,
		resolveOpenapiSpecUrl
	} from '$lib/docs/utils/openapi/openapiExamples';

	import ApiEndpointTryItBar from '$lib/ui/components/docs/mdx/ApiEndpointTryItBar.svelte';
	import RequestExample from '$lib/ui/components/docs/mdx/RequestExample.svelte';
	import ResponseExample from '$lib/ui/components/docs/mdx/ResponseExample.svelte';

	let {
		operation,
		specUrl = '/api/v1/openapi.json'
	}: {
		operation: string;
		specUrl?: string;
	} = $props();

	const playgroundCtx = getContext<DocsPlaygroundContext | undefined>(DOCS_PLAYGROUND);

	let resolvedSpecUrl = $derived(resolveOpenapiSpecUrl(page.url.origin, specUrl));

	let loading = $state(true);
	let errorText = $state<string | null>(null);
	let curl = $state('');
	let clientSamples = $state<HttpClientSample[]>([]);
	let jsonPretty = $state('');
	let reqTitle = $state('Request');
	let status = $state('200');
	let httpMethod = $state('');
	let apiPath = $state('');
	let serverDisplay = $state('');

	function openPlayground() {
		playgroundCtx?.open();
	}

	$effect(() => {
		if (!browser) return;

		let cancelled = false;
		loading = true;
		errorText = null;

		void (async () => {
			const result = await fetchOpenapiOperationForDocs(operation, resolvedSpecUrl, page.url.origin);
			if (cancelled) return;

			if (!result.ok) {
				errorText = result.error;
				curl = '';
				clientSamples = [];
				jsonPretty = '';
				httpMethod = '';
				apiPath = '';
				serverDisplay = '';
			} else {
				errorText = null;
				const p = result.payload;
				reqTitle = p.reqTitle;
				curl = p.curl;
				clientSamples = p.clientSamples;
				jsonPretty = p.jsonPretty;
				status = p.status;
				httpMethod = p.httpMethod;
				apiPath = p.apiPath;
				serverDisplay = p.serverDisplay;
			}
			loading = false;
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="doc-openapi-examples space-y-4">
	{#if loading}
		<div
			class="border-base-300/70 bg-base-200/30 text-base-content/65 rounded-xl border border-dashed px-4 py-8 text-center text-sm"
			role="status"
		>
			Loading examples from OpenAPI…
		</div>
	{:else if errorText}
		<div class="border-error/40 bg-error/10 text-error rounded-xl border px-4 py-3 text-sm" role="alert">
			<strong class="font-semibold">Could not load OpenAPI.</strong>
			<span class="opacity-90">{errorText}</span>
			<span class="text-base-content/70 mt-1 block text-xs">
				Ensure the backend is running and <code class="text-xs">GET {resolvedSpecUrl}</code> succeeds.
			</span>
		</div>
	{:else}
		<ApiEndpointTryItBar
			method={httpMethod}
			serverDisplay={serverDisplay}
			pathPattern={apiPath}
			onTryIt={openPlayground}
		/>
		<RequestExample title={reqTitle} code={curl} samples={clientSamples} dropdown={true} />
		<ResponseExample {status} code={jsonPretty} />
	{/if}
</div>
