export {
	getRootPathAccount,
	getRootPathCalendar,
	getRootPathAnalytics,
	getRootPathMedia,
	getRootPathPlugs,
	getRootPathTemplates
} from '$lib/area-protected/getRootPathProtectedArea';
import { ProtectedSettingsPagePresenter, UpdateProfileStatus, WorkspaceSettingsStatus } from './ProtectedSettingsPage.presenter.svelte';
import { ProtectedLayoutPagePresenter } from '$lib/area-protected/ProtectedLayoutPage.presenter.svelte';
import { ProtectedHomePagePresenter } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import { GetHomeWorkspacesPresenter } from '$lib/area-protected/GetHomeWorkspaces.presenter.svelte';
import { ProtectedCalendarPagePresenter } from '$lib/area-protected/ProtectedCalendarPage.presenter.svelte';
import { ProtectedMediaPagePresenter } from '$lib/area-protected/ProtectedMediaPage.presenter.svelte';
import { ProtectedAnalyticsPagePresenter } from '$lib/area-protected/ProtectedAnalyticsPage.presenter.svelte';
import { ProtectedPlugsPagePresenter } from '$lib/area-protected/ProtectedPlugsPage.presenter.svelte';
import { ProtectedTemplatesPagePresenter } from '$lib/area-protected/ProtectedTemplatesPage.presenter.svelte';
import { ProtectedPayloadWizardPagePresenter } from '$lib/area-protected/ProtectedPayloadWizardPage.presenter.svelte';
import { ProtectedBillingPagePresenter } from '$lib/area-protected/ProtectedBillingPage.presenter.svelte';
import { billingPresenter, firstBillingGatePresenter, getBillingPresenter } from '$lib/billing';
import { GenerateMediaModalPresenter } from '$lib/canvas';
import { editorAccountSettingsPresenter } from '$lib/account';
import { integrationsRepository } from '$lib/integrations';
import { getMediaPresenter, mediaRepository } from '$lib/medias';
import { CreateSocialPostPresenter } from '$lib/posts/CreateSocialPost.presenter.svelte';
import { PostKanbanBoardPresenter } from '$lib/posts/PostKanbanBoard.presenter.svelte';
import { getScheduledPostsPresenter, postsRepository } from '$lib/posts';
import { SchedulerPresenter } from '$lib/posts/Scheduler.presenter.svelte';
import { getNotificationPresenter, notificationRepository } from '$lib/notifications';
import { getSignaturesPresenter, signaturesRepository } from '$lib/signatures';
import { getSetPresenter, upsertSetPresenter } from '$lib/sets';
import { SetGridTablePresenter } from '$lib/sets/SetGridTable.presenter.svelte';
import {
	settingsRepository,
	workspaceSettingsPresenter,
	approvedAppsSettingsPresenter
} from '$lib/settings';
import { DevelopersSettingsPresenter } from '$lib/settings/DevelopersSettings.presenter.svelte';
import { authenticationRepository } from '$lib/user-auth/index';
import { SignaturesPresenter } from '$lib/signatures/Signature.presenter.svelte';
import { getAnalyticsPresenter } from '$lib/platform-analytics';
import { getPlugPresenter, upsertGlobalPlugPresenter, plugRepository } from '$lib/plugs';
import { PlugGridTablePresenter } from '$lib/plugs/PlugGridTable.presenter.svelte';
import { PlugGridFilterBuilderPresenter } from '$lib/plugs/PlugGridFilterBuilder.presenter.svelte';
import { SetGridFilterBuilderPresenter } from '$lib/sets/SetGridFilterBuilder.presenter.svelte';
import {
	HomeChannelsGridFilterBuilderPresenter,
	HomeChannelsGridTablePresenter,
	getChannelPresenter
} from '$lib/channels';

const developersSettingsPresenter = new DevelopersSettingsPresenter(settingsRepository, workspaceSettingsPresenter);

const protectedSettingsPagePresenter = new ProtectedSettingsPagePresenter(
	editorAccountSettingsPresenter,
	workspaceSettingsPresenter,
	developersSettingsPresenter,
	approvedAppsSettingsPresenter,
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
	getScheduledPostsPresenter,
	upsertSetPresenter,
	schedulerPresenter
);

