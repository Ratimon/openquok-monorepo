import { isExtensionSocialPostingProviderId } from 'openquok-common';

import {
	listAuthCheckOriginsForDashboard,
	resolveApiOriginForDashboard,
} from '../shared/dashboardApiOrigin.js';
import { clearExtensionDashboardSession } from '../shared/clearExtensionDashboardSession.js';
import { findDashboardBridgeSession } from '../shared/dashboardBridgeStorage.js';
import { isDashboardLoggedIn, readAccessTokenCookie } from '../shared/dashboardAuth.js';

const ACTIVE_ORGANIZATION_COOKIE = 'showorg';

export type SocialApiFailure = { ok: false; error: string };

export type SocialSessionContext = {
	dashboardOrigin: string;
	apiOrigin: string;
	accessToken: string;
	organizationId: string;
};

export type SocialIntegrationChannel = {
	id: string;
	name: string;
	identifier: string;
	disabled: boolean;
	inBetweenSteps: boolean;
	refreshNeeded: boolean;
};

export type CreateSocialPostInput = {
	body: string;
	integrationIds: string[];
	scheduledAtIso: string;
	status: 'draft' | 'scheduled';
};

export type CreateSocialPostResult =
	| { ok: true; postGroupId: string | null }
	| SocialApiFailure;

function apiRoot(origin: string): string {
	return `${origin.replace(/\/+$/, '')}/api/v1`;
}

function dashboardOriginFromLoginUrl(loginUrl: string): string {
	return loginUrl.replace(/\/sign-in\/?$/, '');
}

async function readCookiesForOrigin(origin: string): Promise<chrome.cookies.Cookie[]> {
	return chrome.cookies.getAll({ url: origin.replace(/\/+$/, '') });
}

async function readActiveOrganizationId(dashboardOrigin: string): Promise<string | null> {
	const origins = listAuthCheckOriginsForDashboard(dashboardOrigin);
	for (const origin of origins) {
		const cookies = await readCookiesForOrigin(origin);
		const showorg = cookies.find((cookie) => cookie.name === ACTIVE_ORGANIZATION_COOKIE)?.value?.trim();
		if (showorg) return showorg;
	}
	return null;
}

/** Workspace id from `GET /users/me` session fields — never use profile `id` (that is the user id). */
function readWorkspaceIdFromUserMe(data: Record<string, unknown>): string | null {
	const orgId = data.orgId ?? data.organizationId;
	return typeof orgId === 'string' && orgId.trim() ? orgId.trim() : null;
}

function readOrganizationIdFromListRow(data: Record<string, unknown>): string | null {
	const orgId = data.orgId ?? data.organizationId ?? data.id;
	return typeof orgId === 'string' && orgId.trim() ? orgId.trim() : null;
}

type OrganizationResolveResult = string | null | { authFailed: true };

