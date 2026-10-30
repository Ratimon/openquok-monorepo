import { describe, expect, it } from 'vitest';

import { buildStatusLine } from './stepRail.js';

describe('buildStatusLine', () => {
	it('guides users on the ready page', () => {
		expect(buildStatusLine({}, true)).toContain('Fill all steps');
		expect(buildStatusLine({}, true)).toContain('review');
	});

	it('mentions readyUrlHint when not on the submission page', () => {
		const line = buildStatusLine({ readyUrlHint: 'waiting-line' }, false);
		expect(line).toContain('waiting-line');
		expect(line).toContain('Fill');
	});
});
