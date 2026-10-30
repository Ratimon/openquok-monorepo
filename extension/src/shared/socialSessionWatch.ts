const SESSION_COOKIE_NAMES = new Set(['showorg', 'refreshToken', 'access_token']);

/**
 * Re-run Social tab session resolution when auth cookies change or the side panel is focused again.
 */
export function installSocialSessionWatch(onSessionMaybeChanged: () => void): () => void {
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const schedule = (): void => {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debounceTimer = null;
			onSessionMaybeChanged();
		}, 500);
	};

	const onCookieChanged = (change: chrome.cookies.CookieChangeInfo): void => {
		const name = change.cookie?.name;
		if (!name || !SESSION_COOKIE_NAMES.has(name)) return;
		if (name === 'refreshToken' || name === 'access_token') {
			schedule();
			return;
		}
		if (!change.removed && name === 'showorg') {
			schedule();
		}
	};

	if (typeof chrome !== 'undefined' && chrome.cookies?.onChanged) {
		chrome.cookies.onChanged.addListener(onCookieChanged);
	}

	const onVisibility = (): void => {
		if (document.visibilityState === 'visible') schedule();
	};
	document.addEventListener('visibilitychange', onVisibility);
	window.addEventListener('focus', schedule);

	return () => {
		if (typeof chrome !== 'undefined' && chrome.cookies?.onChanged) {
			chrome.cookies.onChanged.removeListener(onCookieChanged);
		}
		document.removeEventListener('visibilitychange', onVisibility);
		window.removeEventListener('focus', schedule);
		if (debounceTimer) clearTimeout(debounceTimer);
	};
}
