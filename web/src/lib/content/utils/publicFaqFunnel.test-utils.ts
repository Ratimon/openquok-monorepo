import { expect } from 'vitest';

import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils/prepareBlogContentForDisplay';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

export type FaqAnchor = {
	href: string;
	label: string;
};

export const CONNECT_FAQ_TITLE_PATTERN =
	/^How do I connect|^How do I schedule posts on a LinkedIn company Page/i;

export function extractFaqAnchors(html: string): FaqAnchor[] {
	return [...html.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map((match) => ({
		href: match[1],
		label: match[2]
	}));
}

export function isConnectFaqTitle(title: string): boolean {
	return CONNECT_FAQ_TITLE_PATTERN.test(title);
}

/** Every `/docs/social-integration/` anchor must include “self-host” in the label. */
export function assertSelfHostLabelsOnSocialIntegrationLinks(
	items: readonly Pick<PublicFaqItem, 'description'>[]
): void {
	const socialIntegrationAnchors = items.flatMap((item) =>
		extractFaqAnchors(item.description).filter((anchor) =>
			anchor.href.startsWith('/docs/social-integration/')
		)
	);

	for (const anchor of socialIntegrationAnchors) {
		expect(anchor.label.toLowerCase()).toContain('self-host');
		if (/setup guide$/i.test(anchor.label)) {
			expect(anchor.label.toLowerCase()).toMatch(/^self-host /);
		}
	}

	expect(
		socialIntegrationAnchors.every((anchor) => anchor.label.toLowerCase().includes('self-host'))
	).toBe(true);
}

/** Connect FAQs must link to sign-up and/or the connect channels guide. */
export function assertConnectFaqsHaveFunnelLinks(
	items: readonly PublicFaqItem[],
	titleMatcher: (title: string) => boolean = isConnectFaqTitle
): void {
	const connectItems = items.filter((item) => titleMatcher(item.title));
	expect(connectItems.length).toBeGreaterThan(0);

	for (const item of connectItems) {
		const anchors = extractFaqAnchors(item.description);
		const hasSignUp = anchors.some((anchor) => anchor.href === '/sign-up');
		const hasConnectGuide = anchors.some((anchor) => anchor.href === '/docs/channels/connect');

		expect(hasSignUp || hasConnectGuide).toBe(true);
	}
}

export function faqAnswerPlainText(description: string): string {
	return stripHtmlToPlainText(prepareBlogRichTextForDisplay(description));
}

/** JSON-LD FAQ answers must be plain text with link labels preserved. */
export function assertFaqJsonLdPlainTextAnswers(params: {
	pageUrl: string;
	items: readonly PublicFaqItem[];
}): void {
	const schema = createPublicFaqSEOSchema(params);

	expect(schema['@type']).toBe('FAQPage');
	const answers = (schema.mainEntity as { acceptedAnswer: { text: string } }[]).map(
		(entity) => entity.acceptedAnswer.text
	);

	expect(answers.length).toBe(params.items.length);

	for (let index = 0; index < params.items.length; index += 1) {
		const visiblePlainText = faqAnswerPlainText(params.items[index].description);
		expect(answers[index]).toBe(visiblePlainText);
		expect(answers[index]).not.toContain('<a');
		expect(answers[index]).not.toContain('href=');
	}
}

export function assertNoNofollowOnFirstPartyFaqLinks(
	items: readonly Pick<PublicFaqItem, 'description'>[]
): void {
	const html = items.map((item) => item.description).join('\n');
	expect(html).not.toContain('rel="nofollow"');
}
