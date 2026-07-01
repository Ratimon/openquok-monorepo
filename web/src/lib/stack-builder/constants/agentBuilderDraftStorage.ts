import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

export const AGENT_BUILDER_STACK_DRAFT_STORAGE_KEY = 'openquok:agent-builder-stack-draft';

export type AgentBuilderStackDraft = {
	title: string;
	markdown: string;
	extensionSlugs: string[];
	workflowSteps: StackBuilderWorkflowStepViewModel[];
	extensionIdsBySlug: Record<string, string>;
	extensionTypesBySlug?: Record<string, string | null>;
};

export function saveAgentBuilderStackDraft(draft: AgentBuilderStackDraft): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(AGENT_BUILDER_STACK_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function readAgentBuilderStackDraft(): AgentBuilderStackDraft | null {
	if (typeof sessionStorage === 'undefined') return null;
	const raw = sessionStorage.getItem(AGENT_BUILDER_STACK_DRAFT_STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as AgentBuilderStackDraft;
	} catch {
		return null;
	}
}

export function clearAgentBuilderStackDraft(): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.removeItem(AGENT_BUILDER_STACK_DRAFT_STORAGE_KEY);
}
