import { describe, expect, it } from 'vitest';

import { PUBLIC_BUILDING_BLOCKS_HUB } from '$lib/listings/constants/publicListingsHubConfig';

import {
	formatPublicCreatorListingHeroTitle,
	formatPublicCreatorListingMetaDescription,
	formatPublicCreatorListingMetaTitleBase,
	formatPublicCreatorListingSeoKeywords
} from './formatPublicCreatorListingSeoCopy';

describe('formatPublicCreatorListingMetaTitleBase', () => {
	it('suffixes building blocks by extension type', () => {
		expect(
			formatPublicCreatorListingMetaTitleBase('OpenQuok Core', 'building-block', 'both')
		).toBe('OpenQuok Core — Social Media Scheduling MCP & Skill');
		expect(formatPublicCreatorListingMetaTitleBase('Bloom', 'building-block', 'mcp')).toBe(
			'Bloom — Social Media Scheduling MCP Server'
		);
		expect(formatPublicCreatorListingMetaTitleBase('My Skill', 'building-block', 'skills')).toBe(
			'My Skill — Social Media Scheduling Skill'
		);
	});

	it('suffixes playbooks with scheduling playbook label', () => {
		expect(formatPublicCreatorListingMetaTitleBase('Viral Threads', 'playbook')).toBe(
			'Viral Threads — Social Media Scheduling Playbook'
		);
	});
});

describe('formatPublicCreatorListingHeroTitle', () => {
	it('uses middle-dot long-tail pattern for building blocks', () => {
		expect(formatPublicCreatorListingHeroTitle('OpenQuok Core', 'building-block')).toBe(
			'OpenQuok Core · Schedule social media posts'
		);
	});

	it('uses playbook long-tail pattern', () => {
		expect(formatPublicCreatorListingHeroTitle('Viral Threads', 'playbook')).toBe(
			'Viral Threads · Social media scheduling playbook'
		);
	});
});

describe('formatPublicCreatorListingMetaDescription', () => {
	it('prefers excerpt and appends schedule and approve sentence', () => {
		const description = formatPublicCreatorListingMetaDescription(
			{
				title: 'OpenQuok Core',
				excerpt: 'Official skills and MCP for OpenQuok scheduling.'
			},
			'building-block'
		);

		expect(description).toContain('Official skills and MCP for OpenQuok scheduling.');
		expect(description).toContain('you approve before publish');
	});
});

describe('formatPublicCreatorListingSeoKeywords', () => {
	it('merges hub keyword slice with listing title without duplicates', () => {
		const keywords = formatPublicCreatorListingSeoKeywords(
			{ title: 'OpenQuok Core' },
			'building-block'
		);

		expect(keywords[0]).toBe(PUBLIC_BUILDING_BLOCKS_HUB.seoKeywords[0]);
		expect(keywords).toContain('OpenQuok Core');
		expect(keywords).toContain('OpenQuok Core social media scheduling');
		expect(new Set(keywords.map((k) => k.toLowerCase())).size).toBe(keywords.length);
	});
});
