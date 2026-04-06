import { httpGateway } from '$lib/core/index';
import type { NotificationConfig } from '$lib/notifications/Notification.repository.svelte';
import { NotificationRepository } from '$lib/notifications/Notification.repository.svelte';
import { GetNotificationPresenter } from '$lib/notifications/GetNotification.presenter.svelte';

const notificationConfig: NotificationConfig = {
	endpoints: {
		mainPageCount: '/api/v1/notifications',
		list: '/api/v1/notifications/list',
		paginated: '/api/v1/notifications/paginated'
	}
};

export const notificationRepository = new NotificationRepository(httpGateway, notificationConfig);
export const getNotificationPresenter = new GetNotificationPresenter(notificationRepository);

export type {
	NotificationMainCountProgrammerModel,
	NotificationRowProgrammerModel,
	NotificationsPaginatedProgrammerModel
} from '$lib/notifications/Notification.repository.svelte';
export type {
	NotificationItemVm,
	NotificationsPaginatedSliceVm
} from '$lib/notifications/GetNotification.presenter.svelte';
