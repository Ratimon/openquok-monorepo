import type { LaunchStepField } from 'openquok-common';

export function isGalleryProfileField(field: LaunchStepField): boolean {
	return field.key === 'gallery' || field.profilePath.includes('gallery_urls');
}

export function isLogoProfileField(field: LaunchStepField): boolean {
	return field.key === 'logo' || field.profilePath === 'logo_url';
}