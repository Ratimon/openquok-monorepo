import { httpGateway } from '$lib/core/index';

import type { DirectorySeoConfig } from '$lib/directory-seo/constants/config';
import { DirectorySeoRepository } from '$lib/directory-seo/DirectorySeo.repository';

const directorySeoConfig: DirectorySeoConfig = {
	endpoints: {
		workspaceOverview: '/api/v1/directory-seo/workspace/overview',
		workspaceHistory: '/api/v1/directory-seo/workspace/history',
		workspaceCompetitors: '/api/v1/directory-seo/workspace/competitors',
		workspaceRefresh: '/api/v1/directory-seo/workspace/refresh'
	}
};

export const directorySeoRepository = new DirectorySeoRepository(httpGateway, directorySeoConfig);

export type {
	DirectorySeoCompetitorDto,
	DirectorySeoDomainMetricDto,
	DirectorySeoHistoryPointDto,
	DirectorySeoWorkspaceOverviewDto
} from '$lib/directory-seo/directory-seo.types';
