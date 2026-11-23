import {
	isLegacyRandomAutoLaunchMediaBasename,
	resolveUniqueAutoLaunchProfileMediaFileName,
	sanitizeAutoLaunchProfileMediaFileName,
} from './profileMediaFileName.js';

describe('isLegacyRandomAutoLaunchMediaBasename', () => {
	it('detects Math.random() object keys', () => {
		expect(isLegacyRandomAutoLaunchMediaBasename('0.6739143119534297.png')).toBe(true);
	});

	it('allows human filenames', () => {
		expect(isLegacyRandomAutoLaunchMediaBasename('favicon-512.png')).toBe(false);
		expect(isLegacyRandomAutoLaunchMediaBasename('My Screenshot.png')).toBe(false);
	});
});

describe('sanitizeAutoLaunchProfileMediaFileName', () => {
	it('keeps a safe basename and normalizes the extension', () => {
		expect(sanitizeAutoLaunchProfileMediaFileName('My Screenshot.png')).toBe('My Screenshot.png');
		expect(sanitizeAutoLaunchProfileMediaFileName('logo.WEBP')).toBe('logo.webp');
	});

	it('replaces unsafe path characters in the basename', () => {
		expect(sanitizeAutoLaunchProfileMediaFileName('bad/name?*.png')).toBe('bad-name--.png');
	});

	it('falls back when the name is empty', () => {
		expect(sanitizeAutoLaunchProfileMediaFileName('   ')).toBe('file.bin');
	});
});

describe('resolveUniqueAutoLaunchProfileMediaFileName', () => {
	it('returns the sanitized name when unused', () => {
		expect(
			resolveUniqueAutoLaunchProfileMediaFileName('shot.png', ['other.png'])
		).toBe('shot.png');
	});

	it('appends -2, -3 before the extension on collision', () => {
		const existing = ['hero.png', 'hero-2.png'];
		expect(resolveUniqueAutoLaunchProfileMediaFileName('hero.png', existing)).toBe(
			'hero-3.png'
		);
	});
});