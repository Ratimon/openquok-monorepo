import type { AnalyticsSeriesProgrammerModel, AnalyticsRepository } from '$lib/platform-analytics/Analytics.repository.svelte';
import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';

/** Channel fields needed to attribute a series to one connected integration. */
export type AnalyticsSeriesChannelSourceVm = Pick<
	CreateSocialPostChannelViewModel,
	'id' | 'identifier' | 'name'
>;

/** Normalized series for charts / cards (`total` coerced to number). */
export type AnalyticsSeriesViewModel = {
	label: string;
	data: Array<{ total: number; date: string }>;
	percentageChange?: number;
	average?: boolean;
	/** Stable integration id for list keys when series are flattened per channel. */
	integrationId?: string;
	/** Provider slug for icon + display label on overview cards. */
	providerIdentifier?: string;
	/** Integration display name (channel chip). */
	channelName?: string;
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

/**
 * Zip each integration with its mapped series and attach channel attribution.
 * Does not merge by label — duplicate labels from different channels stay as separate series.
 */
export function flattenIntegrationAnalyticsSeriesVm(
	integrations: readonly AnalyticsSeriesChannelSourceVm[],
	results: AnalyticsSeriesViewModel[][]
): AnalyticsSeriesViewModel[] {
	const flattened: AnalyticsSeriesViewModel[] = [];
	const count = Math.min(integrations.length, results.length);
	for (let i = 0; i < count; i++) {
		const integration = integrations[i];
		if (!integration) continue;
		const seriesList = results[i] ?? [];
		for (const series of seriesList) {
			flattened.push({
				...series,
				integrationId: integration.id,
				providerIdentifier: integration.identifier,
				channelName: integration.name
			});
		}
	}
	return flattened;
}

export function mergeAnalyticsSeriesVm(allVm: AnalyticsSeriesViewModel[][]): AnalyticsSeriesViewModel[] {
	const map = new Map<string, AnalyticsSeriesViewModel>();

	for (const list of allVm) {
		for (const vm of list) {
			const key = vm.label;
			if (!map.has(key)) {
				map.set(key, {
					label: vm.label,
					average: vm.average,
					percentageChange: vm.percentageChange,
					data: [...vm.data]
				});
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

/** Normalized metric families for the workspace overview chart and summary row. */
export type AnalyticsMetricFamily = 'views' | 'engagement' | 'followers';

export const ANALYTICS_METRIC_FAMILIES: readonly AnalyticsMetricFamily[] = [
	'views',
	'engagement',
	'followers'
];

export const ANALYTICS_METRIC_FAMILY_LABELS: Record<AnalyticsMetricFamily, string> = {
	views: 'Views',
	engagement: 'Engagement',
	followers: 'Followers'
};

export type AnalyticsOverviewSummaryItemVm = {
	family: AnalyticsMetricFamily;
	label: string;
	formattedTotal: string;
	channelCount: number;
	/** When channels use different source labels for the same family. */
	mixedSourceLabels: boolean;
};

export type AnalyticsOverviewChartLineVm = {
	integrationId: string;
	channelName: string;
	providerIdentifier: string;
	sourceMetricLabel: string;
	colorIndex: number;
	points: Array<{ date: string; total: number }>;
};

export type AnalyticsOverviewChartVm = {
	family: AnalyticsMetricFamily;
	dates: string[];
	lines: AnalyticsOverviewChartLineVm[];
};

const ENGAGEMENT_TERMS = [
	'engagement',
	'like',
	'comment',
	'share',
	'save',
	'reaction',
	'reply',
	'repost',
	'quote',
	'bookmark',
	'click'
] as const;

const VIEWS_TERMS = ['view', 'impression', 'reach'] as const;

const FOLLOWERS_TERMS = ['follower', 'subscriber'] as const;

function normalizeOverviewMetricLabel(label: string): string {
	return label.trim().toLowerCase();
}

function overviewLabelMatchesTerm(normalized: string, term: string): boolean {
	if (term === 'view') {
		return normalized.includes('view') && !normalized.includes('review');
	}
	return normalized.includes(term);
}

function scoreOverviewLabelForFamily(normalized: string, family: AnalyticsMetricFamily): number {
	if (family === 'followers') {
		if (normalized.includes('lost') || normalized.includes('gained')) {
			if (normalized.includes('subscriber') || normalized.includes('follower')) return 12;
		}
		for (const term of FOLLOWERS_TERMS) {
			if (overviewLabelMatchesTerm(normalized, term)) return 10;
		}
		return 0;
	}

	if (family === 'engagement') {
		for (const term of ENGAGEMENT_TERMS) {
			if (overviewLabelMatchesTerm(normalized, term)) return 10;
		}
		return 0;
	}

	if (normalized.includes('engagement')) return 0;
	for (const term of VIEWS_TERMS) {
		if (overviewLabelMatchesTerm(normalized, term)) return 10;
	}
	if (normalized.includes('watch') && !normalized.includes('watch time')) return 8;
	return 0;
}

function overviewSeriesPeriodTotal(series: AnalyticsSeriesViewModel): number {
	const sum = (series.data ?? []).reduce((acc, p) => acc + (Number(p.total) || 0), 0);
	if (series.average) return sum / Math.max(1, series.data.length);
	return sum;
}

function formatOverviewTotal(value: number, average?: boolean): string {
	if (average) return `${value.toFixed(2)}%`;
	return new Intl.NumberFormat().format(Math.round(value));
}

function groupOverviewSeriesByIntegration(
	seriesVm: readonly AnalyticsSeriesViewModel[]
): Map<string, AnalyticsSeriesViewModel[]> {
	const map = new Map<string, AnalyticsSeriesViewModel[]>();
	for (const series of seriesVm) {
		const id = series.integrationId?.trim() || 'unknown';
		const list = map.get(id) ?? [];
		list.push(series);
		map.set(id, list);
	}
	return map;
}

/** Pick the best-matching series for a metric family on one channel. */
export function pickSeriesForMetricFamily(
	seriesList: readonly AnalyticsSeriesViewModel[],
	family: AnalyticsMetricFamily
): AnalyticsSeriesViewModel | null {
	let best: AnalyticsSeriesViewModel | null = null;
	let bestScore = 0;

	for (const series of seriesList) {
		const normalized = normalizeOverviewMetricLabel(series.label);
		const score = scoreOverviewLabelForFamily(normalized, family);
		if (score <= 0) continue;

		const dataLen = series.data?.length ?? 0;
		const beatsCurrent =
			!best ||
			score > bestScore ||
			(score === bestScore && dataLen > (best.data?.length ?? 0)) ||
			(score === bestScore &&
				dataLen === (best.data?.length ?? 0) &&
				series.label.localeCompare(best.label) < 0);

		if (beatsCurrent) {
			best = series;
			bestScore = score;
		}
	}

	return best;
}

/** Headline totals: one primary series per channel per family, summed across channels. */
export function buildAnalyticsOverviewSummaryVm(
	seriesVm: readonly AnalyticsSeriesViewModel[]
): AnalyticsOverviewSummaryItemVm[] {
	const byIntegration = groupOverviewSeriesByIntegration(seriesVm);

	return ANALYTICS_METRIC_FAMILIES.map((family) => {
		const picks: AnalyticsSeriesViewModel[] = [];
		for (const list of byIntegration.values()) {
			const picked = pickSeriesForMetricFamily(list, family);
			if (picked) picks.push(picked);
		}

		const total = picks.reduce((acc, s) => acc + overviewSeriesPeriodTotal(s), 0);
		const sourceLabels = new Set(picks.map((s) => s.label));
		const anyAverage = picks.some((s) => s.average);

		return {
			family,
			label: ANALYTICS_METRIC_FAMILY_LABELS[family],
			formattedTotal: picks.length === 0 ? '—' : formatOverviewTotal(total, anyAverage),
			channelCount: picks.length,
			mixedSourceLabels: sourceLabels.size > 1
		};
	});
}

/** One line per channel for the selected metric family (daily `data` from existing series). */
export function buildAnalyticsOverviewChartVm(
	seriesVm: readonly AnalyticsSeriesViewModel[],
	family: AnalyticsMetricFamily
): AnalyticsOverviewChartVm {
	const byIntegration = groupOverviewSeriesByIntegration(seriesVm);
	const integrationOrder = [...byIntegration.keys()];

	const lines: AnalyticsOverviewChartLineVm[] = [];
	const dateSet = new Set<string>();

	integrationOrder.forEach((integrationId, colorIndex) => {
		const list = byIntegration.get(integrationId) ?? [];
		const picked = pickSeriesForMetricFamily(list, family);
		if (!picked) return;

		const first = list[0];
		const points = (picked.data ?? []).map((p) => ({
			date: String(p.date ?? ''),
			total: Number(p.total ?? 0)
		}));
		for (const p of points) {
			if (p.date) dateSet.add(p.date);
		}

		lines.push({
			integrationId,
			channelName: picked.channelName ?? first?.channelName ?? '',
			providerIdentifier: picked.providerIdentifier ?? first?.providerIdentifier ?? '',
			sourceMetricLabel: picked.label,
			colorIndex,
			points
		});
	});

	const dates = [...dateSet].sort((a, b) => a.localeCompare(b));

	return { family, dates, lines };
}

/** Map aligned y values for SVG rendering (same order as `dates`). */
export function alignChartLineValues(
	line: AnalyticsOverviewChartLineVm,
	dates: readonly string[]
): number[] {
	const byDate = new Map(line.points.map((p) => [p.date, p.total]));
	return dates.map((date) => byDate.get(date) ?? 0);
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
		const seriesVm = mergeAnalyticsSeriesVm([mapAnalyticsSeriesVm(postAnalyticsPm.data)]);
		const totalsVm = formatAnalyticsSeriesTotalsVm(seriesVm);
		return { seriesVm, totalsVm };
	}

	/**
	 * Workspace `/account/analytics`: parallel integration PMs → flattened series VM list
	 * with per-channel attribution. Same-label metrics from different channels are not summed.
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

		const attributedOk = params.integrations.flatMap((integration, index) => {
			const resultPm = integrationAnalyticsResultsPm[index];
			return resultPm?.ok ? [{ integration, data: resultPm.data }] : [];
		});
		if (attributedOk.length === 0) {
			const firstErrPm = integrationAnalyticsResultsPm.find(
				(resultPm) => !resultPm.ok
			) as { ok: false; error: string } | undefined;
			throw new Error(firstErrPm?.error ?? 'Failed to load analytics.');
		}

		return flattenIntegrationAnalyticsSeriesVm(
			attributedOk.map((row) => row.integration),
			attributedOk.map((row) => mapAnalyticsSeriesVm(row.data))
		);
	}
}
