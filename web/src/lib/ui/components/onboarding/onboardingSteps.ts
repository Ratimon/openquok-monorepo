import type { OnboardingMode, OnboardingStepKind } from './onboarding.types';

const BROWSER_EXTENSION_STEP_LABEL = 'Install browser extension (Optional)';
const TUTORIAL_STEP_LABEL = 'Watch tutorial (Optional)';

const STEP_LABELS: Record<OnboardingMode, readonly string[]> = {
	dashboard: ['Add channel', BROWSER_EXTENSION_STEP_LABEL, TUTORIAL_STEP_LABEL],
	mcp: ['Add channel', 'Connect MCP client', BROWSER_EXTENSION_STEP_LABEL, TUTORIAL_STEP_LABEL],
	agent: [
		'Add channel',
		'Connect agent',
		'CLI & agents',
		BROWSER_EXTENSION_STEP_LABEL,
		TUTORIAL_STEP_LABEL
	]
};

export function getOnboardingTotalSteps(mode: OnboardingMode): number {
	return STEP_LABELS[mode].length;
}

export function getOnboardingStepLabels(mode: OnboardingMode): readonly string[] {
	return STEP_LABELS[mode];
}

function tutorialStepNumber(mode: OnboardingMode): number {
	return getOnboardingTotalSteps(mode);
}

function browserExtensionStepNumber(mode: OnboardingMode): number {
	return tutorialStepNumber(mode) - 1;
}

export function getOnboardingStepKind(mode: OnboardingMode, step: number): OnboardingStepKind {
	if (step === browserExtensionStepNumber(mode)) {
		return 'browser-extension';
	}
	if (step === tutorialStepNumber(mode)) {
		return 'tutorial';
	}

	if (mode === 'dashboard') {
		return 'channel';
	}
	if (mode === 'mcp') {
		if (step === 1) return 'channel';
		return 'connect-mcp';
	}
	if (step === 1) return 'channel';
	if (step === 2) return 'connect-agent';
	return 'cli';
}
