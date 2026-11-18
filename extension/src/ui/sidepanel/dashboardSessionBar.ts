import { formatSocialConnectionLabel } from '../../shared/dashboardConnectionLabel.js';
import {
	getPreferredDashboardOrigin,
	rememberDashboardOrigin,
} from '../../shared/dashboardOriginStorage.js';
import { clearPausedSocialDashboardOrigin } from '../../shared/dashboardSocialDisconnect.js';
import { hasDashboardSessionCookie, isDashboardLoggedIn } from '../../shared/dashboardAuth.js';
import { listAuthCheckOriginsForDashboard } from '../../shared/dashboardApiOrigin.js';
import {
	requestDashboardSessionSyncFromOpenTabs,
	waitMs,
} from '../../shared/requestDashboardSessionSync.js';
import {
	detachSocialDashboardExtension,
	disconnectSocialDashboardSession,
} from '../../shared/dashboardSocialDisconnect.js';
import {
	DEFAULT_SELF_HOST_DASHBOARD_INPUT,
	normalizeSelfHostDashboardInput,
	openDashboardUrl,
	parseDashboardSignInInput,
	PRODUCTION_DASHBOARD_SIGN_IN_URL,
} from '../../shared/openDashboardUrl.js';
import { resolveSocialSession } from '../../social/openquokSocialApi.js';
import { el, escapeHtml } from './uiHelpers.js';

export type DashboardSessionSnapshot = {
	status: 'checking' | 'signed_out' | 'signed_in';
	dashboardOrigin: string | null;
	loginUrl: string;
};

export type DashboardSessionBarController = {
	refresh: (opts?: { requestDashboardSync?: boolean }) => Promise<void>;
	subscribe: (listener: (snapshot: DashboardSessionSnapshot) => void) => () => void;
	getSnapshot: () => DashboardSessionSnapshot;
};

export type MountDashboardSessionBarOptions = {
	onDisconnected?: () => void;
};

function dashboardOriginFromLoginUrl(loginUrl: string): string {
	return new URL(loginUrl).origin;
}

const DEFAULT_LOGIN_URL = PRODUCTION_DASHBOARD_SIGN_IN_URL;

function defaultSnapshot(): DashboardSessionSnapshot {
	return {
		status: 'checking',
		dashboardOrigin: null,
		loginUrl: DEFAULT_LOGIN_URL,
	};
}

