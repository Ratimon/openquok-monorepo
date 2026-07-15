/**
 * Maps OpenQuok `data-theme` to Streamdown / Shiki theme ids.
 * `forest` (and any non-light theme) → dark; `light` → light.
 */
export type StreamdownShikiThemeId = 'github-dark-default' | 'github-light-default';

function readThemeFromDocument(): StreamdownShikiThemeId {
	if (typeof document === 'undefined') return 'github-dark-default';
	const theme = document.documentElement.getAttribute('data-theme');
	return theme === 'light' ? 'github-light-default' : 'github-dark-default';
}

/** Reactive Streamdown Shiki theme from `html[data-theme]`. */
export function createStreamdownShikiTheme() {
	let current = $state<StreamdownShikiThemeId>(readThemeFromDocument());

	$effect(() => {
		if (typeof document === 'undefined') return;

		const sync = () => {
			current = readThemeFromDocument();
		};

		sync();
		const observer = new MutationObserver(sync);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		return () => observer.disconnect();
	});

	return {
		get current() {
			return current;
		}
	};
}
