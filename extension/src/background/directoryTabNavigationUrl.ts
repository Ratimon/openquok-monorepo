const STARTUPINSPIRE_DASHBOARD_URL = 'https://www.startupinspire.com/dashboard';

/** Do not downgrade an in-progress StartupInspire dashboard tab to pricing when focusing from the side panel. */
export function resolveDirectoryTabNavigationUrl(
	providerSlug: string,
	tabUrl: string | undefined,
	openUrl: string
): string {
	const slug = providerSlug.trim();
	if (!slug.startsWith('startupinspire-')) return openUrl;
	try {
		const target = new URL(openUrl);
		if (tabUrl) {
			const tab = new URL(tabUrl);
			if (tab.origin === target.origin) {
				const path = tab.pathname.toLowerCase();
				if (path === '/dashboard' || path.startsWith('/dashboard/')) {
					return tabUrl;
				}
			}
		}
	} catch {
		return openUrl;
	}
	if (openUrl.includes('/pricing')) {
		return STARTUPINSPIRE_DASHBOARD_URL;
	}
	return openUrl;
}