import {
	PUBLIC_FAQ_ITEMS,
	type PublicFaqItem
} from '$lib/content/constants/publicFaqCatalog';
import { getPublicFaqConfigDefaults } from '$lib/config/constants/config';

export type PublicFaqConfigItem = {
	question: string;
	answer: string;
};


export function getDefaultPublicFaqConfigItems(): PublicFaqConfigItem[] {
	return PUBLIC_FAQ_ITEMS.map(({ title, description }) => ({
		question: title,
		answer: description
	}));
}

/** Normalize admin/API FAQ entries to public accordion view models. */
export function parsePublicFaqItems(raw: unknown): PublicFaqItem[] {
	if (!Array.isArray(raw) || raw.length === 0) {
		return [...PUBLIC_FAQ_ITEMS];
	}

	const items: PublicFaqItem[] = [];
	for (const entry of raw) {
		if (!entry || typeof entry !== 'object') continue;
		const record = entry as Record<string, unknown>;
		const title = String(record.question ?? record.title ?? '').trim();
		const description = String(record.answer ?? record.description ?? '').trim();
		if (title && description) {
			items.push({ title, description });
		}
	}

	return items.length > 0 ? items : [...PUBLIC_FAQ_ITEMS];
}

export function parsePublicFaqConfigModule(raw?: Record<string, unknown> | null): {
	configVm: Record<string, string>;
	itemsVm: PublicFaqItem[];
} {
	const defaults = getPublicFaqConfigDefaults();

	const configVm = {
		SUBTITLE: String(raw?.SUBTITLE ?? defaults.SUBTITLE),
		TITLE: String(raw?.TITLE ?? defaults.TITLE),
		DESCRIPTION: String(raw?.DESCRIPTION ?? defaults.DESCRIPTION)
	};

	return {
		configVm,
		itemsVm: parsePublicFaqItems(raw?.ITEMS)
	};
}
