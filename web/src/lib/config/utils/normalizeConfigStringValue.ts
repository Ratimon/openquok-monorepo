/** Converts literal `\n` sequences from stored config into real newlines. */
export function normalizeConfigStringValue(value: string): string {
	return value.replace(/\\n/g, '\n');
}
