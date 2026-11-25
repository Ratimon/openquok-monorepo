import type { FieldFillResult, LaunchStepField } from 'openquok-common';

import { assignFilesToInput } from '../fileInputAssign.js';
import {
	findFieldLabelAnchorByLeadingToken,
	listFileInputsInElement,
	resolveFileInputInLabelScope,
} from '../fileInputByLabel.js';
import { isGalleryProfileField, isLogoProfileField } from './profileMediaFields.js';
import type { SiteMediaAdapter } from './types.js';

export function indiehubSubmitDetailsPage(): boolean {
	try {
		const host = globalThis.location?.hostname?.replace(/^www\./i, '') ?? '';
		if (host !== 'indiehub.best') return false;
		return /^\/submit\/?$/i.test(globalThis.location?.pathname ?? '');
	} catch {
		return false;
	}
}

function indiehubMediaField(field: LaunchStepField): boolean {
	return isLogoProfileField(field) || isGalleryProfileField(field);
}

function indiehubLabelToken(field: LaunchStepField): string | null {
	if (isLogoProfileField(field)) return 'icon';
	if (isGalleryProfileField(field)) return 'image';
	return null;
}

function indiehubUploadColumn(field: LaunchStepField): HTMLElement | null {
	const token = indiehubLabelToken(field);
	if (!token) return null;
	const anchor = findFieldLabelAnchorByLeadingToken(token);
	if (!anchor) return null;
	const column =
		anchor.closest('[data-slot="form-item"]') ??
		anchor.closest('div.grid > div, div[class*="grid-cols"] > div') ??
		anchor.parentElement;
	return column instanceof HTMLElement ? column : null;
}

function focusIndiehubDropzone(field: LaunchStepField): void {
	const column = indiehubUploadColumn(field);
	if (!column) return;
	const dashed =
		column.querySelector<HTMLElement>(
			'[class*="border-dashed"], [class*="cursor-pointer"], [data-testid*="upload" i]'
		) ?? column;
	dashed.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
	dashed.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
	dashed.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

export function resolveIndiehubFileInput(field: LaunchStepField): HTMLInputElement | null {
	if (!indiehubSubmitDetailsPage() || !indiehubMediaField(field)) return null;

	const token = indiehubLabelToken(field);
	if (token) {
		const anchor = findFieldLabelAnchorByLeadingToken(token);
		if (anchor) {
			const scoped = resolveFileInputInLabelScope(anchor);
			if (scoped) return scoped;
		}
	}

	const column = indiehubUploadColumn(field);
	if (column) {
		const inColumn = listFileInputsInElement(column);
		if (inColumn.length === 1) return inColumn[0] ?? null;
	}

	const inputs = listFileInputsInElement(document.body);
	if (inputs.length < 2) return inputs[0] ?? null;

	if (isLogoProfileField(field)) {
		return (
			inputs.find((input) => /icon|logo/i.test(input.name)) ??
			inputs.find((input) => !/banner|cover/i.test(input.name)) ??
			inputs[0] ??
			null
		);
	}
	if (isGalleryProfileField(field)) {
		return (
			inputs.find((input) => /banner|cover/i.test(input.name)) ??
			inputs.find((input) => /image/i.test(input.name) && !/icon|logo/i.test(input.name)) ??
			inputs[inputs.length - 1] ??
			null
		);
	}
	return null;
}

async function fillIndiehubUpload(field: LaunchStepField, files: File[]): Promise<FieldFillResult> {
	const input = resolveIndiehubFileInput(field);
	if (!input) {
		return {
			key: field.key,
			label: field.label,
			status: 'not_found',
			message: 'File input not found on this page.',
		};
	}
	focusIndiehubDropzone(field);
	await new Promise((resolve) => setTimeout(resolve, 120));
	const target = resolveIndiehubFileInput(field) ?? input;
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

export const indiehubUploadsAdapter: SiteMediaAdapter = {
	id: 'indiehub-submit-uploads',
	matchesPage: indiehubSubmitDetailsPage,
	resolveGalleryReadRoot() {
		return null;
	},
	resolveLogoReadRoot() {
		return null;
	},
	resolveGalleryFileInput(field) {
		if (!isGalleryProfileField(field)) return null;
		return resolveIndiehubFileInput(field);
	},
	resolveLogoFileInput(field) {
		if (!isLogoProfileField(field)) return null;
		return resolveIndiehubFileInput(field);
	},
	isGalleryPreviewImage() {
		return false;
	},
	resolveFileInput(field, fillMode, _options, _ctx) {
		if (!indiehubMediaField(field)) return undefined;
		if (fillMode !== 'file' && fillMode !== 'files') return undefined;
		return resolveIndiehubFileInput(field);
	},
	resolveFileInputAfterLabel(field) {
		return resolveIndiehubFileInput(field);
	},
	async fillLogoFile(field, file) {
		if (!isLogoProfileField(field)) return null;
		return fillIndiehubUpload(field, [file]);
	},
	async fillGalleryFiles(field, files) {
		if (!isGalleryProfileField(field)) return null;
		return fillIndiehubUpload(field, files);
	},
};