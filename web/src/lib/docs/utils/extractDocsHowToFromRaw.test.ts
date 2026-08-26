import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { extractDocsHowToBlocksFromRaw } from '$lib/docs/utils/extractDocsHowToFromRaw';

const oauthServerFixture = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), '../../../content/docs/admin/oauth-server.md'),
	'utf8'
);

describe('extractDocsHowToBlocksFromRaw', () => {
	it('parses explicit howTo props and step headings', () => {
		const raw = `
## Create an OAuth app (dashboard)

<Steps howToName="Create an OAuth app" howToDescription="Register a third-party OAuth application.">

### Open developer settings

In the OpenQuok web app, go to:

- <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" />

### Create the app

Click <Badge text="Create OAuth app" variant="new" /> and fill the form.

</Steps>
`;

		const blocks = extractDocsHowToBlocksFromRaw(raw);
		expect(blocks).toHaveLength(1);
		expect(blocks[0]).toMatchObject({
			name: 'Create an OAuth app',
			description: 'Register a third-party OAuth application.'
		});
		expect(blocks[0]!.steps).toHaveLength(2);
		expect(blocks[0]!.steps[0]!.name).toBe('Open developer settings');
		expect(blocks[0]!.steps[0]!.text).toContain('Account');
		expect(blocks[0]!.steps[0]!.text).toContain('Settings');
		expect(blocks[0]!.steps[1]!.name).toBe('Create the app');
		expect(blocks[0]!.steps[1]!.text).toContain('Create OAuth app');
	});

	it('falls back to the preceding ## heading when howToName is omitted', () => {
		const raw = `
## Backend on Vercel

<Steps>

### Create a new Vercel project

and connect this repository.

</Steps>
`;

		const blocks = extractDocsHowToBlocksFromRaw(raw);
		expect(blocks).toHaveLength(1);
		expect(blocks[0]!.name).toBe('Backend on Vercel');
		expect(blocks[0]!.steps[0]!.name).toBe('Create a new Vercel project');
	});

	it('falls back to page frontmatter description when howToDescription is omitted', () => {
		const raw = `---
title: Connect Cursor
description: Connect OpenQuok MCP to Cursor for Agent and Composer tools.
---

## Setup

<Steps>

### Generate your token

Create a programmatic token in the dashboard.

</Steps>
`;

		const blocks = extractDocsHowToBlocksFromRaw(raw);
		expect(blocks).toHaveLength(1);
		expect(blocks[0]!.name).toBe('Setup');
		expect(blocks[0]!.description).toBe(
			'Connect OpenQuok MCP to Cursor for Agent and Composer tools.'
		);
	});

	it('falls back to page title when no preceding ## heading exists', () => {
		const raw = `---
title: Quickstart
description: OpenQuok zero to hero — five steps from a new workspace to a queued post.
---

<Steps>

### Choose Cloud or Self-host options

Pick hosted or self-hosted.

</Steps>
`;

		const blocks = extractDocsHowToBlocksFromRaw(raw);
		expect(blocks[0]!.name).toBe('Quickstart');
	});

	it('extracts HowTo from oauth-server.md', () => {
		const blocks = extractDocsHowToBlocksFromRaw(oauthServerFixture);
		expect(blocks.length).toBeGreaterThanOrEqual(1);
		expect(blocks[0]!.steps.length).toBeGreaterThanOrEqual(2);
	});
});
