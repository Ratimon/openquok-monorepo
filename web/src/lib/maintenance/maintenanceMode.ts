import { getRootPathAdminArea } from '$lib/area-admin/constants/getRootPathAdminArea';
import { getRootPathEditorArea } from '$lib/area-admin/constants/getRootPathEditorArea';
import { getRootPathSecretAdminArea } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
import {
	getRootPathAuthError,
	getRootPathCliDevice,
	getRootPathConfirmChangePassword,
	getRootPathForgotPassword,
	getRootPathJoinOrg,
	getRootPathSignin,
	getRootPathSignup,
	getRootPathUpdatePassword,
	getRootPathVerifySignup
} from '$lib/user-auth/constants/getRootpathUserAuth';
import { route } from '$lib/utils/path';

export const MAINTENANCE_MODES = ['off', 'banner', 'freeze_writes'] as const;

export type MaintenanceMode = (typeof MAINTENANCE_MODES)[number];

/** Route segment for the write-freeze landing page (no leading slash). */
export function getRootPathMaintenance(): string {
	return 'maintenance';
}

export function parseMaintenanceMode(raw: string | undefined | null): MaintenanceMode {
	const normalized = String(raw ?? '').trim().toLowerCase();
	if (normalized === 'banner' || normalized === 'freeze_writes') {
		return normalized;
	}
	return 'off';
}

export function isWriteFreezeMode(mode: string | undefined | null): boolean {
	return parseMaintenanceMode(mode) === 'freeze_writes';
}

function normalizePathname(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith('/')) {
		return pathname.slice(0, -1);
	}
	return pathname || '/';
}

function pathnameMatchesSegment(pathname: string, segment: string): boolean {
	const prefix = route(segment);
	const normalized = normalizePathname(pathname);
	return normalized === prefix || normalized.startsWith(`${prefix}/`);
}

/** Auth, app, and operator surfaces redirected to `/maintenance` during `freeze_writes`. */
export function writeFreezeRedirectSegments(): string[] {
	return [
		getRootPathSignin(),
		getRootPathSignup(),
		getRootPathForgotPassword(),
		getRootPathUpdatePassword(),
		getRootPathVerifySignup(),
		getRootPathConfirmChangePassword(),
		getRootPathAuthError(),
		getRootPathJoinOrg(),
		'oauth',
		getRootPathCliDevice(),
		getRootPathAccount(),
		getRootPathEditorArea(),
		getRootPathAdminArea(),
		getRootPathSecretAdminArea()
	];
}

export function shouldRedirectToMaintenance(pathname: string): boolean {
	const normalized = normalizePathname(pathname);
	if (normalized === route(getRootPathMaintenance())) return false;
	if (normalized === '/api' || normalized.startsWith('/api/')) return false;
	if (normalized === '/uploads' || normalized.startsWith('/uploads/')) return false;
	return writeFreezeRedirectSegments().some((segment) => pathnameMatchesSegment(normalized, segment));
}
