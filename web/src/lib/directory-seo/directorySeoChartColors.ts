/** Distinct series colors for Directory analytics charts (readable on dark cyberpunk theme). */
export const DIRECTORY_SEO_CHART_COLORS = [
	'var(--directory-seo-chart-1)',
	'var(--directory-seo-chart-2)',
	'var(--directory-seo-chart-3)',
	'var(--directory-seo-chart-4)',
	'var(--directory-seo-chart-5)'
] as const;

export function directorySeoChartColorAt(index: number): string {
	return DIRECTORY_SEO_CHART_COLORS[index % DIRECTORY_SEO_CHART_COLORS.length];
}
