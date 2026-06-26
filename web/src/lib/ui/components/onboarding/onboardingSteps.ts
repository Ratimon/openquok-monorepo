import type { OnboardingMode, OnboardingStepKind } from './onboarding.types';

const STEP_LABELS: Record<OnboardingMode, readonly string[]> = {
	dashboard: ['Add channel', 'Watch tutoria (Optional)'],
	mcp: ['Add channel', 'Connect MCP client', 'Watch tutorial (Optional)'],
	agent: ['Add channel', 'Connect agent', 'CLI & agents', 'Watch tutorial (Optional)']
};

export function getOnboardingTotalSteps(mode: OnboardingMode): number {
	return STEP_LABELS[mode].length;
}

export function getOnboardingStepLabels(mode: OnboardingMode): readonly string[] {
	return STEP_LABELS[mode];
}

export function getOnboardingStepKind(mode: OnboardingMode, step: number): OnboardingStepKind {
	if (mode === 'dashboard') {
		return step === 1 ? 'channel' : 'tutorial';
	}
	if (mode === 'mcp') {
		if (step === 1) return 'channel';
		if (step === 2) return 'connect-mcp';
		return 'tutorial';
	}
	if (step === 1) return 'channel';
	if (step === 2) return 'connect-agent';
	if (step === 3) return 'cli';
	return 'tutorial';
}
