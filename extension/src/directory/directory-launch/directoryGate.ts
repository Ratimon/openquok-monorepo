import { sendRuntimeMessage } from '../../shared/extensionRuntime.js';
import { detectDirectorySiteLogin } from './siteLogin/detectDirectorySiteLogin.js';

export const DIRECTORY_GATE_CHANGE_EVENT = 'openquok-directory-gate-change';

export const CHECK_DIRECTORY_GATE_MESSAGE = 'OPENQUOK_CHECK_DIRECTORY_GATE';

/** Open an allowed http(s) URL in a new tab (content scripts should use this instead of target=_blank). */
export const OPEN_URL_MESSAGE = 'OPENQUOK_OPEN_URL';

export type DirectoryGateState = {
	openquokLoggedIn: boolean;
	openquokLoginUrl: string;
	directoryLoggedIn: boolean;
	directoryLoginUrl: string;
	siteKey: string;
};

const DEFAULT_OPENQUOK_LOGIN_URL = 'https://www.openquok.com/sign-in';

export const DIRECTORY_SITE_DISPLAY_NAME: Record<string, string> = {
	peerpush: 'PeerPush',
	uneed: 'Uneed',
};

type CheckDirectoryGateResponse = {
	ok?: boolean;
	openquokLoggedIn?: boolean;
	openquokLoginUrl?: string;
};

export function isDirectoryFillAllowed(state: DirectoryGateState | null): boolean {
	if (!state) return true;
	return state.openquokLoggedIn && state.directoryLoggedIn;
}

export function buildFillGateMessage(state: DirectoryGateState): string {
	const siteName = DIRECTORY_SITE_DISPLAY_NAME[state.siteKey] ?? state.siteKey;
	if (!state.openquokLoggedIn && !state.directoryLoggedIn) {
		return `Sign in to OpenQuok and to ${siteName} to autofill.`;
	}
	if (!state.openquokLoggedIn) {
		return 'Sign in to OpenQuok to autofill.';
	}
	return `Sign in to ${siteName} to autofill.`;
}

export async function resolveDirectoryGateState(siteKey: string): Promise<DirectoryGateState> {
	const openquok = await fetchOpenQuokAuth(siteKey);
	const directory = detectDirectorySiteLogin(siteKey);
	return {
		openquokLoggedIn: openquok.loggedIn,
		openquokLoginUrl: openquok.loginUrl,
		directoryLoggedIn: directory.loggedIn,
		directoryLoginUrl: directory.loginUrl,
		siteKey,
	};
}

export function readGateStateFromEvent(event: Event): DirectoryGateState | null {
	if (!(event instanceof CustomEvent)) return null;
	const detail = event.detail;
	if (!detail || typeof detail !== 'object') return null;
	const state = detail as DirectoryGateState;
	if (
		typeof state.openquokLoggedIn !== 'boolean' ||
		typeof state.openquokLoginUrl !== 'string' ||
		typeof state.directoryLoggedIn !== 'boolean' ||
		typeof state.directoryLoginUrl !== 'string' ||
		typeof state.siteKey !== 'string'
	) {
		return null;
	}
	return state;
}

async function fetchOpenQuokAuth(siteKey: string): Promise<{ loggedIn: boolean; loginUrl: string }> {
	const response = await sendRuntimeMessage<CheckDirectoryGateResponse>({
		type: CHECK_DIRECTORY_GATE_MESSAGE,
		siteKey,
	});
	if (response?.ok) {
		return {
			loggedIn: Boolean(response.openquokLoggedIn),
			loginUrl:
				typeof response.openquokLoginUrl === 'string' && response.openquokLoginUrl.trim()
					? response.openquokLoginUrl.trim()
					: DEFAULT_OPENQUOK_LOGIN_URL,
		};
	}
	return { loggedIn: false, loginUrl: DEFAULT_OPENQUOK_LOGIN_URL };
}
