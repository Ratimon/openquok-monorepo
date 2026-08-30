import { describe, expect, it } from 'vitest';

import { applyLocalHumanizeRewrite } from '$lib/ai-humanize/utils/localRewrite';

describe('applyLocalHumanizeRewrite — Thai (th)', () => {
	it('replaces em dashes with a comma when Thai text cannot use the case heuristic', () => {
		expect(applyLocalHumanizeRewrite('ยอดขายโตขึ้น — เพราะทีมขยันกันจริง', 'human')).toBe(
			'ยอดขายโตขึ้น, เพราะทีมขยันกันจริง'
		);
	});

	it('drops the stock opener and swaps the tier-1 verb in a stock AI-Thai opener', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'ในยุคดิจิทัล ธุรกิจไทยต้องปฏิวัติวงการเพื่ออยู่รอด',
			'human'
		);
		expect(rewritten).not.toContain('ในยุคดิจิทัล');
		expect(rewritten).not.toContain('ปฏิวัติ');
		expect(rewritten).toContain('ธุรกิจไทยต้องเปลี่ยนวงการเพื่ออยู่รอด');
	});

	it('applies the Thai swap table as plain substring replacement', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'บริษัทนี้ทำหน้าที่เป็นที่ปรึกษา อย่างไรก็ดี ค่าบริการแพง',
			'human'
		);
		expect(rewritten).not.toContain('ทำหน้าที่เป็น');
		expect(rewritten).not.toContain('อย่างไรก็ดี');
		expect(rewritten).toContain('เป็นที่ปรึกษา');
		expect(rewritten).toContain('แต่');
	});

	it('swaps tier-1 lexicon terms without word-boundary guards', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'เราใช้กลยุทธ์ที่แข็งแกร่งเพื่อเจาะลึกตลาดกลุ่มนี้',
			'human'
		);
		expect(rewritten).not.toContain('แข็งแกร่ง');
		expect(rewritten).not.toContain('เจาะลึก');
		expect(rewritten).toContain('ที่ทนทาน');
		expect(rewritten).toContain('เพื่อดูรายละเอียดตลาด');
	});

	it('flattens the Thai negative parallelism into a plain statement', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'แอปนี้ไม่ใช่แค่เครื่องมือ แต่คือพันธมิตรของทีม',
			'human'
		);
		expect(rewritten).toBe('แอปนี้คือพันธมิตรของทีม');
	});

	it('deletes the conclusion signpost without inventing a new closer', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'โดยสรุป ทีมเราส่งของได้จริงทุกสปรินต์',
			'human'
		);
		expect(rewritten).not.toContain('โดยสรุป');
		expect(rewritten).toBe('ทีมเราส่งของได้จริงทุกสปรินต์');
	});

	it('strips the prompt echo and fractal summary openers', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'ในบทความนี้เราจะพูดถึงการตลาดไทย\nในส่วนนี้เราจะดูกลยุทธ์ราคา',
			'human'
		);
		expect(rewritten).not.toContain('ในบทความนี้เราจะพูดถึง');
		expect(rewritten).not.toContain('ในส่วนนี้เราจะ');
		expect(rewritten).toContain('การตลาดไทย');
		expect(rewritten).toContain('ดูกลยุทธ์ราคา');
	});

	it('drops the pep-talk ending sentence and keeps the real point', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'ทีมเราส่งของได้จริง. อนาคตเป็นของคุณ!',
			'human'
		);
		expect(rewritten).not.toContain('อนาคตเป็นของคุณ');
		expect(rewritten).toContain('ทีมเราส่งของได้จริง.');
	});

	it('strips just the rally cry when the draft is a single sentence', () => {
		const rewritten = applyLocalHumanizeRewrite('ทีมเราทำงานหนัก ไปกันเถอะ!', 'human');
		expect(rewritten).not.toContain('ไปกันเถอะ');
		expect(rewritten).toContain('ทีมเราทำงานหนัก');
	});

	it('strips Thai smoking guns from the chat window', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'ในฐานะ AI ผมแนะนำให้โพสต์แบบนี้ [แทรกตัวอย่าง]\nหวังว่าจะเป็นประโยชน์ ขอแสดงความนับถือ',
			'human'
		);
		expect(rewritten).not.toContain('ในฐานะ AI');
		expect(rewritten).not.toContain('[แทรกตัวอย่าง]');
		expect(rewritten).not.toContain('หวังว่าจะเป็นประโยชน์');
		expect(rewritten).not.toContain('ขอแสดงความนับถือ');
		expect(rewritten).toContain('ผมแนะนำให้โพสต์แบบนี้');
	});

	it('keeps English brand names embedded in Thai drafts untouched', () => {
		expect(applyLocalHumanizeRewrite('ทีมเราใช้ Figma รีวิวงานกันทุกวันศุกร์', 'human')).toBe(
			'ทีมเราใช้ Figma รีวิวงานกันทุกวันศุกร์'
		);
	});

	it('treats both modes the same locally because contractions have no Thai form', () => {
		const source = 'ทีมเราไม่ใช่ทีมที่รอ แต่คือทีมที่ลงมือทำ';
		expect(applyLocalHumanizeRewrite(source, 'roughen')).toBe(
			applyLocalHumanizeRewrite(source, 'human')
		);
	});
});
