import type { FieldFillResult, LaunchStepField } from 'openquok-common';

export type SiteMediaFileInputOptions = {
	prime?: boolean;
	sequentialIndex?: number;
	preferEmpty?: boolean;
};

export type SiteMediaFileInputContext = {
	queryFileInputs: (selectorHint?: string) => HTMLInputElement[];
	defaultFileInputIndex: (
		field: LaunchStepField,
		fillMode: import('openquok-common').LaunchStepFieldFillMode
	) => number;
};

export interface SiteMediaAdapter {
	readonly id: string;
	matchesPage(): boolean;
	resolveGalleryReadRoot(field: LaunchStepField): Element | null;
	resolveLogoReadRoot(field: LaunchStepField): Element | null;
	resolveGalleryFileInput(
		field: LaunchStepField,
		options?: SiteMediaFileInputOptions
	): HTMLInputElement | null;
	resolveLogoFileInput(field: LaunchStepField): HTMLInputElement | null;
	isGalleryPreviewImage(img: HTMLImageElement, galleryReadRoot: Element | null): boolean;
	resolveFileInput(
		field: LaunchStepField,
		fillMode: import('openquok-common').LaunchStepFieldFillMode,
		options: SiteMediaFileInputOptions | undefined,
		ctx: SiteMediaFileInputContext
	): HTMLInputElement | null | undefined;
	fillGalleryFiles?(
		field: LaunchStepField,
		files: File[]
	): Promise<FieldFillResult | null>;
}