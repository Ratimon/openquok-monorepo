import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils/blogContent';
import { buildExternalLinkRel, resolveExternalLinkPolicy } from '$lib/utils/externalLinkRel';

function readHrefFromAnchorAttrs(attrBlob: string): string {
	const match = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrBlob);
	return (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim();
}

function stripRelAndTargetFromAnchorAttrs(attrBlob: string): string {
	return attrBlob
		.replace(/\s*\brel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(/\s*\btarget\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.trim();
}

/**
 * Build-backlinks copy: only absolute `*.openquok.com` links pass equity; third-party targets
 * (Chrome Web Store, GitHub, etc.) use the same policy as ExternalLink (`nofollow`).
 */
function applyLinkDirectoryOutboundPolicy(html: string): string {
	if (!html.trim()) return html;

	return html.replace(/<a\b([^>]*)>/gi, (full, attrBlob: string) => {
		const href = readHrefFromAnchorAttrs(attrBlob);
		if (!href) return full;

		if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
			return full;
		}
		if (href.startsWith('/') && !href.startsWith('//')) {
			return full;
		}
		if (!/^https?:\/\//i.test(href)) {
			return full;
		}

		const policy = resolveExternalLinkPolicy(href);
		const attrs = stripRelAndTargetFromAnchorAttrs(attrBlob);

		if (policy.follow) {
			return attrs.length > 0 ? `<a ${attrs}>` : '<a>';
		}

		const rel = buildExternalLinkRel(policy);
		const extra = rel ? `rel="${rel}" target="_blank"` : 'target="_blank"';
		return attrs.length > 0 ? `<a ${attrs} ${extra}>` : `<a ${extra}>`;
	});
}

/** Public build-backlinks rich text (site long copy, opportunity intro, step bodies). */
export function prepareLinkDirectoryRichTextForDisplay(content: string): string {
	const html = prepareBlogRichTextForDisplay(content);
	return applyLinkDirectoryOutboundPolicy(html);
}

/** Hub cards and JSON-LD: strip tags after the same decode/wrap pass used on the public site. */
export function linkDirectoryRichTextToPlainText(content: string): string {
	const trimmed = content.trim();
	if (!trimmed) return '';
	const html = prepareLinkDirectoryRichTextForDisplay(trimmed);
	return html
		.replace(/<br\s*\/?>/gi, ' ')
		.replace(/<\/p>/gi, ' ')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}