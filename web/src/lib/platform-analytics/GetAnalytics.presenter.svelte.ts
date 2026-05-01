import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
import type { AnalyticsRepository } from './Analytics.repository.svelte';

/** Raw analytics series row from `GET /api/v1/analytics/:integrationId`. */
export type AnalyticsSeriesProgrammerModel = {
	label: string;
	data: Array<{ total: string; date: string }>;
	percentageChange?: number;
	average?: boolean;
};

/** Normalized series for charts / cards (`total` coerced to number). */
export type AnalyticsSeriesViewModel = {
	label: string;
	data: Array<{ total: number; date: string }>;
	percentageChange?: number;
	average?: boolean;
};

/** Alias for UI card props — same shape as {@link AnalyticsSeriesViewModel}. */
export type AnalyticsSeriesVm = AnalyticsSeriesViewModel;

export function mapAnalyticsSeriesDto(dto: AnalyticsSeriesProgrammerModel[]): AnalyticsSeriesViewModel[] {
	return (dto ?? []).map((s) => ({
		label: s.label,
		average: s.average,
		percentageChange: s.percentageChange,
		data: (s.data ?? []).map((p) => ({
			date: String(p.date ?? ''),
			total: Number(p.total ?? 0)
		}))
	}));
}

export function mergeAnalyticsSeries(all: AnalyticsSeriesViewModel[][]): AnalyticsSeriesViewModel[] {
	const map = new Map<string, AnalyticsSeriesViewModel>();

	for (const list of all) {
		for (const s of list) {
			const key = s.label;
			if (!map.has(key)) {
				map.set(key, { ...s, data: [...s.data] });
				continue;
			}
			const existing = map.get(key)!;
			const byDate = new Map(existing.data.map((p) => [p.date, p.total]));
			for (const p of s.data) {
				byDate.set(p.date, (byDate.get(p.date) ?? 0) + p.total);
			}
			existing.data = [...byDate.entries()]
				.map(([date, total]) => ({ date, total }))
				.sort((a, b) => a.date.localeCompare(b.date));
		}
	}
	return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function formatAnalyticsSeriesTotals(list: AnalyticsSeriesViewModel[]): string[] {
	return list.map((p) => {
		const sum = (p.data ?? []).reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
		const value = p.average ? sum / Math.max(1, p.data.length) : sum;
		if (p.average) return `${value.toFixed(2)}%`;
		return new Intl.NumberFormat().format(Math.round(value));
	});
}

/**
 * Loads merged integration analytics for the analytics overview grid.
 */
export class GetAnalyticsPresenter {
	loading = $state(false);
	error = $state<string | null>(null);
	mergedSeries = $state<AnalyticsSeriesViewModel[]>([]);
	formattedTotals = $state<string[]>([]);

	constructor(private readonly analyticsRepository: AnalyticsRepository) {}

	async loadMergedAnalytics(params: {
		organizationId: string | null;
		integrations: CreateSocialPostChannelViewModel[];
		dateWindowDays: number;
	}): Promise<void> {
		const { organizationId, integrations, dateWindowDays } = params;

		this.error = null;
		this.mergedSeries = [];
		this.formattedTotals = [];

		if (!organizationId || integrations.length === 0) return;

		this.loading = true;
		try {
			const results = await Promise.all(
				integrations.map((i) =>
					this.analyticsRepository.getIntegrationAnalytics({
						organizationId,
						integrationId: i.id,
						date: dateWindowDays
					})
				)
			);

			const ok = results.filter((r): r is { ok: true; data: AnalyticsSeriesProgrammerModel[] } => r.ok);
			if (ok.length === 0) {
				const firstErr = results.find((r) => !r.ok) as { ok: false; error: string } | undefined;
				this.error = firstErr?.error ?? 'Failed to load analytics.';
				return;
			}

			const merged = mergeAnalyticsSeries(ok.map((r) => mapAnalyticsSeriesDto(r.data)));
			this.mergedSeries = merged;
			this.formattedTotals = formatAnalyticsSeriesTotals(merged);
		} catch {
			this.error = 'Failed to load analytics.';
		} finally {
			this.loading = false;
		}
	}
}
