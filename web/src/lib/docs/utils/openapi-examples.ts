/** Minimal OpenAPI 3 types for resolving examples (avoid coupling to a heavy schema lib). */
export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

export type OasParameter = {
	in?: string;
	name?: string;
	required?: boolean;
	deprecated?: boolean;
	description?: string;
	schema?: { type?: string; example?: JsonValue; default?: JsonValue; items?: { type?: string } };
	example?: JsonValue;
};

export type OasOperation = {
	summary?: string;
	description?: string;
	/** Omit or inherit global security; empty array means no authentication for this operation. */
	security?: Array<Record<string, string[]>>;
	parameters?: OasParameter[];
	requestBody?: {
		required?: boolean;
		content?: Record<
			string,
			{
				example?: JsonValue;
				schema?: unknown;
			}
		>;
	};
	responses?: Record<
		string,
		{
			description?: string;
			content?: Record<
				string,
				{
					example?: JsonValue;
					examples?: Record<string, { value?: JsonValue }>;
					schema?: unknown;
				}
			>;
		}
	>;
};

export type OasDoc = {
	openapi?: string;
	servers?: { url?: string; description?: string }[];
	paths?: Record<string, Record<string, OasOperation>>;
	components?: {
		securitySchemes?: Record<
			string,
			{ type?: string; in?: string; name?: string; description?: string }
		>;
		schemas?: Record<string, unknown>;
	};
	security?: Record<string, string[]>[];
};

type OasSchemaLike = {
	$ref?: string;
	type?: string;
	format?: string;
	description?: string;
	deprecated?: boolean;
	default?: JsonValue;
	example?: JsonValue;
	enum?: JsonValue[];
	properties?: Record<string, unknown>;
	required?: string[];
	items?: unknown;
	additionalProperties?: unknown;
	oneOf?: unknown[];
	anyOf?: unknown[];
	allOf?: unknown[];
	nullable?: boolean;
};

/**
 * Resolve a single `$ref` against `components.schemas`. Returns the schema unchanged
 * when it is already an inline schema. Guards against cycles by short-circuiting on
 * already-visited refs.
 */
function resolveRef(spec: OasDoc | null | undefined, schema: unknown, seen: Set<string> = new Set()): OasSchemaLike | null {
	if (!schema || typeof schema !== 'object') return null;
	const s = schema as OasSchemaLike;
	const ref = s.$ref;
	if (typeof ref === 'string' && ref.length > 0) {
		if (seen.has(ref)) return null;
		seen.add(ref);
		const m = /^#\/components\/schemas\/(.+)$/.exec(ref);
		if (!m || !spec?.components?.schemas) return null;
		const next = spec.components.schemas[m[1]!];
		return resolveRef(spec, next, seen);
	}
	return s;
}

export function parseOpenapiOperationLine(line: string): { method: string; path: string } | null {
	const t = line.trim();
	const m = /^(\w+)\s+(\/[^\s]+)$/.exec(t);
	if (!m) return null;
	const method = m[1].toUpperCase();
	const path = m[2];
	if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)) return null;
	return { method, path };
}

export function getOperation(
	spec: OasDoc,
	method: string,
	path: string
): OasOperation | null {
	const op = spec.paths?.[path]?.[method.toLowerCase()];
	return op ?? null;
}

/** Placeholder values for curl samples (readable, copy-paste friendly). */
export function fillPathExample(path: string): string {
	return path.replace(/\{([^}]+)\}/g, (_, raw: string) => {
		const name = String(raw).toLowerCase();
		if (name.includes('integration') || name === 'id') return 'twitter';
		return 'example';
	});
}

/** Resolve example JSON from OpenAPI 3 `content.*` (media type object). */
function pickExampleFromMedia(
	spec: OasDoc | null,
	media: {
		example?: JsonValue;
		examples?: Record<string, { value?: JsonValue }>;
		schema?: unknown;
	}
): JsonValue | null {
	if (media.example !== undefined) return media.example as JsonValue;
	const firstEx = Object.values(media.examples ?? {})[0];
	if (firstEx?.value !== undefined) return firstEx.value as JsonValue;

	const resolved = resolveRef(spec, media.schema);
	if (resolved?.example !== undefined) return resolved.example;

	return syntheticExampleFromSchema(spec, media.schema, 0);
}

/**
 * Best-effort synthetic example so the rail never shows an empty placeholder.
 * Resolves `$ref`, walks `type: array` into `items`, and recurses into nested objects
 * (capped at {@link MAX_SYNTH_DEPTH}).
 */
