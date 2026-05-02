import type { HttpGateway } from '$lib/core/HttpGateway';
import { ApiError } from '$lib/core/HttpGateway';

/** Raw analytics series row from `GET /api/v1/analytics/:integrationId`. */
export type AnalyticsSeriesProgrammerModel = {
	label: string;
	data: Array<{ total: string; date: string }>;
	percentageChange?: number;
	average?: boolean;
};

export interface AnalyticsConfig {
	endpoints: {
		integrationAnalytics: (integrationId: string) => string;
		postAnalytics: (postId: string) => string;
	};
}

export type GetIntegrationAnalyticsResponseDto = {
	success?: boolean;
	data?: AnalyticsSeriesProgrammerModel[];
	message?: string;
	[key: string]: unknown;
};

export type GetPostAnalyticsResponseDto = {
	success?: boolean;
	data?: AnalyticsSeriesProgrammerModel[] | { missing: true };
	message?: string;
	[key: string]: unknown;
};

export class AnalyticsRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: AnalyticsConfig
	) {}

	async getIntegrationAnalytics(params: {
		organizationId: string;
		integrationId: string;
		date: number;
	}): Promise<{ ok: true; data: AnalyticsSeriesProgrammerModel[] } | { ok: false; error: string }> {
		try {
			const url = this.config.endpoints.integrationAnalytics(params.integrationId);
			const { ok, data: dto } = await this.httpGateway.get<GetIntegrationAnalyticsResponseDto>(
				url,
				{ organizationId: params.organizationId, date: String(params.date) },
				{ withCredentials: true }
			);

			if (ok && dto?.success === true && Array.isArray(dto?.data)) {
				return { ok: true, data: dto.data };
			}
			const message = typeof dto?.message === 'string' ? dto.message : null;
			return { ok: false, error: message || 'Failed to load analytics.' };
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				('message' in error.data || 'msg' in error.data)
			) {
				return {
					ok: false,
					error: String(
						(error.data as { message?: string; msg?: string }).message ??
							(error.data as { message?: string; msg?: string }).msg
					)
				};
			}
			return { ok: false, error: 'Failed to load analytics.' };
		}
	}

	async getPostAnalytics(params: {
		organizationId: string;
		postId: string;
		date: number;
	}): Promise<
		| { ok: true; data: AnalyticsSeriesProgrammerModel[] }
		| { ok: true; missing: true }
		| { ok: false; error: string }
	> {
		try {
			const url = this.config.endpoints.postAnalytics(params.postId);
			const { ok, data: dto } = await this.httpGateway.get<GetPostAnalyticsResponseDto>(
				url,
				{ organizationId: params.organizationId, date: String(params.date) },
				{ withCredentials: true }
			);

			if (
				ok &&
				dto?.success === true &&
				dto.data &&
				typeof dto.data === 'object' &&
				!Array.isArray(dto.data) &&
				(dto.data as { missing?: boolean }).missing === true
			) {
				return { ok: true, missing: true };
			}
			if (ok && dto?.success === true && Array.isArray(dto?.data)) {
				return { ok: true, data: dto.data };
			}
			const message = typeof dto?.message === 'string' ? dto.message : null;
			return { ok: false, error: message || 'Failed to load analytics.' };
		} catch (error) {
			if (
				error instanceof ApiError &&
				typeof error.data === 'object' &&
				error.data !== null &&
				('message' in error.data || 'msg' in error.data)
			) {
				return {
					ok: false,
					error: String(
						(error.data as { message?: string; msg?: string }).message ??
							(error.data as { message?: string; msg?: string }).msg
					)
				};
			}
			return { ok: false, error: 'Failed to load analytics.' };
		}
	}
}

