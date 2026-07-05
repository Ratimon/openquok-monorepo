import { describe, expect, it } from 'vitest';

import {
	resolveStackLicense,
	resolveStackListingHeaderSummary,
	resolveStackSkillName,
	resolveStackVersion,
	stackListingExcerptFromSummary
} from './resolveStackListingHeaderSummary';

const sampleSkillMarkdown = `---
name: my-first-skill
description: Schedule and manage social posts with the openquok CLI.
version: 1.0.0
license: MIT
---

# My First Skill

## Overview

Describe what this skill helps with.

Built with extensions: \`openquok-core\`.
`;

describe('resolveStackListingHeaderSummary', () => {
	it('prefers excerpt over description and content', () => {
		expect(
			resolveStackListingHeaderSummary({
				excerpt: 'Short excerpt',
				description: 'Long description',
				content: sampleSkillMarkdown
			})
		).toBe('Short excerpt');
	});

	it('falls back to SKILL frontmatter description when excerpt is empty', () => {
		expect(
			resolveStackListingHeaderSummary({
				excerpt: '',
				description: '',
				content: sampleSkillMarkdown
			})
		).toBe('Schedule and manage social posts with the openquok CLI.');
	});

	it('falls back to overview section when frontmatter description is missing', () => {
		const markdown = sampleSkillMarkdown.replace(
			'description: Schedule and manage social posts with the openquok CLI.\n',
			''
		);
		expect(
			resolveStackListingHeaderSummary({
				excerpt: null,
				description: null,
				content: markdown
			})
		).toBe('Describe what this skill helps with. Built with extensions: openquok-core.');
	});
});

describe('stackListingExcerptFromSummary', () => {
	it('truncates long summaries to 160 characters', () => {
		const long = 'a'.repeat(200);
		expect(stackListingExcerptFromSummary(long)).toHaveLength(160);
		expect(stackListingExcerptFromSummary(long).endsWith('…')).toBe(true);
	});
});

describe('resolveStackSkillName', () => {
	it('prefers stored skill_name over frontmatter and slug', () => {
		expect(
			resolveStackSkillName({
				skillName: 'stored-name',
				slug: 'listing-slug',
				content: sampleSkillMarkdown
			})
		).toBe('stored-name');
	});

	it('falls back to SKILL frontmatter name', () => {
		expect(
			resolveStackSkillName({
				skillName: '',
				slug: 'listing-slug',
				content: sampleSkillMarkdown
			})
		).toBe('my-first-skill');
	});
});

describe('resolveStackVersion', () => {
	it('falls back to SKILL frontmatter version', () => {
		expect(resolveStackVersion({ version: '', content: sampleSkillMarkdown })).toBe('1.0.0');
	});

	it('defaults to the skill builder version when a skill identity exists', () => {
		expect(
			resolveStackVersion({
				version: '',
				slug: 'viral-tiktok-carousel',
				content: '## Overview\n\nNo frontmatter here.'
			})
		).toBe('1.0.0');
	});
});

describe('resolveStackLicense', () => {
	it('falls back to SKILL frontmatter license', () => {
		expect(resolveStackLicense({ license: '', content: sampleSkillMarkdown })).toBe('MIT');
	});
});
