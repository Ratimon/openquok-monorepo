import type {
	AutoLaunchProfileSnapshot,
	LaunchStepField,
} from '../browser-extension/pageAssist.js';
import {
	compareFieldRow,
	formatOnPageMediaDisplayForField,
	mediaFileDisplayName,
	normalizeForCompare,
	normalizeProfileValue,
	resolveGalleryDisplayNames,
	resolveLaunchFieldFillMode,
	resolveLogoDisplayName,
} from './fieldCompare.js';

function snapshot(
	overrides: Partial<AutoLaunchProfileSnapshot> = {}
): AutoLaunchProfileSnapshot {
	return {
		name: 'Acme',
		tagline: 'Ship faster',
		description: 'Product description',
		website_url: 'https://acme.test',
		logo_url: null,
		profile_data: {},
		integration_customer_id: null,
		...overrides,
	};
}

describe('mediaFileDisplayName', () => {
	it('returns the basename for storage paths and URLs', () => {
		expect(mediaFileDisplayName('org/abc/logo.webp')).toBe('logo.webp');
		expect(mediaFileDisplayName('https://cdn.example.com/media/shot-1.png?v=1')).toBe('shot-1.png');
	});
});

describe('resolveLogoDisplayName', () => {
	it('prefers logo_label over storage basename', () => {
		expect(
			resolveLogoDisplayName(
				snapshot({
					logo_url: 'org/profile/0.6739.png',
					profile_data: { logo_label: 'App icon' },
				})
			)
		).toBe('App icon');
	});

	it('falls back to basename then Logo', () => {
		expect(
			resolveLogoDisplayName(
				snapshot({
					logo_url: 'org/profile/brand.webp',
					profile_data: {},
				})
			)
		).toBe('brand.webp');
		expect(resolveLogoDisplayName(snapshot({ logo_url: '  ', profile_data: { logo_label: 'X' } }))).toBe(
			'X'
		);
	});
});

describe('resolveGalleryDisplayNames', () => {
	it('uses gallery_labels when present and falls back per slot', () => {
		expect(
			resolveGalleryDisplayNames(
				snapshot({
					profile_data: {
						gallery_urls: ['org/0.12.png', 'org/hero.png'],
						gallery_labels: ['Dashboard', ''],
					},
				})
			)
		).toEqual(['Dashboard', 'hero.png']);
	});

	it('uses Screenshot n for legacy random keys and human basenames otherwise', () => {
		expect(
			resolveGalleryDisplayNames(
				snapshot({
					profile_data: {
						gallery_urls: ['org/0.6739143119534297.png', 'org/dashboard.png'],
					},
				})
			)
		).toEqual(['Screenshot 1', 'dashboard.png']);
	});
});

describe('formatOnPageMediaDisplayForField', () => {
	const galleryField: LaunchStepField = {
		key: 'gallery',
		label: 'Tool screenshots',
		profilePath: 'profile_data.gallery_urls',
		fillMode: 'files',
	};

	it('maps legacy random on-page filenames to Screenshot n', () => {
		expect(
			formatOnPageMediaDisplayForField(
				galleryField,
				['0.6739143119534297.png', 'hero-shot.png'],
				true
			)
		).toBe('Screenshot 1, hero-shot.png');
	});
});

describe('resolveLaunchFieldFillMode', () => {
	it('infers logo and gallery modes when extension_config omits fillMode', () => {
		expect(
			resolveLaunchFieldFillMode({
				key: 'logo',
				label: 'Logo',
				profilePath: 'logo_url',
			})
		).toBe('file');
		expect(
			resolveLaunchFieldFillMode({
				key: 'gallery',
				label: 'Gallery images',
				profilePath: 'profile_data.gallery_urls',
			})
		).toBe('files');
	});
});

describe('normalizeProfileValue', () => {
	it('reads gallery_urls when fillMode is omitted on the field config', () => {
		const field: LaunchStepField = {
			key: 'gallery',
			label: 'Gallery images',
			profilePath: 'profile_data.gallery_urls',
		};
		const profile = snapshot({
			profile_data: {
				gallery_urls: ['org/shot-a.png', 'org/shot-b.png'],
				gallery_labels: ['Screenshot 1', 'install-extension.png'],
			},
		});
		expect(normalizeProfileValue(profile, field)).toEqual({
			kind: 'files',
			items: ['org/shot-a.png', 'org/shot-b.png'],
			present: true,
		});
	});

	it('reads discovery categories for Open Launch checkbox groups', () => {
		const field: LaunchStepField = {
			key: 'categories',
			label: 'Categories',
			profilePath: 'profile_data.categories',
			fillMode: 'checkbox_group',
			maxItems: 3,
		};
		const profile = snapshot({
			profile_data: {
				category: 'SaaS',
				categories: ['Marketing', 'Developer Tools'],
			},
		});
		expect(normalizeProfileValue(profile, field)).toEqual({
			kind: 'checkbox_group',
			items: ['Marketing', 'Developer Tools'],
			present: true,
		});
	});

	it('derives tags from discovery dimensions when profile tags are unset', () => {
		const field: LaunchStepField = {
			key: 'tags',
			label: 'Tags',
			profilePath: 'profile_data.tags',
			fillMode: 'tags',
		};
		const profile = snapshot({
			profile_data: {
				use_cases: ['Automation'],
				platforms: ['Web'],
				tech_stack: ['AI'],
			},
		});
		expect(normalizeProfileValue(profile, field)).toEqual({
			kind: 'tags',
			items: ['Automation', 'Web', 'AI'],
			present: true,
		});
	});
});