const homeChannelsGridTable = new HomeChannelsGridTablePresenter();
const homeChannelsGridFilterBuilder = new HomeChannelsGridFilterBuilderPresenter();

const postKanbanBoardPresenter = new PostKanbanBoardPresenter(
	postsRepository,
	getScheduledPostsPresenter,
	schedulerPresenter
);

const getHomeWorkspacesPresenter = new GetHomeWorkspacesPresenter();

const protectedHomePagePresenter = new ProtectedHomePagePresenter(
	integrationsRepository,
	settingsRepository,
	workspaceSettingsPresenter,
	createSocialPostPresenter,
	postKanbanBoardPresenter,
	homeChannelsGridTable,
	homeChannelsGridFilterBuilder,
	getChannelPresenter,
	getHomeWorkspacesPresenter
);

const protectedCalendarPagePresenter = new ProtectedCalendarPagePresenter(
	protectedHomePagePresenter,
	workspaceSettingsPresenter,
	schedulerPresenter,
	createSocialPostPresenter,
	getAnalyticsPresenter,
	postsRepository
);

const protectedAnalyticsPagePresenter = new ProtectedAnalyticsPagePresenter(
	protectedHomePagePresenter,
	workspaceSettingsPresenter,
	getAnalyticsPresenter,
	integrationsRepository
);

const protectedPayloadWizardPagePresenter = new ProtectedPayloadWizardPagePresenter(
	integrationsRepository,
	workspaceSettingsPresenter,
	createSocialPostPresenter,
	getChannelPresenter
);

const plugGridTable = new PlugGridTablePresenter(
	getPlugPresenter,
	plugRepository
);
const plugGridFilterBuilder = new PlugGridFilterBuilderPresenter();

const protectedPlugsPagePresenter = new ProtectedPlugsPagePresenter(
	integrationsRepository,
	workspaceSettingsPresenter,
	plugRepository,
	upsertGlobalPlugPresenter,
	plugGridTable,
	plugGridFilterBuilder
);

const setGridTable = new SetGridTablePresenter(getSetPresenter, protectedHomePagePresenter);
const setGridFilterBuilder = new SetGridFilterBuilderPresenter();

const protectedBillingPagePresenter = new ProtectedBillingPagePresenter(
	getBillingPresenter,
	workspaceSettingsPresenter,
	billingPresenter,
	firstBillingGatePresenter
);

const protectedTemplatesPagePresenter = new ProtectedTemplatesPagePresenter(
	workspaceSettingsPresenter,
	getSetPresenter,
	upsertSetPresenter,
	protectedHomePagePresenter,
	setGridTable,
	setGridFilterBuilder
);

export type { ProtectedMediaPagePresenterMediaSettingsVmPublic } from './ProtectedMediaPage.presenter.svelte';
export {
	ProtectedSettingsPagePresenter,
	UpdateProfileStatus,
	WorkspaceSettingsStatus,
	protectedSettingsPagePresenter,
	ProtectedLayoutPagePresenter,
	protectedLayoutPagePresenter,
	ProtectedHomePagePresenter,
	protectedHomePagePresenter,
	ProtectedCalendarPagePresenter,
	protectedCalendarPagePresenter,
	ProtectedAnalyticsPagePresenter,
	protectedAnalyticsPagePresenter,
	ProtectedPlugsPagePresenter,
	protectedPlugsPagePresenter,
	ProtectedTemplatesPagePresenter,
	protectedTemplatesPagePresenter,
	ProtectedBillingPagePresenter,
	protectedBillingPagePresenter,
	ProtectedMediaPagePresenter,
	protectedMediaPagePresenter,
	ProtectedPayloadWizardPagePresenter,
	protectedPayloadWizardPagePresenter,
	GenerateMediaModalPresenter,
	composerMediaModalPresenter,
	mediaLibraryMediaModalPresenter,
	schedulerPresenter,
	signatureSettingPresenter
};
