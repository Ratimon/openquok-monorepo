import type { AnalyticsSeriesProgrammerModel, AnalyticsRepository } from '$lib/platform-analytics/Analytics.repository.svelte';
import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

/** Normalized series for charts / cards (`total` coerced to number). */
export type AnalyticsSeriesViewModel = {
	label: string;
	data: Array<{ total: number; date: string }>;
	percentageChange?: number;
	average?: boolean;
};

export function mapAnalyticsSeriesVm(pms: AnalyticsSeriesProgrammerModel[]): AnalyticsSeriesViewModel[] {
	return (pms ?? []).map((pm) => ({
		label: pm.label,
		average: pm.average,
		percentageChange: pm.percentageChange,
		data: (pm.data ?? []).map((pm) => ({
			date: String(pm.date ?? ''),
			total: Number(pm.total ?? 0)
		}))
	}));
}

export function mergeAnalyticsSeriesVm(allVm: AnalyticsSeriesViewModel[][]): AnalyticsSeriesViewModel[] {
	const map = new Map<string, AnalyticsSeriesViewModel>();

	for (const list of allVm) {
		for (const vm of list) {
			const key = vm.label;
			if (!map.has(key)) {
				map.set(key, { ...vm, data: [...vm.data] });
				continue;
			}
			const existing = map.get(key)!;
			const byDate = new Map(existing.data.map((p) => [p.date, p.total]));
			for (const p of vm.data) {
				byDate.set(p.date, (byDate.get(p.date) ?? 0) + p.total);
			}
			existing.data = [...byDate.entries()]
				.map(([date, total]) => ({ date, total }))
				.sort((a, b) => a.date.localeCompare(b.date));
		}
	}
	return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function formatAnalyticsSeriesTotalsVm(listsVm: AnalyticsSeriesViewModel[]): string[] {
	return listsVm.map((vm) => {
		const sum = (vm.data ?? []).reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
		const value = vm.average ? sum / Math.max(1, vm.data.length) : sum;
		if (vm.average) return `${value.toFixed(2)}%`;
		return new Intl.NumberFormat().format(Math.round(value));
	});
}

/** Route/repository params for post-level analytics (`GET …/analytics/post/:postId`). */
export interface PostStatisticsAnalyticsParams {
	organizationId: string;
	postId: string;
	date: number;
}

/**
 * Calendar statistics modal: merged series + formatted totals; optional `error` / `missing` mirror repository PM.
 */
export interface PostStatisticsAnalyticsViewModel {
	seriesVm: AnalyticsSeriesViewModel[];
	totalsVm: string[];
	/** When `true`, the post has no linked release; UI should prompt to pick a published asset. */
	missing?: boolean;
	/** Set when the repository call failed; `seriesVm` / `totalsVm` are empty. */
	error?: string;
}

/**
 * ✅ Stateless “Get*” presenter:
 * - loads analytics PM via {@link AnalyticsRepository}; maps PM → VM only.
 */
export class GetAnalyticsPresenter {
	constructor(private readonly analyticsRepository: AnalyticsRepository) {}

	/**
	 * Calendar / statistics modal: post analytics PM → {@link PostStatisticsAnalyticsViewModel}.
	 */
	async loadPostStatisticsAnalyticsVm(
		params: PostStatisticsAnalyticsParams
	): Promise<PostStatisticsAnalyticsViewModel> {
		const postAnalyticsPm = await this.analyticsRepository.getPostAnalytics(params);
		if (!postAnalyticsPm.ok) {
			return { seriesVm: [], totalsVm: [], error: postAnalyticsPm.error };
		}
		if ('missing' in postAnalyticsPm && postAnalyticsPm.missing) {
			return { seriesVm: [], totalsVm: [], missing: true };
		}
		if (!('data' in postAnalyticsPm) || !Array.isArray(postAnalyticsPm.data)) {
			return { seriesVm: [], totalsVm: [] };
		}
		const seriesVm = mapAnalyticsSeriesVm(postAnalyticsPm.data);
		const totalsVm = formatAnalyticsSeriesTotalsVm(seriesVm);
		return { seriesVm, totalsVm };
	}

	/**
	 * Merged integration analytics for `/account/analytics`: parallel integration PMs → one merged series VM list.
	 */
	async loadMergedAnalyticsSeriesVm(params: {
		organizationId: string;
		integrations: CreateSocialPostChannelViewModel[];
		dateWindowDays: number;
	}): Promise<AnalyticsSeriesViewModel[]> {
		const integrationAnalyticsResultsPm = await Promise.all(
			params.integrations.map((i) =>
				this.analyticsRepository.getIntegrationAnalytics({
					organizationId: params.organizationId,
					integrationId: i.id,
					date: params.dateWindowDays
				})
			)
		);

		const integrationAnalyticsOkPm = integrationAnalyticsResultsPm.filter(
			(resultPm): resultPm is { ok: true; data: AnalyticsSeriesProgrammerModel[] } => resultPm.ok
		);
		if (integrationAnalyticsOkPm.length === 0) {
			const firstErrPm = integrationAnalyticsResultsPm.find(
				(resultPm) => !resultPm.ok
			) as { ok: false; error: string } | undefined;
			throw new Error(firstErrPm?.error ?? 'Failed to load analytics.');
		}

		const mergedSeriesVm = mergeAnalyticsSeriesVm(
			integrationAnalyticsOkPm.map((resultPm) => mapAnalyticsSeriesVm(resultPm.data))
		);
		return mergedSeriesVm;
	}
}
