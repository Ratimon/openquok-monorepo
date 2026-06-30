import { externalLinkRelForHref } from '$lib/utils/externalLinkRel';

export type InlineSegment =
	| { type: 'text'; text: string }
	| { type: 'bold'; text: string }
	| { type: 'em'; text: string }
	| { type: 'link'; label: string; href: string }
	| { type: 'code'; text: string; asBadge: boolean };

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** CLI tokens, env vars, and API keys render as badge chips in listing bodies. */
export function inlineCodeShouldRenderAsBadge(code: string): boolean {
	const trimmed = code.trim();
	if (!trimmed) return false;
	if (/^opo_[\w-]+/i.test(trimmed)) return true;
	if (/^OPENQUOK_/i.test(trimmed)) return true;
	if (/^export\s+OPENQUOK_/i.test(trimmed)) return true;
	if (/^openquok\b/i.test(trimmed)) return true;
	if (/^(auth|posts|integrations|analytics|upload)[\w:-]*/i.test(trimmed)) return true;
	if (trimmed.includes(':') && !trimmed.includes(' ')) return true;
	return false;
}

const INLINE_PATTERN =
	/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

export function parseInlineMarkdown(text: string): InlineSegment[] {
	if (!text) return [];

	const segments: InlineSegment[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = INLINE_PATTERN.exec(text)) !== null) {
		if (match.index > lastIndex) {
			segments.push({ type: 'text', text: text.slice(lastIndex, match.index) });
		}

		const token = match[0];
		if (token.startsWith('**') && token.endsWith('**')) {
			segments.push({ type: 'bold', text: token.slice(2, -2) });
		} else if (token.startsWith('*') && token.endsWith('*')) {
			segments.push({ type: 'em', text: token.slice(1, -1) });
		} else if (token.startsWith('`') && token.endsWith('`')) {
			const codeText = token.slice(1, -1);
			segments.push({
				type: 'code',
				text: codeText,
				asBadge: inlineCodeShouldRenderAsBadge(codeText)
			});
		} else if (token.startsWith('[')) {
			const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
			if (linkMatch) {
				segments.push({ type: 'link', label: linkMatch[1], href: linkMatch[2] });
			} else {
				segments.push({ type: 'text', text: token });
			}
		} else {
			segments.push({ type: 'text', text: token });
		}

		lastIndex = match.index + token.length;
	}

	if (lastIndex < text.length) {
		segments.push({ type: 'text', text: text.slice(lastIndex) });
	}

	return segments;
}

export function inlineMarkdownToHtml(text: string): string {
	return parseInlineMarkdown(text)
		.map((segment) => {
			switch (segment.type) {
				case 'text':
					return escapeHtml(segment.text);
				case 'bold':
					return `<strong>${escapeHtml(segment.text)}</strong>`;
				case 'em':
					return `<em>${escapeHtml(segment.text)}</em>`;
				case 'code':
					return `<code>${escapeHtml(segment.text)}</code>`;
				case 'link': {
					const safeHref = segment.href.trim();
					if (!/^https?:\/\//i.test(safeHref)) {
						return escapeHtml(segment.label);
					}
					const rel = externalLinkRelForHref(safeHref);
					const relAttr = rel ? ` rel="${escapeHtml(rel)}"` : '';
					return `<a href="${escapeHtml(safeHref)}"${relAttr} target="_blank" class="font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary">${escapeHtml(segment.label)}</a>`;
				}
				default:
					return '';
			}
		})
		.join('');
}
