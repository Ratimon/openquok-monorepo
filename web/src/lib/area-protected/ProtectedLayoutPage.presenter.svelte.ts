import type {
	GetNotificationPresenter,
	NotificationItemViewModel
} from '$lib/notifications/GetNotification.presenter.svelte';
import type { NotificationRepository } from '$lib/notifications/Notification.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import type { DockNotificationsPreview } from '$lib/ui/floating-dock/types';

const DEFAULT_NOTIFICATION_PREVIEW_PAGE_SIZE = 10;

/**
 * Layout-level presenter for protected shells that share the admin dock (e.g. editor area).
 * Owns lightweight dock state such as unread notification count for the editor dock badge.
 */
export class ProtectedLayoutPagePresenter {
	public editorDockNotificationUnreadCount = $state(0);

	public notificationPreviewVm = $state<NotificationItemViewModel[]>([]);
	public notificationPreviewLoading = $state(false);
	public notificationPreviewEmptyMessage = $state<string | null>(null);
	public notificationPreviewPage = $state(1);
	public notificationPreviewItemsPerPage = $state(DEFAULT_NOTIFICATION_PREVIEW_PAGE_SIZE);
	public notificationPreviewTotal = $state(0);

	constructor(
		private readonly notificationRepository: NotificationRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		private readonly getNotificationPresenter: GetNotificationPresenter
	) {}

	get notificationPreviewTotalPages(): number {
		return Math.max(
			1,
			Math.ceil(this.notificationPreviewTotal / Math.max(this.notificationPreviewItemsPerPage, 1))
		);
	}

	/**
	 * Resolves the current workspace from settings (loading org list if needed) and refreshes
	 * the unread notification count for the editor dock badge.
	 */
	async refreshEditorDockNotifications(): Promise<void> {
		try {
			if (!this.workspaceSettingsPresenter.currentWorkspaceId) {
				await this.workspaceSettingsPresenter.load({ includeTeam: false });
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
	 * Loads a paginated list for the header notifications dropdown (does not advance read cursor).
	 */
	async loadNotificationPreview(page = this.notificationPreviewPage): Promise<void> {
		this.notificationPreviewLoading = true;
		this.notificationPreviewEmptyMessage = null;
		try {
			if (!this.workspaceSettingsPresenter.currentWorkspaceId) {
				await this.workspaceSettingsPresenter.load({ includeTeam: false });
			}
			const organizationId = this.workspaceSettingsPresenter.currentWorkspaceId;
			if (!organizationId) {
				this.notificationPreviewVm = [];
				this.notificationPreviewTotal = 0;
				this.notificationPreviewEmptyMessage =
					'Select or create a workspace in Account settings to see notifications.';
				return;
			}
			const zeroBasedPage = Math.max(page, 1) - 1;
			const slice = await this.getNotificationPresenter.loadPaginatedNotifications(
				organizationId,
				zeroBasedPage,
				this.notificationPreviewItemsPerPage
			);
			this.notificationPreviewVm = slice.notifications;
			this.notificationPreviewTotal = slice.total;
			this.notificationPreviewPage = page;
		} catch {
			this.notificationPreviewVm = [];
			this.notificationPreviewTotal = 0;
			this.notificationPreviewEmptyMessage = 'Could not load notifications.';
		} finally {
			this.notificationPreviewLoading = false;
		}
	}

	setNotificationPreviewPage(page: number): void {
		const nextPage = Math.min(Math.max(page, 1), this.notificationPreviewTotalPages);
		void this.loadNotificationPreview(nextPage);
	}

	setNotificationPreviewItemsPerPage(size: number): void {
		this.notificationPreviewItemsPerPage = size;
		void this.loadNotificationPreview(1);
	}

	notificationPreviewPaginateToFirstPage(): void {
		this.setNotificationPreviewPage(1);
	}

	notificationPreviewPaginateToLastPage(): void {
		this.setNotificationPreviewPage(this.notificationPreviewTotalPages);
	}

	getNotificationsDockPreview(): DockNotificationsPreview {
		return {
			items: this.notificationPreviewVm,
			loading: this.notificationPreviewLoading,
			emptyMessage: this.notificationPreviewEmptyMessage,
			onOpen: () => {
				void this.loadNotificationPreview();
			},
			total: this.notificationPreviewTotal,
			currentPage: this.notificationPreviewPage,
			itemsPerPage: this.notificationPreviewItemsPerPage,
			totalPages: this.notificationPreviewTotalPages,
			setCurrentPage: (page) => {
				this.setNotificationPreviewPage(page);
			},
			setItemsPerPage: (size) => {
				this.setNotificationPreviewItemsPerPage(size);
			},
			paginateToFirstPage: () => {
				this.notificationPreviewPaginateToFirstPage();
			},
			paginateToLastPage: () => {
				this.notificationPreviewPaginateToLastPage();
			}
		};
	}
}
