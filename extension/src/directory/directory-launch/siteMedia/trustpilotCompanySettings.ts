import type { LaunchStepField } from 'openquok-common';

const FIELD_HEADING_SELECTORS =
	'label, legend, h3, h4, h5, p, span, [data-slot="label"], [data-slot="form-label"]';

function labelMatchesAnyFieldLabel(visibleText: string, field: LaunchStepField): boolean {
	const leading = visibleText.trim().split(/\n|[<(]/)[0]?.trim() ?? visibleText.trim();
	const norm = leading.toLowerCase();
	const needles = [field.label, ...(field.labelAliases ?? [])]
		.map((entry) => entry.trim())
		.filter(Boolean);
	for (const needle of needles) {
		const want = needle.toLowerCase();
		if (norm === want || norm === `${want} *` || norm.startsWith(`${want} `)) return true;
	}
	return false;
}

export const TRUSTPILOT_ABOUT_SECTION_HEADING = 'About your business';
export const TRUSTPILOT_DESCRIPTION_SECTION_HEADING = 'Company description';

export function trustpilotCompanySettingsPage(doc: Document = document): boolean {
	const path = doc.defaultView?.location?.pathname?.toLowerCase() ?? '';
	return path.includes('company-settings');
}

function normalizeHeading(value: string): string {
	return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function headingMatches(visible: string, heading: string): boolean {
	const norm = normalizeHeading(visible);
	const want = normalizeHeading(heading);
	if (!want) return false;
	if (norm === want) return true;
	return norm.startsWith(`${want} `) || norm.startsWith(want);
}

/** Accordion trigger for a Trustpilot Business settings section (button or summary). */
export function findTrustpilotSectionTrigger(
	heading: string,
	doc: Document = document
): Element | null {
	for (const el of doc.querySelectorAll('button, [role="button"], summary, h2, h3, h4')) {
		if (!(el instanceof HTMLElement)) continue;
		const text = el.textContent ?? '';
		if (!headingMatches(text, heading)) continue;
		if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') return el;
		const nested = el.querySelector('button, [role="button"]');
		if (nested) return nested;
		if (el.tagName === 'SUMMARY') return el;
		const btn = el.closest('button, [role="button"]');
		if (btn) return btn;
		return el;
	}
	return null;
}

export function isTrustpilotAccordionExpanded(
	heading: string,
	doc: Document = document
): boolean {
	const trigger = findTrustpilotSectionTrigger(heading, doc);
	if (!trigger) return false;

	const expanded = trigger.getAttribute('aria-expanded');
	if (expanded === 'true') return true;
	if (expanded === 'false') return false;

	const panelId = trigger.getAttribute('aria-controls')?.trim();
	if (panelId) {
		const panel = doc.getElementById(panelId);
		if (panel instanceof HTMLElement && panel.offsetParent !== null) return true;
	}

	const details = trigger.closest('details');
	if (details?.hasAttribute('open')) return true;

	const region = trigger.parentElement?.querySelector('[role="region"]');
	if (region instanceof HTMLElement && region.offsetParent !== null) {
		return true;
	}

	return false;
}

/** Expanded section content root (not the profile preview column). */
export function resolveTrustpilotSectionPanel(
	heading: string,
	doc: Document = document
): Element | null {
	const trigger = findTrustpilotSectionTrigger(heading, doc);
	if (!trigger) return null;

	const panelId = trigger.getAttribute('aria-controls')?.trim();
	if (panelId) {
		const byId = doc.getElementById(panelId);
		if (byId) return byId;
	}

	const details = trigger.closest('details');
	if (details) {
		const body = details.querySelector(':scope > :not(summary)');
		if (body) return body;
	}

	let anchor: Element | null = trigger;
	for (let depth = 0; depth < 5 && anchor; depth += 1) {
		const region = anchor.nextElementSibling;
		if (region && !region.contains(trigger)) {
			if (/profile preview/i.test(region.textContent ?? '')) {
				anchor = region;
				continue;
			}
			return region;
		}
		const parent = anchor.parentElement;
		if (parent) {
			const scopedRegion = parent.querySelector('[role="region"]');
			if (scopedRegion && scopedRegion.contains(trigger)) return scopedRegion;
		}
		anchor = parent;
	}

	return trigger.closest('section, article, div') ?? trigger.parentElement;
}

export function trustpilotStepAccordionHeading(stepId: string): string | null {
	if (stepId === 'company_settings') return TRUSTPILOT_ABOUT_SECTION_HEADING;
	if (stepId === 'company_description') return TRUSTPILOT_DESCRIPTION_SECTION_HEADING;
	return null;
}

export function trustpilotStepFillBlocker(
	stepId: string,
	doc: Document = document
): string | null {
	if (!trustpilotCompanySettingsPage(doc)) return null;
	const heading = trustpilotStepAccordionHeading(stepId);
	if (!heading) return null;
	if (isTrustpilotAccordionExpanded(heading, doc)) return null;
	return `Open the “${heading}” section on Trustpilot, then use Fill again.`;
}

export function trustpilotFillAllBlocker(
	stepIds: readonly string[],
	doc: Document = document
): string | null {
	const collapsed: string[] = [];
	for (const stepId of stepIds) {
		const heading = trustpilotStepAccordionHeading(stepId);
		if (!heading) continue;
		if (isTrustpilotAccordionExpanded(heading, doc)) continue;
		collapsed.push(heading);
	}
	if (collapsed.length === 0) return null;
	return `Open these Trustpilot sections before filling: ${collapsed.map((h) => `“${h}”`).join(', ')}.`;
}

function findLabeledControlInScope(
	root: Element,
	field: LaunchStepField,
	fillMode: 'text' | 'textarea' | 'file'
): Element | null {
	for (const labelEl of root.querySelectorAll(FIELD_HEADING_SELECTORS)) {
		if (!labelMatchesAnyFieldLabel(labelEl.textContent ?? '', field)) continue;
		let walk: Element | null = labelEl;
		for (let depth = 0; depth < 8; depth += 1) {
			const block = walk.closest('div, fieldset, li, section, form') ?? walk.parentElement;
			if (!block || !root.contains(block)) break;
			if (fillMode === 'file') {
				const file = block.querySelector("input[type='file']");
				if (file) return file;
			}
			if (fillMode === 'textarea') {
				const textarea = block.querySelector('textarea');
				if (textarea) return textarea;
			}
			if (fillMode === 'text') {
				const input = block.querySelector(
					"input[type='text'], input[type='url'], input:not([type='file']):not([type='hidden']):not([type='checkbox']):not([type='radio'])"
				);
				if (input instanceof HTMLInputElement && input.type !== 'password' && input.type !== 'email') {
					return input;
				}
			}
			walk = block.parentElement;
		}
	}
	return null;
}

function fieldTrustpilotSectionHeading(field: LaunchStepField): string | null {
	if (field.key === 'description' || field.profilePath === 'description') {
		return TRUSTPILOT_DESCRIPTION_SECTION_HEADING;
	}
	if (
		field.key === 'name' ||
		field.key === 'website' ||
		field.key === 'logo' ||
		field.profilePath === 'name' ||
		field.profilePath === 'website_url' ||
		field.profilePath === 'logo_url'
	) {
		return TRUSTPILOT_ABOUT_SECTION_HEADING;
	}
	return null;
}

/** Scoped to the expanded Trustpilot accordion for this field (avoids profile preview + hidden sections). */
export function resolveTrustpilotFieldElement(field: LaunchStepField): Element | null {
	if (!trustpilotCompanySettingsPage()) return null;
	const sectionHeading = fieldTrustpilotSectionHeading(field);
	if (!sectionHeading) return null;
	if (!isTrustpilotAccordionExpanded(sectionHeading)) return null;

	const panel = resolveTrustpilotSectionPanel(sectionHeading);
	if (!panel) return null;

	const fillMode =
		field.fillMode === 'file'
			? 'file'
			: field.key === 'description' || field.profilePath === 'description'
				? 'textarea'
				: 'text';

	const scoped = findLabeledControlInScope(panel, field, fillMode);
	if (scoped) return scoped;

	if (field.key === 'logo') {
		return panel.querySelector("input[type='file']");
	}

	return null;
}

export function buildTrustpilotAccordionStatusHint(doc: Document = document): string | null {
	if (!trustpilotCompanySettingsPage(doc)) return null;
	const parts: string[] = [];
	if (!isTrustpilotAccordionExpanded(TRUSTPILOT_ABOUT_SECTION_HEADING, doc)) {
		parts.push(`“${TRUSTPILOT_ABOUT_SECTION_HEADING}”`);
	}
	if (!isTrustpilotAccordionExpanded(TRUSTPILOT_DESCRIPTION_SECTION_HEADING, doc)) {
		parts.push(`“${TRUSTPILOT_DESCRIPTION_SECTION_HEADING}”`);
	}
	if (parts.length === 0) return null;
	return `Open ${parts.join(' and ')} on Trustpilot before Fill — closed sections can mis-target fields.`;
}