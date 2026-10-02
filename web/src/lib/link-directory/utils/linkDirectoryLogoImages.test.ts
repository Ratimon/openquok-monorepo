import { describe, expect, it } from 'vitest';

import {
	buildLinkDirectoryLogoPublicUrl,
	extractLinkDirectoryLogoStoragePathFromImageSrc,
	resolveLinkDirectoryLogoStorageKey
} from '$lib/link-directory/utils/linkDirectoryLogoImages';

describe('extractLinkDirectoryLogoStoragePathFromImageSrc', () => {
	it('derives storage keys from Supabase public object URLs', () => {
		expect(
			extractLinkDirectoryLogoStoragePathFromImageSrc(
				'https://example.supabase.co/storage/v1/object/public/link_directory_logos/user-1/logo.webp'
			)
		).toBe('user-1/logo.webp');
	});

	it('derives storage keys from API download URLs', () => {
		expect(
			extractLinkDirectoryLogoStoragePathFromImageSrc(
				'/api/v1/image/download?databaseName=link_directory_logos&imageUrl=user-1%2Flogo.webp'
			)
		).toBe('user-1/logo.webp');
	});

	it('ignores blob preview URLs', () => {
		expect(extractLinkDirectoryLogoStoragePathFromImageSrc('blob:http://localhost/abc')).toBeNull();
	});

	it('ignores external HTTPS URLs that are not our bucket', () => {
		expect(
			extractLinkDirectoryLogoStoragePathFromImageSrc('https://cdn.example.com/logo.png')
		).toBeNull();
	});
});

describe('resolveLinkDirectoryLogoStorageKey', () => {
	it('accepts bare object keys', () => {
		expect(resolveLinkDirectoryLogoStorageKey('aa1a6c25-d1dc-43d7-9b13-a3e8ac48caf1-0.786.jpg')).toBe(
			'aa1a6c25-d1dc-43d7-9b13-a3e8ac48caf1-0.786.jpg'
		);
	});

	it('strips link_directory_logos/ prefix', () => {
		expect(resolveLinkDirectoryLogoStorageKey('link_directory_logos/user-1/logo.webp')).toBe(
			'user-1/logo.webp'
		);
	});

	it('extracts key from Supabase public URLs', () => {
		expect(
			resolveLinkDirectoryLogoStorageKey(
				'https://example.supabase.co/storage/v1/object/public/link_directory_logos/user-1/logo.webp'
			)
		).toBe('user-1/logo.webp');
	});

	it('returns null for empty or placeholder values', () => {
		expect(resolveLinkDirectoryLogoStorageKey('')).toBeNull();
		expect(resolveLinkDirectoryLogoStorageKey('null')).toBeNull();
		expect(resolveLinkDirectoryLogoStorageKey('undefined')).toBeNull();
	});

	it('returns null for unrelated external URLs', () => {
		expect(resolveLinkDirectoryLogoStorageKey('https://cdn.example.com/logo.png')).toBeNull();
	});
});

describe('buildLinkDirectoryLogoPublicUrl', () => {
	it('builds an API download URL when Supabase public URL is unavailable', () => {
		expect(buildLinkDirectoryLogoPublicUrl('user-1/logo.webp')).toBe(
			'/api/v1/image/download?databaseName=link_directory_logos&imageUrl=user-1%2Flogo.webp'
		);
	});

	it('rebuilds a correct public URL when given a full Supabase object URL', () => {
		const key = 'user-1/logo.webp';
		const broken = `https://wrong.supabase.co/storage/v1/object/public/link_directory_logos/${key}`;
		expect(buildLinkDirectoryLogoPublicUrl(broken)).toBe(buildLinkDirectoryLogoPublicUrl(key));
	});

	it('returns an empty string when the storage path cannot be resolved', () => {
		expect(buildLinkDirectoryLogoPublicUrl('')).toBe('');
		expect(buildLinkDirectoryLogoPublicUrl('https://cdn.example.com/logo.png')).toBe('');
	});
});
