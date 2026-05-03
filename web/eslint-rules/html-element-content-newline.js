/**
 * Require text content inside block-level HTML elements to start on a new line.
 * Matches the pattern used in EditorWorkspaceSettings.svelte (e.g. lines 191–197):
 * opening tag on one line, text on the next, closing tag on the next.
 *
 * The shared `Button` Svelte component is included so modal/footer actions match
 * `UpdateWebsiteModal.svelte` (multiline attrs + label on its own line).
 *
 * Inline elements (span, a, strong, etc.) are ignored by default so short
 * phrases can stay on one line.
 */

/** Inline/void elements where single-line content is allowed (Vue-style ignores). */
const DEFAULT_IGNORES = new Set([
	'pre',
	'textarea',
	'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em',
	'i', 'kbd', 'mark', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'span',
	'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr',
	'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track'
]);

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {{ [key: string]: import('eslint').Rule.RuleListener }}
 */
function create(context) {
	const sourceCode = context.sourceCode;
	const options = context.options[0] ?? {};
	const ignores = new Set([
		...(options.ignores ?? []),
		...DEFAULT_IGNORES
	]);

	return {
		SvelteElement(node) {
			if (node.endTag == null || node.children.length === 0) {
				return;
			}

			const rawName = node.name?.name ?? '';
			const tagNameLower = rawName.toLowerCase();
			const isHtmlKind = node.kind === 'html';
			const isButtonComponent = node.kind !== 'html' && rawName === 'Button';

			if (!isHtmlKind && !isButtonComponent) {
				return;
			}

			if (isHtmlKind && ignores.has(tagNameLower)) {
				return;
			}

			const firstChild = node.children[0];
			const isTextOrMustache =
				firstChild.type === 'SvelteText' ||
				firstChild.type === 'SvelteMustacheTag';

			if (!isTextOrMustache) {
				return;
			}

			// Allow empty text (whitespace-only can be considered empty for this rule)
			if (firstChild.type === 'SvelteText' && !firstChild.value.trim()) {
				return;
			}

			// Text that starts with a newline is already on a new line after the opening tag
			if (firstChild.type === 'SvelteText' && firstChild.value.startsWith('\n')) {
				return;
			}

			const startTag = node.startTag;
			const closingBracket = sourceCode.getLastToken(startTag);
			if (!closingBracket || closingBracket.value !== '>') {
				return;
			}

			const closingBracketLine = closingBracket.loc.start.line;
			const contentStartLine = firstChild.loc.start.line;

			if (contentStartLine === closingBracketLine) {
				context.report({
					node: firstChild,
					loc: { start: closingBracket.loc.end, end: firstChild.loc.start },
					messageId: 'contentNewline',
					fix(fixer) {
						const text = sourceCode.getText();
						const tagLineStartIndex = text.lastIndexOf('\n', startTag.range[0] - 1) + 1;
						const baseIndent = text.slice(tagLineStartIndex, startTag.range[0]);
						const contentIndent = baseIndent + (baseIndent.includes('\t') ? '\t' : '    ');
						return fixer.insertTextAfter(closingBracket, '\n' + contentIndent);
					}
				});
			}
		}
	};
}

export const meta = {
	docs: {
		description: 'Require text content inside block-level HTML elements to start on a new line after the opening tag.'
	},
	schema: [
		{
			type: 'object',
			properties: {
				ignores: {
					type: 'array',
					items: { type: 'string' },
					description: 'Additional tag names to allow single-line content (besides default inline/void elements).'
				}
			},
			additionalProperties: false
		}
	],
	messages: {
		contentNewline: 'Text content must start on a new line after the opening tag.'
	},
	fixable: 'code',
	type: 'layout'
};

export default { meta, create };
