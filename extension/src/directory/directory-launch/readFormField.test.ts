import type { LaunchStepField } from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	coerceTagDisplayItems,
	filterCompositeTagLabels,
	readFormFieldValue,
} from './readFormField.js';

function field(overrides: Partial<LaunchStepField> & Pick<LaunchStepField, 'key' | 'label'>): LaunchStepField {
	return {
		profilePath: 'name',
		...overrides,
	};
}

describe('readFormFieldValue', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('returns null when the field control is missing', () => {
		expect(
			readFormFieldValue(
				field({ key: 'name', label: 'Name', selectorHint: '#missing' })
			)
		).toBeNull();
	});

	it('reads text input values', () => {
		document.body.innerHTML = `<input id="name" value="Acme Corp" />`;
		const result = readFormFieldValue(
			field({
				key: 'name',
				label: 'Name',
				profilePath: 'name',
				selectorHint: '#name',
			})
		);
		expect(result).toEqual({
			kind: 'text',
			scalar: 'Acme Corp',
			present: true,
		});
	});

	it('reads native select option text', () => {
		document.body.innerHTML = `
			<select id="pricing">
				<option value="free">Free</option>
				<option value="paid" selected>Paid</option>
			</select>`;
		const result = readFormFieldValue(
			field({
				key: 'pricing',
				label: 'Pricing',
				profilePath: 'profile_data.pricing_type',
				selectorHint: '#pricing',
				fillMode: 'select',
			})
		);
		expect(result).toEqual({
			kind: 'select',
			scalar: 'Paid',
			present: true,
		});
	});

	it('reads checkbox boolean state', () => {
		document.body.innerHTML = `<input id="oss" type="checkbox" checked />`;
		const result = readFormFieldValue(
			field({
				key: 'open_source',
				label: 'Open source',
				profilePath: 'profile_data.is_open_source',
				selectorHint: '#oss',
				fillMode: 'boolean',
			})
		);
		expect(result).toEqual({
			kind: 'boolean',
			scalar: 'true',
			present: true,
		});
	});

	describe('coerceTagDisplayItems', () => {
		it('splits Uneed combobox glue into separate tags', () => {
			expect(
				coerceTagDisplayItems([
					'Automation',
					'3D',
					'AI Agents',
					'Automation, 3D, AI AgentsAutomation3DAI Agents',
				])
			).toEqual(['Automation', '3D', 'AI Agents']);
		});

	});

	describe('filterCompositeTagLabels', () => {
		it('removes concatenated wrapper labels', () => {
			expect(
				filterCompositeTagLabels([
					'Web',
					'API',
					'MCP',
					'CLI',
					'WebAPIMCPCLI',
				])
			).toEqual(['Web', 'API', 'MCP', 'CLI']);
		});

		it('keeps distinct multi-word tags', () => {
			expect(
				filterCompositeTagLabels(['AI', 'Social Media & Influencer Tools'])
			).toEqual(['AI', 'Social Media & Influencer Tools']);
		});
	});

	it('reads PeerPush-style pill tags from a labeled field block', () => {
		document.body.innerHTML = `
			<div class="space-y-2">
				<label>Categories</label>
				<p class="hint">Choose up to 3</p>
				<div class="flex flex-wrap gap-2">
					<div class="inline-flex rounded-full bg-black px-2 text-white">
						<span>SaaS</span>
						<button type="button" aria-label="Remove">×</button>
					</div>
					<div class="inline-flex rounded-full bg-black px-2 text-white">
						<span>Marketing</span>
						<button type="button" aria-label="Remove">×</button>
					</div>
					<input id="cat-input" type="text" placeholder="Add more..." />
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'categories',
				label: 'Categories',
				profilePath: 'profile_data.categories',
				selectorHint: '#cat-input',
				fillMode: 'tags',
			})
		);
		expect(result?.kind).toBe('tags');
		expect(result?.present).toBe(true);
		expect(result?.items).toEqual(['SaaS', 'Marketing']);
		expect(result?.items).toHaveLength(2);
	});

	it('reads PeerPush badge lists without a merged wrapper chip', () => {
		document.body.innerHTML = `
			<div class="platforms-field">
				<input id="platforms" name="platforms" type="text" />
				<div class="badge-list flex flex-wrap gap-2">
					<span class="badge inline-flex rounded-full">
						Web
						<button type="button" aria-label="Remove">×</button>
					</span>
					<span class="badge inline-flex rounded-full">
						API
						<button type="button" aria-label="Remove">×</button>
					</span>
					<span class="badge inline-flex rounded-full">
						MCP
						<button type="button" aria-label="Remove">×</button>
					</span>
					<span class="badge inline-flex rounded-full">
						CLI
						<button type="button" aria-label="Remove">×</button>
					</span>
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'platforms',
				label: 'Platforms',
				profilePath: 'profile_data.platforms',
				selectorHint: '#platforms',
				fillMode: 'tags',
			})
		);
		expect(result?.items).toEqual(['Web', 'API', 'MCP', 'CLI']);
	});

	it('reads tag chips from the field container', () => {
		document.body.innerHTML = `
			<div class="tags-field">
				<input id="tags" type="text" value="" />
				<span data-testid="tag-chip">Automation</span>
				<span data-testid="tag-chip">AI</span>
				<div class="inline-flex rounded-full"><span>Newsletter</span><button type="button" aria-label="Remove">×</button></div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				selectorHint: '#tags',
				fillMode: 'tags',
			})
		);
		expect(result?.kind).toBe('tags');
		expect(result?.present).toBe(true);
		expect(result?.items).toEqual(
			expect.arrayContaining(['Automation', 'AI', 'Newsletter'])
		);
	});

	it('falls back to comma-separated input when no chips are present', () => {
		document.body.innerHTML = `<input id="tags" value="devtools, saas" />`;
		const result = readFormFieldValue(
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				selectorHint: '#tags',
				fillMode: 'tags',
			})
		);
		expect(result).toEqual({
			kind: 'tags',
			items: ['devtools', 'saas'],
			present: true,
		});
	});

	it('reads rich HTML from ProseMirror roots', () => {
		document.body.innerHTML = `<div id="desc" class="ProseMirror"><p>Hello</p></div>`;
		const result = readFormFieldValue(
			field({
				key: 'description',
				label: 'Description',
				profilePath: 'description',
				selectorHint: '#desc',
				fillMode: 'rich_html',
			})
		);
		expect(result?.kind).toBe('rich_html');
		expect(result?.present).toBe(true);
		expect(result?.scalar).toContain('<p>Hello</p>');
	});

	it('detects file input attachment', () => {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.id = 'logo';
		document.body.appendChild(fileInput);

		const file = new File(['png'], 'logo.png', { type: 'image/png' });
		Object.defineProperty(fileInput, 'files', {
			configurable: true,
			value: {
				length: 1,
				item: (index: number) => (index === 0 ? file : null),
			},
		});

		const result = readFormFieldValue(
			field({
				key: 'logo',
				label: 'Logo',
				profilePath: 'logo_url',
				selectorHint: '#logo',
				fillMode: 'file',
			})
		);
		expect(result).toEqual({
			kind: 'file',
			present: true,
		});
	});

	it('reads multiple Uneed tag pills when Category sharea the same form card', () => {
		document.body.innerHTML = `
			<section class="product-form">
				<div class="row">
					<label>Category</label>
					<input role="combobox" aria-label="Category" value="Development" />
					<div class="inline-flex rounded-full"><span>Development</span><button type="button">×</button></div>
				</div>
				<div class="row">
					<label>Tags</label>
					<div class="tags-ui">
						<div class="inline-flex rounded-full"><span>Automation</span><button type="button" aria-label="Remove">×</button></div>
						<div class="inline-flex rounded-full"><span>AI</span><button type="button" aria-label="Remove">×</button></div>
						<input role="combobox" aria-label="Tags" value="Automation, AI" />
					</div>
					<p>2/3 tags</p>
				</div>
			</section>`;
		const result = readFormFieldValue(
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				fillMode: 'tags',
				maxItems: 3,
			})
		);
		expect(result?.items).toEqual(['Automation', 'AI']);
	});

	it('does not read Tags from the Category combobox on Uneed-style forms', () => {
		document.body.innerHTML = `
			<div class="form">
				<div class="row">
					<label>Category</label>
					<input role="combobox" aria-autocomplete="list" value="Marketing" />
				</div>
				<div class="row">
					<label>Tags</label>
					<div class="inline-flex rounded-full"><span>Automation</span><button type="button">×</button></div>
					<div class="inline-flex rounded-full"><span>AI</span><button type="button">×</button></div>
					<input role="combobox" aria-autocomplete="list" value="Automation, AI, Newsletter" />
				</div>
			</div>
			<div role="listbox" hidden>
				<div>Developer Tools</div>
				<div>Design Tools</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				fillMode: 'tags',
				maxItems: 3,
			})
		);
		expect(result?.items).toEqual(['Automation', 'AI', 'Newsletter']);
	});

	it('peels two-tag glue on a chip label (3DAutomation3D)', () => {
		document.body.innerHTML = `
			<label>Tags</label>
			<input role="combobox" value="Automation, 3DAutomation3D" />
			<div class="flex flex-wrap gap-2">
				<div class="inline-flex rounded-full px-2">
					<span>Automation</span>
					<button type="button" aria-label="Remove">×</button>
				</div>
				<div class="inline-flex rounded-full px-2">
					<span>3D</span>
					<button type="button" aria-label="Remove">×</button>
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				fillMode: 'tags',
				maxItems: 3,
			})
		);
		expect(result?.items).toEqual(['Automation', '3D']);
	});

	it('prefers pill chips over mashed combobox value (MarketingAutomation3DMarketing)', () => {
		document.body.innerHTML = `
			<div class="space-y-2">
				<label>Tags</label>
				<input
					role="combobox"
					aria-autocomplete="list"
					value="Automation, 3D, MarketingAutomation3DMarketing"
				/>
				<div class="flex flex-wrap gap-2">
					<div class="inline-flex rounded-full px-2">
						<span>Automation</span>
						<button type="button" aria-label="Remove">×</button>
					</div>
					<div class="inline-flex rounded-full px-2">
						<span>3D</span>
						<button type="button" aria-label="Remove">×</button>
					</div>
					<div class="inline-flex rounded-full px-2">
						<span>Marketing</span>
						<button type="button" aria-label="Remove">×</button>
					</div>
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				fillMode: 'tags',
				maxItems: 3,
			})
		);
		expect(result?.items).toEqual(['Automation', '3D', 'Marketing']);
	});

	it('reads Uneed tags when combobox value glues pill labels after the last comma', () => {
		document.body.innerHTML = `
			<div class="space-y-2">
				<label>Tags</label>
				<div class="tags-field">
					<input
						role="combobox"
						aria-autocomplete="list"
						value="Automation, 3D, AI AgentsAutomation3DAI Agents"
					/>
					<div class="flex flex-wrap gap-2">
						<div class="inline-flex rounded-full px-2">
							<span>Automation</span>
							<button type="button" aria-label="Remove">×</button>
						</div>
						<div class="inline-flex rounded-full px-2">
							<span>3D</span>
							<button type="button" aria-label="Remove">×</button>
						</div>
						<div class="inline-flex rounded-full px-2">
							<span>AI Agents</span>
							<button type="button" aria-label="Remove">×</button>
						</div>
					</div>
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				fillMode: 'tags',
				maxItems: 3,
			})
		);
		expect(result?.items).toEqual(['Automation', '3D', 'AI Agents']);
	});

	it('reads Uneed tags without gluing chips with the max-tags helper line', () => {
		document.body.innerHTML = `
			<div class="space-y-2">
				<label>Tags</label>
				<div class="tags-field">
					<input role="combobox" aria-autocomplete="list" value="Automation, 3D, Marketing" />
					<div class="flex flex-wrap gap-2">
						<div class="inline-flex rounded-full px-2">
							<span>Automation</span>
							<button type="button" aria-label="Remove">×</button>
						</div>
						<div class="inline-flex rounded-full px-2">
							<span>3D</span>
							<button type="button" aria-label="Remove">×</button>
						</div>
						<div class="inline-flex rounded-full px-2">
							<span>Marketing</span>
							<button type="button" aria-label="Remove">×</button>
						</div>
					</div>
					<p class="text-xs text-orange-600">3/3 tags — maximum reached</p>
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				fillMode: 'tags',
				maxItems: 3,
			})
		);
		expect(result?.items).toEqual(['Automation', '3D', 'Marketing']);
	});

	it('reads Uneed-style tags when label and combobox sit in sibling blocks', () => {
		document.body.innerHTML = `
			<div class="grid gap-4">
				<div><label>Tags</label><p class="text-muted">3/3 tags</p></div>
				<div class="space-y-2">
					<div class="flex flex-wrap gap-2">
						<div class="inline-flex rounded-full px-2">
							<span>Automation</span>
							<button type="button" aria-label="Remove">×</button>
						</div>
						<div class="inline-flex rounded-full px-2">
							<span>AI</span>
							<button type="button" aria-label="Remove">×</button>
						</div>
						<div class="inline-flex rounded-full px-2">
							<span>Newsletter</span>
							<button type="button" aria-label="Remove">×</button>
						</div>
					</div>
					<input role="combobox" aria-autocomplete="list" value="Automation, AI, Newsletter" />
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				selectorHint: '#missing-tags',
				fillMode: 'tags',
				maxItems: 3,
			})
		);
		expect(result?.kind).toBe('tags');
		expect(result?.present).toBe(true);
		expect(result?.items).toEqual(['Automation', 'AI', 'Newsletter']);
	});

	it('reads Open Launch Radix checkbox selections from sibling row labels', () => {
		document.body.innerHTML = `
			<div class="space-y-2">
				<label data-slot="label" class="text-sm font-medium">Categories *</label>
				<div class="rounded-md border p-4 space-y-3" id="categories-box">
					<div class="flex items-center space-x-2">
						<button type="button" role="checkbox" data-slot="checkbox" aria-checked="true" data-state="checked"></button>
						<label>SaaS</label>
					</div>
					<div class="flex items-center space-x-2">
						<button type="button" role="checkbox" data-slot="checkbox" aria-checked="true" data-state="checked"></button>
						<label>Marketing Tools</label>
					</div>
					<div class="flex items-center space-x-2">
						<button type="button" role="checkbox" data-slot="checkbox" aria-checked="false" data-state="unchecked"></button>
						<label>Developer Tools</label>
					</div>
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'categories',
				label: 'Categories',
				profilePath: 'profile_data.categories',
				fillMode: 'checkbox_group',
				checkboxCatalog: 'open_launch_categories',
			})
		);
		expect(result?.kind).toBe('checkbox_group');
		expect(result?.items).toEqual(['SaaS', 'Marketing Tools']);
	});

	it('resolves Open Launch-style category checkbox lists from a field heading', () => {
		document.body.innerHTML = `
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<label class="text-sm font-medium">
						Categories <span class="text-destructive">*</span>
					</label>
					<p class="text-xs text-muted-foreground">(0/3 selected)</p>
				</div>
				<div class="rounded-md border p-4 space-y-3" id="categories-box">
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" id="cat-apis" />
						<span>APIs & Integrations</span>
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" id="cat-ai" checked />
						<span>Artificial Intelligence</span>
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" id="cat-dev" />
						<span>Cross-Platform Development</span>
					</label>
				</div>
				<p class="text-xs text-muted-foreground">Select up to 3 relevant categories.</p>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'categories',
				label: 'Categories',
				profilePath: 'profile_data.categories',
				fillMode: 'checkbox_group',
			})
		);
		expect(result).not.toBeNull();
		expect(result?.kind).toBe('checkbox_group');
		expect(result?.items).toEqual(['Artificial Intelligence']);
	});

	it('resolves Open Launch-style pricing radios from a field heading', () => {
		document.body.innerHTML = `
			<div class="space-y-2">
				<label class="text-sm font-medium">Pricing model</label>
				<div class="rounded-md border p-4 space-y-3" id="pricing-box">
					<label class="flex items-center gap-2 text-sm">
						<input type="radio" name="pricing" value="free" />
						<span>Free</span>
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input type="radio" name="pricing" value="freemium" checked />
						<span>Freemium</span>
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input type="radio" name="pricing" value="paid" />
						<span>Paid</span>
					</label>
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'pricing_type',
				label: 'Pricing model',
				profilePath: 'profile_data.pricing_type',
				fillMode: 'select',
			})
		);
		expect(result).not.toBeNull();
		expect(result?.kind).toBe('select');
		expect(result?.present).toBe(true);
		expect(result?.scalar).toBe('Freemium');
	});

	it('reads rich description from a labeled TipTap block when selectorHint misses', () => {
		document.body.innerHTML = `
			<div class="field">
				<div><label>Rich description</label></div>
				<div class="tiptap border rounded-md">
					<div class="ProseMirror" contenteditable="true"><p>Directory body copy</p></div>
				</div>
			</div>`;
		const result = readFormFieldValue(
			field({
				key: 'description',
				label: 'Rich description',
				profilePath: 'description',
				selectorHint: '#missing-editor',
				fillMode: 'rich_html',
			})
		);
		expect(result?.kind).toBe('rich_html');
		expect(result?.present).toBe(true);
		expect(result?.scalar).toContain('Directory body copy');
	});

	it('resolves controls by visible label when selectorHint misses', () => {
		document.body.innerHTML = `
			<label for="product-name">Product name</label>
			<input id="product-name" value="OpenQuok" />`;
		const result = readFormFieldValue(
			field({
				key: 'name',
				label: 'Product name',
				profilePath: 'name',
				selectorHint: '#nope',
			})
		);
		expect(result).toEqual({
			kind: 'text',
			scalar: 'OpenQuok',
			present: true,
		});
	});
});
