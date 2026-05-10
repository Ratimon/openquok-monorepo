<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import {
		buildLiveCurlSample,
		buildQueryString,
		defaultPathPlaceholder,
		defaultServerUrl,
		getApiKeyHeaderName,
		getOperation,
		groupOperationParameters,
		operationRequiresApiKey,
		jsonBodyExampleOrEmpty,
		operationHasJsonBody,
		parseOpenapiOperationLine,
		pathHasUnresolvedParams,
		pickJsonExample,
		resolveApiBaseUrl,
		substitutePathParams,
		type JsonValue,
		type OasDoc,
		type OasOperation
	} from '$lib/docs/utils/openapi-examples';

	import { cn } from '$lib/ui/helpers/common';
	import { highlightCode } from '$lib/docs/utils/shiki-highlight';

	import RequestExample from '$lib/ui/components/docs/mdx/RequestExample.svelte';
	import ResponseExample from '$lib/ui/components/docs/mdx/ResponseExample.svelte';

	let {
		operation,
		specUrl = '/api/v1/openapi.json',
		layout = 'embed'
	}: {
		operation: string;
		specUrl?: string;
		layout?: 'embed' | 'modal';
	} = $props();

	let loading = $state(true);
	let loadError = $state<string | null>(null);
	let spec = $state<OasDoc | null>(null);
	let opNode = $state<OasOperation | null>(null);
	let method = $state('GET');
	let pathPattern = $state('/');
	let serverUrl = $state('/api/v1');

	let pathValues = $state<Record<string, string>>({});
	let queryValues = $state<Record<string, string>>({});
	let headerParamValues = $state<Record<string, string>>({});
	let authValue = $state('');
	let bodyJson = $state('');

	let sending = $state(false);
	let responseStatus = $state<number | null>(null);
	let responseBody = $state('');
	let sendError = $state<string | null>(null);

	let responseHtml = $state('');

	let apiKeyHeaderName = $derived(spec ? getApiKeyHeaderName(spec) : null);
	let wantsAuth = $derived(spec ? operationRequiresApiKey(spec, opNode) : false);
	let grouped = $derived(groupOperationParameters(opNode));
	let exampleJson = $derived(stringifymaybe(pickJsonExample(opNode, '200')));
	let liveCurl = $derived.by(() => {
		const origin = page.url.origin;
		return buildLiveCurlSample({
			origin,
			serverUrl,
			method,
			pathPattern,
			pathValues,
			queryValues,
			authHeaderName: wantsAuth ? apiKeyHeaderName : null,
			authHeaderValue: wantsAuth ? authValue : undefined,
			body: operationHasJsonBody(opNode) ? bodyJson : undefined
		});
	});

	let previewUrl = $derived.by(() => {
		const origin = page.url.origin;
		const base = resolveApiBaseUrl(origin, serverUrl);
		const path = substitutePathParams(pathPattern, pathValues);
		const qs = buildQueryString(queryValues);
		const pathPart = path.startsWith('/') ? path : `/${path}`;
		return `${base}${pathPart}${qs}`;
	});

	function stringifymaybe(ex: JsonValue | null): string {
		if (ex === null || ex === undefined) {
			return JSON.stringify({ _note: 'No JSON example in OpenAPI for this response.' }, null, 2);
		}
		return JSON.stringify(ex, null, 2);
	}

	function resetFromOperation(parsed: { method: string; path: string }, nextSpec: OasDoc, nextOp: OasOperation | null) {
		method = parsed.method;
		pathPattern = parsed.path;
		serverUrl = defaultServerUrl(nextSpec);
		opNode = nextOp;

		const hk = getApiKeyHeaderName(nextSpec);
		const g = groupOperationParameters(nextOp);
		const pv: Record<string, string> = {};
		for (const p of g.path) {
			if (p.name) pv[p.name] = defaultPathPlaceholder(p.name);
		}
		pathValues = pv;

		const qv: Record<string, string> = {};
		for (const p of g.query) {
			if (p.name) qv[p.name] = '';
		}
		queryValues = qv;

		const hvv: Record<string, string> = {};
		for (const p of g.header) {
			if (p.name && (!hk || p.name.toLowerCase() !== hk.toLowerCase())) {
				hvv[p.name] = '';
			}
		}
		headerParamValues = hvv;

		authValue = '';
		bodyJson = jsonBodyExampleOrEmpty(nextOp);
		responseStatus = null;
		responseBody = '';
		sendError = null;
	}

	$effect(() => {
		if (!browser) return;

		const parsed = parseOpenapiOperationLine(operation);
		if (!parsed) {
			loading = false;
			loadError = `Invalid openapi line: ${operation}`;
			return;
		}

		let cancelled = false;
		loading = true;
		loadError = null;

		void (async () => {
			try {
				const res = await fetch(specUrl, { credentials: 'same-origin' });
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const nextSpec = (await res.json()) as OasDoc;
				if (cancelled) return;

				spec = nextSpec;
				const nextOp = getOperation(nextSpec, parsed.method, parsed.path);
				resetFromOperation(parsed, nextSpec, nextOp);
			} catch (e) {
				if (!cancelled) {
					loadError = e instanceof Error ? e.message : String(e);
					spec = null;
					opNode = null;
				}
			} finally {
				if (!cancelled) loading = false;
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (!browser || !responseBody.trim()) {
			responseHtml = '';
			return;
		}
		let cancelled = false;
		void highlightCode(responseBody.trim(), 'json').then((h) => {
			if (!cancelled) responseHtml = h;
		});
		return () => {
			cancelled = true;
		};
	});

	async function send() {
		if (!browser || !spec) return;

		const resolvedPath = substitutePathParams(pathPattern, pathValues);
		if (pathHasUnresolvedParams(resolvedPath)) {
			sendError = 'Fill all path parameters before sending.';
			return;
		}

		for (const p of grouped.path) {
			if (p.required && p.name && !pathValues[p.name]?.trim()) {
				sendError = `Required path parameter “${p.name}” is empty.`;
				return;
			}
		}

		sendError = null;
		sending = true;
		responseStatus = null;
		responseBody = '';

		try {
			const origin = page.url.origin;
			const base = resolveApiBaseUrl(origin, serverUrl);
			const qs = buildQueryString(queryValues);
			const pathPart = resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`;
			const url = `${base}${pathPart}${qs}`;

			const headers = new Headers();
			const hk = apiKeyHeaderName;
			if (wantsAuth && hk && authValue.trim()) headers.set(hk, authValue.trim());
			for (const p of grouped.header) {
				if (!p.name) continue;
				if (hk && p.name.toLowerCase() === hk.toLowerCase()) continue;
				const v = headerParamValues[p.name]?.trim();
				if (v) headers.set(p.name, v);
			}

			let body: string | undefined;
			const m = method.toUpperCase();
			if (m !== 'GET' && m !== 'HEAD' && operationHasJsonBody(opNode)) {
				headers.set('Content-Type', 'application/json');
				body = bodyJson;
			}

			const res = await fetch(url, { method, headers, body });
			responseStatus = res.status;
			const text = await res.text();
			try {
				responseBody = JSON.stringify(JSON.parse(text), null, 2);
			} catch {
				responseBody = text || '(empty body)';
			}
		} catch (e) {
			sendError = e instanceof Error ? e.message : String(e);
		} finally {
			sending = false;
		}
	}
</script>

{#if loading}
	<div
		class="border-base-300/70 bg-base-200/30 text-base-content/65 rounded-xl border border-dashed px-4 py-8 text-center text-sm"
		role="status"
	>
		Loading playground from OpenAPI…
	</div>
{:else if loadError}
	<div class="border-error/40 bg-error/10 text-error rounded-xl border px-4 py-3 text-sm" role="alert">
		<strong class="font-semibold">Could not load OpenAPI.</strong>
		<span class="opacity-90">{loadError}</span>
		<span class="text-base-content/70 mt-1 block text-xs">
			Ensure the backend is running and <code class="text-xs">GET {specUrl}</code> succeeds.
		</span>
	</div>
{:else}
	<div
		class={cn(
			'gap-4',
			layout === 'modal'
				? 'grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5'
				: 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5'
		)}
	>
		<div class="border-base-300/80 bg-base-100 flex min-h-0 flex-col gap-4 rounded-xl border p-4 shadow-sm">
			<div class="min-w-0">
				<h3 class="text-base-content text-lg font-semibold tracking-tight">
					{opNode?.summary ?? `${method} ${pathPattern}`}
				</h3>
				{#if opNode?.description}
					<p class="text-base-content/70 mt-1 text-sm leading-relaxed">{opNode.description}</p>
				{/if}
			</div>

			<div class="flex flex-wrap items-center gap-2 border-b border-base-300/60 pb-4">
				<span class="badge badge-success badge-sm font-bold">{method}</span>
				<code class="text-base-content/90 min-w-0 shrink font-mono text-[13px] break-all">{previewUrl}</code>
				<button
					type="button"
					class="btn btn-success btn-sm ms-auto gap-1 font-semibold"
					disabled={sending}
					onclick={() => void send()}
				>
					{sending ? 'Sending…' : 'Send'}
					<svg class="size-3.5 shrink-0 opacity-95" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M8 5v14l11-7z" />
					</svg>
				</button>
			</div>

			{#if sendError}
				<div class="border-error/35 bg-error/10 text-error rounded-lg border px-3 py-2 text-sm" role="alert">
					{sendError}
				</div>
			{/if}

			{#if wantsAuth && apiKeyHeaderName}
				<section class="border-base-300/80 rounded-lg border p-3">
					<h4 class="text-base-content mb-2 text-sm font-semibold">
						Authorization
						<span class="badge badge-error badge-outline badge-xs ms-1">required</span>
					</h4>
					<label class="label py-1" for="openapi-docs-auth-key">
						<span class="label-text text-base-content/80 font-mono text-xs">{apiKeyHeaderName}</span>
					</label>
					<input
						id="openapi-docs-auth-key"
						class="input input-bordered border-base-300 bg-base-100 w-full font-mono text-sm"
						type="password"
						autocomplete="off"
						placeholder="Your API key"
						bind:value={authValue}
					/>
				</section>
			{/if}

			{#if grouped.path.length > 0}
				<section class="border-base-300/80 rounded-lg border p-3">
					<h4 class="text-base-content mb-2 text-sm font-semibold">Path</h4>
					<div class="space-y-3">
						{#each grouped.path as param (param.name)}
							{#if param.name}
								<div>
									<label class="label py-0" for={`openapi-path-${param.name}`}>
										<span class="label-text text-base-content text-sm font-medium">{param.name}</span>
										<span class="label-text-alt text-base-content/55 font-mono text-xs">
											{param.schema?.type ?? 'string'}
											{#if param.required}
												<span class="badge badge-error badge-outline badge-xs ms-1">required</span>
											{/if}
										</span>
									</label>
									{#if param.description}
										<p class="text-base-content/60 mb-1 text-xs">{param.description}</p>
									{/if}
									<input
										id={`openapi-path-${param.name}`}
										class="input input-bordered border-base-300 bg-base-100 w-full font-mono text-sm"
										bind:value={pathValues[param.name]}
									/>
								</div>
							{/if}
						{/each}
					</div>
				</section>
			{/if}

			{#if grouped.query.length > 0}
				<section class="border-base-300/80 rounded-lg border p-3">
					<h4 class="text-base-content mb-2 text-sm font-semibold">Query</h4>
					<div class="space-y-3">
						{#each grouped.query as param (param.name)}
							{#if param.name}
								<div>
									<label class="label py-0" for={`openapi-query-${param.name}`}>
										<span class="label-text text-base-content text-sm font-medium">{param.name}</span>
										<span class="label-text-alt font-mono text-xs opacity-70">{param.schema?.type ?? 'string'}</span>
									</label>
									{#if param.description}
										<p class="text-base-content/60 mb-1 text-xs">{param.description}</p>
									{/if}
									<input
										id={`openapi-query-${param.name}`}
										class="input input-bordered border-base-300 bg-base-100 w-full font-mono text-sm"
										bind:value={queryValues[param.name]}
									/>
								</div>
							{/if}
						{/each}
					</div>
				</section>
			{/if}

			{#each grouped.header as param (param.name)}
				{#if param.name && (!apiKeyHeaderName || param.name.toLowerCase() !== apiKeyHeaderName.toLowerCase())}
					<section class="border-base-300/80 rounded-lg border p-3">
						<h4 class="text-base-content mb-2 text-sm font-semibold">
							<label for={`openapi-header-${param.name}`}>Header · {param.name}</label>
						</h4>
						{#if param.description}
							<p class="text-base-content/60 mb-2 text-xs">{param.description}</p>
						{/if}
						<input
							id={`openapi-header-${param.name}`}
							class="input input-bordered border-base-300 bg-base-100 w-full font-mono text-sm"
							bind:value={headerParamValues[param.name]}
						/>
					</section>
				{/if}
			{/each}

			{#if operationHasJsonBody(opNode)}
				<section class="border-base-300/80 rounded-lg border p-3">
					<label class="text-base-content mb-2 block text-sm font-semibold" for="openapi-request-body-json">
						Body · application/json
					</label>
					<textarea
						id="openapi-request-body-json"
						class="textarea textarea-bordered border-base-300 bg-base-100 font-mono text-xs leading-relaxed"
						rows={10}
						bind:value={bodyJson}
					></textarea>
				</section>
			{/if}
		</div>

		<div class="flex min-h-0 flex-col gap-4">
			{#if responseStatus !== null}
				<div
					class={cn(
						'border-base-300/80 bg-base-100 overflow-hidden rounded-xl border shadow-sm',
						responseStatus >= 400 ? 'border-error/40' : ''
					)}
				>
					<div
						class="border-base-300/70 bg-base-200/40 flex items-center justify-between gap-2 border-b px-3 py-2"
					>
						<span
							class={cn(
								'font-mono text-sm font-semibold tracking-wide',
								responseStatus >= 400 ? 'text-error' : 'text-secondary'
							)}
						>
							{responseStatus}
						</span>
						<span class="text-base-content/60 text-xs">Live response</span>
					</div>
					<div
						class="[&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0 [&_.shiki]:bg-base-200/25 overflow-x-auto p-3 text-[13px] leading-relaxed"
					>
						{#if responseHtml}
							<!-- eslint-disable svelte/no-at-html-tags -->
							{@html responseHtml}
						{:else}
							<pre class="text-base-content/90 m-0 whitespace-pre-wrap font-mono"><code>{responseBody}</code></pre>
						{/if}
					</div>
				</div>
			{/if}

			<RequestExample title={opNode?.summary ?? 'Request'} code={liveCurl} language="bash" dropdown={true} />

			<ResponseExample status="200" code={exampleJson} />
		</div>
	</div>
{/if}
