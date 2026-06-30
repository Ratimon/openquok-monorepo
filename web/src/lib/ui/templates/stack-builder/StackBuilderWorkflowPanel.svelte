<script lang="ts">
	import type { StackBuilderWorkflowStepViewModel } from '$lib/stack-builder/stackBuilder.types';

	import StackBuilderCommandStepCard from '$lib/ui/templates/stack-builder/StackBuilderCommandStepCard.svelte';
	import StackBuilderTextStepCard from '$lib/ui/templates/stack-builder/StackBuilderTextStepCard.svelte';

	type Props = {
		stepsVm: StackBuilderWorkflowStepViewModel[];
		onUpdateStep: (stepId: string, patch: Partial<StackBuilderWorkflowStepViewModel>) => void;
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
			<h2 class="text-sm font-semibold text-base-content">Workflow</h2>
			<p class="mt-1 text-xs text-base-content/60">Drag steps to reorder. Edit prompts and payloads inline.</p>
		</div>
		<button type="button" class="btn btn-outline btn-sm" onclick={onAddTextStep}>Add text step</button>
	</header>

	<div class="min-h-0 flex-1 overflow-y-auto p-3">
		{#if stepsVm.length === 0}
			<p class="rounded-lg border border-dashed border-base-content/15 p-4 text-sm text-base-content/60">
				Add commands from the library or insert a text step for review notes.
			</p>
		{:else}
			<ol class="space-y-3">
				{#each stepsVm as step, index (step.id)}
					<li
						class="rounded-xl border border-base-content/10 bg-base-100"
						draggable="true"
						ondragstart={() => handleDragStart(index)}
						ondragover={(event) => handleDragOver(event, index)}
						ondragend={handleDragEnd}
					>
						{#if step.type === 'command'}
							<StackBuilderCommandStepCard
								stepVm={step}
								stepNumber={index + 1}
								onUpdate={(patch) => onUpdateStep(step.id, patch)}
								onRemove={() => onRemoveStep(step.id)}
							/>
						{:else}
							<StackBuilderTextStepCard
								stepVm={step}
								stepNumber={index + 1}
								onUpdate={(patch) => onUpdateStep(step.id, patch)}
								onRemove={() => onRemoveStep(step.id)}
							/>
						{/if}
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</div>