const MAX_SYNTH_DEPTH = 5;

function syntheticExampleFromSchema(spec: OasDoc | null, raw: unknown, depth: number): JsonValue | null {
	const s = resolveRef(spec, raw);
	if (!s) return null;
	if (s.example !== undefined) return s.example;
	if (Array.isArray(s.enum) && s.enum.length > 0) return s.enum[0] as JsonValue;
	if (s.default !== undefined) return s.default;
	if (depth > MAX_SYNTH_DEPTH) {
		if (s.type === 'array') return [];
		if (s.type === 'object') return {};
		return null;
	}

	if (s.type === 'array') {
		const itemEx = syntheticExampleFromSchema(spec, s.items, depth + 1);
		return itemEx === null ? [] : [itemEx];
	}

	if (s.type === 'object' || s.properties) {
		const out: Record<string, JsonValue> = {};
		for (const [key, prop] of Object.entries(s.properties ?? {})) {
			const v = syntheticExampleFromProperty(spec, key, prop, depth + 1);
			if (v !== undefined) out[key] = v;
		}
		if (Object.keys(out).length > 0) return out;
		return s.type === 'object' ? {} : null;
	}

	return primitiveSampleFromSchema(s);
}

function syntheticExampleFromProperty(
	spec: OasDoc | null,
	key: string,
	raw: unknown,
	depth: number
): JsonValue | undefined {
	const resolved = resolveRef(spec, raw);
	if (!resolved) return undefined;
	if (resolved.example !== undefined) return resolved.example;
	if (Array.isArray(resolved.enum) && resolved.enum.length > 0) return resolved.enum[0] as JsonValue;
	if (resolved.default !== undefined) return resolved.default;

	if (resolved.type === 'array') {
		const itemEx = syntheticExampleFromSchema(spec, resolved.items, depth + 1);
		return itemEx === null ? [] : [itemEx];
	}
	if (resolved.type === 'object' || resolved.properties) {
		const nested = syntheticExampleFromSchema(spec, resolved, depth);
		return nested ?? {};
	}
	return primitiveSampleFromSchema(resolved, key);
}

function primitiveSampleFromSchema(s: OasSchemaLike, key?: string): JsonValue {
	const t = s.type;
	if (t === 'string') {
		if (s.format === 'date-time') return new Date().toISOString();
		if (s.format === 'date') return new Date().toISOString().slice(0, 10);
		if (s.format === 'uuid') return '00000000-0000-0000-0000-000000000000';
		if (s.format === 'email') return 'user@example.com';
		if (s.format === 'uri' || s.format === 'url' || key?.toLowerCase() === 'url') {
			return 'https://example.com/path';
		}
		return '…';
	}
	if (t === 'integer' || t === 'number') return 0;
	if (t === 'boolean') return false;
	if (t === 'array') return [];
	if (t === 'object') return {};
	return null;
}

export function pickJsonExample(spec: OasDoc | null, op: OasOperation | null, status = '200'): JsonValue | null {
	const rawResponses = op?.responses as Record<string, { content?: Record<string, unknown> }> | undefined;
	const response = rawResponses?.[status] ?? rawResponses?.[String(Number(status))];
	if (!response?.content) return null;
	const content = response.content;
	const appJson = (content['application/json'] ?? content['application/problem+json']) as
		| {
				example?: JsonValue;
				examples?: Record<string, { value?: JsonValue }>;
				schema?: unknown;
		  }
		| undefined;
	if (!appJson) return null;
	return pickExampleFromMedia(spec, appJson);
}

export function buildCurlSample(opts: {
	origin: string;
	serverUrl: string;
	method: string;
	pathPattern: string;
	apiKeyHeader?: boolean;
	/** Header name from OpenAPI `components.securitySchemes` (defaults to `Authorization`). */
	apiKeyHeaderName?: string | null;
}): string {
	const pathFilled = fillPathExample(opts.pathPattern);
	let base = opts.serverUrl.trim();
	if (base.startsWith('/')) {
		base = `${opts.origin.replace(/\/$/, '')}${base}`;
	}
	const url = `${base.replace(/\/$/, '')}${pathFilled.startsWith('/') ? pathFilled : `/${pathFilled}`}`;
	const lines = [`curl --request ${opts.method} \\`, `  --url '${url}' \\`];
	if (opts.apiKeyHeader) {
		const hk = (opts.apiKeyHeaderName ?? 'Authorization').trim() || 'Authorization';
		lines.push(`  --header '${hk}: YOUR_API_KEY'`);
	} else {
		lines[lines.length - 1] = lines[lines.length - 1].replace(/ \\$/, '');
	}
	return lines.join('\n');
}