export function mountDashboardSessionBar(
	root: HTMLElement,
	options?: MountDashboardSessionBarOptions
): DashboardSessionBarController {
	let snapshot = defaultSnapshot();
	let selfHostInput = DEFAULT_SELF_HOST_DASHBOARD_INPUT;
	let gateError = '';
	let disconnectInFlight = false;
	const listeners = new Set<(s: DashboardSessionSnapshot) => void>();

	const notify = (): void => {
		for (const listener of listeners) {
			listener(snapshot);
		}
	};

	const setSnapshot = (next: DashboardSessionSnapshot): void => {
		snapshot = next;
		notify();
	};

	function applySelfHostFieldNormalization(raw: string): string {
		const normalized = normalizeSelfHostDashboardInput(raw);
		selfHostInput = normalized;
		return normalized;
	}

	async function dashboardSessionExistsForSelfHostInput(raw: string): Promise<boolean> {
		const signInUrl = parseDashboardSignInInput(raw);
		if (!signInUrl) return false;
		const origin = new URL(signInUrl).origin;
		for (const checkOrigin of listAuthCheckOriginsForDashboard(origin)) {
			if (await hasDashboardSessionCookie(checkOrigin)) return true;
		}
		return false;
	}

	async function prepareSelfHostReconnectHints(): Promise<void> {
		const signInUrl = parseDashboardSignInInput(applySelfHostFieldNormalization(selfHostInput));
		if (!signInUrl) return;
		try {
			const origin = new URL(signInUrl).origin;
			await rememberDashboardOrigin(origin);
			await clearPausedSocialDashboardOrigin(origin);
		} catch {
			/* ignore */
		}
	}

	async function connectSelfHostDashboard(raw: string): Promise<void> {
		const normalized = applySelfHostFieldNormalization(raw);
		const signInUrl = parseDashboardSignInInput(normalized);
		if (!signInUrl) {
			gateError = 'Enter a valid dashboard URL (e.g. https://localhost:5173).';
			renderBar();
			return;
		}
		gateError = '';
		await prepareSelfHostReconnectHints();
		if (await dashboardSessionExistsForSelfHostInput(normalized)) {
			await refreshSafe();
			return;
		}
		await openDashboardUrl(normalized);
	}

	function renderChecking(): void {
		root.replaceChildren(
			el(`
				<div class="dashboard-session-bar" role="status">
					<p class="status muted">Checking your OpenQuok session…</p>
				</div>
			`)
		);
	}

	function renderSignedOutGate(): void {
		root.replaceChildren(
			el(`
				<div class="dashboard-session-bar">
					<div class="sign-in-banner" role="alert">
						<p class="sign-in-banner-kicker">Connect to OpenQuok</p>
						<p class="sign-in-banner-text">Sign in on the dashboard to schedule posts and pick connected channels.</p>
						<button type="button" id="dashboard-sign-in-cloud" class="primary sign-in-banner-action">Connect to Openquok.com</button>
					</div>
					<div class="gate-selfhost gate-selfhost--session-bar">
						<label class="field-label" for="dashboard-selfhost-url">Self host</label>
						<input
							id="dashboard-selfhost-url"
							class="gate-selfhost-input"
							type="text"
							spellcheck="false"
							autocomplete="off"
							placeholder="https://localhost:5173"
							value="${escapeHtml(selfHostInput)}"
						/>
						<button type="button" id="dashboard-sign-in-selfhost" class="secondary">Connect to self host</button>
					</div>
					${gateError ? `<p class="error" role="alert">${escapeHtml(gateError)}</p>` : ''}
					<button type="button" id="dashboard-gate-refresh" class="secondary gate-refresh">Refresh after sign-in</button>
				</div>
			`)
		);

		const selfHostEl = root.querySelector<HTMLInputElement>('#dashboard-selfhost-url');
		if (selfHostEl) {
			selfHostEl.addEventListener('input', () => {
				selfHostInput = selfHostEl.value;
				gateError = '';
			});
			selfHostEl.addEventListener('blur', () => {
				const normalized = applySelfHostFieldNormalization(selfHostEl.value);
				if (normalized !== selfHostEl.value) {
					selfHostEl.value = normalized;
				}
			});
		}

		root.querySelector('#dashboard-sign-in-cloud')?.addEventListener('click', () => {
			gateError = '';
			void openDashboardUrl(PRODUCTION_DASHBOARD_SIGN_IN_URL);
		});

		root.querySelector('#dashboard-gate-refresh')?.addEventListener('click', () => {
			void prepareSelfHostReconnectHints().then(() => refreshSafe({ requestDashboardSync: true }));
		});

		root.querySelector('#dashboard-sign-in-selfhost')?.addEventListener('click', () => {
			void connectSelfHostDashboard(selfHostEl?.value ?? selfHostInput);
		});
	}

	function renderSignedIn(): void {
		const connectionLabel = formatSocialConnectionLabel(
			snapshot.dashboardOrigin ?? snapshot.loginUrl
		);
		root.replaceChildren(
			el(`
				<div class="dashboard-session-bar">
					<div class="connection-bar" role="status">
						<span class="connection-label">${escapeHtml(connectionLabel)}</span>
						<button type="button" id="dashboard-disconnect" class="connection-disconnect secondary" ${
							disconnectInFlight ? 'disabled' : ''
						}>Disconnect</button>
					</div>
				</div>
			`)
		);

		root.querySelector('#dashboard-disconnect')?.addEventListener('click', () => {
			if (disconnectInFlight) return;
			disconnectInFlight = true;
			renderBar();
			void handleDisconnect()
				.catch(() => {
					/* renderBar restored on finally */
				})
				.finally(() => {
					disconnectInFlight = false;
					void refreshSafe();
				});
		});
	}

	function renderBar(): void {
		if (snapshot.status === 'checking') {
			renderChecking();
			return;
		}
		if (snapshot.status === 'signed_out') {
			renderSignedOutGate();
			return;
		}
		renderSignedIn();
	}

	async function handleDisconnect(): Promise<void> {
		const resolved = await resolveSocialSession();
		if ('ok' in resolved && resolved.ok === false) {
			const preferred = await getPreferredDashboardOrigin();
			await detachSocialDashboardExtension(preferred);
		} else {
			await disconnectSocialDashboardSession({
				dashboardOrigin: resolved.dashboardOrigin,
				apiOrigin: resolved.apiOrigin,
				accessToken: resolved.accessToken,
			});
		}
		options?.onDisconnected?.();
	}

	async function refresh(options?: { requestDashboardSync?: boolean }): Promise<void> {
		applySelfHostFieldNormalization(selfHostInput);
		setSnapshot({ ...snapshot, status: 'checking' });
		renderBar();

		if (options?.requestDashboardSync) {
			await requestDashboardSessionSyncFromOpenTabs();
			await waitMs(400);
		}

		const auth = await isDashboardLoggedIn().catch(() => ({
			loggedIn: false,
			loginUrl: DEFAULT_LOGIN_URL,
		}));

		if (!auth.loggedIn) {
			setSnapshot({
				status: 'signed_out',
				dashboardOrigin: null,
				loginUrl: auth.loginUrl,
			});
		} else {
			setSnapshot({
				status: 'signed_in',
				dashboardOrigin: dashboardOriginFromLoginUrl(auth.loginUrl),
				loginUrl: auth.loginUrl,
			});
		}
		renderBar();
	}

	let refreshInFlight = false;
	const refreshSafe = async (opts?: { requestDashboardSync?: boolean }): Promise<void> => {
		if (refreshInFlight) return;
		refreshInFlight = true;
		try {
			await refresh(opts);
		} finally {
			refreshInFlight = false;
		}
	};

	renderBar();

	return {
		refresh: (opts) => refreshSafe(opts),
		subscribe: (listener) => {
			listeners.add(listener);
			listener(snapshot);
			return () => listeners.delete(listener);
		},
		getSnapshot: () => snapshot,
	};
}