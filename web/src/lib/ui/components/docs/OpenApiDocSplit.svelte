<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { OpenapiDocsParamPayload, OpenapiDocsBodyPayload, OpenapiDocsResponsePayload } from '$lib/docs/utils/openapi-examples';

	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { getContext } from 'svelte';

	import { DOCS_PLAYGROUND, type DocsPlaygroundContext } from '$lib/docs/docs-playground-context';
	import { fetchOpenapiOperationForDocs} from '$lib/docs/utils/openapi-examples';

	import ApiEndpointTryItBar from '$lib/ui/components/docs/mdx/ApiEndpointTryItBar.svelte';
	import ParamField from '$lib/ui/components/docs/mdx/ParamField.svelte';
	import ResponseField from '$lib/ui/components/docs/mdx/ResponseField.svelte';
	import RequestExample from '$lib/ui/components/docs/mdx/RequestExample.svelte';
	import ResponseExample from '$lib/ui/components/docs/mdx/ResponseExample.svelte';

	let {
		operation,
		specUrl = '/api/v1/openapi.json',
		children,
		contentEl = $bindable(undefined)
	}: {
		operation: string;
		specUrl?: string;
		children: Snippet;
		contentEl?: HTMLDivElement | undefined;
	} = $props();

	const playgroundCtx = getContext<DocsPlaygroundContext | undefined>(DOCS_PLAYGROUND);

	let loading = $state(true);
	let errorText = $state<string | null>(null);
	let curl = $state('');
	let jsonPretty = $state('');
	let reqTitle = $state('Request');
	let httpMethod = $state('');
	let apiPath = $state('');
	let serverDisplay = $state('');
	let paramPayload = $state<OpenapiDocsParamPayload | null>(null);
	let bodyPayload = $state<OpenapiDocsBodyPayload | null>(null);
	let responseDocs = $state<OpenapiDocsResponsePayload | null>(null);
	let selectedResponseStatus = $state('200');

	let railResponseCode = $derived(
		responseDocs?.exampleJsonByStatus[selectedResponseStatus] ?? jsonPretty
	);

	function openPlayground() {
		playgroundCtx?.open();
	}

	$effect(() => {
		if (!browser) return;

		let cancelled = false;
		loading = true;
		errorText = null;
		paramPayload = null;
		bodyPayload = null;
		responseDocs = null;
		selectedResponseStatus = '200';

		void (async () => {
			const result = await fetchOpenapiOperationForDocs(operation, specUrl, page.url.origin);
			if (cancelled) return;

			if (!result.ok) {
				errorText = result.error;
				curl = '';
				jsonPretty = '';
				httpMethod = '';
				apiPath = '';
				serverDisplay = '';
				paramPayload = null;
				bodyPayload = null;
				responseDocs = null;
			} else {
				errorText = null;
				const p = result.payload;
				reqTitle = p.reqTitle;
				curl = p.curl;
				jsonPretty = p.jsonPretty;
				httpMethod = p.httpMethod;
				apiPath = p.apiPath;
				serverDisplay = p.serverDisplay;
				paramPayload = p.params;
				bodyPayload = p.body;
				responseDocs = p.responseDocs;
				selectedResponseStatus = p.status;
			}
			loading = false;
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

<div
	class="openapi-split border-base-300 mt-2 grid grid-cols-1 gap-10 border-t pt-10 lg:grid-cols-[minmax(0,min(42rem,100%))_minmax(260px,380px)] lg:items-stretch"
>
	<div class="openapi-split-main min-h-0 min-w-0 space-y-6">
		{#if loading}
			<div
				class="border-base-300/70 bg-base-200/30 text-base-content/65 rounded-xl border border-dashed px-4 py-6 text-center text-sm"
				role="status"
			>
				Loading endpoint from OpenAPI…
			</div>
		{:else if errorText}
			<div class="border-error/40 bg-error/10 text-error rounded-xl border px-4 py-3 text-sm" role="alert">
				<strong class="font-semibold">Could not load OpenAPI.</strong>
				<span class="opacity-90">{errorText}</span>
				<span class="text-base-content/70 mt-1 block text-xs">
					Ensure the backend is running and <code class="text-xs">GET {specUrl}</code> succeeds.
				</span>
			</div>
		{:else}
			<ApiEndpointTryItBar
				method={httpMethod}
				serverDisplay={serverDisplay}
				pathPattern={apiPath}
				onTryIt={openPlayground}
			/>

			{#if paramPayload && (paramPayload.authorization || paramPayload.pathParams.length > 0 || paramPayload.queryParams.length > 0 || paramPayload.headerParams.length > 0)}
				<div class="not-prose max-w-3xl space-y-10">
					{#if paramPayload.authorization}
						<div>
							<h2
								class="text-base-content scroll-mt-28 border-b border-base-300 pb-3 text-xl font-bold tracking-tight"
							>
								Authorizations
							</h2>
							<div class="divide-y divide-base-200">
								<ParamField
									path={paramPayload.authorization.name}
									type={paramPayload.authorization.type}
									location={paramPayload.authorization.location}
									required={paramPayload.authorization.required}
									deprecated={paramPayload.authorization.deprecated}
									default={paramPayload.authorization.default}
									description={paramPayload.authorization.description}
								/>
							</div>
						</div>
					{/if}

					{#if paramPayload.pathParams.length > 0}
						<div>
							<h2
								class="text-base-content scroll-mt-28 border-b border-base-300 pb-3 text-xl font-bold tracking-tight"
							>
								Path parameters
							</h2>
							<div class="divide-y divide-base-200">
								{#each paramPayload.pathParams as row (`${row.location}-${row.name}`)}
									<ParamField
										path={row.name}
										type={row.type}
										location={row.location}
										required={row.required}
										deprecated={row.deprecated}
										default={row.default}
										description={row.description}
									/>
								{/each}
							</div>
						</div>
					{/if}

					{#if paramPayload.queryParams.length > 0}
						<div>
							<h2
								class="text-base-content scroll-mt-28 border-b border-base-300 pb-3 text-xl font-bold tracking-tight"
							>
								Query parameters
							</h2>
							<div class="divide-y divide-base-200">
								{#each paramPayload.queryParams as row (`${row.location}-${row.name}`)}
									<ParamField
										path={row.name}
										type={row.type}
										location={row.location}
										required={row.required}
										deprecated={row.deprecated}
										default={row.default}
										description={row.description}
									/>
								{/each}
							</div>
						</div>
					{/if}

					{#if paramPayload.headerParams.length > 0}
						<div>
							<h2
								class="text-base-content scroll-mt-28 border-b border-base-300 pb-3 text-xl font-bold tracking-tight"
							>
								Header parameters
							</h2>
							<div class="divide-y divide-base-200">
								{#each paramPayload.headerParams as row (`${row.location}-${row.name}`)}
									<ParamField
										path={row.name}
										type={row.type}
										location={row.location}
										required={row.required}
										deprecated={row.deprecated}
										default={row.default}
										description={row.description}
									/>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			{#if bodyPayload && bodyPayload.fields.length > 0}
				<div class="not-prose max-w-3xl space-y-4">
					<div
						class="border-base-300 flex flex-wrap items-end justify-between gap-3 border-b pb-3"
					>
						<h2 class="text-base-content scroll-mt-28 text-xl font-bold tracking-tight">
							Body parameters
						</h2>
						<code
							class="text-base-content/80 bg-base-200/60 rounded-md px-2 py-1 font-mono text-xs"
							>{bodyPayload.contentType}</code
						>
					</div>
					<div class="divide-y divide-base-200">
						{#each bodyPayload.fields as row (`body-${row.name}`)}
							<ParamField
								path={row.name}
								type={row.type}
								location="body"
								required={row.required}
								deprecated={row.deprecated}
								default={row.default}
								description={row.description}
							/>
						{/each}
					</div>
				</div>
			{/if}

			{#if responseDocs && responseDocs.variants.length > 0}
				{@const activeVariant =
					responseDocs.variants.find((v) => v.status === selectedResponseStatus) ??
					responseDocs.variants[0]}
				<div class="not-prose max-w-3xl space-y-4">
					<div
						class="border-base-300 flex flex-wrap items-end justify-between gap-3 border-b pb-3"
					>
						<h2 class="text-base-content scroll-mt-28 text-xl font-bold tracking-tight">
							Response
						</h2>
						<div class="flex flex-wrap items-center gap-3">
							{#if responseDocs.variants.length > 1}
								<label class="flex items-center gap-2">
									<span class="text-base-content/55 sr-only">HTTP status</span>
									<select
										class="border-base-300 bg-base-100 text-base-content focus:border-primary focus:ring-primary/20 rounded-lg border px-2 py-1.5 font-mono text-sm shadow-sm focus:ring-2 focus:outline-none"
										bind:value={selectedResponseStatus}
									>
										{#each responseDocs.variants as v (v.status)}
											<option value={v.status}>{v.status}</option>
										{/each}
									</select>
								</label>
							{:else}
								<span
									class="border-primary/35 text-primary font-mono text-sm font-semibold tracking-wide underline decoration-2 underline-offset-[10px]"
									>{activeVariant.status}</span
								>
							{/if}
							<code
								class="text-base-content/80 bg-base-200/60 rounded-md px-2 py-1 font-mono text-xs"
								>{activeVariant.contentType}</code
							>
						</div>
					</div>
					{#if activeVariant.description}
						<p class="text-base-content/80 text-sm leading-relaxed">{activeVariant.description}</p>
					{/if}
					{#if activeVariant.fields.length > 0}
						<div class="divide-y divide-base-200">
							{#each activeVariant.fields as row (`${activeVariant.status}-${row.name}`)}
								<ResponseField
									name={row.name}
									type={row.type}
									required={row.required}
									deprecated={row.deprecated}
									default={row.default}
									description={row.description}
								/>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/if}

		<div
			class="prose min-w-0 max-w-3xl break-words text-base-content prose-headings:text-base-content prose-headings:scroll-mt-28 prose-p:text-base-content/90 prose-strong:text-base-content prose-a:text-primary prose-blockquote:border-base-content/20 prose-blockquote:text-base-content/80 prose-code:text-base-content prose-li:marker:text-base-content/60 prose-hr:border-base-300 [&_pre]:min-w-0 [&_pre]:max-w-full [&_pre]:overflow-x-auto"
			bind:this={contentEl}
		>
			{@render children()}
		</div>
	</div>

	<aside
		class="openapi-split-rail not-prose flex min-h-0 w-full min-w-0 flex-col lg:h-full"
		aria-label="Request and response examples"
	>
		<!--
			lg:items-stretch makes this column as tall as the prose column so sticky has a tall scroll parent.
			Sticky must not share a node with overflow-*; inner scroll for long curl/JSON.
			top-16 clears sticky DocsHeader (h-14).
		-->
		<div class="lg:sticky lg:top-16 lg:z-10 w-full">
			<div
				class="space-y-4 lg:max-h-[calc(100dvh-4.5rem)] lg:overflow-y-auto lg:overflow-x-clip lg:pb-4 lg:[scrollbar-gutter:stable]"
			>
				<h2 id="api-examples-heading" class="text-base-content sr-only">API examples</h2>
				{#if loading}
					<div
						class="border-base-300/70 bg-base-200/30 text-base-content/65 rounded-xl border border-dashed px-4 py-8 text-center text-sm"
						role="status"
					>
						Loading examples…
					</div>
				{:else if errorText}
					<div class="border-error/40 bg-error/10 text-error rounded-xl border px-4 py-3 text-sm" role="alert">
						Examples unavailable.
					</div>
				{:else}
					<RequestExample title={reqTitle} code={curl} language="bash" dropdown={true} />
					<ResponseExample status={selectedResponseStatus} code={railResponseCode} />
				{/if}
			</div>
		</div>
	</aside>
</div>
