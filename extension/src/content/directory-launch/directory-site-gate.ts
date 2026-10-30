import { getDirectoryLaunchSiteKeyFromLocation } from 'openquok-common';

import { isExtensionRuntimeAvailable } from '../../shared/extensionRuntime.js';
import {
	DIRECTORY_GATE_CHANGE_EVENT,
	DIRECTORY_SITE_DISPLAY_NAME,
	type DirectoryGateState,
	resolveDirectoryGateState,
} from '../../directory/directory-launch/directoryGate.js';
import {
	DirectoryLoginBanner,
	type LoginBannerView,
} from '../../directory/directory-launch/loginBanner.js';
import { detectDirectorySiteLogin } from '../../directory/directory-launch/siteLogin/detectDirectorySiteLogin.js';

function gateStatesEqual(a: DirectoryGateState, b: DirectoryGateState): boolean {
	return (
		a.openquokLoggedIn === b.openquokLoggedIn &&
		a.openquokLoginUrl === b.openquokLoginUrl &&
		a.directoryLoggedIn === b.directoryLoggedIn &&
		a.directoryLoginUrl === b.directoryLoginUrl &&
		a.siteKey === b.siteKey
	);
}

function buildBannerView(
	siteKey: string,
	openquok: { loggedIn: boolean; loginUrl: string },
	directory: { loggedIn: boolean; loginUrl: string }
): LoginBannerView | null {
	if (!openquok.loggedIn) {
		return {
			kind: 'openquok',
			title: 'Login Required',
			message: 'Please log in to OpenQuok to access your product profiles.',
			loginUrl: openquok.loginUrl,
			ctaLabel: 'Go to Login',
		};
	}
	if (!directory.loggedIn) {
		const siteName = DIRECTORY_SITE_DISPLAY_NAME[siteKey] ?? siteKey;
		return {
			kind: 'directory',
			title: 'Login Required',
			message: `Please log in to ${siteName} to use the auto-fill feature.`,
			loginUrl: directory.loginUrl,
			ctaLabel: 'Go to Login',
		};
	}
	return null;
}

/** Re-check OpenQuok session while the tab is open (sign-out in another tab does not fire visibility). */
const OPENQUOK_AUTH_RECHECK_MS = 15_000;

function runDirectorySiteGate(siteKey: string): void {
	const banner = new DirectoryLoginBanner();
	let lastState: DirectoryGateState | null = null;
	let observer: MutationObserver | null = null;
	let debounceTimer: number | undefined;
	let tornDown = false;
	let delayedRefreshTimer: number | undefined;
	let authRecheckTimer: number | undefined;

	function teardown(): void {
		if (tornDown) return;
		tornDown = true;
		stopObserver();
		if (delayedRefreshTimer !== undefined) {
			clearTimeout(delayedRefreshTimer);
			delayedRefreshTimer = undefined;
		}
		if (authRecheckTimer !== undefined) {
			clearInterval(authRecheckTimer);
			authRecheckTimer = undefined;
		}
		document.removeEventListener('visibilitychange', onVisibilityChange);
		window.removeEventListener('focus', onWindowFocus);
		window.removeEventListener('popstate', onPopState);
		banner.unmount();
	}

	const onVisibilityChange = (): void => {
		if (document.visibilityState === 'visible') {
			void refresh();
		}
	};

	const onWindowFocus = (): void => {
		void refresh();
	};

	const onPopState = (): void => {
		void refresh();
	};
	function dispatchGateChange(state: DirectoryGateState): void {
		window.dispatchEvent(new CustomEvent(DIRECTORY_GATE_CHANGE_EVENT, { detail: state }));
	}

	function stopObserver(): void {
		observer?.disconnect();
		observer = null;
		if (debounceTimer !== undefined) {
			clearTimeout(debounceTimer);
			debounceTimer = undefined;
		}
	}

	function ensureObserver(): void {
		if (observer || !document.body) return;
		observer = new MutationObserver(() => {
			if (debounceTimer !== undefined) clearTimeout(debounceTimer);
			debounceTimer = window.setTimeout(() => {
				debounceTimer = undefined;
				void refresh();
			}, 300);
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	async function refresh(): Promise<void> {
		if (tornDown || !isExtensionRuntimeAvailable()) {
			if (!isExtensionRuntimeAvailable()) {
				teardown();
			}
			return;
		}
		const state = await resolveDirectoryGateState(siteKey);
		const openquok = {
			loggedIn: state.openquokLoggedIn,
			loginUrl: state.openquokLoginUrl,
		};
		const directory = detectDirectorySiteLogin(siteKey);

		const view = buildBannerView(siteKey, openquok, directory);
		if (view) {
			banner.mount();
			banner.update(view);
			ensureObserver();
		} else {
			banner.unmount();
			stopObserver();
		}

		if (!lastState || !gateStatesEqual(lastState, state)) {
			lastState = state;
			dispatchGateChange(state);
		}
	}

	void refresh();
	delayedRefreshTimer = window.setTimeout(() => {
		delayedRefreshTimer = undefined;
		void refresh();
	}, 1000);

	document.addEventListener('visibilitychange', onVisibilityChange);
	window.addEventListener('focus', onWindowFocus);
	window.addEventListener('popstate', onPopState);

	authRecheckTimer = window.setInterval(() => {
		if (document.visibilityState === 'visible') {
			void refresh();
		}
	}, OPENQUOK_AUTH_RECHECK_MS);
}

const siteKey = getDirectoryLaunchSiteKeyFromLocation(window.location.hostname);
if (siteKey) {
	runDirectorySiteGate(siteKey);
}
