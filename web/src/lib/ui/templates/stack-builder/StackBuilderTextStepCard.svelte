<script lang="ts">
	import type { StackBuilderWorkflowStep } from '$lib/stack-builder/stackBuilder.types';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type TextStep = Extract<StackBuilderWorkflowStep, { type: 'text' }>;

	type Props = {
		step: TextStep;
		stepNumber: number;
		onUpdate: (patch: Partial<TextStep>) => void;
		onRemove: () => void;
	};

	let { step, stepNumber, onUpdate, onRemove }: Props = $props();
</script>

<div class="p-4">
	<div class="flex items-start justify-between gap-3">
		<div>
			<p class="text-xs font-semibold tracking-wide text-primary uppercase">Step {stepNumber}</p>
			<p class="mt-1 text-sm font-semibold text-base-content">Text step</p>
		</div>
		<button
			type="button"
			class="btn btn-ghost btn-xs btn-square shrink-0"
			aria-label="Remove step"
			onclick={onRemove}
		>
			<AbstractIcon name={icons.X2.name} width="14" height="14" aria-hidden="true" />
		</button>
	</div>

	<label class="mt-4 block space-y-1">
		<span class="text-xs font-medium text-base-content/70">Instructions</span>
		<textarea
			class="textarea textarea-bordered w-full text-sm"
			rows="3"
			value={step.content}
			oninput={(event) => onUpdate({ content: event.currentTarget.value })}
			placeholder="e.g. Wait for publish, then review metrics before the next command."
		></textarea>
	</label>
</div>
