import type { AutoLaunchProfileSnapshot, LaunchStepField } from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	applyUserValueToFormField,
	countFilled,
	fillLaunchField,
	fillLaunchStep,
	resolveFieldElement,
} from './fillEngine.js';

function snapshot(
	overrides: Partial<AutoLaunchProfileSnapshot> = {}
): AutoLaunchProfileSnapshot {
	return {
		name: 'Acme',
		tagline: null,
		description: null,
		website_url: null,
		logo_url: null,
		profile_data: {},
		integration_customer_id: null,
		...overrides
	};
}

function field(overrides: Partial<LaunchStepField> & Pick<LaunchStepField, 'key' | 'label'>): LaunchStepField {
	return {
		profilePath: 'name',
		...overrides
	};
}

describe('fillLaunchField', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('returns not_in_profile when the profile path is empty', async () => {
		const result = await fillLaunchField(
			snapshot({ name: '   ' }),
			field({ key: 'name', label: 'Name', profilePath: 'name' })
		);
		expect(result.status).toBe('not_in_profile');
	});

	it('returns not_found when selectorHint does not match', async () => {
		const result = await fillLaunchField(
			snapshot(),
			field({
				key: 'name',
				label: 'Name',
				profilePath: 'name',
				selectorHint: '#missing-field'
			})
		);
		expect(result.status).toBe('not_found');
	});

	it('applyUserValueToFormField writes into the resolved control', async () => {
		document.body.innerHTML = `
			<label for="video">Launch video URL</label>
			<input id="video" type="url" value="" />`;
		const videoField = field({
			key: 'launch_video_url',
			label: 'Launch video URL',
			profilePath: 'profile_data.launch_video_url',
			selectorHint: '#video',
		});
		expect(await applyUserValueToFormField(videoField, 'https://www.youtube.com/watch?v=demo')).toBe(
			true
		);
		const input = document.getElementById('video') as HTMLInputElement;
		expect(input.value).toBe('https://www.youtube.com/watch?v=demo');
	});

	it('fills Nuxt-style combobox selects (Uneed Category/Pricing)', async () => {
		document.body.innerHTML = `
			<div class="field">
				<label>Category</label>
				<div role="combobox" aria-expanded="false" aria-controls="category-list" id="category-wrap">
					<button type="button" id="category-trigger"><span>Development</span></button>
				</div>
			</div>
			<div id="category-list" role="listbox">
				<div role="option" data-value="development">Development</div>
				<div role="option" data-value="marketing">Marketing</div>
				<div role="option" data-value="business">Business</div>
			</div>`;

		const combobox = document.getElementById('category-wrap') as HTMLElement;
		const trigger = document.getElementById('category-trigger') as HTMLButtonElement;
		trigger.addEventListener('click', () => {
			combobox.setAttribute('aria-expanded', 'true');
		});
		const commitOption = (option: Element) => {
			const span = trigger.querySelector('span');
			if (span) span.textContent = option.textContent ?? '';
			combobox.setAttribute('aria-expanded', 'false');
		};
		for (const option of document.querySelectorAll('#category-list [role="option"]')) {
			option.addEventListener('keydown', (e) => {
				if (e instanceof KeyboardEvent && e.key === 'Enter') commitOption(option);
			});
		}

		const result = await fillLaunchField(
			snapshot({ profile_data: { category: 'Business' } }),
			field({
				key: 'category',
				label: 'Category',
				profilePath: 'profile_data.category',
				fillMode: 'select',
				selectCatalog: 'uneed',
				selectorHint: '#missing',
			})
		);

		expect(result.status).toBe('found');
		expect(trigger.textContent).toContain('Business');
	});

	it('toggles Nuxt-style switch when fillMode is boolean', async () => {
		document.body.innerHTML = `
			<div class="field">
				<label>Open Source</label>
				<input type="checkbox" class="sr-only" id="open-hidden" />
				<button type="button" role="switch" aria-checked="false" aria-labelledby="open-hidden"></button>
			</div>`;
		const toggle = document.querySelector('[role="switch"]') as HTMLButtonElement;
		toggle.addEventListener('click', () => {
			const next = toggle.getAttribute('aria-checked') !== 'true';
			toggle.setAttribute('aria-checked', next ? 'true' : 'false');
		});

		const result = await fillLaunchField(
			snapshot({ profile_data: { is_open_source: true } }),
			field({
				key: 'is_open_source',
				label: 'Open source',
				profilePath: 'profile_data.is_open_source',
				fillMode: 'boolean',
				selectorHint: '#nope',
			})
		);

		expect(result.status).toBe('found');
		expect(toggle.getAttribute('aria-checked')).toBe('true');
	});

	it('does not pair Launch video URL with a bare URL label (repository field)', () => {
		document.body.innerHTML = `
			<div class="field">
				<label for="repo">Repository URL</label>
				<input id="repo" type="url" value="https://github.com/org/repo" />
			</div>
			<div class="field">
				<label for="launch-video">Launch video URL</label>
				<input id="launch-video" type="url" value="https://www.youtube.com/watch?v=demo" />
			</div>
			<div class="field">
				<span>URL</span>
				<input id="stray-url" type="url" value="https://github.com/org/repo" />
			</div>`;

		const videoField = field({
			key: 'launch_video_url',
			label: 'Launch video URL',
			profilePath: 'profile_data.launch_video_url',
			selectorHint: '#no-match',
		});
		const resolved = resolveFieldElement(videoField);
		expect(resolved).not.toBeNull();
		expect((resolved as HTMLInputElement).id).toBe('launch-video');
	});

	it('fills by visible label when selectorHint misses (Uneed-style forms)', async () => {
		document.body.innerHTML = `
			<div class="field">
				<label for="uneed-tagline">Tagline</label>
				<input id="uneed-tagline" type="text" />
			</div>`;

		const result = await fillLaunchField(
			snapshot({ tagline: 'Ship faster with agents' }),
			field({
				key: 'tagline',
				label: 'Tagline',
				profilePath: 'tagline',
				selectorHint: '#does-not-exist'
			})
		);

		expect(result.status).toBe('found');
		const input = document.getElementById('uneed-tagline') as HTMLInputElement;
		expect(input.value).toBe('Ship faster with agents');
	});

	it('fills from valueOverride when the profile path is empty', async () => {
		const input = document.createElement('input');
		input.id = 'custom-tags';
		document.body.appendChild(input);

		const result = await fillLaunchField(
			snapshot({ profile_data: {} }),
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				selectorHint: '#custom-tags',
				fillMode: 'tags',
			}),
			undefined,
			{ valuesOverride: ['AI', 'Automation'] }
		);

		expect(result.status).toBe('found');
		expect(input.value).toBe('Automation');
	});

	it('fills from valueOverride scalar without reading the profile', async () => {
		const input = document.createElement('input');
		input.id = 'alias';
		document.body.appendChild(input);

		const result = await fillLaunchField(
			snapshot({ name: 'Ignored' }),
			field({
				key: 'alias',
				label: 'Alias',
				profilePath: 'name',
				selectorHint: '#alias',
			}),
			undefined,
			{ valueOverride: 'From picker' }
		);

		expect(result.status).toBe('found');
		expect(input.value).toBe('From picker');
	});

	it('fills text inputs by default', async () => {
		const input = document.createElement('input');
		input.id = 'product-name';
		document.body.appendChild(input);

		const result = await fillLaunchField(
			snapshot(),
			field({
				key: 'name',
				label: 'Name',
				profilePath: 'name',
				selectorHint: '#product-name'
			})
		);

		expect(result.status).toBe('found');
		expect(input.value).toBe('Acme');
	});

	it('fills native select controls when fillMode is select', async () => {
		const select = document.createElement('select');
		select.id = 'pricing';
		const free = document.createElement('option');
		free.value = 'free';
		free.textContent = 'Free';
		const paid = document.createElement('option');
		paid.value = 'paid';
		paid.textContent = 'Paid';
		select.append(free, paid);
		document.body.appendChild(select);

		const result = await fillLaunchField(
			snapshot({ profile_data: { pricing_type: 'paid' } }),
			field({
				key: 'pricing',
				label: 'Pricing',
				profilePath: 'profile_data.pricing_type',
				selectorHint: '#pricing',
				fillMode: 'select'
			})
		);

		expect(result.status).toBe('found');
		expect(select.value).toBe('paid');
	});

	it('toggles checkbox inputs when fillMode is boolean', async () => {
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.id = 'open-source';
		document.body.appendChild(checkbox);

		const result = await fillLaunchField(
			snapshot({ profile_data: { is_open_source: true } }),
			field({
				key: 'open_source',
				label: 'Open source',
				profilePath: 'profile_data.is_open_source',
				selectorHint: '#open-source',
				fillMode: 'boolean'
			})
		);

		expect(result.status).toBe('found');
		expect(checkbox.checked).toBe(true);
	});

	it('fills PeerPush-style product description textarea from profile HTML', async () => {
		document.body.innerHTML = `
			<label for="product-description">Product description</label>
			<textarea id="product-description" name="description" placeholder="Describe your product"></textarea>`;
		const textarea = document.getElementById('product-description') as HTMLTextAreaElement;
		const html = '<p>OpenQuok is a Content OS.</p><p>Post everywhere.</p>';

		const result = await fillLaunchField(
			snapshot({ description: html }),
			field({
				key: 'description',
				label: 'Product description',
				profilePath: 'description',
				fillMode: 'rich_html',
				selectorHint: '#missing',
			})
		);

		expect(result.status).toBe('found');
		expect(textarea.value).toContain('OpenQuok is a Content OS.');
		expect(textarea.value).toContain('Post everywhere.');
	});

	it('sets rich HTML on contenteditable targets when fillMode is rich_html', async () => {
		const editor = document.createElement('div');
		editor.className = 'ProseMirror';
		editor.id = 'description';
		document.body.appendChild(editor);

		const html = '<p>Ship <strong>faster</strong></p>';
		const result = await fillLaunchField(
			snapshot({ description: html }),
			field({
				key: 'description',
				label: 'Description',
				profilePath: 'description',
				selectorHint: '#description',
				fillMode: 'rich_html'
			})
		);

		expect(result.status).toBe('found');
		expect(editor.innerHTML).toBe(html);
	});

	it('checks checkbox groups when fillMode is checkbox_group', async () => {
		document.body.innerHTML = `
			<fieldset>
				<legend>Categories</legend>
				<label><input type="checkbox" id="cat-saas" value="saas" /> SaaS</label>
				<label><input type="checkbox" id="cat-dev" value="devtools" /> Developer Tools</label>
			</fieldset>`;

		const result = await fillLaunchField(
			snapshot({ profile_data: { categories: ['SaaS', 'Developer Tools'] } }),
			field({
				key: 'categories',
				label: 'Categories',
				profilePath: 'profile_data.categories',
				fillMode: 'checkbox_group',
			})
		);

		expect(result.status).toBe('found');
		expect((document.getElementById('cat-saas') as HTMLInputElement).checked).toBe(true);
		expect((document.getElementById('cat-dev') as HTMLInputElement).checked).toBe(true);
	});

	it('fills and resolves Open Launch Radix checkbox groups (Categories / Platforms)', async () => {
		document.body.innerHTML = `
			<div class="space-y-6" id="step-details">
				<div class="space-y-2" id="field-categories">
					<div class="flex items-center justify-between">
						<label data-slot="label" class="text-sm font-medium">Categories *</label>
						<p class="text-xs">(0/3 selected)</p>
					</div>
					<div class="rounded-md border p-4 space-y-3" id="categories-box">
						<div class="flex items-center space-x-2">
							<button type="button" role="checkbox" data-slot="checkbox" id="cat-saas" aria-checked="false" data-state="unchecked"></button>
							<label>SaaS</label>
						</div>
						<div class="flex items-center space-x-2">
							<button type="button" role="checkbox" data-slot="checkbox" id="cat-dev" aria-checked="false" data-state="unchecked"></button>
							<label>Developer Tools</label>
						</div>
						<div class="flex items-center space-x-2">
							<button type="button" role="checkbox" data-slot="checkbox" id="cat-marketing" aria-checked="false" data-state="unchecked"></button>
							<label>Marketing Tools</label>
						</div>
						<div class="flex items-center space-x-2">
							<button type="button" role="checkbox" data-slot="checkbox" id="cat-platform-opt" aria-checked="false" data-state="unchecked"></button>
							<label>Platform</label>
						</div>
					</div>
				</div>
				<div class="space-y-2" id="field-platforms">
					<label data-slot="label" class="text-sm font-medium">Platforms *</label>
					<div class="rounded-md border p-4 space-y-3 flex flex-col gap-3" id="platforms-box">
						<div class="flex items-center space-x-2">
							<button type="button" role="checkbox" data-slot="checkbox" id="plat-web" aria-checked="false" data-state="unchecked"></button>
							<label>web</label>
						</div>
						<div class="flex items-center space-x-2">
							<button type="button" role="checkbox" data-slot="checkbox" id="plat-api" aria-checked="false" data-state="unchecked"></button>
							<label>api</label>
						</div>
					</div>
				</div>
			</div>`;
		for (const btn of document.querySelectorAll('[data-slot="checkbox"]')) {
			btn.addEventListener('click', () => {
				btn.setAttribute('aria-checked', 'true');
				btn.setAttribute('data-state', 'checked');
			});
		}

		const categoriesField = field({
			key: 'categories',
			label: 'Categories',
			profilePath: 'profile_data.categories',
			fillMode: 'checkbox_group',
			checkboxCatalog: 'open_launch_categories',
			labelMatch: 'section',
			maxItems: 3,
		});
		const platformsField = field({
			key: 'platforms',
			label: 'Platforms',
			profilePath: 'profile_data.platforms',
			fillMode: 'checkbox_group',
			checkboxCatalog: 'open_launch_platforms',
			labelMatch: 'section',
		});

		expect(resolveFieldElement(categoriesField)?.querySelectorAll('[data-slot="checkbox"]').length).toBe(
			4
		);
		expect(resolveFieldElement(platformsField)?.querySelectorAll('[data-slot="checkbox"]').length).toBe(
			2
		);
		expect(resolveFieldElement(platformsField)?.closest('#field-platforms')).not.toBeNull();

		const catResult = await fillLaunchField(
			snapshot({
				profile_data: { categories: ['SaaS', 'Marketing', 'Developer Tools'] },
			}),
			categoriesField
		);
		expect(catResult.status).toBe('found');
		expect(document.getElementById('cat-saas')?.getAttribute('aria-checked')).toBe('true');

		const platResult = await fillLaunchField(
			snapshot({ profile_data: { platforms: ['Web', 'API'] } }),
			platformsField
		);
		expect(platResult.status).toBe('found');
		expect(document.getElementById('plat-web')?.getAttribute('aria-checked')).toBe('true');
		expect(document.getElementById('plat-api')?.getAttribute('aria-checked')).toBe('true');
	});

	it('maps profile Marketing to Open Launch Marketing Tools before fill', async () => {
		document.body.innerHTML = `
			<div class="space-y-2">
				<label class="text-sm font-medium">Categories</label>
				<div class="rounded-md border p-4 space-y-3" id="categories-box">
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" id="cat-saas" />
						<span>SaaS</span>
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" id="cat-marketing" />
						<span>Marketing Tools</span>
					</label>
				</div>
			</div>`;

		const result = await fillLaunchField(
			snapshot({ profile_data: { categories: ['SaaS', 'Marketing'] } }),
			field({
				key: 'categories',
				label: 'Categories',
				profilePath: 'profile_data.categories',
				fillMode: 'checkbox_group',
				checkboxCatalog: 'open_launch_categories',
				maxItems: 3,
			})
		);

		expect(result.status).toBe('found');
		expect((document.getElementById('cat-saas') as HTMLInputElement).checked).toBe(true);
		expect((document.getElementById('cat-marketing') as HTMLInputElement).checked).toBe(true);
	});

	it('selects a radio option when fillMode is select', async () => {
		document.body.innerHTML = `
			<div>
				<label><input type="radio" name="pricing" value="free" id="price-free" /> Free</label>
				<label><input type="radio" name="pricing" value="freemium" id="price-freemium" /> Freemium</label>
				<label><input type="radio" name="pricing" value="paid" id="price-paid" /> Paid</label>
			</div>`;

		const result = await fillLaunchField(
			snapshot({ profile_data: { pricing_type: 'freemium' } }),
			field({
				key: 'pricing_type',
				label: 'Pricing model',
				profilePath: 'profile_data.pricing_type',
				fillMode: 'select',
				selectorHint: '#price-free',
			})
		);

		expect(result.status).toBe('found');
		expect((document.getElementById('price-freemium') as HTMLInputElement).checked).toBe(true);
	});

	it('does not fill Rich description into the Uneed 80-char tagline textarea', async () => {
		document.body.innerHTML = `
			<div class="field">
				<label for="tagline">Tagline</label>
				<textarea id="tagline" maxlength="80"></textarea>
			</div>
			<div class="field">
				<label>Rich description</label>
				<div class="tiptap"><div class="ProseMirror" contenteditable="true"></div></div>
			</div>`;

		const descResult = await fillLaunchField(
			snapshot({ description: '<p>Long HTML body for the listing page</p>' }),
			field({
				key: 'description',
				label: 'Rich description',
				profilePath: 'description',
				fillMode: 'rich_html',
				selectorHint: '.tiptap .ProseMirror',
			})
		);

		expect(descResult.status).toBe('found');
		const tagline = document.getElementById('tagline') as HTMLTextAreaElement;
		expect(tagline.value).toBe('');
		const prose = document.querySelector('.ProseMirror') as HTMLElement;
		expect(prose.textContent).toContain('Long HTML body');
	});

	it('resolves Tags by label across sibling layout blocks (Uneed)', () => {
		document.body.innerHTML = `
			<div class="stack">
				<div><label>Tags</label></div>
				<div>
					<div class="inline-flex rounded-full"><span>AI</span><button type="button">×</button></div>
					<input role="combobox" aria-autocomplete="list" />
				</div>
			</div>`;
		const tagsField = field({
			key: 'tags',
			label: 'Tags',
			profilePath: 'profile_data.tags',
			fillMode: 'tags',
			selectorHint: '#nope',
		});
		const resolved = resolveFieldElement(tagsField);
		expect(resolved).not.toBeNull();
	});

	it('does not map Tagline to a rich description editor', async () => {
		document.body.innerHTML = `
			<div class="field">
				<label for="tagline">Tagline</label>
				<textarea id="tagline" maxlength="80"></textarea>
			</div>
			<div class="field">
				<label>Rich Description</label>
				<div class="ProseMirror" contenteditable="true"><p>Long HTML body</p></div>
			</div>`;

		const result = await fillLaunchField(
			snapshot({ tagline: 'Short tagline' }),
			field({
				key: 'tagline',
				label: 'Tagline',
				profilePath: 'tagline',
			})
		);

		expect(result.status).toBe('found');
		const tagline = document.getElementById('tagline') as HTMLTextAreaElement;
		expect(tagline.value).toBe('Short tagline');
	});

	it('fills product name into input[name="name"] without hitting url fields', async () => {
		document.body.innerHTML = `
			<label for="tool-name">Name</label>
			<input id="tool-name" name="name" type="text" value="https://www.youtube.com/watch?v=wrong" />
			<label for="tool-url">Url</label>
			<input id="tool-url" name="url" type="text" value="https://example.com" />`;

		const result = await fillLaunchField(
			snapshot({ name: 'OpenQuok' }),
			field({
				key: 'name',
				label: 'Product name',
				labelAliases: ['Name'],
				profilePath: 'name',
				selectorHint: 'input[name="name"]',
			})
		);

		expect(result.status).toBe('found');
		const nameInput = document.getElementById('tool-name') as HTMLInputElement;
		expect(nameInput.value).toBe('OpenQuok');
	});

	it('does not map social GitHub to the product name input on Uneed', async () => {
		document.body.innerHTML = `
			<label for="tool-name">Name</label>
			<input id="tool-name" name="name" type="text" value="OpenQuok" />
			<label for="repo">Repository URL</label>
			<input id="repo" name="repo_url" placeholder="https://github.com/..." value="https://github.com/org/repo" />`;

		const result = await fillLaunchField(
			snapshot({
				name: 'OpenQuok',
				profile_data: { social_github: 'https://github.com/openquok' },
			}),
			field({
				key: 'social_github',
				label: 'GitHub',
				profilePath: 'profile_data.social_github',
				selectorHint:
					"input[name*='github' i]:not([name='repo_url']), input[placeholder*='github' i]",
			})
		);

		expect(result.status).toBe('not_found');
		const nameInput = document.getElementById('tool-name') as HTMLInputElement;
		expect(nameInput.value).toBe('OpenQuok');
	});

	it('resolves Uneed Product name via label[for] and refuses youtube override values', async () => {
		document.body.innerHTML = `
			<label for="v-1-0-1-6">Name</label>
			<input id="v-1-0-1-6" name="name" type="text" value="https://www.youtube.com/watch?v=wrong" />`;

		const result = await fillLaunchField(
			snapshot({ name: 'OpenQuok' }),
			field({
				key: 'name',
				label: 'Product name',
				labelAliases: ['Name'],
				profilePath: 'name',
				selectorHint: 'input[name="name"]',
			}),
			undefined,
			{ valueOverride: 'https://www.youtube.com/watch?v=evil' }
		);

		expect(result.status).toBe('found');
		expect((document.getElementById('v-1-0-1-6') as HTMLInputElement).value).toBe('OpenQuok');
	});

	it('opens Uneed Show popup tags picker and selects a catalog tag', async () => {
		document.body.innerHTML = `
			<div class="tags-row">
				<label>Tags</label>
				<button type="button" id="tags-trigger" aria-haspopup="listbox" aria-controls="tags-list" aria-label="Show popup">Select tags</button>
				<div id="tag-chips" class="flex flex-wrap gap-2"></div>
				<div id="tags-list" role="listbox">
					<div role="option" data-value="AI Agents">AI Agents</div>
					<div role="option" data-value="Marketing">Marketing</div>
				</div>
			</div>`;
		const trigger = document.getElementById('tags-trigger') as HTMLButtonElement;
		const chipHost = document.getElementById('tag-chips')!;
		trigger.addEventListener('click', () => {
			const list = document.getElementById('tags-list');
			if (list) list.setAttribute('data-open', 'true');
		});
		for (const option of document.querySelectorAll('#tags-list [role="option"]')) {
			option.addEventListener('click', () => {
				const wrap = document.createElement('span');
				wrap.className = 'inline-flex rounded-full';
				wrap.textContent = option.textContent ?? '';
				const remove = document.createElement('button');
				remove.type = 'button';
				remove.textContent = '×';
				wrap.appendChild(remove);
				chipHost.appendChild(wrap);
			});
		}

		const result = await fillLaunchField(
			snapshot({ profile_data: { tags: ['AI Agents'] } }),
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				fillMode: 'tags',
				tagsCatalog: 'uneed',
				selectorHint: 'button[aria-label="Show popup"]',
			})
		);

		expect(result.status).toBe('found');
	});

	it('skips Uneed tags fill when profile tags are not in the official catalog', async () => {
		const input = document.createElement('input');
		input.id = 'tags';
		document.body.appendChild(input);

		const result = await fillLaunchField(
			snapshot({ profile_data: { categories: ['Developer Tools', 'SaaS'] } }),
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				selectorHint: '#tags',
				fillMode: 'tags',
				tagsCatalog: 'uneed',
			})
		);

		expect(result.status).toBe('skipped');
		expect(input.value).toBe('');
	});

	it('enters tag chips when fillMode is tags', async () => {
		const input = document.createElement('input');
		input.id = 'tags';
		document.body.appendChild(input);

		const result = await fillLaunchField(
			snapshot({ profile_data: { tags: ['devtools', 'saas'] } }),
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				selectorHint: '#tags',
				fillMode: 'tags'
			})
		);

		expect(result.status).toBe('found');
		expect(input.value).toBe('saas');
	});

	it('resolves PeerPush discovery search inputs from section headings', async () => {
		document.body.innerHTML = `
			<div data-field="categories">
				<label>Categories</label>
				<input id="search-categories" role="combobox" placeholder="Search categories..." />
			</div>
			<div data-field="useCases">
				<label>Use Cases</label>
				<input id="search-use-cases" role="combobox" placeholder="Search use cases..." />
			</div>`;

		const categories = field({
			key: 'categories',
			label: 'Categories',
			profilePath: 'profile_data.categories',
			fillMode: 'tags',
			labelMatch: 'section',
			tagsScope: 'section',
			selectorHint: "[data-field='categories'] input",
		});
		expect(resolveFieldElement(categories)?.id).toBe('search-categories');

		const useCases = field({
			key: 'use_cases',
			label: 'Use Cases',
			profilePath: 'profile_data.use_cases',
			fillMode: 'tags',
			labelMatch: 'section',
			tagsScope: 'section',
			selectorHint: "[data-field='useCases'] input",
		});
		expect(resolveFieldElement(useCases)?.id).toBe('search-use-cases');
	});

	it('ignores PeerPush footer nav labels when resolving Discovery fields', async () => {
		document.body.innerHTML = `
			<main>
				<div data-field="platforms">
					<label>Platforms</label>
					<input id="search-platforms" role="combobox" placeholder="Search platforms..." />
				</div>
			</main>
			<footer>
				<nav>
					<a href="/categories">Categories</a>
					<a href="/platforms">Platforms</a>
					<a href="/pricing">Pricing</a>
				</nav>
			</footer>`;

		const platforms = field({
			key: 'platforms',
			label: 'Platforms',
			profilePath: 'profile_data.platforms',
			fillMode: 'tags',
			labelMatch: 'section',
			tagsScope: 'section',
			selectorHint: "[data-field='platforms'] input",
		});
		expect(resolveFieldElement(platforms)?.id).toBe('search-platforms');
	});

	it('fills PeerPush discovery search inputs via listbox without combobox open loops', async () => {
		document.body.innerHTML = `
			<div data-field="categories" class="relative">
				<label>Categories</label>
				<div class="flex">
					<input id="cat-search" role="combobox" placeholder="Search categories..." />
					<button type="button" aria-label="Toggle options"></button>
				</div>
				<ul role="listbox">
					<li role="option" data-value="Developer Tools"><span>Developer Tools</span></li>
					<li role="option" data-value="Marketing"><span>Marketing</span></li>
				</ul>
			</div>`;

		const input = document.getElementById('cat-search') as HTMLInputElement;

		const result = await fillLaunchField(
			snapshot({ profile_data: { categories: ['Developer Tools', 'Marketing'] } }),
			field({
				key: 'categories',
				label: 'Categories',
				profilePath: 'profile_data.categories',
				fillMode: 'tags',
				labelMatch: 'section',
				tagsScope: 'section',
				selectorHint: "[data-field='categories'] input",
			})
		);

		expect(result.status).toBe('found');
		expect(input.value).toBe('');
	});

	it('enters PeerPush discovery tag lists from comma-joined profile arrays', async () => {
		const input = document.createElement('input');
		input.id = 'categories';
		document.body.appendChild(input);

		const result = await fillLaunchField(
			snapshot({
				profile_data: {
					categories: ['Developer Tools', 'Productivity'],
					use_cases: ['Launch marketing'],
					platforms: ['Web', 'macOS'],
				},
			}),
			field({
				key: 'categories',
				label: 'Categories',
				profilePath: 'profile_data.categories',
				selectorHint: '#categories',
				fillMode: 'tags',
			})
		);

		expect(result.status).toBe('found');
		expect(input.value).toBe('Productivity');
	});

	it('fills PeerPush Twitter username from profile social_x URL', async () => {
		document.body.innerHTML = `
			<label for="twitterUsername">Twitter username</label>
			<input id="twitterUsername" aria-label="X username" placeholder="username" />`;

		const result = await fillLaunchField(
			snapshot({ profile_data: { social_x: 'https://x.com/openquok' } }),
			field({
				key: 'social_x',
				label: 'Twitter username',
				profilePath: 'profile_data.social_x',
				selectorHint: '#twitterUsername, input[aria-label="X username"]',
			})
		);

		expect(result.status).toBe('found');
		expect((document.getElementById('twitterUsername') as HTMLInputElement).value).toBe('openquok');
	});

	it('fills PeerPush LinkedIn URL from profile_data.social_linkedin', async () => {
		document.body.innerHTML = `
			<label for="linkedinUrl">LinkedIn URL</label>
			<input id="linkedinUrl" type="url" aria-label="LinkedIn URL" placeholder="https://linkedin.com/username" />`;

		const result = await fillLaunchField(
			snapshot({ profile_data: { social_linkedin: 'https://www.linkedin.com/company/openquok' } }),
			field({
				key: 'social_linkedin',
				label: 'LinkedIn URL',
				profilePath: 'profile_data.social_linkedin',
				selectorHint: '#linkedinUrl, input[aria-label="LinkedIn URL"]',
			})
		);

		expect(result.status).toBe('found');
		expect((document.getElementById('linkedinUrl') as HTMLInputElement).value).toBe(
			'https://www.linkedin.com/company/openquok'
		);
	});

	it('fills optional MRR as text from profile_data.monthly_revenue_usd', async () => {
		const input = document.createElement('input');
		input.id = 'mrr';
		document.body.appendChild(input);

		const result = await fillLaunchField(
			snapshot({ profile_data: { monthly_revenue_usd: 4200 } }),
			field({
				key: 'monthly_revenue_usd',
				label: 'Monthly recurring revenue (optional)',
				profilePath: 'profile_data.monthly_revenue_usd',
				selectorHint: '#mrr',
			})
		);

		expect(result.status).toBe('found');
		expect(input.value).toBe('4200');
	});

	it('fills logo file inputs from stored profile media', async () => {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.id = 'logo';
		document.body.appendChild(fileInput);

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				blob: async () => new Blob(['png'], { type: 'image/png' }),
			})
		);

		const result = await fillLaunchField(
			snapshot({ logo_url: 'org/profile/logo.png' }),
			field({
				key: 'logo',
				label: 'Logo',
				profilePath: 'logo_url',
				selectorHint: '#logo',
				fillMode: 'file',
			}),
			{ dashboardOrigin: 'https://app.openquok.com' }
		);

		expect(result.status).toBe('found');
		expect(fileInput.files?.length).toBe(1);
		vi.unstubAllGlobals();
	});
});

describe('fillLaunchStep', () => {
	it('aggregates per-field results and counts filled rows', async () => {
		const input = document.createElement('input');
		input.id = 'name';
		document.body.appendChild(input);

		const results = await fillLaunchStep(snapshot(), {
			id: 'general',
			label: 'General',
			fields: [
				{
					key: 'name',
					label: 'Name',
					profilePath: 'name',
					selectorHint: '#name'
				},
				{
					key: 'tagline',
					label: 'Tagline',
					profilePath: 'tagline',
					selectorHint: '#tagline'
				}
			]
		});

		expect(results).toHaveLength(2);
		expect(countFilled(results)).toEqual({ filled: 1, total: 2 });
	});
});
