<script lang="ts">
	import type { SkillBuilderWorkflowStepViewModel } from '$lib/skill-builder/skillBuilder.types';

	import SkillBuilderWorkflowStepItem from '$lib/ui/templates/skill-builder/SkillBuilderWorkflowStepItem.svelte';

	type Props = {
		stepsVm: SkillBuilderWorkflowStepViewModel[];
		onUpdateStep: (stepId: string, patch: Partial<SkillBuilderWorkflowStepViewModel>) => void;
		onRemoveStep: (stepId: string) => void;
		onReorder: (fromIndex: number, toIndex: number) => void;
		onAddTextStep: () => void;
	};

	let { stepsVm, onUpdateStep, onRemoveStep, onReorder, onAddTextStep }: Props = $props();

	let dragIndex = $state<number | null>(null);

	function handleDragStart(index: number) {
		dragIndex = index;
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		if (dragIndex === null || dragIndex === index) return;
		onReorder(dragIndex, index);
		dragIndex = index;
	}

	function handleDragEnd() {
		dragIndex = null;
	}
</script>

<div class="flex h-full min-h-0 flex-col">
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-base-content/10 px-4 py-3">
		<div>
			<h2 class="text-sm font-semibold text-base-content">Core workflow</h2>
			<p class="mt-1 text-xs text-base-content/60">
				Drag steps to reorder. Expand a step to edit titles, CLI examples, and payloads.
			</p>
		</div>
		<button type="button" class="btn btn-outline btn-sm" onclick={onAddTextStep}>Add note</button>
	</header>

	<div class="min-h-0 flex-1 overflow-y-auto p-3">
		{#if stepsVm.length === 0}
			<p class="rounded-lg border border-dashed border-base-content/15 p-4 text-sm text-base-content/60">
				Add commands from the library or insert a text step for review notes.
			</p>
		{:else}
			<ol class="space-y-2">
				{#each stepsVm as step, index (step.id)}
					<SkillBuilderWorkflowStepItem
						stepVm={step}
						stepNumber={index + 1}
						{index}
						onUpdate={(patch) => onUpdateStep(step.id, patch)}
						onRemove={() => onRemoveStep(step.id)}
						onDragStart={handleDragStart}
						onDragOver={handleDragOver}
						onDragEnd={handleDragEnd}
					/>
				{/each}
			</ol>
		{/if}
	</div>
</div>
