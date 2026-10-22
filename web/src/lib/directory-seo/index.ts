import { httpGateway } from '$lib/core/index';

import type { DirectorySeoConfig } from '$lib/directory-seo/constants/config';
import { DirectorySeoRepository } from '$lib/directory-seo/DirectorySeo.repository';
import { GetDirectorySeoPresenter } from '$lib/directory-seo/GetDirectorySeo.presenter.svelte';

const directorySeoConfig: DirectorySeoConfig = {
	endpoints: {
		workspaceOverview: '/api/v1/directory-seo/workspace/overview',
		workspaceHistory: '/api/v1/directory-seo/workspace/history',
		workspaceCompetitors: '/api/v1/directory-seo/workspace/competitors',
		workspaceRefresh: '/api/v1/directory-seo/workspace/refresh'
	}
};

export const directorySeoRepository = new DirectorySeoRepository(httpGateway, directorySeoConfig);

export const getDirectorySeoPresenter = new GetDirectorySeoPresenter(directorySeoRepository);

export { GetDirectorySeoPresenter } from '$lib/directory-seo/GetDirectorySeo.presenter.svelte';
export type {
	DirectorySeoHistoryCompareOptionViewModel,
	DirectorySeoRefreshControlsViewModel,
	DirectorySeoWorkspaceAnalyticsViewModel,
	DirectorySeoWorkspaceHistoryViewModel,
	DirectorySeoWorkspaceOverviewViewModel
} from '$lib/directory-seo/GetDirectorySeo.presenter.svelte';
export type { DirectorySeoHistoryChartSeriesViewModel } from '$lib/directory-seo/buildDirectorySeoHistoryChartSeries';

export type {
	DirectorySeoCompetitorDto,
	DirectorySeoDomainMetricDto,
	DirectorySeoHistoryPointDto,
	DirectorySeoWorkspaceOverviewDto
} from '$lib/directory-seo/directory-seo.types';