export function inferApiKeyAuth(spec: OasDoc): boolean {
	const schemes = spec.components?.securitySchemes ?? {};
	return Object.values(schemes).some((s) => s?.type === 'apiKey' && s.in === 'header');
}

/** True when generated curl should include the API key header (respects `security: []` on public routes). */
export function operationRequiresApiKey(spec: OasDoc, op: OasOperation | null): boolean {
	if (!inferApiKeyAuth(spec)) return false;
	if (!op) return Boolean(spec.security?.length);

	if (op.security !== undefined) {
		if (op.security.length === 0) return false;
		return true;
	}
	return Boolean(spec.security?.length);
}

export function defaultServerUrl(spec: OasDoc): string {
	const s = spec.servers?.[0]?.url?.trim();
	return s && s.length > 0 ? s : '/api/v1';
}

/** Display server URL without scheme (e.g. for the endpoint strip). */
export function stripServerUrlForDisplay(url: string): string {
	return url.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

/** Where the parameter is sent (docs UI; matches OpenAPI `in` for parameters). */
export type DocsParamLocation = 'path' | 'query' | 'header' | 'body';

export type DocsParamFieldItem = {
	name: string;
	type: string;
	location: DocsParamLocation;
	required: boolean;
	deprecated?: boolean;
	description?: string;
	default?: unknown;
};

export type OpenapiDocsParamPayload = {
	/** Present when the operation requires API key auth per OpenAPI `security`. */
	authorization?: DocsParamFieldItem;
	pathParams: DocsParamFieldItem[];
	queryParams: DocsParamFieldItem[];
	headerParams: DocsParamFieldItem[];
};

export type DocsResponseFieldItem = {
	name: string;
	type: string;
	required: boolean;
	deprecated?: boolean;
	description?: string;
	default?: unknown;
};

export type OpenapiDocsResponseVariant = {
	status: string;
	description?: string;
	contentType: string;
	fields: DocsResponseFieldItem[];
};

export type OpenapiDocsResponsePayload = {
	/** Sorted: 2xx before other numeric codes, then by status. */
	variants: OpenapiDocsResponseVariant[];
	exampleJsonByStatus: Record<string, string>;
};

export type OpenapiDocsBodyPayload = {
	contentType: string;
	fields: DocsResponseFieldItem[];
};

export type OpenapiDocsOperationPayload = {
	reqTitle: string;
	curl: string;
	jsonPretty: string;
	status: string;
	httpMethod: string;
	apiPath: string;
	serverDisplay: string;
	params: OpenapiDocsParamPayload;
	body: OpenapiDocsBodyPayload | null;
	responseDocs: OpenapiDocsResponsePayload | null;
};

function stringifyJsonExample(ex: JsonValue | null): string {
	if (ex === null || ex === undefined) {
		return JSON.stringify({ _note: 'No JSON example in OpenAPI for this response.' }, null, 2);
	}
	return JSON.stringify(ex, null, 2);
}

function sortResponseStatusCodes(codes: string[]): string[] {
	return [...codes].sort((a, b) => {
		const na = parseInt(a, 10);
		const nb = parseInt(b, 10);
		const aOk = Number.isFinite(na);
		const bOk = Number.isFinite(nb);
		if (aOk && bOk) {
			const a2 = na >= 200 && na < 300;
			const b2 = nb >= 200 && nb < 300;
			if (a2 && !b2) return -1;
			if (!a2 && b2) return 1;
			return na - nb;
		}
		return a.localeCompare(b);
	});
}

function jsonSchemaPropertyType(spec: OasDoc | null, prop: unknown): string {
	const p = resolveRef(spec, prop);
	if (!p) return 'unknown';
	if (p.type === 'array') {
		const item = resolveRef(spec, p.items);
		const it = typeof item?.type === 'string' ? item.type : 'unknown';
		return `${it}[]`;
	}
	if (typeof p.type === 'string') {
		if (p.format) return `${p.type} (${p.format})`;
		return p.type;
	}
	if (p.properties) return 'object';
	if (Array.isArray(p.oneOf) || Array.isArray(p.anyOf) || Array.isArray(p.allOf)) return 'object';
	return 'unknown';
}

/**
 * Flatten an OpenAPI response/request schema into a list of {@link DocsResponseFieldItem}.
 *
 * - Resolves `$ref` against `components.schemas`.
 * - Walks nested objects with dotted names (e.g. `data.posts`).
 * - Walks arrays with `parent[].child` notation so docs show the item shape.
 * - Caps recursion at {@link MAX_FIELD_DEPTH} to avoid runaway cycles.
 */
const MAX_FIELD_DEPTH = 4;

function schemaToFlatRows(
	spec: OasDoc | null,
	raw: unknown,
	prefix: string,
	depth: number,
	out: DocsResponseFieldItem[]
): void {
	if (depth > MAX_FIELD_DEPTH) return;
	const s = resolveRef(spec, raw);
	if (!s) return;

	if (s.type === 'array' || (!s.type && s.items)) {
		const childPrefix = prefix ? `${prefix}[]` : '[]';
		schemaToFlatRows(spec, s.items, childPrefix, depth + 1, out);
		return;
	}

	if (s.type === 'object' || s.properties) {
		const req = new Set(s.required ?? []);
		for (const [key, prop] of Object.entries(s.properties ?? {})) {
			const resolved = resolveRef(spec, prop);
			if (!resolved) continue;
			const name = prefix ? `${prefix}.${key}` : key;
			out.push({
				name,
				type: jsonSchemaPropertyType(spec, resolved),
				required: req.has(key),
				deprecated: resolved.deprecated === true,
				description:
					typeof resolved.description === 'string'
						? resolved.description.trim() || undefined
						: undefined,
				default: resolved.default
			});

			if (resolved.type === 'object' || resolved.properties) {
				schemaToFlatRows(spec, resolved, name, depth + 1, out);
			} else if (resolved.type === 'array' || resolved.items) {
				schemaToFlatRows(spec, resolved.items, `${name}[]`, depth + 1, out);
			}
		}
	}
}

function flattenSchemaToResponseFields(spec: OasDoc | null, schema: unknown): DocsResponseFieldItem[] {
	const out: DocsResponseFieldItem[] = [];
	schemaToFlatRows(spec, schema, '', 0, out);
	return out;
}

/** Main-column Response section + JSON examples per status for the docs rail. */
export function buildDocsResponsePayload(
	spec: OasDoc | null,
	op: OasOperation | null
): OpenapiDocsResponsePayload | null {
	if (!op?.responses) return null;
	const variants: OpenapiDocsResponseVariant[] = [];
	const exampleJsonByStatus: Record<string, string> = {};
	for (const [status, resp] of Object.entries(op.responses)) {
		const desc = resp.description?.trim();
		const content = resp.content;
		const jsonMime = content?.['application/json'] ?? content?.['application/problem+json'];
		const hasSchema = Boolean(jsonMime?.schema);
		const fields = hasSchema ? flattenSchemaToResponseFields(spec, jsonMime!.schema) : [];
		if (fields.length === 0 && !desc) continue;

		const contentType = hasSchema
			? content!['application/json']
				? 'application/json'
				: 'application/problem+json'
			: 'application/json';

		variants.push({ status, description: desc || undefined, contentType, fields });

		const ex = pickJsonExample(spec, op, status);
		if (ex !== null) {
			exampleJsonByStatus[status] = stringifyJsonExample(ex);
		} else if (desc) {
			//`400` with only `description`, no `content` / schema (see their connect doc).
			exampleJsonByStatus[status] = JSON.stringify({ message: desc }, null, 2);
		} else {
			exampleJsonByStatus[status] = stringifyJsonExample(null);
		}
	}
	if (variants.length === 0) return null;
	const order = sortResponseStatusCodes(variants.map((v) => v.status));
	variants.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
	return { variants, exampleJsonByStatus };
}

/**
 * Extract body parameter rows from `requestBody` for the main column.
 * Resolves `$ref`, drills into nested objects and array items.
 */
export function buildDocsBodyFields(spec: OasDoc | null, op: OasOperation | null): DocsResponseFieldItem[] {
	const media =
		op?.requestBody?.content?.['application/json'] ??
		op?.requestBody?.content?.['multipart/form-data'];
	if (!media?.schema) return [];
	return flattenSchemaToResponseFields(spec, media.schema);
}

export function bodyContentType(op: OasOperation | null): string | null {
	const ct = op?.requestBody?.content;
	if (!ct) return null;
	if (ct['application/json']) return 'application/json';
	if (ct['multipart/form-data']) return 'multipart/form-data';
	return Object.keys(ct)[0] ?? null;
}

/** Shared loader for docs rails / playground (single network shape). */
export async function fetchOpenapiOperationForDocs(
	operation: string,
	specUrl: string,
	origin: string
): Promise<{ ok: true; payload: OpenapiDocsOperationPayload } | { ok: false; error: string }> {
	const parsed = parseOpenapiOperationLine(operation);
	if (!parsed) {
		return { ok: false, error: `Invalid openapi line: ${operation}` };
	}

	let spec: OasDoc;
	try {
		const res = await fetch(specUrl, { credentials: 'same-origin' });
		if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
		spec = (await res.json()) as OasDoc;
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : String(e) };
	}

	const opNode = getOperation(spec, parsed.method, parsed.path);
	const server = defaultServerUrl(spec);
	const serverDisplay = stripServerUrlForDisplay(server);
	const useAuth = operationRequiresApiKey(spec, opNode);
	const curl = buildCurlSample({
		origin,
		serverUrl: server,
		method: parsed.method,
		pathPattern: parsed.path,
		apiKeyHeader: useAuth,
		apiKeyHeaderName: getApiKeyHeaderName(spec)
	});
	const responseDocs = buildDocsResponsePayload(spec, opNode);
	const primaryStatus =
		responseDocs && responseDocs.variants.length > 0 ? responseDocs.variants[0]!.status : '200';
	const ex = pickJsonExample(spec, opNode, primaryStatus);
	const jsonPretty = stringifyJsonExample(ex);

	const bodyFields = buildDocsBodyFields(spec, opNode);
	const bodyCt = bodyContentType(opNode);
	const body: OpenapiDocsBodyPayload | null =
		bodyFields.length > 0 && bodyCt ? { contentType: bodyCt, fields: bodyFields } : null;

	return {
		ok: true,
		payload: {
			reqTitle: opNode?.summary ?? `${parsed.method} ${parsed.path}`,
			curl,
			jsonPretty,
			status: primaryStatus,
			httpMethod: parsed.method,
			apiPath: parsed.path,
			serverDisplay,
			params: buildDocsParamPayload(spec, opNode),
			body,
			responseDocs
		}
	};
}

