import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';
import { normalizeApiBaseUrl } from '$lib/utils/path';

export function mediaUploadApiUrl(path: string): string {
	const raw = String(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default ?? '');
	const base = normalizeApiBaseUrl(raw);
	const p = path.startsWith('/') ? path : `/${path}`;
	return base ? `${base}${p}` : p;
}

export async function postMediaUploadJson(params: {
	path: string;
	token: string | null;
	body: unknown;
}): Promise<Record<string, unknown>> {
	const res = await fetch(mediaUploadApiUrl(params.path), {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(params.token ? { Authorization: `Bearer ${params.token}` } : {})
		},
		credentials: 'include',
		body: JSON.stringify(params.body)
	});
	const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
	if (!res.ok) {
		const msg =
			(typeof json?.message === 'string' && json.message) ||
			(typeof json?.msg === 'string' && json.msg) ||
			`Request failed with status ${res.status}`;
		throw new Error(msg);
	}
	return json ?? {};
}
