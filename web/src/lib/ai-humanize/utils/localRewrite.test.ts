import { describe, expect, it } from 'vitest';

import { auditHumanizeTells } from '$lib/ai-humanize/utils/auditTells';
import { applyLocalHumanizeRewrite } from '$lib/ai-humanize/utils/localRewrite';

describe('applyLocalHumanizeRewrite', () => {
	it('replaces em dashes with a comma or period', () => {
		expect(applyLocalHumanizeRewrite('Shipped the fix — then waited.', 'human')).toBe(
			'Shipped the fix, then waited.'
		);
		expect(applyLocalHumanizeRewrite('Shipped the fix — Then waited.', 'human')).toBe(
			'Shipped the fix. Then waited.'
		);
	});

	it('replaces tier-1 lexicon with plainer wording', () => {
		expect(applyLocalHumanizeRewrite('We leverage a robust process.', 'human')).toBe(
			'We use a solid process.'
		);
	});

	it('flattens negative parallelism', () => {
		expect(applyLocalHumanizeRewrite("It's not a setback, it's a setup.", 'human')).toBe(
			"It's a setup."
		);
	});

	it('drops pep-talk endings and kickers', () => {
		const rewritten = applyLocalHumanizeRewrite(
			"We shipped the fix. Here's the kicker: it worked. You've got this!",
			'human'
		);
		expect(rewritten.toLowerCase()).not.toContain("here's the kicker");
		expect(rewritten.toLowerCase()).not.toContain("you've got this");
		expect(rewritten).toContain('We shipped the fix.');
	});

	it('adds contractions in roughen mode without inventing specifics', () => {
		const source = 'We do not charge extra. The price stays the same.';
		const rewritten = applyLocalHumanizeRewrite(source, 'roughen');
		expect(rewritten).toContain("don't");
		expect(rewritten).not.toMatch(/\$\d/);
		expect(rewritten.toLowerCase()).not.toContain('jordan');
	});

	it('returns empty string for blank input', () => {
		expect(applyLocalHumanizeRewrite('   ', 'human')).toBe('');
	});

	it('replaces swap-table phrases including delve into', () => {
		expect(applyLocalHumanizeRewrite('We should delve into the logs.', 'human')).toBe(
			'We should look at the logs.'
		);
	});

	it('deletes in conclusion without inventing a new closer', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'We shipped the fix. In conclusion, it worked.',
			'human'
		);
		expect(rewritten.toLowerCase()).not.toContain('in conclusion');
		expect(rewritten).toMatch(/shipped the fix/i);
		expect(rewritten).toMatch(/it worked/i);
	});

	it('strips smoking guns and markdown or emoji residue', () => {
		const rewritten = applyLocalHumanizeRewrite(
			'Hope this helps! **We shipped** the fix [insert example].\n🚀 Next we wait. Best regards',
			'human'
		);
		expect(rewritten.toLowerCase()).not.toContain('hope this helps');
		expect(rewritten.toLowerCase()).not.toContain('[insert example]');
		expect(rewritten.toLowerCase()).not.toContain('best regards');
		expect(rewritten).not.toContain('**');
		expect(rewritten).not.toContain('🚀');
		expect(rewritten).toMatch(/shipped/i);
	});

	it('reduces tell count on a stock machine-written post', () => {
		const source =
			"In this landscape we leverage a robust, seamless, and holistic approach — it's not a tool, it's a game-changer. Here's the kicker: it works. You've got this!";
		const rewritten = applyLocalHumanizeRewrite(source, 'human');
		expect(auditHumanizeTells(rewritten).tellCount).toBeLessThan(
			auditHumanizeTells(source).tellCount
		);
	});
});
