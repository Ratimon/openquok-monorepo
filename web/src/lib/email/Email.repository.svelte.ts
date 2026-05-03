import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';

/** GET /admin/emails/receiving */
export interface ListReceivedEmailsResponseDto {
	success?: boolean;
	data?: {
		object: 'list';
		has_more: boolean;
		data: Array<{
			id: string;
			to: string[];
			from: string;
			created_at: string;
			subject: string;
			message_id: string;
		}>;
	};
	message?: string;
}

/** GET /admin/emails/receiving/:id */
export interface GetReceivedEmailResponseDto {
	success?: boolean;
	data?: Record<string, unknown>;
	message?: string;
}

/** POST /admin/emails/send */
export interface SendEmailResponseDto {
	success?: boolean;
	data?: { id: string };
	message?: string;
}

/** Body for POST /admin/emails/send (matches backend Zod schema). */
export interface SendEmailRequestBody {
	from?: string;
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	cc?: string | string[];
	bcc?: string | string[];
	reply_to?: string | string[];
	in_reply_to?: string;
}

/** Programmer model: received email summary row (repository output; DTO → PM). */
export interface ReceivedEmailSummaryProgrammerModel {
	id: string;
	to: string[];
	from: string;
	createdAt: string;
	subject: string;
	messageId: string;
}

/** Programmer model: received email detail (repository output; DTO → PM). */
export interface ReceivedEmailDetailProgrammerModel {
	id: string;
	subject: string;
	from: string;
	to: string[];
	createdAt: string;
	html: string | null;
	text: string | null;
	messageId: string;
}

export interface EmailConfig {
	endpoints: {
		listReceiving: string;
		receivingEmail: (id: string) => string;
		send: string;
	};
}

export interface ListReceivedEmailsResult {
	success: boolean;
	list: ReceivedEmailSummaryProgrammerModel[];
	hasMore: boolean;
	message: string;
}

export interface GetReceivedEmailResult {
	success: boolean;
	detail: ReceivedEmailDetailProgrammerModel | null;
	message: string;
}

export interface SendEmailResult {
	success: boolean;
	sentId: string | null;
	message: string;
}

function mapSummaryRow(row: {
	id: string;
	to: string[];
	from: string;
	created_at: string;
	subject: string;
	message_id: string;
}): ReceivedEmailSummaryProgrammerModel {
	return {
		id: row.id,
		to: Array.isArray(row.to) ? row.to : [],
		from: row.from ?? '',
		createdAt: row.created_at ?? '',
		subject: row.subject ?? '',
		messageId: row.message_id ?? ''
	};
}

function mapDetail(raw: Record<string, unknown>): ReceivedEmailDetailProgrammerModel {
	const toRaw = raw.to;
	const to = Array.isArray(toRaw) ? (toRaw as string[]) : [];
	return {
		id: String(raw.id ?? ''),
		subject: typeof raw.subject === 'string' ? raw.subject : '',
		from: typeof raw.from === 'string' ? raw.from : '',
		to,
		createdAt: typeof raw.created_at === 'string' ? raw.created_at : '',
		html: typeof raw.html === 'string' ? raw.html : null,
		text: typeof raw.text === 'string' ? raw.text : null,
		messageId: typeof raw.message_id === 'string' ? raw.message_id : ''
	};
}

export class EmailRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: EmailConfig
	) {}

	async listReceivedEmails(params: {
		limit?: number;
		after?: string;
		before?: string;
	}): Promise<ListReceivedEmailsResult> {
		try {
			const { data: dto, ok } = await this.httpGateway.get<ListReceivedEmailsResponseDto>(
				this.config.endpoints.listReceiving,
				{
					...(params.limit !== undefined ? { limit: params.limit } : {}),
					...(params.after ? { after: params.after } : {}),
					...(params.before ? { before: params.before } : {})
				},
				{ withCredentials: true }
			);

			if (ok && dto?.data?.data) {
				const list = dto.data.data.map((row) =>
					mapSummaryRow(row as {
						id: string;
						to: string[];
						from: string;
						created_at: string;
						subject: string;
						message_id: string;
					})
				);
				return {
					success: true,
					list,
					hasMore: dto.data.has_more === true,
					message: dto.message ?? ''
				};
			}

			return {
				success: false,
				list: [],
				hasMore: false,
				message: dto?.message ?? 'Could not load received emails.'
			};
		} catch (error) {
			return this.listErrorResult(error);
		}
	}

	private listErrorResult(error: unknown): ListReceivedEmailsResult {
		if (error instanceof ApiError) {
			const { message } = (error.data as { message?: string }) ?? {};
			return {
				success: false,
				list: [],
				hasMore: false,
				message: message ?? 'Could not load received emails.'
			};
		}
		return {
			success: false,
			list: [],
			hasMore: false,
			message: 'Could not load received emails.'
		};
	}

	async getReceivedEmail(id: string): Promise<GetReceivedEmailResult> {
		try {
			const { data: dto, ok } = await this.httpGateway.get<GetReceivedEmailResponseDto>(
				this.config.endpoints.receivingEmail(id),
				undefined,
				{ withCredentials: true }
			);

			if (ok && dto?.data && typeof dto.data === 'object') {
				return {
					success: true,
					detail: mapDetail(dto.data as Record<string, unknown>),
					message: dto.message ?? ''
				};
			}

			return {
				success: false,
				detail: null,
				message: dto?.message ?? 'Could not load email.'
			};
		} catch (error) {
			if (error instanceof ApiError) {
				const { message } = (error.data as { message?: string }) ?? {};
				return {
					success: false,
					detail: null,
					message: message ?? 'Could not load email.'
				};
			}
			return { success: false, detail: null, message: 'Could not load email.' };
		}
	}

	async sendEmail(payload: SendEmailRequestBody): Promise<SendEmailResult> {
		try {
			const { data: dto, ok } = await this.httpGateway.post<SendEmailResponseDto>(
				this.config.endpoints.send,
				payload,
				{ withCredentials: true }
			);

			if (ok && dto?.data?.id) {
				return {
					success: true,
					sentId: dto.data.id,
					message: dto.message ?? 'Email sent.'
				};
			}

			return {
				success: false,
				sentId: null,
				message: dto?.message ?? 'Failed to send email.'
			};
		} catch (error) {
			if (error instanceof ApiError) {
				const { message } = (error.data as { message?: string }) ?? {};
				return {
					success: false,
					sentId: null,
					message: message ?? 'Failed to send email.'
				};
			}
			return { success: false, sentId: null, message: 'Failed to send email.' };
		}
	}
}