describe('normalizeForCompare', () => {
	it('compares tag sets case-insensitively regardless of order', () => {
		const a = { kind: 'tags' as const, items: ['AI', 'Automation', 'Newsletter'], present: true };
		const b = { kind: 'tags' as const, items: ['newsletter', 'automation', 'ai'], present: true };
		expect(normalizeForCompare(a, b, 'tags')).toBe(true);
	});

	it('detects tag set diff', () => {
		const a = { kind: 'tags' as const, items: ['AI', 'Automation'], present: true };
		const b = { kind: 'tags' as const, items: ['AI', 'Newsletter'], present: true };
		expect(normalizeForCompare(a, b, 'tags')).toBe(false);
	});

	it('compares select values case-insensitively', () => {
		const a = { kind: 'select' as const, scalar: 'freemium', present: true };
		const b = { kind: 'select' as const, scalar: 'Freemium', present: true };
		expect(normalizeForCompare(a, b, 'select')).toBe(true);
	});

	it('trims and collapses whitespace for text fields', () => {
		const a = { kind: 'text' as const, scalar: '  Hello   world  ', present: true };
		const b = { kind: 'text' as const, scalar: 'Hello world', present: true };
		expect(normalizeForCompare(a, b, 'text')).toBe(true);
	});

	it('strips HTML for rich_html compare', () => {
		const a = {
			kind: 'rich_html' as const,
			scalar: '<p>Line <strong>one</strong></p><p>Line two</p>',
			present: true,
		};
		const b = { kind: 'rich_html' as const, scalar: 'Line one\nLine two', present: true };
		expect(normalizeForCompare(a, b, 'rich_html')).toBe(true);
	});

	it('treats both absent sides as equal', () => {
		const a = { kind: 'text' as const, present: false };
		const b = { kind: 'text' as const, present: false };
		expect(normalizeForCompare(a, b, 'text')).toBe(true);
	});
});

describe('compareFieldRow', () => {
	const nameField: LaunchStepField = {
		key: 'name',
		label: 'Name',
		profilePath: 'name',
		required: true,
	};

	it('shows required warning when form is empty and field is required', () => {
		const profileNorm = normalizeProfileValue(snapshot(), nameField);
		const formNorm = { kind: 'text' as const, present: false };
		const row = compareFieldRow('name', profileNorm, formNorm, { required: true });
		expect(row.syncStatus).toBe('form_empty');
		expect(row.showRequiredWarning).toBe(true);
		expect(row.showDiffWarning).toBe(false);
	});

	it('marks in-sync rows as match', () => {
		const profileNorm = normalizeProfileValue(snapshot(), nameField);
		const formNorm = { kind: 'text' as const, scalar: 'Acme', present: true };
		const row = compareFieldRow('name', profileNorm, formNorm, { required: true });
		expect(row.syncStatus).toBe('match');
		expect(row.showRequiredWarning).toBe(false);
		expect(row.showDiffWarning).toBe(false);
	});

	it('flags diff when on-page tags differ from profile', () => {
		const tagsField: LaunchStepField = {
			key: 'tags',
			label: 'Tags',
			profilePath: 'profile_data.tags',
			fillMode: 'tags',
			required: true,
			maxItems: 3,
		};
		const profileNorm = normalizeProfileValue(
			snapshot({
				profile_data: { tags: ['Automation', 'AI', 'Newsletter'] },
			}),
			tagsField
		);
		const formNorm = {
			kind: 'tags' as const,
			items: ['Automation', 'AI', 'SaaS'],
			present: true,
		};
		const row = compareFieldRow('tags', profileNorm, formNorm, { required: true });
		expect(row.syncStatus).toBe('diff');
		expect(row.showDiffWarning).toBe(true);
		expect(row.showRequiredWarning).toBe(false);
	});

	it('reports both_empty when neither side has content', () => {
		const formNorm = { kind: 'text' as const, present: false };
		const profileNorm = { kind: 'text' as const, present: false };
		const row = compareFieldRow('tagline', profileNorm, formNorm);
		expect(row.syncStatus).toBe('both_empty');
		expect(row.showRequiredWarning).toBe(false);
	});
});
