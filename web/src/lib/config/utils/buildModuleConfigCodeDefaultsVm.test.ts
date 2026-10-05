import { describe, expect, it } from 'vitest';

import { CONFIG_SCHEMA_MARKETING, CONFIG_SCHEMA_PUBLIC_FAQ } from '$lib/config/constants/config';
import { PUBLIC_FAQ_ITEMS } from '$lib/content/constants/faq';
import { publicFaqHref } from '$lib/content/utils/publicFaqLinks';

import { buildModuleConfigCodeDefaultsVm } from '$lib/config/utils/buildModuleConfigCodeDefaultsVm';

describe('buildModuleConfigCodeDefaultsVm', () => {
	it('maps Public FAQ schema defaults from faq/index.ts', () => {
		const vm = buildModuleConfigCodeDefaultsVm(CONFIG_SCHEMA_PUBLIC_FAQ);

		expect(vm.SUBTITLE).toBe('FAQs');
		expect(vm.TITLE).toBe('Frequently asked, questions');
		expect(Array.isArray(vm.ITEMS)).toBe(true);
		expect((vm.ITEMS as { question: string }[]).length).toBe(PUBLIC_FAQ_ITEMS.length);
		expect((vm.ITEMS as { question: string }[])[3]?.question).toBe(
			'How do I schedule social media posts with OpenQuok?'
		);
		expect((vm.ITEMS as { question: string }[])[4]?.question).toBe(
			'How do I manage social media with OpenQuok?'
		);

		const scheduleAnswer = String((vm.ITEMS as { answer: string }[])[3]?.answer);
		expect(scheduleAnswer).toContain(`href="${publicFaqHref.cliGettingStarted}"`);
		expect(scheduleAnswer).toContain(`href="${publicFaqHref.agentSetupGuides}"`);
		expect(scheduleAnswer).toContain(`href="${publicFaqHref.mcpSetupGuides}"`);
	});

	it('maps Marketing schema string defaults from config.ts', () => {
		const vm = buildModuleConfigCodeDefaultsVm(CONFIG_SCHEMA_MARKETING);

		expect(vm.SOCIAL_LINKS_X).toBe('https://x.com/openquok');
		expect(vm.SOCIAL_LINKS_DISCORD).toBe('https://discord.gg/wXgWcYzU4');
		expect(vm.SOCIAL_LINKS_YOUTUBE).toBe('');
	});
});
