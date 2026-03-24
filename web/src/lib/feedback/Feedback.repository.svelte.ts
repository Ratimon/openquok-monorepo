import type { HttpGateway } from '$lib/core/HttpGateway';
import { HttpMethod } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';

export interface CreateFeedbackRequestDto {
	feedback_type: 'propose' | 'report' | 'feedback';
	url: string;
	description: string;
	email?: string;
}

export interface CreateFeedbackResponseDto {
	success: boolean;
	data: { id: string };
	message: string;
}

export interface CreateFeedbackProgrammerModel {
	success: boolean;
	message: string;
}

export interface FeedbackManagerProgrammerModel {
	success: boolean;
	message: string;
}

/** Programmer model for a single feedback item (returned by repository). */
export interface FeedbackProgrammerModel {
	id: string;
	feedbackType: string;
	url: string;
	description: string;
	email: string | null;
	isHandled: boolean;
	createdAt: string;
}

/** Internal DTO for GET /feedback response; API returns camelCase. */
export interface GetAllFeedbacksResponseDto {
	success: boolean;
	data: FeedbackProgrammerModel[];
	message: string;
}

export interface HandleFeedbackResponseDto {
	success: boolean;
	data: { id: string };
	message: string;
}

export interface FeedbackManagerProgrammerModel {
	success: boolean;
	message: string;
}

export interface FeedbackConfig {
	endpoints: {
		createFeedback: string;
		getAllFeedbacks: string;
		handleFeedback: (feedbackId: string) => string;
	};
}

export class FeedbackRepository {
	private httpGateway: HttpGateway;
	private config: FeedbackConfig;

	constructor(httpGateway: HttpGateway, config: FeedbackConfig) {
		this.httpGateway = httpGateway;
		this.config = { ...config };
	}

	public async createFeedback(
		payload: CreateFeedbackRequestDto,
		fetch?: typeof globalThis.fetch
	): Promise<CreateFeedbackProgrammerModel> {
		try {
			const { data, ok }: { data: CreateFeedbackResponseDto; ok: boolean } =
				await this.httpGateway.post<CreateFeedbackResponseDto>(
					this.config.endpoints.createFeedback,
					payload,
					{ withCredentials: true, fetch }
				);

			if (ok && data.success && data.data) {
				return {
					success: true,
					message: data.message
				};
			}

			return {
				success: false,
				message: data.message || 'Failed to submit feedback'
			};
		} catch (error) {
			if (error instanceof ApiError) {
				const { message } = (error.data as { message?: string }) ?? {};

				const isAuthError =
					error.status === 401 ||
					message?.toLowerCase().includes('no token provided') ||
					message?.toLowerCase().includes('invalid format') ||
					message?.toLowerCase().includes('authentication required') ||
					message?.toLowerCase().includes('auth error');

				return {
					success: false,
					message: isAuthError
						? 'You need to sign in first.'
						: (message || 'There was an error when submitting feedback.')
				};
			}
			return {
				success: false,
				message: 'There was an error when submitting feedback.'
			};
		}
	}

	public async getAllFeedbacks(fetch?: typeof globalThis.fetch): Promise<FeedbackProgrammerModel[]> {
		const { data: getAllFeedbacksDto, ok }: { data: GetAllFeedbacksResponseDto; ok: boolean } =
			await this.httpGateway.get<GetAllFeedbacksResponseDto>(this.config.endpoints.getAllFeedbacks, undefined, {
				withCredentials: true,
				fetch
			});

		if (ok && getAllFeedbacksDto?.success && Array.isArray(getAllFeedbacksDto.data)) {
			return getAllFeedbacksDto.data;
		}
		return [];
	}

	public async handleFeedback(
		feedbackId: string,
		isHandled: boolean,
		fetch?: typeof globalThis.fetch
	): Promise<FeedbackManagerProgrammerModel> {
		try {
			const { data: handleFeedbackDto, ok }: { data: HandleFeedbackResponseDto; ok: boolean } =
				await this.httpGateway.request<HandleFeedbackResponseDto>({
					method: HttpMethod.PATCH,
					url: this.config.endpoints.handleFeedback(feedbackId),
					data: { is_handled: isHandled },
					withCredentials: true,
					fetch
				});

			if (ok && handleFeedbackDto?.success) {
				return { success: true, message: handleFeedbackDto.message };
			}
			return { success: false, message: handleFeedbackDto?.message ?? 'Failed to update feedback' };
		} catch (error) {
			if (error instanceof ApiError) {
				const { message } = (error.data as { message?: string }) ?? {};
				return { success: false, message: message || 'There was an error when updating feedback.' };
			}
			return { success: false, message: 'There was an error when updating feedback.' };
		}
	}
}
