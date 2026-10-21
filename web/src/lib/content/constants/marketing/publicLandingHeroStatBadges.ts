export type PublicLandingHeroStatBadge = {
	id: string;
	/** Large headline on the card. */
	value: string;
	/** Caption under the value. */
	label: string;
	/** When set, the card links to another marketing page. */
	href?: string;
};

/** Short value from a feature hero title; label from subtitle. */
export function publicLandingHeroStatBadgesFromFeatureSections(
	sections: readonly { subtitle: string; title: string }[],
	limit = 4
): PublicLandingHeroStatBadge[] {
	return sections.slice(0, limit).map((section, index) => ({
		id: `feature-${index + 1}`,
		value: featureSectionTitleToBadgeValue(section.title),
		label: section.subtitle
	}));
}

function featureSectionTitleToBadgeValue(title: string): string {
	const commaPart = title.split(',')[0]?.trim();
	if (commaPart && commaPart.length <= 36) return commaPart;
	const words = title.replace(/\n/g, ' ').trim().split(/\s+/);
	if (words.length <= 4) return words.join(' ');
	return `${words.slice(0, 3).join(' ')}…`;
}
