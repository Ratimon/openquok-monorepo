/**
 * Open the directory submission page in a new tab; keeps the OpenQuok dashboard tab open.
 * With `noopener`, `window.open` often returns `null` even when the tab was created — do not use the return value as success signal.
 */
export function openDirectoryLaunchStartUrl(startUrl: string): void {
	const url = startUrl.trim();
	if (!url) return;
	window.open(url, '_blank', 'noopener,noreferrer');
}
