export type DeferredWorkPriority = 'soon' | 'idle';

/**
 * Run work after the current navigation/paint cycle so first paint is not blocked.
 * - `soon`: after the next frame (good for section data that should load quickly).
 * - `idle`: when the browser is idle (good for badges, previews, enrichment).
 */
export function scheduleDeferredWork(
	callback: () => void,
	priority: DeferredWorkPriority = 'idle'
): void {
	if (typeof window === 'undefined') return;

	const run = () => {
		void callback();
	};

	if (priority === 'soon') {
		requestAnimationFrame(() => {
			requestAnimationFrame(run);
		});
		return;
	}

	if ('requestIdleCallback' in window) {
		requestIdleCallback(run, { timeout: 3000 });
		return;
	}

	setTimeout(run, 100);
}
