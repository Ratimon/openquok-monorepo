import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
	dedupeDocsImagesFromRaw,
	extractDocsImagesFromRaw
} from '$lib/docs/utils/content/extractDocsImagesFromRaw';

const quickstartFixture = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), '../../../../content/docs/getting-started/quickstart.md'),
	'utf8'
);

describe('extractDocsImagesFromRaw', () => {
	it('parses markdown image syntax with alt text and root-relative paths', () => {
		const images = extractDocsImagesFromRaw(quickstartFixture);
		expect(images.length).toBeGreaterThanOrEqual(8);
		expect(images[0]).toMatchObject({
			alt: 'Workspace in Dashboard',
			src: '/docs/_assets/getting-started/1-workspace-dashboard.webp',
			index: 0
		});
		expect(images.find((image) => image.alt === 'Step 5 - Kanban Board')).toMatchObject({
			src: '/docs/_assets/getting-started/5-kanban-board.webp'
		});
	});

	it('dedupes repeated image paths while preserving first alt text', () => {
		const images = dedupeDocsImagesFromRaw(extractDocsImagesFromRaw(quickstartFixture));
		const workspaceImages = images.filter((image) =>
			image.src.endsWith('1-workspace-dashboard.webp')
		);
		expect(workspaceImages).toHaveLength(1);
		expect(workspaceImages[0]?.alt).toBe('Workspace in Dashboard');
	});
});
