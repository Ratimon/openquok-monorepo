import type { FieldFillResult, LaunchStepField } from 'openquok-common';

import { isGalleryProfileField, isLogoProfileField } from './profileMediaFields.js';
import {
	assignStartupinspireLogoFile,
	assignStartupinspireScreenshotFiles,
	activateStartupinspireWizardStepSync,
	resolveStartupinspireLogoReadRoot,
	resolveStartupinspireScreenshotsReadRoot,
	resolveStartupinspireLogoFileInput,
	resolveStartupinspireScreenshotFileInput,
	startupinspireStartupFormPage,
} from './startupinspireStartupForm.js';
import type { SiteMediaAdapter } from './types.js';

export const startupinspireUploadsAdapter: SiteMediaAdapter = {
	id: 'startupinspire-startup-wizard-uploads',
	matchesPage: startupinspireStartupFormPage,
	resolveGalleryReadRoot(field) {
		if (!isGalleryProfileField(field)) return null;
		return resolveStartupinspireScreenshotsReadRoot();
	},
	resolveLogoReadRoot(field) {
		if (!isLogoProfileField(field)) return null;
		return resolveStartupinspireLogoReadRoot();
	},
	resolveGalleryFileInput(field) {
		if (!isGalleryProfileField(field)) return null;
		return resolveStartupinspireScreenshotFileInput();
	},
	resolveLogoFileInput(field) {
		if (!isLogoProfileField(field)) return null;
		return resolveStartupinspireLogoFileInput();
	},
	isGalleryPreviewImage(img: HTMLImageElement, galleryReadRoot: Element | null) {
		if (
			img.closest(
				'app-upload-single, .upload-logo-wrapper, .current-logo, .logo-upload, [class*="logo-upload" i]'
			)
		) {
			return false;
		}
		if (!img.closest('app-upload, .screenshot-grid, .screenshot-card, .upload-trigger')) return false;
		if (galleryReadRoot && !galleryReadRoot.contains(img)) return false;
		const src = img.getAttribute('src')?.trim() ?? '';
		return src.length > 0 && !src.startsWith('data:image/svg');
	},
	resolveFileInput(field, fillMode, _options, _ctx) {
		if (fillMode !== 'file' && fillMode !== 'files') return undefined;
		if (isLogoProfileField(field)) {
			activateStartupinspireWizardStepSync('Logo');
			return resolveStartupinspireLogoFileInput();
		}
		if (isGalleryProfileField(field)) {
			activateStartupinspireWizardStepSync('Screenshots');
			return resolveStartupinspireScreenshotFileInput();
		}
		return undefined;
	},
	resolveFileInputAfterLabel(field, fillMode) {
		if (fillMode !== 'file' && fillMode !== 'files') return null;
		if (isLogoProfileField(field)) {
			activateStartupinspireWizardStepSync('Logo');
			return resolveStartupinspireLogoFileInput();
		}
		if (isGalleryProfileField(field)) {
			activateStartupinspireWizardStepSync('Screenshots');
			return resolveStartupinspireScreenshotFileInput();
		}
		return null;
	},
	async fillLogoFile(field, file) {
		if (!isLogoProfileField(field)) return null;
		const ok = await assignStartupinspireLogoFile(file);
		if (!ok) {
			return {
				key: field.key,
				label: field.label,
				status: 'error',
				message: 'Could not upload the logo. Open the Logo step and try again.',
			};
		}
		return { key: field.key, label: field.label, status: 'found' };
	},
	async fillGalleryFiles(field, files) {
		if (!isGalleryProfileField(field)) return null;
		if (files.length === 0) {
			return {
				key: field.key,
				label: field.label,
				status: 'not_in_profile',
				message:
					'Add product screenshots on your OpenQuok profile (Media tab), then try Fill again.',
			};
		}
		const { attached, total } = await assignStartupinspireScreenshotFiles(files);
		if (attached === 0) {
			return {
				key: field.key,
				label: field.label,
				status: 'not_found',
				message:
					'Screenshot upload control not found. Stay on the startup form — OpenQuok opens the Screenshots step during fill.',
			};
		}
		if (attached < total) {
			return {
				key: field.key,
				label: field.label,
				status: 'error',
				message: `Only ${attached} of ${total} screenshots uploaded. Use landscape product screenshots (not the square logo) on your OpenQuok Media tab.`,
			};
		}
		return { key: field.key, label: field.label, status: 'found' };
	},
};