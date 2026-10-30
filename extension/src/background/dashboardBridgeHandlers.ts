import { clearExtensionDashboardSession } from '../shared/clearExtensionDashboardSession.js';
import {
	DASHBOARD_BRIDGE_MESSAGE,
	isDashboardSessionClearPayload,
	isDashboardSessionSyncPayload,
} from '../shared/dashboardBridgeMessages.js';
import { storeDashboardBridgeSession } from '../shared/dashboardBridgeStorage.js';
import { rememberDashboardOrigin } from '../shared/dashboardOriginStorage.js';

export async function handleDashboardBridgeRuntimeMessage(
	message: Record<string, unknown>
): Promise<{ ok: true } | undefined> {
	if (isDashboardSessionSyncPayload(message)) {
		await rememberDashboardOrigin(message.dashboardOrigin);
		await storeDashboardBridgeSession({
			dashboardOrigin: message.dashboardOrigin,
			accessToken: message.accessToken,
			organizationId: message.organizationId,
		});
		return { ok: true };
	}

	if (isDashboardSessionClearPayload(message)) {
		await clearExtensionDashboardSession(message.dashboardOrigin);
		return { ok: true };
	}

	if (message.type === DASHBOARD_BRIDGE_MESSAGE.REQUEST_SYNC) {
		return { ok: true };
	}

	return undefined;
}
