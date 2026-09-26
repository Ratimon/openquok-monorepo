import type { DocsCodeBlockFromRaw } from '$lib/docs/utils/content/extractDocsCodeBlocksFromRaw';
import {
	httpRequestDescriptorFromOpenapiStatic,
	renderHttpClientSamples
} from '$lib/docs/utils/openapi/httpClientSamples';
import {
	defaultServerUrl,
	getApiKeyHeaderName,
	loadOpenapiSpec,
	operationRequiresApiKey,
	parseOpenapiOperationLine,
	resolveOpenapiOperationNode
} from '$lib/docs/utils/openapi/openapiExamples';

const DEFAULT_OPENAPI_SPEC_PATH = '/api/v1/openapi.json';

/** Static HTTP client samples for JSON-LD (`SoftwareSourceCode`) — no response/param schema work. */
export async function fetchOpenApiSeoCodeBlocks(params: {
	openapi: string;
	title: string;
	origin: string;
	startIndex: number;
	specUrl?: string;
}): Promise<DocsCodeBlockFromRaw[]> {
	const parsed = parseOpenapiOperationLine(params.openapi);
	if (!parsed) return [];

	const loaded = await loadOpenapiSpec(params.origin, params.specUrl ?? DEFAULT_OPENAPI_SPEC_PATH);
	if (!loaded.ok) return [];

	const { spec } = loaded;
	const opNode = resolveOpenapiOperationNode(spec, parsed.method, parsed.path);
	const server = defaultServerUrl(spec);
	const useAuth = operationRequiresApiKey(spec, opNode);
	const descriptor = httpRequestDescriptorFromOpenapiStatic({
		origin: params.origin,
		serverUrl: server,
		method: parsed.method,
		pathPattern: parsed.path,
		apiKeyHeader: useAuth,
		apiKeyHeaderName: getApiKeyHeaderName(spec)
	});
	const clientSamples = renderHttpClientSamples(descriptor);

	return clientSamples.map((sample, offset) => ({
		index: params.startIndex + offset,
		language: sample.shikiLanguage,
		text: sample.code,
		name: `${params.title} — ${sample.label} request example`
	}));
}
