import { resolveApiOriginForDashboard } from '../../shared/dashboardApiOrigin.js';
import { readAccessTokenCookie } from '../../shared/dashboardAuth.js';
import { resolveSocialSession, isSocialApiFailure } from '../../social/openquokSocialApi.js';

import { AUTO_LAUNCH_PROFILES_PATH } from './constants.js';
import type { ApiProductProfileRow } from './profileSourceOptions.js';

function apiRoot(origin: string): string {
	return `${origin.replace(/\/+$/, '')}/api/v1`;
}

type ApiListResponse<T> = {
	success?: boolean;
	data?: T;
	message?: string;
	error?: string;
};

/** List product profiles for the signed-in workspace (extension background / dashboard flows). */
export async function fetchOrganizationProductProfiles(): Promise<
	{ ok: true; profiles: ApiProductProfileRow[] } | { ok: false; error: string }
> {
	const sessionResult = await resolveSocialSession();
	if (isSocialApiFailure(sessionResult)) {
		return { ok: false, error: sessionResult.error };
	}

	const { organizationId, dashboardOrigin } = sessionResult;
	const tokenResult = await readAccessTokenCookie(dashboardOrigin);
	if (!tokenResult || 'error' in tokenResult) {
		return {
			ok: false,
			error:
				(typeof tokenResult === 'object' && tokenResult && 'error' in tokenResult
					? tokenResult.error
					: undefined) ?? 'Sign in to OpenQuok in your browser, then try again.',
		};
	}

	const apiOriginResolved = await resolveApiOriginForDashboard(dashboardOrigin);
	const url = `${apiRoot(apiOriginResolved)}${AUTO_LAUNCH_PROFILES_PATH}?organizationId=${encodeURIComponent(organizationId)}`;
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${tokenResult.accessToken}`,
			'Content-Type': 'application/json',
		},
	});

	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}

	const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
	if (!response.ok) {
		const message =
			(typeof record.message === 'string' && record.message) ||
			(typeof record.error === 'string' && record.error) ||
			`Request failed (${response.status}).`;
		return { ok: false, error: message };
	}

	const list = record as ApiListResponse<ApiProductProfileRow[]>;
	const data = Array.isArray(list.data) ? list.data : (record.data as ApiProductProfileRow[] | undefined);
	return { ok: true, profiles: Array.isArray(data) ? data : [] };
}
