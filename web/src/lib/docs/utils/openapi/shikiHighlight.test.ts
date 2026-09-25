import { describe, expect, it } from 'vitest';

import { HTTP_CLIENT_SAMPLES } from '$lib/docs/utils/openapi/httpClientSamples';
import {
	highlightCode,
	normalizeOpenApiHighlightLang
} from '$lib/docs/utils/openapi/shikiHighlight';

describe('normalizeOpenApiHighlightLang', () => {
	it('maps shell aliases to shellscript', () => {
		for (const alias of ['bash', 'sh', 'shell', 'zsh']) {
			expect(normalizeOpenApiHighlightLang(alias)).toBe('shellscript');
		}
	});

	it('maps py to python', () => {
		expect(normalizeOpenApiHighlightLang('py')).toBe('python');
	});

	it('trims and lowercases before lookup', () => {
		expect(normalizeOpenApiHighlightLang('  BASH  ')).toBe('shellscript');
		expect(normalizeOpenApiHighlightLang('Python')).toBe('python');
	});

	it('passes through canonical ids unchanged', () => {
		expect(normalizeOpenApiHighlightLang('javascript')).toBe('javascript');
		expect(normalizeOpenApiHighlightLang('php')).toBe('php');
	});
});

function expectShikiHighlighted(html: string): void {
	expect(html).toMatch(/class="shiki\b/);
	expect(html).toMatch(/<span[^>]*style=/);
}

describe('highlightCode', () => {
	it('highlights Python with Shiki token spans', async () => {
		const html = await highlightCode('import requests\n', 'python');
		expectShikiHighlighted(html);
	});

	it.each(HTTP_CLIENT_SAMPLES.map((s) => [s.label, s.shikiLanguage] as const))(
		'highlights %s sample language (%s)',
		async (_label, shikiLanguage) => {
			const snippet =
				shikiLanguage === 'python'
					? 'import requests\n'
					: shikiLanguage === 'javascript'
						? 'const x = 1;\n'
						: shikiLanguage === 'bash'
							? 'curl https://example.com\n'
							: shikiLanguage === 'php'
								? '<?php echo 1;\n'
								: shikiLanguage === 'go'
									? 'package main\n'
									: shikiLanguage === 'java'
										? 'class Main {}\n'
										: shikiLanguage === 'ruby'
											? 'puts 1\n'
											: 'x\n';
			const html = await highlightCode(snippet, shikiLanguage);
			expectShikiHighlighted(html);
		}
	);
});
