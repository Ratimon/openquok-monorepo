import { normalizeApiBaseUrl } from '$lib/utils/path';

/**
 * HTTP methods
 */
export enum HttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
	HEAD = 'HEAD',
	OPTIONS = 'OPTIONS'
}

/**
 * API request options
 */
export interface ApiRequestOptions {
	url: string;
	method: HttpMethod;
	headers?: Record<string, string>;
	params?: Record<string, string | number | boolean | null | undefined>;
	data?: unknown;
	withCredentials?: boolean;
	timeout?: number;
	responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
	retries?: number;
	retryDelay?: number;
	skipInterceptors?: boolean;
	cache?: RequestCache;
	signal?: AbortSignal;
	/** When provided (e.g. from SvelteKit load), use this instead of global fetch for correct cookie/URL handling */
	fetch?: typeof globalThis.fetch;
}

/**
 * API response
 */
export interface ApiResponse<T = unknown> {
	status: number;
	statusText: string;
	headers: Record<string, string>;
	data: T;
	request: ApiRequestOptions;
	ok: boolean;
}

/**
 * API error
 */
/** User-facing message from a failed API response body. */
export function messageFromApiError(error: unknown, fallback: string): string {
	if (error instanceof ApiError && typeof error.data === 'object' && error.data !== null) {
		const body = error.data as Record<string, unknown>;
		if (typeof body.message === 'string' && body.message.trim()) {
			return body.message;
		}
		const nested = body.error;
		if (typeof nested === 'object' && nested !== null && 'message' in nested) {
			const nestedMessage = (nested as { message?: unknown }).message;
			if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
				return nestedMessage;
			}
		}
	}
	return fallback;
}

const UUID_PATTERN =
	/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

const API_ERROR_CODE_MESSAGES: Record<string, string> = {
	ORGANIZATION_NOT_FOUND: 'This workspace could not be found.',
	ORGANIZATION_FORBIDDEN: 'You do not have access to this workspace.'
};

function apiErrorCodeFromBody(error: ApiError): string | undefined {
	if (error.code) return error.code;
	if (typeof error.data !== 'object' || error.data === null) return undefined;
	const body = error.data as Record<string, unknown>;
	const nested = body.error;
	if (typeof nested === 'object' && nested !== null) {
		const errorCode = (nested as Record<string, unknown>).errorCode;
		if (typeof errorCode === 'string') return errorCode;
	}
	return undefined;
}

/** Toast-safe API error text: known codes, no UUIDs, no raw server identifiers. */
function sanitizeUserFacingMessage(message: string, fallback: string): string {
	const trimmed = message.trim();
	if (!trimmed) return fallback;

	if (UUID_PATTERN.test(trimmed)) {
		UUID_PATTERN.lastIndex = 0;
		const withoutIds = trimmed
			.replace(UUID_PATTERN, '')
			.replace(/\s{2,}/g, ' ')
			.replace(/:\s*$/, '')
			.trim();
		if (/^organization not found/i.test(withoutIds)) {
			return API_ERROR_CODE_MESSAGES.ORGANIZATION_NOT_FOUND;
		}
		if (/^user not found/i.test(withoutIds)) {
			return 'User not found.';
		}
		return withoutIds || fallback;
	}

	return trimmed;
}

export function userFacingApiErrorMessage(error: unknown, fallback: string): string {
	if (!(error instanceof ApiError)) return fallback;
	const code = apiErrorCodeFromBody(error);
	if (code && API_ERROR_CODE_MESSAGES[code]) {
		return API_ERROR_CODE_MESSAGES[code];
	}
	return sanitizeUserFacingMessage(messageFromApiError(error, fallback), fallback);
}

export class ApiError extends Error {
	public status: number;
	public statusText: string;
	public data: unknown;
	public request: ApiRequestOptions;
	public code?: string;

	constructor(message: string, response: ApiResponse) {
		super(message);
		this.name = 'ApiError';
		this.status = response.status;
		this.statusText = response.statusText;
		this.data = response.data;
		this.request = response.request;
		if (
			typeof this.data === 'object' &&
			this.data !== null &&
			'code' in this.data &&
			typeof (this.data as Record<string, unknown>).code === 'string'
		) {
			this.code = (this.data as Record<string, unknown>).code as string;
		}
	}
}

export type RequestInterceptor = (
	options: ApiRequestOptions
) => Promise<ApiRequestOptions> | ApiRequestOptions;

export type ResponseInterceptor = <T>(response: ApiResponse<T>) => Promise<ApiResponse<T>> | ApiResponse<T>;

export type ErrorInterceptor = (error: ApiError) => Promise<ApiResponse | ApiError> | ApiResponse | ApiError;

export class HttpGateway {
	private baseUrl: string;
	private defaultOptions: Partial<ApiRequestOptions>;
	private requestInterceptors: RequestInterceptor[];

