import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
import htmlElementContentNewline from './eslint-rules/html-element-content-newline.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

const webSvelteRules = {
	rules: {
		'html-element-content-newline': htmlElementContentNewline
	}
};

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			"no-undef": 'off',
			// Opt out of requiring $app/paths resolve() on every href/goto (large churn; paths are often static helpers).
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		plugins: {
			'web-svelte-layout': webSvelteRules
		},
		rules: {
			'web-svelte-layout/html-element-content-newline': 'error'
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	}
);
