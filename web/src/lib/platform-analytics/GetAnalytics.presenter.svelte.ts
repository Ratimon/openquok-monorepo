import type { AnalyticsSeriesProgrammerModel } from '$lib/platform-analytics/Analytics.repository.svelte';
import type { AnalyticsRepository } from '$lib/platform-analytics/Analytics.repository.svelte';
import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

/** Normalized series for charts / cards (`total` coerced to number). */
export type AnalyticsSeriesViewModel = {
	label: string;
	data: Array<{ total: number; date: string }>;
	percentageChange?: number;
	average?: boolean;
};

/** Alias for UI card props — same shape as {@link AnalyticsSeriesViewModel}. */
export type AnalyticsSeriesVm = AnalyticsSeriesViewModel;

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

export type LoadMergedAnalyticsResultViewModel =
	| {
			ok: true;
			mergedSeriesVm: AnalyticsSeriesViewModel[];
			mergedTotalsVm: string[];
	  }
	| { ok: false; error: string };

/**
 * ✅ Stateless “Get*” presenter:
 * - loads analytics PM via {@link AnalyticsRepository}
 */
export class GetAnalyticsPresenter {
	constructor(private readonly analyticsRepository: AnalyticsRepository) {}

	async loadMergedAnalyticsVmStateless(params: {
		organizationId: string;
		integrations: CreateSocialPostChannelViewModel[];
		dateWindowDays: number;
	}): Promise<LoadMergedAnalyticsResultViewModel> {
		try {
			const results = await Promise.all(
				params.integrations.map((i) =>
					this.analyticsRepository.getIntegrationAnalytics({
						organizationId: params.organizationId,
						integrationId: i.id,
						date: params.dateWindowDays
					})
				)
			);

			const ok = results.filter(
				(r): r is { ok: true; data: AnalyticsSeriesProgrammerModel[] } => r.ok
			);
			if (ok.length === 0) {
				const firstErr = results.find((r) => !r.ok) as { ok: false; error: string } | undefined;
				return { ok: false, error: firstErr?.error ?? 'Failed to load analytics.' };
			}

			const mergedSeriesVm = mergeAnalyticsSeriesVm(ok.map((r) => mapAnalyticsSeriesVm(r.data)));
			const mergedTotalsVm = formatAnalyticsSeriesTotalsVm(mergedSeriesVm);
			return { ok: true, mergedSeriesVm, mergedTotalsVm };
		} catch {
			return { ok: false, error: 'Failed to load analytics.' };
		}
	}
}