/** Absolute API base (handles relative `servers[0].url` like `/api/v1`). */
export function resolveApiBaseUrl(origin: string, serverUrl: string): string {
	const s = serverUrl.trim();
	if (/^https?:\/\//i.test(s)) return s.replace(/\/$/, '');
	const path = s.startsWith('/') ? s : `/${s}`;
	return `${origin.replace(/\/$/, '')}${path}`;
}

/** Replace `{name}` segments with encoded values; missing keys leave `{name}` unchanged. */
export function substitutePathParams(pathPattern: string, values: Record<string, string>): string {
	return pathPattern.replace(/\{([^}]+)\}/g, (_, raw: string) => {
		const key = String(raw).trim();
		const v = values[key];
		if (v !== undefined && v.trim() !== '') return encodeURIComponent(v.trim());
		return `{${key}}`;
	});
}

export function pathHasUnresolvedParams(resolvedPath: string): boolean {
	return /\{[^}]+\}/.test(resolvedPath);
}

export function buildQueryString(query: Record<string, string>): string {
	const p = new URLSearchParams();
	for (const [k, v] of Object.entries(query)) {
		if (v.trim() !== '') p.set(k, v.trim());
	}
	const s = p.toString();
	return s ? `?${s}` : '';
}

export function getApiKeyHeaderName(spec: OasDoc): string | null {
	const schemes = spec.components?.securitySchemes ?? {};
	for (const s of Object.values(schemes)) {
		if (s?.type === 'apiKey' && s.in === 'header' && s.name) return s.name;
	}
	return null;
}

