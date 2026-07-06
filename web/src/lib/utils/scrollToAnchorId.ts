const DEFAULT_SCROLL_OFFSET_PX = 16;

function scrollBehavior(): ScrollBehavior {
	if (typeof window === 'undefined') return 'smooth';
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

/** Smooth-scroll the window so `document.getElementById(id)` sits below the top offset. */
export function scrollToAnchorId(id: string, offsetPx = DEFAULT_SCROLL_OFFSET_PX): boolean {
	if (typeof document === 'undefined') return false;

	const anchor = document.getElementById(id);
	if (!anchor) return false;

	const top = anchor.getBoundingClientRect().top + window.scrollY - offsetPx;
	window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior() });
	return true;
}
