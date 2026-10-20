export const DIRECTORY_SEO_HISTORY_WINDOW_DAYS = [7, 30, 90] as const;

export type DirectorySeoHistoryWindowDays = (typeof DIRECTORY_SEO_HISTORY_WINDOW_DAYS)[number];

export function isDirectorySeoHistoryWindowDays(value: number): value is DirectorySeoHistoryWindowDays {
	return DIRECTORY_SEO_HISTORY_WINDOW_DAYS.includes(value as DirectorySeoHistoryWindowDays);
}
