import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';

export interface NotificationMainCountProgrammerModel {
	total: number;
}

export interface NotificationRowProgrammerModel {
	id: string;
	content: string;
	link: string | null;
	createdAt: string;
}

export interface NotificationsPaginatedProgrammerModel {
	notifications: NotificationRowProgrammerModel[];
	total: number;
	hasMore: boolean;
	page: number;
	limit: number;
}

interface MainPageCountResponseDto {
	success: boolean;
	data: { total: number };
	message: string;
}

interface PaginatedNotificationWire {
	id: string;
	content: string;
	link: string | null;
	created_at: string;
}

interface PaginatedResponseDto {
	success: boolean;
	data: {
		notifications: PaginatedNotificationWire[];
		total: number;
		hasMore: boolean;
		page: number;
		limit: number;
	};
	message: string;
}

export interface NotificationConfig {
	endpoints: {
		mainPageCount: string;
		list: string;
		paginated: string;
	};
}

function mapPaginatedRow(row: PaginatedNotificationWire): NotificationRowProgrammerModel {
	return {
		id: row.id,
		content: row.content,
		link: row.link ?? null,
		createdAt: row.created_at
	};
}

export class NotificationRepository {
	private httpGateway: HttpGateway;
	private config: NotificationConfig;

	constructor(httpGateway: HttpGateway, config: NotificationConfig) {
		this.httpGateway = httpGateway;
		this.config = { ...config };
	}

	public async getMainPageCount(organizationId: string): Promise<NotificationMainCountProgrammerModel> {
		try {
			const { data: mainPageCountDto, ok } = await this.httpGateway.get<MainPageCountResponseDto>(
				this.config.endpoints.mainPageCount,
				{ organizationId },
				{}
			);
			if (!ok || !mainPageCountDto?.success || mainPageCountDto.data == null) {
				return { total: 0 };
			}
			return { total: mainPageCountDto.data.total ?? 0 };
		} catch (e) {
			// Dock badge is best-effort; avoid unhandled rejections when the API errors (e.g. 5xx, missing DB).
			if (e instanceof ApiError) {
				return { total: 0 };
			}
			throw e;
		}
	}

	/**
	 * Loads the recent list and advances the server-side “last read” cursor for this user
	 * (dock unread count is derived from that cursor).
	 */
	public async syncReadCursorFromList(organizationId: string): Promise<void> {
		try {
			await this.httpGateway.get<{ success: boolean }>(
				this.config.endpoints.list,
				{ organizationId },
				{}
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return;
			}
			throw e;
		}
	}

	public async getPaginated(
		organizationId: string,
		page: number
	): Promise<NotificationsPaginatedProgrammerModel> {
		const { data: paginatedDto, ok } = await this.httpGateway.get<PaginatedResponseDto>(
			this.config.endpoints.paginated,
			{ organizationId, page },
			{}
		);
		if (!ok || !paginatedDto?.success || paginatedDto.data == null) {
			return {
				notifications: [],
				total: 0,
				hasMore: false,
				page: 0,
				limit: 0
			};
		}
		const d = paginatedDto.data;
		return {
			notifications: (d.notifications ?? []).map(mapPaginatedRow),
			total: d.total ?? 0,
			hasMore: d.hasMore ?? false,
			page: d.page ?? page,
			limit: d.limit ?? 0
		};
	}
}
