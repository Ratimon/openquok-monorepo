import type { AnalyticsConfig } from '$lib/platform-analytics/Analytics.repository.svelte';
import { AnalyticsRepository } from '$lib/platform-analytics/Analytics.repository.svelte';
import { GetAnalyticsPresenter } from '$lib/platform-analytics/GetAnalytics.presenter.svelte';
import { httpGateway } from '$lib/core';

const analyticsBase = '/api/v1/analytics';

const analyticsConfig: AnalyticsConfig = {
	endpoints: {
		integrationAnalytics: (integrationId: string) =>
			`${analyticsBase}/${encodeURIComponent(integrationId)}`
	}
};

export const analyticsRepository = new AnalyticsRepository(httpGateway, analyticsConfig);

export const getAnalyticsPresenter = new GetAnalyticsPresenter(analyticsRepository);

export { AnalyticsRepository } from '$lib/platform-analytics/Analytics.repository.svelte';
export {
	GetAnalyticsPresenter,
	SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS,
	mapAnalyticsSeriesDto,
	mergeAnalyticsSeries,
	formatAnalyticsSeriesTotals
} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';
export type {
	AnalyticsSeriesProgrammerModel,
	AnalyticsSeriesViewModel,
	AnalyticsSeriesVm
} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';

