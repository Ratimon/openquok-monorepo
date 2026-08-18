import { describe, expect, it } from 'vitest';

import { auditHumanizeTells } from '$lib/ai-humanize/utils/auditTells';

describe('auditHumanizeTells', () => {
	it('returns zero tells for a plain spoken post', () => {
		const text =
			'We shipped the billing fix this morning. A few accounts still see the old invoice. If that’s you, reply and I’ll send the new PDF.';

		expect(auditHumanizeTells(text).tellCount).toBe(0);
		expect(auditHumanizeTells(text).hits).toEqual([]);
		expect(Object.values(auditHumanizeTells(text).byKind).every((count) => count === 0)).toBe(
			true
		);
	});

	it('counts em dashes', () => {
		const result = auditHumanizeTells('Shipped the fix — then waited.');
		expect(result.byKind.emDash).toBe(1);
		expect(result.tellCount).toBeGreaterThanOrEqual(1);
	});

	it('counts tier-1 lexicon terms', () => {
		const result = auditHumanizeTells('We leverage a robust process.');
		expect(result.byKind.lexicon).toBe(2);
		expect(result.hits.map((hit) => hit.excerpt.toLowerCase())).toEqual(['leverage', 'robust']);
	});

	it('counts negative parallelism', () => {
		const result = auditHumanizeTells("It's not a setback, it's a setup.");
		expect(result.byKind.negativeParallelism).toBe(1);
	});

	it('counts rule-of-three adjective lists', () => {
		const result = auditHumanizeTells('A innovative, scalable, and holistic launch.');
		expect(result.byKind.ruleOfThree).toBe(1);
	});

	it('does not treat short coordinated lists as rule of three', () => {
		const result = auditHumanizeTells('Grab red, blue, and green cups.');
		expect(result.byKind.ruleOfThree).toBe(0);
	});

	it('counts kickers, signposted conclusions, and pep-talk endings', () => {
		const result = auditHumanizeTells(
			"Here's the kicker: we shipped. In conclusion, it worked. You've got this!"
		);
		expect(result.byKind.kicker).toBe(1);
		expect(result.byKind.signpostedConclusion).toBe(1);
		expect(result.byKind.pepTalkEnding).toBe(1);
	});

	it('flags uniform sentence length across several similar sentences', () => {
		const result = auditHumanizeTells(
			'Teams shipped the first patch today. Teams shipped the second patch today. Teams shipped the third patch today. Teams shipped the fourth patch today.'
		);
		expect(result.byKind.uniformSentenceLength).toBe(1);
	});

	it('returns an empty result for blank input', () => {
		expect(auditHumanizeTells('   ').tellCount).toBe(0);
		expect(auditHumanizeTells('').tellCount).toBe(0);
	});

	it('counts smoking-gun scaffolding', () => {
		const result = auditHumanizeTells('Hope this helps! We shipped the fix [insert example].');
		expect(result.byKind.smokingGun).toBeGreaterThanOrEqual(2);
	});

	it('counts emoji bullets and markdown residue', () => {
		const result = auditHumanizeTells('🚀 Shipped the fix\n**Next** we wait');
		expect(result.byKind.emojiBullet).toBe(1);
		expect(result.byKind.markdownResidue).toBe(1);
	});

	it('counts copula-dodge lemmas', () => {
		const result = auditHumanizeTells('This launch serves as a reminder.');
		expect(result.byKind.copulaDodge).toBe(1);
	});

	it('does not treat ordinary words as smoking-gun self-reference', () => {
		expect(auditHumanizeTells('We set an aim for the week.').byKind.smokingGun).toBe(0);
	});
});
