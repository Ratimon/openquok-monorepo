import { mergeAttributes } from '@tiptap/core';
import CodeBlock from '@tiptap/extension-code-block';

export const BLOG_CODE_BLOCK_LANGUAGES = [
	{ id: 'typescript', label: 'TypeScript' },
	{ id: 'javascript', label: 'JavaScript' },
	{ id: 'json', label: 'JSON' },
	{ id: 'shellscript', label: 'Shell' },
	{ id: 'bash', label: 'Bash' },
	{ id: 'python', label: 'Python' },
	{ id: 'plaintext', label: 'Plain text' }
] as const;

export type BlogCodeBlockLanguageId = (typeof BLOG_CODE_BLOCK_LANGUAGES)[number]['id'];

export const DEFAULT_BLOG_CODE_BLOCK_LANGUAGE: BlogCodeBlockLanguageId = 'typescript';

function readLanguageFromCodeElement(element: HTMLElement): string | null {
	const code = element.tagName === 'CODE' ? element : element.querySelector('code');
	if (!code) return null;
	const dataLang = code.getAttribute('data-language')?.trim();
	if (dataLang) return dataLang;
	const classMatch = (code.getAttribute('class') ?? '').match(/language-([\w-]+)/i);
	return classMatch?.[1] ?? null;
}

/** TipTap code block with a persisted `language` attribute for Shiki on the public blog. */
export const ContentEditorCodeBlock = CodeBlock.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			language: {
				default: DEFAULT_BLOG_CODE_BLOCK_LANGUAGE,
				parseHTML: (element) => readLanguageFromCodeElement(element as HTMLElement),
				renderHTML: (attributes) => {
					const language = String(attributes.language ?? '').trim();
					if (!language || language === 'plaintext') return {};
					return {
						'data-language': language,
						class: `language-${language}`
					};
				}
			}
		};
	},

	renderHTML({ node, HTMLAttributes }) {
		const language = String(node.attrs.language ?? '').trim();
		const codeAttrs =
			language && language !== 'plaintext'
				? { 'data-language': language, class: `language-${language}` }
				: {};

		return [
			'pre',
			{},
			['code', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, codeAttrs), 0]
		];
	}
});
