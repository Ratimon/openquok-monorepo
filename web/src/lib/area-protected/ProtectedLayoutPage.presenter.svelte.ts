import type {
	GetNotificationPresenter,
	NotificationItemViewModel
} from '$lib/notifications/GetNotification.presenter.svelte';
import type { NotificationRepository } from '$lib/notifications/Notification.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';

const SIDEBAR_PREVIEW_LIMIT = 8;

/**
 * Layout-level presenter for protected shells that share the admin dock (e.g. editor area).
 * Owns lightweight dock state such as unread notification count for the editor dock badge.
 */
export class ProtectedLayoutPagePresenter {
	public editorDockNotificationUnreadCount = $state(0);

	public notificationPreviewVm = $state<NotificationItemViewModel[]>([]);
	public notificationPreviewLoading = $state(false);
	public notificationPreviewEmptyMessage = $state<string | null>(null);

	constructor(
		private readonly notificationRepository: NotificationRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		private readonly getNotificationPresenter: GetNotificationPresenter
	) {}

	/**
	 * Resolves the current workspace from settings (loading org list if needed) and refreshes
	 * the unread notification count for the editor dock badge.
	 */
	async refreshEditorDockNotifications(): Promise<void> {
		try {
			if (!this.workspaceSettingsPresenter.currentWorkspaceId) {
				await this.workspaceSettingsPresenter.load();
			}
			const organizationId = this.workspaceSettingsPresenter.currentWorkspaceId;
			if (!organizationId) {
				this.editorDockNotificationUnreadCount = 0;
				return;
			}
			const { total } = await this.notificationRepository.getMainPageCount(organizationId);
			this.editorDockNotificationUnreadCount = total;
		} catch {
			this.editorDockNotificationUnreadCount = 0;
		}
	}

	/**
	 * Loads a short list for the editor sidebar notifications dropdown (paginated only; does not advance read cursor).
	 */
	async loadNotificationPreview(): Promise<void> {
		this.notificationPreviewLoading = true;
		this.notificationPreviewEmptyMessage = null;
		try {
			if (!this.workspaceSettingsPresenter.currentWorkspaceId) {
				await this.workspaceSettingsPresenter.load();
			}
			const organizationId = this.workspaceSettingsPresenter.currentWorkspaceId;
			if (!organizationId) {
				this.notificationPreviewVm = [];
				this.notificationPreviewEmptyMessage =
					'Select or create a workspace in Account settings to see notifications.';
				return;
			}
			const slice = await this.getNotificationPresenter.loadPaginatedNotifications(organizationId, 0);
			this.notificationPreviewVm = slice.notifications.slice(0, SIDEBAR_PREVIEW_LIMIT);
		} catch {
			this.notificationPreviewVm = [];
			this.notificationPreviewEmptyMessage = 'Could not load notifications.';
		} finally {
			this.notificationPreviewLoading = false;
		}
	}
}
