import { describe, expect, it } from 'vitest';

import {
	detectHumanizeLocale,
	isThaiText,
	thaiCharRatio
} from '$lib/ai-humanize/utils/localeDetect';

describe('detectHumanizeLocale', () => {
	it('routes plain Thai drafts to the th locale', () => {
		expect(detectHumanizeLocale('ในยุคดิจิทัลนี้ ธุรกิจไทยต้องปรับตัวให้เร็ว')).toBe('th');
		expect(isThaiText('ปฏิวัติวงการด้วยเทคโนโลยีล้ำสมัย')).toBe(true);
	});

	it('keeps English drafts on the default en pipeline', () => {
		expect(detectHumanizeLocale('We shipped the fix and it worked.')).toBe('en');
		expect(isThaiText("It's not a setback, it's a setup.")).toBe(false);
	});

	it('treats empty and whitespace-only input as en', () => {
		expect(detectHumanizeLocale('')).toBe('en');
		expect(detectHumanizeLocale('   \n\t ')).toBe('en');
	});

	it('keeps mostly-English text with a stray Thai word on the en pipeline', () => {
		const mixed = 'We shipped the fix — สวัสดี — then waited for CI.';
		expect(thaiCharRatio(mixed)).toBeLessThanOrEqual(0.2);
		expect(detectHumanizeLocale(mixed)).toBe('en');
	});

	it('routes Thai-heavy drafts that mix English brand names to th', () => {
		const mixed =
			'ทีมเราใช้ SaaS แบบ B2B เพื่อยกระดับธุรกิจไทยให้เติบโตอย่างยั่งยืนในตลาดดิจิทัลยุคใหม่';
		expect(thaiCharRatio(mixed)).toBeGreaterThan(0.2);
		expect(detectHumanizeLocale(mixed)).toBe('th');
	});

	it('measures the ratio against non-whitespace characters only', () => {
		const spaced = 'กู ฮืด จิ กะ จุ๊ะ';
		expect(thaiCharRatio(spaced)).toBe(1);
		expect(thaiCharRatio('')).toBe(0);
	});
});