export type GroupedParameters = {
	path: OasParameter[];
	query: OasParameter[];
	header: OasParameter[];
};

export function groupOperationParameters(op: OasOperation | null): GroupedParameters {
	const params = op?.parameters ?? [];
	return {
		path: params.filter((p) => p.in === 'path'),
		query: params.filter((p) => p.in === 'query'),
		header: params.filter((p) => p.in === 'header')
	};
}

function openapiParamType(p: OasParameter): string {
	const s = p.schema;
	if (!s || typeof s !== 'object') return 'string';
	const t = s.type;
	if (t === 'array') {
		const it = s.items?.type;
		return `${typeof it === 'string' ? it : 'string'}[]`;
	}
	if (typeof t === 'string') return t;
	return 'string';
}

function oasParamToDocs(p: OasParameter, location: DocsParamLocation): DocsParamFieldItem | null {
	const name = p.name?.trim();
	if (!name) return null;
	const def =
		p.schema &&
		typeof p.schema === 'object' &&
		'default' in p.schema &&
		(p.schema as { default?: unknown }).default !== undefined
			? (p.schema as { default: unknown }).default
			: undefined;
	return {
		name,
		type: openapiParamType(p),
		location,
		required: Boolean(p.required),
		deprecated: p.deprecated === true,
		description: p.description?.trim() || undefined,
		default: def
	};
}

