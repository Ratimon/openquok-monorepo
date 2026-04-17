import type {
	NotificationRepository,
	NotificationRowProgrammerModel
} from '$lib/notifications/Notification.repository.svelte';

export interface NotificationItemViewModel {
	id: string;
	content: string;
	link: string | null;
	createdAt: string;
	createdAtLabel: string;
}

export interface NotificationsPaginatedSliceViewModel {
	notifications: NotificationItemViewModel[];
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

	async loadPaginatedNotifications(
		organizationId: string,
		page: number
	): Promise<NotificationsPaginatedSliceViewModel> {
		const paginated = await this.notificationRepository.getPaginated(organizationId, page);
		return {
			notifications: paginated.notifications.map((row) => this.rowToNotificationItemViewModel(row)),
			total: paginated.total,
			hasMore: paginated.hasMore
		};
	}

	private rowToNotificationItemViewModel(
		row: NotificationRowProgrammerModel
	): NotificationItemViewModel {
		return {
			id: row.id,
			content: row.content,
			link: row.link,
			createdAt: row.createdAt,
			createdAtLabel: formatCreatedAtLabel(row.createdAt)
		};
	}
}