	constructor(baseUrl = '', defaultOptions: Partial<ApiRequestOptions> = {}) {
		this.baseUrl = normalizeApiBaseUrl(baseUrl);
		this.defaultOptions = {
			method: HttpMethod.GET,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			responseType: 'json',
			retries: 0,
			retryDelay: 1000,
			...defaultOptions
		};
		this.requestInterceptors = [];
	}

	public addRequestInterceptor(interceptor: RequestInterceptor): () => void {
		this.requestInterceptors.push(interceptor);
		return () => {
			const index = this.requestInterceptors.indexOf(interceptor);
			if (index !== -1) this.requestInterceptors.splice(index, 1);
		};
	}

	public async request<T = unknown>(options: Partial<ApiRequestOptions>): Promise<ApiResponse<T>> {
		let requestOptions = this.prepareRequestOptions(options);
		if (!requestOptions.skipInterceptors) {
			for (const interceptor of this.requestInterceptors) {
				requestOptions = await interceptor(requestOptions);
			}
		}
		return this.executeRequest<T>(requestOptions);
	}

	private async executeRequest<T = unknown>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
		const { url, method, data, params, withCredentials, responseType, fetch: customFetch } = options;
		const headers: Record<string, string> = { ...(options.headers ?? {}) };

		// Multipart uploads: default Content-Type is application/json; if we keep it, fetch may not
		// send FormData correctly and the server never sees req.file / multer fields.
		if (data instanceof FormData) {
			delete headers['Content-Type'];
			delete headers['content-type'];
		}

		const fullUrl = this.buildUrl(url, params);
		const contentType = headers['Content-Type'] ?? headers['content-type'] ?? '';
		const fetchOptions: RequestInit = {
			method,
			headers,
			credentials: withCredentials ? 'include' : 'same-origin'
		};
		if (method !== HttpMethod.GET && data !== undefined) {
			if (data instanceof FormData) {
				fetchOptions.body = data;
			} else if (contentType.includes('application/json')) {
				fetchOptions.body = JSON.stringify(data);
			} else {
				fetchOptions.body = data as BodyInit;
			}
		}
		const fetchFn = customFetch ?? (typeof globalThis !== 'undefined' ? globalThis.fetch : undefined);
		if (!fetchFn) throw new Error('No fetch implementation available');
		const res = await fetchFn(fullUrl, fetchOptions);
		const responseHeaders: Record<string, string> = {};
		res.headers.forEach((v, k) => {
			responseHeaders[k] = v;
		});

		const effectiveType = responseType ?? 'json';
		let responseData: T;
		if (effectiveType === 'blob') {
			responseData = (await res.blob()) as T;
		} else if (effectiveType === 'arraybuffer') {
			responseData = (await res.arrayBuffer()) as T;
		} else {
			const text = await res.text();
			responseData = (effectiveType === 'json' && text ? JSON.parse(text) : text) as T;
		}

		const response: ApiResponse<T> = {
			status: res.status,
			statusText: res.statusText,
			headers: responseHeaders,
			data: responseData,
			request: options,
			ok: res.ok
		};
		if (!res.ok) throw new ApiError(`Request failed with status ${res.status}`, response);
		return response;
	}

	private prepareRequestOptions(options: Partial<ApiRequestOptions>): ApiRequestOptions {
		return {
			...this.defaultOptions,
			...options,
			headers: { ...this.defaultOptions.headers, ...options.headers }
		} as ApiRequestOptions;
	}

	private buildUrl(
		url: string,
		params?: Record<string, string | number | boolean | null | undefined>
	): string {
		const base = this.baseUrl;
		const path = url.startsWith('/') ? url : `/${url}`;
		let full = `${base}${path}`;
		if (params && Object.keys(params).length > 0) {
			const sp = new URLSearchParams();
			Object.entries(params).forEach(([k, v]) => {
				if (v !== undefined && v !== null) sp.append(k, String(v));
			});
			const q = sp.toString();
			if (q) full += (full.includes('?') ? '&' : '?') + q;
		}
		return full;
	}

	public async get<T = unknown>(
		url: string,
		params?: Record<string, string | number | boolean | null | undefined>,
		options?: Partial<ApiRequestOptions>
	): Promise<ApiResponse<T>> {
		return this.request<T>({ method: HttpMethod.GET, url, params, ...options });
	}

	public async post<T = unknown>(
		url: string,
		data?: unknown,
		options?: Partial<ApiRequestOptions>
	): Promise<ApiResponse<T>> {
		return this.request<T>({ method: HttpMethod.POST, url, data, ...options });
	}

	public async put<T = unknown>(
		url: string,
		data?: unknown,
		options?: Partial<ApiRequestOptions>
	): Promise<ApiResponse<T>> {
		return this.request<T>({ method: HttpMethod.PUT, url, data, ...options });
	}

	public async delete<T = unknown>(
		url: string,
		options?: Partial<ApiRequestOptions>
	): Promise<ApiResponse<T>> {
		return this.request<T>({ method: HttpMethod.DELETE, url, ...options });
	}
}
