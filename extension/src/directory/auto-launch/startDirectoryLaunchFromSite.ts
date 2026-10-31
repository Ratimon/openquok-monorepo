import {
	coerceAutoLaunchHandoffRequestFields,
	getDirectoryLaunchProvider,
	type AutoLaunchHandoffRequestFields,
} from 'openquok-common';

import { isSocialApiFailure, resolveSocialSession } from '../../social/openquokSocialApi.js';
import {
	AUTO_LAUNCH_PROFILES_PATH,
	AUTO_LAUNCH_SUBMISSION_INTENT_PATH,
} from './constants.js';

type ApiListResponse<T> = {
	success?: boolean;
	data?: T;
	message?: string;
	error?: string;
};

type ProductProfileRow = {
	id: string;
	profileKind?: string;
};

type SubmissionIntentRow = {
	submissionId: string;
	launchToken: string;
	startUrl: string;
	providerSlug: string;
	profileSnapshot: Record<string, unknown>;
	extensionConfig: Record<string, unknown>;
};

function apiRoot(origin: string): string {
	return `${origin.replace(/\/+$/, '')}/api/v1`;
}

/** Prefer a main business profile; backend resolves directory variants at intent time. */
export function pickMainProductProfileId(profiles: ProductProfileRow[]): string | null {
	if (profiles.length === 0) return null;
	const mains = profiles.filter((row) => row.profileKind !== 'directory_variant');
	const pool = mains.length > 0 ? mains : profiles;
	return pool[0]?.id ?? null;
}

async function fetchJson<T>(
	url: string,
	accessToken: string,
	init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
	const response = await fetch(url, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
			...(init?.headers ?? {}),
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
	const list = record as ApiListResponse<T>;
	const data = (list.data ?? record) as T;
	return { ok: true, data };
}

/**
 * Start (or refresh) a directory launch from the extension while the user is already on a directory site.
 * Requires OpenQuok sign-in and at least one product profile in the workspace.
 */
export async function buildDirectoryLaunchHandoffFromSite(
	providerSlug: string
): Promise<
	| { ok: true; fields: AutoLaunchHandoffRequestFields; dashboardOrigin: string }
	| { ok: false; error: string }
> {
	const provider = getDirectoryLaunchProvider(providerSlug);
	if (!provider) {
		return { ok: false, error: 'Unknown directory channel.' };
	}

	const sessionResult = await resolveSocialSession();
	if (isSocialApiFailure(sessionResult)) {
		return { ok: false, error: sessionResult.error };
	}

	const { apiOrigin, accessToken, organizationId, dashboardOrigin } = sessionResult;
	const profilesUrl = `${apiRoot(apiOrigin)}${AUTO_LAUNCH_PROFILES_PATH}?organizationId=${encodeURIComponent(organizationId)}`;
	const profilesResult = await fetchJson<ProductProfileRow[]>(profilesUrl, accessToken);
	if (!profilesResult.ok) {
		return { ok: false, error: profilesResult.error };
	}

	const productProfileId = pickMainProductProfileId(
		Array.isArray(profilesResult.data) ? profilesResult.data : []
	);
	if (!productProfileId) {
		return {
			ok: false,
			error: 'Create a product profile on OpenQuok (My Products), then try this channel again.',
		};
	}

	const intentUrl = `${apiRoot(apiOrigin)}${AUTO_LAUNCH_SUBMISSION_INTENT_PATH}`;
	const intentResult = await fetchJson<SubmissionIntentRow>(intentUrl, accessToken, {
		method: 'POST',
		body: JSON.stringify({
			organizationId,
			productProfileId,
			providerSlug,
		}),
	});
	if (!intentResult.ok) {
		return { ok: false, error: intentResult.error };
	}

	const intent = intentResult.data;
	const fields = coerceAutoLaunchHandoffRequestFields({
		submissionId: intent.submissionId,
		launchToken: intent.launchToken,
		providerSlug: intent.providerSlug,
		startUrl: intent.startUrl,
		profileSnapshot: intent.profileSnapshot,
		extensionConfig: intent.extensionConfig,
		skipStartUrlTabOpen: true,
	});
	if (!fields) {
		return { ok: false, error: 'Could not read launch data from OpenQuok.' };
	}

	return { ok: true, fields, dashboardOrigin };
}
