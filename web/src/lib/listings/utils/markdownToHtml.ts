import { externalLinkRelForHref } from '$lib/utils/externalLinkRel';

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function inlineMarkdown(text: string): string {
	let out = escapeHtml(text);
	out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
	out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
	out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
		const safeHref = String(href).trim();
		if (!/^https?:\/\//i.test(safeHref)) {
			return escapeHtml(String(label));
		}
		const rel = externalLinkRelForHref(safeHref);
		const relAttr = rel ? ` rel="${escapeHtml(rel)}"` : '';
		return `<a href="${escapeHtml(safeHref)}"${relAttr} target="_blank" class="font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary">${escapeHtml(String(label))}</a>`;
	});
	return out;
}

/** Strip HTML comments (e.g. SPDX headers in imported SKILL.md) before rendering. */
function stripHtmlComments(markdown: string): string {
	return markdown.replace(/<!--[\s\S]*?-->/g, '');
}

/** Minimal Markdown → HTML for listing bodies (headings, lists, paragraphs, inline code/links). */
export function markdownToHtml(markdown: string): string {
	const trimmed = stripHtmlComments(markdown).trim();
	if (!trimmed) return '';
	if (/^<[a-z][\s\S]*>/i.test(trimmed)) {
		return trimmed;
	}

	const lines = trimmed.split(/\r?\n/);
	const blocks: string[] = [];
	let listItems: string[] = [];
	let inCode = false;
	let codeLines: string[] = [];

	const flushList = () => {
		if (listItems.length === 0) return;
		blocks.push(`<ul>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
		listItems = [];
	};

	const flushCode = () => {
		if (codeLines.length === 0) return;
		blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
		codeLines = [];
	};

	for (const rawLine of lines) {
		const line = rawLine.trimEnd();

		if (line.startsWith('```')) {
			if (inCode) {
				inCode = false;
				flushCode();
			} else {
				flushList();
				inCode = true;
			}
			continue;
		}

		if (inCode) {
			codeLines.push(rawLine);
			continue;
		}

		if (!line.trim()) {
			flushList();
			continue;
		}

		const heading = line.match(/^(#{1,6})\s+(.+)$/);
		if (heading) {
			flushList();
			const level = heading[1].length;
			blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
			continue;
		}

		const listItem = line.match(/^[-*]\s+(.+)$/);
		if (listItem) {
			listItems.push(listItem[1]);
			continue;
		}

		flushList();
		blocks.push(`<p>${inlineMarkdown(line)}</p>`);
	}

	flushList();
	flushCode();

	return blocks.join('\n');
}
