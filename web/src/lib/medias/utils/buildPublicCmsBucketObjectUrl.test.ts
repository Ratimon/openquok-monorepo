import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildPublicCmsBucketObjectUrl } from '$lib/medias/utils/buildPublicCmsBucketObjectUrl';

describe('buildPublicCmsBucketObjectUrl', () => {
	const env = import.meta.env as Record<string, string | boolean | undefined>;

	beforeEach(() => {
		vi.stubEnv('VITE_STORAGE_R2_PUBLIC_BASE_URL', '');
		vi.stubEnv('VITE_PUBLIC_SUPABASE_URL', '');
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('prefers R2 public origin when set', () => {
		vi.stubEnv('VITE_STORAGE_R2_PUBLIC_BASE_URL', 'https://media.example.com/');
		expect(buildPublicCmsBucketObjectUrl('blog_images', 'user-1/hero.webp')).toBe(
			'https://media.example.com/blog_images/user-1/hero.webp'
		);
	});

	it('falls back to Supabase public object URL', () => {
		vi.stubEnv('VITE_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
		expect(buildPublicCmsBucketObjectUrl('link_directory_logos', 'org/logo.webp')).toBe(
			'https://abc.supabase.co/storage/v1/object/public/link_directory_logos/org/logo.webp'
		);
	});

	it('falls back to API download when no public origins are configured', () => {
		expect(buildPublicCmsBucketObjectUrl('blog_images', 'user-1/hero.webp')).toBe(
			'/api/v1/image/download?databaseName=blog_images&imageUrl=user-1%2Fhero.webp'
		);
	});

	it('passes through absolute URLs', () => {
		const url = 'https://cdn.example.com/existing.png';
		expect(buildPublicCmsBucketObjectUrl('blog_images', url)).toBe(url);
	});
});