/** Request parameter rows for docs UI (authorizations + OpenAPI `parameters`). */
export function buildDocsParamPayload(spec: OasDoc, op: OasOperation | null): OpenapiDocsParamPayload {
	const needsAuth = operationRequiresApiKey(spec, op);
	const hk = getApiKeyHeaderName(spec);
	let authorization: DocsParamFieldItem | undefined;
	if (needsAuth && hk) {
		const schemes = spec.components?.securitySchemes ?? {};
		let authDesc = 'Your organization API key.';
		for (const s of Object.values(schemes)) {
			if (s?.type === 'apiKey' && s.in === 'header' && s.name === hk && s.description?.trim()) {
				authDesc = s.description.trim();
				break;
			}
		}
		authorization = {
			name: hk,
			type: 'string',
			location: 'header',
			required: true,
			description: authDesc
		};
	}

	const g = groupOperationParameters(op);
	const pathParams = g.path
		.map((p) => oasParamToDocs(p, 'path'))
		.filter(Boolean) as DocsParamFieldItem[];
	const queryParams = g.query
		.map((p) => oasParamToDocs(p, 'query'))
		.filter(Boolean) as DocsParamFieldItem[];
	const headerParams = g.header
		.filter((p) => {
			const n = p.name?.trim();
			if (!n) return false;
			if (needsAuth && hk && n.toLowerCase() === hk.toLowerCase()) return false;
			return true;
		})
		.map((p) => oasParamToDocs(p, 'header'))
		.filter(Boolean) as DocsParamFieldItem[];

	return { authorization, pathParams, queryParams, headerParams };
}

export function defaultPathPlaceholder(paramName: string): string {
	const n = paramName.toLowerCase();
	if (n.includes('integration')) return 'twitter';
	if (n === 'id') return 'example';
	return 'example';
}

/** cURL reflecting current playground field values. */
export function buildLiveCurlSample(opts: {
	origin: string;
	serverUrl: string;
	method: string;
	pathPattern: string;
	pathValues: Record<string, string>;
	queryValues: Record<string, string>;
	authHeaderName?: string | null;
	authHeaderValue?: string;
	body?: string;
}): string {
	const base = resolveApiBaseUrl(opts.origin, opts.serverUrl);
	const pathResolved = substitutePathParams(opts.pathPattern, opts.pathValues);
	const qs = buildQueryString(opts.queryValues);
	const url = `${base}${pathResolved.startsWith('/') ? pathResolved : `/${pathResolved}`}${qs}`;
	const parts: string[] = [`curl --request ${opts.method} \\`, `  --url '${url}'`];
	const hk = opts.authHeaderName;
	const hv = opts.authHeaderValue?.trim();
	const method = opts.method.toUpperCase();
	const withBody =
		method !== 'GET' &&
		method !== 'HEAD' &&
		opts.body !== undefined &&
		opts.body.trim() !== '';

	if (hk && hv) {
		parts[parts.length - 1] += ' \\';
		parts.push(`  --header '${hk}: ${hv.replace(/'/g, `'\\''`)}'`);
	}
	if (withBody) {
		parts[parts.length - 1] += ' \\';
		parts.push(`  --header 'Content-Type: application/json' \\`);
		const escaped = opts.body!.replace(/'/g, `'\\''`);
		parts.push(`  --data '${escaped}'`);
	}
	return parts.join('\n');
}

export function jsonBodyExampleOrEmpty(op: OasOperation | null): string {
	const raw = op?.requestBody?.content?.['application/json']?.example;
	if (raw !== undefined) return JSON.stringify(raw, null, 2);
	return '{\n  \n}';
}

export function operationHasJsonBody(op: OasOperation | null): boolean {
	return Boolean(op?.requestBody?.content?.['application/json']);
}
