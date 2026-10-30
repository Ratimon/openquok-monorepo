import { isExtensionSocialPostingProviderId } from 'openquok-common';

import { fetchComposerMediaFileFromUrl } from './fetchComposerMediaFromUrl.js';
import { uploadComposerMediaMultipart } from './composerMediaUpload.js';
import type { ComposerMediaUploadProgress } from './composerMediaUpload.js';
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

export type SocialIntegrationChannelGroup = {
	id: string;
	name: string;
};

export type SocialIntegrationChannel = {
	id: string;
	name: string;
	identifier: string;
	picture: string | null;
	group: SocialIntegrationChannelGroup | null;
	disabled: boolean;
	inBetweenSteps: boolean;
	refreshNeeded: boolean;
	unschedulableReason: string | null;
};

export type SocialComposerMediaItem = {
	/** Stable client id for the thumbnail strip (remove, keys). */
	id: string;
	/** Set after a successful upload when scheduling or publishing. */
	mediaId?: string;
	path?: string;
	previewUrl?: string;
	/** Local file — preview only until Schedule / Draft / Publish. */
	pendingFile?: File;
	/** Context-menu image URL — fetched and uploaded on submit. */
	pendingSourceUrl?: string;
};

export type CreateSocialPostInput = {
	body: string;
	integrationIds: string[];
	scheduledAtIso: string;
	status: 'draft' | 'scheduled';
	media?: { id: string; path: string }[];
};

export type ComposerMediaUploadResult =
	| { ok: true; id: string; path: string; publicUrl?: string }
	| SocialApiFailure;

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

function readIntegrationGroup(row: Record<string, unknown>): SocialIntegrationChannelGroup | null {
	const raw =
		(row.group && typeof row.group === 'object' ? row.group : null) ??
		(row.customer && typeof row.customer === 'object' ? row.customer : null);
	if (!raw || typeof raw !== 'object') return null;
	const record = raw as Record<string, unknown>;
	const id = typeof record.id === 'string' ? record.id.trim() : '';
	const name = typeof record.name === 'string' ? record.name.trim() : '';
	if (!id) return null;
	return { id, name: name || id };
}

function readIntegrationPicture(row: Record<string, unknown>): string | null {
	const picture = row.picture;
	if (typeof picture !== 'string') return null;
	const trimmed = picture.trim();
	return trimmed ? trimmed : null;
}

function integrationUnschedulableReason(
	disabled: boolean,
	inBetweenSteps: boolean,
	refreshNeeded: boolean
): string | null {
	if (disabled) return 'This channel is disabled.';
	if (inBetweenSteps) return 'Finish connecting this channel first.';
	if (refreshNeeded) return 'Reconnect this channel first.';
	return null;
}

/** Maps a `/integrations/list` row into a social channel view model. */
export function mapIntegrationRow(row: Record<string, unknown>): SocialIntegrationChannel | null {
	const id = typeof row.id === 'string' ? row.id : '';
	const identifier = typeof row.identifier === 'string' ? row.identifier : '';
	const name = typeof row.name === 'string' ? row.name : identifier;
	if (!id || !identifier) return null;
	const disabled = row.disabled === true;
	const inBetweenSteps = row.inBetweenSteps === true;
	const refreshNeeded = row.refreshNeeded === true;
	return {
		id,
		name,
		identifier,
		picture: readIntegrationPicture(row),
		group: readIntegrationGroup(row),
		disabled,
		inBetweenSteps,
		refreshNeeded,
		unschedulableReason: integrationUnschedulableReason(disabled, inBetweenSteps, refreshNeeded),
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

export async function uploadComposerMediaFile(
	session: SocialSessionContext,
	file: File,
	opts?: { virtualPath?: string; onProgress?: (progress: ComposerMediaUploadProgress) => void }
): Promise<ComposerMediaUploadResult> {
	return uploadComposerMediaMultipart(
		session.apiOrigin,
		session.accessToken,
		session.organizationId,
		file,
		opts
	);
}

/**
 * Fetches a remote http(s) asset in the extension context and uploads it via the session media API.
 */
export async function uploadComposerMediaFromUrl(
	session: SocialSessionContext,
	url: string
): Promise<ComposerMediaUploadResult> {
	const fetched = await fetchComposerMediaFileFromUrl(url);
	if (!fetched.ok) {
		return { ok: false, error: fetched.error };
	}
	return uploadComposerMediaFile(session, fetched.file);
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
	const media = (input.media ?? []).filter(
		(item) => typeof item.id === 'string' && item.id.trim() && typeof item.path === 'string' && item.path.trim()
	);
	if (!body && media.length === 0) {
		return { ok: false, error: 'Write something to post or attach media.' };
	}
	if (input.integrationIds.length === 0) {
		return { ok: false, error: 'Select at least one channel.' };
	}
	if (!input.scheduledAtIso.trim()) {
		return { ok: false, error: 'Pick a schedule time.' };
	}

	const payload: Record<string, unknown> = {
		organizationId: session.organizationId,
		body,
		integrationIds: input.integrationIds,
		isGlobal: true,
		scheduledAt: input.scheduledAtIso,
		repeatInterval: null,
		tagNames: [],
		status: input.status,
	};
	if (media.length > 0) {
		payload.media = media.map((item) => ({ id: item.id.trim(), path: item.path.trim() }));
	}

	const result = await authorizedPost(session.apiOrigin, session.accessToken, '/posts', payload);
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
