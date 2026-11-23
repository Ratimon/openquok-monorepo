export { assignFilesToInput } from '../fileInputAssign.js';
export { isGalleryProfileField, isLogoProfileField } from './profileMediaFields.js';
export {
	productImagesSectionOnPage,
	productImagesSectionElement,
	countProductGalleryImagesInSection,
	isProductGalleryPreviewImage,
} from './headingSectionGallery.js';
export { getActiveSiteMediaAdapter, getSiteMediaAdapterForGalleryPreview } from './registry.js';
export type { SiteMediaAdapter, SiteMediaFileInputContext, SiteMediaFileInputOptions } from './types.js';