import { describe, expect, it } from 'vitest';

import { CONFIG_SCHEMA_PUBLIC_FAQ } from '$lib/config/constants/config';
import { PUBLIC_FAQ_ITEMS } from '$lib/content/constants/publicFaqConfig';

import { buildModuleConfigCodeDefaultsVm } from '$lib/config/utils/buildModuleConfigCodeDefaultsVm';

describe('buildModuleConfigCodeDefaultsVm', () => {
	it('maps Public FAQ schema defaults from publicFaqConfig.ts', () => {
		const vm = buildModuleConfigCodeDefaultsVm(CONFIG_SCHEMA_PUBLIC_FAQ);

		expect(vm.SUBTITLE).toBe('FAQs');
		expect(vm.TITLE).toBe('Frequently asked, questions');
		expect(Array.isArray(vm.ITEMS)).toBe(true);
		expect((vm.ITEMS as { question: string }[]).length).toBe(PUBLIC_FAQ_ITEMS.length);
		expect((vm.ITEMS as { question: string }[])[2]?.question).toBe(
			'How do I schedule social media posts with OpenQuok?'
		);
		expect(
			String((vm.ITEMS as { answer: string }[])[2]?.answer)
		).toContain('href="/agents/grok-bot"');
	});
});
