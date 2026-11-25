import {
	ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG,
	ALTERNATIVETO_USER_PROFILE_EXTENSION_CONFIG,
	DIRECTORY_EXTENSION_CONFIG_FIXTURES,
} from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { mountAlternativetoManageItemForm } from './alternativetoManageItemFixture.js';
import { fillLaunchField, resolveFieldElement } from './fillEngine.js';
import { readFormFieldValue } from './readFormField.js';
import {
	resolveAlternativetoIconFileInput,
	resolveAlternativetoScreenshotFileInput,
} from './siteMedia/alternativetoUploads.js';

/** Minimal DOM shaped like alternativeto.net/user/edit/ (Nov 2026). */
function mountAlternativetoUserEditForm(): void {
	document.body.innerHTML = `
		<form id="alternativeto-user-edit">
			<label>Twitter</label>
			<input name="twitter" aria-label="Twitter" placeholder="username" />
			<label>GitHub</label>
			<input name="github" aria-label="GitHub" />
			<label>Instagram</label>
			<input name="instagram" aria-label="Instagram" />
			<label>YouTube</label>
			<input name="youtube" aria-label="YouTube" />
			<label>LinkedIn</label>
			<input name="linkedin" type="url" aria-label="LinkedIn" placeholder="https://linkedin.com/in/you" />
		</form>
	`;
}

function allFieldsFromSteps(config: typeof ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG): string[] {
	return config.steps.flatMap((step) => step.fields.map((field) => field.key));
}

