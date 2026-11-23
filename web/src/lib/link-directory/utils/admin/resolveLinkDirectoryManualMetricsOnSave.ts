type SiteMetricsSnapshot = {
	domainRating: number | null | undefined;
	domainAuthority: number | null | undefined;
	monthlyVisits: number | null | undefined;
	metricsSource: string | null | undefined;
	metricsUpdatedAt: string | null | undefined;
};

type ManualMetricsInput = {
	domainRating: number | null;
	domainAuthority: number | null;
	monthlyVisits: number | null;
	metricsSource: string | null;
};

export type LinkDirectoryManualMetricsSaveFields = {
	metrics_source?: string | null;
	metrics_updated_at?: string;
};

/** Stamp source and updated-at when editors change manual site metrics (v1). */
export function resolveLinkDirectoryManualMetricsOnSave(
	previous: SiteMetricsSnapshot | null | undefined,
	input: ManualMetricsInput
): LinkDirectoryManualMetricsSaveFields {
	const trimmedSource = input.metricsSource?.trim() ?? '';
	const nextSource = trimmedSource.length > 0 ? trimmedSource : null;

	const metricsChanged =
		input.domainRating !== (previous?.domainRating ?? null) ||
		input.domainAuthority !== (previous?.domainAuthority ?? null) ||
		input.monthlyVisits !== (previous?.monthlyVisits ?? null) ||
		nextSource !== (previous?.metricsSource?.trim() ? previous.metricsSource.trim() : null);

	const hasAnyMetric =
		input.domainRating != null || input.domainAuthority != null || input.monthlyVisits != null;

	if (!metricsChanged && !(previous == null && hasAnyMetric)) {
		return {};
	}

	const patch: LinkDirectoryManualMetricsSaveFields = {
		metrics_updated_at: new Date().toISOString()
	};

	if (nextSource != null) {
		patch.metrics_source = nextSource;
	} else if (hasAnyMetric) {
		patch.metrics_source = 'Manual editor entry';
	}

	return patch;
}