async function resolveOrganizationIdForSession(
	apiOrigin: string,
	accessToken: string,
	dashboardOrigin: string,
	bridgeOrganizationId: string | null | undefined,
	bridgeAccessToken: string | null | undefined
): Promise<OrganizationResolveResult> {
	const hintOrgIds: string[] = [];
	const bridgeOrg = bridgeOrganizationId?.trim();
	const bridgeToken = bridgeAccessToken?.trim();
	if (bridgeOrg && bridgeToken && bridgeToken === accessToken.trim()) {
		hintOrgIds.push(bridgeOrg);
	}
	const fromCookie = await readActiveOrganizationId(dashboardOrigin);
	if (fromCookie && !hintOrgIds.includes(fromCookie)) {
		hintOrgIds.push(fromCookie);
	}

	const orgsResponse = await fetch(`${apiRoot(apiOrigin)}/users/organizations`, {
		method: 'GET',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	let orgsBody: unknown = null;
	try {
		orgsBody = await orgsResponse.json();
	} catch {
		orgsBody = null;
	}
	if (!orgsResponse.ok) {
		if (orgsResponse.status === 401 || orgsResponse.status === 403) return { authFailed: true };
		return null;
	}

	const record = parseJsonRecord(orgsBody);
	const list = record.data;
	const orgIdsFromApi: string[] = [];
	if (Array.isArray(list)) {
		for (const row of list) {
			if (!row || typeof row !== 'object') continue;
			const id = readOrganizationIdFromListRow(row as Record<string, unknown>);
			if (id) orgIdsFromApi.push(id);
		}
	}

	if (orgIdsFromApi.length > 0) {
		for (const hint of hintOrgIds) {
			if (hint && orgIdsFromApi.includes(hint)) return hint;
		}
		return orgIdsFromApi[0];
	}

	const me = await authorizedGet(apiOrigin, accessToken, '/users/me');
	if (!me.ok) {
		if (me.status === 401 || me.status === 403) return { authFailed: true };
	} else {
		const fromMe = readWorkspaceIdFromUserMe(me.data);
		if (fromMe) return fromMe;
	}

	for (const hint of hintOrgIds) {
		if (hint) return hint;
	}

	return null;
}

function parseJsonRecord(body: unknown): Record<string, unknown> {
	return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

function nestedData(record: Record<string, unknown>): Record<string, unknown> {
	const data = record.data;
	return data && typeof data === 'object' ? (data as Record<string, unknown>) : record;
}

function apiErrorMessage(body: unknown, fallback: string): string {
	const record = parseJsonRecord(body);
	const message =
		(typeof record.message === 'string' && record.message) ||
		(typeof record.error === 'string' && record.error) ||
		(typeof record.msg === 'string' && record.msg);
	return message || fallback;
}

async function authorizedGet(
	apiOrigin: string,
	accessToken: string,
	path: string,
	query?: Record<string, string>
): Promise<
	{ ok: true; data: Record<string, unknown> } | (SocialApiFailure & { status?: number })
> {
	const url = new URL(`${apiRoot(apiOrigin)}${path}`);
	if (query) {
		for (const [key, value] of Object.entries(query)) {
			url.searchParams.set(key, value);
		}
	}
	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}
	if (!response.ok) {
		return {
			ok: false,
			error: apiErrorMessage(body, `Request failed (${response.status}).`),
			status: response.status,
		};
	}
	const record = parseJsonRecord(body);
	if (record.success === false) {
		return { ok: false, error: apiErrorMessage(body, 'Request failed.') };
	}
	return { ok: true, data: nestedData(record) };
}

async function authorizedPost(
	apiOrigin: string,
	accessToken: string,
	path: string,
	payload: Record<string, unknown>
): Promise<{ ok: true; data: Record<string, unknown> } | SocialApiFailure> {
	const response = await fetch(`${apiRoot(apiOrigin)}${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(payload),
	});
	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}
	if (!response.ok) {
		return { ok: false, error: apiErrorMessage(body, `Request failed (${response.status}).`) };
	}
	const record = parseJsonRecord(body);
	if (record.success === false) {
		return { ok: false, error: apiErrorMessage(body, 'Request failed.') };
	}
	return { ok: true, data: nestedData(record) };
}

function mapIntegrationRow(row: Record<string, unknown>): SocialIntegrationChannel | null {
	const id = typeof row.id === 'string' ? row.id : '';
	const identifier = typeof row.identifier === 'string' ? row.identifier : '';
	const name = typeof row.name === 'string' ? row.name : identifier;
	if (!id || !identifier) return null;
	return {
		id,
		name,
		identifier,
		disabled: row.disabled === true,
		inBetweenSteps: row.inBetweenSteps === true,
		refreshNeeded: row.refreshNeeded === true,
	};
}

export function isSocialComposerChannel(channel: SocialIntegrationChannel): boolean {
	if (!isExtensionSocialPostingProviderId(channel.identifier)) return false;
	if (channel.disabled || channel.inBetweenSteps || channel.refreshNeeded) return false;
	return true;
}

/**
 * Resolves bearer token + active workspace for Social tab API calls.
 * Session validity uses the same verify-refresh gate as {@link isDashboardLoggedIn}.
 */
export async function resolveSocialSession(): Promise<SocialSessionContext | SocialApiFailure> {
	const auth = await isDashboardLoggedIn();
	if (!auth.loggedIn) {
		return { ok: false, error: 'Sign in to OpenQuok on the dashboard first.' };
	}

	const dashboardOrigin = dashboardOriginFromLoginUrl(auth.loginUrl);
	const originCandidates = listAuthCheckOriginsForDashboard(dashboardOrigin);
	const bridge = await findDashboardBridgeSession(originCandidates);
	const resolvedDashboardOrigin = bridge?.dashboardOrigin ?? dashboardOrigin;

	const readAccessToken = async (): Promise<
		{ ok: true; accessToken: string } | SocialApiFailure
	> => {
		const tokenResult = await readAccessTokenCookie(dashboardOrigin);
		if (!tokenResult) {
			return {
				ok: false,
				error:
					'Could not read your session. Keep the dashboard tab open on this host, then refresh.',
			};
		}
		if ('error' in tokenResult) {
			return { ok: false, error: tokenResult.error };
		}
		return { ok: true, accessToken: tokenResult.accessToken };
	};

	let tokenRead = await readAccessToken();
	if (!tokenRead.ok) return tokenRead;
	let accessToken = tokenRead.accessToken;

	const apiOrigin = await resolveApiOriginForDashboard(resolvedDashboardOrigin);
	let organizationId = await resolveOrganizationIdForSession(
		apiOrigin,
		accessToken,
		resolvedDashboardOrigin,
		bridge?.organizationId,
		bridge?.accessToken
	);

	if (organizationId && typeof organizationId === 'object' && 'authFailed' in organizationId) {
		await clearExtensionDashboardSession(resolvedDashboardOrigin);
		tokenRead = await readAccessToken();
		if (!tokenRead.ok) return tokenRead;
		accessToken = tokenRead.accessToken;
		organizationId = await resolveOrganizationIdForSession(
			apiOrigin,
			accessToken,
			resolvedDashboardOrigin,
			null,
			null
		);
	}

	if (!organizationId || (typeof organizationId === 'object' && 'authFailed' in organizationId)) {
		if (organizationId && typeof organizationId === 'object' && 'authFailed' in organizationId) {
			return {
				ok: false,
				error: 'Session expired. Sign in on the dashboard again, then refresh this panel.',
			};
		}
		return {
			ok: false,
			error:
				'No workspace found. Create or join a workspace in the dashboard, then refresh this panel.',
		};
	}

	return {
		dashboardOrigin: resolvedDashboardOrigin,
		apiOrigin,
		accessToken,
		organizationId,
	};
}

export async function listSocialIntegrations(
	session: SocialSessionContext
): Promise<{ ok: true; channels: SocialIntegrationChannel[] } | SocialApiFailure> {
	const result = await authorizedGet(session.apiOrigin, session.accessToken, '/integrations/list', {
		organizationId: session.organizationId,
	});
	if (!result.ok) return result;

	const integrations = result.data.integrations;
	if (!Array.isArray(integrations)) {
		return { ok: false, error: 'Could not load channels.' };
	}

	const channels: SocialIntegrationChannel[] = [];
	for (const row of integrations) {
		if (!row || typeof row !== 'object') continue;
		const mapped = mapIntegrationRow(row as Record<string, unknown>);
		if (mapped && isExtensionSocialPostingProviderId(mapped.identifier)) {
			channels.push(mapped);
		}
	}

	channels.sort((a, b) => a.name.localeCompare(b.name));
	return { ok: true, channels };
}

export async function findSuggestedScheduleSlot(
	session: SocialSessionContext
): Promise<{ ok: true; scheduledAtIso: string } | SocialApiFailure> {
	const result = await authorizedGet(session.apiOrigin, session.accessToken, '/posts/find-slot', {
		organizationId: session.organizationId,
	});
	if (!result.ok) return result;
	const date = result.data.date;
	if (typeof date !== 'string' || !date.trim()) {
		return { ok: false, error: 'Could not suggest a schedule time.' };
	}
	return { ok: true, scheduledAtIso: date.trim() };
}

/**
 * Schedules or drafts via the session API (server publish path).
 * Future in-browser send for cookie-session channels goes through {@link getBrowserPublishPort}
 * in `browserPublishPort.ts` — not wired here in v1.
 */
export async function createSocialPost(
	session: SocialSessionContext,
	input: CreateSocialPostInput
): Promise<CreateSocialPostResult> {
	const body = input.body.trim();
	if (!body) {
		return { ok: false, error: 'Write something to post.' };
	}
	if (input.integrationIds.length === 0) {
		return { ok: false, error: 'Select at least one channel.' };
	}
	if (!input.scheduledAtIso.trim()) {
		return { ok: false, error: 'Pick a schedule time.' };
	}

	const result = await authorizedPost(session.apiOrigin, session.accessToken, '/posts', {
		organizationId: session.organizationId,
		body,
		integrationIds: input.integrationIds,
		isGlobal: true,
		scheduledAt: input.scheduledAtIso,
		repeatInterval: null,
		tagNames: [],
		status: input.status,
	});
	if (!result.ok) return result;

	const postGroup = result.data.postGroup;
	const postGroupId =
		postGroup && typeof postGroup === 'object' && typeof (postGroup as { id?: string }).id === 'string'
			? (postGroup as { id: string }).id
			: null;

	return { ok: true, postGroupId };
}

export function isoToDatetimeLocalValue(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	const pad = (value: number) => String(value).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function datetimeLocalToIso(local: string): string | null {
	const date = new Date(local);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString();
}

/** Fallback when find-slot is unavailable (tomorrow 10:00 local). */
export function defaultComposerScheduleLocal(): string {
	const next = new Date();
	next.setDate(next.getDate() + 1);
	next.setHours(10, 0, 0, 0);
	return isoToDatetimeLocalValue(next.toISOString());
}