describe('AlternativeTo manage-item selector smoke', () => {
	beforeEach(() => {
		mountAlternativetoManageItemForm();
		Object.defineProperty(globalThis, 'location', {
			value: { hostname: 'alternativeto.net', pathname: '/manage-item/' },
			configurable: true,
		});
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('resolves every configured listing field against the manage-item-shaped DOM', () => {
		const missing: string[] = [];
		for (const step of ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps) {
			for (const field of step.fields) {
				const el = resolveFieldElement(field);
				if (!el) missing.push(`${step.id}:${field.key}`);
			}
		}
		expect(missing, `unresolved fields: ${missing.join(', ')}`).toEqual([]);
	});

	it('fills Short description from the main profile tagline when the variant tagline is empty', async () => {
		const taglineField = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps
			.find((s) => s.id === 'main_info')
			?.fields.find((f) => f.key === 'tagline');
		expect(taglineField).toBeDefined();
		const result = await fillLaunchField(
			{
				name: 'OpenQuok',
				tagline: null,
				description: 'Long body on variant',
				website_url: null,
				logo_url: null,
				profile_data: {},
				integration_customer_id: null,
			},
			taglineField!,
			{
				mainProfileSnapshot: {
					name: 'OpenQuok',
					tagline: 'Save hours: agentic Social scheduling + Directory launch.',
					description: 'Main long description',
					website_url: null,
					logo_url: null,
					profile_data: {},
					integration_customer_id: null,
				},
			}
		);
		expect(result.status).toBe('found');
		const short = document.querySelector<HTMLTextAreaElement>('textarea[name="shortDescription"]');
		expect(short?.value).toBe('Save hours: agentic Social scheduling + Directory launch.');
	});

	it('fills Short description with tagline and Full description with rich body', async () => {
		const mainStep = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps.find((s) => s.id === 'main_info');
		const taglineField = mainStep?.fields.find((f) => f.key === 'tagline');
		const descriptionField = mainStep?.fields.find((f) => f.key === 'description');
		expect(taglineField).toBeDefined();
		expect(descriptionField).toBeDefined();
		const taglineText = 'Save hours: agentic Social scheduling + Directory launch.';
		const bodyText = 'OpenQuok is an open-source Content OS for social scheduling and directory launch.';
		const snapshot = {
			name: 'OpenQuok',
			tagline: taglineText,
			description: `<p>${bodyText}</p>`,
			website_url: null,
			logo_url: null,
			profile_data: {},
			integration_customer_id: null,
		};
		const taglineResult = await fillLaunchField(snapshot, taglineField!);
		const descResult = await fillLaunchField(snapshot, descriptionField!);
		expect(taglineResult.status).toBe('found');
		expect(descResult.status).toBe('found');
		const short = document.querySelector<HTMLTextAreaElement>('textarea[name="shortDescription"]');
		const full = document.querySelector<HTMLTextAreaElement>('textarea[name="description"]');
		const editor = document.querySelector<HTMLElement>('.ProseMirror');
		expect(short?.value).toBe(taglineText);
		const longOnPage = `${full?.value ?? ''}${editor?.textContent ?? ''}`;
		expect(longOnPage).toContain('OpenQuok is an open-source');
		expect(short?.value).not.toContain('Content OS');
	});

	it('binds full description to the rich editor, not the short description field', () => {
		const mainStep = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps.find((s) => s.id === 'main_info');
		const tagline = mainStep?.fields.find((f) => f.key === 'tagline');
		const description = mainStep?.fields.find((f) => f.key === 'description');
		expect(tagline).toBeDefined();
		expect(description).toBeDefined();
		const short = document.querySelector<HTMLTextAreaElement>('textarea[name="shortDescription"]');
		const editor = document.querySelector<HTMLElement>('.ProseMirror');
		expect(short).not.toBeNull();
		expect(editor).not.toBeNull();
		short!.value = 'Short copy';
		editor!.textContent = 'Long body';
		expect(readFormFieldValue(tagline!)?.scalar).toBe('Short copy');
		expect(readFormFieldValue(description!)?.kind).toBe('rich_html');
	});

	it('reads screenshot thumbnails from the Screenshots block, not the icon', () => {
		const mediaStep = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps.find((s) => s.id === 'media');
		const gallery = mediaStep?.fields.find((f) => f.key === 'gallery');
		expect(gallery).toBeDefined();
		const block = document.querySelector('.screenshot-block');
		block?.insertAdjacentHTML(
			'beforeend',
			'<img src="https://cdn.example.com/add-page.png" alt="screenshot preview" />'
		);
		const shotRead = readFormFieldValue(gallery!);
		expect(shotRead?.present).toBe(true);
		expect(shotRead?.items?.[0]).toMatch(/add-page/i);
	});

	it('resolves distinct application icon vs screenshot file inputs', () => {
		const mediaStep = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps.find((s) => s.id === 'media');
		const logo = mediaStep?.fields.find((f) => f.key === 'logo');
		const gallery = mediaStep?.fields.find((f) => f.key === 'gallery');
		expect(logo).toBeDefined();
		expect(gallery).toBeDefined();
		Object.defineProperty(globalThis, 'location', {
			value: { hostname: 'alternativeto.net', pathname: '/manage-item/' },
			configurable: true,
		});
		const logoEl = resolveAlternativetoIconFileInput();
		const galleryEl = resolveAlternativetoScreenshotFileInput();
		expect(logoEl).not.toBeNull();
		expect(galleryEl).not.toBeNull();
		expect(logoEl).not.toBe(galleryEl);
		expect(logoEl?.name).toBe('applicationIcon');
		expect(galleryEl?.name).toBe('screenshots');
	});

	it('fills launch video URL into the Videos card', async () => {
		const field = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps
			.find((s) => s.id === 'videos')
			?.fields.find((f) => f.key === 'launch_video_url');
		expect(field).toBeDefined();
		const result = await fillLaunchField(
			{
				name: 'Demo',
				tagline: null,
				description: null,
				website_url: null,
				logo_url: null,
				profile_data: { launch_video_url: 'https://www.youtube.com/watch?v=iKNimZ9FBu8' },
				integration_customer_id: null,
			},
			field!
		);
		expect(result.status).toBe('found');
		const input = document.querySelector<HTMLInputElement>('#a2-video-url');
		expect(input?.value).toBe('https://www.youtube.com/watch?v=iKNimZ9FBu8');
	});

	it('keeps listing tiers on one shared step set', () => {
		const keys = allFieldsFromSteps(ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG);
		for (const slug of [
			'alternativeto-free-listing',
			'alternativeto-priority-review',
			'alternativeto-finish-listing',
		] as const) {
			const config = DIRECTORY_EXTENSION_CONFIG_FIXTURES[slug];
			expect(config).toBeDefined();
			const tierKeys = allFieldsFromSteps(
				config as typeof ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG
			);
			expect(tierKeys).toEqual(keys);
			expect(config!.readyUrlHint).toBe('manage-item');
		}
	});
});

describe('AlternativeTo user edit selector smoke', () => {
	beforeEach(() => {
		mountAlternativetoUserEditForm();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('resolves every configured profile field', () => {
		const missing: string[] = [];
		for (const field of ALTERNATIVETO_USER_PROFILE_EXTENSION_CONFIG.steps[0]?.fields ?? []) {
			const el = resolveFieldElement(field);
			if (!el) missing.push(field.key);
		}
		expect(missing, `unresolved fields: ${missing.join(', ')}`).toEqual([]);
	});

	it('reads LinkedIn as a URL field distinct from handle-only socials', () => {
		const linkedin = ALTERNATIVETO_USER_PROFILE_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'social_linkedin'
		);
		const github = ALTERNATIVETO_USER_PROFILE_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'social_github'
		);
		expect(linkedin).toBeDefined();
		expect(github).toBeDefined();
		const linkedinInput = document.querySelector<HTMLInputElement>('input[name="linkedin"]');
		const githubInput = document.querySelector<HTMLInputElement>('input[name="github"]');
		linkedinInput!.value = 'https://linkedin.com/in/acme';
		githubInput!.value = 'acme';
		expect(readFormFieldValue(linkedin!)?.scalar).toBe('https://linkedin.com/in/acme');
		expect(readFormFieldValue(github!)?.scalar).toBe('acme');
	});
});