import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

export const SKILL_BUILDER_STACK_DRAFT_STORAGE_KEY = 'openquok:skill-builder-stack-draft';

export type SkillBuilderStackDraft = {
	title: string;
	markdown: string;
	extensionSlugs: string[];
	workflowSteps: StackBuilderWorkflowStepViewModel[];
	extensionIdsBySlug: Record<string, string>;
	extensionTypesBySlug?: Record<string, string | null>;
};

export function saveSkillBuilderStackDraft(draft: SkillBuilderStackDraft): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(SKILL_BUILDER_STACK_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function readSkillBuilderStackDraft(): SkillBuilderStackDraft | null {
	if (typeof sessionStorage === 'undefined') return null;
	const raw = sessionStorage.getItem(SKILL_BUILDER_STACK_DRAFT_STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as SkillBuilderStackDraft;
	} catch {
		return null;
	}
}

export function clearSkillBuilderStackDraft(): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.removeItem(SKILL_BUILDER_STACK_DRAFT_STORAGE_KEY);
}
