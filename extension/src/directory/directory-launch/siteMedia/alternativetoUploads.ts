import type { AutoLaunchProfileSnapshot, FieldFillResult, LaunchStepField } from 'openquok-common';

import { assignFilesToInput } from '../fileInputAssign.js';
import {
	findFieldLabelAnchorByLeadingToken,
	listFileInputsInElement,
	resolveFileInputInLabelScope,
} from '../fileInputByLabel.js';
import { setNativeInputValue } from '../fillListboxDom.js';
import {
	galleryPathsExcludingLogo,
	mergeMainProfileSocialData,
	resolveProfileStoragePathList,
} from '../profileValues.js';
import { isGalleryProfileField, isLogoProfileField } from './profileMediaFields.js';
import type { SiteMediaAdapter, SiteMediaFileInputContext, SiteMediaFileInputOptions } from './types.js';

const ICON_URL_CAPTION = 'upload icon by url';
const SCREENSHOT_URL_CAPTION = 'upload screenshot by url';

/** AlternativeTo fetches pasted URLs server-side — only bare public HTTPS works; storage paths use file upload. */
function isDirectPublicHttpsMediaUrl(path: string): boolean {
	const trimmed = path.trim();
	if (!/^https:\/\//i.test(trimmed)) return false;
	try {
		const parsed = new URL(trimmed);
		const host = parsed.hostname.toLowerCase();
		if (host === 'localhost' || host === '127.0.0.1') return false;
		if (parsed.pathname.includes('/image/download')) return false;
		return true;
	} catch {
		return false;
	}
}

export function alternativetoManageItemPage(): boolean {
	try {
		const host = globalThis.location?.hostname?.replace(/^www\./i, '') ?? '';
		if (host !== 'alternativeto.net') return false;
		return /\/manage-item\/?/i.test(globalThis.location?.pathname ?? '');
	} catch {
		return false;
	}
}

function normalizeCaption(text: string): string {
	return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function findCaptionAnchor(caption: string): Element | null {
	const needle = caption.toLowerCase();
	let best: Element | null = null;
	let bestLen = Number.POSITIVE_INFINITY;
	for (const el of document.querySelectorAll('label, p, span, h3, h4, legend')) {
		const text = normalizeCaption(el.textContent ?? '');
		if (!text.includes(needle)) continue;
		if (needle === ICON_URL_CAPTION && text.includes('screenshot')) continue;
		if (needle === SCREENSHOT_URL_CAPTION && text.includes('icon') && !text.includes('screenshot')) {
			continue;
		}
		if (text.length < bestLen) {
			bestLen = text.length;
			best = el;
		}
	}
	return best;
}

function urlInputInScope(scope: Element | null): HTMLInputElement | null {
	if (!scope) return null;
	for (const input of scope.querySelectorAll('input')) {
		if (!(input instanceof HTMLInputElement)) continue;
		if (input.type === 'file' || input.type === 'hidden' || input.type === 'checkbox' || input.type === 'radio') {
			continue;
		}
		if (input.type === 'url' || input.type === 'text' || !input.type) return input;
	}
	return null;
}

function urlInputsInBlock(block: Element | null): HTMLInputElement[] {
	if (!block) return [];
	const out: HTMLInputElement[] = [];
	for (const input of block.querySelectorAll('input[type="url"], input[type="text"]')) {
		if (input instanceof HTMLInputElement) out.push(input);
	}
	return out;
}

/** Live manage-item places **Upload icon by URL** above the **Screenshots** subheading in one card. */
export function findAlternativetoScreenshotsHeading(): Element | null {
	for (const el of document.querySelectorAll('h2, h3, h4, label, legend, p, span')) {
		const text = normalizeCaption(el.textContent ?? '');
		if (text === 'screenshots' || text.startsWith('screenshots ')) return el;
	}
	return null;
}

function followsScreenshotsHeading(input: HTMLInputElement): boolean {
	const heading = findAlternativetoScreenshotsHeading();
	if (!heading) return true;
	return (heading.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

function precedesScreenshotsHeading(input: HTMLInputElement): boolean {
	const heading = findAlternativetoScreenshotsHeading();
	if (!heading) return true;
	return (heading.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
}

function inputMatchesCaption(input: HTMLInputElement, needle: string): boolean {
	const aria = (input.getAttribute('aria-label') ?? '').toLowerCase();
	const placeholder = (input.getAttribute('placeholder') ?? '').toLowerCase();
	const name = (input.getAttribute('name') ?? '').toLowerCase();
	if (aria.includes(needle)) return true;
	if (placeholder.includes(needle)) return true;
	if (name.includes(needle.replace(/\s+/g, ''))) return true;
	return false;
}

function screenshotsUrlUploadRoot(): HTMLElement | null {
	const block = screenshotsUploadBlock();
	if (block) return block;
	const heading = findAlternativetoScreenshotsHeading();
	if (!heading) return null;
	let walk: Element | null = heading.parentElement;
	for (let depth = 0; depth < 6 && walk; depth += 1) {
		const caption = findCaptionAnchor(SCREENSHOT_URL_CAPTION);
		if (caption && walk.contains(caption)) {
			const container = caption.closest('div, section, fieldset, form, article');
			if (container instanceof HTMLElement && container.contains(heading)) return container;
		}
		walk = walk.parentElement;
	}
	return heading.closest('section, fieldset, form, article, div') as HTMLElement | null;
}

export function findAlternativetoUrlInputByCaption(caption: string): HTMLInputElement | null {
	const needle = caption.toLowerCase();
	const isIcon = needle.includes('icon') && !needle.includes('screenshot');
	const isScreenshot = needle.includes('screenshot');

	const scopedBlock = isIcon
		? (iconUploadBlock() ?? undefined)
		: isScreenshot
			? (screenshotsUrlUploadRoot() ?? screenshotsUploadBlock() ?? undefined)
			: undefined;

	const searchRoots: Element[] = scopedBlock ? [scopedBlock] : [];
	if (searchRoots.length === 0 && isScreenshot) {
		const heading = findAlternativetoScreenshotsHeading();
		if (heading) {
			const tail =
				heading.closest('section, fieldset, form, article, div') ??
				heading.parentElement;
			if (tail) searchRoots.push(tail);
		}
	}
	if (searchRoots.length === 0) searchRoots.push(document.body);

	for (const root of searchRoots) {
		for (const input of urlInputsInBlock(root)) {
			if (!inputMatchesCaption(input, needle)) continue;
			if (isScreenshot && !followsScreenshotsHeading(input)) continue;
			if (isIcon && !precedesScreenshotsHeading(input)) continue;
			return input;
		}
	}

	const anchor = findCaptionAnchor(caption);
	if (!anchor) return null;
	const anchorBlock =
		anchor.closest('.icon-block, .screenshot-block') ??
		anchor.closest('section, fieldset, form, article, div');
	for (const input of urlInputsInBlock(anchorBlock)) {
		if (!inputMatchesCaption(input, needle)) continue;
		if (isScreenshot && !followsScreenshotsHeading(input)) continue;
		if (isIcon && !precedesScreenshotsHeading(input)) continue;
		return input;
	}
	let walk: Element | null = anchor;
	while (walk) {
		let sibling = walk.nextElementSibling;
		while (sibling) {
			const input = urlInputInScope(sibling);
			if (input) {
				if (isScreenshot && !followsScreenshotsHeading(input)) {
					sibling = sibling.nextElementSibling;
					continue;
				}
				if (isIcon && !precedesScreenshotsHeading(input)) {
					sibling = sibling.nextElementSibling;
					continue;
				}
				return input;
			}
			sibling = sibling.nextElementSibling;
		}
		walk = walk.parentElement;
	}
	const fallback = urlInputInScope(anchorBlock);
	if (!fallback) return null;
	if (isScreenshot && !followsScreenshotsHeading(fallback)) return null;
	if (isIcon && !precedesScreenshotsHeading(fallback)) return null;
	return fallback;
}

function iconUploadBlock(): HTMLElement | null {
	const block = document.querySelector('.icon-block');
	return block instanceof HTMLElement ? block : null;
}

function screenshotsUploadBlock(): HTMLElement | null {
	const block = document.querySelector('.screenshot-block');
	return block instanceof HTMLElement ? block : null;
}

function mediaBlockByHeading(fragment: string): HTMLElement | null {
	if (fragment.toLowerCase() === 'application icon') {
		return iconUploadBlock();
	}
	if (fragment.toLowerCase() === 'screenshots') {
		return screenshotsUploadBlock();
	}
	const needle = fragment.toLowerCase();
	for (const el of document.querySelectorAll('legend, label, p')) {
		const text = normalizeCaption(el.textContent ?? '');
		if (needle === 'screenshots') {
			if (text !== 'screenshots' && !text.startsWith('screenshots ')) continue;
		} else if (!text.includes(needle)) {
			continue;
		}
		const block = el.closest('.icon-block, .screenshot-block, section, fieldset, form, article, div');
		return block instanceof HTMLElement ? block : null;
	}
	return null;
}

function commitUrlInput(input: HTMLInputElement, url: string): void {
	input.focus();
	setNativeInputValue(input, url);
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.dispatchEvent(new Event('change', { bubbles: true }));
	try {
		input.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter' })
		);
		input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter' }));
	} catch {
		/* jsdom */
	}
	input.blur();
}

function clickDropzoneInBlock(block: HTMLElement | null): void {
	if (!block) return;
	const zone =
		block.querySelector<HTMLElement>(
			'[class*="drop" i], [class*="upload" i], [role="button"], label'
		) ?? block;
	zone.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

export function resolveAlternativetoIconFileInput(): HTMLInputElement | null {
	const block = iconUploadBlock() ?? mediaBlockByHeading('application icon');
	if (block) {
		const scoped = listFileInputsInElement(block);
		if (scoped[0]) return scoped[0];
	}
	const anchor = findFieldLabelAnchorByLeadingToken('application icon');
	if (anchor) {
		const scoped = resolveFileInputInLabelScope(anchor);
		if (scoped) return scoped;
	}
	const inputs = listFileInputsInElement(document.body);
	return (
		inputs.find((input) => /icon|logo/i.test(input.name + input.id)) ?? inputs[0] ?? null
	);
}

export function resolveAlternativetoScreenshotFileInput(): HTMLInputElement | null {
	const block = screenshotsUploadBlock() ?? mediaBlockByHeading('screenshots');
	if (block) {
		const scoped = listFileInputsInElement(block);
		if (scoped[0]) return scoped[0];
	}
	const anchor = findFieldLabelAnchorByLeadingToken('screenshots');
	if (anchor) {
		const scoped = resolveFileInputInLabelScope(anchor);
		if (scoped) return scoped;
	}
	const inputs = listFileInputsInElement(document.body);
	return (
		inputs.find((input) => /screenshot/i.test(input.name + input.id)) ??
		inputs.find((input) => input.multiple) ??
		inputs[inputs.length - 1] ??
		null
	);
}

async function fillAlternativetoLogoUrl(
	field: LaunchStepField,
	snapshot: AutoLaunchProfileSnapshot
): Promise<FieldFillResult | null> {
	const paths = resolveProfileStoragePathList(snapshot, field.profilePath);
	const storagePath = paths[0];
	if (!storagePath) return null;
	if (!isDirectPublicHttpsMediaUrl(storagePath)) return null;
	const urlInput = findAlternativetoUrlInputByCaption(ICON_URL_CAPTION);
	if (!urlInput) return null;
	commitUrlInput(urlInput, storagePath.trim());
	return { key: field.key, label: field.label, status: 'found' };
}

async function fillAlternativetoGalleryUrls(
	field: LaunchStepField,
	snapshot: AutoLaunchProfileSnapshot
): Promise<FieldFillResult | null> {
	const paths = galleryPathsExcludingLogo(snapshot);
	if (paths.length === 0) return null;
	const maxItems =
		typeof field.maxItems === 'number' && field.maxItems > 0 ? field.maxItems : paths.length;
	const selected = paths.slice(0, maxItems);
	if (!selected.every(isDirectPublicHttpsMediaUrl)) return null;
	const urlInput = findAlternativetoUrlInputByCaption(SCREENSHOT_URL_CAPTION);
	if (!urlInput) return null;

	let filled = 0;
	for (const mediaUrl of selected) {
		commitUrlInput(urlInput, mediaUrl.trim());
		filled += 1;
		await new Promise((resolve) => setTimeout(resolve, 900));
	}
	if (filled < selected.length) return null;
	return { key: field.key, label: field.label, status: 'found' };
}

async function fillAlternativetoFiles(
	field: LaunchStepField,
	files: File[],
	resolveInput: () => HTMLInputElement | null,
	clickZone: () => void
): Promise<FieldFillResult> {
	const input = resolveInput();
	if (!input) {
		return {
			key: field.key,
			label: field.label,
			status: 'not_found',
			message: 'File input not found on this page.',
		};
	}
	clickDropzoneInBlock(input.closest('section, fieldset, form, article, div') as HTMLElement);
	clickZone();
	await new Promise((resolve) => setTimeout(resolve, 80));
	const target = resolveInput() ?? input;
	if (!assignFilesToInput(target, files)) {
		return {
			key: field.key,
			label: field.label,
			status: 'error',
			message: 'Could not attach file to the upload control.',
		};
	}
	return { key: field.key, label: field.label, status: 'found' };
}

export const alternativetoUploadsAdapter: SiteMediaAdapter = {
	id: 'alternativeto-manage-item-uploads',
	matchesPage: alternativetoManageItemPage,
	resolveGalleryReadRoot(field) {
		if (!isGalleryProfileField(field)) return null;
		return mediaBlockByHeading('screenshots');
	},
	resolveLogoReadRoot(field) {
		if (!isLogoProfileField(field)) return null;
		return mediaBlockByHeading('application icon');
	},
	resolveGalleryFileInput(field) {
		if (!isGalleryProfileField(field)) return null;
		return resolveAlternativetoScreenshotFileInput();
	},
	resolveLogoFileInput(field) {
		if (!isLogoProfileField(field)) return null;
		return resolveAlternativetoIconFileInput();
	},
	isGalleryPreviewImage(img, galleryReadRoot) {
		if (!(img instanceof HTMLImageElement)) return false;
		const iconRoot = iconUploadBlock() ?? mediaBlockByHeading('application icon');
		if (iconRoot?.contains(img)) return false;
		const shotRoot =
			galleryReadRoot ?? screenshotsUploadBlock() ?? mediaBlockByHeading('screenshots');
		if (shotRoot?.contains(img)) return true;
		const heading = findAlternativetoScreenshotsHeading();
		if (!heading) return false;
		return (heading.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
	},
	resolveFileInput(field, fillMode, _options, _ctx) {
		if (!alternativetoManageItemPage()) return undefined;
		if (fillMode === 'file' && isLogoProfileField(field)) {
			return resolveAlternativetoIconFileInput();
		}
		if (fillMode === 'files' && isGalleryProfileField(field)) {
			return resolveAlternativetoScreenshotFileInput();
		}
		return undefined;
	},
	resolveFileInputAfterLabel(field) {
		if (isLogoProfileField(field)) return resolveAlternativetoIconFileInput();
		if (isGalleryProfileField(field)) return resolveAlternativetoScreenshotFileInput();
		return null;
	},
	async fillLogoMedia(snapshot, field, context) {
		if (!isLogoProfileField(field)) return null;
		const effective = mergeMainProfileSocialData(snapshot, context.mainProfileSnapshot);
		const fromUrl = await fillAlternativetoLogoUrl(field, effective);
		if (fromUrl) return fromUrl;
		return null;
	},
	async fillGalleryMedia(snapshot, field, context) {
		if (!isGalleryProfileField(field)) return null;
		const effective = mergeMainProfileSocialData(snapshot, context.mainProfileSnapshot);
		const fromUrl = await fillAlternativetoGalleryUrls(field, effective);
		if (fromUrl) return fromUrl;
		return null;
	},
	async fillLogoFile(field, file) {
		if (!isLogoProfileField(field)) return null;
		return fillAlternativetoFiles(
			field,
			[file],
			resolveAlternativetoIconFileInput,
			() => clickDropzoneInBlock(mediaBlockByHeading('application icon'))
		);
	},
	async fillGalleryFiles(field, files) {
		if (!isGalleryProfileField(field)) return null;
		if (files.length <= 1) {
			return fillAlternativetoFiles(
				field,
				files,
				resolveAlternativetoScreenshotFileInput,
				() => clickDropzoneInBlock(mediaBlockByHeading('screenshots'))
			);
		}
		let attached = 0;
		for (const file of files) {
			const result = await fillAlternativetoFiles(
				field,
				[file],
				resolveAlternativetoScreenshotFileInput,
				() => clickDropzoneInBlock(mediaBlockByHeading('screenshots'))
			);
			if (result.status === 'found') attached += 1;
			await new Promise((resolve) => setTimeout(resolve, 350));
		}
		if (attached === 0) {
			return {
				key: field.key,
				label: field.label,
				status: 'error',
				message: 'Could not attach screenshots to the upload control.',
			};
		}
		if (attached < files.length) {
			return {
				key: field.key,
				label: field.label,
				status: 'error',
				message: `Only ${attached} of ${files.length} screenshots attached.`,
			};
		}
		return { key: field.key, label: field.label, status: 'found' };
	},
};