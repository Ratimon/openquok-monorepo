import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG,
	type AutoLaunchProfileSnapshot,
} from 'openquok-common';

import { mountAlternativetoManageItemForm } from '../alternativetoManageItemFixture.js';
import { fillLaunchField } from '../fillEngine.js';
import {
	findAlternativetoUrlInputByCaption,
	resolveAlternativetoIconFileInput,
	resolveAlternativetoScreenshotFileInput,
} from './alternativetoUploads.js';

vi.mock('../../shared/dashboardApiOrigin.js', () => ({
	resolveApiOriginForDashboard: vi.fn(async (origin: string) => origin),
}));

vi.mock('../profileMediaFetch.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../profileMediaFetch.js')>();
	return {
		...actual,
		fetchProfileMediaFile: vi.fn(async () => new File(['pixels'], 'add-page.png', { type: 'image/png' })),
	};
});

describe('AlternativeTo manage-item media uploads', () => {
	beforeEach(() => {
		mountAlternativetoManageItemForm();
		Object.defineProperty(globalThis, 'location', {
			value: {
				hostname: 'alternativeto.net',
				pathname: '/manage-item/',
			},
			configurable: true,
		});
	});

	afterEach(() => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	});

	it('resolves distinct icon and screenshot file inputs', () => {
		const icon = resolveAlternativetoIconFileInput();
		const shots = resolveAlternativetoScreenshotFileInput();
		expect(icon?.name).toBe('applicationIcon');
		expect(shots?.name).toBe('screenshots');
		expect(icon).not.toBe(shots);
	});

	it('finds URL inputs beside the live captions', () => {
		expect(findAlternativetoUrlInputByCaption('upload icon by url')?.name).toBe('iconRemoteUrl');
		expect(findAlternativetoUrlInputByCaption('upload screenshot by url')?.name).toBe(
			'screenshotRemoteUrl'
		);
	});

	it('scopes screenshot URL input after the Screenshots subheading (icon URL is above it)', () => {
		const icon = findAlternativetoUrlInputByCaption('upload icon by url');
		const shot = findAlternativetoUrlInputByCaption('upload screenshot by url');
		expect(icon).not.toBe(shot);
		const heading = document.querySelector('h3');
		expect(heading?.textContent?.trim()).toBe('Screenshots');
		expect(
			heading?.compareDocumentPosition(icon!) & Node.DOCUMENT_POSITION_PRECEDING
		).toBeTruthy();
		expect(
			heading?.compareDocumentPosition(shot!) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it('does not paste the icon URL into Upload screenshot by URL', async () => {
		const galleryField = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps
			.find((s) => s.id === 'media')
			?.fields.find((f) => f.key === 'gallery');
		expect(galleryField).toBeDefined();

		const snapshot: AutoLaunchProfileSnapshot = {
			name: 'Demo',
			tagline: null,
			description: null,
			website_url: null,
			logo_url: 'https://cdn.example.com/icon.png',
			profile_data: { gallery_urls: ['https://cdn.example.com/icon.png'] },
			integration_customer_id: null,
		};

		const result = await fillLaunchField(snapshot, galleryField!, {
			dashboardOrigin: 'https://app.example.com',
		});
		expect(result.status).toBe('not_in_profile');
		const shotUrl = findAlternativetoUrlInputByCaption('upload screenshot by url');
		expect(shotUrl?.value).toBe('');
	});

	it('fills the application icon via Upload icon by URL', async () => {
		const logoField = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps
			.find((s) => s.id === 'media')
			?.fields.find((f) => f.key === 'logo');
		expect(logoField).toBeDefined();

		const snapshot: AutoLaunchProfileSnapshot = {
			name: 'Demo',
			tagline: null,
			description: null,
			website_url: null,
			logo_url: 'https://cdn.example.com/icon.png',
			profile_data: {},
			integration_customer_id: null,
		};

		const result = await fillLaunchField(snapshot, logoField!, {
			dashboardOrigin: 'https://app.example.com',
		});
		expect(result.status).toBe('found');
		const iconUrl = findAlternativetoUrlInputByCaption('upload icon by url');
		expect(iconUrl?.value).toBe('https://cdn.example.com/icon.png');
	});

	it('uploads main gallery screenshots by URL when the variant only carried logo URLs', async () => {
		const galleryField = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps
			.find((s) => s.id === 'media')
			?.fields.find((f) => f.key === 'gallery');
		expect(galleryField).toBeDefined();

		const variant: AutoLaunchProfileSnapshot = {
			name: 'Demo',
			tagline: null,
			description: null,
			website_url: null,
			logo_url: 'https://cdn.example.com/icon.png',
			profile_data: {
				gallery_urls: [
					'https://cdn.example.com/icon.png',
					'https://cdn.example.com/icon.png',
				],
			},
			integration_customer_id: null,
		};
		const main: AutoLaunchProfileSnapshot = {
			...variant,
			profile_data: {
				gallery_urls: [
					'https://cdn.example.com/icon.png',
					'https://cdn.example.com/screen-a.png',
					'https://cdn.example.com/screen-b.png',
				],
			},
		};

		const result = await fillLaunchField(variant, galleryField!, {
			dashboardOrigin: 'https://app.example.com',
			mainProfileSnapshot: main,
		});
		expect(result.status).toBe('found');
		const shotUrl = findAlternativetoUrlInputByCaption('upload screenshot by url');
		expect(shotUrl?.value).toBe('https://cdn.example.com/screen-b.png');
	});

	it('attaches storage-key gallery screenshots via the file input', async () => {
		const galleryField = ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG.steps
			.find((s) => s.id === 'media')
			?.fields.find((f) => f.key === 'gallery');
		expect(galleryField).toBeDefined();

		const snapshot: AutoLaunchProfileSnapshot = {
			name: 'Demo',
			tagline: null,
			description: null,
			website_url: null,
			logo_url: 'org/profile/favicon-512.png',
			profile_data: {
				gallery_urls: ['org/profile/add-page.png'],
				gallery_labels: ['add-page.png'],
			},
			integration_customer_id: null,
		};

		const fileInput = resolveAlternativetoScreenshotFileInput();
		expect(fileInput).not.toBeNull();

		const result = await fillLaunchField(snapshot, galleryField!, {
			dashboardOrigin: 'https://app.openquok.com',
		});
		expect(result.status).toBe('found');
		expect(fileInput?.files?.length).toBeGreaterThan(0);
		expect(fileInput?.files?.item(0)?.name).toContain('add-page');
	});
});