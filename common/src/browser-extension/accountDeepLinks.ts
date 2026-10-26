/** Query flag on `/account` that opens the Add Channel provider picker (dashboard). */
export const ACCOUNT_ADD_CHANNEL_QUERY = 'addChannel';

export const ACCOUNT_ADD_CHANNEL_QUERY_VALUE = '1';

export function isAccountAddChannelDeepLink(searchParams: URLSearchParams): boolean {
	return searchParams.get(ACCOUNT_ADD_CHANNEL_QUERY) === ACCOUNT_ADD_CHANNEL_QUERY_VALUE;
}

export function buildDashboardAccountAddChannelPath(accountPath = '/account'): string {
	const path = accountPath.startsWith('/') ? accountPath : `/${accountPath}`;
	return `${path}?${ACCOUNT_ADD_CHANNEL_QUERY}=${ACCOUNT_ADD_CHANNEL_QUERY_VALUE}`;
}

export function buildDashboardAccountAddChannelUrl(dashboardOrigin: string, accountPath = '/account'): string {
	const origin = dashboardOrigin.replace(/\/+$/, '');
	return `${origin}${buildDashboardAccountAddChannelPath(accountPath)}`;
}
