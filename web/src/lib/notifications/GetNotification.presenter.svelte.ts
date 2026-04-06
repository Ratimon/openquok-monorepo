import type {
	NotificationRepository,
	NotificationRowProgrammerModel
} from '$lib/notifications/Notification.repository.svelte';

export interface NotificationItemVm {
	id: string;
	content: string;
	link: string | null;
	createdAt: string;
	createdAtLabel: string;
}

export interface NotificationsPaginatedSliceVm {
	notificationsVm: NotificationItemVm[];
	total: number;
	hasMore: boolean;
}

function formatCreatedAtLabel(iso: string): string {
	try {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(d);
	} catch {
		return iso;
	}
}

export class GetNotificationPresenter {
	constructor(private readonly notificationRepository: NotificationRepository) {}

	syncReadCursorFromList(organizationId: string): Promise<void> {
		return this.notificationRepository.syncReadCursorFromList(organizationId);
	}

	async loadPaginatedNotificationsVm(
		organizationId: string,
		page: number
	): Promise<NotificationsPaginatedSliceVm> {
		const paginated = await this.notificationRepository.getPaginated(organizationId, page);
		return {
			notificationsVm: paginated.notifications.map((row) => this.rowToItemVm(row)),
			total: paginated.total,
			hasMore: paginated.hasMore
		};
	}

	private rowToItemVm(row: NotificationRowProgrammerModel): NotificationItemVm {
		return {
			id: row.id,
			content: row.content,
			link: row.link,
			createdAt: row.createdAt,
			createdAtLabel: formatCreatedAtLabel(row.createdAt)
		};
	}
}
