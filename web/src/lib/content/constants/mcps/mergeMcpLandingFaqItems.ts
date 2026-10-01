import type { PublicFaqItem } from '$lib/content/constants/faq';
import type { McpLandingSeedFaqOverrides } from '$lib/content/constants/mcps/types';

/**
 * Applies sparse FAQ overrides onto the default MCP client FAQ list from `buildMcpFaqItems`.
 * Full `faqItems` on the seed still replaces the list entirely (e.g. legacy Warp-only flows).
 */
export function mergeMcpLandingFaqItems(
	defaults: PublicFaqItem[],
	overrides?: McpLandingSeedFaqOverrides | null
): PublicFaqItem[] {
	if (!overrides) {
		return defaults;
	}

	if (overrides.faqItems) {
		return [...overrides.faqItems];
	}

	let items = [...defaults];

	const faqPatchesByTitle = overrides.faqPatchesByTitle;
	if (faqPatchesByTitle) {
		items = items.map((item) => {
			const patch = faqPatchesByTitle[item.title];
			return patch ? { ...item, ...patch } : item;
		});
	}

	if (overrides.faqItemsAfterFirst?.length) {
		items = [items[0], ...overrides.faqItemsAfterFirst, ...items.slice(1)];
	}

	if (overrides.faqItemsPrepend?.length) {
		items = [...overrides.faqItemsPrepend, ...items];
	}

	if (overrides.faqItemsBeforeTitle) {
		const { matchTitle, items: toInsert } = overrides.faqItemsBeforeTitle;
		const index = items.findIndex((item) => item.title === matchTitle);
		if (index >= 0) {
			items = [...items.slice(0, index), ...toInsert, ...items.slice(index)];
		}
	}

	return items;
}
