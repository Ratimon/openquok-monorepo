import type { HttpGateway } from '$lib/core/HttpGateway';
import { HttpMethod } from '$lib/core/HttpGateway';

import type { DirectorySeoConfig } from '$lib/directory-seo/constants/config';
import type {
	DirectorySeoCompetitorDto,
	DirectorySeoWorkspaceHistoryDto,
	DirectorySeoWorkspaceOverviewDto
} from '$lib/directory-seo/directory-seo.types';

type ListResponseDto<T> = { success: boolean; data: T };

export class DirectorySeoRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: DirectorySeoConfig
	) {}

	async getWorkspaceOverview(params: {
		organizationId: string;
		productProfileId: string;
	}): Promise<DirectorySeoWorkspaceOverviewDto | null> {
		const { data: overviewDto, ok } = await this.httpGateway.get<
			ListResponseDto<DirectorySeoWorkspaceOverviewDto>
		>(
			this.config.endpoints.workspaceOverview,
			{
				organizationId: params.organizationId,
				productProfileId: params.productProfileId
			},
			{ withCredentials: true }
		);
		if (ok && overviewDto?.data) {
			return overviewDto.data;
		}
		return null;
	}

	async getWorkspaceHistory(params: {
		organizationId: string;
		productProfileId: string;
		days: number;
	}): Promise<DirectorySeoWorkspaceHistoryDto> {
		const { data: historyDto, ok } = await this.httpGateway.get<
			ListResponseDto<DirectorySeoWorkspaceHistoryDto>
		>(
			this.config.endpoints.workspaceHistory,
			{
				organizationId: params.organizationId,
				productProfileId: params.productProfileId,
				days: params.days
			},
			{ withCredentials: true }
		);
		if (ok && historyDto?.data) {
			return historyDto.data;
		}
		return { product: [], competitors: [] };
	}

	async addCompetitor(payload: {
		organizationId: string;
		domain: string;
		label?: string | null;
	}): Promise<{ ok: true; competitor: DirectorySeoCompetitorDto } | { ok: false; error: string }> {
		const { data: addDto, ok } = await this.httpGateway.post<ListResponseDto<DirectorySeoCompetitorDto>>(
			this.config.endpoints.workspaceCompetitors,
			payload,
			{ withCredentials: true }
		);
		if (ok && addDto?.data) {
			return { ok: true, competitor: addDto.data };
		}
		return { ok: false, error: 'Could not add competitor.' };
	}

	async updateCompetitor(payload: {
		organizationId: string;
		domain: string;
		label: string | null;
	}): Promise<{ ok: true; competitor: DirectorySeoCompetitorDto } | { ok: false; error: string }> {
		const { data: patchDto, ok } = await this.httpGateway.patch<ListResponseDto<DirectorySeoCompetitorDto>>(
			this.config.endpoints.workspaceCompetitors,
			payload,
			{ withCredentials: true }
		);
		if (ok && patchDto?.data) {
			return { ok: true, competitor: patchDto.data };
		}
		return { ok: false, error: 'Could not update competitor label.' };
	}

	async deleteCompetitor(payload: {
		organizationId: string;
		domain: string;
	}): Promise<{ ok: boolean; error?: string }> {
		const { ok } = await this.httpGateway.request<{ success: boolean }>({
			method: HttpMethod.DELETE,
			url: this.config.endpoints.workspaceCompetitors,
			data: payload,
			withCredentials: true
		});
		return ok ? { ok: true } : { ok: false, error: 'Could not remove competitor.' };
	}

	async refreshWorkspace(payload: {
		organizationId: string;
		productProfileId: string;
		force?: boolean;
	}): Promise<
		{ ok: true; overview: DirectorySeoWorkspaceOverviewDto } | { ok: false; error: string }
	> {
		const { data: refreshDto, ok } = await this.httpGateway.post<
			ListResponseDto<DirectorySeoWorkspaceOverviewDto> & { message?: string }
		>(this.config.endpoints.workspaceRefresh, payload, { withCredentials: true });
		if (ok && refreshDto?.data) {
			return { ok: true, overview: refreshDto.data };
		}
		const message =
			typeof refreshDto?.message === 'string' && refreshDto.message.trim()
				? refreshDto.message.trim()
				: 'Could not refresh directory ratings.';
		return { ok: false, error: message };
	}
}
