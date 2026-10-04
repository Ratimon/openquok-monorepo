/**
 * Long-tail H1 / meta title for catalog filter pages (category, tag, combined filters).
 * Pattern: `{Subject} · {suffix}` — suffix comes from each hub's `filterPageTitleSuffix` config.
 */
export function formatHubFilterHeroTitle(
	filterPageTitleSuffix: string,
	...subjectParts: string[]
): string {
	const suffix = filterPageTitleSuffix.trim();
	const subjects = subjectParts.map((part) => part.trim()).filter(Boolean);
	if (subjects.length === 0) {
		return suffix || 'Filter';
	}
	if (!suffix) {
		return subjects.join(' · ');
	}
	return [...subjects, suffix].join(' · ');
}
