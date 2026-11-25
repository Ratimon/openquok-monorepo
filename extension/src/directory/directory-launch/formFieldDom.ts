import type { LaunchStepField } from 'openquok-common';

/** `label` wrapping a single checkbox/radio — section headings must not match as field anchors. */
export function isInlineChoiceRowLabel(el: Element): boolean {
	if (!(el instanceof HTMLLabelElement)) return false;
	return (
		el.querySelectorAll(
			':scope > input[type="checkbox"], :scope input[type="checkbox"], :scope > input[type="radio"], :scope input[type="radio"], :scope > [role="checkbox"], :scope > [data-slot="checkbox"]'
		).length === 1
	);
}

/** Site chrome (nav/footer links) must not anchor form field resolution. */
export function isExcludedFieldLabelAnchor(el: Element): boolean {
	if (el.closest('nav, footer, header, [role="navigation"], [role="contentinfo"], [role="banner"]')) {
		return true;
	}
	if (el.closest('a[href]')) return true;
	return false;
}

/** Option text in a checkbox/radio row — not the wizard section title (`data-slot="label"`). */
export function isChoiceGroupOptionLabel(el: Element): boolean {
	if (el.getAttribute('data-slot') === 'label' || el.getAttribute('data-slot') === 'form-label') {
		return false;
	}
	if (el instanceof HTMLLabelElement && isInlineChoiceRowLabel(el)) return true;
	const parent = el.parentElement;
	if (!parent) return false;
	if (parent.querySelector(':scope > [role="switch"]')) return false;
	const choice = parent.querySelector(
		':scope > [role="checkbox"], :scope > [data-slot="checkbox"], :scope > input[type="checkbox"], :scope > input[type="radio"]'
	);
	if (!choice) return false;
	if (choice instanceof HTMLInputElement && choice.classList.contains('sr-only')) return false;
	return choice !== el && !el.contains(choice);
}

export function isSocialLinkProfileField(field: LaunchStepField): boolean {
	return (
		field.key.startsWith('social_') ||
		Boolean(field.profilePath?.includes('profile_data.social_'))
	);
}

