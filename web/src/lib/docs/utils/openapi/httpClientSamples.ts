import {
	buildQueryString,
	fillPathExample,
	resolveApiBaseUrl,
	resolveDocsApiOrigin,
	substitutePathParams
} from '$lib/docs/utils/openapi/openapiRequestUrl';

export type HttpHeader = {
	name: string;
	value: string;
};

/** Normalized HTTP request used to render multi-language API client samples. */
export type HttpRequestDescriptor = {
	method: string;
	url: string;
	headers: HttpHeader[];
	jsonBody?: string;
};

export type HttpClientSample = {
	id: string;
	label: string;
	code: string;
	shikiLanguage: string;
};

type HttpClientSampleRenderer = {
	id: string;
	label: string;
	shikiLanguage: string;
	render: (descriptor: HttpRequestDescriptor) => string;
};

function shellSingleQuote(value: string): string {
	return `'${value.replace(/'/g, `'\\''`)}'`;
}

function jsStringLiteral(value: string): string {
	return JSON.stringify(value);
}

function pythonStringLiteral(value: string): string {
	if (!value.includes("'") && !value.includes('\n')) {
		return `'${value}'`;
	}
	if (!value.includes('"""') && !value.includes("'''")) {
		return `'''${value}'''`;
	}
	return JSON.stringify(value);
}

function phpStringLiteral(value: string): string {
	return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function goStringLiteral(value: string): string {
	return JSON.stringify(value);
}

function javaStringLiteral(value: string): string {
	return JSON.stringify(value);
}

function rubyStringLiteral(value: string): string {
	return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function resolveStaticSampleUrl(opts: {
	origin: string;
	serverUrl: string;
	pathPattern: string;
}): string {
	const pathFilled = fillPathExample(opts.pathPattern);
	let base = opts.serverUrl.trim();
	if (base.startsWith('/')) {
		base = `${resolveDocsApiOrigin(opts.origin)}${base}`;
	}
	return `${base.replace(/\/$/, '')}${pathFilled.startsWith('/') ? pathFilled : `/${pathFilled}`}`;
}

export function httpRequestDescriptorFromOpenapiStatic(opts: {
	origin: string;
	serverUrl: string;
	method: string;
	pathPattern: string;
	apiKeyHeader?: boolean;
	/** Header name from OpenAPI `components.securitySchemes` (defaults to `Authorization`). */
	apiKeyHeaderName?: string | null;
}): HttpRequestDescriptor {
	const headers: HttpHeader[] = [];
	if (opts.apiKeyHeader) {
		const hk = (opts.apiKeyHeaderName ?? 'Authorization').trim() || 'Authorization';
		headers.push({ name: hk, value: 'YOUR_API_KEY' });
	}
	return {
		method: opts.method,
		url: resolveStaticSampleUrl(opts),
		headers
	};
}

export function httpRequestDescriptorFromLivePlayground(opts: {
	origin: string;
	serverUrl: string;
	method: string;
	pathPattern: string;
	pathValues: Record<string, string>;
	queryValues: Record<string, string>;
	authHeaderName?: string | null;
	authHeaderValue?: string;
	body?: string;
}): HttpRequestDescriptor {
	const base = resolveApiBaseUrl(opts.origin, opts.serverUrl);
	const pathResolved = substitutePathParams(opts.pathPattern, opts.pathValues);
	const qs = buildQueryString(opts.queryValues);
	const url = `${base}${pathResolved.startsWith('/') ? pathResolved : `/${pathResolved}`}${qs}`;

	const headers: HttpHeader[] = [];
	const hk = opts.authHeaderName;
	const hv = opts.authHeaderValue?.trim();
	if (hk && hv) {
		headers.push({ name: hk, value: hv });
	}

	const method = opts.method.toUpperCase();
	const withBody =
		method !== 'GET' &&
		method !== 'HEAD' &&
		opts.body !== undefined &&
		opts.body.trim() !== '';

	let jsonBody: string | undefined;
	if (withBody) {
		headers.push({ name: 'Content-Type', value: 'application/json' });
		jsonBody = opts.body!.trim();
	}

	return {
		method: opts.method,
		url,
		headers,
		jsonBody
	};
}

function renderCurl(descriptor: HttpRequestDescriptor): string {
	const parts: string[] = [
		`curl --request ${descriptor.method} \\`,
		`  --url ${shellSingleQuote(descriptor.url)}`
	];
	for (const h of descriptor.headers) {
		parts[parts.length - 1] += ' \\';
		parts.push(`  --header ${shellSingleQuote(`${h.name}: ${h.value}`)}`);
	}
	if (descriptor.jsonBody !== undefined && descriptor.jsonBody.trim() !== '') {
		parts[parts.length - 1] += ' \\';
		parts.push(`  --data ${shellSingleQuote(descriptor.jsonBody)}`);
	}
	return parts.join('\n');
}

function renderPythonRequests(descriptor: HttpRequestDescriptor): string {
	const method = descriptor.method.toLowerCase();
	const headerEntries = descriptor.headers.map(
		(h) => `    ${pythonStringLiteral(h.name)}: ${pythonStringLiteral(h.value)}`
	);
	const headersBlock =
		headerEntries.length > 0 ? `headers = {\n${headerEntries.join(',\n')}\n}\n\n` : '';
	const hasBody = descriptor.jsonBody !== undefined && descriptor.jsonBody.trim() !== '';
	const bodyArg = hasBody ? `,\n    data=${pythonStringLiteral(descriptor.jsonBody!)}` : '';
	const headersArg = headerEntries.length > 0 ? ',\n    headers=headers' : '';

	return `import requests

${headersBlock}response = requests.${method}(
    ${pythonStringLiteral(descriptor.url)}${headersArg}${bodyArg}
)

print(response.text)`;
}

function renderJavaScriptFetch(descriptor: HttpRequestDescriptor): string {
	const method = descriptor.method.toUpperCase();
	const headerLines = descriptor.headers.map(
		(h) => `    ${jsStringLiteral(h.name)}: ${jsStringLiteral(h.value)}`
	);
	const hasBody = descriptor.jsonBody !== undefined && descriptor.jsonBody.trim() !== '';
	const options: string[] = [`  method: ${jsStringLiteral(method)}`];
	if (headerLines.length > 0) {
		options.push(`  headers: {\n${headerLines.join(',\n')}\n  }`);
	}
	if (hasBody) {
		options.push(`  body: ${jsStringLiteral(descriptor.jsonBody!)}`);
	}
	const optionsBlock = options.join(',\n');

	return `const response = await fetch(${jsStringLiteral(descriptor.url)}, {
${optionsBlock}
});

const data = await response.text();
console.log(data);`;
}

function renderPhpCurl(descriptor: HttpRequestDescriptor): string {
	const headerLines = descriptor.headers.map(
		(h) => `    ${phpStringLiteral(`${h.name}: ${h.value}`)}`
	);
	const hasBody = descriptor.jsonBody !== undefined && descriptor.jsonBody.trim() !== '';
	const opts: string[] = [
		`    CURLOPT_URL => ${phpStringLiteral(descriptor.url)}`,
		'    CURLOPT_RETURNTRANSFER => true',
		`    CURLOPT_CUSTOMREQUEST => ${phpStringLiteral(descriptor.method.toUpperCase())}`
	];
	if (headerLines.length > 0) {
		opts.push(`    CURLOPT_HTTPHEADER => [\n${headerLines.join(',\n')}\n    ]`);
	}
	if (hasBody) {
		opts.push(`    CURLOPT_POSTFIELDS => ${phpStringLiteral(descriptor.jsonBody!)}`);
	}

	return `$curl = curl_init();

curl_setopt_array($curl, [
${opts.join(',\n')}
]);

$response = curl_exec($curl);
curl_close($curl);

echo $response;`;
}

function renderGoNetHttp(descriptor: HttpRequestDescriptor): string {
	const method = descriptor.method.toUpperCase();
	const hasBody = descriptor.jsonBody !== undefined && descriptor.jsonBody.trim() !== '';
	const imports = hasBody
		? `import (
\t"fmt"
\t"io"
\t"net/http"
\t"strings"
)`
		: `import (
\t"fmt"
\t"io"
\t"net/http"
)`;

	const bodySetup = hasBody
		? `\n\tbody := strings.NewReader(${goStringLiteral(descriptor.jsonBody!)})
\treq, err := http.NewRequest(${goStringLiteral(method)}, ${goStringLiteral(descriptor.url)}, body)`
		: `\n\treq, err := http.NewRequest(${goStringLiteral(method)}, ${goStringLiteral(descriptor.url)}, nil)`;

	const headerSets = descriptor.headers
		.map((h) => `\treq.Header.Set(${goStringLiteral(h.name)}, ${goStringLiteral(h.value)})`)
		.join('\n');

	return `package main

${imports}

func main() {${bodySetup}
\tif err != nil {
\t\tpanic(err)
\t}
${headerSets ? `${headerSets}\n` : ''}\tclient := &http.Client{}
\tresp, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer resp.Body.Close()

\tout, err := io.ReadAll(resp.Body)
\tif err != nil {
\t\tpanic(err)
\t}
\tfmt.Println(string(out))
}`;
}

function renderJavaUnirest(descriptor: HttpRequestDescriptor): string {
	const method = descriptor.method.toLowerCase();
	const chainMethod =
		method === 'get' || method === 'post' || method === 'put' || method === 'patch' || method === 'delete'
			? method
			: 'request';
	const requestLine =
		chainMethod === 'request'
			? `Unirest.${chainMethod}(${javaStringLiteral(descriptor.method.toUpperCase())}, ${javaStringLiteral(descriptor.url)})`
			: `Unirest.${chainMethod}(${javaStringLiteral(descriptor.url)})`;

	const headerLines = descriptor.headers.map(
		(h) => `\t\t.header(${javaStringLiteral(h.name)}, ${javaStringLiteral(h.value)})`
	);
	const hasBody = descriptor.jsonBody !== undefined && descriptor.jsonBody.trim() !== '';
	const bodyLine = hasBody
		? `\n\t\t.body(${javaStringLiteral(descriptor.jsonBody!)})`
		: '';

	return `import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.HttpResponse;

public class Main {
\tpublic static void main(String[] args) throws Exception {
\t\tUnirest.setTimeouts(0, 0);
\t\tHttpResponse<String> response = ${requestLine}${headerLines.length > 0 ? '\n' + headerLines.join('\n') : ''}${bodyLine}
\t\t\t.asString();

\t\tSystem.out.println(response.getBody());
\t}
}`;
}

function renderRubyNetHttp(descriptor: HttpRequestDescriptor): string {
	const method = descriptor.method.toUpperCase();
	const requestClass =
		method === 'GET'
			? 'Net::HTTP::Get'
			: method === 'POST'
				? 'Net::HTTP::Post'
				: method === 'PUT'
					? 'Net::HTTP::Put'
					: method === 'PATCH'
						? 'Net::HTTP::Patch'
						: method === 'DELETE'
							? 'Net::HTTP::Delete'
							: 'Net::HTTP::Get';

	const headerLines = descriptor.headers.map(
		(h) => `req[${rubyStringLiteral(h.name)}] = ${rubyStringLiteral(h.value)}`
	);
	const hasBody = descriptor.jsonBody !== undefined && descriptor.jsonBody.trim() !== '';
	const bodyLine = hasBody ? `req.body = ${rubyStringLiteral(descriptor.jsonBody!)}\n` : '';
	const headerBlock = headerLines.length > 0 ? `${headerLines.join('\n')}\n` : '';

	return `require 'net/http'
require 'uri'

uri = URI(${rubyStringLiteral(descriptor.url)})
req = ${requestClass}.new(uri)
${bodyLine}${headerBlock}res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
  http.request(req)
end

puts res.body`;
}

export const HTTP_CLIENT_SAMPLES: HttpClientSampleRenderer[] = [
	{ id: 'curl', label: 'cURL', shikiLanguage: 'bash', render: renderCurl },
	{ id: 'python', label: 'Python', shikiLanguage: 'python', render: renderPythonRequests },
	{ id: 'javascript', label: 'JavaScript', shikiLanguage: 'javascript', render: renderJavaScriptFetch },
	{ id: 'php', label: 'PHP', shikiLanguage: 'php', render: renderPhpCurl },
	{ id: 'go', label: 'Go', shikiLanguage: 'go', render: renderGoNetHttp },
	{ id: 'java', label: 'Java', shikiLanguage: 'java', render: renderJavaUnirest },
	{ id: 'ruby', label: 'Ruby', shikiLanguage: 'ruby', render: renderRubyNetHttp }
];

export function renderHttpClientSamples(descriptor: HttpRequestDescriptor): HttpClientSample[] {
	return HTTP_CLIENT_SAMPLES.map((sample) => ({
		id: sample.id,
		label: sample.label,
		code: sample.render(descriptor),
		shikiLanguage: sample.shikiLanguage
	}));
}

/** cURL text for a descriptor (shared by `buildCurlSample` / `buildLiveCurlSample`). */
export function renderCurlFromDescriptor(descriptor: HttpRequestDescriptor): string {
	return renderCurl(descriptor);
}
