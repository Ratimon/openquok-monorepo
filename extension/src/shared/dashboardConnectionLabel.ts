import { isLocalDashboardOrigin } from './dashboardActiveTab.js';

/** User-facing label for the active Social tab dashboard session. */
export function formatSocialConnectionLabel(dashboardOrigin: string): string {
	try {
		const host = new URL(dashboardOrigin).hostname.toLowerCase();
		if (host === 'www.openquok.com' || host === 'openquok.com') {
			return 'Connected to OpenQuok.com (Cloud)';
		}
		if (isLocalDashboardOrigin(dashboardOrigin)) {
			return `Connected to ${dashboardOrigin} (Self host)`;
		}
	} catch {
		/* fall through */
	}
	return `Connected to ${dashboardOrigin}`;
}
