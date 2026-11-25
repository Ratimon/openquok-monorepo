import type { AutoLaunchProfileSnapshot, FieldFillResult, LaunchStepField } from 'openquok-common';

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
	/** When generic label/hint resolution fails on this site (e.g. twin icon + banner dropzones). */
	resolveFileInputAfterLabel?(
		field: LaunchStepField,
		fillMode: import('openquok-common').LaunchStepFieldFillMode,
		ctx: SiteMediaFileInputContext
	): HTMLInputElement | null;
	fillGalleryFiles?(
		field: LaunchStepField,
		files: File[]
	): Promise<FieldFillResult | null>;
	fillLogoFile?(field: LaunchStepField, file: File): Promise<FieldFillResult | null>;
	/** When the site accepts https URLs (e.g. “upload by URL”) instead of blob file picks. */
	fillLogoMedia?(
		snapshot: AutoLaunchProfileSnapshot,
		field: LaunchStepField,
		context: { dashboardOrigin: string; mainProfileSnapshot?: AutoLaunchProfileSnapshot | null }
	): Promise<FieldFillResult | null>;
	fillGalleryMedia?(
		snapshot: AutoLaunchProfileSnapshot,
		field: LaunchStepField,
		context: { dashboardOrigin: string; mainProfileSnapshot?: AutoLaunchProfileSnapshot | null }
	): Promise<FieldFillResult | null>;
}