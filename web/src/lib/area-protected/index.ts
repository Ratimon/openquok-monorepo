export {
	getRootPathAccount,
	getRootPathCalendar,
	getRootPathAnalytics,
	getRootPathMedia,
	getRootPathIntegrations,
	getRootPathPlugs
} from '$lib/area-protected/getRootPathProtectedArea';
import { ProtectedSettingsPagePresenter, UpdateProfileStatus, WorkspaceSettingsStatus } from './ProtectedSettingsPage.presenter.svelte';
import { ProtectedLayoutPagePresenter } from '$lib/area-protected/ProtectedLayoutPage.presenter.svelte';
import { ProtectedDashboardPagePresenter } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import { ProtectedCalendarPagePresenter } from '$lib/area-protected/ProtectedCalendarPage.presenter.svelte';
import { ProtectedMediaPagePresenter } from '$lib/area-protected/ProtectedMediaPage.presenter.svelte';
import { ProtectedAnalyticsPagePresenter } from '$lib/area-protected/ProtectedAnalyticsPage.presenter.svelte';
import { ProtectedPlugsPagePresenter } from '$lib/area-protected/ProtectedPlugsPage.presenter.svelte';
import { GenerateMediaModalPresenter } from '$lib/canvas';
import { editorAccountSettingsPresenter } from '$lib/account';
import { integrationsRepository } from '$lib/integrations';
import { getMediaPresenter, mediaRepository } from '$lib/medias';
import { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPostPresenter.svelte';
import { getScheduledPostsPresenter, postsRepository } from '$lib/posts';
import { SchedulerPresenter } from '$lib/posts/SchedulerPresenter.svelte';
import { getNotificationPresenter, notificationRepository } from '$lib/notifications';
import { getSignaturesPresenter, signaturesRepository } from '$lib/signatures';
import { workspaceSettingsPresenter } from '$lib/settings';
import { authenticationRepository } from '$lib/user-auth/index';
import { SignaturesPresenter } from '$lib/signatures/Signature.presenter.svelte';
import { getAnalyticsPresenter } from '$lib/platform-analytics';
import { getPlugPresenter, globalPlugSettingsPresenter, plugRepository } from '$lib/plugs';

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

const protectedMediaPagePresenter = new ProtectedMediaPagePresenter(
	mediaRepository,
	workspaceSettingsPresenter,
	getMediaPresenter
);

/** Settings: stateful presenter (items/status/toasts). */
const signatureSettingPresenter = new SignaturesPresenter(signaturesRepository, getSignaturesPresenter);

/** Design / background surface for the social post composer (see {@link CreateSocialPostPresenter}). */
const composerMediaModalPresenter = new GenerateMediaModalPresenter(mediaRepository);

/** Same canvas stack for the account media library page. */
const mediaLibraryMediaModalPresenter = new GenerateMediaModalPresenter(mediaRepository);

/** Account calendar / Schedule‑X (see {@link SchedulerPresenter}). */
const schedulerPresenter = new SchedulerPresenter(postsRepository, getScheduledPostsPresenter);

/** Shared create-post composer (posts repository + composer media modal). */
const createSocialPostPresenter = new CreateSocialPostPresenter(
	postsRepository,
	composerMediaModalPresenter,
	getSignaturesPresenter,
	getScheduledPostsPresenter
);

const protectedDashboardPagePresenter = new ProtectedDashboardPagePresenter(
	integrationsRepository,
	workspaceSettingsPresenter,
	createSocialPostPresenter
);

const protectedCalendarPagePresenter = new ProtectedCalendarPagePresenter(
	protectedDashboardPagePresenter,
	workspaceSettingsPresenter,
	schedulerPresenter,
	createSocialPostPresenter,
	getAnalyticsPresenter,
	postsRepository
);

const protectedAnalyticsPagePresenter = new ProtectedAnalyticsPagePresenter(
	protectedDashboardPagePresenter,
	workspaceSettingsPresenter,
	getAnalyticsPresenter,
	integrationsRepository
);

const protectedPlugsPagePresenter = new ProtectedPlugsPagePresenter(
	integrationsRepository,
	workspaceSettingsPresenter,
	plugRepository,
	getPlugPresenter,
	globalPlugSettingsPresenter
);

export type { ProtectedMediaPagePresenterMediaSettingsVmPublic } from './ProtectedMediaPage.presenter.svelte';
export {
	ProtectedSettingsPagePresenter,
	UpdateProfileStatus,
	WorkspaceSettingsStatus,
	protectedSettingsPagePresenter,
	ProtectedLayoutPagePresenter,
	protectedLayoutPagePresenter,
	ProtectedDashboardPagePresenter,
	protectedDashboardPagePresenter,
	ProtectedCalendarPagePresenter,
	protectedCalendarPagePresenter,
	ProtectedAnalyticsPagePresenter,
	protectedAnalyticsPagePresenter,
	ProtectedPlugsPagePresenter,
	protectedPlugsPagePresenter,
	ProtectedMediaPagePresenter,
	protectedMediaPagePresenter,
	GenerateMediaModalPresenter,
	composerMediaModalPresenter,
	mediaLibraryMediaModalPresenter,
	schedulerPresenter,
	signatureSettingPresenter,
};
