import { describe, expect, it } from 'vitest';

import {
	getOnboardingStepKind,
	getOnboardingStepLabels,
	getOnboardingTotalSteps
} from './onboardingSteps';

describe('onboardingSteps', () => {
	it('places browser extension before tutorial for every mode', () => {
		for (const mode of ['agent', 'mcp', 'dashboard'] as const) {
			const labels = getOnboardingStepLabels(mode);
			const extensionIndex = labels.findIndex((l) => l.includes('browser extension'));
			const tutorialIndex = labels.findIndex((l) => l.includes('Watch tutorial'));
			expect(extensionIndex).toBeGreaterThanOrEqual(0);
			expect(tutorialIndex).toBe(extensionIndex + 1);
			expect(getOnboardingStepKind(mode, extensionIndex + 1)).toBe('browser-extension');
			expect(getOnboardingStepKind(mode, tutorialIndex + 1)).toBe('tutorial');
		}
	});

	it('counts steps per mode', () => {
		expect(getOnboardingTotalSteps('dashboard')).toBe(3);
		expect(getOnboardingTotalSteps('mcp')).toBe(4);
		expect(getOnboardingTotalSteps('agent')).toBe(5);
	});
});
