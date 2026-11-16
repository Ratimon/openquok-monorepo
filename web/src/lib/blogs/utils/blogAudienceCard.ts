import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type { BlogSeoAudienceCard } from '$lib/blogs/blog.types';
import {
	getBlogAudienceCardPreset,
	type BlogAudienceCardPreset
} from '$lib/blogs/constants/blogAudienceCardPresets';

export function blogAudienceCardToAudienceCard(card: BlogSeoAudienceCard): AudienceCard {
	const preset: BlogAudienceCardPreset = getBlogAudienceCardPreset(card.preset);
	return {
		iconName: preset.iconName,
		iconClass: preset.iconClass,
		title: card.title.trim(),
		description: card.description.trim(),
		containerClass: preset.containerClass
	};
}

export function isBlogAudienceCardComplete(
	card: BlogSeoAudienceCard | null | undefined
): card is BlogSeoAudienceCard {
	if (!card) return false;
	return Boolean(card.title.trim() && card.description.trim());
}