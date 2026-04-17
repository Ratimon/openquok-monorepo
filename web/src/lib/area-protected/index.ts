export {
	getRootPathAccount,
	getRootPathCalendar,
	getRootPathAnalytics,
	getRootPathMedia,
	getRootPathIntegrations
} from '$lib/area-protected/getRootPathProtectedArea';
import { ProtectedSettingsPagePresenter, UpdateProfileStatus, WorkspaceSettingsStatus } from './ProtectedSettingsPage.presenter.svelte';
import { ProtectedLayoutPagePresenter } from '$lib/area-protected/ProtectedLayoutPage.presenter.svelte';
import { ProtectedDashboardPagePresenter } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import { editorAccountSettingsPresenter } from '$lib/account';
import { integrationsRepository } from '$lib/integrations';
import { getNotificationPresenter, notificationRepository } from '$lib/notifications';
import { workspaceSettingsPresenter } from '$lib/settings';
import { authenticationRepository } from '$lib/user-auth/index';

const protectedSettingsPagePresenter = new ProtectedSettingsPagePresenter(
	editorAccountSettingsPresenter,
	workspaceSettingsPresenter,
	authenticationRepository
);

const protectedLayoutPagePresenter = new ProtectedLayoutPagePresenter(
	notificationRepository,
	workspaceSettingsPresenter,
	getNotificationPresenter
);

const protectedDashboardPagePresenter = new ProtectedDashboardPagePresenter(
	integrationsRepository,
	workspaceSettingsPresenter
);

export {
	ProtectedSettingsPagePresenter,
	UpdateProfileStatus,
	WorkspaceSettingsStatus,
	protectedSettingsPagePresenter,
	ProtectedLayoutPagePresenter,
	protectedLayoutPagePresenter,
	ProtectedDashboardPagePresenter,
	protectedDashboardPagePresenter
};
