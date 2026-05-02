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
	mapAnalyticsSeriesVm,
	mergeAnalyticsSeriesVm,
	formatAnalyticsSeriesTotalsVm
} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';
export {
	SUPPORTED_ANALYTICS_PROVIDER_IDENTIFIERS,
	type SupportedAnalyticsProviderIdentifier
} from '$data/social-providers';
export type {
	AnalyticsSeriesViewModel,
	AnalyticsSeriesVm
} from '$lib/platform-analytics/GetAnalytics.presenter.svelte';
export type { AnalyticsSeriesProgrammerModel } from '$lib/platform-analytics/Analytics.repository.svelte';

