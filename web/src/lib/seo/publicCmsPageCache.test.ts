import { describe, expect, it } from 'vitest';

import {
	applyPublicHtmlCacheHeadersForPathname,
	EDITOR_MANAGED_PUBLIC_PAGE_CACHE_CONTROL,
	isBuildBacklinksSiteGuideDetailPath,
	isEditorManagedPublicHtmlPath,
	isPublicBlogPostDetailPath,
	isPublicCreatorListingDetailPath
} from './publicCmsPageCache';

describe('publicCmsPageCache', () => {
	describe('isBuildBacklinksSiteGuideDetailPath', () => {
		it('matches site guide detail only', () => {
			expect(isBuildBacklinksSiteGuideDetailPath('/build-backlinks/bluesky')).toBe(true);
			expect(isBuildBacklinksSiteGuideDetailPath('/build-backlinks/bluesky/')).toBe(true);
			expect(isBuildBacklinksSiteGuideDetailPath('/build-backlinks')).toBe(false);
			expect(isBuildBacklinksSiteGuideDetailPath('/build-backlinks/tags')).toBe(false);
			expect(isBuildBacklinksSiteGuideDetailPath('/build-backlinks/categories')).toBe(false);
		});
	});

	describe('isPublicBlogPostDetailPath', () => {
		it('matches post slug only', () => {
			expect(isPublicBlogPostDetailPath('/blog/how-to-warm-up')).toBe(true);
			expect(isPublicBlogPostDetailPath('/blog')).toBe(false);
			expect(isPublicBlogPostDetailPath('/blog/topic')).toBe(false);
			expect(isPublicBlogPostDetailPath('/blog/topic/seo')).toBe(false);
			expect(isPublicBlogPostDetailPath('/blog/author/jane')).toBe(false);
		});
	});

	describe('isPublicCreatorListingDetailPath', () => {
		it('matches creator building block and playbook detail', () => {
			expect(
				isPublicCreatorListingDetailPath('/creators/openquok/building-blocks/openquok-core')
			).toBe(true);
			expect(isPublicCreatorListingDetailPath('/creators/openquok/playbooks/my-stack')).toBe(
				true
			);
			expect(isPublicCreatorListingDetailPath('/creators/openquok')).toBe(false);
			expect(isPublicCreatorListingDetailPath('/building-blocks')).toBe(false);
		});
	});

	describe('isEditorManagedPublicHtmlPath', () => {
		it('is true for all editor-managed HTML families', () => {
			expect(isEditorManagedPublicHtmlPath('/build-backlinks/bluesky')).toBe(true);
			expect(isEditorManagedPublicHtmlPath('/blog/my-post')).toBe(true);
			expect(
				isEditorManagedPublicHtmlPath('/creators/acme/building-blocks/skill-scheduler')
			).toBe(true);
			expect(isEditorManagedPublicHtmlPath('/playbooks')).toBe(false);
		});
	});

	describe('applyPublicHtmlCacheHeadersForPathname', () => {
		it('uses no-cache on editor-managed detail pages', () => {
			const headers: Record<string, string> = {};
			applyPublicHtmlCacheHeadersForPathname('/build-backlinks/bluesky', (h) =>
				Object.assign(headers, h)
			);
			expect(headers['cache-control']).toBe(EDITOR_MANAGED_PUBLIC_PAGE_CACHE_CONTROL);
		});

		it('uses no-cache on blog post and creator listing detail', () => {
			for (const path of [
				'/blog/my-post',
				'/creators/openquok/playbooks/stack-a'
			] as const) {
				const headers: Record<string, string> = {};
				applyPublicHtmlCacheHeadersForPathname(path, (h) => Object.assign(headers, h));
				expect(headers['cache-control']).toBe(EDITOR_MANAGED_PUBLIC_PAGE_CACHE_CONTROL);
			}
		});

		it('uses default public CMS cache on hub', () => {
			const headers: Record<string, string> = {};
			applyPublicHtmlCacheHeadersForPathname('/build-backlinks', (h) => Object.assign(headers, h));
			expect(headers['cache-control']).toContain('public, max-age=60');
		});
	});
});
