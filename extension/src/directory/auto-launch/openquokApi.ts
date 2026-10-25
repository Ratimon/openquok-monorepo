import { resolveApiOriginForDashboard } from '../../shared/dashboardApiOrigin.js';
import { readAccessTokenCookie } from '../../shared/dashboardAuth.js';
import { AUTO_LAUNCH_COMPLETE_PATH } from './constants.js';

function apiRoot(origin: string): string {
	return `${origin.replace(/\/+$/, '')}/api/v1`;
}

export type CompleteSubmissionInput = {
	dashboardOrigin: string;
	launchToken: string;
	listingUrl?: string;
	evidence?: Record<string, unknown>;
};

export type CompleteSubmissionResult =
	| { ok: true; submissionId: string; alreadyCompleted?: boolean }
	| { ok: false; error: string };

export async function postCompleteSubmission(
	input: CompleteSubmissionInput
): Promise<CompleteSubmissionResult> {
	const accessToken = await readAccessTokenCookie(input.dashboardOrigin);
	if (!accessToken) {
		return {
			ok: false,
			error: 'Sign in to OpenQuok in your browser, then try again.',
		};
	}

	const apiOrigin = await resolveApiOriginForDashboard(input.dashboardOrigin);
	const url = `${apiRoot(apiOrigin)}${AUTO_LAUNCH_COMPLETE_PATH}`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify({
			launchToken: input.launchToken,
			listingUrl: input.listingUrl,
			evidence: input.evidence ?? {},
		}),
	});

	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}

	if (!response.ok) {
		const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
		const message =
			(typeof record.message === 'string' && record.message) ||
			(typeof record.error === 'string' && record.error) ||
			`Complete failed (${response.status}).`;
		return { ok: false, error: message };
	}

	const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
	const data =
		record.data && typeof record.data === 'object'
			? (record.data as Record<string, unknown>)
			: record;
	const submissionId = typeof data.submissionId === 'string' ? data.submissionId : '';

	return {
		ok: true,
		submissionId,
		alreadyCompleted: data.alreadyCompleted === true,
	};
}