function controlIdentityHaystack(input: HTMLInputElement): string {
	const labelledBy = input
		.getAttribute('aria-labelledby')
		?.split(/\s+/)
		.filter(Boolean)
		.map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
		.join(' ');
	return [
		input.name,
		input.id,
		input.getAttribute('aria-label'),
		input.placeholder,
		labelledBy,
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();
}

function socialChannelMatchTokens(channel: string): string[] {
	switch (channel) {
		case 'x':
			return ['twitter', 'x.com', 'x-com', 'social_x', 'social-x'];
		case 'github':
			return ['github'];
		case 'instagram':
			return ['instagram'];
		case 'linkedin':
			return ['linkedin'];
		case 'tiktok':
			return ['tiktok'];
		case 'facebook':
			return ['facebook'];
		case 'youtube':
			return ['youtube', 'youtu.'];
		case 'bluesky':
			return ['bluesky', 'bsky'];
		default:
			return [channel];
	}
}

/** Per-channel social rows must not bind to promo-video or unrelated url inputs in multi-tab wizards. */
export function socialFieldControlMatchesInput(
	field: LaunchStepField,
	input: HTMLInputElement
): boolean {
	if (field.key === 'launch_video_url' || field.profilePath === 'profile_data.launch_video_url') {
		return isPromoVideoUrlInput(input) || controlIdentityHaystack(input).includes('video');
	}
	if (field.key === 'social_youtube' || field.profilePath === 'profile_data.social_youtube') {
		if (isPromoVideoUrlInput(input)) return false;
		return socialChannelMatchTokens('youtube').some((token) =>
			controlIdentityHaystack(input).includes(token)
		);
	}
	if (!isSocialLinkProfileField(field)) return true;
	if (isPromoVideoUrlInput(input)) return false;
	const channel = field.key.replace(/^social_/, '');
	return socialChannelMatchTokens(channel).some((token) =>
		controlIdentityHaystack(input).includes(token)
	);
}

/** Values that belong on launch / channel-youtube rows — not other socials or tagline. */
export function formScalarMisassignedToField(
	field: LaunchStepField,
	scalar: string | undefined
): boolean {
	if (!scalar?.trim()) return false;
	const v = scalar.trim().toLowerCase();
	const looksLikeHostedVideo =
		v.includes('youtube.com') || v.includes('youtu.be') || v.includes('vimeo.com');
	if (!looksLikeHostedVideo) return false;
	if (field.key === 'launch_video_url' || field.profilePath === 'profile_data.launch_video_url') {
		return false;
	}
	if (field.key === 'social_youtube' || field.profilePath === 'profile_data.social_youtube') {
		return false;
	}
	return true;
}

export function fieldExpectsUrlControl(field: LaunchStepField): boolean {
	const path = field.profilePath?.trim() ?? '';
	if (path === 'website_url' || field.key === 'website') return true;
	if (path === 'profile_data.repository_url' || field.key === 'repository_url') return true;
	if (path === 'profile_data.launch_video_url' || field.key === 'launch_video_url') return true;
	if (path.includes('social_') || field.key.startsWith('social_')) return true;
	return false;
}

function attrIncludesChannel(attrName: string, channel: string): boolean {
	return attrName.includes(channel);
}

/** Promo / listing video URL inputs — not tagline or per-channel social rows. */
export function isPromoVideoUrlInput(element: HTMLInputElement): boolean {
	const name = (element.getAttribute('name') ?? '').toLowerCase();
	const aria = (element.getAttribute('aria-label') ?? '').toLowerCase();
	const placeholder = (element.getAttribute('placeholder') ?? '').toLowerCase();
	if (name.includes('launch_video') || name.includes('launchvideo')) return true;
	if (
		(name.includes('video_url') || name.includes('videourl')) &&
		!name.includes('repo') &&
		!name.includes('repository')
	) {
		return true;
	}
	if (aria.includes('launch video') || aria.includes('video url')) return true;
	if (placeholder.includes('vimeo')) {
		return !name.includes('instagram') && !name.includes('linkedin') && !name.includes('tiktok');
	}
	if (!placeholder.includes('youtube') && !placeholder.includes('youtu.be')) return false;
	if (name.includes('youtube') && !name.includes('video') && attrIncludesChannel(name, 'youtube')) {
		return false;
	}
	if (attrIncludesChannel(name, 'instagram') || attrIncludesChannel(name, 'linkedin')) return false;
	if (
		attrIncludesChannel(name, 'tiktok') ||
		attrIncludesChannel(name, 'twitter') ||
		attrIncludesChannel(name, 'facebook') ||
		attrIncludesChannel(name, 'github') ||
		attrIncludesChannel(name, 'bluesky')
	) {
		return false;
	}
	return true;
}

/**
 * Host-owned “paste your URL” crawlers sit beside the real listing URL row and often use https placeholders.
 */
export function isListingSiteAiPrefillUrlInput(element: HTMLInputElement): boolean {
	const attrName = (element.getAttribute('name') ?? '').toLowerCase();
	if (attrName === 'url' || attrName === 'website' || attrName === 'websiteurl') return false;

	const placeholder = (element.getAttribute('placeholder') ?? '').toLowerCase();
	const aria = (element.getAttribute('aria-label') ?? '').toLowerCase();
	if (
		aria.includes('paste your url') ||
		placeholder.includes('paste your url') ||
		placeholder.includes('paste url')
	) {
		return true;
	}

	let section: Element | null = element;
	for (let depth = 0; depth < 8 && section; depth += 1) {
		const text = (section.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
		if (text.includes('ai-powered form prefill') || text.includes('fill the form automatically')) {
			return true;
		}
		section = section.parentElement;
	}

	return false;
}

/** Multi-tab wizards keep every tab in the DOM — scope compare/fill to the labeled row. */
export function fieldRequiresLabelScopedResolution(field: LaunchStepField): boolean {
	return (
		field.key === 'tags' ||
		field.key === 'tagline' ||
		field.profilePath === 'tagline' ||
		isSocialLinkProfileField(field) ||
		field.key === 'launch_video_url' ||
		field.profilePath === 'profile_data.launch_video_url'
	);
}

function isListingFormIdentityInput(element: HTMLInputElement): boolean {
	const attrName = (element.getAttribute('name') ?? '').toLowerCase();
	return (
		attrName === 'name' ||
		attrName === 'slug' ||
		attrName === 'url' ||
		attrName === 'description' ||
		attrName === 'repo_url' ||
		attrName === 'tagline'
	);
}

/** Common `name` attrs used for product title fields on listing forms. */
const LISTING_PRODUCT_NAME_INPUT_ATTRS = new Set([
	'name',
	'tool_name',
	'product_name',
	'startup_name',
	'company',
	'company_name',
]);

const LISTING_PRODUCT_NAME_BLOCKED_ATTRS = new Set([
	'description',
	'tool_description',
	'slogan',
	'tagline',
	'website',
	'url',
	'tool_website',
	'slug',
	'repo_url',
	'github_repo',
	'demo_video',
	'maker_comment',
]);

export function listingProductNameInputAttrAllowed(attrName: string): boolean {
	if (!attrName) return true;
	if (LISTING_PRODUCT_NAME_BLOCKED_ATTRS.has(attrName)) return false;
	if (LISTING_PRODUCT_NAME_INPUT_ATTRS.has(attrName)) return true;
	if (attrName.endsWith('_name') && attrName !== 'username') return true;
	return false;
}

export function listingFormIdentityInput(element: HTMLInputElement): boolean {
	return isListingFormIdentityInput(element);
}

export function pickControlNearestLabel(labelEl: Element, acceptable: readonly Element[]): Element | null {
	if (acceptable.length === 0) return null;
	if (acceptable.length === 1) return acceptable[0] ?? null;
	let best: Element | null = null;
	let bestScore = -1;
	for (const control of acceptable) {
		let score = 0;
		const position = labelEl.compareDocumentPosition(control);
		if (position & Node.DOCUMENT_POSITION_FOLLOWING) score += 60;
		if (position & Node.DOCUMENT_POSITION_PRECEDING) score -= 30;
		let shared: Element | null = labelEl.parentElement;
		for (let depth = 0; depth < 8 && shared; depth++) {
			if (shared.contains(control)) {
				score += 50 - depth * 12;
				break;
			}
			shared = shared.parentElement;
		}
		if (score > bestScore) {
			bestScore = score;
			best = control;
		}
	}
	return best ?? acceptable[0] ?? null;
}